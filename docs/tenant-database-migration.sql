-- ============================================
-- SPADE CMS - Tenant Database Migration
-- Version: 1.1.2
-- ============================================
-- Diese Migration erstellt alle notwendigen Tabellen,
-- RLS-Policies und Funktionen für ein neues Tenant-Projekt.
-- 
-- WICHTIG: In Lovable Cloud ausführen über das Migration-Tool
-- oder direkt im SQL-Editor.
-- ============================================

-- ============================================
-- PHASE 1: ENUM-TYPEN
-- ============================================

-- App-Rollen Enum
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PHASE 2: HILFSFUNKTIONEN
-- ============================================

-- Funktion: Rolle prüfen
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Funktion: Nächste Page-ID generieren
CREATE OR REPLACE FUNCTION public.get_next_page_id()
RETURNS integer AS $$
DECLARE
  next_id integer;
BEGIN
  UPDATE page_id_sequence
  SET last_used_page_id = last_used_page_id + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING last_used_page_id INTO next_id;
  
  RETURN next_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- PHASE 3: CORE-TABELLEN
-- ============================================

-- Profiles (User-Erweiterung)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  username text,
  created_at timestamptz DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User SEO Permissions
CREATE TABLE IF NOT EXISTS public.user_seo_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  seo_basic boolean DEFAULT false,
  seo_social boolean DEFAULT false,
  seo_advanced boolean DEFAULT false,
  seo_enterprise boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Editor Page Access
CREATE TABLE IF NOT EXISTS public.editor_page_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  page_slug text NOT NULL,
  language_code text,
  can_draft boolean DEFAULT true,
  can_publish boolean DEFAULT false,
  frontend_editing_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Page ID Sequence
CREATE TABLE IF NOT EXISTS public.page_id_sequence (
  id integer PRIMARY KEY DEFAULT 1,
  last_used_page_id integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Initial sequence row
INSERT INTO page_id_sequence (id, last_used_page_id)
VALUES (1, 100)
ON CONFLICT (id) DO NOTHING;

-- Page Registry
CREATE TABLE IF NOT EXISTS public.page_registry (
  id serial PRIMARY KEY,
  page_id integer NOT NULL,
  page_slug text NOT NULL UNIQUE,
  page_title text NOT NULL,
  parent_id integer,
  parent_slug text,
  position integer,
  design_icon text,
  flyout_image_url text,
  flyout_description text,
  flyout_description_translations jsonb DEFAULT '{}'::jsonb,
  title_translations jsonb DEFAULT '{}'::jsonb,
  cta_group text,
  cta_label text,
  cta_icon text,
  target_page_slug text,
  status text NOT NULL DEFAULT 'published',
  nav_category text DEFAULT 'main',
  nav_visible boolean DEFAULT true,
  nav_position integer,
  frontend_editing_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Segment Registry
CREATE TABLE IF NOT EXISTS public.segment_registry (
  id serial PRIMARY KEY,
  page_slug text NOT NULL,
  segment_id integer NOT NULL,
  segment_type text NOT NULL,
  segment_key text NOT NULL,
  position integer,
  is_static boolean DEFAULT false,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Page Content
CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  content_type text NOT NULL,
  content_value text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  content_status text NOT NULL DEFAULT 'approved',
  draft_value text,
  import_stage integer DEFAULT 1,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  approved_at timestamptz,
  approved_by uuid
);

-- Page Content Backups
CREATE TABLE IF NOT EXISTS public.page_content_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  content_type text NOT NULL,
  content_value text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  original_updated_at timestamptz,
  original_updated_by uuid,
  backup_created_at timestamptz DEFAULT now()
);

-- Media Folders
CREATE TABLE IF NOT EXISTS public.media_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  parent_id uuid REFERENCES media_folders(id),
  position integer DEFAULT 999,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- File Segment Mappings
CREATE TABLE IF NOT EXISTS public.file_segment_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  bucket_id text NOT NULL DEFAULT 'page-images',
  segment_ids text[] NOT NULL,
  alt_text text,
  alt_text_translations jsonb DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'public',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Navigation Links (Legacy-Support)
CREATE TABLE IF NOT EXISTS public.navigation_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  label_key text NOT NULL,
  language text NOT NULL,
  category text NOT NULL,
  parent_category text,
  parent_label text,
  description text,
  icon_key text,
  target_page_slug text,
  position integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Glossary
CREATE TABLE IF NOT EXISTS public.glossary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  term_type text NOT NULL,
  context text,
  translations jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Redirects
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  target_url text NOT NULL,
  redirect_type integer NOT NULL DEFAULT 301,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PHASE 4: CONTENT-MODULE TABELLEN
-- ============================================

-- News Articles
CREATE TABLE IF NOT EXISTS public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  category text,
  author text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  language text NOT NULL DEFAULT 'en',
  visibility text NOT NULL DEFAULT 'public',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  image_url text NOT NULL,
  date date NOT NULL,
  time_start text NOT NULL,
  time_end text,
  location_city text NOT NULL,
  location_country text NOT NULL,
  location_venue text,
  location_coordinates point,
  category text NOT NULL DEFAULT 'Workshop',
  language_code text NOT NULL DEFAULT 'EN',
  external_url text,
  is_online boolean DEFAULT false,
  max_participants integer,
  registration_deadline date,
  visibility text NOT NULL DEFAULT 'public',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug text NOT NULL DEFAULT '',
  event_title text NOT NULL,
  event_date text NOT NULL,
  event_location text NOT NULL,
  evt_image_url text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  phone text,
  industry text,
  current_test_systems text,
  automotive_interests text[],
  created_at timestamptz DEFAULT now()
);

