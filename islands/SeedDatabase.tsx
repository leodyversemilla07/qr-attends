// Island component for database seeding (admin onboarding)
import { useState } from "preact/hooks";

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
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Database seeded successfully!");
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
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Database Setup</h3>
      <p class="text-gray-600 mb-4">
        If this is your first time setting up the application, click the button below to seed the database with default data.
      </p>
      <button
        type="button"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSeed}
        disabled={isSeeding}
      >
        {isSeeding ? "Seeding..." : "Seed Database"}
      </button>
      {message && (
        <p class={`mt-4 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}