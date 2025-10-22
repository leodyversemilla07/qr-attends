// Analytics page
import { define } from "../../utils.ts";
import AnalyticsDashboard from "../../islands/AnalyticsDashboard.tsx";
import AdminHeader from "../../components/AdminHeader.tsx";

export default define.page(function AnalyticsPage(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="max-w-7xl mx-auto p-6">
        <AnalyticsDashboard />
      </main>
    </div>
  );
});
