// API route for user logout
import { define } from "../../utils.ts";
import { deleteCookie } from "@std/http/cookie";
import { logger } from "../../utils/logger.ts";

export const handler = define.handlers({
  POST(ctx) {
    try {
      // Get user info before logout (if available)
      const userId = ctx.state.user?.id;
      const userRole = ctx.state.user?.role;

      // Clear the JWT cookie
      const headers = new Headers({ "Content-Type": "application/json" });
      deleteCookie(headers, "jwt", { path: "/" });

      if (userId) {
        logger.audit("User logout", { userId, role: userRole });
      }

      return new Response(
        JSON.stringify({ success: true, message: "Logged out successfully" }),
        {
          status: 200,
          headers,
        },
      );
    } catch (error) {
      logger.error("Logout API error", error);
      return new Response(JSON.stringify({ error: "Failed to logout" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
