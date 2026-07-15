import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { myNotifications } from "./notification.controller";

const router = Router();

router.use(authenticate);
router.get("/notifications", asyncHandler(myNotifications));

export default router;
