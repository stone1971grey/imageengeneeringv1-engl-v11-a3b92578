import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { extractImageMetadata, ImageMetadata } from '@/types/imageMetadata';

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

// Generic image upload function
export async function uploadImageToStorage(
  file: File,
  fileNamePrefix: string,
  bucketId: string = 'page-images'
): Promise<{ publicUrl: string; metadata: ImageMetadata } | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${fileNamePrefix}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

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

    return { publicUrl, metadata: { ...metadata, altText: '' } };
  } catch (error: any) {
    toast.error("Error uploading image: " + error.message);
    return null;
  }
}

// Hero image upload handler
export async function handleHeroImageUpload(
  file: File,
  context: UploadContext,
  setHeroImageUrl: (url: string) => void,
  setHeroImageMetadata: (metadata: ImageMetadata) => void
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  const result = await uploadImageToStorage(file, `${context.selectedPage}-hero`);
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
  setApplications: (apps: any[]) => void
): Promise<any[] | null> {
  if (!validateImageFile(file)) return null;

  const result = await uploadImageToStorage(file, `tile-${tileIndex}`);
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
  setSolutionsItems: (items: any[]) => void
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  const result = await uploadImageToStorage(file, `solution-${index}`);
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
  setPageSegments: (segments: any[]) => void
): Promise<any[] | null> {
  if (!validateImageFile(file)) return null;

  const result = await uploadImageToStorage(file, `image-text-hero-${segmentIndex}`);
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
  setPageSegments: (segments: any[]) => void
): Promise<any[] | null> {
  if (!validateImageFile(file)) return null;

  const result = await uploadImageToStorage(file, `image-text-item-${segmentIndex}-${itemIndex}`);
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
  setFooterTeamImageMetadata: (metadata: ImageMetadata) => void
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  const result = await uploadImageToStorage(file, `footer-team`);
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
  setBannerImages: (images: any[]) => void
): Promise<boolean> {
  if (!validateImageFile(file)) return false;

  const result = await uploadImageToStorage(file, `banner-image-${index}`);
  if (!result) return false;

  const { publicUrl, metadata } = result;
  const newImages = [...bannerImages];
  newImages[index].url = publicUrl;
  newImages[index].metadata = { ...metadata, altText: newImages[index].alt || '' };
  setBannerImages(newImages);

  toast.success("Banner image uploaded successfully!");
  return true;
}
