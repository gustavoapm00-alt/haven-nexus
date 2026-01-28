import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const differentiators = [
  'Not a SaaS platform or DIY tool',
  'No workflow maintenance burden on your team',
  'No need to retrain internal staff',
  'Clear accountability for outcomes',
  'Human-operated systems, not black-box software',
];

const Differentiation = () => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Built for Reliability, Not Experimentation
        </h2>
        
        <div className="space-y-4 mb-8">
          {differentiators.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-3 text-left"
            >
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground">
          If an automation needs attention, AERELION handles it. You receive outcomes.
        </p>
      </motion.div>
    </div>
  );
};

export default Differentiation;
