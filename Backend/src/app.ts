import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";

import authRoutes from "../modules/auth/auth.routes";
import employeeRoutes from "../modules/employee/employee.routes";
import attendanceRoutes from "../modules/attendance/attendance.routes";
import leaveRoutes from "../modules/leave/leave.routes";
import payrollRoutes from "../modules/payroll/payroll.routes";
import notificationRoutes from "../modules/notification/notification.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import { errorMiddleware } from "../shared/middleware/error.middleware";

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(morgan("dev"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", employeeRoutes);
app.use("/api/v1", attendanceRoutes);
app.use("/api/v1", leaveRoutes);
app.use("/api/v1", payrollRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", dashboardRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ── Error & 404 ───────────────────────────────────────────────────────────────
app.use(errorMiddleware);
app.use("/{*any}", (_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
