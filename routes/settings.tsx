// Account settings page
import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import AccountSettingsTabs from "../islands/AccountSettingsTabs.tsx";
import AdminHeader from "../components/AdminHeader.tsx";

export default define.page(function AccountSettings(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>
          Account Settings - Change Password & Email | QR Attendance System
        </title>
        <meta
          name="description"
          content="Manage your account settings including password and email changes. Secure account management for the QR Attendance System."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="w-full px-4 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold">Account Settings</h1>
          <p class="text-gray-600 mt-2">Manage your account settings</p>
        </div>
        <AccountSettingsTabs />
      </main>
    </div>
  );
});
