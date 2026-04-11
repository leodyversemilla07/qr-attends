/**
 * @jest-environment node
 */

jest.mock("../convex/authHelpers", () => ({
  checkRateLimit: jest.fn(async () => true),
  generateSecureToken: jest.fn(() => "dev-reset-token"),
  logAuditEvent: jest.fn(),
  validatePasswordStrength: jest.fn(() => ({ valid: true, errors: [] })),
}));

import { requestPasswordReset, shouldExposeResetTokenForDebugging } from "../convex/officers/password";

describe("Password Reset Exposure", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalExposeFlag = process.env.EXPOSE_PASSWORD_RESET_TOKEN;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.EXPOSE_PASSWORD_RESET_TOKEN = originalExposeFlag;
  });

  it("exposes reset tokens outside production by default", () => {
    process.env.NODE_ENV = "test";
    delete process.env.EXPOSE_PASSWORD_RESET_TOKEN;

    expect(shouldExposeResetTokenForDebugging()).toBe(true);
  });

  it("hides reset tokens in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.EXPOSE_PASSWORD_RESET_TOKEN;

    const ctx = {
      db: {
        query: jest.fn().mockReturnValue({
          withIndex: jest.fn().mockReturnValue({
            first: jest.fn().mockResolvedValue({
              _id: "officer-1",
              email: "officer@example.com",
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue("reset-1"),
      },
    } as any;

    const result = await requestPasswordReset(ctx, { email: "officer@example.com" });

    expect(result).toEqual({
      message: "If an account exists with that email, a reset link will be sent.",
    });
  });

  it("never exposes reset tokens in production even when debug flag is true", () => {
    process.env.NODE_ENV = "production";
    process.env.EXPOSE_PASSWORD_RESET_TOKEN = "true";

    expect(shouldExposeResetTokenForDebugging()).toBe(false);
  });
});
