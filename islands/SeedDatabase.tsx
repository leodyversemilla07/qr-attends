// Island component for database seeding (admin onboarding)
import { useState } from "preact/hooks";
import { Icons } from "../components/Icons.tsx";

export default function SeedDatabase() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSeed() {
    setIsSeeding(true);
    setMessage(null);

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Database seeded successfully!");
        // Reload the page after successful seeding to show login
        setTimeout(() => globalThis.location.reload(), 2000);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to seed database. Please try again.");
      console.error("Seed error:", error);
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <div class="flex flex-col items-center gap-4">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSeed}
        disabled={isSeeding}
      >
        <Icons.Settings class="w-5 h-5" />
        {isSeeding ? "Setting up..." : "Setup Database"}
      </button>
      {message && (
        <p
          class={`text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