-- Products (optional - je nach Feature-Flag)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'Test Charts',
  subcategory text,
  sku text,
  price_info text,
  availability text DEFAULT 'available',
  language_code text NOT NULL DEFAULT 'EN',
  visibility text NOT NULL DEFAULT 'public',
  video_url text,
  specifications jsonb DEFAULT '{}'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  applications jsonb DEFAULT '[]'::jsonb,
  related_products jsonb DEFAULT '[]'::jsonb,
  gallery_images jsonb DEFAULT '[]'::jsonb,
  documents jsonb DEFAULT '[]'::jsonb,
  chart_sizes jsonb DEFAULT '[]'::jsonb,
  product_types jsonb DEFAULT '[]'::jsonb,
  measurement_focus jsonb DEFAULT '[]'::jsonb,
  format_fov jsonb DEFAULT '[]'::jsonb,
  integration_features jsonb DEFAULT '[]'::jsonb,
  display_badges jsonb DEFAULT '[]'::jsonb,
  position integer DEFAULT 999,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Downloads
CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  teaser text NOT NULL,
  description text,
  download_type text NOT NULL,
  category text,
  download_url text,
  image_url text,
  duration text,
  pages integer,
  language_code text NOT NULL DEFAULT 'EN',
  visibility text NOT NULL DEFAULT 'public',
  position integer DEFAULT 999,
  publish_date date NOT NULL DEFAULT CURRENT_DATE,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Download Requests
CREATE TABLE IF NOT EXISTS public.download_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  download_type text NOT NULL,
  item_id text NOT NULL,
  item_title text NOT NULL,
  category_tag text,
  title_tag text,
  dl_type text,
  dl_title text,
  dl_url text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text NOT NULL UNIQUE,
  topics text[] DEFAULT '{}',
  language text DEFAULT 'en',
  mautic_contact_id text,
  confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Contact Submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Backlog Tasks
CREATE TABLE IF NOT EXISTS public.backlog_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  category text,
  assigned_to uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PHASE 5: RLS AKTIVIEREN
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seo_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_page_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_id_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_segment_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlog_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PHASE 6: RLS POLICIES
-- ============================================

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can manage all profiles" ON profiles FOR UPDATE USING (has_role('admin', auth.uid()));

