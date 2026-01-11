import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface BundleCardProps {
  slug: string;
  name: string;
  objective: string;
  includedAgentNames: string[];
  sectors: string[];
  individualValueCents: number;
  bundlePriceCents: number;
}

const BundleCard = ({
  slug,
  name,
  objective,
  includedAgentNames,
  sectors,
  individualValueCents,
  bundlePriceCents,
}: BundleCardProps) => {
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const savingsPercent = Math.round(
    ((individualValueCents - bundlePriceCents) / individualValueCents) * 100
  );
  
  const savingsDollars = (individualValueCents - bundlePriceCents) / 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-panel p-6 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="p-2.5 bg-primary/10 rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            {/* Orbital ring */}
            <div className="absolute -inset-1 border border-primary/10 rounded-lg" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Save {savingsPercent}%
            </span>
            <span className="text-xs text-muted-foreground">
              You save ${savingsDollars.toFixed(0)}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-lg text-foreground leading-snug mb-2">
          {name}
        </h3>
        
        {objective && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {objective}
          </p>
        )}

        {/* Included Agents */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Includes {includedAgentNames.length} agents
          </p>
          <ul className="space-y-1.5">
            {includedAgentNames.slice(0, 3).map((agentName) => (
              <li key={agentName} className="text-sm text-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span className="line-clamp-1">{agentName}</span>
              </li>
            ))}
            {includedAgentNames.length > 3 && (
              <li className="text-sm text-muted-foreground pl-3.5">
                + {includedAgentNames.length - 3} more
              </li>
            )}
          </ul>
        </div>

        {/* Sectors */}
        <div className="flex flex-wrap gap-1.5">
          {sectors.slice(0, 3).map((sector) => (
            <span key={sector} className="tag-sector">
              {sector}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(individualValueCents)}
          </span>
          <span className="font-bold text-xl text-foreground">
            {formatPrice(bundlePriceCents)}
          </span>
        </div>
        <Link
          to={`/bundles/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          View Bundle
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default BundleCard;
