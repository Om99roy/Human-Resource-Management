import type { Request, Response } from "express";
import * as employeeService from "./employee.service";

// GET /api/v1/employees — ADMIN/HR only
export const getAllEmployees = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const result = await employeeService.getAllEmployees(page, limit);
  res.status(200).json({ success: true, data: result });
};

// POST /api/v1/employees — ADMIN only
export const createEmployee = async (req: Request, res: Response) => {
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json({ success: true, data: employee });
};

// GET /api/v1/employees/profile — authenticated
export const getProfile = async (req: Request, res: Response) => {
  const employee = await employeeService.getProfile((req as any).user.id);
  if (!employee) return res.status(404).json({ success: false, error: "Employee not found" });
  res.status(200).json({ success: true, data: employee });
};

// PATCH /api/v1/employees/profile — authenticated (restricted fields)
export const updateProfile = async (req: Request, res: Response) => {
  const employee = await employeeService.updateProfile((req as any).user.id, req.body);
  res.status(200).json({ success: true, data: employee });
};

// GET /api/v1/employees/:id — ADMIN/HR only
export const getEmployeeById = async (req: Request, res: Response) => {
  const employee = await employeeService.getEmployeeById(String(req.params.id));
  res.status(200).json({ success: true, data: employee });
};

// PATCH /api/v1/employees/:id — ADMIN only
export const updateEmployee = async (req: Request, res: Response) => {
  const employee = await employeeService.updateEmployee(String(req.params.id), req.body);
  res.status(200).json({ success: true, data: employee });
};

// DELETE /api/v1/employees/:id — ADMIN only (soft-delete)
export const deleteEmployee = async (req: Request, res: Response) => {
  await employeeService.deleteEmployee(String(req.params.id));
  res.status(200).json({ success: true, message: "Employee deleted successfully" });
};
