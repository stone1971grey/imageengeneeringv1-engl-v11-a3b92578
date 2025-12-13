-- Create products table for Product Management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Test Charts',
  subcategory TEXT,
  sku TEXT,
  specifications JSONB DEFAULT '{}',
  features JSONB DEFAULT '[]',
  applications JSONB DEFAULT '[]',
  related_products JSONB DEFAULT '[]',
  price_info TEXT,
  availability TEXT DEFAULT 'available',
  language_code TEXT NOT NULL DEFAULT 'EN',
  published BOOLEAN DEFAULT true,
  visibility TEXT NOT NULL DEFAULT 'public',
  position INTEGER DEFAULT 999,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT products_slug_language_unique UNIQUE (slug, language_code)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published products"
ON public.products
FOR SELECT
USING (published = true);

CREATE POLICY "Admins can manage all products"
ON public.products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();

-- Create index for common queries
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_language ON public.products(language_code);
CREATE INDEX idx_products_published ON public.products(published);