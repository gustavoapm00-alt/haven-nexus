import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ClientNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  severity: 'info' | 'warning' | 'critical' | 'success';
  metadata: Record<string, unknown>;
  created_at: string;
}

interface UseNotificationsState {
  notifications: ClientNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<UseNotificationsState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  });
  const mountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setState({ notifications: [], unreadCount: 0, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('client_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!mountedRef.current) return;

      if (error) throw new Error(error.message);

      const notifications = (data || []) as ClientNotification[];
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
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('client_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

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
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('client_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [user]);

  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    mountedRef.current = true;
    fetchNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'client_notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          const newNotification = payload.new as ClientNotification;
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
  }, [fetchNotifications, user?.id]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
