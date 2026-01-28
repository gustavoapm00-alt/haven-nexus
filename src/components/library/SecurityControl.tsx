import { motion } from 'framer-motion';
import { Shield, Lock, KeyRound, Eye } from 'lucide-react';

const securityPoints = [
  { icon: KeyRound, text: 'Credentials encrypted at rest and in transit' },
  { icon: Lock, text: 'Principle-of-least-privilege access only' },
  { icon: Eye, text: 'Full visibility and revocation at any time' },
  { icon: Shield, text: 'Operated on controlled, auditable infrastructure' },
];

const SecurityControl = () => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Enterprise-Grade Security by Default
        </h2>
        <p className="text-muted-foreground mb-8">
          We handle your credentials and data with the care expected by regulated industries.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {securityPoints.map((point, index) => (
            <motion.div
              key={point.text}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-4 card-panel"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <point.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-foreground text-left">{point.text}</span>
            </motion.div>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Automation is treated as an operational responsibility—not a software experiment.
        </p>
      </motion.div>
    </div>
  );
};

export default SecurityControl;
