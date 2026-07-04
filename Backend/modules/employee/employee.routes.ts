import { Router } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { authorize } from "../../shared/middleware/role.middleware";

import { createEmployee, updateEmployee, getProfile, updateProfile, getEmployeeById, getAllEmployees, deleteEmployee } from "./employee.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/employees",
  authorize("ADMIN"),
  asyncHandler(getAllEmployees)
);

router.post(
  "/employees",
  authorize("ADMIN"),
  asyncHandler(createEmployee)
);

router.get(
  "/employees/profile",
  asyncHandler(getProfile)
);

router.patch(
  "/employees/profile",
  asyncHandler(updateProfile)
);

router.get(
  "/employees/:id",
  authorize("ADMIN"),
  asyncHandler(getEmployeeById)
);

router.patch(
  "/employees/:id",
  authorize("ADMIN"),
  asyncHandler(updateEmployee)
);

router.delete(
  "/employees/:id",
  authorize("ADMIN"),
  asyncHandler(deleteEmployee)
);

export default router;
