import pandas as pd
from datetime import datetime

def load_attendance_date(path:str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=['date'])
    return df

def load_leaves(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=['Start Date', 'End Date'])
    return df