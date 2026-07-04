import type { Request, Response } from "express";
import * as employeeService from "./employee.service";
import type { CreateEmployeeInput, UpdateProfileInput, UpdateEmployeeInput } from "./employee.validation";

export const getProfile = async (req: Request, res: Response) => {
  const employee = await employeeService.getProfile(req.user.id);

  res.status(200).json(employee);
};

export const updateProfile = async (req: Request, res: Response) => {
  const employee = await employeeService.updateProfile(
    req.user.id,
    req.body
  );

  res.status(200).json(employee);
};
export const createEmployee = async (
  req: Request<{}, {}, CreateEmployeeInput>,
  res: Response
) => {
  const employee = await employeeService.createEmployee(req.body);

  res.status(201).json(employee);
};

export const updateEmployee = async (
  req: Request<{ id: string }, {}, UpdateEmployeeInput>,
  res: Response
) => {
  const employee = await employeeService.updateEmployee(
    req.params.id,
    req.body
  );

  res.status(200).json(employee);
};


export const getEmployeeById = async (req: Request<{id: string}>, res: Response) => {
  const employee = await employeeService.getEmployeeById(req.params.id);

  res.status(200).json(employee);
};

export const getAllEmployees = async (_req: Request, res: Response) => {
  const employees = await employeeService.getAllEmployees();

  res.status(200).json(employees);
};

export const deleteEmployee = async (req: Request<{id: string}>, res: Response) => {
  await employeeService.deleteEmployee(req.params.id);

  res.status(200).json({
    message: "Employee deleted successfully",
  });
};


