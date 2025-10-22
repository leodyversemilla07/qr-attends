// Integration tests for API endpoints - testing business logic through database operations
import { assertEquals, assertExists } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { TestDataFactory, runTestWithDb } from "./test-utils.ts";
import type { User } from "../routes/api/auth.ts";
import type { Event } from "../routes/api/events.ts";
import type { AttendanceRecord } from "../routes/api/attendance.ts";
import type { Member } from "../routes/api/members.ts";

// Test the complete user registration and login flow
Deno.test("Integration - Complete User Registration and Login Flow", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Step 1: Create a user (simulate registration)
    const testUser = TestDataFactory.createUser();
    const passwordHash = await TestDataFactory.hashPassword("testpassword123");
    const userWithHash = { ...testUser, passwordHash };

    await kv.set(["user", testUser.id], userWithHash);
    await kv.set(["user_by_email", testUser.email], userWithHash);

    // Step 2: Verify user was created correctly
    const storedUser = await kv.get<User>(["user", testUser.id]);
    assertExists(storedUser.value);
    assertEquals(storedUser.value!.email, testUser.email);
    assertEquals(storedUser.value!.name, testUser.name);

    // Step 3: Test login functionality (simulate the loginUser function)
    const loginResult = await kv.get<User>(["user_by_email", testUser.email]);
    assertExists(loginResult.value);

    const passwordMatch = await TestDataFactory.comparePassword("testpassword123", loginResult.value!.passwordHash);
    assertEquals(passwordMatch, true);

    // Step 4: Test invalid login
    const wrongPasswordMatch = await TestDataFactory.comparePassword("wrongpassword", loginResult.value!.passwordHash);
    assertEquals(wrongPasswordMatch, false);
  });
});

// Test the complete event management workflow
Deno.test("Integration - Complete Event Management Workflow", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Step 1: Create an event
    const testEvent = TestDataFactory.createEvent();
    await kv.set(["event", testEvent.id], testEvent);

    // Step 2: Retrieve the event
    const retrievedEvent = await kv.get<Event>(["event", testEvent.id]);
    assertExists(retrievedEvent.value);
    assertEquals(retrievedEvent.value!.name, testEvent.name);
    assertEquals(retrievedEvent.value!.date, testEvent.date);

    // Step 3: Update the event
    const updatedEvent = { ...testEvent, name: "Updated Event Name", location: "New Location" };
    await kv.set(["event", testEvent.id], updatedEvent);

    const updatedRetrievedEvent = await kv.get<Event>(["event", testEvent.id]);
    assertEquals(updatedRetrievedEvent.value!.name, "Updated Event Name");
    assertEquals(updatedRetrievedEvent.value!.location, "New Location");

    // Step 4: List all events
    const allEvents: Event[] = [];
    for await (const entry of kv.list<Event>({ prefix: ["event"] })) {
      allEvents.push(entry.value);
    }
    assertEquals(allEvents.length, 1);
    assertEquals(allEvents[0].name, "Updated Event Name");

    // Step 5: Delete the event
    await kv.delete(["event", testEvent.id]);
    const deletedEvent = await kv.get<Event>(["event", testEvent.id]);
    assertEquals(deletedEvent.value, null);
  });
});

