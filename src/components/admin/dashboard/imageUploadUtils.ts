import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { extractImageMetadata, ImageMetadata } from '@/types/imageMetadata';
import { ensureMediaFolderHierarchy, createOrUpdateFileMapping } from '@/utils/ensureMediaFolder';

// Types for upload context
export interface UploadContext {
  resolvedPageSlug: string;
  selectedPage: string;
  editorLanguage: string;
  userId?: string;
}

// Common validation function
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  if (!file.type.startsWith('image/')) {
    toast.error("Please upload an image file");
    return false;
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    toast.error(`Image size must be less than ${maxSizeMB}MB`);
    return false;
  }

  return true;
}

/**
 * Generic image upload function with automatic folder hierarchy creation.
 * 
 * This function ensures:
 * 1. The folder hierarchy exists in media_folders table
 * 2. The file is uploaded to the correct storage path
 * 3. The file_segment_mapping is created for Media Management
 */
export async function uploadImageToStorage(
  file: File,
  fileNamePrefix: string,
  bucketId: string = 'page-images',
  folderPath?: string,
  segmentId?: string | number
): Promise<{ publicUrl: string; metadata: ImageMetadata; filePath: string } | null> {
  try {
    // STEP 1: Ensure folder hierarchy exists if folderPath is provided
    let storagePath = folderPath;
    if (folderPath) {
      const folderResult = await ensureMediaFolderHierarchy(folderPath);
      if (folderResult) {
        storagePath = folderResult.storagePath;
        console.log('[uploadImageToStorage] Folder hierarchy ensured:', storagePath);
      }
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${fileNamePrefix}-${Date.now()}.${fileExt}`;
    // Use folder path if provided, otherwise upload to root
    const filePath = storagePath ? `${storagePath}/${fileName}` : fileName;

    console.log('[uploadImageToStorage] Uploading to path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from(bucketId)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketId)
      .getPublicUrl(filePath);

    const metadata = await extractImageMetadata(file, publicUrl);

    // STEP 2: Create file_segment_mapping for Media Management
    if (segmentId) {
      await createOrUpdateFileMapping(filePath, String(segmentId), '');
      console.log('[uploadImageToStorage] Created file mapping for segment:', segmentId);
    }

    return { publicUrl, metadata: { ...metadata, altText: '' }, filePath };
  } catch (error: any) {
    toast.error("Error uploading image: " + error.message);
    return null;
  }
}

// Helper to create file_segment_mapping entry
export async function createFileSegmentMapping(
  filePath: string,
  segmentId: string | number,
  altText?: string
): Promise<void> {
  try {
    // Check if mapping already exists
    const { data: existing } = await supabase
      .from('file_segment_mappings')
      .select('id, segment_ids')
      .eq('file_path', filePath)
      .maybeSingle();

    if (existing) {
      // Add segment_id to existing mapping if not already present
      const segmentIds = existing.segment_ids || [];
      const segmentIdStr = String(segmentId);
      if (!segmentIds.includes(segmentIdStr)) {
        await supabase
          .from('file_segment_mappings')
          .update({ 
            segment_ids: [...segmentIds, segmentIdStr],
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      }
    } else {
      // Create new mapping
      await supabase
        .from('file_segment_mappings')
        .insert({
          file_path: filePath,
          segment_ids: [String(segmentId)],
          alt_text: altText || '',
          visibility: 'public'
        });
    }
  } catch (error) {
    console.error('Error creating file segment mapping:', error);
  }
}

// Hero image upload handler
export async function handleHeroImageUpload(
  file: File,
  context: UploadContext,
  setHeroImageUrl: (url: string) => void,
  setHeroImageMetadata: (metadata: ImageMetadata) => void,
  segmentId?: string | number
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  // Use page slug as folder path - folder hierarchy will be created automatically
  const folderPath = context.resolvedPageSlug || context.selectedPage;
  const result = await uploadImageToStorage(file, `hero`, 'page-images', folderPath, segmentId);
  if (!result) return false;

  const { publicUrl, metadata } = result;
  setHeroImageUrl(publicUrl);
  setHeroImageMetadata(metadata);

  // Auto-sync to all languages
  const allLanguages: Array<'en' | 'de' | 'ja' | 'ko' | 'zh'> = ['en', 'de', 'ja', 'ko', 'zh'];

  try {
    for (const lang of allLanguages) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: "hero_image_url",
          content_type: "image_url",
          content_value: publicUrl,
          language: lang,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: "hero_image_metadata",
          content_type: "json",
          content_value: JSON.stringify(metadata),
          language: lang,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, {
          onConflict: 'page_slug,section_key,language'
        });
    }

    toast.success("Image uploaded and synced to all languages!");
    return true;
  } catch (error: any) {
    toast.error("Error syncing image: " + error.message);
    return false;
  }
}

// Tile image upload handler
export async function handleTileImageUpload(
  file: File,
  tileIndex: number,
  applications: any[],
  setApplications: (apps: any[]) => void,
  pageSlug?: string,
  segmentId?: string | number
): Promise<any[] | null> {
  if (!validateImageFile(file)) return null;

  // Use page slug as folder path - folder hierarchy will be created automatically
  const folderPath = pageSlug || 'tiles';
  const result = await uploadImageToStorage(file, `tile-${segmentId || 'unknown'}-${tileIndex}`, 'page-images', folderPath, segmentId);
  if (!result) return null;

  const { publicUrl, metadata } = result;
  const newApps = [...applications];
  newApps[tileIndex].imageUrl = publicUrl;
  newApps[tileIndex].metadata = metadata;
  setApplications(newApps);

  return newApps;
}

// Solution image upload handler
export async function handleSolutionImageUploadUtil(
  file: File,
  index: number,
  solutionsItems: any[],
  setSolutionsItems: (items: any[]) => void,
  pageSlug?: string,
  segmentId?: string | number
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  const folderPath = pageSlug || '';
  const result = await uploadImageToStorage(file, `solution-${segmentId || 'unknown'}-${index}`, 'page-images', folderPath || undefined, segmentId);
  if (!result) return false;

  const { publicUrl, metadata } = result;
  const newItems = [...solutionsItems];
  newItems[index].imageUrl = publicUrl;
  newItems[index].metadata = metadata;
  setSolutionsItems(newItems);

  toast.success("Solution image uploaded successfully!");
  return true;
}

// Image-Text hero image upload handler
export async function handleImageTextHeroUpload(
  file: File,
  segmentIndex: number,
  pageSegments: any[],
  setPageSegments: (segments: any[]) => void,
  pageSlug?: string,
  segmentId?: string | number
): Promise<any[] | null> {
  if (!validateImageFile(file)) return null;

  const folderPath = pageSlug || '';
  const result = await uploadImageToStorage(file, `segment-${segmentId || segmentIndex}-hero`, 'page-images', folderPath || undefined, segmentId);
  if (!result) return null;

  const { publicUrl, metadata } = result;
  const newSegments = [...pageSegments];
  newSegments[segmentIndex].data.heroImageUrl = publicUrl;
  newSegments[segmentIndex].data.heroImageMetadata = metadata;
  setPageSegments(newSegments);

  return newSegments;
}

// Image-Text item image upload handler
export async function handleImageTextItemUpload(
  file: File,
  segmentIndex: number,
  itemIndex: number,
  pageSegments: any[],
  setPageSegments: (segments: any[]) => void,
  pageSlug?: string,
  segmentId?: string | number
): Promise<any[] | null> {
  if (!validateImageFile(file)) return null;

  const folderPath = pageSlug || '';
  const result = await uploadImageToStorage(file, `segment-${segmentId || segmentIndex}-item-${itemIndex}`, 'page-images', folderPath || undefined, segmentId);
  if (!result) return null;

  const { publicUrl, metadata } = result;
  const newSegments = [...pageSegments];
  newSegments[segmentIndex].data.items[itemIndex].imageUrl = publicUrl;
  newSegments[segmentIndex].data.items[itemIndex].metadata = metadata;
  setPageSegments(newSegments);

  return newSegments;
}

// Footer team image upload handler
export async function handleFooterTeamImageUploadUtil(
  file: File,
  context: UploadContext,
  setFooterTeamImageUrl: (url: string) => void,
  setFooterTeamImageMetadata: (metadata: ImageMetadata) => void,
  segmentId?: string | number
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  const folderPath = context.resolvedPageSlug || context.selectedPage;
  const segmentIdentifier = segmentId || `footer-${folderPath}`;
  const result = await uploadImageToStorage(file, `footer-team`, 'page-images', folderPath, segmentIdentifier);
  if (!result) return false;

  const { publicUrl, metadata } = result;
  setFooterTeamImageUrl(publicUrl);
  setFooterTeamImageMetadata(metadata);

  try {
    await supabase
      .from("page_content")
      .upsert({
        page_slug: context.resolvedPageSlug || context.selectedPage,
        section_key: "footer_team_image_url",
        content_type: "image_url",
        content_value: publicUrl,
        language: context.editorLanguage,
        updated_at: new Date().toISOString(),
        updated_by: context.userId
      }, {
        onConflict: 'page_slug,section_key,language'
      });

    toast.success("Team image uploaded successfully!");
    return true;
  } catch (error: any) {
    toast.error("Error saving team image: " + error.message);
    return false;
  }
}

// Banner image upload handler
export async function handleBannerImageUploadUtil(
  file: File,
  index: number,
  bannerImages: any[],
  setBannerImages: (images: any[]) => void,
  pageSlug?: string,
  segmentId?: string | number
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  const folderPath = pageSlug || '';
  const result = await uploadImageToStorage(file, `banner-${segmentId || 'unknown'}-${index}`, 'page-images', folderPath || undefined, segmentId);
  if (!result) return false;

  const { publicUrl, metadata } = result;
  const newImages = [...bannerImages];
  newImages[index].url = publicUrl;
  newImages[index].metadata = { ...metadata, altText: newImages[index].alt || '' };
  setBannerImages(newImages);

  toast.success("Banner image uploaded successfully!");
  return true;
}
