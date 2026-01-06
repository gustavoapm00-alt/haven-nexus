-- Create audits table for system audit submissions
CREATE TABLE public.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  primary_friction text NOT NULL,
  breakdown_first text NOT NULL,
  tool_entropy text NOT NULL,
  absence_test_48h text NOT NULL,
  operational_volume text NOT NULL,
  decision_maker boolean NOT NULL,
  notes text,
  consent_ack boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'received',
  n8n_status text NOT NULL DEFAULT 'queued',
  n8n_request_id text UNIQUE,
  processing_ms integer,
  error_message text
);

-- Create diagnoses table for audit results
CREATE TABLE public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid UNIQUE NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  leak_hours_low integer NOT NULL,
  leak_hours_high integer NOT NULL,
  recovered_hours_low integer NOT NULL,
  recovered_hours_high integer NOT NULL,
  primary_failure_mode text NOT NULL,
  plain_language_cause text NOT NULL,
  what_is_happening text NOT NULL,
  recommended_systems jsonb NOT NULL DEFAULT '[]'::jsonb,
  readiness_level text NOT NULL DEFAULT 'medium',
  next_step text NOT NULL DEFAULT 'send_email',
  confidence integer NOT NULL DEFAULT 50,
  disclaimer text NOT NULL DEFAULT 'AERELION provides operational diagnosis and system recommendations. Estimates are directional. We do not promise revenue outcomes or autonomous businesses.',
  raw_signals jsonb DEFAULT '{}'::jsonb
);

-- Create deployment_requests table
CREATE TABLE public.deployment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  audit_id uuid REFERENCES public.audits(id) ON DELETE SET NULL,
  diagnosis_id uuid REFERENCES public.diagnoses(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  preferred_involvement text NOT NULL,
  timeline text NOT NULL,
  tools_stack text,
  contact_method text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'received'
);

-- Enable RLS
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_requests ENABLE ROW LEVEL SECURITY;

-- Audits policies: public can insert, only admins can view all
CREATE POLICY "Public can submit audits"
  ON public.audits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all audits"
  ON public.audits FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update audits"
  ON public.audits FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Diagnoses policies
CREATE POLICY "Public can view their own diagnosis by audit_id"
  ON public.diagnoses FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage diagnoses"
  ON public.diagnoses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Deployment requests policies
CREATE POLICY "Public can submit deployment requests"
  ON public.deployment_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all deployment requests"
  ON public.deployment_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update deployment requests"
  ON public.deployment_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_audits_email ON public.audits(email);
CREATE INDEX idx_audits_status ON public.audits(status);
CREATE INDEX idx_audits_n8n_request_id ON public.audits(n8n_request_id);
CREATE INDEX idx_diagnoses_audit_id ON public.diagnoses(audit_id);
CREATE INDEX idx_deployment_requests_audit_id ON public.deployment_requests(audit_id);