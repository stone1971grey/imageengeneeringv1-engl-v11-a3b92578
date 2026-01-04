import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDefaultSegmentData, getLanguageIndependentFields } from './segmentUtils';
import { createMultipleBackups } from '@/utils/createContentBackup';

export interface SegmentContext {
  userId: string;
  resolvedPageSlug: string;
  selectedPage: string;
  editorLanguage: string;
}

// Check for segment type conflicts
export function checkSegmentConflicts(
  templateType: string,
  pageSegments: any[]
): { allowed: boolean; message?: string } {
  const hasFullHero = pageSegments.some(seg => seg.type === 'full-hero');
  const hasMetaNav = pageSegments.some(seg => seg.type === 'meta-navigation');
  const hasActionHero = pageSegments.some(seg => seg.type === 'action-hero');
  const hasProductHeroGallery = pageSegments.some(seg => seg.type === 'product-hero-gallery');

  if (templateType === 'full-hero' && hasMetaNav) {
    return { allowed: false, message: "Full Hero cannot be added when Meta Navigation is present. Please remove Meta Navigation first." };
  }
  if (templateType === 'full-hero' && hasActionHero) {
    return { allowed: false, message: "Full Hero cannot be added when Action Hero is present. Please remove Action Hero first." };
  }
  if (templateType === 'meta-navigation' && hasFullHero) {
    return { allowed: false, message: "Meta Navigation cannot be added when Full Hero is present. Please remove Full Hero first." };
  }
  if (templateType === 'meta-navigation' && hasActionHero) {
    return { allowed: false, message: "Meta Navigation cannot be added when Action Hero is present. Please remove Action Hero first." };
  }
  if (templateType === 'action-hero' && hasFullHero) {
    return { allowed: false, message: "Action Hero cannot be added when Full Hero is present. Please remove Full Hero first." };
  }
  if (templateType === 'action-hero' && hasMetaNav) {
    return { allowed: false, message: "Action Hero cannot be added when Meta Navigation is present. Please remove Meta Navigation first." };
  }
  if (templateType === 'action-hero' && hasProductHeroGallery) {
    return { allowed: false, message: "Action Hero cannot be added when Product Hero Gallery is present. Please remove Product Hero Gallery first." };
  }
  if (templateType === 'product-hero-gallery' && hasActionHero) {
    return { allowed: false, message: "Product Hero Gallery cannot be added when Action Hero is present. Please remove Action Hero first." };
  }

  return { allowed: true };
}

// Calculate tab order position for new segment
export function calculateNewTabOrder(
  templateType: string,
  segmentId: string,
  tabOrder: string[],
  pageSegments: any[]
): string[] {
  if (templateType === 'mini-footer') {
    // Mini-footer is fixed position, not in tab_order
    return [...tabOrder];
  } else if (templateType === 'meta-navigation') {
    // Meta-navigation always goes at start
    return [segmentId, ...tabOrder];
  } else if (templateType === 'full-hero' || templateType === 'action-hero') {
    // Full-hero and action-hero go at start (after meta-nav if present)
    const metaNavIndex = tabOrder.findIndex(id => {
      const seg = pageSegments.find(s => String(s.id) === id);
      return seg?.type === 'meta-navigation';
    });
    if (metaNavIndex >= 0) {
      return [...tabOrder.slice(0, metaNavIndex + 1), segmentId, ...tabOrder.slice(metaNavIndex + 1)];
    }
    return [segmentId, ...tabOrder];
  } else {
    // All other segments go to end
    return [...tabOrder, segmentId];
  }
}

