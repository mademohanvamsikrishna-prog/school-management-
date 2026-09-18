/**
 * dashboardCrud.ts — Typed CRUD service for Student Dashboard modules.
 *
 * Wraps the backend endpoints under /api/v1/students/dashboard/:
 *   - Assignments  (homework / coursework tracker)
 *   - Notices      (school announcements / circulars)
 *   - Leaves       (student leave applications)
 *
 * All functions use the shared `api` client which injects the Bearer token
 * automatically from secure storage.
 */
import { api } from './api';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListParams {
  limit?: number;
  offset?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;   // YYYY-MM-DD
}

// ===========================================================================
// Assignment (Homework)
// ===========================================================================

export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'submitted' | 'overdue';
export type AssignmentPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Assignment {
  id: string;
  student_id: string;
  class_id: string | null;
  subject_name: string;
  title: string;
  description: string;
  due_date: string;       // YYYY-MM-DD
  status: AssignmentStatus;
  priority: AssignmentPriority;
  submission_notes: string | null;
  attachment_url: string | null;
  score: number | null;
  max_score: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentCreate {
  subject_name: string;
  title: string;
  description: string;
  due_date: string;
  status?: AssignmentStatus;
  priority?: AssignmentPriority;
  submission_notes?: string;
  attachment_url?: string;
  max_score?: number;
  class_id?: string;
}

export interface AssignmentUpdate {
  subject_name?: string;
  title?: string;
  description?: string;
  due_date?: string;
  status?: AssignmentStatus;
  priority?: AssignmentPriority;
  submission_notes?: string;
  attachment_url?: string;
  score?: number;
  max_score?: number;
  class_id?: string;
}

export interface AssignmentListParams extends ListParams {
  status?: AssignmentStatus;
  student_id?: string; // admin only
}

function buildQuery(params: Record<string, unknown>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

export const createAssignment = (payload: AssignmentCreate): Promise<Assignment> =>
  api.post<Assignment>('/students/dashboard/assignments', payload);

export const getAssignments = (
  params: AssignmentListParams = {},
): Promise<PaginatedResponse<Assignment>> =>
  api.get<PaginatedResponse<Assignment>>(
    `/students/dashboard/assignments${buildQuery({ limit: 20, offset: 0, ...params })}`,
  );

export const getAssignment = (id: string): Promise<Assignment> =>
  api.get<Assignment>(`/students/dashboard/assignments/${id}`);

export const updateAssignment = (id: string, patch: AssignmentUpdate): Promise<Assignment> =>
  api.patch<Assignment>(`/students/dashboard/assignments/${id}`, patch);

export const deleteAssignment = (id: string): Promise<void> =>
  api.delete<void>(`/students/dashboard/assignments/${id}`);

/** Convenience: mark an assignment as completed */
export const markAssignmentDone = (id: string, notes?: string): Promise<Assignment> =>
  updateAssignment(id, { status: 'completed', submission_notes: notes });

// ===========================================================================
// Notice (Announcement / Circular)
// ===========================================================================

export type NoticeCategory = 'academic' | 'exam' | 'event' | 'sports' | 'general' | 'fee' | 'hostel';
export type NoticeTargetRole = 'all' | 'student' | 'teacher' | 'parent';
export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  target_role: NoticeTargetRole;
  date: string; // YYYY-MM-DD
  class_id: string | null;
  posted_by_id: string | null;
  is_pinned: boolean;
  is_acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticeCreate {
  title: string;
  content: string;
  date: string;
  category?: NoticeCategory;
  priority?: NoticePriority;
  target_role?: NoticeTargetRole;
  class_id?: string;
  is_pinned?: boolean;
}

export interface NoticeUpdate {
  title?: string;
  content?: string;
  date?: string;
  category?: NoticeCategory;
  priority?: NoticePriority;
  target_role?: NoticeTargetRole;
  class_id?: string;
  is_pinned?: boolean;
  is_acknowledged?: boolean;
}

export interface NoticeListParams extends ListParams {
  category?: NoticeCategory;
}

export const createNotice = (payload: NoticeCreate): Promise<Notice> =>
  api.post<Notice>('/students/dashboard/notices', payload);

export const getNotices = (
  params: NoticeListParams = {},
): Promise<PaginatedResponse<Notice>> =>
  api.get<PaginatedResponse<Notice>>(
    `/students/dashboard/notices${buildQuery({ limit: 20, offset: 0, ...params })}`,
  );

export const getNotice = (id: string): Promise<Notice> =>
  api.get<Notice>(`/students/dashboard/notices/${id}`);

export const updateNotice = (id: string, patch: NoticeUpdate): Promise<Notice> =>
  api.patch<Notice>(`/students/dashboard/notices/${id}`, patch);

export const deleteNotice = (id: string): Promise<void> =>
  api.delete<void>(`/students/dashboard/notices/${id}`);

/** Convenience: acknowledge a notice */
export const acknowledgeNotice = (id: string): Promise<Notice> =>
  updateNotice(id, { is_acknowledged: true });

// ===========================================================================
// Student Leave Request
// ===========================================================================

export type LeaveType = 'Medical' | 'Casual' | 'Family Emergency' | 'Study Leave' | 'Personal';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface StudentLeave {
  id: string;
  student_id: string;
  leave_type: LeaveType;
  start_date: string;  // YYYY-MM-DD
  end_date: string;    // YYYY-MM-DD
  days_count: number;
  reason: string;
  status: LeaveStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentLeaveCreate {
  leave_type?: LeaveType;
  start_date: string;
  end_date: string;
  days_count?: number;
  reason: string;
}

export interface StudentLeaveUpdate {
  leave_type?: LeaveType;
  start_date?: string;
  end_date?: string;
  days_count?: number;
  reason?: string;
  status?: LeaveStatus;
  rejection_reason?: string;
}

export interface LeaveListParams extends ListParams {
  status?: LeaveStatus;
  student_id?: string; // admin only
}

export const createLeaveRequest = (payload: StudentLeaveCreate): Promise<StudentLeave> =>
  api.post<StudentLeave>('/students/dashboard/leaves', payload);

export const getLeaveRequests = (
  params: LeaveListParams = {},
): Promise<PaginatedResponse<StudentLeave>> =>
  api.get<PaginatedResponse<StudentLeave>>(
    `/students/dashboard/leaves${buildQuery({ limit: 20, offset: 0, ...params })}`,
  );

export const getLeaveRequest = (id: string): Promise<StudentLeave> =>
  api.get<StudentLeave>(`/students/dashboard/leaves/${id}`);

export const updateLeaveRequest = (id: string, patch: StudentLeaveUpdate): Promise<StudentLeave> =>
  api.patch<StudentLeave>(`/students/dashboard/leaves/${id}`, patch);

export const cancelLeaveRequest = (id: string): Promise<StudentLeave> =>
  updateLeaveRequest(id, { status: 'cancelled' });

export const deleteLeaveRequest = (id: string): Promise<void> =>
  api.delete<void>(`/students/dashboard/leaves/${id}`);
