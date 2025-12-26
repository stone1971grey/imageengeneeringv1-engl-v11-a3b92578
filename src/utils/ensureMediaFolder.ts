/**
 * Utility to ensure media folder hierarchy exists for a given page slug
 * 
 * This ensures that when images are uploaded from Computer in any segment,
 * the proper folder structure is created in media_folders and the file
 * is properly organized in the Media Management system.
 */

import { supabase } from "@/integrations/supabase/client";

interface FolderResult {
  folderId: string;
  storagePath: string;
}

/**
 * Ensures the complete folder hierarchy exists for a page slug.
 * Creates any missing folders in the hierarchy.
 * 
 * @param pageSlug - The page slug (e.g., "products/illumination-devices/arcturus")
 * @returns The folder ID and storage path of the deepest folder
 */
export async function ensureMediaFolderHierarchy(pageSlug: string): Promise<FolderResult | null> {
  if (!pageSlug) {
    console.warn('[ensureMediaFolderHierarchy] No page slug provided');
    return null;
  }

  try {
    const user = (await supabase.auth.getUser()).data.user;
    const pathParts = pageSlug.split('/').filter(p => p.trim() !== '');
    
    if (pathParts.length === 0) {
      console.warn('[ensureMediaFolderHierarchy] Empty page slug');
      return null;
    }

    let currentParentId: string | null = null;
    let currentStoragePath = '';
    let lastFolderId: string | null = null;

    // Traverse/create each level of the folder hierarchy
    // Top-level folders have parent_id = null, subsequent levels have parent_id set
    for (let i = 0; i < pathParts.length; i++) {
      const folderName = pathParts[i];
      currentStoragePath = currentStoragePath ? `${currentStoragePath}/${folderName}` : folderName;

      // Check if folder exists by exact storage_path match first (most reliable)
      const { data: exactMatch, error: exactError } = await supabase
        .from('media_folders')
        .select('id, storage_path, name')
        .eq('storage_path', currentStoragePath)
        .maybeSingle();

      if (exactError && exactError.code !== 'PGRST116') {
        console.error(`[ensureMediaFolderHierarchy] Error checking folder ${folderName}:`, exactError);
        return null;
      }

      const existingFolder = exactMatch;

      if (existingFolder) {
        // Folder exists, continue to next level
        currentParentId = existingFolder.id;
        lastFolderId = existingFolder.id;
        console.log(`[ensureMediaFolderHierarchy] Found existing folder: ${folderName} (${existingFolder.id})`);
      } else {
        // Create the folder
        const { data: newFolder, error: createError } = await supabase
          .from('media_folders')
          .insert({
            name: folderName,
            parent_id: currentParentId,
            storage_path: currentStoragePath,
            created_by: user?.id || null
          })
          .select('id, storage_path')
          .single();

        if (createError) {
          console.error(`[ensureMediaFolderHierarchy] Error creating folder ${folderName}:`, createError);
          return null;
        }

        currentParentId = newFolder.id;
        lastFolderId = newFolder.id;
        console.log(`[ensureMediaFolderHierarchy] Created new folder: ${folderName} (${newFolder.id})`);
      }
    }

    return lastFolderId ? {
      folderId: lastFolderId,
      storagePath: currentStoragePath
    } : null;
  } catch (error) {
    console.error('[ensureMediaFolderHierarchy] Unexpected error:', error);
    return null;
  }
}

/**
 * Creates or updates a file-segment mapping for proper Media Management integration.
 * 
 * @param filePath - The file path in storage (e.g., "products/illumination-devices/arcturus/footer-team-1234.jpg")
 * @param segmentIdentifier - The segment identifier (e.g., "footer-products/illumination-devices/arcturus" or segment ID)
 * @param altText - Optional alt text for the image
 */
export async function createOrUpdateFileMapping(
  filePath: string,
  segmentIdentifier: string,
  altText?: string
): Promise<boolean> {
  if (!filePath || !segmentIdentifier) {
    console.warn('[createOrUpdateFileMapping] Missing required parameters');
    return false;
  }

  try {
    // Check if mapping already exists
    const { data: existingMapping, error: checkError } = await supabase
      .from('file_segment_mappings')
      .select('id, segment_ids')
      .eq('file_path', filePath)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[createOrUpdateFileMapping] Error checking mapping:', checkError);
      return false;
    }

    if (existingMapping) {
      // Add segment_id to existing mapping if not already present
      const segmentIds = existingMapping.segment_ids || [];
      if (!segmentIds.includes(segmentIdentifier)) {
        const { error: updateError } = await supabase
          .from('file_segment_mappings')
          .update({ 
            segment_ids: [...segmentIds, segmentIdentifier],
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMapping.id);

        if (updateError) {
          console.error('[createOrUpdateFileMapping] Error updating mapping:', updateError);
          return false;
        }
      }
      console.log('[createOrUpdateFileMapping] Updated existing mapping for:', filePath);
    } else {
      // Create new mapping
      const { error: insertError } = await supabase
        .from('file_segment_mappings')
        .insert({
          file_path: filePath,
          segment_ids: [segmentIdentifier],
          alt_text: altText || '',
          visibility: 'public'
        });

      if (insertError) {
        console.error('[createOrUpdateFileMapping] Error creating mapping:', insertError);
        return false;
      }
      console.log('[createOrUpdateFileMapping] Created new mapping for:', filePath);
    }

    return true;
  } catch (error) {
    console.error('[createOrUpdateFileMapping] Unexpected error:', error);
    return false;
  }
}
