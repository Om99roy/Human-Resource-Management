"""
analytics.py
Data-access layer + LangChain tools for HR Copilot.

All 7 datasets are loaded once at import time from output/.
Every @tool function is defensive: it checks that the columns it needs
actually exist before touching them, and returns a structured error dict
instead of raising, so a bad column name degrades gracefully instead of
crashing the agent loop.
"""

from __future__ import annotations

import datetime as dt
from pathlib import Path
from typing import Optional

import pandas as pd
from langchain.tools import tool

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
REQUIRED_FILES = [
    "attendance.csv",
    "departments.csv",
    "employees.csv",
    "holidays.csv",
    "leave_requests.csv",
    "managers.csv",
    "payroll.csv",
]

DATA_DIR_CANDIDATES = [
    BASE_DIR / "output",
    BASE_DIR / "data" / "output",
]

DATA_DIR = next(
    (path for path in DATA_DIR_CANDIDATES if path.exists() and all((path / f).exists() for f in REQUIRED_FILES)),
    None,
)

if DATA_DIR is None:
    DATA_DIR = BASE_DIR / "output"

REPORTS_DIR = DATA_DIR / "reports"      # generated Excel exports land here
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def _load_csv(filename: str) -> pd.DataFrame:
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(
            f"Expected dataset '{filename}' at {path}. "
            f"Make sure the output/ folder sits next to analytics.py "
            f"and contains all 7 CSVs."
        )
    return pd.read_csv(path)


# Fail fast and clearly at import time if neither expected dataset folder
# contains the full CSV set, rather than failing deep inside a tool call later.
_missing = [f for f in REQUIRED_FILES if not (DATA_DIR / f).exists()]
if _missing:
    raise FileNotFoundError(
        f"Missing dataset file(s) in {DATA_DIR}: {_missing}. "
        f"Expected all of {REQUIRED_FILES}. Checked: {[str(path) for path in DATA_DIR_CANDIDATES]}."
    )

attendance = _load_csv("attendance.csv")
departments = _load_csv("departments.csv")
employees = _load_csv("employees.csv")
holidays = _load_csv("holidays.csv")
leave_requests = _load_csv("leave_requests.csv")
managers = _load_csv("managers.csv")
payroll = _load_csv("payroll.csv")


def _has_cols(df: pd.DataFrame, cols: list[str]) -> list[str]:
    """Return the subset of `cols` that are NOT present in df."""
    return [c for c in cols if c not in df.columns]


# ---------------------------------------------------------------------------
# Tool: per-employee attendance summary
# ---------------------------------------------------------------------------

@tool
def get_emps_summary(emp_id: str) -> dict:
    """
    Get attendance statistics for a specific employee: present/absent/late/
    leave/half-day counts and an attendance rate.
    Input must be an employee ID string (e.g. "E1001").
    """
    missing = _has_cols(attendance, ["employee_id", "status"])
    if missing:
        return {"error": f"attendance.csv is missing column(s): {missing}"}

    emp_data = attendance[attendance["employee_id"] == emp_id]
    if emp_data.empty:
        return {"error": f"No attendance records found for employee_id='{emp_id}'"}

    present = int((emp_data["status"] == "Present").sum())
    absent = int((emp_data["status"] == "Absent").sum())
    late = int((emp_data["status"] == "Late").sum())
    leave = int((emp_data["status"] == "Leave").sum())
    half = int((emp_data["status"] == "Half").sum())
    total = len(emp_data)

    return {
        "status": "success",
        "employee_id": emp_id,
        "total_days": total,
        "present_days": present,
        "absent_days": absent,
        "late_days": late,
        "leave_days": leave,
        "half_days": half,
        "attendance_rate": f"{round((present / total) * 100, 1)}%" if total else "0%",
    }


# ---------------------------------------------------------------------------
# Tool: search employees / departments / managers
# ---------------------------------------------------------------------------

@tool
def search_employee(query: str) -> dict:
    """
    Search for an employee, department, or manager by name, employee ID,
    or department name. Case-insensitive partial match.
    Input is a free-text search string, e.g. "John" or "E1001" or "Sales".
    """
    q = query.strip().lower()
    if not q:
        return {"error": "Empty search query."}

    id_col = "employee_id" if "employee_id" in employees.columns else None
    name_col = "name" if "name" in employees.columns else None
    dept_col = "department_id" if "department_id" in employees.columns else None

    missing = [c for c, v in [("employee_id", id_col), ("name", name_col)] if v is None]
    if missing:
        return {"error": f"employees.csv is missing expected column(s): {missing}"}

    mask = (
        employees[id_col].astype(str).str.lower().str.contains(q, na=False)
        | employees[name_col].astype(str).str.lower().str.contains(q, na=False)
    )
    matches = employees[mask].copy()

    # Enrich with department name if possible
    if dept_col and "department_id" in departments.columns and "department_name" in departments.columns:
        matches = matches.merge(
            departments[["department_id", "department_name"]],
            on="department_id",
            how="left",
        )

    if matches.empty:
        # Fall back to matching on department name directly
        if "department_name" in departments.columns:
            dept_hit = departments[
                departments["department_name"].astype(str).str.lower().str.contains(q, na=False)
            ]
            if not dept_hit.empty:
                return {
                    "status": "success",
                    "match_type": "department",
                    "results": dept_hit.to_dict(orient="records"),
                }
        return {"status": "not_found", "query": query}

    return {
        "status": "success",
        "match_type": "employee",
        "count": len(matches),
        "results": matches.head(10).to_dict(orient="records"),
    }


