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

export interface ClassUpdatePayload {
  name?: string;
  grade_level?: number;
  section?: string;
  room_number?: string;
  capacity?: number;
  class_teacher_id?: string;
}

export const listClasses = (): Promise<AdminClass[]> =>
  api.get<AdminClass[]>('/admin/classes');

export const createClass = (data: ClassCreatePayload): Promise<AdminClass> =>
  api.post<AdminClass>('/admin/classes', data);

export const updateClass = (classId: string, data: ClassUpdatePayload): Promise<AdminClass> =>
  api.patch<AdminClass>(`/admin/classes/${classId}`, data);

export const deleteClass = (classId: string): Promise<void> =>
  api.delete<void>(`/admin/classes/${classId}`);

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

// ── Staff Salaries ────────────────────────────────────────────────────────────

export interface AdminStaffSalaryRecord {
  staff_id: string;
  salary_id?: string | null;
  name: string;
  email: string;
  avatar_url?: string | null;
  role_name: string;
  emp_id: string;
  department: string;
  designation: string;
  monthly_salary?: number | null;
  allowance?: number;
  deductions?: number;
  status: 'Paid' | 'Pending' | 'Not Set' | string;
  last_paid_date?: string | null;
  month_year: string;
  is_salary_set: boolean;
  transaction_ref?: string | null;
  payment_method?: string | null;
}

export interface AdminStaffSalaryOverview {
  summary: {
    total_staff: number;
    total_monthly_salary: number;
    paid_this_month: number;
    pending_payments: number;
    paid_percentage: number;
    pending_percentage: number;
    selected_month: string;
  };
  records: AdminStaffSalaryRecord[];
}

export interface StaffSalaryCreatePayload {
  staff_id: string;
  month_year: string;
  monthly_salary: number;
  allowance?: number;
  deductions?: number;
  status?: string;
  last_paid_date?: string;
  payment_method?: string;
  transaction_ref?: string;
  notes?: string;
}

export interface StaffSalaryUpdatePayload {
  monthly_salary?: number;
  allowance?: number;
  deductions?: number;
  status?: string;
  last_paid_date?: string;
  payment_method?: string;
  transaction_ref?: string;
  notes?: string;
}

export interface StaffSalaryHistoryRecord {
  id: string;
  month_year: string;
  monthly_salary: number;
  status: string;
  last_paid_date?: string;
  transaction_ref?: string;
  payment_method?: string;
}

export const getAdminStaffSalaries = (month = 'October 2026'): Promise<AdminStaffSalaryOverview> =>
  api.get<AdminStaffSalaryOverview>(`/admin/staff-salaries?month=${encodeURIComponent(month)}`);

export const createStaffSalary = (data: StaffSalaryCreatePayload): Promise<{ id: string; staff_id: string; status: string }> =>
  api.post<{ id: string; staff_id: string; status: string }>('/admin/staff-salaries', data);

export const updateStaffSalary = (salaryId: string, data: StaffSalaryUpdatePayload): Promise<{ id: string; monthly_salary: number; status: string }> =>
  api.put<{ id: string; monthly_salary: number; status: string }>(`/admin/staff-salaries/${salaryId}`, data);

export const getStaffSalaryHistory = (staffId: string): Promise<StaffSalaryHistoryRecord[]> =>
  api.get<StaffSalaryHistoryRecord[]>(`/admin/staff-salaries/history/${staffId}`);

// ── Students Management ───────────────────────────────────────────────────────

export interface AdminStudentRecord {
  id: string;
  student_id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  class_id?: string | null;
  class_name: string;
  grade_level: number;
  section: string;
  parent_name: string;
  attendance_percentage: number;
  is_active: boolean;
  admission_year: string;
  created_at: string;
}

export interface StudentDistributionItem {
  class_name: string;
  count: number;
}

export interface StudentActivityItem {
  id: string;
  icon: string;
  title: string;
  time: string;
  type: string;
}

export interface AdminStudentsOverview {
  summary: {
    total_students: number;
    active_students: number;
    inactive_students: number;
    active_percentage: number;
    inactive_percentage: number;
    classes_count: number;
    new_admissions: number;
    average_attendance: number;
  };
  records: AdminStudentRecord[];
  classes: { id: string; name: string; grade_level: number; section: string; room_number?: string }[];
  admission_years: string[];
  distribution: StudentDistributionItem[];
  recent_activities: StudentActivityItem[];
}

export interface BulkStudentStatusPayload {
  student_ids: string[];
  is_active: boolean;
}

export interface BulkAssignClassPayload {
  student_ids: string[];
  class_id: string;
}

export const getStudentsOverview = (): Promise<AdminStudentsOverview> =>
  api.get<AdminStudentsOverview>('/admin/students-overview');

export const bulkUpdateStudentStatus = (data: BulkStudentStatusPayload): Promise<{ updated_count: number }> =>
  api.post<{ updated_count: number }>('/admin/students/bulk-status', data);

export const bulkAssignClass = (data: BulkAssignClassPayload): Promise<{ assigned_count: number; class_name: string }> =>
  api.post<{ assigned_count: number; class_name: string }>('/admin/students/assign-class', data);

