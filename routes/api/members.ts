// API route for member management
import { define } from "../../utils.ts";
import { getKv } from "../../db.ts";
import {
  memberSchema,
  memberUpdateSchema,
  uuidSchema,
  validateInput,
} from "../../middleware/validation.ts";
import { logger } from "../../utils/logger.ts";

export interface Member {
  id: string; // UUID from QR code
  firstName: string;
  lastName: string;
  middleInitial: string;
  studentId: string; // e.g., MBC2025-0165
  yearSection: string; // e.g., BSIT 4F1
  cardNo: string;
  createdAt: string;
}

// Helper: Get member by ID
async function getMemberById(id: string): Promise<Member | null> {
  const kv = await getKv();
  const result = await kv.get<Member>(["member", id]);
  return result.value;
}

// Helper: Create member
async function createMember(data: Omit<Member, "createdAt">): Promise<Member> {
  const kv = await getKv();
  const member: Member = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  await kv.set(["member", data.id], member);
  return member;
}

// Helper: Update member
async function updateMember(
  id: string,
  data: Partial<Member>,
): Promise<Member | null> {
  const existing = await getMemberById(id);
  if (!existing) return null;
  const kv = await getKv();
  const updated: Member = { ...existing, ...data, id }; // Ensure ID doesn't change
  await kv.set(["member", id], updated);
  return updated;
}

// Helper: Get all members
async function getAllMembers(): Promise<Member[]> {
  const kv = await getKv();
  const members: Member[] = [];
  const entries = kv.list<Member>({ prefix: ["member"] });
  for await (const { value } of entries) {
    members.push(value);
  }
  return members.sort((a, b) => a.lastName.localeCompare(b.lastName));
}

// Helper: Delete member
async function deleteMember(id: string): Promise<boolean> {
  const existing = await getMemberById(id);
  if (!existing) return false;
  const kv = await getKv();
  await kv.delete(["member", id]);
  return true;
}

export const handler = define.handlers({
  // GET: Get member by ID or all members
  async GET(ctx) {
    try {
      const url = new URL(ctx.req.url);
      const id = url.searchParams.get("id");

      if (id) {
        // Validate UUID
        const validation = validateInput(uuidSchema, id);
        if (!validation.success) {
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const member = await getMemberById(validation.data);
        if (!member) {
          return new Response(JSON.stringify({ error: "Member not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(member), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const members = await getAllMembers();
      return new Response(JSON.stringify(members), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Members API GET error", error);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve members" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  // POST: Create new member
  async POST(ctx) {
    try {
      const body = await ctx.req.json();

      // Validate input
      const validation = validateInput(memberSchema, body);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const {
        id,
        firstName,
        lastName,
        middleInitial,
        studentId,
        yearSection,
        cardNo,
      } = validation.data;

      // Check if member already exists
      const existing = await getMemberById(id);
      if (existing) {
        return new Response(
          JSON.stringify({ error: "Member with this ID already exists" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const member = await createMember({
        id,
        firstName,
        lastName,
        middleInitial,
        studentId,
        yearSection,
        cardNo,
      });
      logger.audit("Member created", { memberId: id, studentId });

      return new Response(JSON.stringify(member), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Members API POST error", error);
      return new Response(
        JSON.stringify({ error: "Failed to create member" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  // PUT: Update member
  async PUT(ctx) {
    try {
      const body = await ctx.req.json();

      if (!body.id) {
        return new Response(JSON.stringify({ error: "Member ID required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate ID
      const idValidation = validateInput(uuidSchema, body.id);
      if (!idValidation.success) {
        return new Response(JSON.stringify({ error: idValidation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate update data
      const { id: _id, ...updates } = body;
      const validation = validateInput(memberUpdateSchema, updates);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const member = await updateMember(idValidation.data, validation.data);
      if (!member) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      logger.audit("Member updated", { memberId: idValidation.data });

      return new Response(JSON.stringify(member), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Members API PUT error", error);
      return new Response(
        JSON.stringify({ error: "Failed to update member" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  // DELETE: Delete member
  async DELETE(ctx) {
    try {
      const url = new URL(ctx.req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "Member ID required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Validate UUID
      const validation = validateInput(uuidSchema, id);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const deleted = await deleteMember(validation.data);
      if (!deleted) {
        return new Response(JSON.stringify({ error: "Member not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      logger.audit("Member deleted", { memberId: validation.data });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Members API DELETE error", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete member" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
