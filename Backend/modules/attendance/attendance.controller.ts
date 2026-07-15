import type { Request, Response } from "express";
import * as attendanceService from "./attendance.service";
import { AttendanceStatus } from "@prisma/client";

export const checkIn = async (req: Request, res: Response) => {
  const record = await attendanceService.checkIn((req as any).user.id);
  res.status(201).json({ success: true, data: record });
};

export const checkOut = async (req: Request, res: Response) => {
  const record = await attendanceService.checkOut((req as any).user.id);
  res.status(200).json({ success: true, data: record });
};

export const myAttendance = async (req: Request, res: Response) => {
  const records = await attendanceService.myAttendance((req as any).user.id);
  res.status(200).json({ success: true, data: records });
};

export const allAttendance = async (req: Request, res: Response) => {
  const { employeeId, from, to } = req.query as Record<string, string | undefined>;
  const records = await attendanceService.allAttendance({ employeeId, from, to });
  res.status(200).json({ success: true, data: records });
};

export const employeeAttendance = async (req: Request, res: Response) => {
  const records = await attendanceService.employeeAttendance(String(req.params.employeeId));
  res.status(200).json({ success: true, data: records });
};

export const updateAttendanceStatus = async (req: Request, res: Response) => {
  const { status } = req.body as { status: AttendanceStatus };
  if (!Object.values(AttendanceStatus).includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status value" });
  }
  const record = await attendanceService.updateAttendanceStatus(
    Number(req.params.id),
    status
  );
  res.status(200).json({ success: true, data: record });
};