// Test the complete attendance tracking workflow
Deno.test("Integration - Complete Attendance Tracking Workflow", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Step 1: Create user and event
    const testUser = TestDataFactory.createUser();
    const testEvent = TestDataFactory.createEvent();

    await kv.set(["user", testUser.id], testUser);
    await kv.set(["event", testEvent.id], testEvent);

    // Step 2: Record attendance
    const attendanceRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      eventId: testEvent.id,
      userId: testUser.id,
      userName: testUser.name,
      userEmail: testUser.email,
      timestamp: new Date().toISOString(),
    };

    // Check for duplicate (should not exist)
    const duplicateCheck = await kv.get(["attendance_check", testEvent.id, testUser.id]);
    assertEquals(duplicateCheck.value, null);

    // Record attendance with atomic operation
    const atomicOp = kv.atomic()
      .check(duplicateCheck)
      .set(["attendance", testEvent.id, attendanceRecord.id], attendanceRecord)
      .set(["attendance_by_user", testUser.id, attendanceRecord.id], attendanceRecord)
      .set(["attendance_check", testEvent.id, testUser.id], true);

    const result = await atomicOp.commit();
    assertEquals(result.ok, true);

    // Step 3: Verify attendance was recorded
    const recordedAttendance = await kv.get<AttendanceRecord>(["attendance", testEvent.id, attendanceRecord.id]);
    assertExists(recordedAttendance.value);
    assertEquals(recordedAttendance.value!.userId, testUser.id);
    assertEquals(recordedAttendance.value!.eventId, testEvent.id);

    // Step 4: Check duplicate prevention
    const secondDuplicateCheck = await kv.get(["attendance_check", testEvent.id, testUser.id]);
    assertEquals(secondDuplicateCheck.value, true);

    // Try to record again (should fail because we're using the original null check)
    const secondRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      eventId: testEvent.id,
      userId: testUser.id,
      userName: testUser.name,
      userEmail: testUser.email,
      timestamp: new Date().toISOString(),
    };

    // Use the original duplicateCheck (which has value: null) - this should fail now
    const secondAtomicOp = kv.atomic()
      .check(duplicateCheck) // This should fail because the value changed from null to true
      .set(["attendance", testEvent.id, secondRecord.id], secondRecord)
      .set(["attendance_by_user", testUser.id, secondRecord.id], secondRecord)
      .set(["attendance_check", testEvent.id, testUser.id], true);

    const secondResult = await secondAtomicOp.commit();
    assertEquals(secondResult.ok, false); // Should fail because check value changed

    // Step 5: Get event attendance
    const eventAttendance: AttendanceRecord[] = [];
    for await (const entry of kv.list<AttendanceRecord>({ prefix: ["attendance", testEvent.id] })) {
      eventAttendance.push(entry.value);
    }
    assertEquals(eventAttendance.length, 1);
    assertEquals(eventAttendance[0].userId, testUser.id);

    // Step 6: Get user attendance history
    const userAttendance: AttendanceRecord[] = [];
    for await (const entry of kv.list<AttendanceRecord>({ prefix: ["attendance_by_user", testUser.id] })) {
      userAttendance.push(entry.value);
    }
    assertEquals(userAttendance.length, 1);
    assertEquals(userAttendance[0].eventId, testEvent.id);
  });
});

// Test member management workflow
Deno.test("Integration - Complete Member Management Workflow", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Step 1: Create members
    const member1 = TestDataFactory.createMember({
      firstName: "Alice",
      lastName: "Smith",
      studentId: "2025001"
    });
    const member2 = TestDataFactory.createMember({
      firstName: "Bob",
      lastName: "Johnson",
      studentId: "2025002"
    });

    await kv.set(["member", member1.id], member1);
    await kv.set(["member", member2.id], member2);

    // Step 2: Retrieve individual member
    const retrievedMember = await kv.get<Member>(["member", member1.id]);
    assertExists(retrievedMember.value);
    assertEquals(retrievedMember.value!.firstName, "Alice");
    assertEquals(retrievedMember.value!.studentId, "2025001");

    // Step 3: List all members (should be sorted by last name)
    const allMembers: Member[] = [];
    for await (const entry of kv.list<Member>({ prefix: ["member"] })) {
      allMembers.push(entry.value);
    }
    assertEquals(allMembers.length, 2);

    // Sort by last name as the API would
    const sortedMembers = allMembers.sort((a, b) => a.lastName.localeCompare(b.lastName));
    assertEquals(sortedMembers[0].lastName, "Johnson");
    assertEquals(sortedMembers[1].lastName, "Smith");

    // Step 4: Update member
    const updatedMember = { ...member1, firstName: "Alicia" };
    await kv.set(["member", member1.id], updatedMember);

    const updatedRetrievedMember = await kv.get<Member>(["member", member1.id]);
    assertEquals(updatedRetrievedMember.value!.firstName, "Alicia");

    // Step 5: Delete member
    await kv.delete(["member", member1.id]);
    const deletedMember = await kv.get<Member>(["member", member1.id]);
    assertEquals(deletedMember.value, null);

    // Verify only one member remains
    const remainingMembers: Member[] = [];
    for await (const entry of kv.list<Member>({ prefix: ["member"] })) {
      remainingMembers.push(entry.value);
    }
    assertEquals(remainingMembers.length, 1);
    assertEquals(remainingMembers[0].firstName, "Bob");
  });
});

// Test password change workflow
Deno.test("Integration - Password Change Workflow", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Step 1: Create user with initial password
    const testUser = TestDataFactory.createUser();
    const initialPasswordHash = await TestDataFactory.hashPassword("oldpassword123");
    const userWithInitialPassword = { ...testUser, passwordHash: initialPasswordHash };

    await kv.set(["user", testUser.id], userWithInitialPassword);
    await kv.set(["user_by_email", testUser.email], userWithInitialPassword);

    // Step 2: Verify initial password works
    const userBeforeChange = await kv.get<User>(["user", testUser.id]);
    const initialPasswordValid = await TestDataFactory.comparePassword("oldpassword123", userBeforeChange.value!.passwordHash);
    assertEquals(initialPasswordValid, true);

    // Step 3: Change password
    const newPasswordHash = await TestDataFactory.hashPassword("newpassword456");
    const userWithNewPassword = { ...testUser, passwordHash: newPasswordHash };

    // Update both primary record and email index
    await kv.atomic()
      .set(["user", testUser.id], userWithNewPassword)
      .set(["user_by_email", testUser.email], userWithNewPassword)
      .commit();

    // Step 4: Verify old password no longer works
    const userAfterChange = await kv.get<User>(["user", testUser.id]);
    const oldPasswordStillValid = await TestDataFactory.comparePassword("oldpassword123", userAfterChange.value!.passwordHash);
    assertEquals(oldPasswordStillValid, false);

    // Step 5: Verify new password works
    const newPasswordValid = await TestDataFactory.comparePassword("newpassword456", userAfterChange.value!.passwordHash);
    assertEquals(newPasswordValid, true);
  });
});

