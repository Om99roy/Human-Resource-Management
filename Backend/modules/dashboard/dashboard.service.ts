import { prisma } from "../../shared/prisma/prisma";

/**
 * Returns dashboard statistics for the Admin/HR overview.
 * All 5 values are fetched in a single Promise.all for performance.
 */
export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  const [
    totalEmployees,
    presentToday,
    absentToday,
    pendingLeaves,
    payrollAgg,
  ] = await Promise.all([
    // Total active employees
    prisma.employee.count({ where: { deletedAt: null, isActive: true } }),

    // Present today (status = PRESENT or LATE counts as present)
    prisma.attendance.count({
      where: {
        attendanceDate: today,
        status: { in: ["PRESENT", "HALF_DAY"] },
      },
    }),

    // Absent today
    prisma.attendance.count({
      where: {
        attendanceDate: today,
        status: "ABSENT",
      },
    }),

    // Pending leave approvals
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),

    // Monthly payroll total
    prisma.payroll.aggregate({
      _sum: { netSalary: true },
      where: { month, year },
    }),
  ]);

  return {
    totalEmployees,
    presentToday,
    absentToday,
    pendingLeaves,
    monthlyPayroll: Number(payrollAgg._sum.netSalary ?? 0),
  };
};
