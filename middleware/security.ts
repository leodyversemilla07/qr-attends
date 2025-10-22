// Security middleware for rate limiting, headers, and request validation
import { define } from "../utils.ts";
import { getKv } from "../db.ts";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_API_REQUESTS = 100; // Per window per IP

// Account lockout configuration
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_FAILED_LOGIN_ATTEMPTS = 5;

// Request size limit (5MB)
const MAX_REQUEST_SIZE = 5 * 1024 * 1024;

/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */
export const securityHeadersMiddleware = define.middleware(async (ctx) => {
  const response = await ctx.next();
  const isProduction = Deno.env.get("DENO_ENV") === "production";

  // Clone response to add headers
  const headers = new Headers(response.headers);

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // Fresh requires unsafe-inline for islands
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';",
  );

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME-sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection (legacy, but still useful)
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  headers.set("Permissions-Policy", "camera=*, microphone=(), geolocation=()");

  // Strict Transport Security (HTTPS only)
  if (isProduction) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

/**
 * Rate Limiting Middleware
 * Limits requests per IP address
 */
export const rateLimitMiddleware = define.middleware(async (ctx) => {
  const kv = await getKv();
  const ip = ctx.req.headers.get("x-forwarded-for") ||
    ctx.req.headers.get("x-real-ip") ||
    "unknown";
  const path = new URL(ctx.req.url).pathname;

  // Different limits for different endpoints
  let maxRequests = MAX_API_REQUESTS;
  if (path === "/api/auth") {
    maxRequests = MAX_LOGIN_ATTEMPTS;
  }

  const key = ["rate_limit", ip, path];
  const now = Date.now();

  // Get current rate limit data
  const result = await kv.get<{ count: number; resetAt: number }>(key);

  if (result.value) {
    // Check if window has expired
    if (now > result.value.resetAt) {
      // Reset counter
      await kv.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW }, {
        expireIn: RATE_LIMIT_WINDOW,
      });
    } else if (result.value.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((result.value.resetAt - now) / 1000);
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    } else {
      // Increment counter
      await kv.set(key, {
        count: result.value.count + 1,
        resetAt: result.value.resetAt,
      }, {
        expireIn: result.value.resetAt - now,
      });
    }
  } else {
    // First request in window
    await kv.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW }, {
      expireIn: RATE_LIMIT_WINDOW,
    });
  }

  return await ctx.next();
});

/**
 * Request Size Limit Middleware
 * Prevents large payload attacks
 */
export const requestSizeLimitMiddleware = define.middleware(async (ctx) => {
  const contentLength = ctx.req.headers.get("content-length");

  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return new Response(
      JSON.stringify({
        error: "Request payload too large. Maximum size is 5MB.",
      }),
      {
        status: 413,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return await ctx.next();
});

/**
 * Check if account is locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const kv = await getKv();
  const lockKey = ["account_lock", email];
  const lockData = await kv.get<{ lockedUntil: number }>(lockKey);

  if (lockData.value) {
    if (Date.now() < lockData.value.lockedUntil) {
      return true; // Still locked
    } else {
      // Lock expired, clean up
      await kv.delete(lockKey);
      await kv.delete(["failed_login_attempts", email]);
      return false;
    }
  }

  return false;
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(email: string): Promise<void> {
  const kv = await getKv();
  const attemptsKey = ["failed_login_attempts", email];
  const lockKey = ["account_lock", email];

  // Get current attempt count
  const result = await kv.get<number>(attemptsKey);
  const attempts = (result.value || 0) + 1;

  if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    // Lock the account
    const lockedUntil = Date.now() + LOCKOUT_DURATION;
    await kv.set(lockKey, { lockedUntil }, {
      expireIn: LOCKOUT_DURATION,
    });
    await kv.delete(attemptsKey);
    console.warn(
      `[Security] Account locked: ${email} (too many failed attempts)`,
    );
  } else {
    // Increment attempt counter
    await kv.set(attemptsKey, attempts, {
      expireIn: RATE_LIMIT_WINDOW, // Reset after 15 minutes
    });
  }
}

/**
 * Clear failed login attempts on successful login
 */
export async function clearFailedLogins(email: string): Promise<void> {
  const kv = await getKv();
  await kv.delete(["failed_login_attempts", email]);
}

/**
 * CORS Middleware
 * Configure allowed origins
 */
export const corsMiddleware = define.middleware(async (ctx) => {
  const allowedOrigins = Deno.env.get("ALLOWED_ORIGINS")?.split(",") || [];
  const origin = ctx.req.headers.get("origin");

  const response = await ctx.next();

  // For development, allow localhost
  if (Deno.env.get("DENO_ENV") !== "production") {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // For production, check against allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
});
