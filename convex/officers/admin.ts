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
        cursor: v.optional(v.string()),
        actionType: v.optional(v.string()),
        officerId: v.optional(v.id("officers")),
    },
    handler: async (ctx, args) => {
        const officer = await getAuthenticatedOfficer(ctx, args.token);

        if (officer.role !== "President" && officer.role !== "Admin") {
            throw new Error("Forbidden: Admin role required");
        }

        let logsQuery = ctx.db.query("auditLogs").withIndex("by_timestamp");

        // Note: Simple filtering for now as Convex doesn't support complex multi-index filters easily without custom indexes
        let logs = await logsQuery.order("desc").collect();

        if (args.actionType) {
            logs = logs.filter(l => l.action.includes(args.actionType!));
        }

        if (args.officerId) {
            logs = logs.filter(l => l.officerId === args.officerId);
        }

        const paginatedLogs = logs.slice(0, args.limit || 50);

        const logsWithOfficers = await Promise.all(
            paginatedLogs.map(async (log) => {
                const logOfficer = log.officerId ? await ctx.db.get(log.officerId) : null;
                return {
                    ...log,
                    officerName: logOfficer?.name || "System",
                };
            })
        );

        return {
            logs: logsWithOfficers,
            total: logs.length,
        };
    },
});

export const registerOfficer = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.string(),
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const officer = await getAuthenticatedOfficer(ctx, args.token);

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

        await logAuditEvent(ctx, "OFFICER_REGISTERED", `${args.email} registered as ${args.role}`, officer._id.toString());

        const newOfficer = await ctx.db.get(officerId);
        const { password: _, ...officerWithoutPassword } = newOfficer!;
        return officerWithoutPassword;
    },
});

