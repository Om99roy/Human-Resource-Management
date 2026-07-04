import { prisma } from "../../shared/prisma/prisma";
import { AttendanceStatus } from "@prisma/client";

export const checkIn = async (employeeId: string) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const attendance = await prisma.attendance.findUnique({
    where: {
      employeeId_attendanceDate: {
        employeeId,
        attendanceDate: today,
      },
    },
  });

  if (attendance)
    throw new Error("Already checked in today");

  return prisma.attendance.create({
    data: {
      employeeId,
      attendanceDate: today,
      checkIn: new Date(),
      status: AttendanceStatus.PRESENT,
    },
  });
};

export const checkOut = async (employeeId: string) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const attendance = await prisma.attendance.findUnique({
    where: {
      employeeId_attendanceDate: {
        employeeId,
        attendanceDate: today,
      },
    },
  });

  if (!attendance)
    throw new Error("Check in first");

  return prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOut: new Date(),
    },
  });
};

export const myAttendance = (employeeId: string) =>
  prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { attendanceDate: "desc" },
  });

export const allAttendance = () =>
  prisma.attendance.findMany({
    include: { employee: true },
  });

export const employeeAttendance = (employeeId: string) =>
  prisma.attendance.findMany({
    where: { employeeId },
  });


