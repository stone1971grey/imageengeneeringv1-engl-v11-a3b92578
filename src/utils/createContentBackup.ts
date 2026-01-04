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
  console.log('[Backup] 🚀 Starting backup for:', { pageSlug, sectionKey, language });
  
  try {
    // Fetch current content that will be backed up
    const { data: currentContent, error: fetchError } = await supabase
      .from('page_content')
      .select('content_type, content_value, updated_at, updated_by')
      .eq('page_slug', pageSlug)
      .eq('section_key', sectionKey)
      .eq('language', language)
      .maybeSingle();

    console.log('[Backup] 📋 Fetched current content:', { currentContent, fetchError });

    if (fetchError) {
      console.error('[Backup] ❌ Error fetching current content:', fetchError);
      return false;
    }

    // If no current content exists, nothing to backup
    if (!currentContent) {
      console.log('[Backup] ⚠️ No existing content to backup for:', pageSlug, sectionKey, language);
      return true;
    }

    // Create backup entry
    console.log('[Backup] 💾 Inserting backup entry...');
    const { data: insertData, error: backupError } = await supabase
      .from('page_content_backups')
      .insert({
        page_slug: pageSlug,
        section_key: sectionKey,
        language: language,
        content_type: currentContent.content_type,
        content_value: currentContent.content_value,
        original_updated_at: currentContent.updated_at,
        original_updated_by: currentContent.updated_by
      })
      .select();

    console.log('[Backup] 📝 Insert result:', { insertData, backupError });

    if (backupError) {
      console.error('[Backup] ❌ Error creating backup:', backupError);
      return false;
    }

    console.log('[Backup] ✅ Successfully created backup for:', pageSlug, sectionKey, language);
    return true;
  } catch (error) {
    console.error('[Backup] ❌ Unexpected error:', error);
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

/**
 * CRITICAL: Validates if a page_segments save operation is safe.
 * Returns { safe: boolean, reason?: string }
 * 
 * This function should be called BEFORE any save operation that modifies page_segments
 * to prevent accidental data loss.
 */
export async function validatePageSegmentsSave(
  pageSlug: string,
  newSegments: any[],
  language: string = 'en'
): Promise<{ safe: boolean; reason?: string; existingCount?: number; newCount?: number }> {
  try {
    // Fetch existing segments
    const { data: existingData, error } = await supabase
      .from('page_content')
      .select('content_value')
      .eq('page_slug', pageSlug)
      .eq('section_key', 'page_segments')
      .eq('language', language)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('[SAVE VALIDATOR] Error fetching existing segments:', error);
      return { safe: true }; // Allow if we can't check
    }

    let existingSegments: any[] = [];
    if (existingData?.content_value) {
      try {
        existingSegments = JSON.parse(existingData.content_value);
      } catch (e) {
        console.warn('[SAVE VALIDATOR] Could not parse existing segments');
        return { safe: true };
      }
    }

    // Count non-footer content segments
    const countNonFooter = (segs: any[]) => 
      segs.filter((s: any) => s.type !== 'footer' && s.type !== 'mini-footer').length;
    
    const existingNonFooterCount = countNonFooter(existingSegments);
    const newNonFooterCount = countNonFooter(newSegments);

    // BLOCK: Empty list overwriting non-empty
    if (existingSegments.length > 0 && newSegments.length === 0) {
      console.error('[SAVE VALIDATOR] BLOCKED: Empty list would overwrite', existingSegments.length, 'segments');
      return { 
        safe: false, 
        reason: `Cannot save empty segment list - would delete ${existingSegments.length} existing segments`,
        existingCount: existingSegments.length,
        newCount: 0
      };
    }

    // BLOCK: Losing most content (keeping only footer)
    if (existingNonFooterCount > 2 && newNonFooterCount <= 1) {
      console.error('[SAVE VALIDATOR] BLOCKED: Would reduce', existingNonFooterCount, 'content segments to', newNonFooterCount);
      return { 
        safe: false, 
        reason: `Would delete ${existingNonFooterCount - newNonFooterCount} content segments - this looks like a bug`,
        existingCount: existingNonFooterCount,
        newCount: newNonFooterCount
      };
    }

    return { 
      safe: true,
      existingCount: existingSegments.length,
      newCount: newSegments.length
    };
  } catch (error) {
    console.error('[SAVE VALIDATOR] Unexpected error:', error);
    return { safe: true }; // Allow on error to not block legitimate saves
  }
}
