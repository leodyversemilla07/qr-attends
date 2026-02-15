import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkRateLimit, getAuthenticatedOfficer, logAuditEvent } from "./auth-helpers";

// List all events, sorted by date (newest first)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    return events.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
});

export const search = query({
  args: { 
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db.query("events").collect();
    
    if (args.searchTerm && args.searchTerm.trim()) {
      const term = args.searchTerm.toLowerCase().trim();
      events = events.filter(e => 
        e.name.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term)
      );
    }

    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, args.limit || 50);
  },
});

export const getStats = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const attendance = await ctx.db
      .query("attendance")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return {
      event,
      totalCheckIns: attendance.length,
      checkInTimes: attendance.map(a => a.timestamp).sort(),
      firstCheckIn: attendance.length > 0 ? attendance.reduce((min, a) => 
        new Date(a.timestamp) < new Date(min.timestamp) ? a : min
      ).timestamp : null,
      lastCheckIn: attendance.length > 0 ? attendance.reduce((max, a) => 
        new Date(a.timestamp) > new Date(max.timestamp) ? a : max
      ).timestamp : null,
    };
  },
});

export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const events = await ctx.db.query("events").collect();
    
    return events
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const events = await ctx.db.query("events").collect();
    
    return events
      .filter(e => new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  },
});

export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    date: v.string(),
    time: v.string(),
    location: v.string(),
    description: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const allowed = await checkRateLimit(ctx, `create-event:${args.token}`, 50, 60000);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    const officer = await getAuthenticatedOfficer(ctx, args.token);
    
    if (args.name.length < 3) {
      throw new Error("Event name must be at least 3 characters");
    }
    if (args.location.length < 2) {
      throw new Error("Location must be at least 2 characters");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }
    if (!/^\d{2}:\d{2}$/.test(args.time)) {
      throw new Error("Invalid time format. Use HH:MM");
    }

    const eventId = await ctx.db.insert("events", {
      name: args.name,
      date: args.date,
      time: args.time,
      location: args.location,
      description: args.description,
      createdBy: officer.name,
      createdAt: new Date().toISOString(),
    });
    
    await logAuditEvent(ctx, "EVENT_CREATED", `Event "${args.name}" created at ${args.location}`, officer._id.toString());
    
    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    name: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const officer = await getAuthenticatedOfficer(ctx, args.token);
    
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (args.name !== undefined && args.name.length < 3) {
      throw new Error("Event name must be at least 3 characters");
    }
    if (args.location !== undefined && args.location.length < 2) {
      throw new Error("Location must be at least 2 characters");
    }

    const { token, id, ...updates } = args;
    await ctx.db.patch(id, updates);

    await logAuditEvent(ctx, "EVENT_UPDATED", `Event "${event.name}" updated`, officer._id.toString());
  },
});

export const remove = mutation({
  args: { id: v.id("events"), token: v.string() },
  handler: async (ctx, args) => {
    const officer = await getAuthenticatedOfficer(ctx, args.token);
    
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.createdBy !== officer.name && officer.role !== "President" && officer.role !== "Admin") {
      throw new Error("Forbidden: You can only delete events you created");
    }

    const eventName = event.name;
    await ctx.db.delete(args.id);

    await logAuditEvent(ctx, "EVENT_DELETED", `Event "${eventName}" deleted`, officer._id.toString());
  },
});
