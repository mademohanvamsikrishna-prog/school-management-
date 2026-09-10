"""Pydantic schemas for marks and exams endpoints."""
from typing import List, Optional
from pydantic import BaseModel


class ExamOut(BaseModel):
    id: str
    name: str
    term: str
    academic_year: str
    start_date: str
    end_date: str
    status: str   # upcoming | ongoing | completed

    model_config = {"from_attributes": True}


class MarkRecordOut(BaseModel):
    id: str
    exam_subject_id: str
    student_id: str
    marks_obtained: float
    grade: str
    remarks: Optional[str] = None
    # Joined fields
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    max_marks: Optional[float] = None
    passing_marks: Optional[float] = None
    exam_name: Optional[str] = None
    exam_date: Optional[str] = None

    model_config = {"from_attributes": True}


class EnterMarkRequest(BaseModel):
    exam_subject_id: str
    student_id: str
    marks_obtained: float
    remarks: Optional[str] = None


class MarkReportOut(BaseModel):
    """Assembled report card for a student in one exam."""
    student_id: str
    student_name: str
    exam: ExamOut
    marks: List[MarkRecordOut]
    total_obtained: float
    total_max: float
    percentage: float
    overall_grade: str
