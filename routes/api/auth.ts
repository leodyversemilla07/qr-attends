// API route for authentication: login and JWT issuance
import { define } from "../../utils.ts";
import { getKv } from "../../db.ts";
import { setCookie } from "@std/http/cookie";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import {
  clearFailedLogins,
  isAccountLocked,
  recordFailedLogin,
} from "../../middleware/security.ts";
import {
  changePasswordSchema,
  loginSchema,
  validateInput,
} from "../../middleware/validation.ts";
import { logger } from "../../utils/logger.ts";

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
const JWT_ISSUER = "qr-attends";

// User roles: member, officer, admin
export type UserRole = "member" | "officer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

// Login handler
async function loginUser(email: string, password: string) {
  const kv = await getKv();

  // Use email index for fast lookup instead of scanning all users
  const result = await kv.get<User>(["user_by_email", email]);

  if (result.value) {
    const passwordMatch = await bcrypt.compare(
      password,
      result.value.passwordHash,
    );
    // Security: Don't log authentication results

    if (passwordMatch) {
      return result.value;
    }
  }

  return null;
}

// Change password handler
async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const kv = await getKv();

  // Get user by ID
  const userResult = await kv.get<User>(["user", userId]);
  if (!userResult.value) {
    return { success: false, error: "User not found" };
  }

  const user = userResult.value;

  // Verify current password
  const currentPasswordMatch = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );
  if (!currentPasswordMatch) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update user with new password
  const updatedUser: User = {
    ...user,
    passwordHash: newPasswordHash,
  };

  // Update both primary record and email index
  await kv.atomic()
    .set(["user", userId], updatedUser)
    .set(["user_by_email", user.email], updatedUser)
    .commit();

  return { success: true };
}

// JWT creation
async function createJwt(user: User) {
  return await new jose.SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setSubject(user.id)
    .setExpirationTime("15m") // 15 minutes
    .sign(JWT_SECRET);
}

export const handler = define.handlers({
  // GET: Get current user info
  GET(ctx) {
    try {
      if (!ctx.state.user) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: ctx.state.user,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      logger.error("Auth GET error", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },

  async POST(ctx) {
    try {
      const body = await ctx.req.json();

      // Check action type and validate accordingly
      const action = body.action;

      if (action === "login") {
        // Validate login input
        const validation = validateInput(loginSchema, body);
        if (!validation.success) {
          logger.warn("Login validation failed", { error: validation.error });
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { email, password } = validation.data;

        // Check if account is locked
        if (await isAccountLocked(email)) {
          logger.warn("Login attempt on locked account", { email });
          return new Response(
            JSON.stringify({
              error:
                "Account temporarily locked due to too many failed login attempts. Please try again in 30 minutes.",
            }),
            { status: 423 },
          ); // 423 Locked
        }

        const user = await loginUser(email, password);
        if (!user) {
          // Record failed login attempt
          await recordFailedLogin(email);
          logger.warn("Failed login attempt", { email });
          return new Response(
            JSON.stringify({ error: "Invalid credentials" }),
            { status: 401 },
          );
        }

        // Clear failed login attempts on successful login
        await clearFailedLogins(email);

        const jwt = await createJwt(user);
        const headers = new Headers({ "Content-Type": "application/json" });
        const isProduction = Deno.env.get("DENO_ENV") === "production";
        setCookie(headers, {
          name: "jwt",
          value: jwt,
          httpOnly: true,
          secure: isProduction, // Only send over HTTPS in production
          sameSite: "Strict",
          maxAge: 60 * 15, // 15 minutes
          path: "/",
        });

        logger.audit("User login", {
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          }),
          { status: 200, headers },
        );
      } else if (action === "change_password") {
        // Require authentication for password change
        if (!ctx.state.user) {
          return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Validate change password input
        const validation = validateInput(changePasswordSchema, body);
        if (!validation.success) {
          logger.warn("Password change validation failed", {
            error: validation.error,
          });
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { currentPassword, newPassword } = validation.data;

        // Change password
        const result = await changePassword(
          ctx.state.user.id,
          currentPassword,
          newPassword,
        );
        if (!result.success) {
          return new Response(JSON.stringify({ error: result.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        logger.audit("Password changed", { userId: ctx.state.user.id });

        return new Response(
          JSON.stringify({
            success: true,
            message: "Password changed successfully",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
      });
    } catch (error) {
      logger.error("Auth API error", error, { endpoint: "/api/auth" });
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
