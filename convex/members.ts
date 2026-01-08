import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("members").collect();
  },
});

export const getByCardNo = query({
  args: { cardNo: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_cardNo", (q) => q.eq("cardNo", args.cardNo))
      .first();
  },
});

export const getByStudentId = query({
  args: { studentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    middleInitial: v.string(),
    studentId: v.string(),
    yearSection: v.string(),
    cardNo: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for duplicates
    const existing = await ctx.db
      .query("members")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .first();
    
    if (existing) throw new Error("Student ID already exists");

    const memberId = await ctx.db.insert("members", args);
    return memberId;
  },
});
