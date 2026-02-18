import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkflowExampleCard from '@/components/library/WorkflowExampleCard';
import { useAgents } from '@/hooks/useAgents';
import SEO, { schemas } from '@/components/SEO';

// ── Genesis Mission Challenge Categories ────────────────────────────────────
const GENESIS_CHALLENGES = [
  {
    id: 'CHG-001',
    code: 'GRID_INTELLIGENCE',
    title: 'Grid Intelligence',
    subtitle: 'AI-Accelerated Grid Decisions (20–100×)',
    description:
      'DOE mandate: make grid-level decisions 20–100× faster via autonomous AI agents. AERELION enforces human-in-the-loop validation gates and immutable audit trails across every grid intervention.',
    agents: ['AG-03 [Watchman]', 'AG-06 [Chronicler]', 'AG-04 [Gatekeeper]'],
    designation: 'DOE/GENESIS-26 // CH-001',
    severity: 'CRITICAL',
    color: '#FFBF00',
  },
  {
    id: 'CHG-002',
    code: 'AUTONOMOUS_LABS',
    title: 'Autonomous Laboratories',
    subtitle: '24/7 AI Agent-Steered Experiments',
    description:
      'Labs running continuous experiments require AI agents that steer diagnostics and execution in real-time. AERELION\'s Nexus Module grid provides hardened logic gates and drift detection for uninterrupted research continuity.',
    agents: ['AG-03 [Watchman]', 'AG-02 [Librarian]', 'AG-07 [Envoy]'],
    designation: 'DOE/GENESIS-26 // CH-009',
    severity: 'HIGH',
    color: '#39FF14',
  },
  {
    id: 'CHG-003',
    code: 'NUCLEAR_DESIGN',
    title: 'Nuclear Design Cycles',
    subtitle: 'Project Prometheus — SMR Licensing at 2× Speed',
    description:
      'Project Prometheus demands AI-accelerated SMR design, licensing, and manufacture. AERELION deploys COOP logic stabilization and full provenance trails across every design iteration — compliant with NRC audit requirements.',
    agents: ['AG-01 [Sentinel]', 'AG-06 [Chronicler]', 'AG-07 [Envoy]'],
    designation: 'DOE/PROMETHEUS // CMMC-L2',
    severity: 'CRITICAL',
    color: '#FFBF00',
  },
  {
    id: 'CHG-004',
    code: 'CUI_DIGITIZATION',
    title: 'CUI Data Digitization',
    subtitle: '80 Years of Analog Nuclear Data → Simulation-Ready',
    description:
      'Harnessing historic nuclear datasets requires schema governance and CUI handoff integrity. AERELION\'s Universal Data Ontology layer enforces classification, provenance, and audit readiness across the entire digitization pipeline.',
    agents: ['AG-02 [Librarian]', 'AG-01 [Sentinel]', 'AG-05 [Auditor]'],
    designation: 'NIST 800-171 // CUI_PROVENANCE',
    severity: 'HIGH',
    color: '#39FF14',
  },
  {
    id: 'CHG-005',
    code: 'CONSORTIUM_GOV',
    title: 'Consortium Governance',
    subtitle: 'Genesis Mission Consortium — 17 National Labs',
    description:
      'The Genesis Mission Consortium (NVIDIA, Microsoft, OpenAI + 17 National Labs) requires federated data sharing standards and AI model reliability governance. AERELION is the operational substrate — not the science, but the rails the science runs on.',
    agents: ['AG-04 [Gatekeeper]', 'AG-05 [Auditor]', 'AG-01 [Sentinel]'],
    designation: 'NIST 800-34 // FEDERATED_GOV',
    severity: 'HIGH',
    color: '#39FF14',
  },
];

