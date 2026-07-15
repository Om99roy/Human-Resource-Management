import { prisma } from "../../shared/prisma/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// ── Own payroll records ───────────────────────────────────────────────────────
export const myPayroll = async (employeeId: string) =>
  prisma.payroll.findMany({
    where: { employeeId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

// ── All payroll records (ADMIN/HR) ────────────────────────────────────────────
export const getAllPayroll = async () =>
  prisma.payroll.findMany({
    include: {
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

// ── Create payroll record ─────────────────────────────────────────────────────
export const createPayroll = async (data: {
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  bonus?: number;
  deductions?: number;
}) => {
  if (data.basicSalary <= 0) {
    throw Object.assign(new Error("basicSalary must be greater than 0"), { status: 400 });
  }

  const bonus = data.bonus ?? 0;
  const deductions = data.deductions ?? 0;
  const netSalary = data.basicSalary + bonus - deductions;

  // Check uniqueness (employeeId, month, year)
  const existing = await prisma.payroll.findFirst({
    where: { employeeId: data.employeeId, month: data.month, year: data.year },
  });
  if (existing) {
    throw Object.assign(
      new Error("Payroll record already exists for this employee, month, and year"),
      { status: 409 }
    );
  }

  return prisma.payroll.create({
    data: {
      employeeId: data.employeeId,
      month: data.month,
      year: data.year,
      basicSalary: new Decimal(data.basicSalary),
      bonus: new Decimal(bonus),
      deductions: new Decimal(deductions),
      netSalary: new Decimal(netSalary),
    },
  });
};

// ── Update payroll record (recomputes netSalary) ──────────────────────────────
export const updatePayroll = async (
  id: number,
  data: {
    basicSalary?: number;
    bonus?: number;
    deductions?: number;
  }
) => {
  const existing = await prisma.payroll.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Payroll record not found"), { status: 404 });

  const basicSalary = data.basicSalary ?? Number(existing.basicSalary);
  const bonus = data.bonus ?? Number(existing.bonus);
  const deductions = data.deductions ?? Number(existing.deductions);

  if (basicSalary <= 0) {
    throw Object.assign(new Error("basicSalary must be greater than 0"), { status: 400 });
  }

  const netSalary = basicSalary + bonus - deductions;

  return prisma.payroll.update({
    where: { id },
    data: {
      basicSalary: new Decimal(basicSalary),
      bonus: new Decimal(bonus),
      deductions: new Decimal(deductions),
      netSalary: new Decimal(netSalary),
    },
  });
};
