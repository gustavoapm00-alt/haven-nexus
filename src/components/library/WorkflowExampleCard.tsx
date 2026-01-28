import { Link } from 'react-router-dom';
import { ArrowRight, Clock, TrendingUp } from 'lucide-react';
import SystemIcon from './SystemIcon';
import { motion } from 'framer-motion';

interface WorkflowExampleCardProps {
  slug: string;
  name: string;
  shortOutcome: string;
  sectors: string[];
  systems: string[];
  setupTimeMin: number;
  setupTimeMax: number;
  capacityRecoveredMin: number;
  capacityRecoveredMax: number;
  variant?: 'light' | 'dark';
}

const WorkflowExampleCard = ({
  slug,
  name,
  shortOutcome,
  sectors,
  systems,
  setupTimeMin,
  setupTimeMax,
  capacityRecoveredMin,
  capacityRecoveredMax,
  variant = 'light',
}: WorkflowExampleCardProps) => {
  const isDark = variant === 'dark';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`p-6 flex flex-col h-full rounded-lg ${
        isDark 
          ? 'card-panel-dark' 
          : 'card-panel'
      }`}
    >
      {/* Header */}
      <div className="flex-1">
        <div className="mb-2">
          <span className={`text-xs font-medium uppercase tracking-wide ${
            isDark ? 'text-primary/80' : 'text-primary'
          }`}>
            Managed Automation
          </span>
        </div>
        
        <h3 className={`font-semibold text-base leading-snug mb-2 ${
          isDark ? 'text-white' : 'text-foreground'
        }`}>
          {name}
        </h3>
        
        {/* Outcome */}
        <div className="mb-4">
          <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${
            isDark ? 'text-white/50' : 'text-muted-foreground'
          }`}>
            What it solves
          </p>
          <p className={`text-sm ${isDark ? 'text-white/80' : 'text-muted-foreground'}`}>
            {shortOutcome}
          </p>
        </div>

        {/* Best for (sectors) */}
        {sectors.length > 0 && (
          <div className="mb-4">
            <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 ${
              isDark ? 'text-white/50' : 'text-muted-foreground'
            }`}>
              Common use cases
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sectors.slice(0, 2).map((sector) => (
                <span 
                  key={sector} 
                  className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                    isDark 
                      ? 'bg-white/10 text-white/70' 
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {sector}
                </span>
              ))}
              {sectors.length > 2 && (
                <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                  isDark ? 'bg-white/10 text-white/50' : 'bg-secondary text-muted-foreground'
                }`}>
                  +{sectors.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Systems */}
        <div className="flex flex-wrap gap-2 mb-4">
          {systems.slice(0, 4).map((system) => (
            <SystemIcon key={system} name={system} variant={variant} />
          ))}
          {systems.length > 4 && (
            <span className={`system-badge ${isDark ? 'bg-white/10 text-white/60' : ''}`}>
              +{systems.length - 4}
            </span>
          )}
        </div>

        {/* Metrics */}
        <div className={`flex items-center gap-4 text-xs ${
          isDark ? 'text-white/60' : 'text-muted-foreground'
        }`}>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{setupTimeMin}–{setupTimeMax} hrs activation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{capacityRecoveredMin}–{capacityRecoveredMax} hrs/wk recovered</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between mt-6 pt-4 border-t ${
        isDark ? 'border-white/10' : 'border-border'
      }`}>
        <span className={`text-xs ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>
          Operated by AERELION
        </span>
        <Link
          to={`/automations/${slug}`}
          className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isDark 
              ? 'text-primary-foreground bg-primary/80 hover:bg-primary px-3 py-1.5 rounded-md' 
              : 'text-primary hover:underline'
          }`}
        >
          Learn More
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default WorkflowExampleCard;
