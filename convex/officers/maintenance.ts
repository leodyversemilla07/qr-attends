import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
    cleanupExpiredSessions,
    cleanupExpiredPasswordResets,
    cleanupExpiredRateLimits,
    getAuthenticatedOfficer,
    logAuditEvent,
} from "../authHelpers";

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

export const migrateLegacyEventOwners = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const officer = await getAuthenticatedOfficer(ctx, args.token);

        if (officer.role !== "President" && officer.role !== "Admin") {
            throw new Error("Forbidden: Admin role required");
        }

        const [events, officers] = await Promise.all([
            ctx.db.query("events").collect(),
            ctx.db.query("officers").collect(),
        ]);

        const officerIds = new Set<Id<"officers">>(officers.map((entry) => entry._id));
        const officersByName = new Map<string, typeof officers>();

        for (const entry of officers) {
            const existing = officersByName.get(entry.name) ?? [];
            existing.push(entry);
            officersByName.set(entry.name, existing);
        }

        let migrated = 0;
        let alreadyNormalized = 0;
        let ambiguous = 0;
        let unmatched = 0;

        for (const event of events) {
            if (typeof event.createdBy !== "string") {
                alreadyNormalized++;
                continue;
            }

            if (officerIds.has(event.createdBy as Id<"officers">)) {
                alreadyNormalized++;
                continue;
            }

            const matches = officersByName.get(event.createdBy) ?? [];

            if (matches.length === 1) {
                await ctx.db.patch(event._id, { createdBy: matches[0]._id });
                migrated++;
                continue;
            }

            if (matches.length > 1) {
                ambiguous++;
                continue;
            }

            unmatched++;
        }

        await logAuditEvent(
            ctx,
            "MIGRATE_LEGACY_EVENT_OWNERS",
            `Migrated ${migrated} legacy event owners. ${alreadyNormalized} already normalized, ${ambiguous} ambiguous, ${unmatched} unmatched.`,
            officer._id.toString()
        );

        return {
            totalEvents: events.length,
            migrated,
            alreadyNormalized,
            ambiguous,
            unmatched,
        };
    },
});
