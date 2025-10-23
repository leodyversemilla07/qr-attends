// Test utilities and infrastructure for QR Attendance System
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.220.0/assert/mod.ts";
import bcrypt from "bcryptjs";

// Import types from the main codebase
import type { User } from "../routes/api/auth.ts";
import type { Event } from "../routes/api/events.ts";
import type { Member } from "../routes/api/members.ts";
import type { AttendanceRecord } from "../routes/api/attendance.ts";

// Test database utilities
export class TestDatabase {
  private kv: Deno.Kv | null = null;

  async setup(): Promise<void> {
    // Use a test-specific database path in the current working directory
    const testDbPath = Deno.cwd() + "/test-db";
    this.kv = await Deno.openKv(testDbPath);
    // Override the getKv function for tests
    (globalThis as unknown as { testKv: Deno.Kv }).testKv = this.kv;
  }

  async teardown(): Promise<void> {
    if (this.kv) {
      await this.kv.close();
      this.kv = null;
    }
    // Clean up test database file
    try {
      await Deno.remove("./test-db", { recursive: true });
    } catch (_error) {
      // Ignore if file doesn't exist
    }
    delete (globalThis as unknown as { testKv?: Deno.Kv }).testKv;
  }

  async clear(): Promise<void> {
    if (!this.kv) return;

    // Clear all data from test database
    const keys = [];
    for await (const entry of this.kv.list({ prefix: [] })) {
      keys.push(entry.key);
    }

    for (const key of keys) {
      await this.kv.delete(key);
    }
  }

  // Public getter for testing
  getKv(): Deno.Kv | null {
    return this.kv;
  }
}

// Mock implementations
export class MockRequest {
  private url: URL;
  private method: string;
  private headers: Headers;
  private body: unknown;

  constructor(
    url: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: unknown;
    } = {},
  ) {
    this.url = new URL(url);
    this.method = options.method || "GET";
    this.headers = new Headers(options.headers || {});
    this.body = options.body;
  }

  json(): unknown {
    return this.body;
  }

  text(): string {
    return JSON.stringify(this.body);
  }

  getUrl(): URL {
    return this.url;
  }

  getMethod(): string {
    return this.method;
  }

  getHeaders(): Headers {
    return this.headers;
  }
}

export class MockResponse {
  private statusCode: number;
  private headers: Headers;
  private body: unknown;

  constructor(
    statusCode = 200,
    body: unknown = null,
    headers: Record<string, string> = {},
  ) {
    this.statusCode = statusCode;
    this.body = body;
    this.headers = new Headers(headers);
    this.headers.set("Content-Type", "application/json");
  }

  get status(): number {
    return this.statusCode;
  }

  json(): unknown {
    return this.body;
  }

  text(): string {
    return JSON.stringify(this.body);
  }

  getHeaders(): Headers {
    return this.headers;
  }
}

// Test data factories
export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: crypto.randomUUID(),
      name: "Test User",
      email: "test@example.com",
      passwordHash: "$2a$10$test.hash.for.testing.purposes.only",
      role: "member" as const,
      ...overrides,
    };
  }

  static createEvent(overrides: Partial<Event> = {}): Event {
    return {
      id: crypto.randomUUID(),
      name: "Test Event",
      date: "2025-12-25",
      time: "14:00",
      location: "Test Location",
      description: "A test event",
      createdAt: new Date().toISOString(),
      createdBy: crypto.randomUUID(),
      ...overrides,
    };
  }

  static createMember(overrides: Partial<Member> = {}): Member {
    return {
      id: crypto.randomUUID(),
      firstName: "John",
      lastName: "Doe",
      middleInitial: "A",
      studentId: "TEST2025-0001",
      yearSection: "BSIT 4F1",
      cardNo: "123456789",
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static createAttendanceRecord(
    overrides: Partial<AttendanceRecord> = {},
  ): AttendanceRecord {
    return {
      id: crypto.randomUUID(),
      eventId: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      userName: "Test User",
      userEmail: "test@example.com",
      timestamp: new Date().toISOString(),
      firstName: "John",
      lastName: "Doe",
      middleInitial: "A",
      studentId: "TEST2025-0001",
      yearSection: "BSIT 4F1",
      cardNo: "123456789",
      ...overrides,
    };
  }
}

// Test assertion helpers
export class TestAssertions {
  static assertResponseStatus(
    response: Response,
    expectedStatus: number,
  ): void {
    assertEquals(
      response.status,
      expectedStatus,
      `Expected status ${expectedStatus}, got ${response.status}`,
    );
  }

  static async assertJsonResponse(
    response: Response,
    expectedData: unknown,
  ): Promise<void> {
    const data = await response.json();
    assertEquals(data, expectedData);
  }

  static async assertErrorResponse(
    response: Response,
    expectedStatus: number,
    expectedError: string,
  ): Promise<void> {
    assertEquals(response.status, expectedStatus);
    const data = await response.json();
    assertExists(data.error);
    assertEquals(data.error, expectedError);
  }

  static assertValidationError(error: string, expectedMessage: string): void {
    assertEquals(error, expectedMessage);
  }
}

// Environment setup for tests
export function setupTestEnvironment(): void {
  // Set test environment variables
  Deno.env.set("DENO_ENV", "test");
  Deno.env.set(
    "JWT_SECRET",
    "test-secret-that-is-long-enough-for-jwt-verification-123456789",
  );
}

// Global test setup and teardown
export async function setupTestSuite(): Promise<TestDatabase> {
  setupTestEnvironment();
  const testDb = new TestDatabase();
  await testDb.setup();
  return testDb;
}

export async function teardownTestSuite(testDb: TestDatabase): Promise<void> {
  await testDb.teardown();
}

// Test runner utilities
export async function runTestWithDb(
  testFn: (db: TestDatabase) => Promise<void>,
): Promise<void> {
  const testDb = await setupTestSuite();
  try {
    await testFn(testDb);
  } finally {
    await teardownTestSuite(testDb);
  }
}
