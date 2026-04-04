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
import { list as listMembers } from "../convex/members";
import { registerOfficer } from "../convex/officers/admin";
import { getAuthenticatedOfficer } from "../convex/authHelpers";

const mockGetAuthenticatedOfficer = getAuthenticatedOfficer as jest.MockedFunction<typeof getAuthenticatedOfficer>;

beforeEach(() => {
  mockGetAuthenticatedOfficer.mockReset();
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
          collect: jest.fn().mockResolvedValue(events),
        }),
      },
    } as any;

    const result = await listEvents(ctx, { token: "valid-token" });
    expect(ctx.db.query).toHaveBeenCalledWith("events");
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
