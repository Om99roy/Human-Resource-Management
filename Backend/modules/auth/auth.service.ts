import { PrismaClient } from "@prisma/client";
import { RegisterInput, LoginInput } from "./auth.validation";
import { hashPassword, comparePassword } from "../../shared/utils/hash";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../shared/utils/jwt";

const prisma = new PrismaClient();

const generateEmployeeId = async () => {
  const count = await prisma.user.count();

  return `EMP${String(count + 1).padStart(4, "0")}`;
};

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: data.email,
        },
      ],
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const employeeId = await generateEmployeeId();

  const user = await prisma.user.create({
    data: {
      employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      address: data.address,
      department: data.department,
      designation: data.designation,
      role: data.role,
    },
  });

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);

  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect = await comparePassword(
    data.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("Account has been disabled");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);

  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      employeeId: user.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
