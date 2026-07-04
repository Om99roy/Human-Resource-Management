import { prisma } from "../../shared/prisma/prisma";

export const createPayroll = (data: any) =>
  prisma.payroll.create({ data });

export const updatePayroll = (id: number, data: any) =>
  prisma.payroll.update({
    where: { id },
    data,
  });

export const myPayroll = (employeeId: string) =>
  prisma.payroll.findMany({
    where: { employeeId },
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
  });
