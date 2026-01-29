import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical' | 'success';
  metadata: Record<string, unknown>;
  created_at: string;
}

interface UseAdminNotificationsState {
  notifications: AdminNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useAdminNotifications() {
  const { isAdmin } = useAuth();
  const [state, setState] = useState<UseAdminNotificationsState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  });
  const mountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) {
      setState({ notifications: [], unreadCount: 0, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!mountedRef.current) return;

      if (error) throw new Error(error.message);

      const notifications = (data || []) as AdminNotification[];
      const unreadCount = notifications.filter(n => !n.read).length;

      setState({
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load notifications',
      }));
    }
  }, [isAdmin]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAdmin) return;

    try {
      await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [isAdmin]);

  const markAllAsRead = useCallback(async () => {
    if (!isAdmin) return;

    try {
      await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [isAdmin]);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    mountedRef.current = true;
    fetchNotifications();

    // Set up realtime subscription for new notifications
    if (isAdmin) {
      const channel = supabase
        .channel('admin_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'admin_notifications',
          },
          (payload) => {
            const newNotification = payload.new as AdminNotification;
            setState(prev => ({
              ...prev,
              notifications: [newNotification, ...prev.notifications],
              unreadCount: prev.unreadCount + 1,
            }));
          }
        )
        .subscribe();

      return () => {
        mountedRef.current = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchNotifications, isAdmin]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
