import { api } from './api';

export interface DashboardSummary {
  role: string;
  attendance_percentage?: number;
  present_days?: number;
  absent_days?: number;
  upcoming_exams?: number;
  pending_fees?: number;
  total_classes?: number;
  subjects_teaching?: number;
  students_count?: number;
  children_count?: number;
  children_summaries?: {
    id: string;
    name: string;
    attendance_percentage: number;
    pending_fees: number;
  }[];
  upcoming_events?: number;
  unread_notifications?: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>('/dashboard/summary');
}
