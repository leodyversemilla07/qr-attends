import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedOfficer } from "./authHelpers";

export const globalSearch = query({
    args: { token: v.optional(v.string()), searchTerm: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await getAuthenticatedOfficer(ctx, args.token);
        if (!args.searchTerm || args.searchTerm.trim().length === 0) {
            return { events: [], members: [] };
        }

        const term = args.searchTerm.toLowerCase().trim();

        const events = await ctx.db.query("events").collect();
        const filteredEvents = events.filter(e =>
            e.name.toLowerCase().includes(term) ||
            e.location.toLowerCase().includes(term) ||
            e.description?.toLowerCase().includes(term)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
         .slice(0, 10);

        const members = await ctx.db.query("members").collect();
        const filteredMembers = members.filter(m =>
            m.firstName.toLowerCase().includes(term) ||
            m.lastName.toLowerCase().includes(term) ||
            m.studentId.toLowerCase().includes(term) ||
            m.cardNo.toLowerCase().includes(term) ||
            m.yearSection.toLowerCase().includes(term)
        ).sort((a, b) => a.lastName.localeCompare(b.lastName))
         .slice(0, 10);

        return { events: filteredEvents, members: filteredMembers };
    },
});

export const getYearSections = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await getAuthenticatedOfficer(ctx, args.token);
        const members = await ctx.db.query("members").collect();
        const sections = new Set(members.map(m => m.yearSection).filter(Boolean));
        return Array.from(sections).sort();
    },
});

export const getRecentCheckIns = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        await getAuthenticatedOfficer(ctx, args.token);
        const records = await ctx.db.query("attendance").collect();
        const recent = records
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20);
        
        const results = await Promise.all(
            recent.map(async (record) => {
                const member = await ctx.db.get(record.memberId);
                const event = await ctx.db.get(record.eventId);
                return { ...record, member, event };
            })
        );
        
        return results;
    },
});
