import { Router } from "express";
import * as authController from "./auth.controller";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authRateLimiter } from "../../shared/middleware/rateLimit.middleware";

const router = Router();

router.post("/register", authRateLimiter, asyncHandler(authController.register));
router.post("/login", authRateLimiter, asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));

export default router;
