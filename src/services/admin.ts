import { api } from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  role_name: string;
  avatar_url?: string;
}

export interface AdminClass {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  room_number?: string;
  capacity: number;
  class_teacher_id?: string;
  teacher_name?: string;
  student_count: number;
}

export interface AdminSubject {
  id: string;
  name: string;
  code: string;
  department?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string;
}

export interface AnalyticsOverview {
  enrollment: { students: number; teachers: number; parents: number; classes: number };
  attendance: { total_records: number; present_records: number; overall_percentage: number };
  finance: {
    total_invoiced: number;
    total_collected: number;
    total_outstanding: number;
    collection_rate: number;
  };
}

export interface UserCreatePayload {
  email: string;
  password: string;
  name: string;
  role_id: string;
  is_active?: boolean;
}

export interface UserUpdatePayload {
  name?: string;
  is_active?: boolean;
  role_id?: string;
  avatar_url?: string;
}

export interface ClassCreatePayload {
  name: string;
  grade_level: number;
  section?: string;
  room_number?: string;
  capacity?: number;
  class_teacher_id?: string;
}

export interface SubjectCreatePayload {
  name: string;
  code: string;
  department?: string;
}

export interface AdminMarkRecord {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  exam_name: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
}

export interface AdminAttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  status: string;
  class_name: string;
}

export interface AdminFeeInvoice {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  amount: number;
  due_date: string;
  status: string;
}

export interface AdminFeesOverview {
  summary: {
    total_invoiced: number;
    total_collected: number;
    total_pending: number;
    total_overdue: number;
    collection_rate: number;
    total_invoices: number;
  };
  invoices: AdminFeeInvoice[];
}

export interface AdminAttendanceOverview {
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    attendance_rate: number;
  };
  records: AdminAttendanceRecord[];
}

// ── Users ────────────────────────────────────────────────────────────────────

export const listUsers = (role_name?: string): Promise<AdminUser[]> => {
  const params = role_name ? `?role_name=${role_name}` : '';
  return api.get<AdminUser[]>(`/admin/users${params}`);
};

export const createUser = (data: UserCreatePayload): Promise<AdminUser> =>
  api.post<AdminUser>('/admin/users', data);

export const updateUser = (userId: string, data: UserUpdatePayload): Promise<AdminUser> =>
  api.patch<AdminUser>(`/admin/users/${userId}`, data);

export const deactivateUser = (userId: string): Promise<void> =>
  api.delete<void>(`/admin/users/${userId}`);

// ── Roles ─────────────────────────────────────────────────────────────────────

export const listRoles = (): Promise<AdminRole[]> =>
  api.get<AdminRole[]>('/admin/roles');

// ── Classes ───────────────────────────────────────────────────────────────────

export const listClasses = (): Promise<AdminClass[]> =>
  api.get<AdminClass[]>('/admin/classes');

export const createClass = (data: ClassCreatePayload): Promise<AdminClass> =>
  api.post<AdminClass>('/admin/classes', data);

export const assignTeacher = (classId: string, teacherId: string): Promise<AdminClass> =>
  api.put<AdminClass>(`/admin/classes/${classId}/assign-teacher`, { teacher_id: teacherId });

export const getClassStudents = (classId: string): Promise<{ id: string; name: string; roll_number: string }[]> =>
  api.get(`/admin/classes/${classId}/students`);

// ── Subjects ──────────────────────────────────────────────────────────────────

export const listSubjects = (): Promise<AdminSubject[]> =>
  api.get<AdminSubject[]>('/admin/subjects');

export const createSubject = (data: SubjectCreatePayload): Promise<AdminSubject> =>
  api.post<AdminSubject>('/admin/subjects', data);

// ── Analytics ─────────────────────────────────────────────────────────────────

export const getAnalyticsOverview = (): Promise<AnalyticsOverview> =>
  api.get<AnalyticsOverview>('/admin/analytics/overview');

export const getAdminMarks = (limit = 200): Promise<AdminMarkRecord[]> =>
  api.get<AdminMarkRecord[]>(`/admin/academics/marks?limit=${limit}`);

export const getAdminAttendance = (limit = 200): Promise<AdminAttendanceOverview> =>
  api.get<AdminAttendanceOverview>(`/admin/academics/attendance?limit=${limit}`);

export const getAdminFees = (statusFilter?: string): Promise<AdminFeesOverview> => {
  const params = statusFilter ? `?status_filter=${statusFilter}` : '';
  return api.get<AdminFeesOverview>(`/admin/finance/fees${params}`);
};
