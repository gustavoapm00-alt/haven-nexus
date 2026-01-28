import { motion } from 'framer-motion';
import { Search, Wrench, CheckCircle } from 'lucide-react';

const phases = [
  { 
    phase: 1, 
    title: 'Diagnose', 
    days: 'Days 1–5',
    icon: Search,
    description: 'We review your operations, identify automation opportunities, and scope the engagement.' 
  },
  { 
    phase: 2, 
    title: 'Activate', 
    days: 'Days 6–20',
    icon: Wrench,
    description: 'AERELION configures and deploys automations on our infrastructure. You provide tool access—we handle everything else.' 
  },
  { 
    phase: 3, 
    title: 'Stabilize', 
    days: 'Days 21–30',
    icon: CheckCircle,
    description: 'We monitor, refine, and ensure reliable operation. Ongoing maintenance is included.' 
  },
];

const commitments = [
  'Automations run on AERELION infrastructure',
  'Credentials are encrypted and revocable',
  'You never touch implementation',
];

const HowItWorks = () => {
  return (
    <div id="how-it-works">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          A 30-Day Engagement Model
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Predictable delivery. Clear accountability. No surprises.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-panel p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <phase.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-1 block">
                {phase.days}
              </span>
              <h3 className="font-semibold text-foreground mb-2 text-lg">{phase.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Commitments */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {commitments.map((commitment, index) => (
            <motion.div
              key={commitment}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{commitment}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
