import { supabase } from "@/integrations/supabase/client";
import { extractFilePathFromUrl } from "./updateSegmentMapping";
import { toast } from "sonner";

/**
 * Check how many segments reference a specific image.
 * Returns the segment_ids array length and the IDs themselves.
 */
export async function getSegmentCountForImage(
  imageUrl: string,
  bucketId: string = 'page-images'
): Promise<{ count: number; segmentIds: string[] }> {
  if (!imageUrl) return { count: 0, segmentIds: [] };
  
  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) return { count: 0, segmentIds: [] };
  
  try {
    const { data, error } = await supabase
      .from('file_segment_mappings')
      .select('segment_ids')
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking segment count:', error);
      return { count: 0, segmentIds: [] };
    }
    
    if (!data || !data.segment_ids) return { count: 0, segmentIds: [] };
    
    return { 
      count: data.segment_ids.length, 
      segmentIds: data.segment_ids 
    };
  } catch (error) {
    console.error('Error checking segment count:', error);
    return { count: 0, segmentIds: [] };
  }
}

/**
 * Syncs alt text from a segment back to the Media Management (file_segment_mappings).
 * Updates the alt_text_translations field for the specified language.
 * 
 * @param imageUrl - The image URL to update
 * @param altText - The new alt text value
 * @param language - The language code (e.g., 'en', 'de')
 * @param bucketId - The storage bucket ID
 * @param showToast - Whether to show success/error toasts
 * @returns boolean indicating success
 */
export async function syncAltTextToMediaManagement(
  imageUrl: string,
  altText: string,
  language: string = 'en',
  bucketId: string = 'page-images',
  showToast: boolean = true
): Promise<boolean> {
  if (!imageUrl) return false;
  
  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) {
    if (showToast) {
      toast.error('Could not extract file path from image URL');
    }
    return false;
  }
  
  // Normalize language code
  const normalizedLang = language.split('-')[0];
  
  try {
    // First, get existing translations
    const { data: existing, error: fetchError } = await supabase
      .from('file_segment_mappings')
      .select('alt_text, alt_text_translations')
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching existing alt text:', fetchError);
      if (showToast) {
        toast.error('Failed to sync alt text: ' + fetchError.message);
      }
      return false;
    }
    
    if (!existing) {
      // No mapping exists yet - create one
      const { error: insertError } = await supabase
        .from('file_segment_mappings')
        .insert({
          file_path: filePath,
          bucket_id: bucketId,
          segment_ids: [],
          alt_text: normalizedLang === 'en' ? altText : null,
          alt_text_translations: { [normalizedLang]: altText },
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating alt text mapping:', insertError);
        if (showToast) {
          toast.error('Failed to sync alt text: ' + insertError.message);
        }
        return false;
      }
      
      if (showToast) {
        toast.success('Alt text synced to Media Management');
      }
      return true;
    }
    
    // Merge with existing translations
    const existingTranslations = (existing.alt_text_translations as Record<string, string>) || {};
    const updatedTranslations = {
      ...existingTranslations,
      [normalizedLang]: altText
    };
    
    // Update the record
    const updateData: any = {
      alt_text_translations: updatedTranslations,
      updated_at: new Date().toISOString()
    };
    
    // Also update legacy alt_text field if language is English
    if (normalizedLang === 'en') {
      updateData.alt_text = altText;
    }
    
    const { error: updateError } = await supabase
      .from('file_segment_mappings')
      .update(updateData)
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId);
    
    if (updateError) {
      console.error('Error updating alt text:', updateError);
      if (showToast) {
        toast.error('Failed to sync alt text: ' + updateError.message);
      }
      return false;
    }
    
    if (showToast) {
      toast.success('Alt text synced to Media Management');
    }
    return true;
  } catch (error: any) {
    console.error('Error syncing alt text:', error);
    if (showToast) {
      toast.error('Failed to sync alt text: ' + error.message);
    }
    return false;
  }
}

/**
 * Shows a confirmation dialog if the image is used in multiple segments.
 * Returns true if user confirms or if the image is only used in one segment.
 * Returns false if user cancels.
 */
export async function confirmAltTextChangeForMultipleSegments(
  imageUrl: string,
  currentSegmentId: string | number,
  bucketId: string = 'page-images'
): Promise<{ proceed: boolean; segmentCount: number }> {
  const { count, segmentIds } = await getSegmentCountForImage(imageUrl, bucketId);
  
  // If image is used in 0 or 1 segment, no warning needed
  if (count <= 1) {
    return { proceed: true, segmentCount: count };
  }
  
  // Show warning for multiple segments
  const otherSegments = segmentIds
    .filter(id => String(id) !== String(currentSegmentId))
    .map(id => `#${id}`)
    .join(', ');
  
  const confirmed = window.confirm(
    `⚠️ Dieses Bild wird in ${count} Segmenten verwendet!\n\n` +
    `Andere Segmente: ${otherSegments}\n\n` +
    `Wenn Sie den Alt-Text hier ändern, wird er auch in allen anderen Segmenten aktualisiert.\n\n` +
    `Möchten Sie fortfahren?`
  );
  
  return { proceed: confirmed, segmentCount: count };
}
