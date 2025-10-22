// API route for seeding the database (admin only, or first-time setup)
import { define } from "../../utils.ts";
import { seedDatabase } from "../../seed.ts";
import { getKv } from "../../db.ts";

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const kv = await getKv();

      // Check if admin already exists
      const adminExists = await kv.get([
        "user_by_email",
        "leodyversemilla07@gmail.com",
      ]);

      // If admin doesn't exist, allow seeding without auth (first-time setup)
      if (!adminExists.value) {
        await seedDatabase();
        return new Response(
          JSON.stringify({
            success: true,
            message: "Database seeded successfully (first-time setup)",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // If admin exists, require admin auth
      if (!ctx.state.user || ctx.state.user.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
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
