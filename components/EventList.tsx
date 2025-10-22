// Event list component to display all events
import { useEffect, useState } from "preact/hooks";
import { Icons } from "./Icons.tsx";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: string;
}

interface EventListProps {
  onEdit?: (event: Event) => void;
  onDelete?: (id: string) => void;
}

export default function EventList({ onEdit, onDelete }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      setLoading(true);
      const res = await fetch("/api/events");
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      } else {
        setError(data.error || "Failed to load events");
      }
    } catch (err) {
      setError(
        "An error occurred: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== id));
        if (onDelete) onDelete(id);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete event");
      }
    } catch (err) {
      alert(
        "An error occurred: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) {
    return <div class="text-center py-8">Loading events...</div>;
  }

  if (error) {
    return <div class="text-red-600 py-8">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div class="text-gray-500 py-8">
        No events found. Create your first event!
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          class="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200"
        >
          <div class="flex flex-col gap-4">
            <div class="flex-1">
              <h3 class="text-lg sm:text-xl font-bold text-gray-900">
                {event.name}
              </h3>
              <div class="text-sm sm:text-base text-gray-600 mt-2 space-y-2">
                <div class="flex items-center gap-2">
                  <Icons.Calendar class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <Icons.MapPin class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
              </div>
              {event.description && (
                <p class="text-gray-700 mt-3 text-sm sm:text-base">
                  {event.description}
                </p>
              )}
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <a
                href={`/check-in?eventId=${event.id}`}
                class="flex-1 text-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-base sm:text-lg"
              >
                <Icons.Camera class="w-5 h-5" />
                Check-In
              </a>
              {onEdit && (
                <button
                  type="button"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-base sm:text-lg"
                  onClick={() => onEdit(event)}
                >
                  <Icons.Edit3 class="w-5 h-5" />
                  Edit
                </button>
              )}
              <button
                type="button"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-base sm:text-lg"
                onClick={() => handleDelete(event.id)}
              >
                <Icons.Trash2 class="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
