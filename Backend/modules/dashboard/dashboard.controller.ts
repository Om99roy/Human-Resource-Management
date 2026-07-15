import type { Request, Response } from "express";
import { getDashboardStats } from "./dashboard.service";

export const dashboardStats = async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  res.status(200).json({ success: true, data: stats });
};
