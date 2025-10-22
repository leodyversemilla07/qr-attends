// Attendance viewing page
import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import AttendanceDashboard from "../../islands/AttendanceDashboard.tsx";
import AdminHeader from "../../components/AdminHeader.tsx";

export default define.page(function AttendancePage(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>Attendance Records - View & Export | QR Attendance System</title>
        <meta
          name="description"
          content="View detailed attendance records, export to CSV, and manage check-in data for all your events. Real-time attendance tracking and analytics."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="max-w-7xl mx-auto p-6">
        <AttendanceDashboard />
      </main>
    </div>
  );
});
