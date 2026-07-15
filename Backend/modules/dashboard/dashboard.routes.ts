import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/role.middleware";
import { dashboardStats } from "./dashboard.controller";

const router = Router();

router.use(authenticate);
router.get("/admin/dashboard", authorize("ADMIN", "HR"), asyncHandler(dashboardStats));

export default router;
