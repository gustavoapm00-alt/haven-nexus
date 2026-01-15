import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useSubscriptionStatus, SubscriptionStatusType } from '@/hooks/useSubscriptionStatus';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const statusConfig: Record<SubscriptionStatusType, {
  label: string;
  icon: typeof CheckCircle;
  className: string;
}> = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  inactive: {
    label: 'Inactive',
    icon: XCircle,
    className: 'bg-muted/50 text-muted-foreground border-border/50',
  },
  unknown: {
    label: 'Unknown',
    icon: AlertTriangle,
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  checking: {
    label: 'Checking…',
    icon: Loader2,
    className: 'bg-muted/50 text-muted-foreground border-border/50',
  },
  error: {
    label: 'Error',
    icon: AlertTriangle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function SubscriptionBadge() {
  const { status, subscribed, subscriptionEnd, checkedAt, error, isLoading, refresh } = useSubscriptionStatus();
  
  const config = statusConfig[status];
  const Icon = config.icon;
  const isChecking = status === 'checking' || isLoading;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            "backdrop-blur-sm border transition-all duration-200",
            "hover:shadow-md hover:-translate-y-0.5",
            config.className
          )}
        >
          <Icon className={cn("w-3 h-3", isChecking && "animate-spin")} />
          <span>{config.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0 backdrop-blur-xl bg-card/90 border-border/50"
        align="end"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription Status</span>
            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className={cn(
                "p-1 rounded hover:bg-muted/50 transition-colors",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              title="Refresh"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>
        
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", isChecking && "animate-spin", 
              status === 'active' && 'text-primary',
              status === 'error' && 'text-destructive',
              (status === 'unknown' || status === 'inactive') && 'text-muted-foreground'
            )} />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
          
          {subscribed && subscriptionEnd && (
            <p className="text-xs text-muted-foreground">
              Renews: {new Date(subscriptionEnd).toLocaleDateString()}
            </p>
          )}
          
          {error && (
            <p className="text-xs text-destructive/80">
              {error}
            </p>
          )}
          
          {checkedAt && (
            <p className="text-xs text-muted-foreground/60">
              Last checked: {new Date(checkedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        
        {!subscribed && status !== 'checking' && status !== 'error' && (
          <div className="p-3 border-t border-border/30">
            <a
              href="/pricing"
              className="block w-full text-center text-xs font-medium text-primary hover:underline"
            >
              View Plans
            </a>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
