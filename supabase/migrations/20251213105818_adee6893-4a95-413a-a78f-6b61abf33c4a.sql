-- Add visibility column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';

-- Add check constraint for valid visibility values
ALTER TABLE public.events 
ADD CONSTRAINT events_visibility_check CHECK (visibility IN ('public', 'private'));