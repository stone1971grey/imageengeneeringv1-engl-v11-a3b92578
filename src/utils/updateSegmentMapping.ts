import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the file path from a Supabase Storage public URL
 * Example: https://xyz.supabase.co/storage/v1/object/public/page-images/Product Page/image.jpg
 * Returns: Product Page/image.jpg
 */
export function extractFilePathFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the bucket name index (after "public")
    const publicIndex = pathParts.indexOf('public');
    if (publicIndex === -1 || publicIndex + 2 >= pathParts.length) {
      return null;
    }
    
    // Skip "public" and bucket name, take the rest
    const filePath = pathParts.slice(publicIndex + 2).join('/');
    return decodeURIComponent(filePath);
  } catch (error) {
    console.error('[extractFilePathFromUrl] Error parsing URL:', error);
    return null;
  }
}

/**
 * Updates the file_segment_mappings table to add a segment ID to an image's mapping.
 * If the image already has a mapping, adds the segmentId to the segment_ids array.
 * If not, creates a new mapping entry.
 */
export async function updateSegmentMapping(
  imageUrl: string,
  segmentId: number,
  bucketId: string = 'page-images'
): Promise<void> {
  console.log('[updateSegmentMapping] Called with:', { imageUrl, segmentId, bucketId });
  
  if (!imageUrl || !segmentId) {
    console.warn('[updateSegmentMapping] Missing imageUrl or segmentId');
    return;
  }
  
  const filePath = extractFilePathFromUrl(imageUrl);
  console.log('[updateSegmentMapping] Extracted file path:', filePath);
  
  if (!filePath) {
    console.warn('[updateSegmentMapping] Could not extract file path from URL:', imageUrl);
    return;
  }
  
  try {
    // Check if mapping exists
    console.log('[updateSegmentMapping] Checking for existing mapping...');
    const { data: existing, error: fetchError } = await supabase
      .from('file_segment_mappings')
      .select('segment_ids')
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId)
      .maybeSingle();
    
    console.log('[updateSegmentMapping] Existing mapping query result:', { existing, fetchError });
    
    if (fetchError) throw fetchError;
    
    const segmentIdStr = String(segmentId);
    
    if (existing) {
      // Mapping exists - add segmentId if not already present
      const currentIds = existing.segment_ids || [];
      console.log('[updateSegmentMapping] Current segment IDs:', currentIds);
      
      if (!currentIds.includes(segmentIdStr)) {
        const updatedIds = [...currentIds, segmentIdStr];
        console.log('[updateSegmentMapping] Updating to:', updatedIds);
        
        const { error: updateError } = await supabase
          .from('file_segment_mappings')
          .update({ segment_ids: updatedIds })
          .eq('file_path', filePath)
          .eq('bucket_id', bucketId);
        
        if (updateError) {
          console.error('[updateSegmentMapping] Update error:', updateError);
          throw updateError;
        }
        
        console.log('[updateSegmentMapping] ✅ Successfully added segment ID to existing mapping:', {
          filePath,
          segmentId: segmentIdStr,
          updatedIds
        });
      } else {
        console.log('[updateSegmentMapping] Segment ID already exists in mapping, skipping');
      }
    } else {
      // No mapping exists - create new one
      console.log('[updateSegmentMapping] Creating new mapping entry');
      
      const { error: insertError } = await supabase
        .from('file_segment_mappings')
        .insert({
          file_path: filePath,
          bucket_id: bucketId,
          segment_ids: [segmentIdStr]
        });
      
      if (insertError) {
        console.error('[updateSegmentMapping] Insert error:', insertError);
        throw insertError;
      }
      
      console.log('[updateSegmentMapping] ✅ Successfully created new mapping:', {
        filePath,
        segmentId: segmentIdStr
      });
    }
  } catch (error) {
    console.error('[updateSegmentMapping] ❌ Error updating segment mapping:', error);
    // Don't throw - this is not critical for the save operation
  }
}

/**
 * Updates segment mappings for multiple images (e.g., in a gallery).
 * Processes each image URL and adds the segmentId to its mapping.
 */
export async function updateMultipleSegmentMappings(
  imageUrls: string[],
  segmentId: number,
  bucketId: string = 'page-images'
): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) return;
  
  await Promise.all(
    imageUrls.map(url => updateSegmentMapping(url, segmentId, bucketId))
  );
}
