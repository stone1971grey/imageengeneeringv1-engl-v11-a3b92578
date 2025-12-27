// Page Registry Database Operations
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadAltTextFromMapping } from '@/utils/loadAltTextFromMapping';

// Constants for page level validation
export const SECOND_LEVEL_PARENTS = [
  'your-solution', 'products', 'downloads', 'events', 'news', 
  'inside-lab', 'contact', 'test-lab', 'training-events', 'info-hub', 'company'
];

// Check if a page is second or third level (allowed for flyout/design elements)
export function isAllowedPageLevel(parentSlug: string | null | undefined): boolean {
  if (!parentSlug) return false;
  
  const isSecondLevel = SECOND_LEVEL_PARENTS.includes(parentSlug);
  const isThirdLevelUnderTestLab = parentSlug.startsWith('test-lab') && parentSlug !== 'test-lab';
  const isThirdLevelUnderTrainingEvents = parentSlug.startsWith('training-events') && parentSlug !== 'training-events';
  const isThirdLevelUnderInfoHub = parentSlug.startsWith('info-hub') && parentSlug !== 'info-hub';
  const isThirdLevelUnderCompany = parentSlug.startsWith('company') && parentSlug !== 'company';
  
  return isSecondLevel || isThirdLevelUnderTestLab || isThirdLevelUnderTrainingEvents || 
         isThirdLevelUnderInfoHub || isThirdLevelUnderCompany;
}

// Resolve a simple slug to its full hierarchical slug
export async function resolvePageSlug(
  slug: string, 
  setResolvedPageSlug: (slug: string) => void
): Promise<string> {
  if (!slug) return slug;
  
  // First try exact match
  const { data: exactMatch } = await supabase
    .from('page_registry')
    .select('page_slug')
    .eq('page_slug', slug)
    .maybeSingle();
  
  if (exactMatch) {
    console.log(`🔍 Exact match for slug "${slug}"`);
    setResolvedPageSlug(exactMatch.page_slug);
    return exactMatch.page_slug;
  }
  
  // If no exact match, try to find hierarchical slug ending with this slug
  const { data: hierarchicalMatches } = await supabase
    .from('page_registry')
    .select('page_slug')
    .ilike('page_slug', `%/${slug}`)
    .limit(1);
  
  const hierarchicalMatch = hierarchicalMatches?.[0] || null;
  
  if (hierarchicalMatch) {
    console.log(`🔍 Resolved slug "${slug}" to "${hierarchicalMatch.page_slug}"`);
    setResolvedPageSlug(hierarchicalMatch.page_slug);
    return hierarchicalMatch.page_slug;
  }
  
  console.log(`⚠️ No match found for slug "${slug}"`);
  setResolvedPageSlug(slug);
  return slug;
}

// Load page info from page_registry
export interface PageInfo {
  pageId: number;
  pageTitle: string;
  pageSlug: string;
  parentSlug?: string | null;
  designIcon?: string | null;
  flyoutImageUrl?: string | null;
  flyoutDescription?: string | null;
  ctaGroup?: string | null;
  ctaLabel?: string | null;
  ctaIcon?: string | null;
  targetPageSlug?: string | null;
  status?: 'draft' | 'published';
}

export async function loadPageInfo(
  selectedPage: string,
  resolveSlug: (slug: string) => Promise<string>,
  setResolvedPageSlug: (slug: string) => void
): Promise<PageInfo | null> {
  try {
    let querySlug = await resolveSlug(selectedPage);
    console.log('[loadPageInfo] Querying for slug:', querySlug, 'original:', selectedPage);
    
    // First try exact match
    let { data, error } = await supabase
      .from("page_registry")
      .select("page_id, page_title, page_slug, parent_slug, design_icon, flyout_image_url, flyout_description, cta_group, cta_label, cta_icon, target_page_slug, status")
      .eq("page_slug", querySlug)
      .maybeSingle();
    
    // If no results and querySlug doesn't contain '/', try hierarchical search
    if (!data && !querySlug.includes('/')) {
      console.log('[loadPageInfo] No exact match, trying hierarchical search for:', querySlug);
      const { data: hierarchicalData, error: hierarchicalError } = await supabase
        .from("page_registry")
        .select("page_id, page_title, page_slug, parent_slug, design_icon, flyout_image_url, flyout_description, cta_group, cta_label, cta_icon, target_page_slug, status")
        .ilike("page_slug", `%/${querySlug}`)
        .limit(1);
      
      if (!hierarchicalError && hierarchicalData && hierarchicalData.length > 0) {
        data = hierarchicalData[0];
        console.log('[loadPageInfo] Found hierarchical match:', hierarchicalData[0].page_slug);
        setResolvedPageSlug(hierarchicalData[0].page_slug);
      }
    }
    
    if (error) {
      console.error('[loadPageInfo] Error loading page info:', error);
      return null;
    }
    
    if (data) {
      return {
        pageId: data.page_id,
        pageTitle: data.page_title,
        pageSlug: data.page_slug,
        parentSlug: (data as any).parent_slug ?? null,
        designIcon: (data as any).design_icon ?? null,
        flyoutImageUrl: (data as any).flyout_image_url ?? null,
        flyoutDescription: (data as any).flyout_description ?? null,
        ctaGroup: (data as any).cta_group ?? null,
        ctaLabel: (data as any).cta_label ?? null,
        ctaIcon: (data as any).cta_icon ?? null,
        targetPageSlug: (data as any).target_page_slug ?? null,
        status: ((data as any).status as 'draft' | 'published') ?? 'published',
      };
    }
    
    return null;
  } catch (error) {
    console.error('[loadPageInfo] Unexpected error:', error);
    return null;
  }
}

