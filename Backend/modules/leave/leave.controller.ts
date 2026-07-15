import type { Request, Response } from "express";
import * as leaveService from "./leave.service";

export const applyLeave = async (req: Request, res: Response) => {
  const leave = await leaveService.applyLeave((req as any).user.id, req.body);
  res.status(201).json({ success: true, data: leave });
};

export const myLeaves = async (req: Request, res: Response) => {
  const leaves = await leaveService.myLeaves((req as any).user.id);
  res.status(200).json({ success: true, data: leaves });
};

export const allLeaves = async (req: Request, res: Response) => {
  const leaves = await leaveService.allLeaves(req.query.status as string | undefined);
  res.status(200).json({ success: true, data: leaves });
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  const { status, adminComment } = req.body as {
    status: "APPROVED" | "REJECTED";
    adminComment?: string;
  };
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ success: false, error: "status must be APPROVED or REJECTED" });
  }
  const updated = await leaveService.updateLeaveStatus(
    Number(req.params.id),
    (req as any).user.id,
    status,
    adminComment
  );
  res.status(200).json({ success: true, data: updated });
};
