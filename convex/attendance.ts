import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkRateLimit, logAuditEvent } from "./authHelpers";

export const checkInByCard = mutation({
  args: {
    eventId: v.id("events"),
    cardNo: v.string(),
  },
  handler: async (ctx, args) => {
    const allowed = await checkRateLimit(ctx, `checkin:${args.eventId}`, 100, 60000);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const member = await ctx.db
      .query("members")
      .withIndex("by_cardNo", (q) => q.eq("cardNo", args.cardNo))
      .first();

    if (!member) {
      return { status: "not_registered", cardNo: args.cardNo };
    }

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_event_member", (q) =>
        q.eq("eventId", args.eventId).eq("memberId", member._id)
      )
      .first();

    if (existing) {
      throw new Error("Already checked in");
    }

    const attendanceId = await ctx.db.insert("attendance", {
      eventId: args.eventId,
      memberId: member._id,
      timestamp: new Date().toISOString(),
    });

    await logAuditEvent(ctx, "CHECK_IN_BY_CARD", `${member.firstName} ${member.lastName} checked in to "${event.name}"`);

    return {
      status: "success",
      attendanceId,
      member: {
        firstName: member.firstName,
        lastName: member.lastName,
      }
    };
  },
});

export const checkIn = mutation({
  args: {
    eventId: v.id("events"),
    memberId: v.id("members"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_event_member", (q) =>
        q.eq("eventId", args.eventId).eq("memberId", args.memberId)
      )
      .first();

    if (existing) {
      throw new Error("Already checked in");
    }

    const attendanceId = await ctx.db.insert("attendance", {
      eventId: args.eventId,
      memberId: args.memberId,
      timestamp: new Date().toISOString(),
    });

    await logAuditEvent(ctx, "CHECK_IN_MANUAL", `${member.firstName} ${member.lastName} manually checked in to "${event.name}"`);

    return {
      attendanceId,
      member: {
        firstName: member.firstName,
        lastName: member.lastName,
      }
    };
  },
});

export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const results = await Promise.all(
      records.map(async (record) => {
        const member = await ctx.db.get(record.memberId);
        return {
          ...record,
          member,
        };
      })
    );

    return results.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },
});

export const getAll = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const records = await ctx.db.query("attendance").collect();

    const results = await Promise.all(
      records.map(async (record) => {
        const member = await ctx.db.get(record.memberId);
        const event = await ctx.db.get(record.eventId);
        return {
          ...record,
          member,
          event,
        };
      })
    );

    return results.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },
});

export const getStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const records = await ctx.db.query("attendance").collect();
    const events = await ctx.db.query("events").collect();
    const members = await ctx.db.query("members").collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecords = records.filter(r => {
      const recordDate = new Date(r.timestamp);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    return {
      totalCheckIns: records.length,
      totalEvents: events.length,
      totalMembers: members.length,
      todayCheckIns: todayRecords.length,
    };
  },
});

export const getByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_member", (q) => q.eq("memberId", args.memberId))
      .collect();

    const results = await Promise.all(
      records.map(async (record) => {
        const event = await ctx.db.get(record.eventId);
        return {
          ...record,
          event,
        };
      })
    );

    return results.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },
});
