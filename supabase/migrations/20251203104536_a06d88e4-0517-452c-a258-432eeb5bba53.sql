-- Add CTA configuration fields to page_registry for navigation flyout buttons
ALTER TABLE public.page_registry
  ADD COLUMN IF NOT EXISTS cta_group text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_icon text;

-- Optional: simple index on cta_group for faster lookup by navigation group
CREATE INDEX IF NOT EXISTS idx_page_registry_cta_group
  ON public.page_registry (cta_group);
