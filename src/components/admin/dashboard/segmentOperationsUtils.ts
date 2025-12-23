// Segment Operations Utilities for AdminDashboard
// Handles add, delete, and save operations for segments

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDefaultSegmentData, getLanguageIndependentFields } from './segmentUtils';
import { createMultipleBackups } from '@/utils/createContentBackup';

export interface SegmentOperationContext {
  resolvedPageSlug: string;
  selectedPage: string;
  editorLanguage: string;
  userId: string;
  pageSegments: any[];
  tabOrder: string[];
}

/**
 * Add a new segment to the page
 */
export async function addNewSegment(
  templateType: string,
  ctx: SegmentOperationContext,
  setPageSegments: (segments: any[]) => void,
  setTabOrder: (order: string[]) => void,
  setNextSegmentId: (id: number) => void,
  setActiveTab: (tab: string) => void
): Promise<boolean> {
  const { resolvedPageSlug, selectedPage, editorLanguage, userId, pageSegments, tabOrder } = ctx;

  // Check mutual exclusivity
  const hasFullHero = pageSegments.some(seg => seg.type === 'full-hero');
  const hasMetaNav = pageSegments.some(seg => seg.type === 'meta-navigation');
  const hasActionHero = pageSegments.some(seg => seg.type === 'action-hero');
  const hasProductHeroGallery = pageSegments.some(seg => seg.type === 'product-hero-gallery');

  // Full Hero exclusions
  if (templateType === 'full-hero' && hasMetaNav) {
    toast.error("Full Hero cannot be added when Meta Navigation is present. Please remove Meta Navigation first.");
    return false;
  }
  if (templateType === 'full-hero' && hasActionHero) {
    toast.error("Full Hero cannot be added when Action Hero is present. Please remove Action Hero first.");
    return false;
  }

  // Meta Navigation exclusions
  if (templateType === 'meta-navigation' && hasFullHero) {
    toast.error("Meta Navigation cannot be added when Full Hero is present. Please remove Full Hero first.");
    return false;
  }
  if (templateType === 'meta-navigation' && hasActionHero) {
    toast.error("Meta Navigation cannot be added when Action Hero is present. Please remove Action Hero first.");
    return false;
  }

  // Action Hero exclusions
  if (templateType === 'action-hero' && hasFullHero) {
    toast.error("Action Hero cannot be added when Full Hero is present. Please remove Full Hero first.");
    return false;
  }
  if (templateType === 'action-hero' && hasMetaNav) {
    toast.error("Action Hero cannot be added when Meta Navigation is present. Please remove Meta Navigation first.");
    return false;
  }
  if (templateType === 'action-hero' && hasProductHeroGallery) {
    toast.error("Action Hero cannot be added when Product Hero Gallery is present. Please remove Product Hero Gallery first.");
    return false;
  }

  // Product Hero Gallery exclusions
  if (templateType === 'product-hero-gallery' && hasActionHero) {
    toast.error("Product Hero Gallery cannot be added when Action Hero is present. Please remove Action Hero first.");
    return false;
  }

  // Mini Footer handling
  if (templateType === 'mini-footer') {
    const footerSegment = pageSegments.find(seg => seg.type === 'footer');
    if (footerSegment) {
      await supabase
        .from("segment_registry")
        .update({ deleted: true })
        .eq("page_slug", resolvedPageSlug || selectedPage)
        .eq("segment_type", "footer");
    }
  }

  // Get next segment ID
  const { data: maxIdData, error: maxIdError } = await supabase
    .from("segment_registry")
    .select("segment_id")
    .order("segment_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxIdError) {
    console.error("Error fetching max segment ID:", maxIdError);
    toast.error("Failed to generate segment ID. Please try again.");
    return false;
  }

  const segmentId = (maxIdData?.segment_id || 0) + 1;
  setNextSegmentId(segmentId + 1);

  const defaultData = getDefaultSegmentData(templateType);
  const newSegment = {
    id: String(segmentId),
    type: templateType,
    data: defaultData
  };

  // Calculate new tab order
  let updatedTabOrder: string[];
  if (templateType === 'mini-footer') {
    updatedTabOrder = [...tabOrder];
  } else if (templateType === 'meta-navigation') {
    updatedTabOrder = [String(segmentId), ...tabOrder];
  } else if (templateType === 'full-hero' || templateType === 'action-hero') {
    const metaNavIndex = tabOrder.findIndex(id => {
      const seg = pageSegments.find(s => String(s.id) === id);
      return seg?.type === 'meta-navigation';
    });
    if (metaNavIndex >= 0) {
      updatedTabOrder = [...tabOrder.slice(0, metaNavIndex + 1), String(segmentId), ...tabOrder.slice(metaNavIndex + 1)];
    } else {
      updatedTabOrder = [String(segmentId), ...tabOrder];
    }
  } else {
    updatedTabOrder = [...tabOrder, String(segmentId)];
  }

  try {
    // Register segment
    const { error: registryError } = await supabase
      .from("segment_registry")
      .insert({
        segment_id: segmentId,
        page_slug: resolvedPageSlug || selectedPage,
        segment_type: templateType,
        segment_key: String(segmentId),
        is_static: false,
        deleted: false
      });

    if (registryError) throw registryError;

    // Create for all languages
    const allLanguages: Array<'en' | 'de' | 'ja' | 'ko' | 'zh'> = ['en', 'de', 'ja', 'ko', 'zh'];

    for (const lang of allLanguages) {
      const { data: existingContent } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", resolvedPageSlug || selectedPage)
        .eq("section_key", "page_segments")
        .eq("language", lang)
        .single();

      const existingSegments = existingContent?.content_value
        ? JSON.parse(existingContent.content_value)
        : [];

      const segmentData = lang === 'en'
        ? defaultData
        : getLanguageIndependentFields(templateType, defaultData);

      const languageSegment = {
        id: String(segmentId),
        type: templateType,
        data: segmentData
      };

      const updatedSegments = [...existingSegments, languageSegment];

      await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          language: lang,
          updated_at: new Date().toISOString(),
          updated_by: userId
        }, { onConflict: 'page_slug,section_key,language' });

      await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          language: lang,
          updated_at: new Date().toISOString(),
          updated_by: userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    // Update UI
    const currentLanguageSegments = editorLanguage === 'en'
      ? [...pageSegments, newSegment]
      : [...pageSegments, { ...newSegment, data: getLanguageIndependentFields(templateType, defaultData) }];

    setPageSegments(currentLanguageSegments);
    setTabOrder(updatedTabOrder);
    setActiveTab(String(segmentId));

    toast.success(`New ${templateType} segment added!`);
    return true;
  } catch (error: any) {
    toast.error("Error adding segment: " + error.message);
    return false;
  }
}

