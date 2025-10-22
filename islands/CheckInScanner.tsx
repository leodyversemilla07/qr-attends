// Check-in scanner island that fetches event data and shows QR scanner
import { useEffect, useState } from "preact/hooks";
import QRScanner from "./QRScanner.tsx";

interface CheckInScannerProps {
  eventId: string | null;
}

export default function CheckInScanner({ eventId }: CheckInScannerProps) {
  const [eventName, setEventName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    async function fetchEvent() {
      try {
        console.log("[CheckInScanner] Fetching event:", eventId);
        const res = await fetch(`/api/events?id=${eventId}`, {
          credentials: "same-origin", // Include cookies for authentication
        });
        console.log("[CheckInScanner] Response status:", res.status);

        if (res.ok) {
          const event = await res.json();
          console.log("[CheckInScanner] Event loaded:", event.name);
          setEventName(event.name);
        } else {
          const errorData = await res.json().catch(() => ({
            error: "Unknown error",
          }));
          console.error("[CheckInScanner] Error response:", errorData);
          setError("Event not found");
        }
      } catch (err) {
        console.error("[CheckInScanner] Fetch error:", err);
        setError(
          "Failed to load event: " +
            (err instanceof Error ? err.message : String(err)),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div class="text-center py-8 text-base sm:text-lg">Loading event...</div>
    );
  }

  if (!eventId || error) {
    return (
      <div class="text-center py-6 sm:py-8 px-4">
        <h2 class="text-xl sm:text-2xl font-bold mb-4 text-red-600">
          {error || "No Event Selected"}
        </h2>
        <p class="text-sm sm:text-base text-gray-600 mb-6">
          Please select an event from the admin dashboard to begin check-in.
        </p>
        <a
          href="/admin"
          class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-base sm:text-lg font-semibold"
        >
          Go to Admin Dashboard
        </a>
      </div>
    );
  }

  return (
    <>
      <h2 class="text-xl sm:text-2xl font-bold mb-3">Scan Member QR Cards</h2>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 sm:mb-6">
        <p class="text-sm sm:text-base text-gray-600 mb-1">
          Currently checking in for:
        </p>
        <p class="text-lg sm:text-xl font-semibold text-blue-900">
          {eventName}
        </p>
      </div>
      <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Scan each member's physical QR card to record their attendance.
      </p>
      <QRScanner eventId={eventId} eventName={eventName} />
    </>
  );
}
