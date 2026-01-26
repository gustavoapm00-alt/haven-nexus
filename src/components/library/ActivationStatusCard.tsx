import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface ActivationRequest {
  id: string;
  name: string;
  purchased_item: string | null;
  customer_visible_status: string;
  status_updated_at: string;
  activation_eta: string | null;
  activation_notes_customer: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  received: { label: 'Request Received', color: 'bg-blue-500/20 text-blue-400', icon: <Clock className="w-4 h-4" /> },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-400', icon: <Clock className="w-4 h-4" /> },
  awaiting_credentials: { label: 'Awaiting Credentials', color: 'bg-yellow-500/20 text-yellow-400', icon: <AlertCircle className="w-4 h-4" /> },
  in_build: { label: 'Building', color: 'bg-purple-500/20 text-purple-400', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  testing: { label: 'Testing', color: 'bg-orange-500/20 text-orange-400', icon: <Clock className="w-4 h-4" /> },
  live: { label: 'Live', color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  paused: { label: 'Paused', color: 'bg-gray-500/20 text-gray-400', icon: <Clock className="w-4 h-4" /> },
  needs_attention: { label: 'Action Needed', color: 'bg-red-500/20 text-red-400', icon: <AlertCircle className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: <CheckCircle className="w-4 h-4" /> },
};

export function ActivationStatusCard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  const fetchRequests = async () => {
    if (!user?.email) return;
    
    const { data, error } = await supabase
      .from('installation_requests')
      .select('id, name, purchased_item, customer_visible_status, status_updated_at, activation_eta, activation_notes_customer')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRequests(data as ActivationRequest[]);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Activation Status</h3>
        <Link to="/activation-setup">
          <Button variant="ghost" size="sm">
            New Request <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {requests.map((req) => {
          const statusConfig = STATUS_CONFIG[req.customer_visible_status] || STATUS_CONFIG.received;
          
          return (
            <div
              key={req.id}
              className="bg-background/50 border border-border/50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {req.purchased_item || 'Activation Request'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {req.name}
                  </p>
                </div>
                <Badge className={`flex items-center gap-1.5 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="text-foreground">{formatDate(req.status_updated_at)}</p>
                </div>
                {req.activation_eta && (
                  <div>
                    <p className="text-muted-foreground">ETA</p>
                    <p className="text-foreground">{req.activation_eta}</p>
                  </div>
                )}
              </div>

              {req.activation_notes_customer && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Note from AERELION:</p>
                  <p className="text-sm text-foreground bg-primary/5 rounded-lg p-3 border border-primary/20">
                    {req.activation_notes_customer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
