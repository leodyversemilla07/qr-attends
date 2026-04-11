import * as bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
    checkRateLimit,
    generateSecureToken,
    getAuthenticatedSession,
    getAuthenticatedOfficer,
    logAuditEvent,
} from "../authHelpers";
import { logger } from "../logger";

export const getMe = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        try {
            const officer = await getAuthenticatedOfficer(ctx, args.token);
            const { password: _, ...officerWithoutPassword } = officer;
            return officerWithoutPassword;
        } catch (error) {
            logger.warn("officers-auth", "getMe authentication failed", error);
            return null;
        }
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

        if (args.password.length < 8) {
            throw new Error("Password must be at least 8 characters");
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

        const { password: _, ...officerWithoutPassword } = officer;
        return { token, officer: officerWithoutPassword };
    },
});

export const signOut = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const { session } = await getAuthenticatedSession(ctx, args.token);
        const officer = await ctx.db.get(session.officerId);
        if (!officer) {
            throw new Error("Unauthorized: Officer not found");
        }

        await ctx.db.delete(session._id);

        await logAuditEvent(ctx, "LOGOUT", `Officer ${officer.email} logged out`, officer._id.toString());

        return "Signed out successfully";
    },
});
