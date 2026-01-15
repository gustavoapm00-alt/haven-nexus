import { useNavigate } from 'react-router-dom';
import { useUsageAnalytics, DailyDataPoint } from '@/hooks/useUsageAnalytics';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';
import { 
  Loader2, Download, Zap, Activity, Clock, RefreshCw, 
  ArrowRight, TrendingUp
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const chartConfig = {
  downloads: {
    label: "Downloads",
    color: "hsl(var(--primary))",
  },
  installs: {
    label: "Installs",
    color: "hsl(var(--accent))",
  },
  activity: {
    label: "Activity",
    color: "hsl(var(--muted-foreground))",
  },
};

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  trend 
}: { 
  icon: typeof Download; 
  label: string; 
  value: number; 
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend === 'up' && (
          <TrendingUp className="w-4 h-4 text-primary" />
        )}
      </div>
      <p className="text-2xl font-bold mt-4">{value.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground/70 mt-1">{subValue}</p>
      )}
    </GlassCard>
  );
}

function ActivityChart({ data }: { data: DailyDataPoint[] }) {
  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Activity (Last 30 Days)</h3>
      </div>
      <div className="h-64">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="downloads"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorDownloads)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </GlassCard>
  );
}

function RecentActivityTable({ events }: { events: Array<{ id: string; event_type: string; item_type: string | null; created_at: string }> }) {
  const eventIcons: Record<string, typeof Download> = {
    download: Download,
    install: Zap,
    activity: Activity,
    login: Clock,
  };

  return (
    <GlassCard className="p-5">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map(event => {
            const Icon = eventIcons[event.event_type] || Activity;
            return (
              <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{event.event_type}</p>
                  {event.item_type && (
                    <p className="text-xs text-muted-foreground capitalize">{event.item_type}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </div>
      )}
    </GlassCard>
  );
}

export default function PortalAnalytics() {
  const navigate = useNavigate();
  const { data, isLoading, error, refresh } = useUsageAnalytics();

  if (isLoading && !data) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  return (
    <PortalBackground>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Download Activity</h1>
              <p className="text-muted-foreground text-sm mt-1">
                View your downloads and account activity
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
              <button
                onClick={() => navigate('/portal/dashboard')}
                className="text-sm text-primary hover:underline"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {error && (
            <GlassCard variant="accent" className="p-4">
              <p className="text-sm text-destructive">{error}</p>
            </GlassCard>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Download}
              label="Total Downloads"
              value={data?.lifetime.downloads || 0}
              subValue={`${data?.last30d.downloads || 0} this month`}
              trend={data && data.last30d.downloads > 0 ? 'up' : undefined}
            />
            <StatCard
              icon={Zap}
              label="Installs"
              value={data?.lifetime.installs || 0}
              subValue={`${data?.last30d.installs || 0} this month`}
            />
            <StatCard
              icon={Activity}
              label="Total Activity"
              value={(data?.lifetime.downloads || 0) + (data?.lifetime.installs || 0)}
              subValue="Downloads + Installs"
            />
            <StatCard
              icon={Clock}
              label="Last Active"
              value={0}
              subValue={data?.last_activity_at 
                ? new Date(data.last_activity_at).toLocaleDateString() 
                : 'Never'}
            />
          </div>

          {/* Chart + Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityChart data={data?.daily_series || []} />
            </div>
            <div>
              <RecentActivityTable events={data?.recent_events || []} />
            </div>
          </div>
        </div>
      </div>
    </PortalBackground>
  );
}
