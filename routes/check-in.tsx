// Check-in page with QR code scanner
import { define } from "../utils.ts";
import CheckInScanner from "../islands/CheckInScanner.tsx";
import AdminHeader from "../components/AdminHeader.tsx";

export default define.page(function CheckInPage(ctx) {
  const eventId = ctx.url.searchParams.get("eventId");

  return (
    <div class="min-h-screen bg-gray-50">
      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="w-full px-4 py-4 sm:px-6 sm:py-6">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <CheckInScanner eventId={eventId} />
        </div>
      </main>
    </div>
  );
});