-- User Roles Policies
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user roles" ON user_roles FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Allow creating first admin or admins can manage" ON user_roles FOR INSERT 
  WITH CHECK ((NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin')) OR has_role('admin', auth.uid()));
CREATE POLICY "Admins can update roles" ON user_roles FOR UPDATE USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can delete roles" ON user_roles FOR DELETE USING (has_role('admin', auth.uid()));

-- User SEO Permissions Policies
CREATE POLICY "Users can read own SEO permissions" ON user_seo_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all SEO permissions" ON user_seo_permissions FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can insert SEO permissions" ON user_seo_permissions FOR INSERT WITH CHECK (has_role('admin', auth.uid()));
CREATE POLICY "Admins can update SEO permissions" ON user_seo_permissions FOR UPDATE USING (has_role('admin', auth.uid()));
CREATE POLICY "Admins can delete SEO permissions" ON user_seo_permissions FOR DELETE USING (has_role('admin', auth.uid()));

-- Editor Page Access Policies
CREATE POLICY "Editors can view their own page access" ON editor_page_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage editor page access" ON editor_page_access FOR ALL USING (has_role('admin', auth.uid()));

-- Page ID Sequence Policies
CREATE POLICY "Allow authenticated users to read page_id_sequence" ON page_id_sequence FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update page_id_sequence" ON page_id_sequence FOR UPDATE USING (true) WITH CHECK (true);

-- Page Registry Policies
CREATE POLICY "Anyone can view page registry" ON page_registry FOR SELECT USING (true);
CREATE POLICY "Admins can insert page registry" ON page_registry FOR INSERT WITH CHECK (has_role('admin', auth.uid()));
CREATE POLICY "Admins and editors can update page registry" ON page_registry FOR UPDATE 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
CREATE POLICY "Admins can delete page registry" ON page_registry FOR DELETE USING (has_role('admin', auth.uid()));

-- Segment Registry Policies
CREATE POLICY "Anyone can view segment registry" ON segment_registry FOR SELECT USING (true);
CREATE POLICY "Admins can manage segment registry" ON segment_registry FOR ALL USING (has_role('admin', auth.uid()));
CREATE POLICY "Editors can manage segments for their pages" ON segment_registry FOR ALL
  USING (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__')
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug NOT IN ('__global__', '__all__'))
  ))
  WITH CHECK (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__')
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug NOT IN ('__global__', '__all__'))
  ));

-- Page Content Policies
CREATE POLICY "Anyone can view page content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Admins and editors can insert page content" ON page_content FOR INSERT 
  WITH CHECK (has_role('admin', auth.uid()) OR (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__' AND language_code = page_content.language)
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug <> '__global__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
  )));
CREATE POLICY "Admins and editors can update page content" ON page_content FOR UPDATE 
  USING (has_role('admin', auth.uid()) OR (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__' AND language_code = page_content.language)
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug <> '__global__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
  )));
CREATE POLICY "Admins and editors can delete page content" ON page_content FOR DELETE 
  USING (has_role('admin', auth.uid()) OR (has_role('editor', auth.uid()) AND (
    EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__global__' AND language_code = page_content.language)
    OR page_slug IN (SELECT epa.page_slug FROM editor_page_access epa WHERE epa.user_id = auth.uid() AND epa.page_slug <> '__global__')
    OR EXISTS (SELECT 1 FROM editor_page_access WHERE user_id = auth.uid() AND page_slug = '__all__')
  )));

-- Page Content Backups Policies
CREATE POLICY "Admins and editors can view backups" ON page_content_backups FOR SELECT 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
CREATE POLICY "Admins and editors can create backups" ON page_content_backups FOR INSERT 
  WITH CHECK (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));
CREATE POLICY "Admins can delete old backups" ON page_content_backups FOR DELETE 
  USING (has_role('admin', auth.uid()));

