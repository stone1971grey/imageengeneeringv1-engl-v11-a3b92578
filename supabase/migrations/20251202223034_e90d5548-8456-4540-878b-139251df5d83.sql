-- Add design_icon column to store optional page-level design elements (e.g. navigation icon)
ALTER TABLE public.page_registry
ADD COLUMN IF NOT EXISTS design_icon text;