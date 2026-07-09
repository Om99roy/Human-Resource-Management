import { Router } from "express";
import * as controller from "./payroll.controller";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/role.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/payroll/me", asyncHandler(controller.myPayroll));

router.post(
  "/payroll",
  authorize("ADMIN","HR"),
  asyncHandler(controller.createPayroll)
);

router.patch(
  "/payroll/:id",
  authorize("ADMIN","HR"),
  asyncHandler(controller.updatePayroll)
);

export default router;
