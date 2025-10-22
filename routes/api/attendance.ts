// API route for attendance recording
import { define } from "../../utils.ts";
import { getKv } from "../../db.ts";
import {
  attendanceRecordSchema,
  uuidSchema,
  validateInput,
} from "../../middleware/validation.ts";
import { logger } from "../../utils/logger.ts";

export interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  // Member details
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  studentId?: string;
  yearSection?: string;
  cardNo?: string;
}

// Helper: Record attendance
async function recordAttendance(
  data: Omit<AttendanceRecord, "id" | "timestamp">,
): Promise<AttendanceRecord | null> {
  const kv = await getKv();

  // Check for duplicate check-in using a composite key (optimized)
  const duplicateCheck = await kv.get([
    "attendance_check",
    data.eventId,
    data.userId,
  ]);
  if (duplicateCheck.value) {
    return null; // Already checked in
  }

  const id = crypto.randomUUID();
  const record: AttendanceRecord = {
    ...data,
    id,
    timestamp: new Date().toISOString(),
  };

  // Use atomic operation to prevent race conditions
  const atomicOp = kv.atomic()
    .check(duplicateCheck) // Ensure still not checked in
    .set(["attendance", data.eventId, id], record)
    .set(["attendance_by_user", data.userId, id], record)
    .set(["attendance_check", data.eventId, data.userId], true); // Mark as checked in

  const result = await atomicOp.commit();
  if (!result.ok) {
    return null; // Race condition - already checked in
  }

  return record;
}

// Helper: Get attendance for event
async function getEventAttendance(
  eventId: string,
): Promise<AttendanceRecord[]> {
  const kv = await getKv();
  const records: AttendanceRecord[] = [];
  const entries = kv.list<AttendanceRecord>({
    prefix: ["attendance", eventId],
  });
  for await (const { value } of entries) {
    records.push(value);
  }
  return records.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Helper: Get user attendance history
async function getUserAttendance(userId: string): Promise<AttendanceRecord[]> {
  const kv = await getKv();
  const records: AttendanceRecord[] = [];
  const entries = kv.list<AttendanceRecord>({
    prefix: ["attendance_by_user", userId],
  });
  for await (const { value } of entries) {
    records.push(value);
  }
  return records.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Helper: Delete attendance record
async function deleteAttendance(
  eventId: string,
  recordId: string,
): Promise<boolean> {
  const kv = await getKv();
  const record = await kv.get<AttendanceRecord>([
    "attendance",
    eventId,
    recordId,
  ]);
  if (!record.value) {
    return false;
  }

  // Delete all related records atomically
  await kv.atomic()
    .delete(["attendance", eventId, recordId])
    .delete(["attendance_by_user", record.value.userId, recordId])
    .delete(["attendance_check", eventId, record.value.userId])
    .commit();

  return true;
}

export const handler = define.handlers({
  // GET: Get attendance records
  async GET(ctx) {
    try {
      const url = new URL(ctx.req.url);
      const eventId = url.searchParams.get("eventId");
      const userId = url.searchParams.get("userId");

      if (eventId) {
        // Validate UUID
        const validation = validateInput(uuidSchema, eventId);
        if (!validation.success) {
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const records = await getEventAttendance(validation.data);
        return new Response(JSON.stringify(records), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (userId) {
        // Validate UUID
        const validation = validateInput(uuidSchema, userId);
        if (!validation.success) {
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const records = await getUserAttendance(validation.data);
        return new Response(JSON.stringify(records), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ error: "eventId or userId required" }),
        { status: 400 },
      );
    } catch (error) {
      logger.error("Attendance API GET error", error);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve attendance" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  // POST: Record attendance
  async POST(ctx) {
    try {
      const body = await ctx.req.json();

      // Validate input
      const validation = validateInput(attendanceRecordSchema, body);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { eventId, userId } = validation.data;

      // Check if member exists in database
      const kv = await getKv();
      const memberResult = await kv.get(["member", userId]);

      if (!memberResult.value) {
        // Member not found - return error with memberNotFound flag
        return new Response(
          JSON.stringify({
            error: "Member not found",
            memberNotFound: true,
            memberId: userId,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      interface MemberData {
        firstName: string;
        lastName: string;
        middleInitial: string;
        studentId?: string;
        yearSection?: string;
        cardNo?: string;
      }

      const member = memberResult.value as MemberData;

      // Construct full name
      const fullName =
        `${member.firstName} ${member.middleInitial}. ${member.lastName}`;

      const record = await recordAttendance({
        eventId,
        userId,
        userName: fullName,
        userEmail: member.studentId || "", // Store student ID in email field for now
        // Include all member details
        firstName: member.firstName,
        lastName: member.lastName,
        middleInitial: member.middleInitial,
        studentId: member.studentId,
        yearSection: member.yearSection,
        cardNo: member.cardNo,
      });

      if (!record) {
        return new Response(
          JSON.stringify({ error: "Already checked in to this event" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      logger.audit("Attendance recorded", {
        eventId,
        userId,
        studentId: member.studentId,
      });

      return new Response(JSON.stringify(record), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Attendance API POST error", error);
      return new Response(
        JSON.stringify({ error: "Failed to record attendance" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  // DELETE: Remove attendance record
  async DELETE(ctx) {
    try {
      const url = new URL(ctx.req.url);
      const eventId = url.searchParams.get("eventId");
      const recordId = url.searchParams.get("recordId");

      if (!eventId || !recordId) {
        return new Response(
          JSON.stringify({ error: "eventId and recordId required" }),
          { status: 400 },
        );
      }

      const deleted = await deleteAttendance(eventId, recordId);
      if (!deleted) {
        return new Response(JSON.stringify({ error: "Record not found" }), {
          status: 404,
        });
      }

      logger.audit("Attendance deleted", { eventId, recordId });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Attendance API DELETE error", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete attendance" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
