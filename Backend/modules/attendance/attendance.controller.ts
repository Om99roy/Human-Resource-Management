import type { Request, Response } from "express";
import * as service from "./attendance.service";

export const checkIn = async (req: Request, res: Response) => {
  res.json(await service.checkIn(req.user.id));
};

export const checkOut = async (req: Request, res: Response) => {
  res.json(await service.checkOut(req.user.id));
};

export const myAttendance = async (req: Request, res: Response) => {
  res.json(await service.myAttendance(req.user.id));
};

export const allAttendance = async (_req: Request, res: Response) => {
  res.json(await service.allAttendance());
};

export const employeeAttendance = async (req: Request<{employeeId: string}>, res: Response) => {
  res.json(await service.employeeAttendance(req.params.employeeId!));
};
