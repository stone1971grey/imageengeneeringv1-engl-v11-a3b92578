import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { clearAutosavedData } from '@/hooks/useAdminAutosave';

export interface SaveContext {
  userId: string;
  resolvedPageSlug: string;
  selectedPage: string;
  editorLanguage: string;
}

// Save hero section
export async function saveHeroSection(
  context: SaveContext,
  content: Record<string, string>,
  heroImagePosition: string,
  heroLayout: string,
  heroTopPadding: string,
  heroCtaLink: string,
  heroCtaStyle: string,
  heroImageUrl: string,
  heroImageMetadata: any
): Promise<boolean> {
  try {
    const heroFields = ['hero_title', 'hero_subtitle', 'hero_description', 'hero_cta_text'];

    for (const key of heroFields) {
      if (content[key] !== undefined) {
        await supabase
          .from("page_content")
          .upsert({
            page_slug: context.resolvedPageSlug || context.selectedPage,
            section_key: key,
            content_type: "text",
            content_value: content[key],
            language: context.editorLanguage,
            updated_at: new Date().toISOString(),
            updated_by: context.userId
          }, { onConflict: 'page_slug,section_key,language' });
      }
    }

    // Save hero settings
    const settings = [
      { key: "hero_image_position", value: heroImagePosition },
      { key: "hero_layout", value: heroLayout },
      { key: "hero_top_padding", value: heroTopPadding },
      { key: "hero_cta_link", value: heroCtaLink },
      { key: "hero_cta_style", value: heroCtaStyle }
    ];

    for (const { key, value } of settings) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: key,
          content_type: "text",
          content_value: value,
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    // Save hero image URL
    if (heroImageUrl) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: "hero_image_url",
          content_type: "image_url",
          content_value: heroImageUrl,
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    // Save hero image metadata
    if (heroImageMetadata) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: "hero_image_metadata",
          content_type: "json",
          content_value: JSON.stringify(heroImageMetadata),
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    toast.success("Hero section saved successfully!");
    clearAutosavedData(`${context.selectedPage}_hero`);
    return true;
  } catch (error: any) {
    toast.error("Error saving hero section: " + error.message);
    return false;
  }
}

// Save applications/tiles section
export async function saveApplicationsSection(
  context: SaveContext,
  content: Record<string, string>,
  applications: any[],
  tilesColumns: string
): Promise<boolean> {
  try {
    const appFields = ['applications_title', 'applications_description'];

    for (const key of appFields) {
      if (content[key] !== undefined) {
        await supabase
          .from("page_content")
          .upsert({
            page_slug: context.resolvedPageSlug || context.selectedPage,
            section_key: key,
            content_type: "text",
            content_value: content[key],
            language: context.editorLanguage,
            updated_at: new Date().toISOString(),
            updated_by: context.userId
          }, { onConflict: 'page_slug,section_key,language' });
      }
    }

    // Save applications items
    await supabase
      .from("page_content")
      .upsert({
        page_slug: context.resolvedPageSlug || context.selectedPage,
        section_key: "applications_items",
        content_type: "json",
        content_value: JSON.stringify(applications),
        language: context.editorLanguage,
        updated_at: new Date().toISOString(),
        updated_by: context.userId
      }, { onConflict: 'page_slug,section_key,language' });

    // Save tiles columns setting
    await supabase
      .from("page_content")
      .upsert({
        page_slug: context.resolvedPageSlug || context.selectedPage,
        section_key: "tiles_columns",
        content_type: "text",
        content_value: tilesColumns,
        language: context.editorLanguage,
        updated_at: new Date().toISOString(),
        updated_by: context.userId
      }, { onConflict: 'page_slug,section_key,language' });

    toast.success("Applications section saved successfully!");
    clearAutosavedData(`${context.selectedPage}_tiles`);
    return true;
  } catch (error: any) {
    toast.error("Error saving applications section: " + error.message);
    return false;
  }
}

