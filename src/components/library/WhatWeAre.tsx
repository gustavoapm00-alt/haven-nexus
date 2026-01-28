import { motion } from 'framer-motion';
import { Server, Settings, Activity } from 'lucide-react';

const features = [
  {
    icon: Settings,
    text: 'Configured by our team',
  },
  {
    icon: Server,
    text: 'Hosted on our infrastructure',
  },
  {
    icon: Activity,
    text: 'Operated and monitored continuously',
  },
];

const WhatWeAre = () => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          A Managed Automation Operator
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
          AERELION is a done-for-you operational service for professional services firms, government contractors, and compliance-driven organizations.
        </p>
        <p className="text-muted-foreground mb-8">
          We deliver pre-built automation systems that are:
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-foreground">{feature.text}</span>
            </motion.div>
          ))}
        </div>
        
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Customers buy outcomes, not tools. We take responsibility for execution.
        </p>
      </motion.div>
    </div>
  );
};

export default WhatWeAre;
