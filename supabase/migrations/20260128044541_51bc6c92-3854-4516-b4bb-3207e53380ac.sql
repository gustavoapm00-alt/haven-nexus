-- Add missing columns to engagement_requests for admin management
ALTER TABLE public.engagement_requests 
ADD COLUMN IF NOT EXISTS notes_internal text,
ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
ADD COLUMN IF NOT EXISTS admin_seen boolean DEFAULT false;