// Save footer section
export async function saveFooterSection(
  context: SaveContext,
  footerData: {
    ctaTitle: string;
    ctaDescription: string;
    contactHeadline: string;
    contactSubline: string;
    contactDescription: string;
    teamQuote: string;
    teamName: string;
    teamTitle: string;
    buttonText: string;
  }
): Promise<boolean> {
  try {
    const footerFields: Record<string, string> = {
      'footer_cta_title': footerData.ctaTitle,
      'footer_cta_description': footerData.ctaDescription,
      'footer_contact_headline': footerData.contactHeadline,
      'footer_contact_subline': footerData.contactSubline,
      'footer_contact_description': footerData.contactDescription,
      'footer_team_quote': footerData.teamQuote,
      'footer_team_name': footerData.teamName,
      'footer_team_title': footerData.teamTitle,
      'footer_button_text': footerData.buttonText
    };

    for (const [key, value] of Object.entries(footerFields)) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: key,
          content_type: "text",
          content_value: value,
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    toast.success("Footer section saved successfully!");
    clearAutosavedData(`${context.selectedPage}_footer`);
    return true;
  } catch (error: any) {
    toast.error("Error saving footer section: " + error.message);
    return false;
  }
}

// Save SEO settings
/**
 * CRITICAL: SEO Settings Save Function with Data Protection
 * 
 * ⚠️ IMPORTANT FOR FUTURE DEVELOPERS:
 * This function protects against accidental data loss for SEO settings.
 * 
 * NEVER:
 * - Reset seoData to empty values before calling this function
 * - Pass seoData with empty focusKeyword/h1/introduction if DB has values
 * - Call this function without first loading existing DB values
 * 
 * The function includes validation to prevent saving empty values when
 * the database already contains non-empty values for critical fields.
 */
export async function saveSEOSettings(
  context: SaveContext,
  seoData: any
): Promise<boolean> {
  try {
    const pageSlug = context.resolvedPageSlug || context.selectedPage;
    
    // PROTECTION: Load existing SEO settings from DB first
    const { data: existingData } = await supabase
      .from("page_content")
      .select("content_value")
      .eq("page_slug", pageSlug)
      .eq("section_key", "seo_settings")
      .eq("language", "en")
      .maybeSingle();
    
    let existingSeoSettings: any = {};
    if (existingData?.content_value) {
      try {
        existingSeoSettings = JSON.parse(existingData.content_value);
      } catch (e) {
        console.error('[saveSEOSettings] Failed to parse existing SEO settings:', e);
      }
    }
    
    // CRITICAL PROTECTION: Merge to prevent data loss
    // If incoming data has empty critical fields but DB has values, preserve DB values
    const protectedFields = ['focusKeyword', 'h1', 'h1Locked', 'introduction', 'title', 'metaDescription'];
    const protectedSeoData = { ...seoData };
    
    for (const field of protectedFields) {
      const incomingValue = seoData[field];
      const existingValue = existingSeoSettings[field];
      
      // If incoming is empty/undefined but existing has value, preserve existing
      if ((!incomingValue && incomingValue !== false) && existingValue) {
        console.warn(`[saveSEOSettings] PROTECTION: Preserving existing ${field}:`, existingValue);
        protectedSeoData[field] = existingValue;
      }
    }
    
    console.log('[saveSEOSettings] Saving protected SEO data:', {
      pageSlug,
      focusKeyword: protectedSeoData.focusKeyword,
      h1: protectedSeoData.h1,
      hasIntroduction: !!protectedSeoData.introduction
    });
    
    // Always save to 'en' as the master SEO settings (language-independent)
    await supabase
      .from("page_content")
      .upsert({
        page_slug: pageSlug,
        section_key: "seo_settings",
        content_type: "json",
        content_value: JSON.stringify(protectedSeoData),
        language: 'en', // Always save as 'en' - SEO is language-independent
        updated_at: new Date().toISOString(),
        updated_by: context.userId
      }, { onConflict: 'page_slug,section_key,language' });

    toast.success("SEO Settings saved successfully!");
    clearAutosavedData(`${context.selectedPage}_seo`);
    return true;
  } catch (error: any) {
    toast.error("Error saving SEO settings: " + error.message);
    return false;
  }
}

