import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
    getAuthenticatedOfficer,
    logAuditEvent,
    validatePasswordStrength,
} from "../authHelpers";

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


