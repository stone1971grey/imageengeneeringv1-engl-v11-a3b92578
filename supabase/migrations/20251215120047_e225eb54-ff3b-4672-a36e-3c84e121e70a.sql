-- Add chart_sizes column to products table for storing size configurations
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS chart_sizes jsonb DEFAULT '[]'::jsonb;