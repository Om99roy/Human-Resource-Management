import { Request, Response } from "express";

export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: "auth-service",
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
