-- Create downloads table for managing white papers, conference papers, and videos
CREATE TABLE public.downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  download_type text NOT NULL CHECK (download_type IN ('whitepaper', 'conference', 'video')),
  category text,
  pages integer,
  duration text,
  publish_date date NOT NULL DEFAULT CURRENT_DATE,
  download_url text,
  image_url text,
  language_code text NOT NULL DEFAULT 'EN',
  published boolean DEFAULT true,
  visibility text NOT NULL DEFAULT 'public',
  position integer DEFAULT 999,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT downloads_slug_language_unique UNIQUE (slug, language_code)
);

-- Enable RLS
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published downloads"
  ON public.downloads
  FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage all downloads"
  ON public.downloads
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_downloads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_downloads_updated_at
  BEFORE UPDATE ON public.downloads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_downloads_updated_at();

-- Insert initial data from existing static content
INSERT INTO public.downloads (slug, title, teaser, description, download_type, category, pages, publish_date, download_url) VALUES
('ieee-p2020-whitepaper', 'How Well Do Vehicles Really "See"? – The IEEE P2020 Automotive Imaging White Paper', 'Cameras are the eyes of modern vehicles – yet until recently, the automotive industry lacked a common standard to objectively measure their performance. The IEEE P2020 Automotive Imaging White Paper reveals how international experts are closing this gap.', '<h3>How Well Do Vehicles Really "See"?</h3><p>Cameras are the eyes of modern vehicles – yet until recently, the automotive industry lacked a common standard to objectively measure their performance.</p><p>The IEEE P2020 Automotive Imaging White Paper reveals how international experts are closing this gap by defining the first unified framework for automotive image quality.</p><p>Discover why traditional image quality standards from consumer electronics fail to meet the demanding conditions of vehicle cameras – and how P2020 introduces consistent KPIs, testing procedures, and evaluation models that ensure safety, reliability, and comparability across imaging systems.</p><h3>What You''ll Learn</h3><p>This white paper provides valuable insights for OEMs, suppliers, and technology decision-makers who want to understand:</p><ul><li>Where current standards fall short</li><li>How LED flicker, HDR, fisheye optics, and temperature extremes affect image performance</li><li>Why standardized metrics are key to safer driver assistance and autonomous systems</li></ul>', 'whitepaper', 'Standards & Compliance', 24, '2023-12-01', '/downloads/P2020_white_paper.pdf'),
('printer-print-life-tests', 'Printer and Print Life Tests', 'Comprehensive guide to printer quality testing and print longevity assessment. Learn industry-standard methodologies for evaluating printer performance and output quality.', '<h3>Introduction</h3><p>Printer testing and print life assessment are critical components of quality assurance in the printing industry.</p><p>This white paper explores comprehensive testing methodologies and best practices.</p><h3>Testing Approaches</h3><ul><li>Color accuracy and consistency testing</li><li>Resolution and sharpness measurements</li><li>Print durability and longevity tests</li><li>Environmental stability testing</li><li>Test chart applications and usage</li></ul>', 'whitepaper', 'Testing Methodology', 18, '2023-10-01', '#download-printer'),
('camera-tests', 'Camera Tests', 'Advanced camera testing techniques for automotive, mobile, and industrial applications. Explore comprehensive testing methodologies for modern camera systems.', '<h3>Scope</h3><p>Modern camera systems require rigorous testing to ensure optimal performance across diverse applications.</p><p>This white paper covers comprehensive testing approaches for various camera technologies.</p><h3>Testing Categories</h3><ul><li>Resolution and MTF testing</li><li>Color accuracy and reproduction</li><li>Dynamic range and HDR performance</li><li>Low-light sensitivity testing</li><li>Geometric distortion analysis</li></ul>', 'whitepaper', 'Image Quality', 32, '2024-01-01', '#download-camera'),
('adas-camera-standards', 'ADAS Camera Standards and Testing Requirements', 'Presented at the International Automotive Conference 2024. Covers the latest standards and testing requirements for Advanced Driver Assistance Systems cameras.', '<h3>Overview</h3><p>This conference paper was presented at the International Automotive Conference 2024, addressing critical testing standards for ADAS cameras.</p><h3>Key Topics</h3><ul><li>Current ADAS testing standards</li><li>IEEE P2020 compliance requirements</li><li>Safety-critical performance metrics</li><li>Future standardization efforts</li></ul><h3>Target Audience</h3><p>Automotive engineers, test engineers, and quality assurance professionals working on ADAS development.</p>', 'conference', 'Standards & Compliance', 16, '2024-02-01', '#download-adas-paper'),
('hdr-performance-metrics', 'HDR Performance Metrics for Automotive Imaging', 'Research paper on High Dynamic Range performance evaluation methods, presented at the IEEE Vision Conference.', '<h3>HDR in Automotive Applications</h3><p>This research paper explores the critical role of High Dynamic Range imaging in modern automotive camera systems.</p><h3>Research Focus</h3><ul><li>HDR performance measurement methodologies</li><li>Real-world testing scenarios</li><li>Comparative analysis of HDR techniques</li><li>Standards compliance evaluation</li></ul>', 'conference', 'Image Quality', 12, '2024-04-01', '#download-hdr-paper'),
('intro-automotive-camera-testing', 'Introduction to Automotive Camera Testing', 'Comprehensive introduction to automotive camera testing methodologies, standards, and best practices. Perfect for engineers new to the field.', '<h3>Video Overview</h3><p>This comprehensive video provides an introduction to automotive camera testing, covering essential methodologies and industry standards.</p><h3>Topics Covered</h3><ul><li>Fundamentals of automotive camera testing</li><li>Key performance indicators</li><li>Testing equipment and setup</li><li>Industry standards overview</li><li>Best practices and common pitfalls</li></ul><h3>Who Should Watch</h3><p>Engineers new to automotive imaging, test engineers transitioning to the automotive sector, and quality assurance professionals.</p>', 'video', 'Testing Methodology', NULL, '2024-06-01', '#video-intro'),
('arcturus-platform-overview', 'Arcturus Testing Platform Overview', 'Detailed walkthrough of the Arcturus testing platform, demonstrating key features and testing capabilities for automotive imaging.', '<h3>Platform Introduction</h3><p>Learn about the Arcturus testing platform and its comprehensive capabilities for automotive camera testing.</p><h3>Video Content</h3><ul><li>Platform architecture and components</li><li>Hardware setup and configuration</li><li>Software features and capabilities</li><li>Real-world testing demonstrations</li><li>Integration with existing workflows</li></ul>', 'video', 'Testing Methodology', NULL, '2024-04-01', '#video-arcturus'),
('ieee-p2020-explained', 'IEEE P2020 Standard Explained', 'Deep dive into the IEEE P2020 automotive imaging standard, explaining key metrics, test procedures, and implementation guidelines.', '<h3>Understanding IEEE P2020</h3><p>This video provides a comprehensive explanation of the IEEE P2020 standard for automotive imaging systems.</p><h3>Content Overview</h3><ul><li>Background and motivation for P2020</li><li>Key performance metrics and KPIs</li><li>Test procedures and methodologies</li><li>Implementation guidelines</li><li>Compliance and certification</li></ul><h3>Learning Outcomes</h3><p>After watching, you''ll understand how to implement P2020 testing in your organization and achieve compliance.</p>', 'video', 'Standards & Compliance', NULL, '2024-02-01', '#video-p2020');

-- Update videos with duration
UPDATE public.downloads SET duration = '12:34' WHERE slug = 'intro-automotive-camera-testing';
UPDATE public.downloads SET duration = '8:45' WHERE slug = 'arcturus-platform-overview';
UPDATE public.downloads SET duration = '15:20' WHERE slug = 'ieee-p2020-explained';