import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';

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

  return (
    <div className="card-enterprise p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            Save {savingsPercent}%
          </span>
        </div>

        <h3 className="font-semibold text-base text-foreground leading-snug mb-2">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {objective}
        </p>

        {/* Included Agents */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Includes
          </p>
          <ul className="space-y-1">
            {includedAgentNames.slice(0, 4).map((agentName) => (
              <li key={agentName} className="text-sm text-foreground">
                • {agentName}
              </li>
            ))}
            {includedAgentNames.length > 4 && (
              <li className="text-sm text-muted-foreground">
                + {includedAgentNames.length - 4} more
              </li>
            )}
          </ul>
        </div>

        {/* Use Cases */}
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
          <span className="font-semibold text-lg text-foreground">
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
    </div>
  );
};

export default BundleCard;
