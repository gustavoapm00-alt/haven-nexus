import { Zap, Shield, Clock, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: Zap,
    title: 'Workflow Installation',
    description: 'We configure and deploy automation systems tailored to your operations.',
  },
  {
    icon: Shield,
    title: 'Secure Credential Handling',
    description: 'Your access credentials are encrypted and managed with enterprise-grade security.',
  },
  {
    icon: Clock,
    title: 'Ongoing Maintenance',
    description: 'We monitor, update, and optimize your workflows so they stay operational.',
  },
  {
    icon: Wrench,
    title: 'Full Technical Ownership',
    description: 'No technical experience required—we handle all configuration and troubleshooting.',
  },
];

const WhatYouGet = () => {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">What You Get</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A fully managed AI operations integration service. We install, operate, and maintain your workflows.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card-panel p-5 text-center"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <benefit.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm">{benefit.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhatYouGet;
