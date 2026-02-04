import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminGate from '@/components/AdminGate';
import { useAdminN8nMappings } from '@/hooks/useAdminN8nMappings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Workflow,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreVertical,
  Play,
  Pause,
  RotateCcw,
  Power,
  ExternalLink,
  Loader2,
  Zap,
  Ban,
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'provisioning', label: 'Provisioning' },
  { value: 'paused', label: 'Paused' },
  { value: 'error', label: 'Error' },
  { value: 'revoked', label: 'Revoked' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case 'provisioning':
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Provisioning
        </Badge>
      );
    case 'paused':
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          <Pause className="w-3 h-3 mr-1" />
          Paused
        </Badge>
      );
    case 'error':
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    case 'revoked':
      return (
        <Badge className="bg-muted text-muted-foreground border-muted">
          <Ban className="w-3 h-3 mr-1" />
          Revoked
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

export default function AdminN8nMappings() {
  const { mappings, loading, refreshing, actionLoading, refresh, performAction } = useAdminN8nMappings();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'revoke' | 'pause' | 'resume' | 'retrigger' | null;
    mappingId: string;
    activationId: string;
  }>({ open: false, action: null, mappingId: '', activationId: '' });

  const filteredMappings = useMemo(() => {
    return mappings.filter((m) => {
      const matchesSearch =
        !search ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.user_id.toLowerCase().includes(search.toLowerCase()) ||
        m.automation_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.user_email?.toLowerCase().includes(search.toLowerCase()) ||
        m.activation_request_id?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [mappings, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: mappings.length,
      active: mappings.filter((m) => m.status === 'active').length,
      paused: mappings.filter((m) => m.status === 'paused').length,
      revoked: mappings.filter((m) => m.status === 'revoked').length,
      error: mappings.filter((m) => m.status === 'error').length,
    };
  }, [mappings]);

  const handleAction = (
    action: 'revoke' | 'pause' | 'resume' | 'retrigger',
    mappingId: string,
    activationId: string
  ) => {
    if (action === 'revoke') {
      setConfirmDialog({ open: true, action, mappingId, activationId });
    } else {
      performAction(activationId, action);
    }
  };

  const confirmAction = () => {
    if (confirmDialog.action && confirmDialog.activationId) {
      performAction(confirmDialog.activationId, confirmDialog.action);
    }
    setConfirmDialog({ open: false, action: null, mappingId: '', activationId: '' });
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-display flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                    <Workflow className="w-6 h-6 text-primary" />
                  </div>
                  n8n Workflow Mappings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage provisioned workflows and lifecycle actions
                </p>
              </div>
            </div>
            <Button onClick={refresh} variant="outline" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Total Mappings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display">{stats.total}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="border-green-500/30 bg-green-500/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-green-400">{stats.active}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-orange-500/30 bg-orange-500/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-orange-400">
                    <Pause className="w-4 h-4" />
                    Paused
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-orange-400">{stats.paused}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-muted bg-muted/20 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4" />
                    Revoked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-muted-foreground">{stats.revoked}</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-red-500/30 bg-red-500/5 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    Errors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-red-400">{stats.error}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, user, automation, or customer..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Mappings Table */}
          <Card className="border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mapping ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Automation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workflow IDs</TableHead>
                    <TableHead>Webhook URL</TableHead>
                    <TableHead>Provisioned</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading mappings...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredMappings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Workflow className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No mappings found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMappings.map((mapping) => {
                      const isActionLoading = actionLoading?.startsWith(mapping.activation_request_id || '');
                      
                      return (
                        <TableRow key={mapping.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <code className="text-xs font-mono text-muted-foreground">
                              {mapping.id.slice(0, 8)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">
                                {mapping.customer_name || 'Unknown'}
                              </span>
                              {mapping.user_email && (
                                <span className="text-xs text-muted-foreground">
                                  {mapping.user_email}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                {mapping.automation_name || mapping.bundle_name || 'Unknown'}
                              </span>
                              {mapping.automation_slug && (
                                <code className="text-xs text-muted-foreground">
                                  {mapping.automation_slug}
                                </code>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(mapping.status)}
                              {mapping.error_message && (
                                <span className="text-xs text-red-400 max-w-[200px] truncate" title={mapping.error_message}>
                                  {mapping.error_message}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {mapping.n8n_workflow_ids.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {mapping.n8n_workflow_ids.map((wid) => (
                                  <code key={wid} className="text-xs font-mono text-primary">
                                    {wid}
                                  </code>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {mapping.webhook_url ? (
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono text-muted-foreground max-w-[200px] truncate" title={mapping.webhook_url}>
                                  ...{mapping.webhook_url.slice(-30)}
                                </code>
                                <a
                                  href={mapping.webhook_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {mapping.provisioned_at ? (
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(mapping.provisioned_at), 'MMM d, yyyy')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {mapping.activation_request_id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={isActionLoading}>
                                    {isActionLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <MoreVertical className="w-4 h-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {mapping.status === 'active' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleAction('pause', mapping.id, mapping.activation_request_id!)}
                                      >
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pause
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleAction('retrigger', mapping.id, mapping.activation_request_id!)}
                                      >
                                        <Zap className="w-4 h-4 mr-2" />
                                        Retrigger
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {mapping.status === 'paused' && (
                                    <DropdownMenuItem
                                      onClick={() => handleAction('resume', mapping.id, mapping.activation_request_id!)}
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Resume
                                    </DropdownMenuItem>
                                  )}
                                  {mapping.status === 'error' && (
                                    <DropdownMenuItem
                                      onClick={() => handleAction('retrigger', mapping.id, mapping.activation_request_id!)}
                                    >
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Retry
                                    </DropdownMenuItem>
                                  )}
                                  {mapping.status !== 'revoked' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleAction('revoke', mapping.id, mapping.activation_request_id!)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Power className="w-4 h-4 mr-2" />
                                        Revoke
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {mapping.status === 'revoked' && (
                                    <DropdownMenuItem disabled className="text-muted-foreground">
                                      <Ban className="w-4 h-4 mr-2" />
                                      Revoked (no actions)
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Confirm Dialog */}
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, mappingId: '', activationId: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Revoke</AlertDialogTitle>
              <AlertDialogDescription>
                This will deactivate the n8n workflow and mark the activation as revoked. 
                This action cannot be undone from this panel. The customer will need to request reactivation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Revoke Workflow
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminGate>
  );
}
