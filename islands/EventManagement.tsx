// Island component for event management (interactive)
import { useState } from "preact/hooks";
import EventForm from "../components/EventForm.tsx";
import EventList from "../components/EventList.tsx";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: string;
}

export default function EventManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(
    undefined,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreate() {
    setEditingEvent(undefined);
    setShowForm(true);
  }

  function handleEdit(event: Event) {
    setEditingEvent(event);
    setShowForm(true);
  }

  function handleSave() {
    setShowForm(false);
    setEditingEvent(undefined);
    setRefreshKey((k) => k + 1); // Force refresh of event list
  }

  function handleCancel() {
    setShowForm(false);
    setEditingEvent(undefined);
  }

  function handleDelete() {
    setRefreshKey((k) => k + 1); // Force refresh of event list
  }

  return (
    <div>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 class="text-2xl sm:text-3xl font-bold">Event Management</h2>
        {!showForm && (
          <button
            type="button"
            class="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            onClick={handleCreate}
          >
            + Create Event
          </button>
        )}
      </div>

      {showForm
        ? (
          <EventForm
            event={editingEvent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
        : (
          <EventList
            key={refreshKey}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
    </div>
  );
}
