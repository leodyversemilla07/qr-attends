// Admin dashboard page for event management
import { define } from "../../utils.ts";
import EventManagement from "../../islands/EventManagement.tsx";
import AdminHeader from "../../components/AdminHeader.tsx";

export default define.page(function AdminDashboard(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="w-full px-4 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">
        <EventManagement />
      </main>
    </div>
  );
});
