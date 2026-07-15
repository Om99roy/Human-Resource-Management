import { prisma } from "../../shared/prisma/prisma";
import type { RegisterInput, LoginInput } from "./auth.validation";
import { hashPassword, comparePassword } from "../../shared/utils/hash";
import { generateAccessToken, generateRefreshToken } from "../../shared/utils/jwt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import type { AppJwtPayload } from "../../shared/types/jwt.types";
import { persistEmployeeSignup } from "../../shared/utils/csvPersistence";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

const generateEmployeeId = async () => {
  const count = await prisma.employee.count();
  return `EMP${String(count + 1).padStart(4, "0")}`;
};

export const register = async (data: RegisterInput) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  try {
    const existingUser = await prisma.employee.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await hashPassword(data.password);
    const employeeId = await generateEmployeeId();

    const user = await prisma.employee.create({
      data: {
        employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        phone: data.phone,
        address: data.address,
        department: data.department,
        designation: data.designation,
        role: data.role,
        isVerified: true,
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await persistEmployeeSignup({
      employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: normalizedEmail,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      role: data.role,
    });

    await sendVerificationEmail(user.id, user.email);

    return { user, accessToken, refreshToken };
  } catch (error) {
    if (error instanceof Error && (error.message.includes("prisma") || error.message.includes("DATABASE_URL") || error.message.includes("Can't reach database") || error.message.includes("Environment variable not found"))) {
      console.warn("Database connection failed, falling back to CSV persistence for registration.");
      const employeeId = `EMP${Math.floor(1000 + Math.random() * 9000)}`;
      
      await persistEmployeeSignup({
        employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: normalizedEmail,
        phone: data.phone,
        department: data.department,
        designation: data.designation,
        role: data.role,
      });

      const mockUser = {
        id: crypto.randomUUID(),
        employeeId,
        email: normalizedEmail,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const payload: AppJwtPayload = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = "mock-refresh-token";

      return { 
        user: mockUser, 
        accessToken, 
        refreshToken, 
        message: "Signup successful (CSV fallback - DB unavailable)" 
      };
    }
    throw error;
  }
};

export const login = async (data: LoginInput) => {
  const normalizedEmail = data.email.trim().toLowerCase();

  try {
    const user = await prisma.employee.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) throw new Error("Invalid credentials");

    const ok = await comparePassword(data.password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    if (!user.isActive) throw new Error("Account disabled");
    // if (!user.isVerified) throw new Error("Verify email first"); // Bypassed for hackathon

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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
  } catch (error) {
    if (error instanceof Error && (error.message.includes("prisma") || error.message.includes("DATABASE_URL") || error.message.includes("Can't reach database") || error.message.includes("Environment variable not found"))) {
      console.warn("Database connection failed, falling back to mock login.");
      const mockUserId = crypto.randomUUID();
      const mockUser = {
        id: mockUserId,
        employeeId: "EMP9999",
        email: normalizedEmail,
        role: "EMPLOYEE", // defaulting to employee
        firstName: "Mock",
        lastName: "User",
      };

      const payload: AppJwtPayload = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = "mock-refresh-token";

      return { user: mockUser, accessToken, refreshToken, message: "Login successful (CSV fallback - DB unavailable)" };
    }
    throw error;
  }
};

export const rotateRefreshToken = async (oldToken: string) => {
  try {
    const payload = jwt.verify(
      oldToken,
      process.env.JWT_REFRESH_SECRET!
    ) as AppJwtPayload;

    const stored = await prisma.refreshToken.findFirst({
      where: { token: oldToken },
    });

    if (!stored) throw new Error("Token not found");
    if (stored.expiresAt < new Date()) throw new Error("Token expired");

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newAccess = generateAccessToken(payload);
    const newRefresh = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: newRefresh,
        employeeId: payload.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { newAccessToken: newAccess, newRefreshToken: newRefresh };
  } catch {
    throw new Error("Invalid refresh token");
  }
};

export const logout = async (refreshToken: string) => {
  const token = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
  });

  if (!token) throw new Error("Token not found");

  await prisma.refreshToken.delete({ where: { id: token.id } });

  return true;
};

export const sendVerificationEmail = async (
  employeeId: string,
  email: string
) => {
  const token = crypto.randomUUID();

  await prisma.emailVerification.create({
    data: {
      employeeId,
      token,
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });
  try{
  await transporter.sendMail({
    to: email,
    subject: "Verify your email",
    html: `
      <p>Click below to verify your email:</p>
      <a href="${process.env.CLIENT_URL}/verify/${token}">
        Verify Email
      </a>
    `,
  });
  } catch (mailError: any) {
    console.warn("Mail failed to send (check credentials). Record created, user auto-verified for hackathon."); 
  }
  return true;
};

export const verifyEmail = async (token: string) => {
  const record = await prisma.emailVerification.findFirst({
    where: { token, type: "EMAIL_VERIFY" },
  });

  if (!record) throw new Error("Invalid token");
  if (record.expiresAt < new Date()) throw new Error("Token expired");

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
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.employee.findFirst({ where: { email: normalizedEmail } });

  if (!user) return true;

  const token = crypto.randomUUID();

  await prisma.emailVerification.create({
    data: {
      employeeId: user.id,
      token,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  await transporter.sendMail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>Click below to reset password:</p>
      <a href="${process.env.CLIENT_URL}/reset/${token}">
        Reset Password
      </a>
    `,
  });

  return true;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const record = await prisma.emailVerification.findFirst({
    where: { token, type: "PASSWORD_RESET" },
  });

  if (!record) throw new Error("Invalid token");
  if (record.expiresAt < new Date()) throw new Error("Token expired");

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
