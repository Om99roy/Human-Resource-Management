import { Router } from "express";
import * as controller from "./leave.controller";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.post("/leave", asyncHandler(controller.applyLeave));
router.get("/leave/me", asyncHandler(controller.myLeaves));
router.get("/leave", authorize("ADMIN", "HR"), asyncHandler(controller.allLeaves));
router.patch("/leave/:id", authorize("ADMIN", "HR"), asyncHandler(controller.updateLeaveStatus));

export default router;
