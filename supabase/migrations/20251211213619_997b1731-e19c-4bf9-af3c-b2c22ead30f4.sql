-- First drop the old category check constraint
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_category_check;