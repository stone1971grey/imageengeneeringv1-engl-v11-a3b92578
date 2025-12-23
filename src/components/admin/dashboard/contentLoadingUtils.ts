// Content Loading Utilities for AdminDashboard
// Extracted to reduce AdminDashboard.tsx file size

import { supabase } from "@/integrations/supabase/client";

export interface ContentItem {
  section_key: string;
  content_value: string;
  content_type: string;
}

export interface ContentState {
  content: Record<string, string>;
  applications: any[];
  tilesColumns: string;
  heroImageUrl: string;
  heroImageMetadata: any | null;
  heroImagePosition: string;
  heroLayout: string;
  heroTopPadding: string;
  heroCtaLink: string;
  heroCtaStyle: string;
  bannerTitle: string;
  bannerSubtext: string;
  bannerImages: any[];
  bannerButtonText: string;
  bannerButtonLink: string;
  bannerButtonStyle: string;
  solutionsTitle: string;
  solutionsSubtext: string;
  solutionsLayout: string;
  solutionsItems: any[];
  pageSegments: any[];
  tabOrder: string[];
  footerCtaTitle: string;
  footerCtaDescription: string;
  footerContactHeadline: string;
  footerContactSubline: string;
  footerContactDescription: string;
  footerTeamImageUrl: string;
  footerTeamQuote: string;
  footerTeamName: string;
  footerTeamTitle: string;
  footerButtonText: string;
  seoData: any;
}

export interface ContentLoadResult {
  contentMap: Record<string, string>;
  applications: any[];
  tilesColumns: string;
  heroImageUrl: string;
  heroImageMetadata: any | null;
  heroImagePosition: string;
  heroLayout: string;
  heroTopPadding: string;
  heroCtaLink: string;
  heroCtaStyle: string;
  bannerTitle: string;
  bannerSubtext: string;
  bannerImages: any[];
  bannerButtonText: string;
  bannerButtonLink: string;
  bannerButtonStyle: string;
  solutionsTitle: string;
  solutionsSubtext: string;
  solutionsLayout: string;
  solutionsItems: any[];
  pageSegments: any[];
  tabOrder: string[];
  footerCtaTitle: string;
  footerCtaDescription: string;
  footerContactHeadline: string;
  footerContactSubline: string;
  footerContactDescription: string;
  footerTeamImageUrl: string;
  footerTeamQuote: string;
  footerTeamName: string;
  footerTeamTitle: string;
  footerButtonText: string;
  seoData: any;
  needsSegmentUpdate: boolean;
  segmentsWithIds: any[];
}

/**
 * Parse content items from database into structured content state
 */
