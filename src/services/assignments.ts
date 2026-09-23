import { api } from './api';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject_name?: string;
  class_name?: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  max_marks?: number;
  marks_obtained?: number;
  created_at: string;
}

export interface AssignmentCreate {
  title: string;
  description?: string;
  subject_id?: string;
  class_id?: string;
  due_date: string;
  max_marks?: number;
}

export const getMyAssignments = (status?: string): Promise<Assignment[]> => {
  const params = status ? `?status=${status}` : '';
  return api.get<Assignment[]>(`/students/dashboard/assignments${params}`);
};

export const createAssignment = (data: AssignmentCreate): Promise<Assignment> =>
  api.post<Assignment>('/students/dashboard/assignments', data);

export const submitAssignment = (id: string): Promise<Assignment> =>
  api.patch<Assignment>(`/students/dashboard/assignments/${id}`, { status: 'submitted' });

export const deleteAssignment = (id: string): Promise<void> =>
  api.delete<void>(`/students/dashboard/assignments/${id}`);
