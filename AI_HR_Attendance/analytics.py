import pandas as pd
#from datetime import datetime
from langchain.tools import tool
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
att = pd.read_csv(BASE_DIR / "data/sample_attendance.csv")
leaves = pd.read_csv(BASE_DIR / "data/sample_leaves.csv")

# create tools
@tool
def get_emps_summary(emp_id: str) -> dict:
    """
    Useful for getting attendance statistics for a specific employee.
    Input must be an employee ID string.
    """

    emp_data = att[att['employee_id'] == emp_id]
    if emp_data.empty:
        return {"error": "Employee not found"}
    
    #path_obj = Path(path)
    #if path_obj.is_absolute():
     #   return str(path_obj)

    #check for employee's attendance as present, absent, leave etc..
    present = len(emp_data[emp_data['status'] == 'Present'])
    absent = len(emp_data[emp_data['status'] == 'Absent'])
    late = len(emp_data[emp_data['status'] == 'Late'])
    leave = len(emp_data[emp_data['status'] == 'Leave'])
    half = len(emp_data[emp_data['status'] == 'half'])

    total = len(emp_data)

#def load_attendance_date(path: str) -> pd.DataFrame:
 #   df = pd.read_csv(_resolve_data_path(path), parse_dates=['date'])
    return {
        'staus': 'Success',
        'total_days': total,
        'present_days': present,
        'absent_days': absent,
        'late_days': late,
        'leave_days': leave,
        'half_days': half

    }

# Compatibility alias for AI_HR_Attendance.main
#load_attendance = load_attendance_date

#def load_leaves(path: str) -> pd.DataFrame:
 #   df = pd.read_csv(_resolve_data_path(path), parse_dates=['start_date', 'end_date'])
  #  return df
