// Analytics page
import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import AnalyticsDashboard from "../../islands/AnalyticsDashboard.tsx";
import AdminHeader from "../../components/AdminHeader.tsx";

export default define.page(function AnalyticsPage(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>
          Analytics Dashboard - Attendance Insights | QR Attendance System
        </title>
        <meta
          name="description"
          content="Comprehensive attendance analytics and insights. Track event participation, view trends, and analyze attendance patterns across your organization."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="max-w-7xl mx-auto p-6">
        <AnalyticsDashboard />
      </main>
    </div>
  );
});
