import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";
import { load } from "@std/dotenv";
import {
  corsMiddleware,
  rateLimitMiddleware,
  requestSizeLimitMiddleware,
  securityHeadersMiddleware,
} from "./middleware/security.ts";

// Load environment variables from .env file (if exists - for local dev only)
// Deno Deploy uses environment variables set in the dashboard
try {
  await load({ export: true });
} catch {
  // .env file not found - this is expected on Deno Deploy
  console.log(
    "ℹ️ No .env file found - using environment variables from platform",
  );
}

export const app = new App<State>();

// Apply security middleware first (order matters!)
app.use(corsMiddleware);
app.use(securityHeadersMiddleware);
app.use(requestSizeLimitMiddleware);
app.use(rateLimitMiddleware);

app.use(staticFiles());

// Pass a shared value from a middleware
app.use(async (ctx) => {
  ctx.state.shared = "hello";
  return await ctx.next();
});

// this is the same as the /api/:name route defined via a file. feel free to delete this!
app.get("/api2/:name", (ctx) => {
  const name = ctx.params.name;
  return new Response(
    `Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`,
  );
});

// this can also be defined via a file. feel free to delete this!
const exampleLoggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});
app.use(exampleLoggerMiddleware);

// Include file-system based routes here
app.fsRoutes();

// Start the server if running as main module
if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || "8000");
  console.log(`🚀 Server starting on http://localhost:${port}`);

  // Deno Deploy automatically handles hostname, just specify port
  await app.listen({ port });
}
