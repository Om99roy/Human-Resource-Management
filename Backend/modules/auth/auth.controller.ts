import { Request, Response } from "express";
import * as authService from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validation";

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  const result = await authService.register(parsed.data);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  const result = await authService.login(parsed.data);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token required",
    });
  }

  const result = await authService.rotateRefreshToken(refreshToken);

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token required",
    });
  }

  await authService.logout(refreshToken);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
