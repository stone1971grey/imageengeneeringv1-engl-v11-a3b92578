import { supabase } from "@/integrations/supabase/client";
import { extractFilePathFromUrl } from "./updateSegmentMapping";

/**
 * Loads the alt text for an image from the file_segment_mappings table.
 * Returns the alt text if found, or an empty string if not found or on error.
 */
export async function loadAltTextFromMapping(
  imageUrl: string,
  bucketId: string = 'page-images'
): Promise<string> {
  if (!imageUrl) return '';
  
  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) return '';
  
  try {
    const { data, error } = await supabase
      .from('file_segment_mappings')
      .select('alt_text')
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId)
      .maybeSingle();
    
    if (error) {
      console.error('Error loading alt text:', error);
      return '';
    }
    
    return data?.alt_text || '';
  } catch (error) {
    console.error('Error loading alt text:', error);
    return '';
  }
}