// Save flyout information
export async function saveFlyoutInfo(
  pageId: number,
  flyoutImageUrl: string | null,
  flyoutDescriptionTranslations: Record<string, string>
): Promise<boolean> {
  try {
    const englishDesc = flyoutDescriptionTranslations['en'] || '';
    const { error } = await supabase
      .from('page_registry')
      .update({
        flyout_image_url: flyoutImageUrl,
        flyout_description: englishDesc || null,
        flyout_description_translations: flyoutDescriptionTranslations,
      })
      .eq('page_id', pageId);

    if (error) {
      console.error('[saveFlyoutInfo] Error updating flyout content:', error);
      toast.error('Failed to save flyout content');
      return false;
    }

    toast.success('Flyout content saved');
    return true;
  } catch (error) {
    console.error('[saveFlyoutInfo] Unexpected error:', error);
    toast.error('Failed to save flyout content');
    return false;
  }
}

// Clear flyout information
export async function clearFlyoutInfo(pageId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('page_registry')
      .update({
        flyout_image_url: null,
        flyout_description: null,
        flyout_description_translations: {},
      })
      .eq('page_id', pageId);

    if (error) {
      console.error('[clearFlyoutInfo] Error clearing flyout content:', error);
      toast.error('Failed to clear flyout content');
      return false;
    }

    toast.success('Flyout content removed');
    return true;
  } catch (error) {
    console.error('[clearFlyoutInfo] Unexpected error:', error);
    toast.error('Failed to clear flyout content');
    return false;
  }
}

// Save design element
export async function saveDesignElement(pageId: number, designIcon: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("page_registry")
      .update({ design_icon: designIcon })
      .eq("page_id", pageId);

    if (error) {
      console.error("[saveDesignElement] Error updating design_icon:", error);
      toast.error("Failed to save design element");
      return false;
    }

    toast.success("Design element saved");
    return true;
  } catch (error) {
    console.error("[saveDesignElement] Unexpected error:", error);
    toast.error("Failed to save design element");
    return false;
  }
}

// Remove design element
export async function removeDesignElement(pageId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("page_registry")
      .update({ design_icon: null })
      .eq("page_id", pageId);

    if (error) {
      console.error("[removeDesignElement] Error clearing design_icon:", error);
      toast.error("Failed to remove design element");
      return false;
    }

    toast.success("Design element removed");
    return true;
  } catch (error) {
    console.error("[removeDesignElement] Unexpected error:", error);
    toast.error("Failed to remove design element");
    return false;
  }
}

// Save CTA configuration
export async function saveCtaConfig(
  pageId: number,
  pageTitle: string,
  ctaGroup: string,
  ctaLabel: string,
  ctaIcon: string
): Promise<{ success: boolean; updates: any }> {
  try {
    // If a group is selected, first clear that group from other pages
    if (ctaGroup !== 'none') {
      const { error: clearError } = await supabase
        .from('page_registry')
        .update({ cta_group: null, cta_label: null, cta_icon: null })
        .eq('cta_group', ctaGroup)
        .neq('page_id', pageId);

      if (clearError) {
        console.warn('[saveCtaConfig] Warning clearing existing CTA group:', clearError);
      }
    }

    let updates: any = {};

    if (ctaGroup === 'none') {
      updates = { cta_group: null, cta_label: null, cta_icon: null };
    } else {
      // Determine icon based on explicit selection or automatic default by group
      let iconKey: string | null;
      if (ctaIcon === 'auto') {
        iconKey = ctaGroup === 'your-solution'
          ? 'search'
          : ctaGroup === 'products'
            ? 'microscope'
            : null;
      } else if (ctaIcon === 'none') {
        iconKey = null;
      } else {
        iconKey = ctaIcon;
      }

      const finalLabel = ctaLabel && ctaLabel.trim().length > 0 ? ctaLabel.trim() : pageTitle;

      updates = {
        cta_group: ctaGroup,
        cta_label: finalLabel,
        cta_icon: iconKey,
      };
    }

    const { error } = await supabase
      .from('page_registry')
      .update(updates)
      .eq('page_id', pageId);

    if (error) {
      console.error('[saveCtaConfig] Error updating CTA config:', error);
      toast.error('Failed to save navigation CTA');
      return { success: false, updates: {} };
    }

    toast.success('Navigation CTA saved');
    return { success: true, updates };
  } catch (error) {
    console.error('[saveCtaConfig] Unexpected error:', error);
    toast.error('Failed to save navigation CTA');
    return { success: false, updates: {} };
  }
}

// Load flyout description translations
export async function loadFlyoutTranslations(pageSlug: string): Promise<Record<string, string>> {
  try {
    const { data } = await supabase
      .from('page_registry')
      .select('flyout_description_translations')
      .eq('page_slug', pageSlug)
      .maybeSingle();
    
    if (data?.flyout_description_translations && typeof data.flyout_description_translations === 'object') {
      return data.flyout_description_translations as Record<string, string>;
    }
    
    return {};
  } catch (error) {
    console.error('[loadFlyoutTranslations] Error:', error);
    return {};
  }
}

// Handle flyout image selection with alt text loading
export async function handleFlyoutImageSelection(
  url: string,
  currentTranslations: Record<string, string>
): Promise<Record<string, string>> {
  if (!url) return currentTranslations;
  
  const currentEnglishDesc = currentTranslations['en'] || '';
  if (!currentEnglishDesc) {
    try {
      const altText = await loadAltTextFromMapping(url, 'page-images', 'en');
      if (altText) {
        return { ...currentTranslations, en: altText };
      }
    } catch (error) {
      console.error('[handleFlyoutImageSelection] Failed to load alt text:', error);
    }
  }
  
  return currentTranslations;
}
