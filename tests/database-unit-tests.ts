// Unit tests for database operations
import { assertEquals, assertExists } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { TestDataFactory, runTestWithDb } from "./test-utils.ts";
import type { User } from "../routes/api/auth.ts";
import type { Event } from "../routes/api/events.ts";
import type { Member } from "../routes/api/members.ts";
import type { AttendanceRecord } from "../routes/api/attendance.ts";

// Import database functions (we'll need to extract them or test through the API)
// For now, we'll test basic database operations directly

Deno.test("Database - User CRUD Operations", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;
    const testUser = TestDataFactory.createUser();

    // Create user
    await kv.set(["user", testUser.id], testUser);
    await kv.set(["user_by_email", testUser.email], testUser);

    // Read user by ID
    const userById = await kv.get<User>(["user", testUser.id]);
    assertExists(userById.value);
    assertEquals(userById.value!.id, testUser.id);
    assertEquals(userById.value!.email, testUser.email);
    assertEquals(userById.value!.name, testUser.name);

    // Read user by email
    const userByEmail = await kv.get<User>(["user_by_email", testUser.email]);
    assertExists(userByEmail.value);
    assertEquals(userByEmail.value!.id, testUser.id);

    // Update user
    const updatedUser = { ...testUser, name: "Updated Name" };
    await kv.set(["user", testUser.id], updatedUser);
    await kv.set(["user_by_email", testUser.email], updatedUser);

    const updatedUserResult = await kv.get<User>(["user", testUser.id]);
    assertEquals(updatedUserResult.value!.name, "Updated Name");

    // Delete user
    await kv.delete(["user", testUser.id]);
    await kv.delete(["user_by_email", testUser.email]);

    const deletedUserResult = await kv.get<User>(["user", testUser.id]);
    assertEquals(deletedUserResult.value, null);
  });
});

Deno.test("Database - Event CRUD Operations", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;
    const testEvent = TestDataFactory.createEvent();

    // Create event
    await kv.set(["event", testEvent.id], testEvent);

    // Read event
    const eventResult = await kv.get<Event>(["event", testEvent.id]);
    assertExists(eventResult.value);
    assertEquals(eventResult.value!.id, testEvent.id);
    assertEquals(eventResult.value!.name, testEvent.name);
    assertEquals(eventResult.value!.date, testEvent.date);

    // Update event
    const updatedEvent = { ...testEvent, name: "Updated Event Name" };
    await kv.set(["event", testEvent.id], updatedEvent);

    const updatedEventResult = await kv.get<Event>(["event", testEvent.id]);
    assertEquals(updatedEventResult.value!.name, "Updated Event Name");

    // Delete event
    await kv.delete(["event", testEvent.id]);

    const deletedEventResult = await kv.get<Event>(["event", testEvent.id]);
    assertEquals(deletedEventResult.value, null);
  });
});

Deno.test("Database - Member CRUD Operations", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;
    const testMember = TestDataFactory.createMember();

    // Create member
    await kv.set(["member", testMember.id], testMember);

    // Read member
    const memberResult = await kv.get<Member>(["member", testMember.id]);
    assertExists(memberResult.value);
    assertEquals(memberResult.value!.id, testMember.id);
    assertEquals(memberResult.value!.firstName, testMember.firstName);
    assertEquals(memberResult.value!.lastName, testMember.lastName);
    assertEquals(memberResult.value!.studentId, testMember.studentId);

    // Update member
    const updatedMember = { ...testMember, firstName: "Updated First Name" };
    await kv.set(["member", testMember.id], updatedMember);

    const updatedMemberResult = await kv.get<Member>(["member", testMember.id]);
    assertEquals(updatedMemberResult.value!.firstName, "Updated First Name");

    // Delete member
    await kv.delete(["member", testMember.id]);

    const deletedMemberResult = await kv.get<Member>(["member", testMember.id]);
    assertEquals(deletedMemberResult.value, null);
  });
});

