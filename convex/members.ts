import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkRateLimit, getAuthenticatedOfficer, logAuditEvent } from "./authHelpers";

export const list = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    return await ctx.db.query("members").collect();
  },
});

export const search = query({
  args: { 
    token: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    let members = await ctx.db.query("members").collect();
    
    if (args.searchTerm && args.searchTerm.trim()) {
      const term = args.searchTerm.toLowerCase().trim();
      members = members.filter(m => 
        m.firstName.toLowerCase().includes(term) ||
        m.lastName.toLowerCase().includes(term) ||
        m.studentId.toLowerCase().includes(term) ||
        m.cardNo.toLowerCase().includes(term) ||
        m.yearSection.toLowerCase().includes(term)
      );
    }

    return members
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
      .slice(0, args.limit || 100);
  },
});

export const getStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    const members = await ctx.db.query("members").collect();
    const attendance = await ctx.db.query("attendance").collect();
    const memberIds = new Set(members.map(m => m._id));
    const activeMembers = new Set(attendance.map(a => a.memberId));
    
    const yearSectionStats: Record<string, number> = {};
    members.forEach(m => {
      const ys = m.yearSection || "Unknown";
      yearSectionStats[ys] = (yearSectionStats[ys] || 0) + 1;
    });

    return {
      total: members.length,
      withCheckIns: members.filter(m => activeMembers.has(m._id)).length,
      neverCheckedIn: members.filter(m => !activeMembers.has(m._id)).length,
      yearSections: Object.entries(yearSectionStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  },
});

export const getByCardNo = query({
  args: { cardNo: v.string(), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    return await ctx.db
      .query("members")
      .withIndex("by_cardNo", (q) => q.eq("cardNo", args.cardNo))
      .first();
  },
});

export const getByStudentId = query({
  args: { studentId: v.string(), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    return await ctx.db
      .query("members")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .first();
  },
});

export const get = query({
  args: { id: v.id("members"), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);
    return await ctx.db.get(args.id);
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
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const allowed = await checkRateLimit(ctx, `create-member:${args.token}`, 50, 60000);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    if (args.firstName.length < 2) throw new Error("First name must be at least 2 characters");
    if (args.lastName.length < 2) throw new Error("Last name must be at least 2 characters");
    if (args.studentId.length < 2) throw new Error("Student ID must be at least 2 characters");

    const existingStudentId = await ctx.db
      .query("members")
      .withIndex("by_studentId", (q) => q.eq("studentId", args.studentId))
      .first();
    
    if (existingStudentId) throw new Error("Student ID already exists");

    const { token, ...memberData } = args;
    const memberId = await ctx.db.insert("members", memberData);
    
    const officer = await getAuthenticatedOfficer(ctx, args.token);
    await logAuditEvent(ctx, "MEMBER_CREATED", `${memberData.firstName} ${memberData.lastName} (${memberData.studentId}) added`, officer._id.toString());
    
    return memberId;
  },
});

export const update = mutation({
  args: {
    id: v.id("members"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    middleInitial: v.optional(v.string()),
    studentId: v.optional(v.string()),
    yearSection: v.optional(v.string()),
    cardNo: v.optional(v.string()),
    email: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    const { token, id, ...updates } = args;

    if (updates.firstName !== undefined && updates.firstName.length < 2) {
      throw new Error("First name must be at least 2 characters");
    }
    if (updates.lastName !== undefined && updates.lastName.length < 2) {
      throw new Error("Last name must be at least 2 characters");
    }

    if (updates.studentId && updates.studentId !== member.studentId && member.studentId) {
      const newStudentId = updates.studentId!;
      const existing = await ctx.db
        .query("members")
        .withIndex("by_studentId", (q) => q.eq("studentId", newStudentId))
        .first();
      if (existing) throw new Error("Student ID already exists");
    }

    await ctx.db.patch(id, updates);
    
    const officer = await getAuthenticatedOfficer(ctx, args.token);
    await logAuditEvent(ctx, "MEMBER_UPDATED", `${member.firstName} ${member.lastName} updated`, officer._id.toString());
  },
});

export const remove = mutation({
  args: { id: v.id("members"), token: v.string() },
  handler: async (ctx, args) => {
    await getAuthenticatedOfficer(ctx, args.token);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    const memberName = `${member.firstName} ${member.lastName}`;
    await ctx.db.delete(args.id);

    const officer = await getAuthenticatedOfficer(ctx, args.token);
    await logAuditEvent(ctx, "MEMBER_DELETED", `${memberName} removed`, officer._id.toString());
  },
});

export const bulkImport = mutation({
  args: {
    members: v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      middleInitial: v.string(),
      studentId: v.string(),
      yearSection: v.string(),
      cardNo: v.string(),
      email: v.optional(v.string()),
    })),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const officer = await getAuthenticatedOfficer(ctx, args.token);
    
    if (officer.role !== "President" && officer.role !== "Admin" && officer.role !== "Secretary") {
      throw new Error("Forbidden: Only officers can import members");
    }

    const allowed = await checkRateLimit(ctx, `bulk-import:${officer._id}`, 5, 60000);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < args.members.length; i++) {
      const member = args.members[i];
      
      if (member.firstName.length < 2) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: First name too short`);
        continue;
      }
      if (member.lastName.length < 2) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Last name too short`);
        continue;
      }

      const existing = await ctx.db
        .query("members")
        .withIndex("by_studentId", (q) => q.eq("studentId", member.studentId))
        .first();
      
      if (existing) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Student ID ${member.studentId} already exists`);
        continue;
      }

      try {
        await ctx.db.insert("members", {
          firstName: member.firstName,
          lastName: member.lastName,
          middleInitial: member.middleInitial || "",
          studentId: member.studentId,
          yearSection: member.yearSection || "",
          cardNo: member.cardNo || "",
          email: member.email,
        });
        results.success++;
      } catch (e: any) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }

    await logAuditEvent(ctx, "MEMBERS_BULK_IMPORT", `${results.success} members imported, ${results.failed} failed`, officer._id.toString());

    return results;
  },
});
