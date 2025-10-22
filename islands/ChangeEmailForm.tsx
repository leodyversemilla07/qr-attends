// Island component for changing email address
import { useState } from "preact/hooks";

export default function ChangeEmailForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newEmail: "",
    confirmEmail: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate emails match
    if (form.newEmail !== form.confirmEmail) {
      setError("New email addresses do not match");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.newEmail)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "change_email",
          currentPassword: form.currentPassword,
          newEmail: form.newEmail.toLowerCase().trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Email changed successfully!");
        setForm({
          currentPassword: "",
          newEmail: "",
          confirmEmail: "",
        });
      } else {
        setError(data.error || "Failed to change email");
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
        Change Email Address
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
            New Email Address
          </label>
          <input
            type="email"
            value={form.newEmail}
            onInput={(e) =>
              setForm({ ...form, newEmail: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="newemail@example.com"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">
            Confirm New Email Address
          </label>
          <input
            type="email"
            value={form.confirmEmail}
            onInput={(e) =>
              setForm({ ...form, confirmEmail: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="newemail@example.com"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Changing Email..." : "Change Email"}
        </button>
      </form>

      <div class="mt-4 text-sm text-gray-600">
        <p class="font-medium mb-2">Important Notes:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>You will need to use your new email address to log in</li>
          <li>Make sure the new email address is accessible to you</li>
          <li>This action cannot be undone</li>
        </ul>
      </div>
    </div>
  );
}