Deno.test("Database - Attendance CRUD Operations", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;
    const testAttendance = TestDataFactory.createAttendanceRecord();

    // Create attendance record
    await kv.set(["attendance", testAttendance.eventId, testAttendance.id], testAttendance);
    await kv.set(["attendance_by_user", testAttendance.userId, testAttendance.id], testAttendance);

    // Read attendance by event
    const attendanceResult = await kv.get<AttendanceRecord>(["attendance", testAttendance.eventId, testAttendance.id]);
    assertExists(attendanceResult.value);
    assertEquals(attendanceResult.value!.id, testAttendance.id);
    assertEquals(attendanceResult.value!.eventId, testAttendance.eventId);
    assertEquals(attendanceResult.value!.userId, testAttendance.userId);

    // Read attendance by user
    const userAttendanceResult = await kv.get<AttendanceRecord>(["attendance_by_user", testAttendance.userId, testAttendance.id]);
    assertExists(userAttendanceResult.value);
    assertEquals(userAttendanceResult.value!.id, testAttendance.id);

    // Delete attendance (simulating the atomic delete operation)
    await kv.delete(["attendance", testAttendance.eventId, testAttendance.id]);
    await kv.delete(["attendance_by_user", testAttendance.userId, testAttendance.id]);

    const deletedAttendanceResult = await kv.get<AttendanceRecord>(["attendance", testAttendance.eventId, testAttendance.id]);
    assertEquals(deletedAttendanceResult.value, null);
  });
});

Deno.test("Database - Bulk Event Retrieval", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Create multiple events
    const events = [
      TestDataFactory.createEvent({ name: "Event 1", date: "2025-01-01" }),
      TestDataFactory.createEvent({ name: "Event 2", date: "2025-02-01" }),
      TestDataFactory.createEvent({ name: "Event 3", date: "2025-03-01" }),
    ];

    // Store events
    for (const event of events) {
      await kv.set(["event", event.id], event);
    }

    // Retrieve all events
    const retrievedEvents: Event[] = [];
    for await (const entry of kv.list<Event>({ prefix: ["event"] })) {
      retrievedEvents.push(entry.value);
    }

    assertEquals(retrievedEvents.length, 3);

    // Events should be sorted by date (most recent first)
    const sortedEvents = retrievedEvents.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    assertEquals(sortedEvents[0].name, "Event 3"); // Most recent date
    assertEquals(sortedEvents[1].name, "Event 2");
    assertEquals(sortedEvents[2].name, "Event 1"); // Oldest date
  });
});

Deno.test("Database - Bulk Member Retrieval", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    // Create multiple members
    const members = [
      TestDataFactory.createMember({ firstName: "Alice", lastName: "Smith" }),
      TestDataFactory.createMember({ firstName: "Bob", lastName: "Johnson" }),
      TestDataFactory.createMember({ firstName: "Charlie", lastName: "Brown" }),
    ];

    // Store members
    for (const member of members) {
      await kv.set(["member", member.id], member);
    }

    // Retrieve all members
    const retrievedMembers: Member[] = [];
    for await (const entry of kv.list<Member>({ prefix: ["member"] })) {
      retrievedMembers.push(entry.value);
    }

    assertEquals(retrievedMembers.length, 3);

    // Members should be sorted by last name
    const sortedMembers = retrievedMembers.sort((a, b) => a.lastName.localeCompare(b.lastName));

    assertEquals(sortedMembers[0].lastName, "Brown");
    assertEquals(sortedMembers[1].lastName, "Johnson");
    assertEquals(sortedMembers[2].lastName, "Smith");
  });
});

