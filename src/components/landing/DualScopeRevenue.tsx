import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Ghost } from 'lucide-react';

const tiers = [
  {
    id: 'TIER-01',
    codename: 'THE PULSE',
    scope: 'SCOPE_1 // SELF-SERVE SYSTEM ACCESS',
    priceRange: '$99 – $250',
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
    cta: 'INITIATE SYSTEM HANDOFF',
    ctaLink: '/contact',
    icon: Zap,
    highlight: false,
  },
  {
    id: 'TIER-02',
    codename: 'THE OPERATOR',
    scope: 'SCOPE_2 // ENTERPRISE GOVERNANCE',
    priceRange: '$2,500 – $5,000',
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
    ctaLink: '/contact',
    icon: Shield,
    highlight: true,
  },
  {
    id: 'TIER-03',
    codename: 'THE GHOST',
    scope: 'SCOPE_2+ // BESPOKE ENGAGEMENT',
    priceRange: '$25K – $50K',
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
      'Priority escalation to founding operator',
    ],
    sla: 'DEDICATED',
    designation: 'GHOST_CLEARANCE',
    cta: 'REQUEST GHOST BRIEFING',
    ctaLink: '/contact',
    icon: Ghost,
    highlight: false,
  },
];

const DualScopeRevenue = () => {
  return (
    <section className="section-padding bg-[#0A0A0A] relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(hsl(0 0% 10% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 10% / 0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container-main relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="font-mono text-[10px] text-[#39FF14]/50 uppercase tracking-[0.25em] mb-3 block">
            // REVENUE ENGINE // DUAL-SCOPE MODEL
          </span>
          <h2 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-4">
            System Access Levels
          </h2>
          <p className="font-sans text-sm text-white/35 max-w-xl mx-auto leading-relaxed">
            Subscription tiers represent governance levels — not product purchases.
            Each tier grants progressively deeper access to the Nexus operational infrastructure.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`relative flex flex-col border p-0 transition-all duration-300 group ${
                  tier.highlight
                    ? 'border-[#39FF14]/40 shadow-[0_0_30px_rgba(57,255,20,0.08)]'
                    : 'border-white/10 hover:border-[rgba(57,255,20,0.25)]'
                }`}
              >
                {/* Highlight badge */}
                {tier.highlight && (
                  <div className="absolute -top-px left-0 right-0 h-[2px] bg-[#39FF14]" />
                )}

                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-[#39FF14]/40 tracking-wider">
                        {tier.id}
                      </span>
                      {tier.highlight && (
                        <span className="font-mono text-[8px] text-black bg-[#39FF14] px-1.5 py-0.5 tracking-wider">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <Icon className="w-4 h-4 text-[#39FF14]/30" />
                  </div>

                  <h3 className="font-mono text-lg font-bold text-[#E0E0E0] tracking-wide mb-1">
                    {tier.codename}
                  </h3>
                  <span className="font-mono text-[9px] text-[#FFBF00]/40 tracking-[0.15em] block mb-5">
                    {tier.scope}
                  </span>

                  {/* Price */}
                  <div className="mb-5">
                    <span className="font-mono text-2xl md:text-3xl font-bold text-[#E0E0E0]">
                      {tier.priceRange}
                    </span>
                    <span className="font-mono text-xs text-white/25 ml-1">
                      {tier.interval}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-white/35 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Divider */}
                <div className="mx-6 border-t border-white/5" />

                {/* Includes */}
                <div className="p-6 pt-4 flex-1">
                  <span className="font-mono text-[9px] text-white/20 tracking-[0.2em] uppercase mb-3 block">
                    SYSTEM_INCLUDES:
                  </span>
                  <ul className="space-y-2.5">
                    {tier.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs font-mono text-white/40"
                      >
                        <span className="text-[#39FF14]/50 mt-0.5 shrink-0">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[9px] text-white/15 tracking-wider">
                      SLA: {tier.sla}
                    </span>
                    <span className="font-mono text-[9px] text-[#FFBF00]/25 tracking-wider">
                      {tier.designation}
                    </span>
                  </div>
                  <Link
                    to={tier.ctaLink}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] font-medium transition-all duration-200 ${
                      tier.highlight
                        ? 'bg-[#39FF14] text-black border border-[#39FF14] hover:bg-[#4dff2e] hover:shadow-[0_0_24px_rgba(57,255,20,0.3)]'
                        : 'bg-transparent border border-[rgba(57,255,20,0.3)] text-[#39FF14] hover:bg-[rgba(57,255,20,0.06)] hover:border-[#39FF14]'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="font-mono text-[10px] text-white/20 tracking-[0.15em] uppercase">
            ALL TIERS INCLUDE IMMUTABLE PROVENANCE LOGGING // AES-256-GCM CREDENTIAL ENCRYPTION // AERELION INFRASTRUCTURE
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DualScopeRevenue;
