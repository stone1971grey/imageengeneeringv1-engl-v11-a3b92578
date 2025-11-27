-- Fix Function Search Path Mutable issue
ALTER FUNCTION public.update_navigation_links_updated_at() SET search_path = public;