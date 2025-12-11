-- Add new category check constraint with the three allowed values
ALTER TABLE public.events ADD CONSTRAINT events_category_check 
  CHECK (category IN ('Training', 'Trade Fair', 'Workshop'));