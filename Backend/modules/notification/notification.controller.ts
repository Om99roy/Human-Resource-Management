import type { Request, Response } from "express";
import { getMyNotifications } from "./notification.service";

export const myNotifications = async (req: Request, res: Response) => {
  const notifications = await getMyNotifications((req as any).user.id);
  res.status(200).json({ success: true, data: notifications });
};
