import { assert, assertEquals } from "jsr:@std/assert@1";
import * as jose from "jose";

// Set JWT_SECRET before importing middleware
Deno.env.set(
  "JWT_SECRET",
  "test-secret-that-is-long-enough-for-jwt-verification-123456789",
);

// Import the middleware after environment setup
import {
  authMiddleware,
  requireAdmin,
  requireAuth,
} from "../middleware/auth.ts";

// Mock console methods to avoid test output pollution
const originalConsole = { ...console };
console.log = (...args) => {
  // Allow our debug logs and middleware logs for debugging
  originalConsole.log(...args);
};
console.warn = (...args) => originalConsole.warn(...args);
console.error = (...args) => originalConsole.error(...args);

interface MockContext {
  req: Request;
  state: { user?: { id: string; role: string } };
  next: () => Promise<Response>;
  redirect?: (url: string) => Response;
}

async function createValidJWT(): Promise<string> {
  // Use the same secret logic as the middleware - pad to 32 characters
  const secretRaw = Deno.env.get("JWT_SECRET") ||
    "dev-secret-change-in-production";
  const secret = new TextEncoder().encode(secretRaw.padEnd(32, "_"));

  const payload = {
    sub: "test-user-id",
    role: "admin",
    iss: "test-issuer",
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);
}

Deno.test("Authentication Middleware - Valid JWT Token", async (t) => {
  await t.step(
    "should set user in context when valid JWT provided",
    async () => {
      const validToken = await createValidJWT();
      console.log("Created JWT token:", validToken.substring(0, 50) + "...");

      const mockRequest = new Request("http://localhost/test", {
        headers: {
          "cookie": `jwt=${validToken}`,
        },
      });

      console.log("Request cookies:", mockRequest.headers.get("cookie"));

      const mockContext: MockContext = {
        req: mockRequest,
        state: {},
        next: () => Promise.resolve(new Response("OK")),
      };

      const result = await authMiddleware(
        mockContext as unknown as Parameters<typeof authMiddleware>[0],
      );
      console.log("User in context after middleware:", mockContext.state.user);
      assert(result instanceof Response);
      assertEquals(mockContext.state.user, {
        id: "test-user-id",
        role: "admin",
      });
    },
  );

  await t.step("should not set user when no JWT token provided", async () => {
    const mockRequest = new Request("http://localhost/test");
    const mockContext: MockContext = {
      req: mockRequest,
      state: {},
      next: () => Promise.resolve(new Response("OK")),
    };

    const result = await authMiddleware(
      mockContext as unknown as Parameters<typeof authMiddleware>[0],
    );
    assert(result instanceof Response);
    assertEquals(mockContext.state.user, undefined);
  });

  await t.step("should not set user when JWT verification fails", async () => {
    const mockRequest = new Request("http://localhost/test", {
      headers: {
        "cookie": "jwt=invalid-token",
      },
    });

    const mockContext: MockContext = {
      req: mockRequest,
      state: {},
      next: () => Promise.resolve(new Response("OK")),
    };

    const result = await authMiddleware(
      mockContext as unknown as Parameters<typeof authMiddleware>[0],
    );
    assert(result instanceof Response);
    assertEquals(mockContext.state.user, undefined);
  });
});

Deno.test("Require Auth Middleware", async (t) => {
  await t.step("should allow request when user is authenticated", async () => {
    const mockContext: MockContext = {
      req: new Request("http://localhost/protected"),
      state: {
        user: { id: "test-user", role: "user" },
      },
      next: () => Promise.resolve(new Response("Protected content")),
    };

    const result = await requireAuth(
      mockContext as unknown as Parameters<typeof requireAuth>[0],
    );
    assert(result instanceof Response);
    assertEquals(await result.text(), "Protected content");
  });

  await t.step(
    "should redirect to auth page when user not authenticated",
    async () => {
      const mockContext = {
        req: new Request("http://localhost/protected"),
        state: {},
        redirect: (url: string) => {
          const response = new Response("", {
            status: 302,
            headers: { "Location": url },
          });
          return response;
        },
      };

      const result = await requireAuth(
        mockContext as unknown as Parameters<typeof requireAuth>[0],
      );
      assert(result instanceof Response);
      assertEquals(result.status, 302);
      assertEquals(result.headers.get("Location"), "/auth");
    },
  );
});

Deno.test("Require Admin Middleware", async (t) => {
  await t.step("should allow admin user access", async () => {
    const mockContext: MockContext = {
      req: new Request("http://localhost/admin"),
      state: {
        user: { id: "admin-user", role: "admin" },
      },
      next: () => Promise.resolve(new Response("Admin content")),
    };

    const result = await requireAdmin(
      mockContext as unknown as Parameters<typeof requireAdmin>[0],
    );
    assert(result instanceof Response);
    assertEquals(await result.text(), "Admin content");
  });

  await t.step("should allow officer user access", async () => {
    const mockContext: MockContext = {
      req: new Request("http://localhost/admin"),
      state: {
        user: { id: "officer-user", role: "officer" },
      },
      next: () => Promise.resolve(new Response("Admin content")),
    };

    const result = await requireAdmin(
      mockContext as unknown as Parameters<typeof requireAdmin>[0],
    );
    assert(result instanceof Response);
    assertEquals(await result.text(), "Admin content");
  });

  await t.step("should deny access for regular user", async () => {
    const mockContext = {
      req: new Request("http://localhost/admin"),
      state: {
        user: { id: "regular-user", role: "user" },
      },
    };

    const result = await requireAdmin(
      mockContext as unknown as Parameters<typeof requireAdmin>[0],
    );
    assert(result instanceof Response);
    assertEquals(result.status, 403);
    assertEquals(
      await result.text(),
      "Forbidden: Admin or Officer access required",
    );
  });

  await t.step("should redirect to auth when no user", async () => {
    const mockContext = {
      req: new Request("http://localhost/admin"),
      state: {},
      redirect: (url: string) => {
        const response = new Response("", {
          status: 302,
          headers: { "Location": url },
        });
        return response;
      },
    };

    const result = await requireAdmin(
      mockContext as unknown as Parameters<typeof requireAdmin>[0],
    );
    assert(result instanceof Response);
    assertEquals(result.status, 302);
    assertEquals(result.headers.get("Location"), "/auth");
  });
});
