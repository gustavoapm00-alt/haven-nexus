import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ActivationRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  purchased_item: string | null;
  preferred_systems: string | null;
  notes: string | null;
  created_at: string;
}

export function ActivationRequestsTable() {
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ActivationRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('installation_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (!error && data) {
      setRequests(data);
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
        <h3 className="text-lg font-semibold">Recent Activation Requests</h3>
        <Button variant="ghost" size="sm" onClick={fetchRequests}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No activation requests yet
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Purchased Item</TableHead>
                <TableHead>Systems</TableHead>
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
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {req.preferred_systems || '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRequest(req)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activation Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
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
                  <p className="text-muted-foreground mb-1">Submitted</p>
                  <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div>
                  <p className="text-muted-foreground mb-2 text-sm">Notes</p>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
