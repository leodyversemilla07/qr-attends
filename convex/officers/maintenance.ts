import { v } from "convex/values";
import { mutation } from "../_generated/server";
import {
    cleanupExpiredSessions,
    cleanupExpiredPasswordResets,
    cleanupExpiredRateLimits,
    getAuthenticatedOfficer,
    logAuditEvent,
} from "../auth-helpers";

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
