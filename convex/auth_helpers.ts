import { QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export async function getAuthenticatedOfficer(ctx: QueryCtx | MutationCtx, token?: string) {
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const session = await ctx.db
    .query("authSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session) {
    throw new Error("Unauthorized: Invalid session");
  }

  if (new Date(session.expiresAt) < new Date()) {
    throw new Error("Unauthorized: Session expired");
  }

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

export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function encryptToken(token: string, key: string = "qr-attends-key"): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const keyData = encoder.encode(key);
  
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data[i] ^ keyData[i % keyData.length]);
  }
  
  return Buffer.from(result, "utf8").toString("base64");
}

export function decryptToken(encrypted: string, key: string = "qr-attends-key"): string {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const data = Buffer.from(encrypted, "base64");
    
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
    officerId: officerId ? officerId as any : undefined,
  });
}
