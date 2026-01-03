-- Create relaunch URL mappings table for SEO migration planning
CREATE TABLE public.relaunch_url_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  old_url TEXT NOT NULL,
  focus_keyword TEXT,
  current_position INTEGER,
  search_volume INTEGER,
  competition NUMERIC(5,2),
  cpc NUMERIC(10,2),
  traffic_estimate INTEGER,
  new_url TEXT,
  new_url_suggestion TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'skipped')),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('up', 'stable', 'down')),
  redirect_created BOOLEAN DEFAULT false,
  notes TEXT,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(domain, old_url, snapshot_date)
);

-- Enable RLS
ALTER TABLE public.relaunch_url_mappings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all
CREATE POLICY "Admins can manage relaunch mappings"
ON public.relaunch_url_mappings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Editors can view
CREATE POLICY "Editors can view relaunch mappings"
ON public.relaunch_url_mappings
FOR SELECT
USING (has_role(auth.uid(), 'editor'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_relaunch_mappings_domain ON public.relaunch_url_mappings(domain);
CREATE INDEX idx_relaunch_mappings_status ON public.relaunch_url_mappings(approval_status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_relaunch_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_relaunch_mappings_updated_at
BEFORE UPDATE ON public.relaunch_url_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_relaunch_mappings_updated_at();