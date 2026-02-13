import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useBillingPortal } from '@/hooks/useBillingPortal';
import PortalBackground from '@/components/portal/PortalBackground';
import { GlassCard } from '@/components/portal/GlassCard';
import { 
  Loader2, CreditCard, ExternalLink, Calendar, CheckCircle, 
  XCircle, AlertTriangle, RefreshCw, ArrowRight
} from 'lucide-react';
import { STRIPE_TIERS, getTierByProductId } from '@/lib/stripe-config';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function PortalBilling() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { status, subscribed, productId, priceId, subscriptionEnd, refresh, isLoading: statusLoading } = useSubscriptionStatus();
  const { openBillingPortal, isLoading: portalLoading } = useBillingPortal();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const currentTier = productId ? getTierByProductId(productId) : null;
  const currentTierConfig = currentTier ? STRIPE_TIERS[currentTier] : null;

  const handleCheckout = async (tierKey: string) => {
    if (!session?.access_token) {
      toast({ title: 'Please sign in first', variant: 'destructive' });
      return;
    }

    const tier = STRIPE_TIERS[tierKey as keyof typeof STRIPE_TIERS];
    if (!tier) return;

    setCheckoutLoading(tierKey);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast({
        title: 'Checkout failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const statusIcon = {
    active: <CheckCircle className="w-5 h-5 text-primary" />,
    inactive: <XCircle className="w-5 h-5 text-muted-foreground" />,
    unknown: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    checking: <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />,
    error: <AlertTriangle className="w-5 h-5 text-destructive" />,
  };

  return (
    <PortalBackground>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Billing & Subscription</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your plan and payment settings
              </p>
            </div>
            <button
              onClick={() => navigate('/portal/dashboard')}
              className="text-sm text-primary hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Current Plan */}
          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {currentTierConfig?.name || 'Free Plan'}
                    </h3>
                    {statusIcon[status]}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    Status: {status}
                  </p>
                  {subscriptionEnd && subscribed && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Renews: {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refresh()}
                  disabled={statusLoading}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
                </button>
                {subscribed && (
                  <button
                    onClick={() => openBillingPortal()}
                    disabled={portalLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Manage Billing
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Plan Options */}
          {!subscribed && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose a Plan</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(STRIPE_TIERS).map(([key, tier]) => {
                  const isCurrentPlan = currentTier === key;
                  
                  return (
                    <GlassCard 
                      key={key} 
                      className={`p-5 ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <h4 className="font-semibold">{tier.name}</h4>
                          <p className="text-2xl font-bold mt-2">
                            {tier.price}
                            <span className="text-sm font-normal text-muted-foreground">/mo</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleCheckout(key)}
                          disabled={isCurrentPlan || checkoutLoading === key}
                          className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isCurrentPlan
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          {checkoutLoading === key ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : (
                            <>
                              REQUEST SCOPING
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upgrade Options for Active Subscribers */}
          {subscribed && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Change Plan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use the billing portal to upgrade, downgrade, or cancel your subscription.
              </p>
              <button
                onClick={() => openBillingPortal()}
                disabled={portalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Open Billing Portal
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </GlassCard>
          )}
        </div>
      </div>
    </PortalBackground>
  );
}
