import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { Icons } from "../components/Icons.tsx";

export default define.page(function Home(ctx) {
  const isLoggedIn = !!ctx.state.user;

  return (
    <div class="min-h-screen bg-gray-50">
      <Head>
        <title>QR Attendance System</title>
      </Head>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <div class="p-4 bg-blue-600 rounded-2xl shadow-lg">
              <Icons.QrCode class="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 class="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
            QR-Based Attendance System
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Modern attendance tracking for student organizations
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn
              ? (
                <a
                  href="/auth"
                  class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
                >
                  <Icons.Lock class="w-5 h-5" />
                  Login
                </a>
              )
              : (
                <a
                  href="/admin"
                  class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
                >
                  <Icons.Settings class="w-5 h-5" />
                  Admin Portal
                </a>
              )}
          </div>
        </div>
      </div>
    </div>
  );
});
