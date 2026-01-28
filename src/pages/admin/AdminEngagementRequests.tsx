import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEngagementRequests, type EngagementRequest } from '@/hooks/useEngagementRequests';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, LogOut, ArrowLeft, RefreshCw, Filter, 
  Mail, Phone, Building2, Globe, Users, Target,
  Clock, MessageSquare, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const AdminEngagementRequests = () => {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { requests, newCount, isLoading, refresh, updateRequest, markAsSeen, markContacted } = useEngagementRequests();
  
  const [filter, setFilter] = useState<'all' | 'new'>('all');
  const [selectedRequest, setSelectedRequest] = useState<EngagementRequest | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [saving, setSaving] = useState(false);

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
    if (!request.admin_seen) {
      await markAsSeen(request.id);
    }
  };

  const closeDetail = () => {
    setSelectedRequest(null);
    setEditingNotes('');
    setEditingStatus('');
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

  const filteredRequests = filter === 'new' 
    ? requests.filter(r => r.status === 'new')
    : requests;

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

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
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

        {/* Request List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No engagement requests {filter === 'new' ? 'pending review' : 'yet'}
          </div>
        ) : (
          <div className="card-glass rounded-lg overflow-hidden divide-y divide-border">
            {filteredRequests.map((request) => {
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
                      {!request.admin_seen && request.status === 'new' && (
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
                {selectedRequest.current_tools && selectedRequest.current_tools.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.current_tools.map((tool) => (
                        <Badge key={tool} variant="secondary">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pain Point */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Biggest Operational Pain</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                    {selectedRequest.operational_pain}
                  </p>
                </div>

                {/* Calm Vision */}
                {selectedRequest.calm_in_30_days && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">"Calm" in 30 Days</h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      {selectedRequest.calm_in_30_days}
                    </p>
                  </div>
                )}

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
