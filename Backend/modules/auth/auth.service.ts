import { PrismaClient } from "@prisma/client";
import { RegisterInput, LoginInput } from "./auth.validation";
import { hashPassword, comparePassword } from "../../shared/utils/hash";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils/jwt";
import { prisma } from "../../shared/prisma/prisma";
import jwt  from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import type { AppJwtPayload } from "../../shared/types/jwt.types";

const generateEmployeeId = async () => {
  const count = await prisma.employee.count();

  return `EMP${String(count + 1).padStart(4, "0")}`;
};

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.employee.findFirst({
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

  const user = await prisma.employee.create({
    data: {
      employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: hashedPassword,
      phone: data.phone,
      address: data.address,
      department: data.department,
      designation: data.designation,
      role: data.role,
    },
  });

  const payload: AppJwtPayload = {
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
  await sendVerificationEmail(user.id, user.email);
  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.employee.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect = await comparePassword(
    data.password,
    user.passwordHash
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    throw new Error("Account has been disabled");
  }
  if (!user.isVerified) {
  throw new Error("Please verify your email");
  }
  const payload: AppJwtPayload = {
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

export const rotateRefreshToken = async (oldToken: string) => {
  try {
    const payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!) as AppJwtPayload;

    const storedToken = await prisma.refreshToken.findFirst({
      where: { token: oldToken },
    });

    if (!storedToken) {
      throw new Error("Refresh token not found");
    }
    if (storedToken.expiresAt < new Date()) {
  	throw new Error("Refresh token expired");
     }
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const newPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    const newAccessToken = generateAccessToken(newPayload);

    const newRefreshToken = generateRefreshToken(newPayload);
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        employeeId: payload.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { newAccessToken, newRefreshToken };
  } catch (err) {
    console.error(err);
    throw new Error("Invalid refresh token");
  }
};

export const logout = async (refreshToken: string) => {
  const token = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
  });

  if (!token) {
    throw new Error("Token not found");
  }

  await prisma.refreshToken.delete({
    where: { id: token.id },
  });

  return true;
};

export const sendVerificationEmail = async (employeeId: string, email: string) => {
  const token = crypto.randomUUID();

  await prisma.emailVerification.create({
    data: {
      employeeId,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), 
    },
  });

  console.log(`Verify Email: ${process.env.CLIENT_URL}/verify/${token}`);

  return true;
};

export const verifyEmail = async (token: string) => {
  const record = await prisma.emailVerification.findFirst({
    where: { token },
  });

  if (!record) throw new Error("Invalid token");

  if (record.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  await prisma.employee.update({
    where: { id: record.employeeId },
    data: { isVerified: true },
  });

  await prisma.emailVerification.delete({
    where: { id: record.id },
  });

  return true;
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.employee.findUnique({
    where: { email },
  });

  if (!user) return true; 

  const token = crypto.randomUUID();

  await prisma.emailVerification.create({
    data: {
      employeeId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), 
    },
  });

  console.log(`Reset Password: ${process.env.CLIENT_URL}/reset/${token}`);

  return true;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const record = await prisma.emailVerification.findFirst({
    where: { token },
  });

  if (!record) throw new Error("Invalid token");

  if (record.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  const hashed = await hashPassword(newPassword);

  await prisma.employee.update({
    where: { id: record.employeeId },
    data: { passwordHash: hashed },
  });

  await prisma.emailVerification.delete({
    where: { id: record.id },
  });

  return true;
};
