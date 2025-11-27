-- Create glossary table for translation term management
CREATE TABLE IF NOT EXISTS public.glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  term_type TEXT NOT NULL CHECK (term_type IN ('non-translate', 'preferred-translation', 'abbreviation', 'company-specific')),
  translations JSONB DEFAULT '{}'::jsonb,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(term)
);

-- Enable RLS
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;

-- Admins and editors can manage glossary
CREATE POLICY "Admins and editors can manage glossary"
  ON public.glossary
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'editor'::app_role)
  );

-- Anyone can view glossary (needed for translation function)
CREATE POLICY "Anyone can view glossary"
  ON public.glossary
  FOR SELECT
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_glossary_updated_at
  BEFORE UPDATE ON public.glossary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_news_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_glossary_term ON public.glossary(term);
CREATE INDEX idx_glossary_type ON public.glossary(term_type);