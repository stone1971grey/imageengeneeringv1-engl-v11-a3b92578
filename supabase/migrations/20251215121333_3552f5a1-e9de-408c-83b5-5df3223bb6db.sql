-- Add 5 new filter columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS measurement_focus JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS format_fov JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS integration_features JSONB DEFAULT '[]'::jsonb;

-- Note: applications column already exists and will be reused with new values