// Unit tests for validation schemas and middleware functions
import { assertEquals } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { TestAssertions } from "./test-utils.ts";

// Import validation schemas
import {
  loginSchema,
  changePasswordSchema,
  changeEmailSchema,
  memberSchema,
  memberUpdateSchema,
  eventCreateSchema,
  eventUpdateSchema,
  attendanceRecordSchema,
  uuidSchema,
  validateInput,
} from "../middleware/validation.ts";

Deno.test("Validation - Login Schema", () => {
  // Valid login data
  const validData = {
    action: "login",
    email: "user@example.com",
    password: "validpassword123",
  };

  const result = validateInput(loginSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Invalid email
  const invalidEmail = {
    action: "login",
    email: "invalid-email",
    password: "validpassword123",
  };

  const emailResult = validateInput(loginSchema, invalidEmail);
  assertEquals(emailResult.success, false);
  if (!emailResult.success) {
    TestAssertions.assertValidationError(emailResult.error, "Invalid email format");
  }

  // Missing required fields
  const missingFields = {
    email: "user@example.com",
  };

  const missingResult = validateInput(loginSchema, missingFields);
  assertEquals(missingResult.success, false);
});

Deno.test("Validation - Change Password Schema", () => {
  // Valid change password data
  const validData = {
    action: "change_password",
    currentPassword: "oldpassword123",
    newPassword: "MySecurePass123!",
  };

  const result = validateInput(changePasswordSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Weak new password
  const weakPassword = {
    action: "change_password",
    currentPassword: "oldpassword123",
    newPassword: "weak",
  };

  const weakResult = validateInput(changePasswordSchema, weakPassword);
  assertEquals(weakResult.success, false);
  if (!weakResult.success) {
    TestAssertions.assertValidationError(weakResult.error, "Password must be at least 12 characters");
  }

  // Missing current password
  const missingCurrent = {
    action: "change_password",
    newPassword: "MySecurePass123!",
  };

  const missingResult = validateInput(changePasswordSchema, missingCurrent);
  assertEquals(missingResult.success, false);
});

Deno.test("Validation - Change Email Schema", () => {
  // Valid change email data
  const validData = {
    action: "change_email",
    currentPassword: "password123",
    newEmail: "newemail@example.com",
  };

  const result = validateInput(changeEmailSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Invalid email format
  const invalidEmail = {
    action: "change_email",
    currentPassword: "password123",
    newEmail: "invalid-email",
  };

  const emailResult = validateInput(changeEmailSchema, invalidEmail);
  assertEquals(emailResult.success, false);
  if (!emailResult.success) {
    TestAssertions.assertValidationError(emailResult.error, "Invalid email format");
  }

  // Missing current password
  const missingPassword = {
    action: "change_email",
    newEmail: "newemail@example.com",
  };

  const missingResult = validateInput(changeEmailSchema, missingPassword);
  assertEquals(missingResult.success, false);
});

Deno.test("Validation - Member Schema", () => {
  // Valid member data
  const validData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    firstName: "John",
    lastName: "Doe",
    middleInitial: "A",
    studentId: "TEST2025-0001",
    yearSection: "BSIT 4F1",
    cardNo: "123456789",
  };

  const result = validateInput(memberSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Invalid UUID
  const invalidId = {
    ...validData,
    id: "invalid-uuid",
  };

  const idResult = validateInput(memberSchema, invalidId);
  assertEquals(idResult.success, false);

  // Missing required fields
  const missingFields = {
    firstName: "John",
    lastName: "Doe",
  };

  const missingResult = validateInput(memberSchema, missingFields);
  assertEquals(missingResult.success, false);
});

Deno.test("Validation - Member Update Schema", () => {
  // Valid update data (partial)
  const validData = {
    firstName: "Jane",
    studentId: "TEST2025-0002",
  };

  const result = validateInput(memberUpdateSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Empty update (should be valid)
  const emptyData = {};
  const emptyResult = validateInput(memberUpdateSchema, emptyData);
  assertEquals(emptyResult.success, true);

  // Invalid data types
  const invalidData = {
    studentId: 12345, // Should be string
  };

  const invalidResult = validateInput(memberUpdateSchema, invalidData);
  assertEquals(invalidResult.success, false);
});

Deno.test("Validation - Event Create Schema", () => {
  // Valid event data
  const validData = {
    name: "Test Event",
    date: "2025-12-25",
    time: "14:00",
    location: "Test Location",
    description: "A test event description",
    createdBy: "550e8400-e29b-41d4-a716-446655440000",
  };

  const result = validateInput(eventCreateSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Invalid date format
  const invalidDate = {
    ...validData,
    date: "invalid-date",
  };

  const dateResult = validateInput(eventCreateSchema, invalidDate);
  assertEquals(dateResult.success, false);

  // Missing required fields
  const missingFields = {
    name: "Test Event",
    date: "2025-12-25",
  };

  const missingResult = validateInput(eventCreateSchema, missingFields);
  assertEquals(missingResult.success, false);
});

Deno.test("Validation - Event Update Schema", () => {
  // Valid update data
  const validData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Updated Event Name",
    location: "New Location",
  };

  const result = validateInput(eventUpdateSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Invalid UUID for id
  const invalidId = {
    id: "invalid-uuid",
    name: "Updated Event Name",
  };

  const idResult = validateInput(eventUpdateSchema, invalidId);
  assertEquals(idResult.success, false);

  // Empty update
  const emptyData = {
    id: "550e8400-e29b-41d4-a716-446655440000",
  };

  const emptyResult = validateInput(eventUpdateSchema, emptyData);
  assertEquals(emptyResult.success, true);
});

Deno.test("Validation - Attendance Record Schema", () => {
  // Valid attendance data
  const validData = {
    eventId: "550e8400-e29b-41d4-a716-446655440000",
    userId: "550e8400-e29b-41d4-a716-446655440001",
  };

  const result = validateInput(attendanceRecordSchema, validData);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validData);
  }

  // Invalid UUIDs
  const invalidIds = {
    eventId: "invalid-uuid",
    userId: "550e8400-e29b-41d4-a716-446655440001",
  };

  const invalidResult = validateInput(attendanceRecordSchema, invalidIds);
  assertEquals(invalidResult.success, false);

  // Missing required fields
  const missingFields = {
    eventId: "550e8400-e29b-41d4-a716-446655440000",
  };

  const missingResult = validateInput(attendanceRecordSchema, missingFields);
  assertEquals(missingResult.success, false);
});

Deno.test("Validation - UUID Schema", () => {
  // Valid UUID
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";
  const result = validateInput(uuidSchema, validUuid);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data, validUuid);
  }

  // Invalid UUID
  const invalidUuid = "invalid-uuid";
  const invalidResult = validateInput(uuidSchema, invalidUuid);
  assertEquals(invalidResult.success, false);

  // Empty string
  const emptyString = "";
  const emptyResult = validateInput(uuidSchema, emptyString);
  assertEquals(emptyResult.success, false);
});

Deno.test("Validation - Edge Cases", () => {
  // Test various edge cases

  // Login with very long email (should fail due to length limit)
  const longEmail = "a".repeat(300) + "@example.com"; // 312 characters total
  const longEmailData = {
    action: "login",
    email: longEmail,
    password: "password123",
  };

  const longEmailResult = validateInput(loginSchema, longEmailData);
  assertEquals(longEmailResult.success, false); // Should fail due to length

  // Event with very long description (should pass - exactly at limit)
  const longDescription = "a".repeat(1000);
  const longDescData = {
    name: "Test Event",
    date: "2025-12-25",
    time: "14:00",
    location: "Test Location",
    description: longDescription,
    createdBy: "550e8400-e29b-41d4-a716-446655440000",
  };

  const longDescResult = validateInput(eventCreateSchema, longDescData);
  assertEquals(longDescResult.success, true); // Should pass - exactly 1000 chars

  // Event with description too long (should fail)
  const tooLongDescription = "a".repeat(1001);
  const tooLongDescData = {
    ...longDescData,
    description: tooLongDescription,
  };

  const tooLongDescResult = validateInput(eventCreateSchema, tooLongDescData);
  assertEquals(tooLongDescResult.success, false);
  if (!tooLongDescResult.success) {
    TestAssertions.assertValidationError(tooLongDescResult.error, "Description must be at most 1000 characters");
  }

  // Test with null/undefined values
  const nullData = {
    action: "login",
    email: null,
    password: "password123",
  };

  const nullResult = validateInput(loginSchema, nullData);
  assertEquals(nullResult.success, false);
});