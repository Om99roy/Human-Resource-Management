import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
const router = Router();

router.get("/employees");
router.get("/employees/:id");
router.get("/employees/profile");
router.post("/employees");
router.patch("/employees/profile");
router.patch("/employees/:id");
router.delete("/employees/:id");
router.get("/dashboard/me");
export default router;

