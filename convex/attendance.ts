import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkRateLimit, getAuthenticatedOfficer, logAuditEvent } from "./authHelpers";

export const checkInByCard = mutation({
  args: {
    eventId: v.id("events"),
    cardNo: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const officer = await getAuthenticatedOfficer(ctx, args.token);
    const allowed = await checkRateLimit(ctx, `checkin:${officer._id}:${args.eventId}`, 100, 60000);
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

    await logAuditEvent(ctx, "CHECK_IN_BY_CARD", `${member.firstName} ${member.lastName} checked in to "${event.name}"`, officer._id.toString());

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
    const officer = await getAuthenticatedOfficer(ctx, args.token);
    const allowed = await checkRateLimit(ctx, `manual-checkin:${officer._id}:${args.eventId}`, 100, 60000);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

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

    await logAuditEvent(ctx, "CHECK_IN_MANUAL", `${member.firstName} ${member.lastName} manually checked in to "${event.name}"`, officer._id.toString());

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
  args: { eventId: v.id("events"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_event_timestamp", (q) => q.eq("eventId", args.eventId))
      .order("desc")
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

    return results;
  },
});

export const getAll = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    const records = await ctx.db.query("attendance").withIndex("by_timestamp").order("desc").collect();

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

    return results;
  },
});

export const getStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    const [records, events, members] = await Promise.all([
      ctx.db.query("attendance").collect(),
      ctx.db.query("events").collect(),
      ctx.db.query("members").collect(),
    ]);

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
  args: { memberId: v.id("members"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_member_timestamp", (q) => q.eq("memberId", args.memberId))
      .order("desc")
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

    return results;
  },
});
