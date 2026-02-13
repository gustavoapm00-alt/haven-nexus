import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBundle } from '@/hooks/useBundles';
import SEO from '@/components/SEO';

const BundleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { bundle, loading, error } = useBundle(slug || '');

  const deploymentSteps = [
    'Submit authorization request via intake terminal',
    'AERELION scopes protocol parameters and system dependencies',
    'Infrastructure deployed, stabilized, and governed',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <div className="section-padding">
          <div className="container-main max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/5 w-3/4" />
              <div className="h-4 bg-white/5 w-1/2" />
              <div className="h-32 bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-[#0F0F0F]">
        <div className="section-padding">
          <div className="container-main max-w-4xl text-center">
            <h1 className="font-mono text-xl text-[#E0E0E0] mb-4">SYSTEM_NOT_FOUND</h1>
            <p className="font-mono text-sm text-white/40 mb-6">
              The specified system does not exist or has been decommissioned.
            </p>
            <Button asChild variant="outline" className="border-white/10 font-mono text-xs uppercase tracking-wider">
              <Link to="/automations">RETURN_TO_MATRIX</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${bundle.name} – AERELION System`}
        description={bundle.objective}
        keywords={[...bundle.sectors, 'managed protocol', 'operational infrastructure', 'system bundle'].join(', ')}
      />

      <div className="min-h-screen bg-[#0F0F0F]">
        <section className="section-padding !pt-8">
          <div className="container-main max-w-4xl">
            {/* Back Link */}
            <Link
              to="/automations"
              className="inline-flex items-center gap-2 font-mono text-[10px] text-white/30 hover:text-[#39FF14]/60 uppercase tracking-[0.2em] mb-8 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              RETURN_TO_MATRIX
            </Link>

            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 border border-[rgba(57,255,20,0.2)]">
                  <Package className="w-6 h-6 text-[#39FF14]/60" />
                </div>
                <span className="font-mono text-[9px] text-[#39FF14]/50 uppercase tracking-[0.25em]">
                  GOVERNED_SYSTEM_BUNDLE
                </span>
              </div>
              <h1 className="font-mono text-2xl md:text-3xl font-semibold text-[#E0E0E0] mb-3">
                {bundle.name}
              </h1>
              <p className="text-white/40 text-sm leading-relaxed">
                {bundle.objective}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* SYSTEM_SPECIFICATION */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    SYSTEM_SPECIFICATION
                  </h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {bundle.description}
                  </p>
                </section>

                {/* INCLUDED_PROTOCOLS */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    INCLUDED_PROTOCOLS
                  </h2>
                  <p className="font-mono text-[10px] text-white/20 mb-4 uppercase tracking-wider">
                    Protocols configured and governed as a unified system under AERELION infrastructure.
                  </p>
                  <div className="space-y-3">
                    {bundle.included_agents.map((agent) => (
                      <Link
                        key={agent.id}
                        to={`/automations/${agent.slug}`}
                        className="block border border-white/10 bg-[#0F0F0F] p-4 hover:border-[rgba(57,255,20,0.2)] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-mono text-xs text-[#E0E0E0] mb-1">
                              {agent.name}
                            </h3>
                            <p className="text-[10px] text-white/30">
                              {agent.short_outcome}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* SECTOR_CLASSIFICATION */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    SECTOR_CLASSIFICATION
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {bundle.sectors.map((sector) => (
                      <span key={sector} className="font-mono text-[10px] text-white/40 border border-white/10 px-2 py-1 uppercase tracking-wider">
                        {sector}
                      </span>
                    ))}
                  </div>
                </section>

                {/* DEPLOYMENT_SEQUENCE */}
                <section>
                  <h2 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-4">
                    DEPLOYMENT_SEQUENCE
                  </h2>
                  <ol className="space-y-3">
                    {deploymentSteps.map((step, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 border border-[rgba(57,255,20,0.2)] text-[#39FF14]/60 font-mono text-[10px] flex items-center justify-center">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-white/40 text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="border border-white/10 bg-[#0F0F0F] p-6 sticky top-24">
                  <h3 className="font-mono text-xs text-[#E0E0E0] uppercase tracking-[0.2em] mb-2">
                    SYSTEM_AUTHORIZATION
                  </h3>
                  <p className="font-mono text-[10px] text-white/30 mb-6 leading-relaxed">
                    AERELION governs all configuration, deployment, and operational oversight for this system.
                  </p>

                  <Button 
                    asChild
                    className="w-full mb-3 bg-[#39FF14]/10 text-[#39FF14] border border-[rgba(57,255,20,0.3)] hover:bg-[#39FF14]/20 font-mono text-[10px] uppercase tracking-wider" 
                    size="lg"
                  >
                    <Link to="/contact">
                      REQUEST_SCOPING
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BundleDetail;
