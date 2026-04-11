# API Reference

## Overview

QR Attends uses Convex as its backend. All data operations are performed through Convex functions (queries and mutations).

## Base URL

```
Development: https://dazzling-anaconda-162.convex.cloud
Production:  https://your-deployment.convex.cloud
```

---

## Authentication API

### `api.officers.login`

Authenticate an officer with email and password.

**Arguments:**
```typescript
{
  email: string,
  password: string,
}
```

**Response:**
```typescript
{
  token: string,       // Raw opaque session token
  officer: {
    _id: string,
    name: string,
    email: string,
    role: string,
    lastSeen?: string,
  }
}
```

**Errors:**
- `"Invalid email or password"` - Wrong credentials
- `"Too many login attempts..."` - Rate limited

**Example:**
```typescript
const result = await loginMutation({ 
  email: "leodyver@admin.com", 
  password: "admin" 
});
const { token, officer } = result;
```

---

### `api.officers.getMe`

Get current authenticated officer.

**Arguments:**
```typescript
{
  token?: string,  // Optional, uses auth context if not provided
}
```

**Response:**
```typescript
{
  _id: string,
  name: string,
  email: string,
  role: string,
  lastSeen?: string,
}
```

---

### `api.officers.signOut`

Sign out the current officer.

**Arguments:**
```typescript
{
  token: string,
}
```

**Response:**
```typescript
"Signed out successfully"
```

---

### `api.officers.requestPasswordReset`

Request a password reset.

**Arguments:**
```typescript
{
  email: string,
}
```

**Response:**
```typescript
{
  message: string,
  resetToken?: string,  // Returned only in non-production/debug flows
}
```

**Errors:**
- `"Too many reset requests..."` - Rate limited
- `"Invalid email address"` - Invalid format

---

### `api.officers.resetPassword`

Reset password with token.

**Arguments:**
```typescript
{
  token: string,
  newPassword: string,
}
```

**Response:**
```typescript
"Password reset successfully. You can now login with your new password."
```

**Errors:**
- `"Invalid or expired reset token"`
- `"Reset token already used"`
- `"Password must be at least 8 characters"`

---

### `api.officers.getAuditLogs`

Get audit logs (Admin/President only).

**Arguments:**
```typescript
{
  token?: string,
  limit?: number,  // Default: 100
}
```

**Response:**
```typescript
[
  {
    _id: string,
    _creationTime: number,
    action: string,        // LOGIN, LOGOUT, CHECK_IN, etc.
    details?: string,
    timestamp: string,
    officerId?: string,
  },
  ...
]
```

**Errors:**
- `"Forbidden: Admin role required"`

---

## Events API

### `api.events.list`

Get all events sorted by date (newest first).

**Arguments:**
```typescript
{
  token?: string,
}
```

**Response:**
```typescript
[
  {
    _id: string,
    name: string,
    date: string,          // YYYY-MM-DD
    time: string,          // HH:MM
    location: string,
    description?: string,
    createdBy: Id<"officers"> | string, // Officer ID for new records; legacy data may contain a name
    createdAt: string,
  },
  ...
]
```

---

### `api.events.get`

Get a single event by ID.

**Arguments:**
```typescript
{
  id: Id<"events">,
  token?: string,
}
```

**Response:**
```typescript
{
  _id: string,
  name: string,
  date: string,
  time: string,
  location: string,
  description?: string,
  createdBy: Id<"officers"> | string,
  createdAt: string,
}
```

---

### `api.events.search`

Search events by name, location, or description.

**Arguments:**
```typescript
{
  token?: string,
  searchTerm?: string,
  limit?: number,  // Default: 50
}
```

**Response:**
```typescript
[
  {
    _id: string,
    name: string,
    date: string,
    time: string,
    location: string,
    ...
  },
  ...
]
```

---

### `api.events.getUpcoming`

Get the next 5 upcoming events.

**Arguments:**
```typescript
{
  token?: string,
}
```

