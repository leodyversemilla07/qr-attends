// Admin route middleware - requires admin/officer role
import { define } from "../../utils.ts";
import { requireAdmin } from "../../middleware/auth.ts";

export default define.middleware(requireAdmin);
