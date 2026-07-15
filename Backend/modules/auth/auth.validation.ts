import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),

  phone: z
    .string()
    .trim()
    .min(10)
    .max(15)
    .optional(),

  address: z
    .string()
    .trim()
    .max(255)
    .optional(),

  department: z
    .string()
    .trim()
    .max(100)
    .optional(),

  designation: z
    .string()
    .trim()
    .max(100)
    .optional(),

  role: z
    .enum(["ADMIN", "EMPLOYEE", "HR"])
    .default("EMPLOYEE")
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email(),

  password: z
    .string()
    .min(1, "Password is required")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
