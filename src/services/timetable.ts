import { api } from './api';

export interface TimetableEntry {
  id: string;
  class_id: string;
  class_name?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  teacher_id?: string;
  teacher_name?: string;
  room_number?: string;
}

export async function getClassTimetable(classId: string, dayOfWeek?: number): Promise<TimetableEntry[]> {
  const query = dayOfWeek !== undefined ? `?day=${dayOfWeek}` : '';
  return api.get<TimetableEntry[]>(`/timetable/class/${classId}${query}`);
}

export async function getTeacherTimetable(teacherId: string, dayOfWeek?: number): Promise<TimetableEntry[]> {
  const query = dayOfWeek !== undefined ? `?day=${dayOfWeek}` : '';
  return api.get<TimetableEntry[]>(`/timetable/teacher/${teacherId}${query}`);
}