// Test email change workflow
Deno.test("Integration - Email Change Workflow", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Step 1: Create user with initial email
    const testUser = TestDataFactory.createUser({ email: "old@example.com" });
    const passwordHash = await TestDataFactory.hashPassword("password123");
    const userWithInitialEmail = { ...testUser, passwordHash };

    await kv.set(["user", testUser.id], userWithInitialEmail);
    await kv.set(["user_by_email", "old@example.com"], userWithInitialEmail);

    // Step 2: Verify initial email lookup works
    const userByOldEmail = await kv.get<User>(["user_by_email", "old@example.com"]);
    assertExists(userByOldEmail.value);
    assertEquals(userByOldEmail.value!.id, testUser.id);

    // Step 3: Change email
    const userWithNewEmail = { ...testUser, email: "new@example.com", passwordHash };

    // Atomic operation: remove old email index, add new one, update primary record
    await kv.atomic()
      .delete(["user_by_email", "old@example.com"])
      .set(["user", testUser.id], userWithNewEmail)
      .set(["user_by_email", "new@example.com"], userWithNewEmail)
      .commit();

    // Step 4: Verify old email index is gone
    const userByOldEmailAfterChange = await kv.get<User>(["user_by_email", "old@example.com"]);
    assertEquals(userByOldEmailAfterChange.value, null);

    // Step 5: Verify new email index exists
    const userByNewEmail = await kv.get<User>(["user_by_email", "new@example.com"]);
    assertExists(userByNewEmail.value);
    assertEquals(userByNewEmail.value!.id, testUser.id);
    assertEquals(userByNewEmail.value!.email, "new@example.com");

    // Step 6: Verify primary record is updated
    const userById = await kv.get<User>(["user", testUser.id]);
    assertExists(userById.value);
    assertEquals(userById.value!.email, "new@example.com");
  });
});

// Test concurrent attendance recording (race condition prevention)
Deno.test("Integration - Concurrent Attendance Recording", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Create user and event
    const testUser = TestDataFactory.createUser();
    const testEvent = TestDataFactory.createEvent();

    await kv.set(["user", testUser.id], testUser);
    await kv.set(["event", testEvent.id], testEvent);

    // Simulate concurrent attendance attempts
    const attempt1 = async () => {
      const record1: AttendanceRecord = {
        id: crypto.randomUUID(),
        eventId: testEvent.id,
        userId: testUser.id,
        userName: testUser.name,
        userEmail: testUser.email,
        timestamp: new Date().toISOString(),
      };

      const check = await kv.get(["attendance_check", testEvent.id, testUser.id]);
      const atomicOp = kv.atomic()
        .check(check)
        .set(["attendance", testEvent.id, record1.id], record1)
        .set(["attendance_by_user", testUser.id, record1.id], record1)
        .set(["attendance_check", testEvent.id, testUser.id], true);

      return await atomicOp.commit();
    };

    const attempt2 = async () => {
      const record2: AttendanceRecord = {
        id: crypto.randomUUID(),
        eventId: testEvent.id,
        userId: testUser.id,
        userName: testUser.name,
        userEmail: testUser.email,
        timestamp: new Date().toISOString(),
      };

      const check = await kv.get(["attendance_check", testEvent.id, testUser.id]);
      const atomicOp = kv.atomic()
        .check(check)
        .set(["attendance", testEvent.id, record2.id], record2)
        .set(["attendance_by_user", testUser.id, record2.id], record2)
        .set(["attendance_check", testEvent.id, testUser.id], true);

      return await atomicOp.commit();
    };

    // Run both attempts concurrently
    const results = await Promise.all([attempt1(), attempt2()]);

    // Exactly one should succeed, one should fail
    const successCount = results.filter(r => r.ok).length;
    const failureCount = results.filter(r => !r.ok).length;

    assertEquals(successCount, 1);
    assertEquals(failureCount, 1);

    // Verify only one attendance record exists
    const attendanceRecords: AttendanceRecord[] = [];
    for await (const entry of kv.list<AttendanceRecord>({ prefix: ["attendance", testEvent.id] })) {
      attendanceRecords.push(entry.value);
    }
    assertEquals(attendanceRecords.length, 1);
  });
});