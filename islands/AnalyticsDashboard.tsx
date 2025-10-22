// Analytics island component for attendance insights
import { useEffect, useState } from "preact/hooks";

interface EventWithAttendance {
  eventName: string;
  eventId: string;
  attendeeCount: number;
  date: string;
}

interface Analytics {
  totalEvents: number;
  totalAttendance: number;
  averageAttendance: number;
  events: EventWithAttendance[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalEvents: 0,
    totalAttendance: 0,
    averageAttendance: 0,
    events: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      // Single API call that returns everything (no more N+1 queries!)
      const res = await fetch("/api/analytics");

      if (!res.ok) {
        setError("Failed to load analytics");
        return;
      }

      const data: Analytics = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(
        "An error occurred: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <div class="text-center py-8">Loading analytics...</div>;
  }

  if (error) {
    return <div class="text-red-600 py-8">{error}</div>;
  }

  return (
    <div class="space-y-6">
      <h2 class="text-3xl font-bold">Analytics Dashboard</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-gray-600 text-sm font-medium">Total Events</div>
          <div class="text-4xl font-bold text-blue-600 mt-2">
            {analytics.totalEvents}
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-gray-600 text-sm font-medium">Total Attendance</div>
          <div class="text-4xl font-bold text-green-600 mt-2">
            {analytics.totalAttendance}
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-gray-600 text-sm font-medium">Average per Event</div>
          <div class="text-4xl font-bold text-purple-600 mt-2">
            {analytics.averageAttendance}
          </div>
        </div>
      </div>

      {analytics.events.length > 0 && (
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-bold mb-4">Recent Events</h3>
          <div class="space-y-2">
            {analytics.events.slice(0, 5).map((event, idx) => (
              <div
                key={idx}
                class="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <div class="font-semibold">{event.eventName}</div>
                  <div class="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
                <div class="text-2xl font-bold text-blue-600">
                  {event.attendeeCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.totalEvents === 0 && (
        <div class="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          No events yet. Create your first event to see analytics!
        </div>
      )}
    </div>
  );
}
