// API route for analytics - returns all events with attendance counts in one request
// This eliminates the N+1 query problem in the analytics dashboard
import { define } from "../../utils.ts";
import { getKv } from "../../db.ts";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  timestamp: string;
}

interface EventWithAttendance {
  eventName: string;
  eventId: string;
  attendeeCount: number;
  date: string;
}

interface AnalyticsResponse {
  totalEvents: number;
  totalAttendance: number;
  averageAttendance: number;
  events: EventWithAttendance[];
}

async function getAnalytics(): Promise<AnalyticsResponse> {
  const kv = await getKv();

  // Load all events
  const events: Event[] = [];
  const eventEntries = kv.list<Event>({ prefix: ["event"] });
  for await (const { value } of eventEntries) {
    events.push(value);
  }

  // Count attendance for each event efficiently
  const eventAttendanceCounts = new Map<string, number>();

  // Iterate through all attendance records once
  const attendanceEntries = kv.list<AttendanceRecord>({
    prefix: ["attendance"],
  });
  for await (const { key, value: _value } of attendanceEntries) {
    // Key structure: ["attendance", eventId, recordId]
    if (key.length >= 2) {
      const eventId = key[1] as string;
      eventAttendanceCounts.set(
        eventId,
        (eventAttendanceCounts.get(eventId) || 0) + 1,
      );
    }
  }

  // Build response
  const eventsWithAttendance: EventWithAttendance[] = events.map((event) => ({
    eventName: event.name,
    eventId: event.id,
    attendeeCount: eventAttendanceCounts.get(event.id) || 0,
    date: event.date,
  }));

  const totalAttendance = Array.from(eventAttendanceCounts.values()).reduce(
    (sum, count) => sum + count,
    0,
  );
  const averageAttendance = events.length > 0
    ? Math.round(totalAttendance / events.length)
    : 0;

  return {
    totalEvents: events.length,
    totalAttendance,
    averageAttendance,
    events: eventsWithAttendance,
  };
}

export const handler = define.handlers({
  // GET: Get analytics data
  async GET(_ctx) {
    try {
      const analytics = await getAnalytics();
      return new Response(JSON.stringify(analytics), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Analytics error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to load analytics" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
