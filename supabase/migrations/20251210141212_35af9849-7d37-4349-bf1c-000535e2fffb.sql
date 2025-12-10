-- Create events table for event management
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  date DATE NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL,
  location_venue TEXT,
  location_coordinates POINT,
  category TEXT NOT NULL DEFAULT 'Workshop',
  language_code TEXT NOT NULL DEFAULT 'EN',
  is_online BOOLEAN DEFAULT false,
  max_participants INTEGER,
  registration_deadline DATE,
  external_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT events_category_check CHECK (category IN ('Schulung', 'Workshop', 'Messe', 'Webinar', 'Conference')),
  CONSTRAINT events_language_check CHECK (language_code IN ('EN', 'DE', 'JA', 'KO', 'ZH'))
);

-- Create unique constraint on slug (for URL routing)
CREATE UNIQUE INDEX events_slug_unique ON public.events(slug);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view published events"
  ON public.events
  FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage all events"
  ON public.events
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_events_updated_at();