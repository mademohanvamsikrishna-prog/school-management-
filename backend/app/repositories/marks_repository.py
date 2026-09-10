"""Marks and exams data access."""
import math
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.marks import Exam, ExamSubject, MarkRecord


# ---------------------------------------------------------------------------
# Exams
# ---------------------------------------------------------------------------

def get_all_exams(db: Session) -> List[Exam]:
    return db.query(Exam).order_by(Exam.start_date.desc()).all()


def get_exams_for_class(db: Session, class_id: str) -> List[Exam]:
    exam_ids = (
        db.query(ExamSubject.exam_id)
        .filter(ExamSubject.class_id == class_id)
        .distinct()
        .all()
    )
    ids = [e[0] for e in exam_ids]
    if not ids:
        return []
    return db.query(Exam).filter(Exam.id.in_(ids)).order_by(Exam.start_date.desc()).all()


# ---------------------------------------------------------------------------
# Marks
# ---------------------------------------------------------------------------

def get_marks_for_student(
    db: Session,
    student_id: str,
    exam_id: Optional[str] = None,
) -> List[dict]:
    """Returns enriched mark records with subject/exam info joined."""
    q = (
        db.query(MarkRecord)
        .filter(MarkRecord.student_id == student_id)
    )
    if exam_id:
        q = q.join(ExamSubject, MarkRecord.exam_subject_id == ExamSubject.id).filter(
            ExamSubject.exam_id == exam_id
        )
    rows = q.all()

    result = []
    for r in rows:
        es = r.exam_subject
        result.append({
            "id": r.id,
            "exam_subject_id": r.exam_subject_id,
            "student_id": r.student_id,
            "marks_obtained": r.marks_obtained,
            "grade": r.grade,
            "remarks": r.remarks,
            "subject_name": es.subject.name if es and es.subject else None,
            "subject_code": es.subject.code if es and es.subject else None,
            "max_marks": es.max_marks if es else None,
            "passing_marks": es.passing_marks if es else None,
            "exam_name": es.exam.name if es and es.exam else None,
            "exam_date": es.exam_date if es else None,
        })
    return result


def get_exam_subject(db: Session, exam_subject_id: str) -> Optional[ExamSubject]:
    return db.query(ExamSubject).filter(ExamSubject.id == exam_subject_id).first()


def upsert_mark(
    db: Session,
    *,
    exam_subject_id: str,
    student_id: str,
    marks_obtained: float,
    max_marks: float,
    passing_marks: float,
    remarks: Optional[str],
    teacher_id: Optional[str],
) -> MarkRecord:
    """Insert or update a mark record, calculating grade automatically."""
    grade = _calculate_grade(marks_obtained, max_marks)

    existing = (
        db.query(MarkRecord)
        .filter(
            MarkRecord.exam_subject_id == exam_subject_id,
            MarkRecord.student_id == student_id,
        )
        .first()
    )
    if existing:
        existing.marks_obtained = marks_obtained
        existing.grade = grade
        existing.remarks = remarks
        existing.entered_by_teacher_id = teacher_id
        db.flush()
        return existing

    record = MarkRecord(
        exam_subject_id=exam_subject_id,
        student_id=student_id,
        marks_obtained=marks_obtained,
        grade=grade,
        remarks=remarks,
        entered_by_teacher_id=teacher_id,
    )
    db.add(record)
    db.flush()
    return record


def _calculate_grade(obtained: float, max_marks: float) -> str:
    if max_marks == 0:
        return "N/A"
    pct = (obtained / max_marks) * 100
    if pct >= 90:
        return "A+"
    if pct >= 80:
        return "A"
    if pct >= 70:
        return "B+"
    if pct >= 60:
        return "B"
    if pct >= 50:
        return "C"
    if pct >= 35:
        return "D"
    return "F"