export function parseContentItems(
  data: ContentItem[],
  selectedPage: string,
  segmentRegistry: Record<string, number>,
  existingSeoData: any
): ContentLoadResult {
  const contentMap: Record<string, string> = {};
  let applications: any[] = [];
  let tilesColumns = "3";
  let heroImageUrl = "";
  let heroImageMetadata: any | null = null;
  let heroImagePosition = "right";
  let heroLayout = "2-5";
  let heroTopPadding = "medium";
  let heroCtaLink = "#applications-start";
  let heroCtaStyle = "standard";
  let bannerTitle = "";
  let bannerSubtext = "";
  let bannerImages: any[] = [];
  let bannerButtonText = "";
  let bannerButtonLink = "";
  let bannerButtonStyle = "standard";
  let solutionsTitle = "";
  let solutionsSubtext = "";
  let solutionsLayout = "2-col";
  let solutionsItems: any[] = [];
  let pageSegments: any[] = [];
  let tabOrder: string[] = [];
  let footerCtaTitle = "";
  let footerCtaDescription = "";
  let footerContactHeadline = "";
  let footerContactSubline = "";
  let footerContactDescription = "";
  let footerTeamImageUrl = "";
  let footerTeamQuote = "";
  let footerTeamName = "";
  let footerTeamTitle = "";
  let footerButtonText = "";
  let seoData = { ...existingSeoData };
  let needsSegmentUpdate = false;
  let segmentsWithIds: any[] = [];

  data?.forEach((item: ContentItem) => {
    switch (item.section_key) {
      case "applications_items":
        applications = JSON.parse(item.content_value);
        break;
      case "tiles_columns":
        tilesColumns = item.content_value || "3";
        break;
      case "solutions_title":
        solutionsTitle = item.content_value;
        break;
      case "solutions_subtext":
        solutionsSubtext = item.content_value;
        break;
      case "solutions_layout":
        solutionsLayout = item.content_value || "2-col";
        break;
      case "solutions_items":
        solutionsItems = JSON.parse(item.content_value);
        break;
      case "banner_images":
        bannerImages = JSON.parse(item.content_value);
        break;
      case "banner_title":
        bannerTitle = item.content_value;
        break;
      case "banner_subtext":
        bannerSubtext = item.content_value;
        break;
      case "banner_button_text":
        bannerButtonText = item.content_value;
        break;
      case "banner_button_link":
        bannerButtonLink = item.content_value;
        break;
      case "banner_button_style":
        bannerButtonStyle = item.content_value || "standard";
        break;
      case "hero_image_url":
        heroImageUrl = item.content_value;
        break;
      case "hero_image_metadata":
        try {
          heroImageMetadata = JSON.parse(item.content_value);
        } catch (e) {
          console.error("Error parsing hero image metadata:", e);
        }
        break;
      case "hero_image_position":
        heroImagePosition = item.content_value || "right";
        break;
      case "hero_layout":
        heroLayout = item.content_value || "2-5";
        break;
      case "hero_top_padding":
        heroTopPadding = item.content_value || "medium";
        break;
      case "hero_cta_link":
        heroCtaLink = item.content_value || "#applications-start";
        break;
      case "hero_cta_style":
        heroCtaStyle = item.content_value || "standard";
        break;
      case "page_segments":
        try {
          const segments = JSON.parse(item.content_value);
          
          if (segments && Array.isArray(segments) && segments.length > 0) {
            // Sort by position
            const sortedSegments = [...segments].sort((a, b) => {
              const posA = typeof a?.position === 'number' ? a.position : 999;
              const posB = typeof b?.position === 'number' ? b.position : 999;
              if (posA === posB) {
                return segments.indexOf(a) - segments.indexOf(b);
              }
              return posA - posB;
            });
            
            // Ensure all segments have numeric IDs
            segmentsWithIds = sortedSegments.map((seg: any, idx: number) => {
              if (!seg) return null;
              
              const segId = seg.id;
              const isNumericId = segId && (typeof segId === 'number' || (typeof segId === 'string' && /^\d+$/.test(segId)));
              
              if (!isNumericId) {
                needsSegmentUpdate = true;
                const registryId = segmentRegistry[seg.type];
                return { ...seg, id: registryId ? String(registryId) : String(10 + idx), position: idx };
              }
              return { ...seg, position: seg.position ?? idx };
            }).filter(Boolean); // Remove any null entries
            
            pageSegments = segmentsWithIds;
          }
        } catch (e) {
          console.error('[parseContentItems] Error parsing page_segments:', e);
          pageSegments = [];
        }
        break;
      case "tab_order":
        try {
          tabOrder = JSON.parse(item.content_value) || [];
        } catch {
          tabOrder = [];
        }
        break;
      case "footer_cta_title":
        footerCtaTitle = item.content_value;
        break;
      case "footer_cta_description":
        footerCtaDescription = item.content_value;
        break;
      case "footer_contact_headline":
        footerContactHeadline = item.content_value;
        break;
      case "footer_contact_subline":
        footerContactSubline = item.content_value;
        break;
      case "footer_contact_description":
        footerContactDescription = item.content_value;
        break;
      case "footer_team_image_url":
        footerTeamImageUrl = item.content_value;
        break;
      case "footer_team_quote":
        footerTeamQuote = item.content_value;
        break;
      case "footer_team_name":
        footerTeamName = item.content_value;
        break;
      case "footer_team_title":
        footerTeamTitle = item.content_value;
        break;
      case "footer_button_text":
        footerButtonText = item.content_value;
        break;
      case "seo_settings":
        try {
          const seoSettings = JSON.parse(item.content_value);
          seoData = {
            ...seoData,
            ...seoSettings,
            slug: seoSettings.slug || selectedPage
          };
        } catch {
          // Keep default SEO data
        }
        break;
      default:
        contentMap[item.section_key] = item.content_value;
    }
  });

  return {
    contentMap,
    applications,
    tilesColumns,
    heroImageUrl,
    heroImageMetadata,
    heroImagePosition,
    heroLayout,
    heroTopPadding,
    heroCtaLink,
    heroCtaStyle,
    bannerTitle,
    bannerSubtext,
    bannerImages,
    bannerButtonText,
    bannerButtonLink,
    bannerButtonStyle,
    solutionsTitle,
    solutionsSubtext,
    solutionsLayout,
    solutionsItems,
    pageSegments,
    tabOrder,
    footerCtaTitle,
    footerCtaDescription,
    footerContactHeadline,
    footerContactSubline,
    footerContactDescription,
    footerTeamImageUrl,
    footerTeamQuote,
    footerTeamName,
    footerTeamTitle,
    footerButtonText,
    seoData,
    needsSegmentUpdate,
    segmentsWithIds
  };
}

