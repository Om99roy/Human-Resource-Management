import { prisma } from "../../shared/prisma/prisma";
import { AttendanceStatus } from "@prisma/client";

/** Returns today's date at midnight (UTC-safe for DATE columns) */
const todayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ── Check-in ──────────────────────────────────────────────────────────────────
export const checkIn = async (employeeId: string) => {
  const today = todayDate();

  // Reject future dates (guard — today is never in the future, but kept for safety)
  if (today > new Date()) {
    throw Object.assign(new Error("attendanceDate cannot be in the future"), { status: 400 });
  }

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_attendanceDate: { employeeId, attendanceDate: today } },
  });

  if (existing) {
    throw Object.assign(new Error("Attendance already recorded for this date"), { status: 409 });
  }

  return prisma.attendance.create({
    data: {
      employeeId,
      attendanceDate: today,
      checkIn: new Date(),
      status: AttendanceStatus.PRESENT,
    },
  });
};

// ── Check-out ─────────────────────────────────────────────────────────────────
export const checkOut = async (employeeId: string) => {
  const today = todayDate();

  const record = await prisma.attendance.findUnique({
    where: { employeeId_attendanceDate: { employeeId, attendanceDate: today } },
  });

  if (!record) {
    throw Object.assign(new Error("No check-in found for today"), { status: 404 });
  }

  const now = new Date();

  // Enforce checkOut >= checkIn
  if (record.checkIn && now < record.checkIn) {
    throw Object.assign(new Error("checkOut must be >= checkIn"), { status: 400 });
  }

  return prisma.attendance.update({
    where: { id: record.id },
    data: { checkOut: now },
  });
};

// ── Own attendance records ────────────────────────────────────────────────────
export const myAttendance = async (employeeId: string) =>
  prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { attendanceDate: "desc" },
  });

// ── All records (ADMIN/HR) with optional filters ──────────────────────────────
export const allAttendance = async (filters: {
  employeeId?: string;
  from?: string;
  to?: string;
}) => {
  const where: Record<string, unknown> = {};
  if (filters.employeeId) where.employeeId = filters.employeeId;
  if (filters.from || filters.to) {
    where.attendanceDate = {
      ...(filters.from && { gte: new Date(filters.from) }),
      ...(filters.to && { lte: new Date(filters.to) }),
    };
  }
  return prisma.attendance.findMany({
    where,
    include: { employee: { select: { firstName: true, lastName: true, department: true } } },
    orderBy: { attendanceDate: "desc" },
  });
};

// ── Attendance for a specific employee (ADMIN/HR) ────────────────────────────
export const employeeAttendance = async (employeeId: string) =>
  prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { attendanceDate: "desc" },
  });

// ── Admin override status ────────────────────────────────────────────────────
export const updateAttendanceStatus = async (
  id: number,
  status: AttendanceStatus
) => {
  const record = await prisma.attendance.findUnique({ where: { id } });
  if (!record) throw Object.assign(new Error("Attendance record not found"), { status: 404 });

  return prisma.attendance.update({
    where: { id },
    data: { status },
  });
};
