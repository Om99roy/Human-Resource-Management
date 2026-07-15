import type { Request, Response } from "express";
import * as payrollService from "./payroll.service";

export const myPayroll = async (req: Request, res: Response) => {
  const records = await payrollService.myPayroll((req as any).user.id);
  res.status(200).json({ success: true, data: records });
};

export const getAllPayroll = async (_req: Request, res: Response) => {
  const records = await payrollService.getAllPayroll();
  res.status(200).json({ success: true, data: records });
};

export const createPayroll = async (req: Request, res: Response) => {
  const record = await payrollService.createPayroll(req.body);
  res.status(201).json({ success: true, data: record });
};

export const updatePayroll = async (req: Request, res: Response) => {
  const record = await payrollService.updatePayroll(Number(req.params.id), req.body);
  res.status(200).json({ success: true, data: record });
};
