// API route for event management: CRUD operations
import { define } from "../../utils.ts";
import { getKv } from "../../db.ts";
import {
  eventCreateSchema,
  eventUpdateSchema,
  uuidSchema,
  validateInput,
} from "../../middleware/validation.ts";
import { logger } from "../../utils/logger.ts";

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

// Helper: Get all events
async function getAllEvents(): Promise<Event[]> {
  const kv = await getKv();
  const events: Event[] = [];
  const entries = kv.list<Event>({ prefix: ["event"] });
  for await (const { value } of entries) {
    events.push(value);
  }
  return events.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Helper: Get event by ID
async function getEventById(id: string): Promise<Event | null> {
  const kv = await getKv();
  const result = await kv.get<Event>(["event", id]);
  return result.value;
}

// Helper: Create event
async function createEvent(
  data: Omit<Event, "id" | "createdAt">,
): Promise<Event> {
  const kv = await getKv();
  const id = crypto.randomUUID();
  const event: Event = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  await kv.set(["event", id], event);
  return event;
}

// Helper: Update event
async function updateEvent(
  id: string,
  data: Partial<Event>,
): Promise<Event | null> {
  const existing = await getEventById(id);
  if (!existing) return null;
  const kv = await getKv();
  const updated: Event = { ...existing, ...data };
  await kv.set(["event", id], updated);
  return updated;
}

// Helper: Delete event
async function deleteEvent(id: string): Promise<boolean> {
  const existing = await getEventById(id);
  if (!existing) return false;
  const kv = await getKv();
  await kv.delete(["event", id]);
  return true;
}

export const handler = define.handlers({
  // GET: List all events or get single event by ID
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

        const event = await getEventById(validation.data);
        if (!event) {
          return new Response(JSON.stringify({ error: "Event not found" }), {
            status: 404,
          });
        }
        return new Response(JSON.stringify(event), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const events = await getAllEvents();
      return new Response(JSON.stringify(events), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Events API GET error", error);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve events" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },

  // POST: Create new event
  async POST(ctx) {
    try {
      const body = await ctx.req.json();

      // Validate input
      const validation = validateInput(eventCreateSchema, body);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { name, date, time, location, description = "", createdBy } =
        validation.data;

      const event = await createEvent({
        name,
        date,
        time,
        location,
        description,
        createdBy,
      });
      logger.audit("Event created", {
        eventId: event.id,
        eventName: name,
        createdBy,
      });

      return new Response(JSON.stringify(event), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Events API POST error", error);
      return new Response(JSON.stringify({ error: "Failed to create event" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // PUT: Update event
  async PUT(ctx) {
    try {
      const body = await ctx.req.json();

      // Validate input
      const validation = validateInput(eventUpdateSchema, body);
      if (!validation.success) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { id, ...updates } = validation.data;

      const event = await updateEvent(id, updates);
      if (!event) {
        return new Response(JSON.stringify({ error: "Event not found" }), {
          status: 404,
        });
      }

      logger.audit("Event updated", { eventId: id, updates });

      return new Response(JSON.stringify(event), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Events API PUT error", error);
      return new Response(JSON.stringify({ error: "Failed to update event" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  // DELETE: Delete event
  async DELETE(ctx) {
    try {
      const url = new URL(ctx.req.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "Event ID required" }), {
          status: 400,
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

      const deleted = await deleteEvent(validation.data);
      if (!deleted) {
        return new Response(JSON.stringify({ error: "Event not found" }), {
          status: 404,
        });
      }

      logger.audit("Event deleted", { eventId: validation.data });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Events API DELETE error", error);
      return new Response(JSON.stringify({ error: "Failed to delete event" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
