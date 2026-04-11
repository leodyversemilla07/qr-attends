import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    date: v.string(), // YYYY-MM-DD
    time: v.string(), // HH:MM
    location: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(), // Officer ID for new events; legacy records may still contain a name
    createdAt: v.string(),
  }).index("by_date", ["date"]),

  members: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    middleInitial: v.string(),
    studentId: v.string(),
    yearSection: v.string(),
    cardNo: v.string(),
    email: v.optional(v.string()), // Optional, inferred from attendance logic
  })
    .index("by_studentId", ["studentId"])
    .index("by_cardNo", ["cardNo"])
    .index("by_lastName", ["lastName"]),

  attendance: defineTable({
    eventId: v.id("events"),
    memberId: v.id("members"),
    timestamp: v.string(),
    // We can store denormalized data if needed for logs, but relations are better
  })
    .index("by_event", ["eventId"])
    .index("by_member", ["memberId"])
    .index("by_event_member", ["eventId", "memberId"]) // For preventing duplicates
    .index("by_timestamp", ["timestamp"])
    .index("by_event_timestamp", ["eventId", "timestamp"])
    .index("by_member_timestamp", ["memberId", "timestamp"]),

  officers: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(), // In production, this should be hashed
    role: v.string(), // e.g., "President", "Officer"
    lastSeen: v.optional(v.string()),
  }).index("by_email", ["email"]),

  authSessions: defineTable({
    officerId: v.id("officers"),
    token: v.string(),
    expiresAt: v.string(),
  }).index("by_token", ["token"]),

  passwordResets: defineTable({
    officerId: v.id("officers"),
    token: v.string(),
    expiresAt: v.string(),
    used: v.boolean(),
  }).index("by_token", ["token"]),

  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    resetTime: v.number(), // Unix timestamp in ms
  }).index("by_key", ["key"]),

  auditLogs: defineTable({
    officerId: v.optional(v.id("officers")),
    action: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    timestamp: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});
