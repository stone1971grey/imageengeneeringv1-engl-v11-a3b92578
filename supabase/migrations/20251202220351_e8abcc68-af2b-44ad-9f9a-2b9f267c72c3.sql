-- Add optional icon_key column to store navigation icon selection for each link
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'navigation_links'
      AND column_name = 'icon_key'
  ) THEN
    ALTER TABLE public.navigation_links
      ADD COLUMN icon_key text;
  END IF;
END;
$$;