// Add new segment
export async function addSegment(
  templateType: string,
  context: SegmentContext,
  pageSegments: any[],
  tabOrder: string[],
  setPageSegments: (segments: any[]) => void,
  setTabOrder: (order: string[]) => void,
  setNextSegmentId: (id: number) => void,
  setSegmentRegistry?: (fn: (prev: Record<string, number>) => Record<string, number>) => void
): Promise<{ success: boolean; segmentId?: string }> {
  // Check for conflicts
  const conflictCheck = checkSegmentConflicts(templateType, pageSegments);
  if (!conflictCheck.allowed) {
    toast.error(conflictCheck.message);
    return { success: false };
  }

  // Handle mini-footer: deactivate regular footer
  if (templateType === 'mini-footer') {
    const footerSegment = pageSegments.find(seg => seg.type === 'footer');
    if (footerSegment) {
      await supabase
        .from("segment_registry")
        .update({ deleted: true })
        .eq("page_slug", context.resolvedPageSlug || context.selectedPage)
        .eq("segment_type", "footer");
    }
  }

  // Fetch latest max ID from database
  const { data: maxIdData, error: maxIdError } = await supabase
    .from("segment_registry")
    .select("segment_id")
    .order("segment_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxIdError) {
    toast.error("Failed to generate segment ID. Please try again.");
    return { success: false };
  }

  const segmentId = (maxIdData?.segment_id || 0) + 1;
  setNextSegmentId(segmentId + 1);

  const defaultData = getDefaultSegmentData(templateType);
  const newSegment = {
    id: String(segmentId),
    type: templateType,
    data: defaultData
  };

  const updatedTabOrder = calculateNewTabOrder(templateType, String(segmentId), tabOrder, pageSegments);

  try {
    // Register segment in segment_registry
    const { error: registryError } = await supabase
      .from("segment_registry")
      .insert({
        segment_id: segmentId,
        page_slug: context.resolvedPageSlug || context.selectedPage,
        segment_type: templateType,
        segment_key: String(segmentId),
        is_static: false,
        deleted: false
      });

    if (registryError) throw registryError;

    // Create segment for all languages
    const allLanguages: Array<'en' | 'de' | 'ja' | 'ko' | 'zh'> = ['en', 'de', 'ja', 'ko', 'zh'];

    for (const lang of allLanguages) {
      const { data: existingContent } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", context.resolvedPageSlug || context.selectedPage)
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
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          language: lang,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });

      await supabase
        .from("page_content")
        .upsert({
          page_slug: context.resolvedPageSlug || context.selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          language: lang,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });
    }

    // Update UI state
    const currentLanguageSegments = context.editorLanguage === 'en'
      ? [...pageSegments, newSegment]
      : [...pageSegments, { ...newSegment, data: getLanguageIndependentFields(templateType, defaultData) }];

    setPageSegments(currentLanguageSegments);
    setTabOrder(updatedTabOrder);

    toast.success(`New segment added successfully with ID ${segmentId} for all languages!`);
    return { success: true, segmentId: String(segmentId) };
  } catch (error: any) {
    toast.error("Error adding segment: " + error.message);
    return { success: false };
  }
}