/**
 * Delete a segment from the page
 */
export async function deleteSegment(
  segmentId: string,
  ctx: SegmentOperationContext,
  setPageSegments: (segments: any[]) => void,
  setTabOrder: (order: string[]) => void,
  setActiveTab: (tab: string) => void,
  setSegmentRegistry: (fn: (prev: Record<string, number>) => Record<string, number>) => void
): Promise<boolean> {
  const { resolvedPageSlug, selectedPage, userId, pageSegments, tabOrder } = ctx;

  const deletingSegment = pageSegments.find(seg => seg.id === segmentId);
  const isDeletingMiniFooter = deletingSegment?.type === 'mini-footer';

  const updatedSegments = pageSegments.filter(seg => seg.id !== segmentId);
  const updatedTabOrder = tabOrder.filter(id => id !== segmentId);

  try {
    // Mark as deleted in registry
    const { error: registryError } = await supabase
      .from("segment_registry")
      .update({ deleted: true })
      .eq("segment_key", segmentId)
      .eq("page_slug", resolvedPageSlug || selectedPage);

    if (registryError) throw registryError;

    // Handle mini-footer deletion - restore regular footer
    if (isDeletingMiniFooter) {
      const { data: footerData } = await supabase
        .from("segment_registry")
        .select("*")
        .eq("page_slug", resolvedPageSlug || selectedPage)
        .eq("segment_type", "footer")
        .eq("deleted", true)
        .maybeSingle();

      let footerSegment: any;

      if (footerData) {
        await supabase
          .from("segment_registry")
          .update({ deleted: false })
          .eq("id", footerData.id);

        footerSegment = {
          id: footerData.segment_key,
          type: 'footer',
          segment_key: footerData.segment_key,
          position: 999
        };
      } else {
        const { data: maxIdData } = await supabase
          .from("segment_registry")
          .select("segment_id")
          .order("segment_id", { ascending: false })
          .limit(1)
          .maybeSingle();

        const newFooterId = (maxIdData?.segment_id || 0) + 1;
        const footerKey = `footer-${newFooterId}`;

        await supabase
          .from("segment_registry")
          .insert({
            segment_id: newFooterId,
            page_slug: resolvedPageSlug || selectedPage,
            segment_type: "footer",
            segment_key: footerKey,
            is_static: false,
            deleted: false,
            position: 999
          });

        footerSegment = {
          id: footerKey,
          type: 'footer',
          segment_key: footerKey,
          position: 999
        };

        setSegmentRegistry(prev => ({ ...prev, [footerKey]: newFooterId, 'footer': newFooterId }));
      }

      // Update all languages
      const languages = ['en', 'de', 'ja', 'ko', 'zh'];
      for (const lang of languages) {
        const { data: langContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", resolvedPageSlug || selectedPage)
          .eq("section_key", "page_segments")
          .eq("language", lang)
          .maybeSingle();

        let langSegments = langContent?.content_value ? JSON.parse(langContent.content_value) : [];
        langSegments = langSegments.filter((seg: any) => seg.type !== 'mini-footer');
        langSegments.push(footerSegment);

        await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "page_segments",
            content_type: "json",
            content_value: JSON.stringify(langSegments),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: userId
          }, { onConflict: 'page_slug,section_key,language' });

        const { data: langTabOrder } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", resolvedPageSlug || selectedPage)
          .eq("section_key", "tab_order")
          .eq("language", lang)
          .maybeSingle();

        let langOrder = langTabOrder?.content_value ? JSON.parse(langTabOrder.content_value) : [];
        langOrder = langOrder.filter((id: string) => id !== segmentId);

        await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "tab_order",
            content_type: "json",
            content_value: JSON.stringify(langOrder),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: userId
          }, { onConflict: 'page_slug,section_key,language' });
      }

      const newSegments = updatedSegments.filter(seg => seg.type !== 'mini-footer');
      newSegments.push(footerSegment);
      setPageSegments(newSegments);
      setTabOrder(updatedTabOrder);
      setActiveTab('footer');

      toast.success("Mini-Footer deleted, Footer restored!");
      return true;
    }

    // Regular deletion - update all languages
    const languages = ['en', 'de', 'ja', 'ko', 'zh'];
    for (const lang of languages) {
      const { data: langContent } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", resolvedPageSlug || selectedPage)
        .eq("section_key", "page_segments")
        .eq("language", lang)
        .maybeSingle();

      if (langContent?.content_value) {
        const langSegments = JSON.parse(langContent.content_value);
        const cleanedSegments = langSegments.filter((seg: any) => seg.id !== segmentId);

        await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "page_segments",
            content_type: "json",
            content_value: JSON.stringify(cleanedSegments),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: userId
          }, { onConflict: 'page_slug,section_key,language' });
      }

      const { data: langTabOrder } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", resolvedPageSlug || selectedPage)
        .eq("section_key", "tab_order")
        .eq("language", lang)
        .maybeSingle();

      if (langTabOrder?.content_value) {
        const langOrder = JSON.parse(langTabOrder.content_value);
        const cleanedOrder = langOrder.filter((id: string) => id !== segmentId);

        await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "tab_order",
            content_type: "json",
            content_value: JSON.stringify(cleanedOrder),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: userId
          }, { onConflict: 'page_slug,section_key,language' });
      }
    }

    setPageSegments(updatedSegments);
    setTabOrder(updatedTabOrder);
    setActiveTab(updatedTabOrder[0] || 'tiles');

    toast.success("Segment deleted from all languages!");
    return true;
  } catch (error: any) {
    toast.error("Error deleting segment: " + error.message);
    return false;
  }
}

