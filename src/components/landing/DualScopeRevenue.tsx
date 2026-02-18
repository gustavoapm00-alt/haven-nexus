import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Ghost, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_TIERS, type TierKey } from '@/lib/stripe-config';
import { toast } from 'sonner';

const tierMeta: Record<TierKey, {
  scope: string;
  priceRange: string;
  interval: string;
  description: string;
  includes: string[];
  sla: string;
  designation: string;
  cta: string;
  icon: typeof Zap;
  highlight: boolean;
  accentColor: string;
}> = {
  pulse: {
    scope: 'SCOPE_1 // SELF-SERVE SYSTEM ACCESS',
    priceRange: '$99',
    interval: '/MO',
    description:
      'Ticket-based intake for managed outcomes. Standardized guardrailed workflows deployed on AERELION infrastructure with full provenance logging.',
    includes: [
      'Up to 3 active guardrailed workflows',
      '72h SLA on ticket resolution',
      'Immutable execution provenance',
      'Monthly operational briefing',
      'Nexus HUD read-only access',
    ],
    sla: '72H',
    designation: 'SENTINEL_ACCESS',
    cta: 'INITIATE HANDOFF',
    icon: Zap,
    highlight: false,
    accentColor: 'rgba(57,255,20,0.15)',
  },
  operator: {
    scope: 'SCOPE_2 // ENTERPRISE GOVERNANCE',
    priceRange: '$2,500',
    interval: '/MO',
    description:
      'Bespoke infrastructure for defense primes and compliance-critical entities. Dedicated operator node with continuous drift detection and autonomous governance.',
    includes: [
      'Unlimited guardrailed workflows',
      '8h SLA — priority operator queue',
      'Dedicated COOP logic stabilization',
      'NIST 800-171 / CMMC L2 alignment',
      'Full Nexus Command HUD access',
      'Weekly executive AAR briefings',
      'Dedicated Sentinel + Watchman agents',
    ],
    sla: '8H',
    designation: 'COMMAND_ACCESS',
    cta: 'REQUEST SCOPING',
    icon: Shield,
    highlight: true,
    accentColor: 'rgba(57,255,20,0.25)',
  },
  ghost: {
    scope: 'SCOPE_2+ // BESPOKE ENGAGEMENT',
    priceRange: '$25K',
    interval: 'FIXED',
    description:
      'Zero-UI operational doctrine. Fully autonomous infrastructure — invisible to end-users, self-healing, immutable. The system runs. You never see it.',
    includes: [
      'Complete Elite 7 agent deployment',
      'Custom logic hardening & entropy reduction',
      'Shadow Command Center access',
      'Dedicated infrastructure provenance node',
      'Quarterly governance review & AAR',
      'White-glove handoff & training',
      'Immutable operational provenance trail',
    ],
    sla: 'DEDICATED',
    designation: 'GHOST_CLEARANCE',
    cta: 'REQUEST GHOST BRIEFING',
    icon: Ghost,
    highlight: false,
    accentColor: 'rgba(255,191,0,0.1)',
  },
};

