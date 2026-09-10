"""Pydantic schemas for attendance endpoints."""
from typing import List, Optional
from pydantic import BaseModel


class AttendanceRecordOut(BaseModel):
    id: str
    student_id: str
    class_id: str
    date: str          # YYYY-MM-DD
    status: str        # present | absent | late | half_day
    remarks: Optional[str] = None

    model_config = {"from_attributes": True}


class AttendanceSummaryOut(BaseModel):
    student_id: str
    total_days: int
    present_days: int
    absent_days: int
    late_days: int
    percentage: float


class MarkAttendanceItem(BaseModel):
    student_id: str
    status: str        # present | absent | late | half_day
    remarks: Optional[str] = None


class MarkAttendanceRequest(BaseModel):
    class_id: str
    date: str          # YYYY-MM-DD
    records: List[MarkAttendanceItem]
