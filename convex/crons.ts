import { internal } from "./_generated/api";
import { cronJobs } from "convex/server";

const crons = cronJobs();

// Run periodic housekeeping to prevent auth/session/rate-limit table bloat.
crons.daily(
  "cleanup expired auth data",
  { hourUTC: 2, minuteUTC: 0 },
  internal.officers.maintenance.cleanupExpiredDataSystem,
);

export default crons;
