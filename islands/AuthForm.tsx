// Simple login form for authentication
// Preact + Fresh island
import { useState } from "preact/hooks";

export default function AuthForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    const body = { ...form, action: "login" };

    console.log("Submitting login:", { email: form.email });

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      console.log("Login response:", { status: res.status, data });

      if (!res.ok) {
        setError(data.error || "Unknown error");
      } else {
        console.log("Login successful, redirecting...");
        // Redirect based on role after successful login
        const redirectPath =
          data.user.role === "admin" || data.user.role === "officer"
            ? "/admin"
            : "/attendance";
        globalThis.location.href = redirectPath;
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div class="max-w-md mx-auto mt-4 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Login
      </h2>
      <form onSubmit={handleSubmit} class="space-y-4">
        <label class="block">
          <span class="block text-base sm:text-lg font-medium mb-2">Email</span>
          <input
            type="email"
            class="w-full border border-gray-300 rounded-lg p-3 text-base"
            required
            value={form.email}
            onInput={(e) =>
              setForm((f) => ({ ...f, email: e.currentTarget.value }))}
          />
        </label>
        <label class="block">
          <span class="block text-base sm:text-lg font-medium mb-2">
            Password
          </span>
          <input
            type="password"
            class="w-full border border-gray-300 rounded-lg p-3 text-base"
            required
            value={form.password}
            onInput={(e) =>
              setForm((f) => ({ ...f, password: e.currentTarget.value }))}
          />
        </label>
        {error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-base sm:text-lg"
        >
          Login
        </button>
      </form>
      <div class="mt-4 sm:mt-6 text-center text-sm sm:text-base text-gray-600">
        <p>Contact your administrator for account access.</p>
      </div>
    </div>
  );
}
