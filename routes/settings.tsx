// Password change page
import { define } from "../utils.ts";
import ChangePasswordForm from "../islands/ChangePasswordForm.tsx";
import AdminHeader from "../components/AdminHeader.tsx";

export default define.page(function ChangePassword(ctx) {
  return (
    <div class="min-h-screen bg-gray-50">
      <AdminHeader currentPath={ctx.url.pathname} />
      <main class="w-full px-4 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold">Account Settings</h1>
          <p class="text-gray-600 mt-2">Manage your account password</p>
        </div>
        <ChangePasswordForm />
      </main>
    </div>
  );
});
