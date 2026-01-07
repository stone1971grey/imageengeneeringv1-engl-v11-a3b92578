-- Create table for storing competitor analysis data
CREATE TABLE public.content_gap_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  competitor_domain VARCHAR(255) NOT NULL,
  country VARCHAR(10) NOT NULL DEFAULT 'de',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(domain, competitor_domain, country)
);

-- Create table for storing gap keywords data
CREATE TABLE public.content_gap_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID NOT NULL REFERENCES public.content_gap_competitors(id) ON DELETE CASCADE,
  keyword VARCHAR(500) NOT NULL,
  competitor_position INTEGER,
  competitor_url TEXT,
  traffic INTEGER DEFAULT 0,
  search_volume INTEGER,
  competition DECIMAL(5,2),
  our_position INTEGER,
  opportunity VARCHAR(20) DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_gap_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_gap_keywords ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitors - admin/editor access
CREATE POLICY "Admins and editors can view competitors" 
ON public.content_gap_competitors 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admins and editors can insert competitors" 
ON public.content_gap_competitors 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admins and editors can update competitors" 
ON public.content_gap_competitors 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admins and editors can delete competitors" 
ON public.content_gap_competitors 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

-- RLS policies for keywords
CREATE POLICY "Admins and editors can view gap keywords" 
ON public.content_gap_keywords 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admins and editors can insert gap keywords" 
ON public.content_gap_keywords 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admins and editors can update gap keywords" 
ON public.content_gap_keywords 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Admins and editors can delete gap keywords" 
ON public.content_gap_keywords 
FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Trigger for updated_at
CREATE TRIGGER update_content_gap_competitors_updated_at
BEFORE UPDATE ON public.content_gap_competitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for fast lookups
CREATE INDEX idx_content_gap_competitors_domain ON public.content_gap_competitors(domain, country);
CREATE INDEX idx_content_gap_keywords_competitor ON public.content_gap_keywords(competitor_id);