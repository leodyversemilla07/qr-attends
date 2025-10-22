// Check-in page with QR code scanner
import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import CheckInScanner from "../islands/CheckInScanner.tsx";
import AdminHeader from "../components/AdminHeader.tsx";

export default define.page(function CheckInPage(ctx) {
  const eventId = ctx.url.searchParams.get("eventId");

  return (
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>Event Check-in - QR Scanner | QR Attendance System</title>
        <meta
          name="description"
          content="Scan QR codes for event check-in. Fast and reliable attendance tracking using camera or manual input. Real-time attendance recording."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="w-full px-4 py-4 sm:px-6 sm:py-6">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <CheckInScanner eventId={eventId} />
        </div>
      </main>
    </div>
  );
});
