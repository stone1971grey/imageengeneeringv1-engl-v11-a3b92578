-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create content management table for editable page sections
CREATE TABLE public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'heading', 'text', 'json'
  content_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(page_slug, section_key)
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read content
CREATE POLICY "Anyone can view page content"
  ON public.page_content FOR SELECT
  USING (true);

-- Only admins can modify content
CREATE POLICY "Admins can insert page content"
  ON public.page_content FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update page content"
  ON public.page_content FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete page content"
  ON public.page_content FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Insert default content for photography page
INSERT INTO public.page_content (page_slug, section_key, content_type, content_value) VALUES
('photography', 'hero_title', 'heading', 'Photo & Video'),
('photography', 'hero_subtitle', 'heading', 'Image Quality'),
('photography', 'hero_description', 'text', 'Precision-engineered camera system test solutions for professional photography and video production.'),
('photography', 'hero_cta', 'text', 'Discover Photography Solutions'),
('photography', 'applications_title', 'heading', 'Main Applications'),
('photography', 'applications_description', 'text', 'Photography and video camera systems cover a broad spectrum of applications that contribute to image quality, color accuracy and overall performance.'),
('photography', 'applications_items', 'json', '[
  {
    "title": "Studio Photography Testing",
    "description": "Professional studio cameras require precise color reproduction and dynamic range testing to ensure consistent results across different lighting conditions and subjects."
  },
  {
    "title": "Video Production Quality",
    "description": "High-end video production systems need comprehensive testing for motion artifacts, rolling shutter, and color grading capabilities."
  },
  {
    "title": "Lens Performance Analysis",
    "description": "Essential measurements for evaluating optical quality, sharpness, distortion, and chromatic aberration across the entire focal range."
  },
  {
    "title": "Low-Light Performance",
    "description": "Testing camera systems in challenging lighting conditions to understand noise characteristics, sensitivity, and dynamic range limits."
  }
]');

-- Create index for faster queries
CREATE INDEX idx_page_content_page_slug ON public.page_content(page_slug);
CREATE INDEX idx_page_content_section_key ON public.page_content(section_key);