**Response:**
```typescript
[
  {
    _id: string,
    name: string,
    date: string,
    time: string,
    location: string,
    ...
  },
  ...
]
```

---

### `api.events.getRecent`

Get the last 5 past events.

**Arguments:**
```typescript
{
  token?: string,
}
```

**Response:**
```typescript
[
  {
    _id: string,
    name: string,
    date: string,
    time: string,
    location: string,
    ...
  },
  ...
]
```

---

### `api.events.getStats`

Get event check-in statistics.

**Arguments:**
```typescript
{
  eventId: Id<"events">,
  token?: string,
}
```

**Response:**
```typescript
{
  event: { /* event object */ },
  totalCheckIns: number,
  checkInTimes: string[],      // Array of timestamps
  firstCheckIn: string | null, // Earliest check-in time
  lastCheckIn: string | null,  // Latest check-in time
}
```

---

### `api.events.create`

Create a new event.

**Arguments:**
```typescript
{
  name: string,
  date: string,      // YYYY-MM-DD
  time: string,      // HH:MM
  location: string,
  description?: string,
  token: string,
}
```

**Response:**
```typescript
Id<"events">  // The new event ID
```

**Errors:**
- `"Rate limit exceeded..."`
- `"Event name must be at least 3 characters"`
- `"Location must be at least 2 characters"`
- `"Invalid date format..."`
- `"Invalid time format..."`

---

### `api.events.update`

Update an existing event.

**Arguments:**
```typescript
{
  id: Id<"events">,
  name?: string,
  date?: string,
  time?: string,
  location?: string,
  description?: string,
  token: string,
}
```

**Response:**
`void`

**Errors:**
- `"Event not found"`
- `"Event name must be at least 3 characters"`
- `"Location must be at least 2 characters"`

---

### `api.events.remove`

Delete an event.

**Arguments:**
```typescript
{
  id: Id<"events">,
  token: string,
}
```

**Response:**
`void`

**Errors:**
- `"Event not found"`
- `"Forbidden: You can only delete events you created"`

---

## Members API

### `api.members.list`

Get all members.

**Arguments:**
```typescript
{
  token?: string,
}
```

**Response:**
```typescript
[
  {
    _id: string,
    firstName: string,
    lastName: string,
    middleInitial: string,
    studentId: string,
    yearSection: string,
    cardNo: string,
    email?: string,
  },
  ...
]
```

---

### `api.members.get`

Get a single member by ID.

**Arguments:**
```typescript
{
  id: Id<"members">,
  token?: string,
}
```

**Response:**
```typescript
{
  _id: string,
  firstName: string,
  lastName: string,
  middleInitial: string,
  studentId: string,
  yearSection: string,
  cardNo: string,
  email?: string,
}
```

---

### `api.members.getByCardNo`

Find member by card number (UUID).

**Arguments:**
```typescript
{
  cardNo: string,
}
```

**Response:**
```typescript
{
  _id: string,
  firstName: string,
  lastName: string,
  ...
}
```

Or `null` if not found.

---

### `api.members.getByStudentId`

Find member by student ID.

**Arguments:**
```typescript
{
  studentId: string,
}
```

**Response:**
```typescript
{
  _id: string,
  firstName: string,
  lastName: string,
  ...
}
```

Or `null` if not found.

---

### `api.members.search`

Search members by name, ID, card, or section.

**Arguments:**
```typescript
{
  token?: string,
  searchTerm?: string,
  limit?: number,  // Default: 100
}
```

**Response:**
```typescript
[
  {
    _id: string,
    firstName: string,
    lastName: string,
    studentId: string,
    cardNo: string,
    yearSection: string,
    ...
  },
  ...
]
```

---

### `api.members.getStats`

Get member statistics.

**Arguments:**
```typescript
{}
```

**Response:**
```typescript
{
  total: number,
  withCheckIns: number,
  neverCheckedIn: number,
  yearSections: [
    { name: string, count: number },
    ...
  ],
}
```

