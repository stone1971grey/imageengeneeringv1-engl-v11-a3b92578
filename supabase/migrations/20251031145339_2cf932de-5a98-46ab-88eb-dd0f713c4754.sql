-- Add event_slug column to event_registrations table
ALTER TABLE public.event_registrations
ADD COLUMN event_slug text NOT NULL DEFAULT '';