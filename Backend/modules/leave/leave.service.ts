import { prisma } from "../../shared/prisma/prisma";
import { LeaveStatus } from "@prisma/client";

export const applyLeave = (employeeId: string, data: any) =>
  prisma.leaveRequest.create({
    data: {
      employeeId,
      ...data,
      status: LeaveStatus.PENDING,
    },
  });

export const myLeaves = (employeeId: string) =>
  prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
  });

export const allLeaves = () =>
  prisma.leaveRequest.findMany({
    include: {
      employee: true,
    },
  });

export const updateLeaveStatus = (
  id: number,
  approvedById: string,
  status: LeaveStatus,
  adminComment?: string
) =>
  prisma.leaveRequest.update({
    where: { id },
    data: {
      status,
      approvedById,
      adminComment,
    },
  });