const DualScopeRevenue = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<TierKey | null>(null);

  const handleCheckout = async (tierKey: TierKey) => {
    if (!user || !session?.access_token) {
      toast.info('Authentication required', {
        description: 'Sign in to initiate system handoff.',
        action: { label: 'Sign In', onClick: () => navigate('/auth?redirect=/') },
      });
      return;
    }
    const tier = STRIPE_TIERS[tierKey];
    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: tier.priceId, mode: tier.mode },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw new Error(error.message);
      if (data?.url) window.location.href = data.url;
      else throw new Error('No checkout URL received');
    } catch (err) {
      toast.error('Checkout initiation failed', {
        description: err instanceof Error ? err.message : 'Please retry.',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const tierKeys: TierKey[] = ['pulse', 'operator', 'ghost'];

  return (
    <section className="section-padding bg-[#040404] relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(57,255,20,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#040404] via-transparent to-[#040404] pointer-events-none" />

      <div className="container-main relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-4 block">
            // REVENUE ENGINE // DUAL-SCOPE MODEL
          </span>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#E0E0E0] mb-5 tracking-tight">
            System Access Levels
          </h2>
          <p className="font-sans text-sm text-white/30 max-w-lg mx-auto leading-relaxed">
            Subscription tiers represent governance levels — not product purchases.
            Each tier grants progressively deeper access to the Nexus operational infrastructure.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid lg:grid-cols-3 gap-0">
          {tierKeys.map((tierKey, i) => {
            const stripe = STRIPE_TIERS[tierKey];
            const meta = tierMeta[tierKey];
            const Icon = meta.icon;
            const isLoading = loadingTier === tierKey;

            return (
              <motion.div
                key={stripe.codename}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.14, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col transition-all duration-500 group ${
                  meta.highlight
                    ? 'border border-[#39FF14]/40 shadow-[0_0_50px_rgba(57,255,20,0.07),inset_0_0_40px_rgba(57,255,20,0.02)] z-10 scale-[1.02]'
                    : 'border border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Green top bar on highlight */}
                {meta.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent" />
                )}

                {/* Card header */}
                <div className="p-7 pb-5">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] text-[#39FF14]/40 tracking-[0.2em]">
                          {stripe.codename}
                        </span>
                        {meta.highlight && (
                          <span className="font-mono text-[8px] text-black bg-[#39FF14] px-1.5 py-0.5 tracking-[0.15em]">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <h3 className="font-mono text-xl font-bold text-[#E0E0E0] tracking-wide">
                        {stripe.name.toUpperCase()}
                      </h3>
                    </div>
                    <div className={`p-2 border ${meta.highlight ? 'border-[#39FF14]/30 bg-[#39FF14]/5' : 'border-white/10'}`}>
                      <Icon className={`w-4 h-4 ${meta.highlight ? 'text-[#39FF14]/70' : 'text-white/20'}`} />
                    </div>
                  </div>

                  <span className="font-mono text-[9px] text-[#FFBF00]/40 tracking-[0.15em] block mb-6">
                    {meta.scope}
                  </span>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-mono text-4xl font-bold tracking-tight ${meta.highlight ? 'text-[#39FF14]' : 'text-[#E0E0E0]'}`}>
                        {meta.priceRange}
                      </span>
                      <span className="font-mono text-xs text-white/25">{meta.interval}</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-white/30 leading-relaxed">
                    {meta.description}
                  </p>
                </div>

                <div className="mx-7 h-px bg-white/[0.06]" />

                {/* Includes list */}
                <div className="p-7 pt-5 flex-1">
                  <span className="font-mono text-[9px] text-white/15 tracking-[0.2em] uppercase mb-4 block">
                    SYSTEM_INCLUDES:
                  </span>
                  <ul className="space-y-3">
                    {meta.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs font-mono text-white/35">
                        <ChevronRight className={`w-3 h-3 mt-0.5 shrink-0 ${meta.highlight ? 'text-[#39FF14]/60' : 'text-white/20'}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="p-7 pt-0">
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-[9px] text-white/15 tracking-wider">SLA: {meta.sla}</span>
                    <span className="font-mono text-[9px] text-[#FFBF00]/25 tracking-wider">{meta.designation}</span>
                  </div>
                  <button
                    onClick={() => handleCheckout(tierKey)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 font-mono text-[11px] uppercase tracking-[0.14em] font-medium transition-all duration-200 disabled:opacity-50 ${
                      meta.highlight
                        ? 'bg-[#39FF14] text-black hover:bg-[#4dff2e] hover:shadow-[0_0_30px_rgba(57,255,20,0.3)]'
                        : 'bg-transparent border border-[rgba(57,255,20,0.25)] text-[#39FF14]/70 hover:text-[#39FF14] hover:bg-[rgba(57,255,20,0.05)] hover:border-[rgba(57,255,20,0.5)]'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {meta.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom attestation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="font-mono text-[9px] text-white/15 tracking-[0.18em] uppercase">
            ALL TIERS // IMMUTABLE PROVENANCE // AES-256-GCM ENCRYPTION // AERELION INFRASTRUCTURE
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DualScopeRevenue;
