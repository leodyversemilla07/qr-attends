// Admin dashboard page for event management
import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import EventManagement from "../../islands/EventManagement.tsx";
import AdminHeader from "../../components/AdminHeader.tsx";

export default define.page(function AdminDashboard(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard - Event Management | QR Attendance System</title>
        <meta
          name="description"
          content="Manage events, create QR codes, and oversee attendance tracking from the admin dashboard. Full control over your organization's attendance system."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="w-full px-4 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">
        <EventManagement />
      </main>
    </div>
  );
});
