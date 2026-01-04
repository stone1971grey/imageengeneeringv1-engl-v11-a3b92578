-- Create the generic update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create table for global SEO permissions per user
CREATE TABLE public.user_seo_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seo_basic BOOLEAN NOT NULL DEFAULT false,
  seo_social BOOLEAN NOT NULL DEFAULT false,
  seo_advanced BOOLEAN NOT NULL DEFAULT false,
  seo_enterprise BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- One entry per user
  CONSTRAINT user_seo_permissions_unique_user UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_seo_permissions ENABLE ROW LEVEL SECURITY;

-- Admins can read all permissions
CREATE POLICY "Admins can read all SEO permissions"
ON public.user_seo_permissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can read their own permissions
CREATE POLICY "Users can read own SEO permissions"
ON public.user_seo_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert SEO permissions"
ON public.user_seo_permissions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update SEO permissions"
ON public.user_seo_permissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete SEO permissions"
ON public.user_seo_permissions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_user_seo_permissions_updated_at
BEFORE UPDATE ON public.user_seo_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for fast lookups
CREATE INDEX idx_user_seo_permissions_user ON public.user_seo_permissions (user_id);