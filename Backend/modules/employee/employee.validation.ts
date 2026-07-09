import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().min(10).max(15).optional(),
  address: z.string().max(255).optional(),
  profilePicture: z.string().url().optional(),
});

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  role: z.enum(["ADMIN", "EMPLOYEE", "HR"]).default("EMPLOYEE"),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  role: z.enum(["ADMIN", "EMPLOYEE", "HR"]).optional(),
  isActive: z.boolean().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
