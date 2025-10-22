// Attendance viewing page
import { define } from "../../utils.ts";
import AttendanceDashboard from "../../islands/AttendanceDashboard.tsx";
import AdminHeader from "../../components/AdminHeader.tsx";

export default define.page(function AttendancePage(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="max-w-7xl mx-auto p-6">
        <AttendanceDashboard />
      </main>
    </div>
  );
});
