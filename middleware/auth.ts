// Authentication middleware for protected routes
import { define } from "../utils.ts";
import { getCookies } from "@std/http/cookie";
import * as jose from "jose";

// Enforce strong JWT secret in production
const JWT_SECRET_RAW = Deno.env.get("JWT_SECRET");
if (!JWT_SECRET_RAW || JWT_SECRET_RAW.length < 32) {
  if (Deno.env.get("DENO_ENV") === "production") {
    throw new Error(
      "CRITICAL: JWT_SECRET must be set to a strong random value (32+ characters) in production!",
    );
  }
  console.warn(
    "⚠️  WARNING: Using weak JWT secret. Set JWT_SECRET environment variable!",
  );
}
const JWT_SECRET = new TextEncoder().encode(
  (JWT_SECRET_RAW || "dev-secret-change-in-production").padEnd(32, "_"),
);

interface JWTPayload {
  sub: string;
  role: string;
  iss: string;
  exp: number;
}

// Middleware to verify JWT and set user in state
export const authMiddleware = define.middleware(async (ctx) => {
  console.log(
    `[authMiddleware] Processing: ${ctx.req.method} ${
      new URL(ctx.req.url).pathname
    }`,
  );
  const cookies = getCookies(ctx.req.headers);
  const token = cookies.jwt;

  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET) as {
        payload: JWTPayload;
      };

      // Set user in context state
      ctx.state.user = {
        id: payload.sub,
        role: payload.role,
      };
      console.log(
        `[authMiddleware] User authenticated: ${payload.sub} (${payload.role})`,
      );
    } catch (error) {
      // Invalid token, proceed without user
      console.error("[authMiddleware] JWT verification failed:", error);
    }
  } else {
    console.log("[authMiddleware] No JWT token found");
  }

  return await ctx.next();
});

// Middleware to require authentication
export const requireAuth = define.middleware(async (ctx) => {
  if (!ctx.state.user) {
    // Redirect to auth page if not logged in
    return ctx.redirect("/auth");
  }

  return await ctx.next();
});

// Middleware to require admin role
export const requireAdmin = define.middleware(async (ctx) => {
  console.log(
    `[requireAdmin] Checking admin access for: ${
      new URL(ctx.req.url).pathname
    }`,
  );

  if (!ctx.state.user) {
    console.log("[requireAdmin] No user, redirecting to /auth");
    return ctx.redirect("/auth");
  }

  if (ctx.state.user.role !== "admin" && ctx.state.user.role !== "officer") {
    console.log(
      `[requireAdmin] User role '${ctx.state.user.role}' insufficient, returning 403`,
    );
    // Return 403 Forbidden if not admin/officer
    return new Response("Forbidden: Admin or Officer access required", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.log(`[requireAdmin] Admin access granted`);
  return await ctx.next();
});
