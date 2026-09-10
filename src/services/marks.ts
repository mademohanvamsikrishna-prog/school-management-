import { api } from './api';

export interface Exam {
  id: string;
  name: string;
  term: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface MarkRecord {
  id: string;
  exam_subject_id: string;
  student_id: string;
  marks_obtained: number;
  grade: string;
  remarks?: string;
  subject_name?: string;
  subject_code?: string;
  max_marks?: number;
  passing_marks?: number;
  exam_name?: string;
  exam_date?: string;
}

export async function getExams(): Promise<Exam[]> {
  return api.get<Exam[]>('/marks/exams');
}

export async function getStudentMarks(studentId: string, examId?: string): Promise<MarkRecord[]> {
  const query = examId ? `?exam_id=${examId}` : '';
  return api.get<MarkRecord[]>(`/marks/student/${studentId}${query}`);
}

export async function enterMark(examSubjectId: string, studentId: string, marksObtained: number, remarks?: string): Promise<MarkRecord> {
  return api.post<MarkRecord>('/marks/enter', {
    exam_subject_id: examSubjectId,
    student_id: studentId,
    marks_obtained: marksObtained,
    remarks,
  });
}
