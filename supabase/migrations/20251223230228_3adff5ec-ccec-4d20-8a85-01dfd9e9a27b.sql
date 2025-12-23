-- Create redirects table for 301/302 URL redirects
CREATE TABLE public.redirects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  redirect_type INTEGER NOT NULL DEFAULT 301,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_redirect_type CHECK (redirect_type IN (301, 302))
);

-- Create unique constraint on source_url to prevent duplicate redirects
CREATE UNIQUE INDEX idx_redirects_source_url ON public.redirects(source_url);

-- Create index for faster lookups
CREATE INDEX idx_redirects_active ON public.redirects(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Admins can manage all redirects
CREATE POLICY "Admins can manage all redirects"
ON public.redirects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active redirects (needed for frontend redirect logic)
CREATE POLICY "Anyone can view active redirects"
ON public.redirects
FOR SELECT
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_redirects_updated_at
BEFORE UPDATE ON public.redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_news_updated_at();