# ---------------------------------------------------------------------------
# Tool: payroll lookup
# ---------------------------------------------------------------------------

@tool
def get_payroll_summary(emp_id: str) -> dict:
    """
    Get payroll/compensation details for a specific employee.
    Input must be an employee ID string. Requires the ID to be given
    explicitly — never guess or infer an employee ID for payroll lookups.
    """
    missing = _has_cols(payroll, ["employee_id"])
    if missing:
        return {"error": f"payroll.csv is missing column(s): {missing}"}

    emp_pay = payroll[payroll["employee_id"] == emp_id]
    if emp_pay.empty:
        return {"error": f"No payroll records found for employee_id='{emp_id}'"}

    # If there's a month/period column, surface the most recent record;
    # otherwise just return the single row / all rows.
    period_col = next((c for c in ["month", "period", "pay_period"] if c in emp_pay.columns), None)
    if period_col:
        emp_pay = emp_pay.sort_values(period_col)
        latest = emp_pay.iloc[-1].to_dict()
        return {"status": "success", "employee_id": emp_id, "latest_period": latest}

    return {
        "status": "success",
        "employee_id": emp_id,
        "records": emp_pay.to_dict(orient="records"),
    }


# ---------------------------------------------------------------------------
# Tool: attendance / absenteeism risk report
# ---------------------------------------------------------------------------

@tool
def get_attendance_risk_report(department_name: Optional[str] = None) -> dict:
    """
    Summarize attendance risk: employees with more than 5 late/absent marks,
    and absenteeism rate by department. Optionally filter to one department.
    Input: department_name (optional) — leave blank for a company-wide report.
    """
    missing = _has_cols(attendance, ["employee_id", "status"])
    if missing:
        return {"error": f"attendance.csv is missing column(s): {missing}"}
    if "employee_id" not in employees.columns:
        return {"error": "employees.csv is missing column 'employee_id'"}

    df = attendance.merge(employees, on="employee_id", how="left", suffixes=("", "_emp"))

    if "department_id" in df.columns and "department_id" in departments.columns:
        df = df.merge(
            departments[["department_id", "department_name"]],
            on="department_id",
            how="left",
        )

    if department_name and "department_name" in df.columns:
        df = df[df["department_name"].astype(str).str.lower() == department_name.strip().lower()]
        if df.empty:
            return {"status": "not_found", "department_name": department_name}

    # Employees with excessive lateness/absence
    flagged = (
        df[df["status"].isin(["Late", "Absent"])]
        .groupby(["employee_id"])
        .size()
        .reset_index(name="late_or_absent_count")
    )
    flagged = flagged[flagged["late_or_absent_count"] > 5]

    result: dict = {
        "status": "success",
        "flagged_employees": flagged.to_dict(orient="records"),
    }

    if "department_name" in df.columns:
        by_dept = (
            df.groupby("department_name")["status"]
            .apply(lambda s: round((s == "Absent").mean() * 100, 1))
            .reset_index(name="absenteeism_rate_pct")
            .sort_values("absenteeism_rate_pct", ascending=False)
        )
        result["absenteeism_by_department"] = by_dept.to_dict(orient="records")

    return result


# ---------------------------------------------------------------------------
# Tool: Excel report generator
# ---------------------------------------------------------------------------

@tool
def generate_excel_report(report_type: str, emp_id: Optional[str] = None) -> dict:
    """
    Generate a downloadable Excel report and return its file path.
    report_type must be one of: "attendance", "payroll", "employees",
    "leave_requests". If emp_id is given, the report is filtered to that
    employee where applicable.
    """
    report_type = report_type.strip().lower()
    valid_types = {"attendance", "payroll", "employees", "leave_requests"}
    if report_type not in valid_types:
        return {"error": f"report_type must be one of {sorted(valid_types)}"}

    source_map = {
        "attendance": attendance,
        "payroll": payroll,
        "employees": employees,
        "leave_requests": leave_requests,
    }
    df = source_map[report_type]

    if emp_id and "employee_id" in df.columns:
        df = df[df["employee_id"] == emp_id]
        if df.empty:
            return {"error": f"No {report_type} records found for employee_id='{emp_id}'"}

    timestamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = f"_{emp_id}" if emp_id else ""
    filename = f"{report_type}_report{suffix}_{timestamp}.xlsx"
    out_path = REPORTS_DIR / filename

    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name=report_type[:31])

    return {
        "status": "success",
        "report_type": report_type,
        "file_path": str(out_path),
        "row_count": len(df),
    }