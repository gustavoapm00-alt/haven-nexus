import { motion } from 'framer-motion';

const steps = [
  { 
    step: 1, 
    title: 'Select a Solution', 
    description: 'Choose from our catalog of hosted automations or system bundles.' 
  },
  { 
    step: 2, 
    title: 'Secure Checkout', 
    description: 'One-time purchase via Stripe. No usage-based pricing.' 
  },
  { 
    step: 3, 
    title: 'Activation Intake', 
    description: 'Provide operational details and preferred connection methods.' 
  },
  { 
    step: 4, 
    title: 'Deployment & Operation', 
    description: 'AERELION configures and operates the automation internally.' 
  },
  { 
    step: 5, 
    title: 'Ongoing Oversight', 
    description: 'Track progress via the customer portal and email updates.' 
  },
];

const HowItWorks = () => {
  return (
    <div id="how-it-works">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          A Controlled, Predictable Engagement Model
        </h2>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
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
              <h3 className="font-semibold text-foreground mb-2 text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              
              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-px bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
