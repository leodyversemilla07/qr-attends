// Attendance dashboard island component
import { useEffect, useState } from "preact/hooks";
import { Icons } from "../components/Icons.tsx";

interface AttendanceRecord {
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

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
}

export default function AttendanceDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      const res = await fetch("/api/events", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
        if (data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      }
    } catch (err) {
      setError(
        "Failed to load events: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  async function loadAttendance(eventId: string) {
    if (!eventId) return;

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/attendance?eventId=${eventId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAttendance(data);
      } else {
        setError(data.error || "Failed to load attendance");
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

  async function handleDeleteRecord(recordId: string) {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/attendance?eventId=${selectedEventId}&recordId=${recordId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.ok) {
        setAttendance(attendance.filter((r) => r.id !== recordId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete record");
      }
    } catch (err) {
      alert(
        "An error occurred: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  function exportCSV() {
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    if (!selectedEvent) return;

    const headers = [
      "First Name",
      "Middle Initial",
      "Last Name",
      "Student ID",
      "Year/Section",
      "Card No.",
      "Check-in Time",
    ];

    const rows = attendance.map((record) => [
      record.firstName || "",
      record.middleInitial || "",
      record.lastName || "",
      record.studentId || record.userEmail || "",
      record.yearSection || "",
      record.cardNo || "",
      `"${new Date(record.timestamp).toLocaleString()}"`, // Wrap in quotes to prevent comma splitting
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${selectedEvent.name.replace(/\s+/g, "-")}.csv`;
    link.click();
  }

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadAttendance(selectedEventId);
    }
  }, [selectedEventId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4">Attendance Records</h2>

        {events.length > 0
          ? (
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">
                  Select Event
                </label>
                <select
                  class="w-full border border-gray-300 rounded p-2"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.currentTarget.value)}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {new Date(event.date).toLocaleDateString()}
                      {" "}
                      at {event.time}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div class="bg-gray-50 p-4 rounded">
                  <h3 class="font-bold text-lg">{selectedEvent.name}</h3>
                  <div class="flex items-center gap-2 text-gray-600 mt-1">
                    <Icons.Calendar class="w-4 h-4" />
                    <span>
                      {new Date(selectedEvent.date).toLocaleDateString()} at
                      {" "}
                      {selectedEvent.time}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600 mt-1">
                    <Icons.MapPin class="w-4 h-4" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  <p class="text-gray-700 mt-2 font-semibold">
                    Total Attendees: {attendance.length}
                  </p>
                </div>
              )}
            </div>
          )
          : (
            <p class="text-gray-500">
              No events found. Create an event first.
            </p>
          )}
      </div>

      {loading
        ? <div class="text-center py-8">Loading attendance...</div>
        : error
        ? <div class="text-red-600 py-8">{error}</div>
        : attendance.length > 0
        ? (
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold">Attendee List</h3>
              <button
                type="button"
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                onClick={exportCSV}
              >
                <Icons.Download class="w-5 h-5" />
                Export CSV
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left">First Name</th>
                    <th class="px-3 py-2 text-left">M.I.</th>
                    <th class="px-3 py-2 text-left">Last Name</th>
                    <th class="px-3 py-2 text-left">Student ID</th>
                    <th class="px-3 py-2 text-left">Year/Section</th>
                    <th class="px-3 py-2 text-left">Card No.</th>
                    <th class="px-3 py-2 text-left">Check-in Time</th>
                    <th class="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2">{record.firstName || "-"}</td>
                      <td class="px-3 py-2">{record.middleInitial || "-"}</td>
                      <td class="px-3 py-2">{record.lastName || "-"}</td>
                      <td class="px-3 py-2">
                        {record.studentId || record.userEmail || "-"}
                      </td>
                      <td class="px-3 py-2">{record.yearSection || "-"}</td>
                      <td class="px-3 py-2">{record.cardNo || "-"}</td>
                      <td class="px-3 py-2 whitespace-nowrap">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td class="px-3 py-2">
                        <button
                          type="button"
                          class="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                          onClick={() =>
                            handleDeleteRecord(record.id)}
                        >
                          <Icons.Trash2 class="w-3 h-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
        : selectedEventId
        ? (
          <div class="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No attendance records yet for this event.
          </div>
        )
        : null}
    </div>
  );
}
