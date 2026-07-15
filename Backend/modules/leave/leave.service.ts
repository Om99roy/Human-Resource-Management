import { prisma } from "../../shared/prisma/prisma";
import { LeaveStatus } from "@prisma/client";

// ── Submit leave request ──────────────────────────────────────────────────────
export const applyLeave = async (
  employeeId: string,
  data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    remarks?: string;
  }
) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (end < start) {
    throw Object.assign(new Error("endDate must be >= startDate"), { status: 400 });
  }

  return prisma.leaveRequest.create({
    data: {
      employeeId,
      leaveType: data.leaveType as any,
      startDate: start,
      endDate: end,
      remarks: data.remarks,
      status: LeaveStatus.PENDING,
    },
  });
};

// ── Own leave requests ────────────────────────────────────────────────────────
export const myLeaves = async (employeeId: string) =>
  prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: { createdAt: "desc" },
  });

// ── All leave requests (ADMIN/HR, optional status filter) ─────────────────────
export const allLeaves = async (statusFilter?: string) =>
  prisma.leaveRequest.findMany({
    where: statusFilter ? { status: statusFilter as LeaveStatus } : undefined,
    include: {
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Approve / Reject ──────────────────────────────────────────────────────────
export const updateLeaveStatus = async (
  id: number,
  approverId: string,
  status: "APPROVED" | "REJECTED",
  adminComment?: string
) => {
  // 1. Load the request
  const request = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!request) throw Object.assign(new Error("Leave request not found"), { status: 404 });

  // 2. Must be PENDING
  if (request.status !== LeaveStatus.PENDING) {
    throw Object.assign(
      new Error(`Leave request is already ${request.status}`),
      { status: 409 }
    );
  }

  // 3. Validate approver role
  const approver = await prisma.employee.findFirst({ where: { id: approverId } });
  if (!approver || (approver.role !== "ADMIN" && approver.role !== "HR")) {
    throw Object.assign(new Error("Insufficient permissions"), { status: 403 });
  }

  // 4. Overlap check on approval
  if (status === "APPROVED") {
    const overlap = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: request.employeeId,
        status: LeaveStatus.APPROVED,
        startDate: { lte: request.endDate },
        endDate: { gte: request.startDate },
        id: { not: id },
      },
    });
    if (overlap) {
      throw Object.assign(
        new Error("Overlapping approved leave period exists"),
        { status: 409 }
      );
    }
  }

  // 5. Update the record
  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status: status as LeaveStatus, approvedById: approverId, adminComment },
  });

  // 6. Notify the requesting employee
  await prisma.notification.create({
    data: {
      employeeId: request.employeeId,
      title: `Leave request ${status.toLowerCase()}`,
      message: `Your ${request.leaveType} leave request has been ${status.toLowerCase()}.`,
    },
  });

  return updated;
};
