-- Create news_articles table
CREATE TABLE public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  teaser text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  date text NOT NULL,
  published boolean DEFAULT true,
  category text,
  author text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published news
CREATE POLICY "Anyone can view published news"
  ON public.news_articles
  FOR SELECT
  USING (published = true);

-- Admins can manage all news
CREATE POLICY "Admins can manage all news"
  ON public.news_articles
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_backlog_tasks_updated_at();

-- Insert existing news data
INSERT INTO public.news_articles (slug, title, teaser, content, image_url, date, published) VALUES
('emva-1288-iso-24942', 'EMVA 1288 becoming ISO 24942', 'Dietmar Wueller is leading the international effort to migrate EMVA 1288 into ISO 24942, enhancing global standards for image quality testing.', 'Detailed content will be migrated from NewsDetail.tsx', '/src/assets/news-emva-1288-logo.png', 'July 21, 2025', true),
('te300-skin-tone-chart', 'TE300 – A new skin tone test chart', 'Introducing the TE300 Skin Tone Checker: a modern tool for assessing skin tone accuracy in camera systems with real-world spectral data.', 'Detailed content will be migrated from NewsDetail.tsx', '/src/assets/news-te300.png', 'June 20, 2025', true),
('iq-analyzer-x-ai', 'AI-powered image quality analysis software', 'The iQ-Analyzer-X introduces advanced AI-powered tools for chart detection, automation, and video file analysis to streamline workflows.', 'Detailed content will be migrated from NewsDetail.tsx', '/src/assets/news-iq-analyzer-x.png', 'May 27, 2025', true),
('geometric-camera-calibration', 'Geometric Camera Calibration', 'GEOCAL offers a compact, laser-based solution for geometric calibration, improving accuracy compared to traditional checkerboard targets.', 'Detailed content will be migrated from NewsDetail.tsx', '/src/assets/news-geocal-xl.png', 'July 21, 2025', true);