/**
 * Ensures tab_order is synchronized with page_segments
 * This prevents segments from disappearing due to missing tab_order entries
 */
export function synchronizeTabOrder(pageSegments: any[], tabOrder: string[]): string[] {
  const segmentIds = pageSegments.map(seg => String(seg.id));
  const missingIds = segmentIds.filter(id => !tabOrder.includes(id));
  
  if (missingIds.length > 0) {
    console.warn(`[TAB ORDER SYNC] Found ${missingIds.length} segments missing from tab_order:`, missingIds);
    
    // Build new tab order: existing order + missing segments in their position order
    const newTabOrder = [...tabOrder];
    
    missingIds.forEach(missingId => {
      const segment = pageSegments.find(seg => String(seg.id) === missingId);
      if (segment) {
        const position = segment.position ?? pageSegments.indexOf(segment);
        // Insert at the correct position
        newTabOrder.splice(position, 0, missingId);
      } else {
        // Fallback: add at the end
        newTabOrder.push(missingId);
      }
    });
    
    // Remove any tab_order entries that don't exist in page_segments
    const validTabOrder = newTabOrder.filter(id => segmentIds.includes(id));
    
    return validTabOrder;
  }
  
  // Also remove any orphaned entries from tab_order
  const validTabOrder = tabOrder.filter(id => segmentIds.includes(id));
  if (validTabOrder.length !== tabOrder.length) {
    console.warn(`[TAB ORDER SYNC] Removed ${tabOrder.length - validTabOrder.length} orphaned entries from tab_order`);
    return validTabOrder;
  }
  
  return tabOrder;
}

