import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import AgentCard from '@/components/library/AgentCard';
import { useAgents } from '@/hooks/useAgents';
import SEO from '@/components/SEO';

const AgentLibrary = () => {
  const { agents, loading } = useAgents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  // Extract unique sectors and systems
  const { sectors, systems } = useMemo(() => {
    const sectorsSet = new Set<string>();
    const systemsSet = new Set<string>();

    agents.forEach((agent) => {
      agent.sectors.forEach((s) => sectorsSet.add(s));
      agent.systems.forEach((s) => systemsSet.add(s));
    });

    return {
      sectors: Array.from(sectorsSet).sort(),
      systems: Array.from(systemsSet).sort(),
    };
  }, [agents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.short_outcome.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector =
        !selectedSector || agent.sectors.includes(selectedSector);

      const matchesSystem =
        !selectedSystem || agent.systems.includes(selectedSystem);

      return matchesSearch && matchesSector && matchesSystem;
    });
  }, [agents, searchQuery, selectedSector, selectedSystem]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector(null);
    setSelectedSystem(null);
  };

  const hasFilters = searchQuery || selectedSector || selectedSystem;

  return (
    <>
      <SEO
        title="Automation Agents"
        description="Browse our library of pre-engineered automation agents. Modular workflows designed to eliminate repeatable operational tasks."
        keywords="automation agents, n8n workflows, business automation, workflow templates"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                Automation Agents
              </h1>
              <p className="text-muted-foreground">
                Modular workflows engineered to eliminate repeatable operational tasks.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedSector || ''}
                  onChange={(e) => setSelectedSector(e.target.value || null)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSystem || ''}
                  onChange={(e) => setSelectedSystem(e.target.value || null)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="">All Systems</option>
                  {systems.map((system) => (
                    <option key={system} value={system}>
                      {system}
                    </option>
                  ))}
                </select>

                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-6">
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} found
            </p>

            {/* Agent Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-enterprise p-6 h-64 animate-pulse bg-muted" />
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-16">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No agents found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or search query.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <AgentCard
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
                    priceCents={agent.price_cents}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <LibraryFooter />
      </div>
    </>
  );
};

export default AgentLibrary;
