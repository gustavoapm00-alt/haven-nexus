import { motion } from 'framer-motion';

const audiences = [
  'Professional services firms',
  'Government contractors (primes & subs)',
  'Compliance-driven organizations',
  'Regulated or reputation-sensitive operators',
];

const roles = [
  'Founders & Managing Partners',
  'Operations Directors',
  'Program Managers',
  'Chiefs of Staff',
];

const WhoThisIsFor = () => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Designed for Organizations That Value Stability
        </h2>
        
        <p className="text-muted-foreground mb-8">
          This service is for teams that need automation without the internal overhead.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Who We Serve
            </h3>
            <div className="space-y-2">
              {audiences.map((audience, index) => (
                <motion.div
                  key={audience}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-panel p-3 text-sm text-foreground"
                >
                  {audience}
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Who We Work With
            </h3>
            <div className="space-y-2">
              {roles.map((role, index) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card-panel p-3 text-sm text-foreground"
                >
                  {role}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground/80 italic">
          If you want to build and manage automations internally, this is not the right fit.
        </p>
      </motion.div>
    </div>
  );
};

export default WhoThisIsFor;
