// Unit tests for authentication functions
import { assertEquals, assertExists, assertNotEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { TestDataFactory, runTestWithDb } from "./test-utils.ts";
import type { User } from "../routes/api/auth.ts";
import * as jose from "jose";

Deno.test("Authentication - User Creation and Retrieval", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;
    // Create a test user
    const testUser = TestDataFactory.createUser();

    // Store user in test database
    await kv.set(["user", testUser.id], testUser);
    await kv.set(["user_by_email", testUser.email], testUser);

    // Retrieve user by ID
    const userById = await kv.get<User>(["user", testUser.id]);
    assertExists(userById.value);
    assertEquals(userById.value!.id, testUser.id);
    assertEquals(userById.value!.email, testUser.email);

    // Retrieve user by email
    const userByEmail = await kv.get<User>(["user_by_email", testUser.email]);
    assertExists(userByEmail.value);
    assertEquals(userByEmail.value!.id, testUser.id);
    assertEquals(userByEmail.value!.name, testUser.name);
  });
});

Deno.test("Authentication - Password Hashing", async () => {
  // Test bcrypt password hashing (we can't easily test the internal functions without mocking)
  const bcrypt = (await import("npm:bcryptjs@^3.0.2")).default;

  const password = "testPassword123!";
  const hash = await bcrypt.hash(password, 12);

  // Verify hash is different from plain password
  assertNotEquals(hash, password);

  // Verify password matches hash
  const isValid = await bcrypt.compare(password, hash);
  assertEquals(isValid, true);

  // Verify wrong password doesn't match
  const isInvalid = await bcrypt.compare("wrongPassword", hash);
  assertEquals(isInvalid, false);
});

Deno.test("Authentication - JWT Creation and Validation", async () => {
  // Test JWT creation and validation
  const testUser = TestDataFactory.createUser();
  const secret = new TextEncoder().encode("test-secret-key-for-testing-purposes-only-32-chars");

  // Create JWT
  const jwt = await new jose.SignJWT({ role: testUser.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("qr-attends")
    .setSubject(testUser.id)
    .setExpirationTime("15m")
    .sign(secret);

  assertExists(jwt);
  assertEquals(typeof jwt, "string");

  // Verify JWT
  const { payload } = await jose.jwtVerify(jwt, secret, {
    issuer: "qr-attends",
  });

  assertEquals(payload.sub, testUser.id);
  assertEquals(payload.role, testUser.role);
  assertExists(payload.iat);
  assertExists(payload.exp);
});

Deno.test("Authentication - Email Uniqueness", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;
    const user1 = TestDataFactory.createUser({ email: "user1@example.com" });
    const user2 = TestDataFactory.createUser({ email: "user2@example.com" });
    const duplicateUser = TestDataFactory.createUser({ email: "user1@example.com" });

    // Store first user
    await kv.set(["user", user1.id], user1);
    await kv.set(["user_by_email", user1.email], user1);

    // Store second user with different email
    await kv.set(["user", user2.id], user2);
    await kv.set(["user_by_email", user2.email], user2);

    // Try to store duplicate email (this should work at DB level, but business logic should prevent it)
    await kv.set(["user", duplicateUser.id], duplicateUser);
    await kv.set(["user_by_email", duplicateUser.email], duplicateUser);

    // Verify that the email index now points to the duplicate user (last write wins)
    const emailLookup = await kv.get<User>(["user_by_email", "user1@example.com"]);
    assertExists(emailLookup.value);
    // This demonstrates why we need business logic to prevent duplicate emails
  });
});

Deno.test("Authentication - User Roles", () => {
  const memberUser = TestDataFactory.createUser({ role: "member" });
  const officerUser = TestDataFactory.createUser({ role: "officer" });
  const adminUser = TestDataFactory.createUser({ role: "admin" });

  assertEquals(memberUser.role, "member");
  assertEquals(officerUser.role, "officer");
  assertEquals(adminUser.role, "admin");

  // Test invalid role (this would be caught by TypeScript, but let's verify)
  // const invalidUser = TestDataFactory.createUser({ role: "invalid" as any }); // TypeScript would catch this
});

Deno.test("Authentication - Password Complexity Requirements", () => {
  // Test password validation patterns
  const validPasswords = [
    "MySecurePass123!",
    "Complex!Password#456",
    "Str0ng_P@ssw0rd_2024",
  ];

  const invalidPasswords = [
    "short", // Too short
    "nouppercase123!", // No uppercase
    "NOLOWERCASE123!", // No lowercase
    "NoNumbers!", // No numbers
    "NoSpecialChars123", // No special characters
  ];

  // These patterns should match the password schema in validation.ts
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{12,128}$/;

  for (const password of validPasswords) {
    assertEquals(passwordPattern.test(password), true, `Password should be valid: ${password}`);
  }

  for (const password of invalidPasswords) {
    assertEquals(passwordPattern.test(password), false, `Password should be invalid: ${password}`);
  }
});

Deno.test("Authentication - Email Validation", () => {
  const validEmails = [
    "user@example.com",
    "test.email+tag@domain.co.uk",
    "user123@test-domain.org",
  ];

  const invalidEmails = [
    "invalid-email",
    "@example.com",
    "user@",
    "user.example.com",
    "user@.com",
  ];

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const email of validEmails) {
    assertEquals(emailPattern.test(email), true, `Email should be valid: ${email}`);
  }

  for (const email of invalidEmails) {
    assertEquals(emailPattern.test(email), false, `Email should be invalid: ${email}`);
  }
});