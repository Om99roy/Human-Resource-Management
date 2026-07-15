import type { Request, Response } from "express";
import { z } from "zod";
import { adminLogin } from "./adminAuth.service";

const adminLoginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  // selectedRole is used on the frontend tab only — backend always re-verifies from DB
  selectedRole: z.enum(["ADMIN", "HR"]).optional(),
});

export const adminLoginController = async (req: Request, res: Response) => {
  const parsed = adminLoginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const result = await adminLogin(parsed.data.email, parsed.data.password);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";

    // Distinguish access-denied (403) from bad credentials (401)
    if (message === "ACCESS_DENIED") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Admin and HR Managers can access this dashboard.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
};
