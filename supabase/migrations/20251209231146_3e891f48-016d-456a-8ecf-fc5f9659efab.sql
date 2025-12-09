-- Create email_signups table for newsletter subscribers
CREATE TABLE public.email_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'blueprint',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_submissions table for contact form
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public forms)
CREATE POLICY "Anyone can submit email signup"
ON public.email_signups
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- Add indexes for better query performance
CREATE INDEX idx_email_signups_email ON public.email_signups(email);
CREATE INDEX idx_email_signups_created_at ON public.email_signups(created_at DESC);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);