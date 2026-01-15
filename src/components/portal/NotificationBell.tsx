import { Bell, Check, AlertTriangle, Info, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { useNotifications, ClientNotification } from '@/hooks/useNotifications';
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
    className: 'text-primary',
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

function NotificationItem({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: ClientNotification; 
  onMarkAsRead: (id: string) => void;
}) {
  const config = severityConfig[notification.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "p-3 border-b border-border/20 last:border-0 transition-colors",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", config.className)} />
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
                onClick={() => onMarkAsRead(notification.id)}
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
          <p className="text-xs text-muted-foreground/60 mt-1">
            {new Date(notification.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const displayNotifications = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative flex items-center justify-center w-9 h-9 rounded-lg",
            "backdrop-blur-sm border transition-all duration-200",
            "hover:shadow-md hover:-translate-y-0.5",
            "bg-card/60 border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 backdrop-blur-xl bg-card/90 border-border/50"
        align="end"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {displayNotifications.length > 0 ? (
            displayNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </div>
        
        {notifications.length > 5 && (
          <div className="p-3 border-t border-border/30">
            <Link
              to="/portal/notifications"
              className="flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all notifications
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