// Save banner section
export async function saveBannerSection(
  context: SaveContext,
  bannerTitle: string,
  bannerSubtext: string,
  bannerImages: any[],
  bannerButtonText: string,
  bannerButtonLink: string,
  bannerButtonStyle: string
): Promise<boolean> {
  try {
    const updates = [
      { section_key: "banner_title", content_type: "heading", content_value: bannerTitle },
      { section_key: "banner_subtext", content_type: "text", content_value: bannerSubtext },
      { section_key: "banner_images", content_type: "json", content_value: JSON.stringify(bannerImages) },
      { section_key: "banner_button_text", content_type: "text", content_value: bannerButtonText },
      { section_key: "banner_button_link", content_type: "text", content_value: bannerButtonLink },
      { section_key: "banner_button_style", content_type: "text", content_value: bannerButtonStyle }
    ];

    for (const update of updates) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          ...update,
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    toast.success("Banner section saved successfully!");
    clearAutosavedData(`${context.selectedPage}_banner`);
    return true;
  } catch (error: any) {
    toast.error("Error saving banner section: " + error.message);
    return false;
  }
}

// Save solutions section
export async function saveSolutionsSection(
  context: SaveContext,
  solutionsTitle: string,
  solutionsSubtext: string,
  solutionsLayout: string,
  solutionsItems: any[]
): Promise<boolean> {
  try {
    const updates = [
      { section_key: "solutions_title", content_type: "heading", content_value: solutionsTitle },
      { section_key: "solutions_subtext", content_type: "text", content_value: solutionsSubtext },
      { section_key: "solutions_layout", content_type: "text", content_value: solutionsLayout },
      { section_key: "solutions_items", content_type: "json", content_value: JSON.stringify(solutionsItems) }
    ];

    for (const update of updates) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          ...update,
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    toast.success("Solutions section saved successfully!");
    clearAutosavedData(`${context.selectedPage}_solutions`);
    return true;
  } catch (error: any) {
    toast.error("Error saving solutions section: " + error.message);
    return false;
  }
}

// Auto-save tile image upload (used after image uploads)
export async function autoSaveTileImageUploadUtil(
  context: SaveContext,
  applications: any[],
  content: Record<string, string>,
  heroImagePosition: string,
  heroLayout: string,
  heroTopPadding: string,
  heroCtaLink: string,
  heroCtaStyle: string
): Promise<boolean> {
  try {
    const appFields = ['applications_title', 'applications_description'];

    for (const key of appFields) {
      if (content[key] !== undefined) {
        await supabase
          .from("page_content")
          .upsert({
            page_slug: context.resolvedPageSlug || context.selectedPage,
            section_key: key,
            content_type: "text",
            content_value: content[key],
            language: context.editorLanguage,
            updated_at: new Date().toISOString(),
            updated_by: context.userId
          }, { onConflict: 'page_slug,section_key,language' });
      }
    }

    await supabase
      .from("page_content")
      .upsert({
        page_slug: context.resolvedPageSlug || context.selectedPage,
        section_key: "applications_items",
        content_type: "json",
        content_value: JSON.stringify(applications),
        language: context.editorLanguage,
        updated_at: new Date().toISOString(),
        updated_by: context.userId
      }, { onConflict: 'page_slug,section_key,language' });

    const heroSettings = [
      { key: "hero_image_position", value: heroImagePosition },
      { key: "hero_layout", value: heroLayout },
      { key: "hero_top_padding", value: heroTopPadding },
      { key: "hero_cta_link", value: heroCtaLink },
      { key: "hero_cta_style", value: heroCtaStyle }
    ];

    for (const { key, value } of heroSettings) {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: key,
          content_type: "text",
          content_value: value,
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    return true;
  } catch (error: any) {
    console.error("Auto-save error:", error.message);
    return false;
  }
}
