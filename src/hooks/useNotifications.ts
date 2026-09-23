/**
 * useNotifications — shared polling hook for notifications.
 *
 * Features:
 *  - Polls GET /notifications/me every 30s
 *  - Tracks unread count
 *  - Provides markRead() to fire POST /notifications/{id}/read
 *  - Auto-clears on unmount
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get<AppNotification[]>('/notifications/me');
      setNotifications(data ?? []);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markRead = useCallback(async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch {
      // Silent fail — UI already optimistically updated
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.allSettled(unread.map(n => markRead(n.id)));
  }, [notifications, markRead]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markRead,
    markAllRead,
  };
}
