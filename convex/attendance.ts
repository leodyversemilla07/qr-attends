import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check in a member to an event by their card/QR number
export const checkInByCard = mutation({
  args: {
    eventId: v.id("events"),
    cardNo: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check if event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // 2. Lookup member by card number
    const member = await ctx.db
      .query("members")
      .withIndex("by_cardNo", (q) => q.eq("cardNo", args.cardNo))
      .first();

    if (!member) {
      return { status: "not_registered", cardNo: args.cardNo };
    }

    // 3. Check for duplicate attendance
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_event_member", (q) =>
        q.eq("eventId", args.eventId).eq("memberId", member._id)
      )
      .first();

    if (existing) {
      throw new Error("Already checked in");
    }

    // 4. Record attendance
    const attendanceId = await ctx.db.insert("attendance", {
      eventId: args.eventId,
      memberId: member._id,
      timestamp: new Date().toISOString(),
    });

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

// Check in a member to an event by member ID (direct)
export const checkIn = mutation({
  args: {
    eventId: v.id("events"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    // 1. Check if event exists
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    // 2. Check if member exists
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    // 3. Check for duplicate attendance
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_event_member", (q) =>
        q.eq("eventId", args.eventId).eq("memberId", args.memberId)
      )
      .first();

    if (existing) {
      throw new Error("Already checked in");
    }

    // 4. Record attendance
    const attendanceId = await ctx.db.insert("attendance", {
      eventId: args.eventId,
      memberId: args.memberId,
      timestamp: new Date().toISOString(),
    });

    return {
      attendanceId,
      member: {
        firstName: member.firstName,
        lastName: member.lastName,
      }
    };
  },
});

// Get all attendees for a specific event
export const getByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Join with member details
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
