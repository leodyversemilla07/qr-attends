import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";
import { 
  getAuthenticatedOfficer, 
  generateSecureToken, 
  checkRateLimit,
  encryptToken,
  logAuditEvent 
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
        if (!checkRateLimit(`login:${args.email}`, 5, 60000)) {
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

        const passwordValid = await bcrypt.compare(args.password, officer.password);
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
        if (args.password.length < 8) {
            throw new Error("Password must be at least 8 characters");
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

        const hashedPassword = await bcrypt.hash(args.password, 12);
        
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

        const hashedPassword = await bcrypt.hash("admin", 12);

        await ctx.db.insert("officers", {
            name: "Leodyver Semilla",
            email: "leodyver@admin.com",
            password: hashedPassword,
            role: "President",
        });

        return "Seeded admin: leodyver@admin.com / admin";
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
        if (!checkRateLimit(`reset:${args.email}`, 3, 3600000)) {
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
        if (args.newPassword.length < 8) {
            throw new Error("Password must be at least 8 characters");
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

        const hashedPassword = await bcrypt.hash(args.newPassword, 12);
        await ctx.db.patch(officer._id, { password: hashedPassword });

        await ctx.db.patch(resetRecord._id, { used: true });

        await logAuditEvent(ctx, "PASSWORD_RESET_COMPLETED", `Password reset completed for ${officer.email}`, officer._id.toString());

        return "Password reset successfully. You can now login with your new password.";
    },
});
