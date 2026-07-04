import type { Request, Response } from "express";
import * as service from "./payroll.service";

export const createPayroll = async (req: Request, res: Response) => {
  res.json(await service.createPayroll(req.body));
};

export const updatePayroll = async (req: Request, res: Response) => {
  res.json(await service.updatePayroll(Number(req.params.id), req.body));
};

export const myPayroll = async (req: Request, res: Response) => {
  res.json(await service.myPayroll(req.user.id));
};
