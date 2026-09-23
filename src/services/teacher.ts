/**
 * Teacher-specific API service.
 * Covers all /teacher/me/* endpoints.
 */
import { api } from './api';

export interface TeacherClass {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  room_number?: string;
  capacity: number;
  student_count: number;
  is_class_teacher: boolean;
}

export interface TimetableSlot {
  id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number?: string;
}

export interface AttendanceStat {
  class_id: string;
  class_name: string;
  total_records: number;
  present_count: number;
  attendance_rate: number;
}

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  class_id: string;
  class_name: string;
  roll_number: string;
}

export interface TeacherSubject {
  id: string;
  name: string;
  code: string;
  department?: string;
  class_count: number;
}

export const getMyClasses = (): Promise<TeacherClass[]> =>
  api.get<TeacherClass[]>('/teacher/me/classes');

export const getMyTimetable = (day?: number): Promise<TimetableSlot[]> => {
  const params = day != null ? `?day=${day}` : '';
  return api.get<TimetableSlot[]>(`/teacher/me/timetable${params}`);
};

export const getAttendanceStats = (): Promise<AttendanceStat[]> =>
  api.get<AttendanceStat[]>('/teacher/me/attendance/stats');

export const getMyStudents = (): Promise<TeacherStudent[]> =>
  api.get<TeacherStudent[]>('/teacher/me/students');

export const getMySubjects = (): Promise<TeacherSubject[]> =>
  api.get<TeacherSubject[]>('/teacher/me/subjects');

export const updateTeacherProfile = (data: { name?: string; avatar_url?: string }) =>
  api.patch<{ id: string; name: string; avatar_url?: string }>('/teacher/me/profile', data);
