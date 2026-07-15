import { Router } from "express";
import * as controller from "./attendance.controller";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/role.middleware";

const router = Router();

router.use(authenticate);

// Employee routes
router.post("/attendance/checkin", asyncHandler(controller.checkIn));
router.post("/attendance/checkout", asyncHandler(controller.checkOut));
router.get("/attendance/me", asyncHandler(controller.myAttendance));

// Admin / HR routes
router.get("/attendance", authorize("ADMIN", "HR"), asyncHandler(controller.allAttendance));
router.get("/attendance/:employeeId", authorize("ADMIN", "HR"), asyncHandler(controller.employeeAttendance));
router.patch("/attendance/:id", authorize("ADMIN", "HR"), asyncHandler(controller.updateAttendanceStatus));

export default router;
