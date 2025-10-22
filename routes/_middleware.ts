// Root middleware - applies to all routes
import { define } from "../utils.ts";
import { authMiddleware } from "../middleware/auth.ts";

export default define.middleware(authMiddleware);
