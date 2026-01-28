import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const FinalCTA = () => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Automation Should Be Dependable. Operations Should Be Calm.
        </h2>
        <p className="text-muted-foreground mb-8">
          AERELION removes automation from your list of things to manage. We operate it for you.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="text-base px-8 py-6">
            <Link to="/contact">
              Schedule a Discovery Call
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
            <Link to="/automations">
              View Automations
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default FinalCTA;
