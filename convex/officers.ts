import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
    checkRateLimit,
    cleanupExpiredPasswordResets,
    cleanupExpiredRateLimits,
    cleanupExpiredSessions,
    encryptToken,
    generateSecureToken,
    getAuthenticatedOfficer,
    logAuditEvent,
    validatePasswordStrength
} from "./auth_helpers";

export const getMe = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        const officer = await getAuthenticatedOfficer(ctx, args.token);
        
        const { password: _, ...officerWithoutPassword } = officer;
        return officerWithoutPassword;
    },
});

export const getAuditLogs = query({
    args: { 
        token: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const officer = await getAuthenticatedOfficer(ctx, args.token);
        
        if (officer.role !== "President" && officer.role !== "Admin") {
            throw new Error("Forbidden: Admin role required");
        }

        const logs = await ctx.db
            .query("auditLogs")
            .withIndex("by_timestamp", (q) => q)
            .collect();

        return logs.reverse().slice(0, args.limit || 100);
    },
});

export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const allowed = await checkRateLimit(ctx, `login:${args.email}`, 5, 60000);
        if (!allowed) {
            throw new Error("Too many login attempts. Please try again in 1 minute.");
        }

        if (args.password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address");
        }

        const officer = await ctx.db
            .query("officers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!officer) {
            throw new Error("Invalid email or password");
        }

        const passwordValid = bcrypt.compareSync(args.password, officer.password);
        if (!passwordValid) {
            throw new Error("Invalid email or password");
        }

        const token = generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await ctx.db.insert("authSessions", {
            officerId: officer._id,
            token,
            expiresAt: expiresAt.toISOString(),
        });

        await ctx.db.patch(officer._id, { lastSeen: new Date().toISOString() });

        await logAuditEvent(ctx, "LOGIN", `Officer ${officer.email} logged in`, officer._id.toString());

        const encryptedToken = encryptToken(token);
        const { password: _, ...officerWithoutPassword } = officer;
        return { token: encryptedToken, officer: officerWithoutPassword };
    },
});

export const registerOfficer = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        const officer = await getAuthenticatedOfficer(ctx);
        
        if (officer.role !== "President" && officer.role !== "Admin") {
            throw new Error("Forbidden: Only administrators can register new officers");
        }

        if (args.name.length < 2) {
            throw new Error("Name must be at least 2 characters");
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(args.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(". "));
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address");
        }

        const validRoles = ["President", "Vice President", "Secretary", "Officer", "Admin"];
        if (!validRoles.includes(args.role)) {
            throw new Error("Invalid role. Must be one of: " + validRoles.join(", "));
        }

        const existing = await ctx.db
            .query("officers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
        
        if (existing) {
            throw new Error("Email already registered");
        }

        const hashedPassword = bcrypt.hashSync(args.password, 12);
        
        const officerId = await ctx.db.insert("officers", {
            name: args.name,
            email: args.email,
            password: hashedPassword,
            role: args.role,
        });

        const newOfficer = await ctx.db.get(officerId);
        const { password: _, ...officerWithoutPassword } = newOfficer!;
        return officerWithoutPassword;
    },
});

export const seedInitialOfficer = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("officers").first();
        if (existing) return "Already seeded";

        // Strong password: Admin@2026!
        const hashedPassword = bcrypt.hashSync("Admin@2026!", 12);

        await ctx.db.insert("officers", {
            name: "Leodyver Semilla",
            email: "leodyversemilla07@gmail.com",
            password: hashedPassword,
            role: "President",
        });

        return "Seeded admin: leodyversemilla07@gmail.com / Admin@2026!";
    },
});

