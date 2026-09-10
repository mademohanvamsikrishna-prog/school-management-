import { api } from './api';

export interface AttendanceSummary {
  student_id: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  percentage: number;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks?: string;
}

export interface MarkAttendanceItem {
  student_id: string;
  status: string;
  remarks?: string;
}

export async function getAttendanceSummary(studentId: string): Promise<AttendanceSummary> {
  return api.get<AttendanceSummary>(`/attendance/student/${studentId}/summary`);
}

export async function getAttendanceRecords(studentId: string, limit = 30): Promise<AttendanceRecord[]> {
  return api.get<AttendanceRecord[]>(`/attendance/student/${studentId}/records?limit=${limit}`);
}

export async function markAttendance(classId: string, date: string, records: MarkAttendanceItem[]): Promise<{ marked: number; date: string }> {
  return api.post(`/attendance/class/${classId}/mark`, { class_id: classId, date, records });
}