-- Media Folders Policies
CREATE POLICY "Anyone can view media folders" ON media_folders FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage media folders" ON media_folders FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- File Segment Mappings Policies
CREATE POLICY "Anyone can view file mappings" ON file_segment_mappings FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage file mappings" ON file_segment_mappings FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Navigation Links Policies
CREATE POLICY "Anyone can view navigation links" ON navigation_links FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage navigation links" ON navigation_links FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Glossary Policies
CREATE POLICY "Anyone can view glossary" ON glossary FOR SELECT USING (true);
CREATE POLICY "Admins and editors can manage glossary" ON glossary FOR ALL 
  USING (has_role('admin', auth.uid()) OR has_role('editor', auth.uid()));

-- Redirects Policies
CREATE POLICY "Anyone can view active redirects" ON redirects FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all redirects" ON redirects FOR ALL USING (has_role('admin', auth.uid()));

-- News Articles Policies
CREATE POLICY "Anyone can view published news" ON news_articles FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all news" ON news_articles FOR ALL USING (has_role('admin', auth.uid()));

-- Events Policies
CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all events" ON events FOR ALL USING (has_role('admin', auth.uid()));

-- Event Registrations Policies
CREATE POLICY "Anyone can insert event registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view event registrations" ON event_registrations FOR SELECT 
  USING (has_role('admin', auth.uid()));

-- Products Policies
CREATE POLICY "Anyone can view published products" ON products FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (has_role('admin', auth.uid()));

-- Downloads Policies
CREATE POLICY "Anyone can view published downloads" ON downloads FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all downloads" ON downloads FOR ALL USING (has_role('admin', auth.uid()));

-- Download Requests Policies
CREATE POLICY "Anyone can insert download requests" ON download_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view download requests" ON download_requests FOR SELECT 
  USING (has_role('admin', auth.uid()));

-- Newsletter Subscriptions Policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view newsletter subscriptions" ON newsletter_subscriptions FOR SELECT 
  USING (has_role('admin', auth.uid()));
CREATE POLICY "Only admins can update newsletter subscriptions" ON newsletter_subscriptions FOR UPDATE 
  USING (has_role('admin', auth.uid()));
CREATE POLICY "Only admins can delete newsletter subscriptions" ON newsletter_subscriptions FOR DELETE 
  USING (has_role('admin', auth.uid()));

-- Contact Submissions Policies
CREATE POLICY "Anyone can insert contact submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contact submissions" ON contact_submissions FOR SELECT 
  USING (has_role('admin', auth.uid()));

-- Backlog Tasks Policies
CREATE POLICY "Block anonymous access to backlog tasks" ON backlog_tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view their own or assigned tasks" ON backlog_tasks FOR SELECT 
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Admins can view all backlog tasks" ON backlog_tasks FOR SELECT USING (has_role('admin', auth.uid()));
CREATE POLICY "Users can create backlog tasks" ON backlog_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own or assigned tasks" ON backlog_tasks FOR UPDATE 
  USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Admins can manage all backlog tasks" ON backlog_tasks FOR ALL USING (has_role('admin', auth.uid()));

-- ============================================
-- PHASE 7: STORAGE BUCKETS
-- ============================================

-- Diese müssen über die Lovable Cloud UI erstellt werden:
-- 1. page-images (public)
-- 2. cms-media (public)
-- 3. user-uploads (private)

-- ============================================
-- PHASE 8: TRIGGER FÜR PROFILE-ERSTELLUNG
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger erstellen (nur wenn nicht existiert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FERTIG!
-- ============================================
-- Nach Ausführung dieser Migration:
-- 1. Ersten User registrieren
-- 2. User-ID aus auth.users kopieren
-- 3. Admin-Rolle zuweisen:
--    INSERT INTO user_roles (user_id, role) VALUES ('USER_UUID', 'admin');
-- ============================================
