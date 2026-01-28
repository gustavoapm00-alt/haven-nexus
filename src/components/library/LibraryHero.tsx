import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LibraryHero = () => {
  const outcomes = [
    'Workflow installation & configuration',
    'Ongoing maintenance & monitoring',
    'Credential management handled securely',
    'No code or infrastructure required',
  ];

  return (
    <section className="bg-nebula relative overflow-hidden">
      <div className="section-padding !pt-24 !pb-20 relative z-10">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-semibold text-primary mb-4 tracking-[0.2em] uppercase">
                AI Operations Integration
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
                We install, configure, and maintain your operational workflows.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                AERELION is an AI operations integration firm. We take responsibility for your automation systems—so you can focus on running your business.
              </p>
              
              {/* Single Primary CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button asChild size="lg" className="glow-accent text-base px-8 py-6">
                  <Link to="/contact">
                    Book an AI Ops Installation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>

              {/* Trust Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {outcomes.map((outcome, index) => (
                  <motion.div
                    key={outcome}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{outcome}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LibraryHero;