// ── Elite 7 Agent Map ────────────────────────────────────────────────────────
const ELITE_7 = [
  { id: 'AG-01', name: 'The Sentinel', role: 'CUI Handoff · NIST 800-171 · CMMC L2 Compliance', challenges: ['CHG-003', 'CHG-004', 'CHG-005'] },
  { id: 'AG-02', name: 'The Librarian', role: 'Universal Data Ontology · Schema Mapping', challenges: ['CHG-002', 'CHG-004'] },
  { id: 'AG-03', name: 'The Watchman', role: 'COOP · Drift Detection · Continuity Ops', challenges: ['CHG-001', 'CHG-002'] },
  { id: 'AG-04', name: 'The Gatekeeper', role: 'PoLP Access Governance · Zero-Trust', challenges: ['CHG-001', 'CHG-005'] },
  { id: 'AG-05', name: 'The Auditor', role: 'Shadow IT Reduction · Asset Enumeration', challenges: ['CHG-004', 'CHG-005'] },
  { id: 'AG-06', name: 'The Chronicler', role: 'Real-Time Status · Immutable Provenance', challenges: ['CHG-001', 'CHG-003'] },
  { id: 'AG-07', name: 'The Envoy', role: 'Executive Briefing AI · After-Action Reports', challenges: ['CHG-002', 'CHG-003'] },
];

const severityColor: Record<string, string> = {
  CRITICAL: 'text-[#FFBF00]/80 border-[#FFBF00]/25 bg-[#FFBF00]/[0.04]',
  HIGH: 'text-[#39FF14]/70 border-[#39FF14]/20 bg-[#39FF14]/[0.03]',
};