// Delete segment
export async function deleteSegment(
  segmentId: string,
  context: SegmentContext,
  pageSegments: any[],
  tabOrder: string[],
  setPageSegments: (segments: any[]) => void,
  setTabOrder: (order: string[]) => void,
  setSegmentRegistry?: (fn: (prev: Record<string, number>) => Record<string, number>) => void
): Promise<boolean> {
  const deletingSegment = pageSegments.find(seg => seg.id === segmentId);
  const isDeletingMiniFooter = deletingSegment?.type === 'mini-footer';

  const updatedSegments = pageSegments.filter(seg => seg.id !== segmentId);
  const updatedTabOrder = tabOrder.filter(id => id !== segmentId);

  try {
    // Mark segment as deleted in registry
    await supabase
      .from("segment_registry")
      .update({ deleted: true })
      .eq("segment_key", segmentId)
      .eq("page_slug", context.resolvedPageSlug || context.selectedPage);

    // Handle mini-footer deletion: restore regular footer
    if (isDeletingMiniFooter) {
      const { data: footerData } = await supabase
        .from("segment_registry")
        .select("*")
        .eq("page_slug", context.resolvedPageSlug || context.selectedPage)
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
            page_slug: context.resolvedPageSlug || context.selectedPage,
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

        if (setSegmentRegistry) {
          setSegmentRegistry(prev => ({ ...prev, [footerKey]: newFooterId, 'footer': newFooterId }));
        }
      }

      // Update all language versions
      const languages = ['en', 'de', 'ja', 'ko', 'zh'];
      for (const lang of languages) {
        const { data: langContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", context.resolvedPageSlug || context.selectedPage)
          .eq("section_key", "page_segments")
          .eq("language", lang)
          .maybeSingle();

        let langSegments = langContent?.content_value ? JSON.parse(langContent.content_value) : [];
        langSegments = langSegments.filter((seg: any) => seg.type !== 'mini-footer');
        langSegments.push(footerSegment);

        await supabase
          .from("page_content")
          .upsert({
            page_slug: context.resolvedPageSlug || context.selectedPage,
            section_key: "page_segments",
            content_type: "json",
            content_value: JSON.stringify(langSegments),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: context.userId
          }, { onConflict: 'page_slug,section_key,language' });
      }

      const newSegments = updatedSegments.filter(seg => seg.type !== 'mini-footer');
      newSegments.push(footerSegment);
      setPageSegments(newSegments);
      setTabOrder(updatedTabOrder);
      toast.success("Mini-Footer deleted, Footer restored!");
      return true;
    }

    // Remove from all language versions
    const languages = ['en', 'de', 'ja', 'ko', 'zh'];
    for (const lang of languages) {
      const { data: langContent } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", context.resolvedPageSlug || context.selectedPage)
        .eq("section_key", "page_segments")
        .eq("language", lang)
        .maybeSingle();

      if (langContent?.content_value) {
        const langSegments = JSON.parse(langContent.content_value);
        const cleanedSegments = langSegments.filter((seg: any) => seg.id !== segmentId);

        await supabase
          .from("page_content")
          .upsert({
            page_slug: context.resolvedPageSlug || context.selectedPage,
            section_key: "page_segments",
            content_type: "json",
            content_value: JSON.stringify(cleanedSegments),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: context.userId
          }, { onConflict: 'page_slug,section_key,language' });
      }

      const { data: langTabOrder } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", context.resolvedPageSlug || context.selectedPage)
        .eq("section_key", "tab_order")
        .eq("language", lang)
        .maybeSingle();

      if (langTabOrder?.content_value) {
        const langOrder = JSON.parse(langTabOrder.content_value);
        const cleanedOrder = langOrder.filter((id: string) => id !== segmentId);

        await supabase
          .from("page_content")
          .upsert({
            page_slug: context.resolvedPageSlug || context.selectedPage,
            section_key: "tab_order",
            content_type: "json",
            content_value: JSON.stringify(cleanedOrder),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: context.userId
          }, { onConflict: 'page_slug,section_key,language' });
      }
    }

    setPageSegments(updatedSegments);
    setTabOrder(updatedTabOrder);
    toast.success("Segment deleted from all languages! (ID will never be reused)");
    return true;
  } catch (error: any) {
    toast.error("Error deleting segment: " + error.message);
    return false;
  }
}

