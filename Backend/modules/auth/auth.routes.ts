import { Router } from "express";
import * as authController from "./auth.controller";
import { adminLoginController } from "./adminAuth.controller";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authRateLimiter } from "../../shared/middleware/rateLimit.middleware";

const router = Router();

// ── Existing routes (unchanged) ──────────────────────────────────────────────
router.post("/register", authRateLimiter, asyncHandler(authController.register));
router.post("/login", authRateLimiter, asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));

// ── Admin-only login gate (new feature) ──────────────────────────────────────
// Rate-limited — employees and attackers cannot brute-force this endpoint.
// Only users with role ADMIN or HR are issued a token; all others get HTTP 403.
router.post("/admin-login", authRateLimiter, asyncHandler(adminLoginController));

export default router;
