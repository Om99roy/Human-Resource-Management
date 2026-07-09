import { prisma } from "../../shared/prisma/prisma";
import type { UpdateProfileInput, CreateEmployeeInput } from "./employee.validation";
import { hashPassword } from "../../shared/utils/hash";
const generateEmployeeId = async () => {
  const count = await prisma.employee.count();

  return `EMP${String(count + 1).padStart(4, "0")}`;
};

export const createEmployee = async (data: CreateEmployeeInput) => {
  const employeeId = await generateEmployeeId();

  const passwordHash = await hashPassword(data.password);

  return prisma.employee.create({
    data: {
      ...data,
      employeeId,
      passwordHash,
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
      designation: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateEmployee = async (
  id: string,
  data: Partial<CreateEmployeeInput>
) => {
  const updateData: Record<string, unknown> = { ...data };

  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.employee.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      department: true,
      designation: true,
      role: true,
      updatedAt: true,
    },
  });
};

export const getProfile = async (employeeId: string) => {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      department: true,
      designation: true,
      role: true,
      profilePicture: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const updateProfile = async (
  employeeId: string,
  data: UpdateProfileInput
) => {
  return prisma.employee.update({
    where: {
      id: employeeId,
    },
    data,
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
      department: true,
      designation: true,
      role: true,
      profilePicture: true,
    },
  });
};

export const getEmployeeById = async (id: string) => {
  return prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      designation: true,
      role: true,
      profilePicture: true,
      createdAt: true,
    },
  });
};

export const getAllEmployees = async () => {
  return prisma.employee.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      department: true,
      designation: true,
      role: true,
      isActive: true,
    },
  });
};

export const deleteEmployee = async (id: string) => {
  return prisma.employee.delete({
    where: {
      id,
    },
  });
};
