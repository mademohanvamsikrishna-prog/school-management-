import { api } from './api';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const getMyNotifications = (): Promise<Notification[]> =>
  api.get<Notification[]>('/notifications/me');

export const markNotificationRead = (notificationId: string): Promise<{ read: boolean }> =>
  api.post<{ read: boolean }>(`/notifications/${notificationId}/read`);