/**
 * Save all segments with safety checks and automatic tab_order synchronization
 */
export async function saveAllSegments(
  ctx: SegmentOperationContext,
  setPageSegments: (segments: any[]) => void,
  setTabOrder?: (order: string[]) => void
): Promise<boolean> {
  const { resolvedPageSlug, selectedPage, editorLanguage, userId, pageSegments, tabOrder } = ctx;
  const currentPageSlug = resolvedPageSlug || selectedPage;

  try {
    // Fetch existing to compare
    const { data: existingData } = await supabase
      .from("page_content")
      .select("content_value")
      .eq("page_slug", currentPageSlug)
      .eq("section_key", "page_segments")
      .eq("language", editorLanguage)
      .single();

    let existingSegments: any[] = [];
    if (existingData?.content_value) {
      try {
        existingSegments = JSON.parse(existingData.content_value);
      } catch (e) {
        console.warn('[SAVE GUARD] Could not parse existing segments');
      }
    }

    // Safety checks
    const isLosingAllSegments = existingSegments.length > 0 && pageSegments.length === 0;
    if (isLosingAllSegments) {
      toast.error("Save blocked - cannot overwrite existing segments with empty list");
      return false;
    }

    const isLosingMultipleSegments = existingSegments.length > 1 && pageSegments.length < existingSegments.length - 1;
    if (isLosingMultipleSegments) {
      const confirmed = window.confirm(
        `WARNING: You are about to delete ${existingSegments.length - pageSegments.length} segments. Continue?`
      );
      if (!confirmed) {
        toast.info("Save cancelled");
        return false;
      }
    }

    // Create backup
    await createMultipleBackups(currentPageSlug, ['page_segments', 'tab_order'], editorLanguage);

    // Save with positions
    const segmentsWithPositions = pageSegments.map((seg, idx) => ({
      ...seg,
      position: idx
    }));

    // CRITICAL: Synchronize tab_order with page_segments to prevent segments from disappearing
    const synchronizedTabOrder = synchronizeTabOrder(pageSegments, tabOrder);
    
    // Check if synchronization was needed
    if (synchronizedTabOrder.join(',') !== tabOrder.join(',')) {
      console.log('[SAVE] Tab order was auto-synchronized to match page_segments');
      toast.info("Tab order was automatically synchronized");
    }

    // Save page_segments
    const { error: segmentsError } = await supabase
      .from("page_content")
      .upsert({
        page_slug: currentPageSlug,
        section_key: "page_segments",
        content_type: "json",
        content_value: JSON.stringify(segmentsWithPositions),
        language: editorLanguage,
        updated_at: new Date().toISOString(),
        updated_by: userId
      }, { onConflict: 'page_slug,section_key,language' });

    if (segmentsError) throw segmentsError;

    // CRITICAL: Always save synchronized tab_order together with page_segments
    const { error: tabOrderError } = await supabase
      .from("page_content")
      .upsert({
        page_slug: currentPageSlug,
        section_key: "tab_order",
        content_type: "json",
        content_value: JSON.stringify(synchronizedTabOrder),
        language: editorLanguage,
        updated_at: new Date().toISOString(),
        updated_by: userId
      }, { onConflict: 'page_slug,section_key,language' });

    if (tabOrderError) throw tabOrderError;

    setPageSegments(segmentsWithPositions);
    if (setTabOrder) {
      setTabOrder(synchronizedTabOrder);
    }
    
    toast.success("Segments saved successfully!");
    return true;
  } catch (error: any) {
    toast.error("Error saving segments: " + error.message);
    return false;
  }
}
