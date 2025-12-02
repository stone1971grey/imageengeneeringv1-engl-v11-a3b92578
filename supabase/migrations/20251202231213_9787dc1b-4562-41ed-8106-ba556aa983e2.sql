-- Add optional flyout teaser fields for second-level navigation pages
ALTER TABLE public.page_registry
  ADD COLUMN IF NOT EXISTS flyout_image_url text,
  ADD COLUMN IF NOT EXISTS flyout_description text;