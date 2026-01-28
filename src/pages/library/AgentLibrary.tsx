import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import WorkflowExampleCard from '@/components/library/WorkflowExampleCard';
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
        title="Example Workflows - AERELION"
        description="Browse example operational workflows we install as part of an AI Ops engagement. We configure, operate, and maintain everything."
        keywords="AI operations, workflow examples, automation installation, managed automation"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main">
            <div className="mb-8">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 block">
                Workflow Examples
              </span>
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                Workflows We Install
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                These are examples of operational workflows we configure as part of a scoped AI Ops engagement. 
                Scope and pricing are customized per engagement—not per workflow.
              </p>
            </div>

            {/* CTA Banner */}
            <div className="card-enterprise p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Ready to get started?</h3>
                <p className="text-sm text-muted-foreground">Book a discovery call to discuss your operational needs.</p>
              </div>
              <Button asChild>
                <Link to="/contact">
                  Book an AI Ops Installation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search workflows..."
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
                  <option value="">All Use Cases</option>
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
                  <option value="">All Tools</option>
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
              {filteredAgents.length} example workflow{filteredAgents.length !== 1 ? 's' : ''}
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
                <h3 className="font-medium text-foreground mb-2">No workflows found</h3>
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

        <LibraryFooter />
      </div>
    </>
  );
};

export default AgentLibrary;
