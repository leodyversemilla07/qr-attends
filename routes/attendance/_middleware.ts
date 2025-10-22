// Attendance route middleware - requires authentication
import { define } from "../../utils.ts";
import { requireAuth } from "../../middleware/auth.ts";

export default define.middleware(requireAuth);
