import { Link } from 'react-router-dom';
import { ArrowRight, Clock, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IntegrationIcons from './IntegrationIcons';
import { motion } from 'framer-motion';

const LibraryHero = () => {
  return (
    <section className="bg-nebula relative overflow-hidden">
      <div className="section-padding !pt-24 !pb-20 relative z-10">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <p className="text-xs font-semibold text-primary mb-4 tracking-[0.2em] uppercase">
                AERELION SYSTEMS
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
                Automation systems activated for you in hours, not weeks.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Browse hosted automations and system bundles built for real operational outcomes. We configure, run, and maintain everything—no code, no infrastructure.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                <Button asChild size="lg" className="glow-accent">
                  <Link to="/packs">
                    Activate Automations
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/bundles">View System Bundles</Link>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                We host and maintain everything. You stay focused on your business.
              </p>
              
              <div className="mt-10">
                <IntegrationIcons />
              </div>
            </motion.div>

            {/* Right: Preview Panel (Desktop only) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Orbital decoration */}
                <div className="absolute -inset-8 rounded-full border border-primary/10 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute -inset-16 rounded-full border border-dashed border-primary/5" />
                
                {/* Dashboard mock */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-xl relative">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    <span className="ml-2 text-xs text-muted-foreground font-medium">Automation Library</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <MiniStatCard 
                      icon={<Zap className="w-4 h-4 text-primary" />}
                      label="Automations"
                      value="12"
                    />
                    <MiniStatCard 
                      icon={<Clock className="w-4 h-4 text-primary" />}
                      label="Avg Activation"
                      value="2 hrs"
                    />
                    <MiniStatCard 
                      icon={<TrendingUp className="w-4 h-4 text-primary" />}
                      label="Hours Saved"
                      value="+28 hrs"
                    />
                  </div>
                  
                  {/* Mini automation preview */}
                  <div className="space-y-3">
                    <MiniAutomationRow name="Lead Intake Router" status="popular" />
                    <MiniAutomationRow name="CRM Enrichment Layer" status="popular" />
                    <MiniAutomationRow name="Weekly KPI Digest" status="new" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MiniStatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-muted/50 rounded-lg p-3 text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-lg font-semibold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
  </div>
);

const MiniAutomationRow = ({ name, status }: { name: string; status: 'popular' | 'new' }) => (
  <div className="flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2">
    <span className="text-sm text-foreground font-medium truncate">{name}</span>
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
      status === 'popular' 
        ? 'bg-primary/10 text-primary' 
        : 'bg-green-500/10 text-green-600'
    }`}>
      {status}
    </span>
  </div>
);

export default LibraryHero;
