import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEngagementRequests, type EngagementRequest } from '@/hooks/useEngagementRequests';
import { useAgentRecommendations } from '@/hooks/useAgentRecommendations';
import { AgentRecommendationPanel } from '@/components/admin/AgentRecommendationPanel';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, LogOut, ArrowLeft, RefreshCw, Filter, Search, Download,
  Mail, Building2, Globe, Users, Target, Calendar,
  Clock, MessageSquare, CheckCircle2, AlertCircle, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { value: 'in_review', label: 'In Review', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { value: 'active', label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { value: 'completed', label: 'Completed', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'closed', label: 'Closed', color: 'bg-muted text-muted-foreground border-border' },
];

const GOAL_LABELS: Record<string, string> = {
  'lead-followup': 'Lead Follow-up',
  'client-onboarding': 'Client Onboarding',
  'inbox-relief': 'Inbox Relief',
  'reporting': 'Reporting',
  'internal-ops': 'Internal Ops',
  'other': 'Other',
};

// Sort key options
const SORT_KEY_OPTIONS = [
  { value: 'created_at', label: 'Created date' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'last_contacted_at', label: 'Last contacted' },
] as const;

type SortKey = 'created_at' | 'name' | 'status' | 'last_contacted_at';
type SortDir = 'asc' | 'desc';

// Status priority for sorting (lower = higher priority)
const STATUS_PRIORITY: Record<string, number> = {
  new: 0,
  in_review: 1,
  scheduled: 2,
  active: 3,
  completed: 4,
  closed: 5,
};

function getStatusBadge(status: string) {
  const option = STATUS_OPTIONS.find(s => s.value === status);
  return option || STATUS_OPTIONS[0];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Safe renderer for current_tools
function CurrentToolsDisplay({ tools }: { tools: string[] | string | null }) {
  if (!tools) {
    return <span className="text-sm text-muted-foreground">None specified</span>;
  }

  let parsedTools: string[] = [];

  if (Array.isArray(tools)) {
    parsedTools = tools.filter(Boolean);
  } else if (typeof tools === 'string') {
    const trimmed = tools.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        parsedTools = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        parsedTools = trimmed.split(',').map(t => t.trim()).filter(Boolean);
      }
    } else if (trimmed) {
      parsedTools = trimmed.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  if (parsedTools.length === 0) {
    return <span className="text-sm text-muted-foreground">None specified</span>;
  }

  return (
    <>
      {parsedTools.map((tool, idx) => (
        <Badge key={`${tool}-${idx}`} variant="secondary">{tool}</Badge>
      ))}
    </>
  );
}

// CSV escape helper
function escapeCSV(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Format current_tools for CSV
function formatToolsForCSV(tools: string[] | string | null): string {
  if (!tools) return '';
  if (Array.isArray(tools)) return tools.filter(Boolean).join(' | ');
  const trimmed = String(tools).trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.filter(Boolean).join(' | ') : trimmed;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

const AdminEngagementRequests = () => {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { requests, newCount, isLoading, refresh, updateRequest, markAsSeen, markContacted } = useEngagementRequests();
  const { result: aiResult, isLoading: aiLoading, error: aiError, getRecommendations, clear: clearRecommendations } = useAgentRecommendations();
  
  const [filter, setFilter] = useState<'all' | 'new'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedRequest, setSelectedRequest] = useState<EngagementRequest | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    let result = requests;
    
    // (a) Apply status filter first
    if (filter === 'new') {
      result = result.filter(r => r.status === 'new');
    }
    
    // (b) Apply date filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(r => new Date(r.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(r => new Date(r.created_at) <= toDate);
    }
    
    // (c) Apply search if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        (r.company_name?.toLowerCase().includes(query) ?? false) ||
        (r.website?.toLowerCase().includes(query) ?? false) ||
        r.operational_pain.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [requests, filter, searchQuery, dateFrom, dateTo]);

  // Sort the filtered results
  const sortedRequests = useMemo(() => {
    const sorted = [...filteredRequests];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case 'created_at': {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        }
        case 'name': {
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          break;
        }
        case 'status': {
          const aPriority = STATUS_PRIORITY[a.status] ?? 99;
          const bPriority = STATUS_PRIORITY[b.status] ?? 99;
          comparison = aPriority - bPriority;
          break;
        }
        case 'last_contacted_at': {
          // Nulls always sort last regardless of direction
          if (!a.last_contacted_at && !b.last_contacted_at) {
            comparison = 0;
          } else if (!a.last_contacted_at) {
            return 1; // a goes last
          } else if (!b.last_contacted_at) {
            return -1; // b goes last
          } else {
            comparison = new Date(a.last_contacted_at).getTime() - new Date(b.last_contacted_at).getTime();
          }
          break;
        }
      }
      
      // Apply direction
      if (sortKey !== 'last_contacted_at' || (a.last_contacted_at && b.last_contacted_at)) {
        comparison = sortDir === 'desc' ? -comparison : comparison;
      }
      
      // Stable sort: fall back to created_at desc if equal
      if (comparison === 0) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      return comparison;
    });
    
    return sorted;
  }, [filteredRequests, sortKey, sortDir]);

  // Export to CSV
  const exportToCSV = () => {
    if (sortedRequests.length === 0) {
      toast({
        title: 'Nothing to export',
        description: 'No matches in your current filters',
      });
      return;
    }
    const headers = [
      'created_at', 'status', 'admin_seen', 'name', 'email', 'company_name',
      'website', 'team_size', 'primary_goal', 'operational_pain', 'calm_in_30_days',
      'current_tools', 'notes_internal', 'last_contacted_at'
    ];
    
    const rows = sortedRequests.map(r => [
      escapeCSV(r.created_at),
      escapeCSV(r.status),
      escapeCSV(String(r.admin_seen ?? false)),
      escapeCSV(r.name),
      escapeCSV(r.email),
      escapeCSV(r.company_name),
      escapeCSV(r.website),
      escapeCSV(r.team_size),
      escapeCSV(r.primary_goal),
      escapeCSV(r.operational_pain),
      escapeCSV(r.calm_in_30_days),
      escapeCSV(formatToolsForCSV(r.current_tools)),
      escapeCSV(r.notes_internal),
      escapeCSV(r.last_contacted_at),
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `engagement-requests-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export ready',
      description: `Downloaded ${sortedRequests.length} request${sortedRequests.length !== 1 ? 's' : ''}`,
    });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/portal/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const openDetail = async (request: EngagementRequest) => {
    setSelectedRequest(request);
    setEditingNotes(request.notes_internal || '');
    setEditingStatus(request.status);
    
    // Mark as seen when opened
    if (!(request.admin_seen ?? false)) {
      await markAsSeen(request.id);
    }
  };

  const closeDetail = () => {
    setSelectedRequest(null);
    setEditingNotes('');
    setEditingStatus('');
    clearRecommendations();
  };

  const handleSave = async () => {
    if (!selectedRequest) return;
    
    setSaving(true);
    const { error } = await updateRequest(selectedRequest.id, {
      status: editingStatus,
      notes_internal: editingNotes,
    });
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Request updated' });
      setSelectedRequest(prev => prev ? { ...prev, status: editingStatus, notes_internal: editingNotes } : null);
    }
    setSaving(false);
  };

  const handleMarkContacted = async () => {
    if (!selectedRequest) return;
    
    const { error } = await markContacted(selectedRequest.id);
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Marked as contacted' });
      setSelectedRequest(prev => prev ? { ...prev, last_contacted_at: new Date().toISOString() } : null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-xl">Engagement Requests</h1>
              {newCount > 0 && (
                <p className="text-sm text-muted-foreground">{newCount} new request{newCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* New Requests Banner */}
        {newCount > 0 && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">
              {newCount} new engagement request{newCount > 1 ? 's' : ''} pending review
            </span>
          </div>
        )}

        {/* Search + Filter */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, company, website, pain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({requests.length})
                </Button>
                <Button
                  variant={filter === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('new')}
                >
                  New ({requests.filter(r => r.status === 'new').length})
                </Button>
              </div>
            </div>
          </div>

          {/* Date Range Filter + Export */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">From:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <span className="text-sm text-muted-foreground">To:</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_KEY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                className="w-16"
              >
                {sortDir === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>
            
            <div className="sm:ml-auto">
              <Button variant="outline" size="sm" onClick={exportToCSV} disabled={sortedRequests.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm text-muted-foreground mb-4">
          {sortedRequests.length === 0 
            ? 'No matches' 
            : `${sortedRequests.length} result${sortedRequests.length !== 1 ? 's' : ''}`}
        </p>

        {/* Request List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No engagement requests {filter === 'new' ? 'pending review' : 'yet'}
          </div>
        ) : (
          <div className="card-glass rounded-lg overflow-hidden divide-y divide-border">
            {sortedRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              return (
                <button
                  key={request.id}
                  onClick={() => openDetail(request)}
                  className="w-full p-4 text-left hover:bg-secondary/30 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium truncate">{request.name}</span>
                      {!(request.admin_seen ?? false) && request.status === 'new' && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{request.email}</p>
                    {request.primary_goal && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {GOAL_LABELS[request.primary_goal] || request.primary_goal}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="outline" className={statusBadge.color}>
                      {statusBadge.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(request.created_at)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Sheet */}
      <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && closeDetail()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedRequest && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-left">{selectedRequest.name}</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedRequest.email}`} className="text-primary hover:underline">
                      {selectedRequest.email}
                    </a>
                  </div>
                  {selectedRequest.company_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      {selectedRequest.company_name}
                    </div>
                  )}
                  {selectedRequest.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={selectedRequest.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                        {selectedRequest.website}
                      </a>
                    </div>
                  )}
                  {selectedRequest.team_size && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Team: {selectedRequest.team_size}
                    </div>
                  )}
                  {selectedRequest.primary_goal && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      Goal: {GOAL_LABELS[selectedRequest.primary_goal] || selectedRequest.primary_goal}
                    </div>
                  )}
                </div>

                {/* Tools */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    <CurrentToolsDisplay tools={selectedRequest.current_tools} />
                  </div>
                </div>

                {/* Pain Point */}
                {selectedRequest.operational_pain && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Biggest Operational Pain</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                      {selectedRequest.operational_pain}
                    </p>
                  </div>
                )}

                {/* Calm Vision */}
                {selectedRequest.calm_in_30_days && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">"Calm" in 30 Days</h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {selectedRequest.calm_in_30_days}
                    </p>
                  </div>
                )}

                {/* AI Agent Recommendations */}
                <AgentRecommendationPanel
                  result={aiResult}
                  isLoading={aiLoading}
                  error={aiError}
                  onGenerate={() => getRecommendations(selectedRequest.id)}
                />

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Submitted: {formatDate(selectedRequest.created_at)}
                  </div>
                  {selectedRequest.last_contacted_at && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Last contacted: {formatDate(selectedRequest.last_contacted_at)}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <Select value={editingStatus} onValueChange={setEditingStatus}>
                    <SelectTrigger>
                      <SelectValue />
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

                {/* Internal Notes */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Internal Notes</h4>
                  <Textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleMarkContacted}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mark Contacted
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminEngagementRequests;
