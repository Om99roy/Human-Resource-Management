import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AppJwtPayload } from "../types/jwt.types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Try cookie first (httpOnly cookie strategy), then Authorization header
  const token =
    req.cookies?.accessToken ?? req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as AppJwtPayload;

    (req as any).user = decoded;

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Alias for routes that import `authenticate`
export const authenticate = authMiddleware;
