import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LibraryNavbar from '@/components/library/LibraryNavbar';
import LibraryFooter from '@/components/library/LibraryFooter';
import BundleCard from '@/components/library/BundleCard';
import { useBundles } from '@/hooks/useBundles';
import SEO from '@/components/SEO';

const BundleLibrary = () => {
  const { bundles, loading } = useBundles();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Extract unique sectors
  const sectors = useMemo(() => {
    const sectorsSet = new Set<string>();
    bundles.forEach((bundle) => {
      bundle.sectors.forEach((s) => sectorsSet.add(s));
    });
    return Array.from(sectorsSet).sort();
  }, [bundles]);

  // Filter bundles
  const filteredBundles = useMemo(() => {
    return bundles.filter((bundle) => {
      const matchesSearch =
        !searchQuery ||
        bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bundle.objective.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector =
        !selectedSector || bundle.sectors.includes(selectedSector);

      return matchesSearch && matchesSector;
    });
  }, [bundles, searchQuery, selectedSector]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSector(null);
  };

  const hasFilters = searchQuery || selectedSector;

  return (
    <>
      <SEO
        title="System Bundles"
        description="Curated sets of automation agents designed to address common operational bottlenecks. Save with bundled pricing."
        keywords="automation bundles, workflow bundles, business automation, n8n workflows"
      />

      <div className="min-h-screen bg-background">
        <LibraryNavbar />

        <section className="section-padding !pt-12 !pb-8">
          <div className="container-main">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-foreground mb-3">
                System Bundles
              </h1>
              <p className="text-muted-foreground">
                Curated sets of automation agents designed to address common operational bottlenecks.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search bundles..."
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

                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-6">
              {filteredBundles.length} bundle{filteredBundles.length !== 1 ? 's' : ''} found
            </p>

            {/* Bundle Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card-enterprise p-6 h-72 animate-pulse bg-muted" />
                ))}
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="text-center py-16">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No bundles found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or search query.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBundles.map((bundle) => (
                  <BundleCard
                    key={bundle.id}
                    slug={bundle.slug}
                    name={bundle.name}
                    objective={bundle.objective}
                    includedAgentNames={bundle.included_agents.map(a => a.name)}
                    sectors={bundle.sectors}
                    individualValueCents={bundle.individual_value_cents}
                    bundlePriceCents={bundle.bundle_price_cents}
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

export default BundleLibrary;
