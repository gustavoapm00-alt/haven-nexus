import { motion } from 'framer-motion';
import { Activity, GitBranch, FileCode, Cpu, Zap, Radio } from 'lucide-react';

const entries = [
  { icon: Zap, label: 'v2.4 Deployed', tag: 'DEPLOY', time: '2 min ago', status: 'live' },
  { icon: FileCode, label: 'Optimization Log #004', tag: 'LOG', time: '18 min ago', status: 'complete' },
  { icon: GitBranch, label: 'Architecture Diagram Alpha', tag: 'BLUEPRINT', time: '1 hr ago', status: 'review' },
  { icon: Cpu, label: 'Agent Cluster Scaling', tag: 'INFRA', time: '3 hr ago', status: 'live' },
  { icon: Activity, label: 'Latency Benchmark v3', tag: 'PERF', time: '6 hr ago', status: 'complete' },
  { icon: Radio, label: 'Webhook Relay Config', tag: 'CONFIG', time: '12 hr ago', status: 'review' },
];

const statusColors: Record<string, string> = {
  live: 'bg-[hsl(180,60%,40%)]',
  complete: 'bg-[hsl(120,40%,40%)]',
  review: 'bg-[hsl(25,90%,50%)]',
};

const BlueprintsFeed = () => {
  return (
    <section className="py-24 md:py-32 bg-[#0a0a0a] border-t border-[hsl(0,0%,12%)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[hsl(180,60%,50%)] mb-4">
              // Telemetry
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#e8e8e8] tracking-tight">
              Live Intelligence
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[hsl(180,60%,50%)] animate-pulse" />
            <span className="font-mono text-xs text-[hsl(0,0%,40%)] uppercase tracking-wider">
              Live
            </span>
          </div>
        </motion.div>

        {/* Horizontal scroll feed */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
          <div className="flex gap-4 min-w-max pb-4">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group flex-shrink-0 w-72 border border-[hsl(0,0%,15%)] bg-[hsl(0,0%,5%)] p-5 transition-all duration-300 hover:border-[hsl(180,60%,40%,0.3)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[hsl(0,0%,35%)]">
                    {entry.tag}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColors[entry.status]}`} />
                </div>

                <entry.icon className="w-5 h-5 text-[hsl(180,50%,50%)] mb-3" strokeWidth={1.5} />

                <p className="font-mono text-sm text-[#e8e8e8] mb-2">{entry.label}</p>
                <p className="font-mono text-[11px] text-[hsl(0,0%,35%)]">{entry.time}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlueprintsFeed;
