import { Loader2, Sparkles, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type RecommendationResult } from '@/hooks/useAgentRecommendations';

interface AgentRecommendationPanelProps {
  result: RecommendationResult | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
}

function confidenceColor(score: number): string {
  if (score >= 80) return 'bg-primary/10 text-primary border-primary/20';
  if (score >= 60) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
  return 'bg-muted text-muted-foreground border-border';
}

export function AgentRecommendationPanel({ result, isLoading, error, onGenerate }: AgentRecommendationPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Agent Recommendations
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
          className="text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Analyzing…
            </>
          ) : result ? (
            'Regenerate'
          ) : (
            'Generate'
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !result && (
        <div className="p-6 flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs">Cross-referencing engagement signals with agent catalog…</span>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {/* Executive Summary */}
          <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded border border-border">
            {result.summary}
          </p>

          {/* Recommendations */}
          {result.recommendations.map((rec, idx) => (
            <div
              key={rec.agent_id}
              className="p-3 border border-border rounded space-y-2 bg-background"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                  <span className="text-sm font-medium">{rec.agent_name}</span>
                </div>
                <Badge variant="outline" className={confidenceColor(rec.confidence)}>
                  {rec.confidence}%
                </Badge>
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Target className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{rec.rationale}</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-primary">
                <TrendingUp className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{rec.impact_statement}</span>
              </div>
            </div>
          ))}

          {result.recommendations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No matching agents found for this engagement profile.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
