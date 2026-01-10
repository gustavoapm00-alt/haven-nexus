import { Link } from 'react-router-dom';
import { ArrowRight, Clock, TrendingUp } from 'lucide-react';
import SystemIcon from './SystemIcon';

interface AgentCardProps {
  slug: string;
  name: string;
  shortOutcome: string;
  sectors: string[];
  systems: string[];
  setupTimeMin: number;
  setupTimeMax: number;
  capacityRecoveredMin: number;
  capacityRecoveredMax: number;
  priceCents: number;
}

const AgentCard = ({
  slug,
  name,
  shortOutcome,
  sectors,
  systems,
  setupTimeMin,
  setupTimeMax,
  capacityRecoveredMin,
  capacityRecoveredMax,
  priceCents,
}: AgentCardProps) => {
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <div className="card-enterprise p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex-1">
        <h3 className="font-semibold text-base text-foreground leading-snug mb-2">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {shortOutcome}
        </p>

        {/* Sectors */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {sectors.slice(0, 3).map((sector) => (
            <span key={sector} className="tag-sector">
              {sector}
            </span>
          ))}
          {sectors.length > 3 && (
            <span className="tag-sector">+{sectors.length - 3}</span>
          )}
        </div>

        {/* Systems */}
        <div className="flex flex-wrap gap-2 mb-4">
          {systems.slice(0, 4).map((system) => (
            <SystemIcon key={system} name={system} />
          ))}
          {systems.length > 4 && (
            <span className="system-badge">+{systems.length - 4}</span>
          )}
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Setup: {setupTimeMin}–{setupTimeMax} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{capacityRecoveredMin}–{capacityRecoveredMax} hrs/week</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <span className="font-semibold text-foreground">
          {formatPrice(priceCents)}
        </span>
        <Link
          to={`/agents/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View Agent
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default AgentCard;
