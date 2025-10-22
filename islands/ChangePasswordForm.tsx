// Island component for changing password
import { useState } from "preact/hooks";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate passwords match
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength (basic client-side check)
    if (form.newPassword.length < 12) {
      setError("New password must be at least 12 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully!");
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (_err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="max-w-md mx-auto mt-4 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Change Password
      </h2>

      {error && (
        <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={form.currentPassword}
            onInput={(e) =>
              setForm({ ...form, currentPassword: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            value={form.newPassword}
            onInput={(e) =>
              setForm({ ...form, newPassword: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="At least 12 characters with uppercase, lowercase, number, and special character"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onInput={(e) =>
              setForm({ ...form, confirmPassword: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>

      <div class="mt-4 text-sm text-gray-600">
        <p class="font-medium mb-2">Password Requirements:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>At least 12 characters long</li>
          <li>At least one uppercase letter</li>
          <li>At least one lowercase letter</li>
          <li>At least one number</li>
          <li>At least one special character</li>
        </ul>
      </div>
    </div>
  );
}
