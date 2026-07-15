import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/role.middleware";
import {
  createEmployee,
  updateEmployee,
  getProfile,
  updateProfile,
  getEmployeeById,
  getAllEmployees,
  deleteEmployee,
} from "./employee.controller";

const router = Router();

router.use(authenticate);

// List all (ADMIN or HR) — must come before /:id to avoid route shadowing
router.get("/employees", authorize("ADMIN", "HR"), asyncHandler(getAllEmployees));

// Create (ADMIN only)
router.post("/employees", authorize("ADMIN"), asyncHandler(createEmployee));

// Own profile — no extra role needed, any authenticated user
router.get("/employees/profile", asyncHandler(getProfile));
router.patch("/employees/profile", asyncHandler(updateProfile));

// By id (ADMIN or HR)
router.get("/employees/:id", authorize("ADMIN", "HR"), asyncHandler(getEmployeeById));

// Admin PATCH / DELETE
router.patch("/employees/:id", authorize("ADMIN"), asyncHandler(updateEmployee));
router.delete("/employees/:id", authorize("ADMIN"), asyncHandler(deleteEmployee));

export default router;
