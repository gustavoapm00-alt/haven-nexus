-- Create table for edge function logs
CREATE TABLE public.edge_function_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  details JSONB,
  user_id UUID,
  ip_address TEXT,
  duration_ms INTEGER,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast queries
CREATE INDEX idx_edge_function_logs_created_at ON public.edge_function_logs(created_at DESC);
CREATE INDEX idx_edge_function_logs_function_name ON public.edge_function_logs(function_name);
CREATE INDEX idx_edge_function_logs_level ON public.edge_function_logs(level);

-- Enable RLS
ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs
CREATE POLICY "Admins can read all logs"
  ON public.edge_function_logs
  FOR SELECT
  USING (public.is_admin());

-- Service role can insert logs (edge functions use service role)
CREATE POLICY "Service role can insert logs"
  ON public.edge_function_logs
  FOR INSERT
  WITH CHECK (true);

-- Admins can delete old logs
CREATE POLICY "Admins can delete logs"
  ON public.edge_function_logs
  FOR DELETE
  USING (public.is_admin());

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.edge_function_logs;

-- Create a function to clean up old logs (keep last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_edge_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.edge_function_logs
  WHERE created_at < now() - INTERVAL '7 days';
END;
$$;