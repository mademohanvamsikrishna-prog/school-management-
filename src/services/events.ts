import { api } from './api';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  target_audience: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
}

export async function getEvents(upcomingOnly = false): Promise<Event[]> {
  const query = upcomingOnly ? '?upcoming_only=true' : '';
  return api.get<Event[]>(`/events${query}`);
}

export async function getMyNotifications(): Promise<Notification[]> {
  return api.get<Notification[]>('/notifications/me');
}
