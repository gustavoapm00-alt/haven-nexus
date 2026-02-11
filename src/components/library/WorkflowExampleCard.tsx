import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
  variant = 'light',
}: WorkflowExampleCardProps) => {
  const isDark = variant === 'dark';
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/automations/${slug}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      role="button"
      tabIndex={0}
      className={`p-6 flex flex-col h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgba(57,255,20,0.3)] border border-white/10 bg-[#0F0F0F] transition-all duration-300 hover:border-[rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.04)]`}
    >
      {/* Header */}
      <div className="flex-1">
        <div className="mb-2">
          <span className="font-mono text-[9px] text-[#39FF14]/50 uppercase tracking-[0.2em]">
            MANAGED_PROTOCOL
          </span>
        </div>
        
        <h3 className="font-mono text-sm font-semibold text-[#E0E0E0] leading-snug mb-2 tracking-wide">
          {name}
        </h3>
        
        {/* Protocol Description */}
        <p className="text-sm text-white/40 leading-relaxed mb-4">
          {shortOutcome}
        </p>

        {/* Sector Classification */}
        {sectors.length > 0 && (
          <div className="mb-4">
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] mb-1.5 block">
              SECTOR_CLASSIFICATION
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sectors.slice(0, 2).map((sector) => (
                <span 
                  key={sector} 
                  className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-white/40 border border-white/10 uppercase tracking-wider"
                >
                  {sector}
                </span>
              ))}
              {sectors.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-white/20 border border-white/5">
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
            <span className="font-mono text-[10px] text-white/20 border border-white/5 px-2 py-0.5">
              +{systems.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
          MANAGED_PROTOCOL
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#39FF14]/70 uppercase tracking-wider hover:text-[#39FF14] transition-colors">
          VIEW_SPECIFICATIONS
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
};

export default WorkflowExampleCard;
