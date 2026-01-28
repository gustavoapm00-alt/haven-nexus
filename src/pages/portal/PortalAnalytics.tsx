import { useNavigate, Link } from 'react-router-dom';
import { useActivationStatus } from '@/hooks/useActivationStatus';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';
import { 
  Loader2, Package, Activity, Clock, RefreshCw, 
  CheckCircle, AlertTriangle, Lock, PauseCircle, ChevronRight
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', color: 'text-emerald-500', icon: CheckCircle },
  in_review: { label: 'In Review', color: 'text-blue-500', icon: Clock },
  pending_credentials: { label: 'Awaiting Connection', color: 'text-amber-500', icon: Lock },
  paused: { label: 'Paused', color: 'text-muted-foreground', icon: PauseCircle },
  needs_attention: { label: 'Needs Attention', color: 'text-red-500', icon: AlertTriangle },
};

export default function PortalAnalytics() {
  const navigate = useNavigate();
  const { activeAutomations, loading, refetch } = useActivationStatus();

  if (loading) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  // Group by status for summary
  const statusCounts = activeAutomations.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PortalBackground>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Activation History</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track the status of your automation activations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeAutomations.length}</p>
                  <p className="text-xs text-muted-foreground">Total Automations</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.active || 0}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.in_review || 0}</p>
                  <p className="text-xs text-muted-foreground">In Review</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.pending_credentials || 0}</p>
                  <p className="text-xs text-muted-foreground">Awaiting Connection</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Activation Timeline */}
          <GlassCard className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activation Timeline
            </h3>

            {activeAutomations.length > 0 ? (
              <div className="space-y-4">
                {activeAutomations.map((automation) => {
                  const statusInfo = STATUS_LABELS[automation.status] || STATUS_LABELS.in_review;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div 
                      key={automation.purchase_id}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{automation.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 text-xs ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • Purchased {new Date(automation.purchased_at).toLocaleDateString()}
                            </span>
                          </div>
                          {automation.activation_eta && automation.status === 'in_review' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ETA: {automation.activation_eta}
                            </p>
                          )}
                        </div>
                      </div>

                      <Link
                        to={automation.activation_request_id 
                          ? `/activation-request/${automation.activation_request_id}` 
                          : `/automations/${automation.id}`
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h4 className="font-medium mb-2">No activations yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Purchase an automation to start the activation process
                </p>
                <Link
                  to="/automations"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Browse Automations
                </Link>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PortalBackground>
  );
}
