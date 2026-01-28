import { motion } from 'framer-motion';

const benefits = [
  'Automation without technical overhead',
  'Predictable delivery',
  'Reduced internal complexity',
  'A single operator responsible for outcomes',
];

const WhoThisIsFor = () => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Designed for Operators Who Value Stability
        </h2>
        
        <p className="text-muted-foreground mb-8">
          This service is for organizations that want:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-lg mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-panel p-4 text-sm text-foreground"
            >
              {benefit}
            </motion.div>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground/80 italic">
          If you want to build and manage automations internally, this is not the right fit.
        </p>
      </motion.div>
    </div>
  );
};

export default WhoThisIsFor;