// Save segments with safety checks
export async function saveSegments(
  context: SegmentContext,
  pageSegments: any[],
  setPageSegments: (segments: any[]) => void
): Promise<boolean> {
  const currentPageSlug = context.resolvedPageSlug || context.selectedPage;

  try {
    // Fetch existing segments for safety check
    const { data: existingData } = await supabase
      .from("page_content")
      .select("content_value")
      .eq("page_slug", currentPageSlug)
      .eq("section_key", "page_segments")
      .eq("language", context.editorLanguage)
      .single();

    let existingSegments: any[] = [];
    if (existingData?.content_value) {
      try {
        existingSegments = JSON.parse(existingData.content_value);
      } catch (e) {
        console.warn('[SAVE GUARD] Could not parse existing segments');
      }
    }

    // CRITICAL SAFETY CHECKS - Protect against accidental data loss
    const existingNonFooterCount = existingSegments.filter((s: any) => s.type !== 'footer' && s.type !== 'mini-footer').length;
    const newNonFooterCount = pageSegments.filter((s: any) => s.type !== 'footer' && s.type !== 'mini-footer').length;
    
    // Block saving completely empty list
    const isLosingAllSegments = existingSegments.length > 0 && pageSegments.length === 0;
    if (isLosingAllSegments) {
      console.error('[SAVE GUARD] BLOCKED: Attempted to save empty segment list over', existingSegments.length, 'existing segments');
      toast.error("KRITISCH: Speichern blockiert - leere Segment-Liste kann bestehende Segmente nicht überschreiben");
      return false;
    }

    // ENHANCED: Block if losing most content segments (keeping only footer)
    const isLosingMostContent = existingNonFooterCount > 2 && newNonFooterCount <= 1;
    if (isLosingMostContent) {
      console.error('[SAVE GUARD] BLOCKED: Attempted to reduce', existingNonFooterCount, 'content segments to', newNonFooterCount);
      toast.error(`KRITISCH: Speichern blockiert - würde ${existingNonFooterCount - newNonFooterCount} Content-Segmente löschen. Das sieht nach einem Bug aus!`);
      return false;
    }

    // Warning for significant segment loss
    const isLosingMultipleSegments = existingSegments.length > 1 && pageSegments.length < existingSegments.length - 1;
    if (isLosingMultipleSegments) {
      console.warn('[SAVE GUARD] WARNING: About to delete', existingSegments.length - pageSegments.length, 'segments');
      const confirmed = window.confirm(
        `WARNUNG: Sie sind dabei, ${existingSegments.length - pageSegments.length} Segmente zu löschen. Fortfahren?`
      );
      if (!confirmed) {
        toast.info("Speichern abgebrochen - Segmente wurden nicht geändert");
        return false;
      }
    }

    // Create backup
    await createMultipleBackups(currentPageSlug, ['page_segments', 'tab_order'], context.editorLanguage);

    // Ensure positions
    const segmentsWithPositions = pageSegments.map((seg, idx) => ({
      ...seg,
      position: idx
    }));

    const { error } = await supabase
      .from("page_content")
      .upsert({
        page_slug: currentPageSlug,
        section_key: "page_segments",
        content_type: "json",
        content_value: JSON.stringify(segmentsWithPositions),
        language: context.editorLanguage,
        updated_at: new Date().toISOString(),
        updated_by: context.userId
      }, { onConflict: 'page_slug,section_key,language' });

    if (error) throw error;

    setPageSegments(segmentsWithPositions);
    toast.success("Segment saved successfully!");
    return true;
  } catch (error: any) {
    toast.error("Error saving segment: " + error.message);
    return false;
  }
}

// Auto-save segment with debounce (returns a timer ID)
// CRITICAL: This function now includes safety checks to prevent data loss
export function autoSaveSegmentDebounced(
  context: SegmentContext,
  updatedSegments: any[],
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>,
  debounceMs: number = 1000
): void {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }

  timerRef.current = setTimeout(async () => {
    try {
      const currentPageSlug = context.resolvedPageSlug || context.selectedPage;
      
      // CRITICAL SAFETY CHECK: Fetch existing segments before overwriting
      const { data: existingData } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", currentPageSlug)
        .eq("section_key", "page_segments")
        .eq("language", context.editorLanguage)
        .single();

      let existingSegments: any[] = [];
      if (existingData?.content_value) {
        try {
          existingSegments = JSON.parse(existingData.content_value);
        } catch (e) {
          console.warn('[AUTO-SAVE GUARD] Could not parse existing segments');
        }
      }

      // Count non-footer segments
      const existingNonFooterCount = existingSegments.filter((s: any) => s.type !== 'footer' && s.type !== 'mini-footer').length;
      const newNonFooterCount = updatedSegments.filter((s: any) => s.type !== 'footer' && s.type !== 'mini-footer').length;

      // BLOCK if would delete most content
      if (existingNonFooterCount > 2 && newNonFooterCount <= 1) {
        console.error('[AUTO-SAVE GUARD] BLOCKED: Would reduce', existingNonFooterCount, 'content segments to', newNonFooterCount);
        return;
      }

      // BLOCK if empty overwriting non-empty
      if (existingSegments.length > 0 && updatedSegments.length === 0) {
        console.error('[AUTO-SAVE GUARD] BLOCKED: Would save empty list over', existingSegments.length, 'segments');
        return;
      }

      const segmentsWithPositions = updatedSegments.map((seg, idx) => ({
        ...seg,
        position: idx
      }));

      await supabase
        .from("page_content")
        .upsert({
          page_slug: currentPageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segmentsWithPositions),
          language: context.editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: context.userId
        }, { onConflict: 'page_slug,section_key,language' });

      console.log('[AUTO-SAVE] Segment auto-saved successfully');
    } catch (error: any) {
      console.error('[AUTO-SAVE] Error:', error.message);
    }
  }, debounceMs);
}
