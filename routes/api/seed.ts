// API route for seeding the database (admin only)
import { define } from "../../utils.ts";
import { seedDatabase } from "../../seed.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      // Check if user is admin
      if (!ctx.state.user || ctx.state.user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Run seeding
      await seedDatabase();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Database seeded successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Seed API error", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});