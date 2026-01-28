import { motion } from 'framer-motion';

const steps = [
  { step: 1, title: 'Discovery call', description: 'We assess your operations and identify high-impact workflows' },
  { step: 2, title: 'Scoped installation', description: 'We configure and install workflows on your infrastructure' },
  { step: 3, title: 'Ongoing operation', description: 'We monitor, maintain, and optimize your systems' },
];

const HowItWorks = () => {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">How We Work</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Every engagement is scoped to your operations. We handle the technical work—you get the outcomes.
        </p>
      </div>
      <div className="relative">
        {/* Connection line */}
        <div className="hidden md:block absolute top-6 left-1/2 -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
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
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Supporting line */}
      <motion.p 
        className="text-center text-sm text-muted-foreground mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        We take responsibility for outcomes, not just delivery.
      </motion.p>
    </div>
  );
};

export default HowItWorks;
