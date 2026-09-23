import { api } from './api';

export interface Exam {
  id: string;
  name: string;
  exam_type: string;
  start_date: string;
  end_date: string;
  class_id?: string;
  academic_year: string;
}

export interface ExamSubject {
  id: string;
  exam_id: string;
  subject_id: string;
  subject_name: string;
  exam_date: string;
  max_marks: number;
  passing_marks: number;
  duration_minutes: number;
}

export const getExams = (class_id?: string): Promise<Exam[]> => {
  const params = class_id ? `?class_id=${class_id}` : '';
  return api.get<Exam[]>(`/marks/exams${params}`);
};

export const getExamSubjects = (examId: string): Promise<ExamSubject[]> =>
  api.get<ExamSubject[]>(`/marks/exams/${examId}/subjects`);