/**
 * Filter tab order to remove deleted segments
 * IMPORTANT: This should only filter based on EXISTING pageSegments, not segment_registry
 * The reverseRegistry is optional validation - if empty, trust pageSegments as source of truth
 */
export function filterTabOrder(
  tabOrder: string[] | undefined | null,
  reverseRegistry: Record<string, string>,
  pageSegments?: any[]
): { validOrder: string[]; wasFiltered: boolean } {
  // Guard against undefined/null tabOrder
  const safeTabOrder = Array.isArray(tabOrder) ? tabOrder : [];
  
  if (safeTabOrder.length === 0) {
    return { validOrder: [], wasFiltered: false };
  }
  
  // If pageSegments is provided, use those IDs as the source of truth
  if (pageSegments && Array.isArray(pageSegments) && pageSegments.length > 0) {
    const pageSegmentIds = pageSegments.map(seg => String(seg.id));
    const validOrder = safeTabOrder.filter((tabId: string) => pageSegmentIds.includes(String(tabId)));
    const wasFiltered = validOrder.length !== safeTabOrder.length;
    
    if (wasFiltered) {
      console.log('[filterTabOrder] Filtered tab order based on pageSegments:', {
        original: safeTabOrder,
        filtered: validOrder,
        removed: safeTabOrder.filter(id => !pageSegmentIds.includes(String(id)))
      });
    }
    
    return { validOrder, wasFiltered };
  }
  
  // Fallback to reverseRegistry if no pageSegments
  const validSegmentIds = Object.keys(reverseRegistry || {});
  
  // If reverseRegistry is empty, return original tab order unchanged
  // This prevents accidentally filtering out all tabs when registry isn't loaded yet
  if (validSegmentIds.length === 0) {
    console.log('[filterTabOrder] No reverseRegistry available, returning original tabOrder');
    return { validOrder: safeTabOrder, wasFiltered: false };
  }
  
  const validOrder = safeTabOrder.filter((tabId: string) => validSegmentIds.includes(tabId));
  const wasFiltered = validOrder.length !== safeTabOrder.length;
  
  if (wasFiltered) {
    console.log('[filterTabOrder] Filtered tab order based on reverseRegistry:', {
      original: safeTabOrder,
      filtered: validOrder,
      removed: safeTabOrder.filter(id => !validSegmentIds.includes(id))
    });
  }
  
  return { validOrder, wasFiltered };
}

/**
 * Rebuild tab order from segments if empty
 */
export function rebuildTabOrderFromSegments(pageSegments: any[] | undefined | null): string[] {
  // Guard against undefined/null pageSegments
  if (!pageSegments || !Array.isArray(pageSegments)) {
    return [];
  }
  
  return pageSegments
    .filter(seg => seg && seg.type !== 'meta-navigation' && seg.type !== 'full-hero')
    .map(seg => String(seg.id));
}

/**
 * Save updated segments with IDs to database
 */
export async function saveUpdatedSegments(
  pageSlug: string,
  segments: any[],
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("page_content")
    .upsert({
      page_slug: pageSlug,
      section_key: "page_segments",
      content_type: "json",
      content_value: JSON.stringify(segments),
      updated_at: new Date().toISOString(),
      updated_by: userId
    }, {
      onConflict: 'page_slug,section_key,language'
    });

  if (error) {
    console.error("Error updating segment IDs:", error);
  } else {
    console.log("Segment IDs updated successfully");
  }
}

/**
 * Save cleaned tab order to database
 */
export async function saveCleanedTabOrder(
  pageSlug: string,
  tabOrder: string[],
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("page_content")
    .upsert({
      page_slug: pageSlug,
      section_key: "tab_order",
      content_type: "json",
      content_value: JSON.stringify(tabOrder),
      updated_at: new Date().toISOString(),
      updated_by: userId
    }, {
      onConflict: 'page_slug,section_key,language'
    });

  if (error) {
    console.error("Error saving tab order:", error);
  }
}
