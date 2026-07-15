import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type EmployeeCsvPayload = {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  designation?: string | null;
  role: string;
};

const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentFileDir, "..", "..", "..");
const csvDirectories = [
  path.join(workspaceRoot, "AI_HR_Attendance", "data", "output"),
  path.join(workspaceRoot, "AI_HR_Attendance", "output"),
  path.join(workspaceRoot, "AI_HR_Attendance", "output", "reports"),
];

const uniqueDirs = Array.from(new Set(csvDirectories));

const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
  const stringValue = String(value ?? "");

  if (/[,"\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const appendCsvRow = (filePath: string, headers: string[], rowValues: Array<string | number | boolean | null | undefined>) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${headers.map(escapeCsvValue).join(",")}\n`, "utf8");
  }

  const content = fs.readFileSync(filePath, "utf8");
  const marker = String(rowValues[0] ?? "");

  if (content.split(/\r?\n/).some((line) => line.includes(marker))) {
    return;
  }

  fs.appendFileSync(filePath, `${rowValues.map(escapeCsvValue).join(",")}\n`, "utf8");
};

export const persistEmployeeSignup = async (payload: EmployeeCsvPayload) => {
  const normalizedDepartment = payload.department?.trim() || "";
  const normalizedDesignation = payload.designation?.trim() || "";
  const normalizedPhone = payload.phone?.trim() || "";

  const employeeRow = [
    payload.employeeId,
    payload.firstName,
    payload.lastName,
    "Unknown",
    payload.email,
    normalizedPhone,
    normalizedDepartment,
    normalizedDesignation,
    "",
    new Date().toISOString().slice(0, 10),
    "Full-Time",
    "0",
    "Active",
  ];

  const employeeHeaders = [
    "employee_id",
    "first_name",
    "last_name",
    "gender",
    "email",
    "phone",
    "department",
    "designation",
    "manager",
    "joining_date",
    "employment_type",
    "basic_salary",
    "status",
  ];

  for (const directory of uniqueDirs) {
    appendCsvRow(path.join(directory, "employees.csv"), employeeHeaders, employeeRow);
    appendCsvRow(path.join(directory, "employee.csv"), employeeHeaders, employeeRow);
  }

  if (payload.role === "HR" || payload.role === "ADMIN") {
    const managerHeaders = ["manager", "department"];
    const managerRow = [`${payload.firstName} ${payload.lastName}`.trim(), normalizedDepartment];

    for (const directory of uniqueDirs) {
      appendCsvRow(path.join(directory, "managers.csv"), managerHeaders, managerRow);
    }
  }
};
