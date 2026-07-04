from datetime import datetime
#from AI_HR_Attendance.analytics import load_attendance, load_leaves
#from AI_HR_Attendance.prompts import ask_hr_copilot
from .analytics import load_attendance, load_leaves
from .prompts import ask_hr_copilot

def calculate_summary(employee_id: str):
    att = load_attendance("databases/sample_attendance.csv")
    leaves = load_leaves("databases/sample_leaves.csv")

    # Filter employee attendance and leaves
    att = att[att['employee_id'] == employee_id]
    leaves = leaves[leaves['employee_id'] == employee_id]

    if att.empty:
        return {
            "attendance_percent": 0,
            "total_days": 0,
            "present_days": 0,
            "late_days": 0,
            "leave_days": 0,
            "absent_days": 0,
            "message": "No attendance records found for none of the employees."
        }
    
    total_days = len(att)
    present_days = att[att['Status'] == 'Present'].shape[0]
    late_days = att[att['Status'] == 'Late'].shape[0]
    leave_days = att[att['Status'] == 'Leave'].shape[0]
    absent_days = att[att['Status'] == 'Absent'].shape[0]

    attendance_percent = round((present_days / total_days) * 100, 2)
    
    # Create summary dictionary
    summary = {
        "attendance_percent": attendance_percent,
        "total_days": total_days,
        "present_days": present_days,
        "late_days": late_days,
        "leave_days": leave_days,
        "absent_days": absent_days

    }

    return summary


def ask_summary_to_ai(summary: dict):
    prompt = f"""
    I have the following attendance summary for an employee:
    Total Days: {summary['total_days']}
    Present Days: {summary['present_days']}
    Late Days: {summary['late_days']}
    Leave Days: {summary['leave_days']}
    Absent Days: {summary['absent_days']}
    Attendance Percentage: {summary['attendance_percent']}%

    Please provide a bullet summary of this attendance.
    """
    response = ask_hr_copilot(prompt)
    print(response)

if __name__ == "__main__":
    employee_id = "E001"  # Example employee ID
    summary = calculate_summary(employee_id)
    ai_summary = ask_summary_to_ai(summary)
    print()
    print("Attendance summary generated:")
    # iterate through the summary dictionary and print each key-value pair
    for key, value in summary.items():
        print(f"{key}: {value}")
    print(summary)
    ask_summary_to_ai(summary) 
