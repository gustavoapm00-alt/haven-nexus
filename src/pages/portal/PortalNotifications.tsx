import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';
import { 
  Bell, Check, AlertTriangle, Info, CheckCircle, XCircle, 
  RefreshCw, Loader2, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const severityConfig: Record<string, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'text-primary' },
  success: { icon: CheckCircle, className: 'text-primary' },
  warning: { icon: AlertTriangle, className: 'text-yellow-500' },
  critical: { icon: XCircle, className: 'text-destructive' },
};

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'billing', label: 'Billing' },
];

export default function PortalNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refresh } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefs, setPrefs] = useState({
    email_notifications_enabled: true,
    renewal_reminders_enabled: true,
  });

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'billing') return ['sub_active', 'payment_failed', 'canceled', 'renewal_soon'].includes(n.type);
    return true;
  });

  const handleSavePrefs = async () => {
    if (!user) return;
    setSavingPrefs(true);
    
    try {
      const { error } = await supabase
        .from('client_billing')
        .upsert({
          user_id: user.id,
          email_notifications_enabled: prefs.email_notifications_enabled,
          renewal_reminders_enabled: prefs.renewal_reminders_enabled,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast({ title: 'Preferences saved' });
    } catch (err) {
      toast({ 
        title: 'Failed to save preferences', 
        variant: 'destructive' 
      });
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <PortalBackground>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Notifications</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refresh()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => navigate('/portal/dashboard')}
                className="text-sm text-primary hover:underline"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
                {tab.id === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => {
                const config = severityConfig[notification.severity] || severityConfig.info;
                const Icon = config.icon;
                
                return (
                  <GlassCard 
                    key={notification.id} 
                    className={cn(
                      "p-4 transition-colors",
                      !notification.read && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        notification.severity === 'critical' ? "bg-destructive/10" : "bg-primary/10"
                      )}>
                        <Icon className={cn("w-5 h-5", config.className)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "text-sm",
                            !notification.read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {activeFilter === 'unread' 
                    ? 'No unread notifications' 
                    : activeFilter === 'billing'
                    ? 'No billing notifications'
                    : 'No notifications yet'}
                </p>
              </GlassCard>
            )}
          </div>

          {/* Preferences */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Notification Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Email notifications</span>
                <button
                  onClick={() => setPrefs(p => ({ ...p, email_notifications_enabled: !p.email_notifications_enabled }))}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    prefs.email_notifications_enabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    prefs.email_notifications_enabled ? "left-6" : "left-1"
                  )} />
                </button>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">Renewal reminders</span>
                <button
                  onClick={() => setPrefs(p => ({ ...p, renewal_reminders_enabled: !p.renewal_reminders_enabled }))}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative",
                    prefs.renewal_reminders_enabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    prefs.renewal_reminders_enabled ? "left-6" : "left-1"
                  )} />
                </button>
              </label>
            </div>
            
            <button
              onClick={handleSavePrefs}
              disabled={savingPrefs}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {savingPrefs ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save Preferences'
              )}
            </button>
          </GlassCard>
        </div>
      </div>
    </PortalBackground>
  );
}
