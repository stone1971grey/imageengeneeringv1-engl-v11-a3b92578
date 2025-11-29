import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Extracts the file path from a Supabase Storage public URL
 * Example: https://xyz.supabase.co/storage/v1/object/public/page-images/Product Page/image.jpg
 * Returns: Product Page/image.jpg
 */
export function extractFilePathFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // Handle both full URLs and relative paths
    if (!url.startsWith('http')) {
      // If it's already a path, clean it up
      return url.replace(/^\/+/, '');
    }
    
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
  bucketId: string = 'page-images',
  showToast: boolean = true
): Promise<boolean> {
  if (!imageUrl || !segmentId) {
    return false;
  }
  
  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) {
    if (showToast) {
      toast.error(`Could not extract file path from URL for segment ${segmentId}`);
    }
    return false;
  }
  
  try {
    // Check if mapping exists
    const { data: existing, error: fetchError } = await supabase
      .from('file_segment_mappings')
      .select('segment_ids')
      .eq('file_path', filePath)
      .eq('bucket_id', bucketId)
      .maybeSingle();
    
    if (fetchError) {
      if (showToast) {
        toast.error(`Database error while checking segment mapping: ${fetchError.message}`);
      }
      return false;
    }
    
    const segmentIdStr = String(segmentId);
    
    if (existing) {
      // Mapping exists - add segmentId if not already present
      const currentIds = existing.segment_ids || [];
      
      if (!currentIds.includes(segmentIdStr)) {
        const updatedIds = [...currentIds, segmentIdStr];
        
        const { error: updateError } = await supabase
          .from('file_segment_mappings')
          .update({ 
            segment_ids: updatedIds,
            updated_at: new Date().toISOString()
          })
          .eq('file_path', filePath)
          .eq('bucket_id', bucketId);
        
        if (updateError) {
          if (showToast) {
            toast.error(`Failed to update segment mapping: ${updateError.message}`);
          }
          return false;
        }
        
        if (showToast) {
          toast.success(`✅ Image linked to segment #${segmentId}`);
        }
        return true;
      } else {
        // Already mapped
        return true;
      }
    } else {
      // No mapping exists - create new one
      const { error: insertError } = await supabase
        .from('file_segment_mappings')
        .insert({
          file_path: filePath,
          bucket_id: bucketId,
          segment_ids: [segmentIdStr]
        });
      
      if (insertError) {
        if (showToast) {
          toast.error(`Failed to create segment mapping: ${insertError.message}`);
        }
        return false;
      }
      
      if (showToast) {
        toast.success(`✅ Image linked to segment #${segmentId}`);
      }
      return true;
    }
  } catch (error: any) {
    if (showToast) {
      toast.error(`Segment mapping error: ${error.message || 'Unknown error'}`);
    }
    return false;
  }
}

/**
 * Updates segment mappings for multiple images (e.g., in a gallery).
 * Processes each image URL and adds the segmentId to its mapping.
 * Shows a single summary toast instead of individual toasts.
 */
export async function updateMultipleSegmentMappings(
  imageUrls: string[],
  segmentId: number,
  bucketId: string = 'page-images',
  showToast: boolean = true
): Promise<number> {
  if (!imageUrls || imageUrls.length === 0) return 0;
  
  const results = await Promise.all(
    imageUrls.map(url => updateSegmentMapping(url, segmentId, bucketId, false))
  );
  
  const successCount = results.filter(Boolean).length;
  
  if (showToast && successCount > 0) {
    toast.success(`✅ ${successCount} image(s) linked to segment #${segmentId}`);
  }
  
  return successCount;
}
