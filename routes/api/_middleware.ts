// API routes middleware - add authentication to API endpoints
import { define } from "../../utils.ts";
import { requireAuth } from "../../middleware/auth.ts";

// Most API endpoints require authentication
// Only /api/auth is public for login
export default define.middleware(async (ctx) => {
  const path = new URL(ctx.req.url).pathname;

  // Public endpoints that don't require authentication
  const publicEndpoints = [
    "/api/auth",
  ];

  // Check if current path is public
  if (publicEndpoints.some((endpoint) => path === endpoint)) {
    return await ctx.next();
  }

  // All other API endpoints require authentication
  return await requireAuth(ctx);
});
