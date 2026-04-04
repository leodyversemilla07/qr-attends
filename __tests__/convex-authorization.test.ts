/**
 * @jest-environment node
 */

jest.mock('../convex/authHelpers', () => ({
  getAuthenticatedOfficer: jest.fn(),
  logAuditEvent: jest.fn(),
  validatePasswordStrength: jest.fn(() => ({ valid: true, errors: [] })),
  checkRateLimit: jest.fn(async () => true),
}));

import { list as listEvents } from "../convex/events";
import { create as createEvent, remove as removeEvent } from "../convex/events";
import { list as listMembers } from "../convex/members";
import { registerOfficer } from "../convex/officers/admin";
import { getAuthenticatedOfficer, logAuditEvent } from "../convex/authHelpers";

const mockGetAuthenticatedOfficer = getAuthenticatedOfficer as jest.MockedFunction<typeof getAuthenticatedOfficer>;
const mockLogAuditEvent = logAuditEvent as jest.MockedFunction<typeof logAuditEvent>;

beforeEach(() => {
  mockGetAuthenticatedOfficer.mockReset();
  mockLogAuditEvent.mockReset();
});

describe("Convex Read Queries", () => {
  it("rejects events.list when authentication fails", async () => {
    mockGetAuthenticatedOfficer.mockRejectedValueOnce(new Error("Unauthorized: No token provided"));
    await expect(listEvents({} as any, { token: undefined })).rejects.toThrow("Unauthorized");
    expect(mockGetAuthenticatedOfficer).toHaveBeenCalled();
  });

  it("returns events when authentication succeeds", async () => {
    mockGetAuthenticatedOfficer.mockResolvedValue({
      _id: "officer-1",
      name: "Test",
      email: "test@example.com",
      role: "Officer",
    } as any);

    const events = [
      { _id: "future", name: "Future", date: "2099-01-01" },
      { _id: "past", name: "Past", date: "2000-01-01" },
    ];

    const ctx = {
      db: {
        query: jest.fn().mockReturnValue({
          withIndex: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              collect: jest.fn().mockResolvedValue(events),
            }),
          }),
        }),
      },
    } as any;

    const result = await listEvents(ctx, { token: "valid-token" });
    expect(ctx.db.query).toHaveBeenCalledWith("events");
    expect(ctx.db.query().withIndex).toHaveBeenCalledWith("by_date");
    expect(result.map((event: any) => event._id)).toEqual(["future", "past"]);
  });

  it("rejects members.list when authentication fails", async () => {
    mockGetAuthenticatedOfficer.mockRejectedValueOnce(new Error("Unauthorized: No token provided"));
    await expect(listMembers({} as any, { token: undefined })).rejects.toThrow("Unauthorized");
    expect(mockGetAuthenticatedOfficer).toHaveBeenCalled();
  });

  it("returns members when authentication succeeds", async () => {
    mockGetAuthenticatedOfficer.mockResolvedValue({
      _id: "officer-1",
      name: "Test",
      email: "test@example.com",
      role: "Officer",
    } as any);

    const members = [
      { _id: "m1", firstName: "A", lastName: "Z" },
      { _id: "m2", firstName: "B", lastName: "Y" },
    ];

    const ctx = {
      db: {
        query: jest.fn().mockReturnValue({
          collect: jest.fn().mockResolvedValue(members),
        }),
      },
    } as any;

    const result = await listMembers(ctx, { token: "valid-token" });
    expect(ctx.db.query).toHaveBeenCalledWith("members");
    expect(result).toEqual(members);
  });
});

describe("Convex Admin Guards", () => {
  it("prevents officer registration when requester lacks admin role", async () => {
    mockGetAuthenticatedOfficer.mockResolvedValue({
      _id: "officer-1",
      name: "Regular",
      email: "officer@example.com",
      role: "Officer",
    } as any);

    await expect(
      registerOfficer({} as any, {
        name: "New Officer",
        email: "new@org.com",
        password: "ValidPass1!",
        role: "Officer",
        token: "valid-token",
      })
    ).rejects.toThrow("Forbidden: Only administrators can register new officers");
    expect(mockGetAuthenticatedOfficer).toHaveBeenCalled();
  });
});

describe("Convex Event Ownership", () => {
  it("stores the creating officer id on new events", async () => {
    mockGetAuthenticatedOfficer.mockResolvedValue({
      _id: "officer-123",
      name: "Creator",
      email: "creator@example.com",
      role: "Officer",
    } as any);

    const insert = jest.fn().mockResolvedValue("event-1");

    const ctx = {
      db: {
        insert,
      },
    } as any;

    await createEvent(ctx, {
      name: "Assembly",
      date: "2026-06-01",
      time: "09:00",
      location: "Hall A",
      description: "Quarterly assembly",
      token: "valid-token",
    });

    expect(insert).toHaveBeenCalledWith("events", expect.objectContaining({
      createdBy: "officer-123",
    }));
  });

  it("allows deleting legacy events owned by the officer name", async () => {
    mockGetAuthenticatedOfficer.mockResolvedValue({
      _id: "officer-123",
      name: "Legacy Owner",
      email: "legacy@example.com",
      role: "Officer",
    } as any);

    const deleteMock = jest.fn().mockResolvedValue(undefined);

    const ctx = {
      db: {
        get: jest.fn().mockResolvedValue({
          _id: "event-1",
          name: "Legacy Event",
          createdBy: "Legacy Owner",
        }),
        delete: deleteMock,
      },
    } as any;

    await removeEvent(ctx, { id: "event-1" as any, token: "valid-token" });

    expect(deleteMock).toHaveBeenCalledWith("event-1");
  });

  it("rejects deleting events owned by another officer id", async () => {
    mockGetAuthenticatedOfficer.mockResolvedValue({
      _id: "officer-123",
      name: "Current Officer",
      email: "current@example.com",
      role: "Officer",
    } as any);

    const ctx = {
      db: {
        get: jest.fn().mockResolvedValue({
          _id: "event-1",
          name: "Protected Event",
          createdBy: "officer-999",
        }),
      },
    } as any;

    await expect(
      removeEvent(ctx, { id: "event-1" as any, token: "valid-token" })
    ).rejects.toThrow("Forbidden: You can only delete events you created");
  });
});