---

### `api.members.create`

Register a new member.

**Arguments:**
```typescript
{
  firstName: string,
  lastName: string,
  middleInitial: string,
  studentId: string,
  yearSection: string,
  cardNo: string,
  email?: string,
  token: string,
}
```

**Response:**
```typescript
Id<"members">  // The new member ID
```

**Errors:**
- `"Rate limit exceeded..."`
- `"First name must be at least 2 characters"`
- `"Last name must be at least 2 characters"`
- `"Student ID already exists"`

---

### `api.members.update`

Update a member.

**Arguments:**
```typescript
{
  id: Id<"members">,
  firstName?: string,
  lastName?: string,
  middleInitial?: string,
  studentId?: string,
  yearSection?: string,
  cardNo?: string,
  email?: string,
  token: string,
}
```

**Response:**
`void`

**Errors:**
- `"Member not found"`
- `"Student ID already exists"`

---

### `api.members.remove`

Delete a member.

**Arguments:**
```typescript
{
  id: Id<"members">,
  token: string,
}
```

**Response:**
`void`

---

### `api.members.bulkImport`

Import multiple members from CSV.

**Arguments:**
```typescript
{
  members: Array<{
    firstName: string,
    lastName: string,
    middleInitial: string,
    studentId: string,
    yearSection: string,
    cardNo: string,
    email?: string,
  }>,
  token: string,
}
```

**Response:**
```typescript
{
  success: number,   // Number of successfully imported
  failed: number,    // Number of failed imports
  errors: string[],  // Array of error messages
}
```

**Errors:**
- `"Forbidden: Only officers can import members"`
- `"Rate limit exceeded..."`

---

## Attendance API

### `api.attendance.getByEvent`

Get all attendees for an event.

**Arguments:**
```typescript
{
  eventId: Id<"events">,
  token?: string,
}
```

**Response:**
```typescript
[
  {
    _id: string,
    eventId: string,
    memberId: string,
    timestamp: string,
    member: {  // Denormalized member data
      _id: string,
      firstName: string,
      lastName: string,
      studentId: string,
      yearSection: string,
    },
  },
  ...
]
```

Sorted by timestamp (newest first).

---

### `api.attendance.getAll`

Get all attendance records.

**Arguments:**
```typescript
{
  token?: string,
}
```

**Response:**
```typescript
[
  {
    _id: string,
    eventId: string,
    memberId: string,
    timestamp: string,
    member: { /* member data */ },
    event: { /* event data */ },
  },
  ...
]
```

Sorted by timestamp (newest first).

---

### `api.attendance.getStats`

Get attendance statistics.

**Arguments:**
```typescript
{
  token?: string,
}
```

**Response:**
```typescript
{
  totalCheckIns: number,
  totalEvents: number,
  totalMembers: number,
  todayCheckIns: number,
}
```

---

### `api.attendance.getByMember`

Get all check-ins for a member.

**Arguments:**
```typescript
{
  memberId: Id<"members">,
  token?: string,
}
```

**Response:**
```typescript
[
  {
    _id: string,
    eventId: string,
    memberId: string,
    timestamp: string,
    event: { /* event data */ },
  },
  ...
]
```

Sorted by timestamp (newest first).

---

### `api.attendance.checkInByCard`

Check in a member by card number (UUID).

**Arguments:**
```typescript
{
  eventId: Id<"events">,
  cardNo: string,
  token: string,
}
```

**Response:**
```typescript
{
  status: "success",  // or "not_registered"
  attendanceId?: Id<"attendance">,
  member?: {
    firstName: string,
    lastName: string,
  },
}
```

**Success Response:**
```typescript
{
  status: "success",
  attendanceId: "abc123",
  member: {
    firstName: "John",
    lastName: "Doe",
  }
}
```