// ── Users Management Overview ─────────────────────────────────────────────────

export interface AdminUserOverviewRecord {
  id: string;
  code_id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role_name: string;
  role_id: string;
  department_or_class: string;
  is_active: boolean;
  status: 'Active' | 'Inactive';
  last_login: string;
  created_at: string;
}

export interface AdminUsersOverview {
  summary: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    active_percentage: number;
    inactive_percentage: number;
    admin_users: number;
    teacher_users: number;
    student_users: number;
    parent_users: number;
    staff_users: number;
    trend_this_month: string;
  };
  records: AdminUserOverviewRecord[];
  roles: { id: string; name: string; description?: string }[];
  classes_and_departments: string[];
}

export interface BulkUserRolePayload {
  user_ids: string[];
  role_id: string;
}

export interface BulkUserStatusPayload {
  user_ids: string[];
  is_active: boolean;
}

export interface BulkUserDeletePayload {
  user_ids: string[];
}

export const getUsersOverview = (): Promise<AdminUsersOverview> =>
  api.get<AdminUsersOverview>('/admin/users-overview');

export const bulkAssignUserRole = (data: BulkUserRolePayload): Promise<{ updated_count: number; role_name: string }> =>
  api.post<{ updated_count: number; role_name: string }>('/admin/users/bulk-role', data);

export const bulkUpdateUserStatus = (data: BulkUserStatusPayload): Promise<{ updated_count: number }> =>
  api.post<{ updated_count: number }>('/admin/users/bulk-status', data);

export const bulkDeleteUsers = (data: BulkUserDeletePayload): Promise<{ deactivated_count: number }> =>
  api.post<{ deactivated_count: number }>('/admin/users/bulk-delete', data);

// ── Teachers Management Overview ──────────────────────────────────────────────

export interface AdminTeacherOverviewRecord {
  id: string;
  teacher_id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  department: string;
  designation: string;
  subjects: string[];
  experience: string;
  experience_years: number;
  qualification: string;
  is_active: boolean;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface DepartmentDistributionItem {
  department: string;
  count: number;
}

export interface ExperienceDistributionItem {
  range: string;
  count: number;
}

export interface AdminTeachersOverview {
  summary: {
    total_faculty: number;
    active_teachers: number;
    inactive_teachers: number;
    active_percentage: number;
    inactive_percentage: number;
    curriculum_subjects: number;
    trend_this_month: string;
  };
  records: AdminTeacherOverviewRecord[];
  department_distribution: DepartmentDistributionItem[];
  experience_distribution: ExperienceDistributionItem[];
  departments: string[];
  designations: string[];
}

export interface BulkTeacherStatusPayload {
  teacher_ids: string[];
  is_active: boolean;
}

export interface TeacherUpdatePayload {
  name?: string;
  email?: string;
  department?: string;
  designation?: string;
  qualification?: string;
  is_active?: boolean;
}

export const getTeachersOverview = (): Promise<AdminTeachersOverview> =>
  api.get<AdminTeachersOverview>('/admin/teachers-overview');

export const bulkUpdateTeacherStatus = (data: BulkTeacherStatusPayload): Promise<{ updated_count: number }> =>
  api.post<{ updated_count: number }>('/admin/teachers/bulk-status', data);

export const updateTeacherDetails = (teacherId: string, data: TeacherUpdatePayload): Promise<{ id: string; name: string; is_active: boolean }> =>
  api.put<{ id: string; name: string; is_active: boolean }>(`/admin/teachers/${teacherId}`, data);

// ── Subjects Management Overview ──────────────────────────────────────────────

export interface AdminSubjectOverviewRecord {
  id: string;
  name: string;
  code: string;
  department: string;
  description: string;
  classes_count: number;
  classes_list: string[];
  teachers_count: number;
  teachers_list: string[];
  resources_count: number;
  is_active: boolean;
  status: 'Active' | 'Inactive';
  created_at?: string;
}

export interface AdminSubjectsOverview {
  summary: {
    total_subjects: number;
    trend_this_month: string;
    active_subjects: number;
    active_percentage: number;
    departments: number;
    classes_using_subjects: number;
  };
  records: AdminSubjectOverviewRecord[];
  departments: string[];
  classes: { id: string; name: string; grade_level: number; section: string }[];
  teachers: { id: string; name: string; email: string }[];
}

export interface SubjectUpdatePayload {
  name?: string;
  code?: string;
  department?: string;
  description?: string;
  is_active?: boolean;
  class_ids?: string[];
  teacher_id?: string;
}

export const getSubjectsOverview = (): Promise<AdminSubjectsOverview> =>
  api.get<AdminSubjectsOverview>('/admin/subjects-overview');

export const updateSubjectDetails = (subjectId: string, data: SubjectUpdatePayload): Promise<{ id: string; name: string; code: string; department?: string }> =>
  api.put<{ id: string; name: string; code: string; department?: string }>(`/admin/subjects/${subjectId}`, data);

export const deleteSubjectRecord = (subjectId: string): Promise<{ deleted: boolean; id: string }> =>
  api.delete<{ deleted: boolean; id: string }>(`/admin/subjects/${subjectId}`);





