-- Add evt_image_url column to event_registrations table
ALTER TABLE public.event_registrations 
ADD COLUMN evt_image_url text;