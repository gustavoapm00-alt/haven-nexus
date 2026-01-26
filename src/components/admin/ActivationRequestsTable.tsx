import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Eye, Save, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ActivationRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  purchased_item: string | null;
  preferred_systems: string | null;
  notes: string | null;
  created_at: string;
  status: string;
  customer_visible_status: string;
  status_updated_at: string;
  internal_owner: string | null;
  activation_eta: string | null;
  activation_notes_internal: string | null;
  activation_notes_customer: string | null;
  last_notified_status: string | null;
  setup_window: string | null;
}

const STATUS_OPTIONS = [
  { value: 'received', label: 'Received', color: 'bg-muted text-muted-foreground' },
  { value: 'in_review', label: 'In Review', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'awaiting_credentials', label: 'Awaiting Credentials', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'in_build', label: 'In Build', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'testing', label: 'Testing', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'live', label: 'Live', color: 'bg-green-500/20 text-green-400' },
  { value: 'paused', label: 'Paused', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'needs_attention', label: 'Needs Attention', color: 'bg-red-500/20 text-red-400' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'needs_attention', label: 'Needs Attention' },
  { value: 'awaiting_credentials', label: 'Awaiting Credentials' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'live', label: 'Live' },
];

export function ActivationRequestsTable() {
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ActivationRequest | null>(null);
  const [editedRequest, setEditedRequest] = useState<Partial<ActivationRequest>>({});
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('installation_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (filter === 'needs_attention') {
      query = query.eq('status', 'needs_attention');
    } else if (filter === 'awaiting_credentials') {
      query = query.eq('status', 'awaiting_credentials');
    } else if (filter === 'in_progress') {
      query = query.in('status', ['in_review', 'in_build', 'testing']);
    } else if (filter === 'live') {
      query = query.eq('status', 'live');
    }

    const { data, error } = await query;

    if (!error && data) {
      setRequests(data as ActivationRequest[]);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={statusOption?.color || 'bg-muted'}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from('installation_requests')
      .update({
        status: newStatus,
        customer_visible_status: newStatus,
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    toast.success('Status updated');
    fetchRequests();
  };

  const openDetailModal = (request: ActivationRequest) => {
    setSelectedRequest(request);
    setEditedRequest({
      status: request.status,
      customer_visible_status: request.customer_visible_status,
      internal_owner: request.internal_owner,
      activation_eta: request.activation_eta,
      activation_notes_internal: request.activation_notes_internal,
      activation_notes_customer: request.activation_notes_customer,
    });
  };

  const saveRequestDetails = async () => {
    if (!selectedRequest) return;

    setSaving(true);
    const previousStatus = selectedRequest.last_notified_status;
    const newStatus = editedRequest.customer_visible_status;

    const { error } = await supabase
      .from('installation_requests')
      .update({
        ...editedRequest,
        status_updated_at: new Date().toISOString(),
        last_notified_status: newStatus,
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast.error('Failed to save changes');
      setSaving(false);
      return;
    }

    // Send status notification email if status changed
    if (newStatus && previousStatus !== newStatus) {
      try {
        await supabase.functions.invoke('notify-activation-status', {
          body: {
            requestId: selectedRequest.id,
            customerEmail: selectedRequest.email,
            businessName: selectedRequest.name,
            newStatus: newStatus,
            activationEta: editedRequest.activation_eta,
            activationNotes: editedRequest.activation_notes_customer,
            itemName: selectedRequest.purchased_item,
          },
        });
      } catch (e) {
        console.log('Status notification email skipped or failed');
      }
    }

    toast.success('Changes saved');
    setSaving(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Activation Requests</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchRequests}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No activation requests found
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(req.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">{req.name}</TableCell>
                  <TableCell className="text-sm">{req.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {req.purchased_item || '—'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={req.status || 'received'}
                      onValueChange={(value) => handleStatusChange(req.id, value)}
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailModal(req)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activation Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Business Name</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Company</p>
                  <p className="font-medium">{selectedRequest.company || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Purchased Item</p>
                  <p className="font-medium">{selectedRequest.purchased_item || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Preferred Systems</p>
                  <p className="font-medium">{selectedRequest.preferred_systems || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Setup Window</p>
                  <p className="font-medium">{selectedRequest.setup_window || selectedRequest.activation_eta || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Submitted</p>
                  <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Customer Notes</p>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}

              <div className="border-t pt-6 space-y-4">
                <h4 className="font-semibold">Status & Management</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Internal Status</Label>
                    <Select
                      value={editedRequest.status || 'received'}
                      onValueChange={(value) => setEditedRequest({ ...editedRequest, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Customer-Visible Status</Label>
                    <Select
                      value={editedRequest.customer_visible_status || 'received'}
                      onValueChange={(value) => setEditedRequest({ ...editedRequest, customer_visible_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <Input
                      value={editedRequest.internal_owner || ''}
                      onChange={(e) => setEditedRequest({ ...editedRequest, internal_owner: e.target.value })}
                      placeholder="Admin name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Activation ETA</Label>
                    <Input
                      value={editedRequest.activation_eta || ''}
                      onChange={(e) => setEditedRequest({ ...editedRequest, activation_eta: e.target.value })}
                      placeholder="e.g., Within 24 hours"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Internal Notes (not shown to customer)</Label>
                  <Textarea
                    value={editedRequest.activation_notes_internal || ''}
                    onChange={(e) => setEditedRequest({ ...editedRequest, activation_notes_internal: e.target.value })}
                    placeholder="Internal notes..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Customer Notes (visible to customer)</Label>
                  <Textarea
                    value={editedRequest.activation_notes_customer || ''}
                    onChange={(e) => setEditedRequest({ ...editedRequest, activation_notes_customer: e.target.value })}
                    placeholder="Notes visible to the customer..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveRequestDetails} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
