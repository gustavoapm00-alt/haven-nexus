-- Add veracity_score to sovereign_bridge for entropy analysis results
ALTER TABLE public.sovereign_bridge
  ADD COLUMN IF NOT EXISTS veracity_score numeric DEFAULT 0;

-- Add behavioral_data column to store raw entropy metrics
ALTER TABLE public.sovereign_bridge
  ADD COLUMN IF NOT EXISTS behavioral_data jsonb DEFAULT '{}'::jsonb;