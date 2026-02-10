import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import WorkflowExampleCard from '@/components/library/WorkflowExampleCard';
import { useAgents } from '@/hooks/useAgents';
import SEO, { schemas } from '@/components/SEO';

const AgentLibrary = () => {
  const { agents, loading } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

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

  const catalogStructuredData = [
    schemas.service("Hosted Automation Catalog", "Browse operational automations AERELION operates.", "/automations"),
    schemas.breadcrumb([{ name: 'Home', url: '/' }, { name: 'Protocols', url: '/automations' }])
  ];

  return (
    <>
      <SEO
        title="Active Protocols – Managed Automations | AERELION"
        description="Browse operational automations AERELION configures, operates, and maintains."
        canonicalUrl="/automations"
        structuredData={catalogStructuredData}
      />

      <main className="min-h-screen">
        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main">
            {/* Header */}
            <div className="mb-8">
              <span className="font-mono text-[10px] text-cyan-500/60 uppercase tracking-[0.2em] mb-2 block">
                // PROTOCOL_DATABASE
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-3">
                Active Protocols
              </h1>
              <p className="text-white/40 font-mono text-sm max-w-2xl">
                Each protocol below is configured, hosted, and operated by AERELION on your behalf.
              </p>
            </div>

            {/* CTA Banner */}
            <div className="card-enterprise p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Ready to deploy?</h3>
                <p className="text-sm font-mono text-white/30">Schedule a discovery call to scope your engagement.</p>
              </div>
              <Button asChild>
                <Link to="/contact">
                  Initialize Uplink
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Data table header */}
            <div className="border-[0.5px] border-white/10 mb-0">
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Search */}
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
                {/* Filters */}
                <div className="flex items-center gap-2 p-3">
                  <select
                    value={selectedSector || ''}
                    onChange={(e) => setSelectedSector(e.target.value || null)}
                    className="px-2 py-1 bg-transparent border-[0.5px] border-white/10 font-mono text-[10px] text-white/40 uppercase tracking-wider focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">ALL_SECTORS</option>
                    {sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
                  </select>

                  <select
                    value={selectedSystem || ''}
                    onChange={(e) => setSelectedSystem(e.target.value || null)}
                    className="px-2 py-1 bg-transparent border-[0.5px] border-white/10 font-mono text-[10px] text-white/40 uppercase tracking-wider focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="">ALL_SYSTEMS</option>
                    {systems.map((system) => <option key={system} value={system}>{system}</option>)}
                  </select>

                  {hasFilters && (
                    <button onClick={clearFilters} className="font-mono text-[10px] text-white/20 hover:text-white/40 uppercase tracking-wider">
                      CLEAR
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results count bar */}
            <div className="border-x-[0.5px] border-b-[0.5px] border-white/10 px-3 py-2 mb-6">
              <span className="font-mono text-[10px] text-white/20 uppercase tracking-wider">
                RESULTS: {filteredAgents.length} PROTOCOL{filteredAgents.length !== 1 ? 'S' : ''} FOUND
              </span>
            </div>

            {/* Agent Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-enterprise p-6 h-48 animate-pulse" />
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-16 border-[0.5px] border-white/10">
                <Filter className="w-8 h-8 text-white/15 mx-auto mb-4" />
                <h3 className="font-mono text-sm text-white/40 mb-2">NO_PROTOCOLS_FOUND</h3>
                <p className="text-xs font-mono text-white/20 mb-4">Adjust filters or search query.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
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

        <LandingFooterSection />
      </main>
    </>
  );
};

// Minimal page footer that respects persistent terminal bar
const LandingFooterSection = () => (
  <footer className="border-t-[0.5px] border-white/5 py-12">
    <div className="container-main px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-[10px] text-white/15 tracking-wider">
          AERELION SYSTEMS © 2026. ALL SYSTEMS NOMINAL.
        </span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
          <span className="font-mono text-[9px] text-white/15 uppercase tracking-widest">Operational</span>
        </div>
      </div>
    </div>
  </footer>
);

export default AgentLibrary;