Deno.test("Database - Attendance Queries", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    const eventId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    // Create multiple attendance records for the same event
    const attendanceRecords = [
      TestDataFactory.createAttendanceRecord({ eventId, userId: crypto.randomUUID(), userName: "User 1" }),
      TestDataFactory.createAttendanceRecord({ eventId, userId: crypto.randomUUID(), userName: "User 2" }),
      TestDataFactory.createAttendanceRecord({ eventId, userId: crypto.randomUUID(), userName: "User 3" }),
    ];

    // Create attendance records for the same user at different events
    const userAttendanceRecords = [
      TestDataFactory.createAttendanceRecord({ eventId: crypto.randomUUID(), userId, userName: "Same User" }),
      TestDataFactory.createAttendanceRecord({ eventId: crypto.randomUUID(), userId, userName: "Same User" }),
    ];

    // Store all attendance records
    for (const record of [...attendanceRecords, ...userAttendanceRecords]) {
      await kv.set(["attendance", record.eventId, record.id], record);
      await kv.set(["attendance_by_user", record.userId, record.id], record);
    }

    // Query attendance for a specific event
    const eventAttendance: AttendanceRecord[] = [];
    for await (const entry of kv.list<AttendanceRecord>({ prefix: ["attendance", eventId] })) {
      eventAttendance.push(entry.value);
    }

    assertEquals(eventAttendance.length, 3);

    // Query attendance for a specific user
    const userAttendance: AttendanceRecord[] = [];
    for await (const entry of kv.list<AttendanceRecord>({ prefix: ["attendance_by_user", userId] })) {
      userAttendance.push(entry.value);
    }

    assertEquals(userAttendance.length, 2);
    assertEquals(userAttendance[0].userName, "Same User");
    assertEquals(userAttendance[1].userName, "Same User");
  });
});

Deno.test("Database - Duplicate Prevention (Attendance Check)", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    const eventId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    // First attendance record
    const firstRecord = TestDataFactory.createAttendanceRecord({ eventId, userId });
    await kv.set(["attendance", eventId, firstRecord.id], firstRecord);
    await kv.set(["attendance_by_user", userId, firstRecord.id], firstRecord);
    await kv.set(["attendance_check", eventId, userId], true); // Mark as checked in

    // Try to create a duplicate (this would be prevented by business logic)
    const _duplicateRecord = TestDataFactory.createAttendanceRecord({ eventId, userId });

    // Check if already checked in
    const checkResult = await kv.get(["attendance_check", eventId, userId]);
    assertEquals(checkResult.value, true); // Should be marked as checked in

    // In a real scenario, this duplicate would be rejected
    // Here we just verify the check mechanism works
    assertExists(checkResult.value);
  });
});

Deno.test("Database - Atomic Operations", async () => {
  await runTestWithDb(async (testDb) => {
    const kv = testDb.getKv()!;

    const userId = crypto.randomUUID();
    const newEmail = "newemail@example.com";
    const oldEmail = "oldemail@example.com";

    // Set up initial user
    const user = TestDataFactory.createUser({ id: userId, email: oldEmail });
    await kv.set(["user", userId], user);
    await kv.set(["user_by_email", oldEmail], user);

    // Simulate atomic email change operation
    const newUser = { ...user, email: newEmail };

    // This should be done atomically in real code
    const atomicOp = kv.atomic()
      .delete(["user_by_email", oldEmail]) // Remove old email index
      .set(["user", userId], newUser) // Update primary record
      .set(["user_by_email", newEmail], newUser); // Add new email index

    const result = await atomicOp.commit();
    assertEquals(result.ok, true);

    // Verify old email index is gone
    const oldEmailResult = await kv.get(["user_by_email", oldEmail]);
    assertEquals(oldEmailResult.value, null);

    // Verify new email index exists
    const newEmailResult = await kv.get(["user_by_email", newEmail]);
    assertExists(newEmailResult.value);
    assertEquals((newEmailResult.value as User).email, newEmail);

    // Verify primary record is updated
    const userResult = await kv.get(["user", userId]);
    assertExists(userResult.value);
    assertEquals((userResult.value as User).email, newEmail);
  });
});