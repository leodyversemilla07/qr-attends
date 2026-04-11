import { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export async function getAuthenticatedSession(ctx: QueryCtx | MutationCtx, token?: string, key?: string) {
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const sessionToken = normalizeSessionToken(token, key);

  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .first();

  if (!session) {
    throw new Error("Unauthorized: Invalid session");
  }

  if (new Date(session.expiresAt) < new Date()) {
    throw new Error("Unauthorized: Session expired");
  }

  return { session, decryptedToken: sessionToken };
}

export async function getAuthenticatedOfficer(ctx: QueryCtx | MutationCtx, token?: string) {
  const { session } = await getAuthenticatedSession(ctx, token);

  const officer = await ctx.db.get(session.officerId);
  if (!officer) {
    throw new Error("Unauthorized: Officer not found");
  }

  return officer;
}

export async function requireAdminRole(ctx: QueryCtx | MutationCtx, token?: string) {
  const officer = await getAuthenticatedOfficer(ctx, token);

  if (officer.role !== "President" && officer.role !== "Admin") {
    throw new Error("Forbidden: Admin role required");
  }

  return officer;
}

/**
 * Password strength requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Database-backed rate limiting that persists across serverless invocations.
 * Automatically cleans up expired records.
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<boolean> {
  const now = Date.now();

  // Find existing rate limit record
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  // If no record exists or window has expired, create/reset
  if (!existing || now > existing.resetTime) {
    if (existing) {
      // Update existing record with new window
      await ctx.db.patch(existing._id, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      // Create new record
      await ctx.db.insert("rateLimits", {
        key,
        count: 1,
        resetTime: now + windowMs,
      });
    }
    return true;
  }

  // Check if rate limit exceeded
  if (existing.count >= maxRequests) {
    return false;
  }

  // Increment counter
  await ctx.db.patch(existing._id, {
    count: existing.count + 1,
  });

  return true;
}

export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function isPlainSessionToken(token: string): boolean {
  return /^[0-9a-f]{64}$/.test(token);
}

function getLegacyObfuscationKey(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    return "qr-attends-default-dev-key-not-for-production";
  }
  return key;
}

function normalizeSessionToken(token: string, key?: string): string {
  if (isPlainSessionToken(token)) {
    return token;
  }

  try {
    const decryptedToken = decryptToken(token, key);
    if (isPlainSessionToken(decryptedToken)) {
      return decryptedToken;
    }
  } catch {
    // Fall through to the common auth error below.
  }

  throw new Error("Unauthorized: Invalid token format");
}

/**
 * Legacy XOR/base64 token obfuscation kept only to decode tokens already
 * stored by older clients. New logins return the raw opaque session token.
 */
export function encryptToken(token: string, key?: string): string {
  const encryptionKey = key || getLegacyObfuscationKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const keyData = encoder.encode(encryptionKey);

  const xored = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    xored[i] = data[i] ^ keyData[i % keyData.length];
  }

  // Use btoa for base64 encoding (available in Convex runtime)
  return btoa(String.fromCharCode(...Array.from(xored)));
}

export function decryptToken(encrypted: string, key?: string): string {
  try {
    const encryptionKey = key || getLegacyObfuscationKey();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKey);

    // Use atob for base64 decoding (available in Convex runtime)
    const decoded = atob(encrypted);
    const data = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      data[i] = decoded.charCodeAt(i);
    }

    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data[i] ^ keyData[i % keyData.length]);
    }

    return result;
  } catch {
    throw new Error("Failed to decrypt token");
  }
}

export async function logAuditEvent(
  ctx: MutationCtx,
  action: string,
  details?: string,
  officerId?: string
) {
  await ctx.db.insert("auditLogs", {
    action,
    details,
    timestamp: new Date().toISOString(),
    officerId: officerId ? (officerId as Id<"officers">) : undefined,
  });
}

/**
 * Cleanup expired rate limit records to prevent table bloat.
 * Can be called periodically via a scheduled job.
 */
export async function cleanupExpiredRateLimits(ctx: MutationCtx): Promise<number> {
  const now = Date.now();
  const allRecords = await ctx.db.query("rateLimits").collect();

  let deletedCount = 0;
  for (const record of allRecords) {
    if (now > record.resetTime) {
      await ctx.db.delete(record._id);
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * Cleanup expired auth sessions to prevent table bloat.
 * Returns the number of deleted sessions.
 */
export async function cleanupExpiredSessions(ctx: MutationCtx): Promise<number> {
  const now = new Date();
  const allSessions = await ctx.db.query("authSessions").collect();

  let deletedCount = 0;
  for (const session of allSessions) {
    if (new Date(session.expiresAt) < now) {
      await ctx.db.delete(session._id);
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * Cleanup expired or used password reset tokens.
 * Returns the number of deleted tokens.
 */
export async function cleanupExpiredPasswordResets(ctx: MutationCtx): Promise<number> {
  const now = new Date();
  const allResets = await ctx.db.query("passwordResets").collect();

  let deletedCount = 0;
  for (const reset of allResets) {
    // Delete if expired or already used
    if (new Date(reset.expiresAt) < now || reset.used) {
      await ctx.db.delete(reset._id);
      deletedCount++;
    }
  }

  return deletedCount;
}
