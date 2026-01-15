import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  RefreshCw, 
  Search, 
  Trash2,
  XCircle,
  Info
} from 'lucide-react';
import { useEdgeFunctionLogs, LogLevel, EdgeFunctionLog } from '@/hooks/useEdgeFunctionLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const FUNCTION_OPTIONS = [
  { value: '', label: 'All Functions' },
  { value: 'check-subscription', label: 'check-subscription' },
  { value: 'billing-portal-session', label: 'billing-portal-session' },
  { value: 'stripe-portal-webhook', label: 'stripe-portal-webhook' },
  { value: 'get-usage-analytics', label: 'get-usage-analytics' },
  { value: 'create-library-checkout', label: 'create-library-checkout' },
  { value: 'library-webhook', label: 'library-webhook' },
  { value: 'get-download-links', label: 'get-download-links' },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'error', label: 'Error' },
  { value: 'warn', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' },
];

function getLevelIcon(level: LogLevel) {
  switch (level) {
    case 'error':
      return <XCircle className="w-4 h-4 text-destructive" />;
    case 'warn':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'info':
      return <Info className="w-4 h-4 text-blue-500" />;
    default:
      return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
  }
}

function getLevelBadgeVariant(level: LogLevel): 'destructive' | 'secondary' | 'default' | 'outline' {
  switch (level) {
    case 'error':
      return 'destructive';
    case 'warn':
      return 'secondary';
    case 'info':
      return 'default';
    default:
      return 'outline';
  }
}

function LogRow({ log }: { log: EdgeFunctionLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-colors",
        log.level === 'error' && "border-destructive/30 bg-destructive/5",
        log.level === 'warn' && "border-yellow-500/30 bg-yellow-500/5",
        log.level === 'info' && "border-border bg-card",
        log.level === 'debug' && "border-border bg-muted/30"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {getLevelIcon(log.level)}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
              {log.level.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono">
              {log.function_name}
            </Badge>
            {log.status_code && (
              <Badge 
                variant={log.status_code >= 400 ? 'destructive' : 'secondary'} 
                className="text-xs"
              >
                {log.status_code}
              </Badge>
            )}
            {log.duration_ms && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {log.duration_ms}ms
              </span>
            )}
          </div>
          
          <p className="text-sm mt-1 text-foreground">{log.message}</p>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
            {log.ip_address && <span>IP: {log.ip_address}</span>}
            {log.user_id && <span>User: {log.user_id.substring(0, 8)}...</span>}
          </div>
        </div>
      </div>

      {expanded && log.details && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t"
        >
          <pre className="text-xs font-mono bg-muted/50 p-2 rounded overflow-x-auto">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AdminMonitoring() {
  const [functionName, setFunctionName] = useState('');
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');

  const { logs, stats, isLoading, error, refresh, clearLogs } = useEdgeFunctionLogs({
    functionName: functionName || undefined,
    level: (level as LogLevel) || undefined,
    search: search || undefined,
    limit: 200,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edge Function Monitoring</h1>
            <p className="text-muted-foreground mt-1">Real-time logs and error tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearLogs}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className={stats.errors > 0 ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
              <p className="text-xs text-muted-foreground">{stats.errorRate}% error rate</p>
            </CardContent>
          </Card>

          <Card className={stats.warnings > 0 ? "border-yellow-500/50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-500">{stats.warnings}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.avgDuration}ms</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={functionName} onValueChange={setFunctionName}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Functions" />
                </SelectTrigger>
                <SelectContent>
                  {FUNCTION_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Logs
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8 text-destructive">
                <XCircle className="w-8 h-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            )}

            {!error && logs.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No logs found</p>
                <p className="text-sm">Logs will appear here in real-time</p>
              </div>
            )}

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