// Temporary mutation to reset the seeded officer's password
export const resetSeedPassword = mutation({
    args: {},
    handler: async (ctx) => {
        // Get any existing officer
        const officer = await ctx.db.query("officers").first();
        
        if (!officer) {
            // No officer exists, create one
            const hashedPassword = bcrypt.hashSync("Admin@2026!", 12);
            await ctx.db.insert("officers", {
                name: "Leodyver Semilla",
                email: "leodyversemilla07@gmail.com",
                password: hashedPassword,
                role: "President",
            });
            return "Created new officer: leodyversemilla07@gmail.com / Admin@2026!";
        }

        // Update existing officer's password
        const hashedPassword = bcrypt.hashSync("Admin@2026!", 12);
        await ctx.db.patch(officer._id, { 
            password: hashedPassword,
            email: "leodyversemilla07@gmail.com",
            name: "Leodyver Semilla",
            role: "President",
        });

        return `Password updated for ${officer.email} to: Admin@2026!`;
    },
});

export const signOut = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const officer = await getAuthenticatedOfficer(ctx, args.token);
        
        const session = await ctx.db
            .query("authSessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (session) {
            await ctx.db.delete(session._id);
        }

        await logAuditEvent(ctx, "LOGOUT", `Officer ${officer.email} logged out`, officer._id.toString());

        return "Signed out successfully";
    },
});

export const requestPasswordReset = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const allowed = await checkRateLimit(ctx, `reset:${args.email}`, 3, 3600000);
        if (!allowed) {
            throw new Error("Too many reset requests. Please try again in 1 hour.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email address");
        }

        const officer = await ctx.db
            .query("officers")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!officer) {
            return "If an account exists with that email, a reset link will be sent.";
        }

        const resetToken = generateSecureToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await ctx.db.insert("passwordResets", {
            officerId: officer._id,
            token: resetToken,
            expiresAt: expiresAt.toISOString(),
            used: false,
        });

        await logAuditEvent(ctx, "PASSWORD_RESET_REQUESTED", `Password reset requested for ${officer.email}`, officer._id.toString());

        return {
            message: "If an account exists with that email, a reset link will be sent.",
            resetToken: resetToken,
        };
    },
});

export const resetPassword = mutation({
    args: {
        token: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate password strength
        const passwordValidation = validatePasswordStrength(args.newPassword);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(". "));
        }

        const resetRecord = await ctx.db
            .query("passwordResets")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (!resetRecord) {
            throw new Error("Invalid or expired reset token");
        }

        if (resetRecord.used) {
            throw new Error("Reset token already used");
        }

        if (new Date(resetRecord.expiresAt) < new Date()) {
            throw new Error("Reset token expired");
        }

        const officer = await ctx.db.get(resetRecord.officerId);
        if (!officer) {
            throw new Error("Officer not found");
        }

        const hashedPassword = bcrypt.hashSync(args.newPassword, 12);
        await ctx.db.patch(officer._id, { password: hashedPassword });

        await ctx.db.patch(resetRecord._id, { used: true });

        await logAuditEvent(ctx, "PASSWORD_RESET_COMPLETED", `Password reset completed for ${officer.email}`, officer._id.toString());

        return "Password reset successfully. You can now login with your new password.";
    },
});

/**
 * Cleanup expired data from the database.
 * Admin only. Removes expired sessions, password resets, and rate limits.
 */
export const cleanupExpiredData = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const officer = await getAuthenticatedOfficer(ctx, args.token);
        
        if (officer.role !== "President" && officer.role !== "Admin") {
            throw new Error("Forbidden: Admin role required");
        }

        const sessionsDeleted = await cleanupExpiredSessions(ctx);
        const resetsDeleted = await cleanupExpiredPasswordResets(ctx);
        const rateLimitsDeleted = await cleanupExpiredRateLimits(ctx);

        await logAuditEvent(
            ctx, 
            "CLEANUP_EXPIRED_DATA", 
            `Deleted ${sessionsDeleted} sessions, ${resetsDeleted} password resets, ${rateLimitsDeleted} rate limits`,
            officer._id.toString()
        );

        return {
            sessionsDeleted,
            resetsDeleted,
            rateLimitsDeleted,
            total: sessionsDeleted + resetsDeleted + rateLimitsDeleted,
        };
    },
});
