import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a backup of page content before saving new version.
 * Automatically keeps only the last 10 versions per page/section/language.
 */
export async function createContentBackup(
  pageSlug: string,
  sectionKey: string,
  language: string = 'en'
): Promise<boolean> {
  try {
    // Fetch current content that will be backed up
    const { data: currentContent, error: fetchError } = await supabase
      .from('page_content')
      .select('content_type, content_value, updated_at, updated_by')
      .eq('page_slug', pageSlug)
      .eq('section_key', sectionKey)
      .eq('language', language)
      .maybeSingle();

    if (fetchError) {
      console.error('[Backup] Error fetching current content:', fetchError);
      return false;
    }

    // If no current content exists, nothing to backup
    if (!currentContent) {
      console.log('[Backup] No existing content to backup for:', pageSlug, sectionKey, language);
      return true;
    }

    // Create backup entry
    const { error: backupError } = await supabase
      .from('page_content_backups')
      .insert({
        page_slug: pageSlug,
        section_key: sectionKey,
        language: language,
        content_type: currentContent.content_type,
        content_value: currentContent.content_value,
        original_updated_at: currentContent.updated_at,
        original_updated_by: currentContent.updated_by
      });

    if (backupError) {
      console.error('[Backup] Error creating backup:', backupError);
      return false;
    }

    console.log('[Backup] Successfully created backup for:', pageSlug, sectionKey, language);
    return true;
  } catch (error) {
    console.error('[Backup] Unexpected error:', error);
    return false;
  }
}

/**
 * Creates backups for multiple section keys at once (e.g., page_segments + tab_order)
 */
export async function createMultipleBackups(
  pageSlug: string,
  sectionKeys: string[],
  language: string = 'en'
): Promise<boolean> {
  const results = await Promise.all(
    sectionKeys.map(key => createContentBackup(pageSlug, key, language))
  );
  return results.every(success => success);
}
