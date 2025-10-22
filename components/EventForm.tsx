// Event management UI component for creating and editing events
import { useState } from "preact/hooks";
import { JSX } from "preact";

interface EventData {
  id?: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

interface EventFormProps {
  event?: EventData;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function EventForm({ event, onSave, onCancel }: EventFormProps) {
  const [form, setForm] = useState<EventData>(
    event || {
      name: "",
      date: "",
      time: "",
      location: "",
      description: "",
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Get current user from auth endpoint to get userId
      const authRes = await fetch("/api/auth/me");
      let createdBy = "system"; // fallback

      if (authRes.ok) {
        const authData = await authRes.json();
        createdBy = authData.user?.id || "system";
      }

      const method = form.id ? "PUT" : "POST";
      const body = form.id ? { id: form.id, ...form } : { ...form, createdBy };

      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save event");
      } else {
        setSuccess("Event saved successfully!");
        if (onSave) {
          setTimeout(() => onSave(), 1000);
        }
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

  return (
    <div class="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        {form.id ? "Edit Event" : "Create Event"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div class="mb-4 sm:mb-6">
          <label class="block text-base sm:text-lg font-medium mb-2">
            Event Name
          </label>
          <input
            type="text"
            class="w-full border border-gray-300 rounded-lg p-3 text-base"
            required
            value={form.name}
            onInput={(e) =>
              setForm((f) => ({ ...f, name: e.currentTarget.value }))}
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label class="block text-base sm:text-lg font-medium mb-2">
              Date
            </label>
            <input
              type="date"
              class="w-full border border-gray-300 rounded-lg p-3 text-base"
              required
              value={form.date}
              onInput={(e) =>
                setForm((f) => ({ ...f, date: e.currentTarget.value }))}
            />
          </div>
          <div>
            <label class="block text-base sm:text-lg font-medium mb-2">
              Time
            </label>
            <input
              type="time"
              class="w-full border border-gray-300 rounded-lg p-3 text-base"
              required
              value={form.time}
              onInput={(e) =>
                setForm((f) => ({ ...f, time: e.currentTarget.value }))}
            />
          </div>
        </div>

        <div class="mb-4 sm:mb-6">
          <label class="block text-base sm:text-lg font-medium mb-2">
            Location
          </label>
          <input
            type="text"
            class="w-full border border-gray-300 rounded-lg p-3 text-base"
            required
            value={form.location}
            onInput={(e) =>
              setForm((f) => ({ ...f, location: e.currentTarget.value }))}
          />
        </div>

        <div class="mb-4 sm:mb-6">
          <label class="block text-base sm:text-lg font-medium mb-2">
            Description
          </label>
          <textarea
            class="w-full border border-gray-300 rounded-lg p-3 text-base"
            rows={4}
            value={form.description}
            onInput={(e) =>
              setForm((f) => ({ ...f, description: e.currentTarget.value }))}
          />
        </div>

        {error && (
          <div class="text-red-600 mb-4 text-base sm:text-lg">{error}</div>
        )}
        {success && (
          <div class="text-green-600 mb-4 text-base sm:text-lg">{success}</div>
        )}

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-base sm:text-lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Event"}
          </button>
          {onCancel && (
            <button
              type="button"
              class="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-semibold text-base sm:text-lg"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
