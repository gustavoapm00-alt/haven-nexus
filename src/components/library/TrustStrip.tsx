import { Cloud, BookOpen, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
  { icon: Cloud, label: 'Fully hosted & maintained' },
  { icon: BookOpen, label: 'Quick activation guide' },
  { icon: Shield, label: 'Secure credentials' },
  { icon: RefreshCw, label: 'Continuous monitoring' },
];

const TrustStrip = () => {
  return (
    <section className="py-8 border-y border-border bg-muted/30">
      <div className="container-main">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full"
            >
              <div className="relative">
                <badge.icon className="w-4 h-4 text-primary" />
                {/* Subtle orbital ring */}
                <div className="absolute -inset-1 border border-primary/10 rounded-full" />
              </div>
              <span className="text-sm font-medium text-foreground">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
