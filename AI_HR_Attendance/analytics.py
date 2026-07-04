import pandas as pd
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def _resolve_data_path(path: str) -> str:
    path_obj = Path(path)
    if path_obj.is_absolute():
        return str(path_obj)
    return str(BASE_DIR / path_obj)


def load_attendance_date(path: str) -> pd.DataFrame:
    df = pd.read_csv(_resolve_data_path(path), parse_dates=['date'])
    return df

# Compatibility alias for AI_HR_Attendance.main
load_attendance = load_attendance_date

def load_leaves(path: str) -> pd.DataFrame:
    df = pd.read_csv(_resolve_data_path(path), parse_dates=['start_date', 'end_date'])
    return df
