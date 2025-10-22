// Auth page for login and registration
import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import AuthForm from "../islands/AuthForm.tsx";

export default define.page(function AuthPage() {
  return (
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>Login - QR Attendance System</title>
        <meta
          name="description"
          content="Secure login to access the QR Attendance System dashboard. Manage events, track attendance, and view analytics."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <header class="bg-blue-600 text-white p-4 shadow sticky top-0 z-10">
        <div class="max-w-7xl mx-auto">
          <a href="/" class="text-lg sm:text-xl font-bold hover:underline">
            ← QR Attendance System
          </a>
        </div>
      </header>
      <main class="w-full px-4 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">
        <AuthForm />
      </main>
    </div>
  );
});