**Not Registered Response:**
```typescript
{
  status: "not_registered",
  cardNo: "uuid-here",
}
```

**Errors:**
- `"Rate limit exceeded..."`
- `"Event not found"`
- `"Already checked in"`

---

### `api.attendance.checkIn`

Manually check in a member by ID.

**Arguments:**
```typescript
{
  eventId: Id<"events">,
  memberId: Id<"members">,
  token: string,
}
```

**Response:**
```typescript
{
  attendanceId: Id<"attendance">,
  member: {
    firstName: string,
    lastName: string,
  },
}
```

**Errors:**
- `"Event not found"`
- `"Member not found"`
- `"Already checked in"`

---

## Error Codes Reference

| Error Code | Description |
|------------|-------------|
| `Unauthorized: No token provided` | No authentication token |
| `Unauthorized: Invalid session` | Invalid or expired session |
| `Unauthorized: Session expired` | Session token expired |
| `Unauthorized: Officer not found` | Officer account deleted |
| `Forbidden: Admin role required` | Insufficient permissions |
| `Forbidden: Only administrators can register new officers` | Role not authorized |
| `Forbidden: Only officers can import members` | Role not authorized |
| `Forbidden: You can only delete events you created` | Not event owner |
| `Rate limit exceeded...` | Too many requests |
| `Event not found` | Invalid event ID |
| `Member not found` | Invalid member ID |
| `Already checked in` | Duplicate check-in |
| `Not registered` | Card number not in system |
| `Invalid email address` | Malformed email |
| `Invalid date format...` | Use YYYY-MM-DD |
| `Invalid time format...` | Use HH:MM |
| `Student ID already exists` | Duplicate student ID |

---

## Rate Limits

| Action | Limit | Window |
|--------|-------|--------|
| Login | 5 | per minute |
| Password Reset Request | 3 | per hour |
| Event Creation | 50 | per minute |
| Member Creation | 50 | per minute |
| Bulk Import | 5 | per minute |
| Check-in (QR) | 100 | per minute |
| Check-in (Manual) | 100 | per minute |

---

## Data Types

### Id<T>

Convex document IDs with type safety.

```typescript
type Id<T extends TableName> = string & { __table: T };

// Examples:
Id<"events">
Id<"members">
Id<"attendance">
Id<"officers">
```

### Timestamp Format

All timestamps are ISO 8601 strings:

```typescript
"2026-01-09T10:30:00.000Z"
```

### Date Format

Event dates are stored as strings:

```typescript
"2026-01-15"  // YYYY-MM-DD
```

### Time Format

Event times are stored as strings:

```typescript
"14:30"  // HH:MM (24-hour)
```

---

## Query Persistence

The app combines Convex queries with TanStack Query caching. Only safe event metadata is persisted locally; attendee, member, attendance, and officer queries remain memory-only.

```typescript
import { queryKeys } from "@/hooks/use-queries";
import { eventKeys } from "@/hooks/use-event-details";

queryKeys.events.list();
queryKeys.events.detail(eventId);
queryKeys.events.upcoming();
queryKeys.events.recent();

// Not persisted:
eventKeys.attendees(eventId);
queryKeys.members.list();
queryKeys.officers.me;
```

---

## Offline Support

The app uses `OfflineManager` to queue check-ins when offline:

```typescript
import { OfflineManager } from "./utils/offline-manager";

// Queue a check-in (works offline)
await OfflineManager.queueCheckIn(eventId, cardNo);

// Get queued items
const queue = await OfflineManager.getQueue();

// Sync when online
for (const item of queue) {
  await checkInByCard({ eventId: item.eventId, cardNo: item.cardNo, token });
}
```

---

## Changelog

### v1.0.0
- Initial release
- Full authentication system
- Event management (CRUD)
- Member management (CRUD + bulk import)
- QR code check-in
- Manual check-in
- Offline queue support
- Reports & exports
- Audit logging
- Dark mode

---

*Last updated: April 2026*