// ── Page ─────────────────────────────────────────────────────────────────────
const AgentLibrary = () => {
  const { agents, loading } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);

  const { sectors, systems } = useMemo(() => {
    const sectorsSet = new Set<string>();
    const systemsSet = new Set<string>();
    agents.forEach((agent) => {
      agent.sectors.forEach((s) => sectorsSet.add(s));
      agent.systems.forEach((s) => systemsSet.add(s));
    });
    return { sectors: Array.from(sectorsSet).sort(), systems: Array.from(systemsSet).sort() };
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch = !searchQuery || agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.short_outcome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = !selectedSector || agent.sectors.includes(selectedSector);
      const matchesSystem = !selectedSystem || agent.systems.includes(selectedSystem);
      return matchesSearch && matchesSector && matchesSystem;
    });
  }, [agents, searchQuery, selectedSector, selectedSystem]);

  const clearFilters = () => { setSearchQuery(''); setSelectedSector(null); setSelectedSystem(null); };
  const hasFilters = searchQuery || selectedSector || selectedSystem;

  const activeChallengeMeta = activeChallenge
    ? GENESIS_CHALLENGES.find((c) => c.id === activeChallenge)
    : null;
  const activeChallengeAgents = activeChallengeMeta
    ? ELITE_7.filter((a) => activeChallengeMeta.agents.some((name) => name.includes(a.name.replace('The ', ''))))
    : [];

  const catalogStructuredData = [
    schemas.service("Capability Matrix", "Operational capabilities governed by AERELION infrastructure.", "/automations"),
    schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Capability Matrix', url: '/automations' }])
  ];

  return (
    <>
      <SEO
        title="Capability Matrix – Genesis Mission Governance | AERELION"
        description="AERELION maps the Elite 7 governance agents to DOE Genesis Mission challenge categories — federated AI workflows, nuclear design cycles, and grid intelligence."
        canonicalUrl="/automations"
        structuredData={catalogStructuredData}
      />

      <main className="min-h-screen bg-[#060606]">

        {/* ── GENESIS MISSION HEADER ──────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/[0.06] pt-28 pb-0">
          {/* Background grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(57,255,20,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.018) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(57,255,20,0.04),transparent_70%)] pointer-events-none" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/10 to-transparent" />

          <div className="container-main relative z-10 px-6">
            {/* Classification banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-8 px-4 py-1.5 border border-[#39FF14]/20 bg-[#39FF14]/[0.03]"
            >
              <div className="relative">
                <div className="w-1.5 h-1.5 bg-[#39FF14]" />
                <div className="absolute inset-0 w-1.5 h-1.5 bg-[#39FF14] animate-ping opacity-40" />
              </div>
              <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#39FF14]/70">
                // DOE/GENESIS-2026 // CAPABILITY MATRIX // CLEARANCE: OPEN
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-mono text-4xl md:text-5xl font-bold text-[#E0E0E0] mb-4 tracking-tight leading-tight">
                CAPABILITY<br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #39FF14 0%, #7fff3a 50%, #39FF14 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  MATRIX
                </span>
              </h1>
              <p className="font-sans text-sm text-white/35 max-w-2xl mb-2 leading-relaxed">
                The Genesis Mission requires federated AI governance, auditable workflow infrastructure, and human-in-the-loop enforcement.
                The AERELION Elite 7 agent architecture maps directly to each challenge category.
              </p>
              <p className="font-mono text-[10px] text-white/15 tracking-[0.18em] mb-0">
                [REF: DOE/GENESIS-26 // NIST 800-171 // PROJECT PROMETHEUS // CMMC L2]
              </p>
            </motion.div>

            {/* ── GENESIS CHALLENGE STRIP ───────────────────────────────── */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-5 gap-0 border-t border-white/[0.06]">
              {GENESIS_CHALLENGES.map((challenge, i) => (
                <motion.button
                  key={challenge.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  onClick={() => setActiveChallenge(activeChallenge === challenge.id ? null : challenge.id)}
                  className={`relative group text-left border-r border-white/[0.06] last:border-r-0 px-5 py-5 transition-all duration-300 ${
                    activeChallenge === challenge.id
                      ? 'bg-[#39FF14]/[0.04] border-b-2 border-b-[#39FF14]/60'
                      : 'hover:bg-white/[0.02] border-b border-b-transparent'
                  }`}
                >
                  <span className="font-mono text-[8px] text-[#FFBF00]/40 tracking-[0.18em] block mb-1.5">{challenge.id}</span>
                  <span className={`font-mono text-[10px] font-bold tracking-wide block mb-1 ${activeChallenge === challenge.id ? 'text-[#39FF14]' : 'text-white/50 group-hover:text-white/70'} transition-colors`}>
                    {challenge.code}
                  </span>
                  <span className="font-sans text-[11px] text-white/25 leading-tight block">
                    {challenge.title}
                  </span>
                  {activeChallenge === challenge.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#39FF14]/60 to-transparent" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ── CHALLENGE DETAIL PANEL ──────────────────────────────────────── */}
        <AnimatePresence>
          {activeChallengeMeta && (
            <motion.section
              key={activeChallengeMeta.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-b border-[#39FF14]/10 bg-[#39FF14]/[0.015]"
            >
              <div className="container-main px-6 py-10">
                <div className="grid md:grid-cols-3 gap-10">
                  {/* Left: challenge info */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-[9px] text-[#39FF14]/50 tracking-[0.2em]">[{activeChallengeMeta.id}]</span>
                      <span className={`font-mono text-[8px] tracking-[0.15em] px-2 py-0.5 border ${severityColor[activeChallengeMeta.severity]}`}>
                        {activeChallengeMeta.severity}
                      </span>
                    </div>
                    <h3 className="font-mono text-xl font-bold text-[#E0E0E0] mb-1 tracking-wide">
                      {activeChallengeMeta.title}
                    </h3>
                    <p className="font-mono text-[10px] text-[#FFBF00]/40 tracking-[0.15em] mb-5">
                      {activeChallengeMeta.subtitle}
                    </p>
                    <p className="font-sans text-sm text-white/40 leading-relaxed mb-6">
                      {activeChallengeMeta.description}
                    </p>
                    <span className="font-mono text-[9px] text-white/15 tracking-[0.18em]">
                      {activeChallengeMeta.designation}
                    </span>
                  </div>

                  {/* Right: assigned agents */}
                  <div>
                    <span className="font-mono text-[9px] text-white/20 tracking-[0.2em] uppercase block mb-4">
                      ASSIGNED_AGENTS:
                    </span>
                    <div className="space-y-3">
                      {ELITE_7.filter((a) => activeChallengeMeta.agents.some((name) => name.includes(a.name.replace('The ', '')))).map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-start gap-3 p-3 border border-[#39FF14]/15 bg-[#39FF14]/[0.02]"
                        >
                          <div className="w-1.5 h-1.5 bg-[#39FF14]/60 mt-1.5 shrink-0" />
                          <div>
                            <div className="font-mono text-[10px] text-[#39FF14]/70 tracking-wider mb-0.5">
                              {agent.id}
                            </div>
                            <div className="font-mono text-xs text-[#E0E0E0] mb-0.5">
                              {agent.name}
                            </div>
                            <div className="font-sans text-[10px] text-white/25 leading-tight">
                              {agent.role}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── ELITE 7 AGENT MAP (always visible) ─────────────────────────── */}
        <section className="border-b border-white/[0.05] bg-[#040404] relative overflow-hidden">
          <div className="container-main px-6 py-14">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="font-mono text-[10px] text-[#FFBF00]/50 uppercase tracking-[0.25em] mb-3 block">
                  // ELITE 7 // AGENT ARCHITECTURE
                </span>
                <h2 className="font-mono text-2xl font-bold text-[#E0E0E0] tracking-tight">
                  Agent → Challenge Map
                </h2>
              </div>
              <span className="hidden md:block font-mono text-[9px] text-white/15 tracking-[0.18em]">
                [AGENTS: 7 // CHALLENGES: 5 // GENESIS_ALIGNED]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-0">
              {ELITE_7.map((agent, i) => {
                const challengeIds = agent.challenges;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative border-r border-white/[0.06] last:border-r-0 p-5 group hover:bg-[#39FF14]/[0.015] transition-colors"
                  >
                    {/* Agent ID */}
                    <div className="font-mono text-[9px] text-[#39FF14]/40 tracking-[0.2em] mb-3">
                      {agent.id}
                    </div>
                    {/* Agent name */}
                    <div className="font-mono text-xs font-bold text-[#E0E0E0] mb-2 leading-snug">
                      {agent.name.toUpperCase()}
                    </div>
                    {/* Role */}
                    <div className="font-sans text-[10px] text-white/25 leading-tight mb-4">
                      {agent.role}
                    </div>
                    {/* Challenge tags */}
                    <div className="flex flex-col gap-1.5">
                      {challengeIds.map((cid) => {
                        const ch = GENESIS_CHALLENGES.find((c) => c.id === cid);
                        if (!ch) return null;
                        return (
                          <button
                            key={cid}
                            onClick={() => setActiveChallenge(activeChallenge === cid ? null : cid)}
                            className={`text-left font-mono text-[8px] tracking-[0.12em] px-1.5 py-0.5 border transition-all ${
                              activeChallenge === cid
                                ? 'text-[#39FF14] border-[#39FF14]/40 bg-[#39FF14]/[0.08]'
                                : 'text-white/20 border-white/[0.08] hover:text-[#39FF14]/60 hover:border-[#39FF14]/20'
                            }`}
                          >
                            {ch.code}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PROTOCOL REGISTRY ───────────────────────────────────────────── */}
        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main">
            {/* Sub-header */}
            <div className="mb-8">
              <span className="font-mono text-[10px] text-[#39FF14]/60 uppercase tracking-[0.2em] mb-2 block">
                // PROTOCOL_REGISTRY
              </span>
              <h2 className="font-mono text-2xl font-bold text-[#E0E0E0] mb-3">
                Governed Protocol Index
              </h2>
              <p className="text-white/30 font-mono text-xs max-w-2xl">
                Operational protocols under AERELION infrastructure. All capabilities are configured, hosted, and maintained — not sold.
              </p>
            </div>

            {/* Status Banner */}
            <div className="border border-[#39FF14]/15 bg-[#39FF14]/[0.02] p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-[#39FF14]/60 relative">
                    <div className="absolute inset-0 w-1.5 h-1.5 bg-[#39FF14]/40 animate-ping" />
                  </div>
                  <span className="font-mono text-[9px] text-[#39FF14]/50 tracking-[0.18em]">GENESIS_READY</span>
                </div>
                <p className="font-mono text-xs text-white/30">
                  All protocols below are eligible for Genesis Mission program nodes. Select a challenge above to filter by agent assignment.
                </p>
              </div>
              <Link
                to="/contact"
                className="group flex items-center gap-2 px-5 py-3 bg-[#39FF14] text-black font-mono text-[11px] tracking-[0.18em] font-medium transition-all hover:bg-[#4dff2e] hover:shadow-[0_0_25px_rgba(57,255,20,0.2)] whitespace-nowrap"
              >
                REQUEST SCOPING
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Search + Filter bar */}
            <div className="border border-white/10 mb-0">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 p-3">
                  <div className="relative">
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      placeholder="SEARCH_PROTOCOLS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-0 pl-6 py-1 font-mono text-xs text-foreground placeholder:text-white/15 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3">
                  <select
                    value={selectedSector || ''}
                    onChange={(e) => setSelectedSector(e.target.value || null)}
                    className="px-2 py-1 bg-transparent border border-white/10 font-mono text-[10px] text-white/40 uppercase tracking-wider focus:outline-none focus:border-[rgba(57,255,20,0.4)]"
                  >
                    <option value="">ALL_SECTORS</option>
                    {sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
                  </select>
                  <select
                    value={selectedSystem || ''}
                    onChange={(e) => setSelectedSystem(e.target.value || null)}
                    className="px-2 py-1 bg-transparent border border-white/10 font-mono text-[10px] text-white/40 uppercase tracking-wider focus:outline-none focus:border-[rgba(57,255,20,0.4)]"
                  >
                    <option value="">ALL_SYSTEMS</option>
                    {systems.map((system) => <option key={system} value={system}>{system}</option>)}
                  </select>
                  {hasFilters && (
                    <button onClick={clearFilters} className="font-mono text-[10px] text-white/20 hover:text-[#39FF14]/60 uppercase tracking-wider transition-colors">
                      CLEAR
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="border-x border-b border-white/10 px-3 py-2 mb-6">
              <span className="font-mono text-[10px] text-white/20 uppercase tracking-wider">
                RESULTS: {filteredAgents.length} PROTOCOL{filteredAgents.length !== 1 ? 'S' : ''} INDEXED
              </span>
            </div>

            {/* Agent Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border border-white/[0.06] p-6 h-48 animate-pulse bg-white/[0.01]" />
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-16 border border-white/10">
                <Filter className="w-8 h-8 text-white/15 mx-auto mb-4" />
                <h3 className="font-mono text-sm text-white/40 mb-2">NO_PROTOCOLS_FOUND</h3>
                <p className="text-xs font-mono text-white/20 mb-4">Adjust filters or clear search query.</p>
                <button onClick={clearFilters} className="font-mono text-[11px] text-[#39FF14]/60 border border-[#39FF14]/20 px-4 py-2 hover:bg-[#39FF14]/[0.05] transition-colors">
                  CLEAR_FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map((agent) => (
                  <WorkflowExampleCard
                    key={agent.id}
                    slug={agent.slug}
                    name={agent.name}
                    shortOutcome={agent.short_outcome}
                    sectors={agent.sectors}
                    systems={agent.systems}
                    setupTimeMin={agent.setup_time_min}
                    setupTimeMax={agent.setup_time_max}
                    capacityRecoveredMin={agent.capacity_recovered_min}
                    capacityRecoveredMax={agent.capacity_recovered_max}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── PAGE FOOTER ─────────────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.05] py-10 bg-[#040404]">
          <div className="container-main px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-[9px] text-white/15 tracking-wider uppercase">
              AERELION SYSTEMS © 2026 // DOE/GENESIS-2026 GOVERNANCE SUBSTRATE // ALL SYSTEMS NOMINAL
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#39FF14]/50 relative">
                <div className="absolute inset-0 animate-ping bg-[#39FF14]/30 w-1.5 h-1.5" />
              </div>
              <span className="font-mono text-[9px] text-white/15 uppercase tracking-widest">OPERATIONAL</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default AgentLibrary;
