-- Add display_badges column to products table for explicit badge control
ALTER TABLE public.products ADD COLUMN display_badges jsonb DEFAULT '[]'::jsonb;