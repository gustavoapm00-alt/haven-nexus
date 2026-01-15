import { motion } from 'framer-motion';

const steps = [
  { step: 1, title: 'Choose a pack or bundle', description: 'Browse our library of n8n workflow files' },
  { step: 2, title: 'Purchase access', description: 'Secure checkout with instant delivery' },
  { step: 3, title: 'Download your files', description: 'Get the JSON workflow and setup guide' },
  { step: 4, title: 'Import and configure', description: 'Follow the guide in your own n8n' },
];

const HowItWorks = () => {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">How It Works</h2>
      </div>
      <div className="relative">
        {/* Connection line */}
        <div className="hidden md:block absolute top-6 left-1/2 -translate-x-1/2 w-[80%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center relative"
            >
              <div className="step-node mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">{step.title}</h3>
              <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
