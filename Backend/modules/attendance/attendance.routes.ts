import { Router } from "express";
import * as controller from "./attendance.controller";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/role.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/attendance/check-in", asyncHandler(controller.checkIn));
router.post("/attendance/check-out", asyncHandler(controller.checkOut));
router.get("/attendance/me", asyncHandler(controller.myAttendance));

router.get(
  "/attendance",
  authorize("ADMIN","HR"),
  asyncHandler(controller.allAttendance)
);

router.get(
  "/attendance/:employeeId",
  authorize("ADMIN","HR"),
  asyncHandler(controller.employeeAttendance)
);

export default router;
