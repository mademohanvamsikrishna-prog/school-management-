import { api } from './api';

export interface LeaveType {
  id: string;
  name: string;
  max_days: number;
  is_paid: boolean;
}

export interface LeaveRequestOut {
  id: string;
  type: string;
  start: string;
  end: string;
  days: number;
  status: string;
}

export interface LeaveApplyIn {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
}

export const getLeaveTypes = (): Promise<LeaveType[]> =>
  api.get<LeaveType[]>('/leave/types');

export const applyForLeave = (payload: LeaveApplyIn): Promise<{ id: string; status: string }> =>
  api.post('/leave/requests', payload);

export const getMyLeaveRequests = (): Promise<LeaveRequestOut[]> =>
  api.get<LeaveRequestOut[]>('/leave/requests/mine');
