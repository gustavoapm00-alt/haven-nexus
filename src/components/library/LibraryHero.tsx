import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LibraryHero = () => {
  const bulletPoints = [
    'No software to install',
    'No workflows to manage',
    'No internal automation ownership',
  ];

  return (
    <section className="bg-nebula relative overflow-hidden">
      <div className="section-padding !pt-28 !pb-24 relative z-10">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 leading-[1.15]">
                Managed Automations. Delivered, Operated, and Maintained for You.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                AERELION Systems provides fully-managed business automations operated on our infrastructure. We design, deploy, and run automation systems so your organization doesn't have to.
              </p>
              
              {/* Bullet Points */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10">
                {bulletPoints.map((point, index) => (
                  <motion.span
                    key={point}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {point}
                  </motion.span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="text-base px-8 py-6">
                  <Link to="/contact">
                    Schedule a Discovery Call
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
                  <Link to="/automations">
                    Browse Automations
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LibraryHero;
