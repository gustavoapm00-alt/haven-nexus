import { Bell, Check, AlertTriangle, Info, CheckCircle, XCircle, ChevronRight, Key } from 'lucide-react';
import { useAdminNotifications, AdminNotification } from '@/hooks/useAdminNotifications';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from 'react-router-dom';

const severityConfig: Record<string, { icon: typeof Info; className: string }> = {
  info: {
    icon: Info,
    className: 'text-primary',
  },
  success: {
    icon: CheckCircle,
    className: 'text-green-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-yellow-500',
  },
  critical: {
    icon: XCircle,
    className: 'text-destructive',
  },
};

const typeConfig: Record<string, { icon: typeof Info; label: string }> = {
  credential_submitted: {
    icon: Key,
    label: 'Credentials',
  },
};

function NotificationItem({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: AdminNotification; 
  onMarkAsRead: (id: string) => void;
}) {
  const config = severityConfig[notification.severity] || severityConfig.info;
  const typeInfo = typeConfig[notification.type];
  const Icon = typeInfo?.icon || config.icon;
  const requestId = notification.metadata?.requestId as string | undefined;

  return (
    <div 
      className={cn(
        "p-3 border-b border-border/20 last:border-0 transition-colors hover:bg-muted/30",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          notification.severity === 'critical' ? "bg-destructive/10" : "bg-primary/10"
        )}>
          <Icon className={cn("w-4 h-4", config.className)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-sm truncate",
              !notification.read && "font-medium"
            )}>
              {notification.title}
            </p>
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="p-1 rounded hover:bg-muted/50 transition-colors shrink-0"
                title="Mark as read"
              >
                <Check className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.body}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-xs text-muted-foreground/60">
              {new Date(notification.created_at).toLocaleString()}
            </p>
            {requestId && (
              <Link
                to={`/admin/activity`}
                className="text-xs text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View Request →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminNotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
  const displayNotifications = notifications.slice(0, 8);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative flex items-center justify-center w-9 h-9 rounded-lg",
            "bg-secondary/50 border border-border/50 transition-all duration-200",
            "hover:bg-secondary hover:border-border",
            unreadCount > 0 && "border-primary/30"
          )}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 bg-card/95 backdrop-blur-xl border-border/50"
        align="end"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Admin Notifications</span>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {displayNotifications.length > 0 ? (
            displayNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                You'll see credential submissions and alerts here
              </p>
            </div>
          )}
        </div>
        
        {notifications.length > 8 && (
          <div className="p-3 border-t border-border/30">
            <Link
              to="/admin/activity"
              className="flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all activity
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
