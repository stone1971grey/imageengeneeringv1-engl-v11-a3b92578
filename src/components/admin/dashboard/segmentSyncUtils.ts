/**
 * Segment Synchronization Utilities
 * 
 * Automatically synchronizes segments between segment_registry and page_segments/tab_order
 * to fix inconsistencies where segments exist in registry but are missing from page content.
 */

import { supabase } from "@/integrations/supabase/client";
import { normalizeSegmentId } from "@/utils/segmentIdUtils";

export interface SegmentRegistryEntry {
  segment_id: number;
  segment_type: string;
  segment_key: string;
  position: number | null;
  deleted: boolean;
}

export interface PageSegment {
  id: string;
  type: string;
  data?: any;
  position?: number;
}

export interface SyncResult {
  synchronized: boolean;
  addedSegments: string[];
  updatedPageSegments: PageSegment[];
  updatedTabOrder: string[];
}

/**
 * Fetches segment registry entries for a given page slug
 */
export async function fetchSegmentRegistry(pageSlug: string): Promise<SegmentRegistryEntry[]> {
  const { data, error } = await supabase
    .from('segment_registry')
    .select('segment_id, segment_type, segment_key, position, deleted')
    .eq('page_slug', pageSlug)
    .eq('deleted', false);
  
  if (error) {
    console.error('[segmentSyncUtils] Error fetching segment_registry:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Synchronizes page_segments and tab_order with segment_registry.
 * Adds any missing segments from the registry to page_segments and tab_order.
 * 
 * @returns SyncResult with details about what was synchronized
 */
export function synchronizeSegments(
  registryEntries: SegmentRegistryEntry[],
  currentPageSegments: PageSegment[],
  currentTabOrder: string[]
): SyncResult {
  const result: SyncResult = {
    synchronized: false,
    addedSegments: [],
    updatedPageSegments: [...currentPageSegments],
    updatedTabOrder: [...currentTabOrder]
  };
  
  // Normalize all existing segment IDs for comparison
  const existingSegmentIds = new Set(
    currentPageSegments.map(seg => normalizeSegmentId(seg.id))
  );
  const existingTabOrderIds = new Set(
    currentTabOrder.map(id => normalizeSegmentId(id))
  );
  
  // Find segments in registry that are missing from page_segments
  const missingSegments: { id: string; type: string; position: number }[] = [];
  
  for (const entry of registryEntries) {
    const normalizedId = normalizeSegmentId(entry.segment_id);
    
    if (!existingSegmentIds.has(normalizedId)) {
      missingSegments.push({
        id: normalizedId,
        type: entry.segment_type,
        position: entry.position ?? 999
      });
      result.addedSegments.push(`${entry.segment_type} (ID: ${normalizedId})`);
    }
  }
  
  if (missingSegments.length === 0) {
    // No synchronization needed
    return result;
  }
  
  console.log('[segmentSyncUtils] Found missing segments to synchronize:', missingSegments);
  
  // Add missing segments to pageSegments
  for (const missing of missingSegments) {
    result.updatedPageSegments.push({
      id: missing.id,
      type: missing.type,
      data: {}, // Empty data - will be loaded from page_content
      position: missing.position
    });
  }
  
  // Sort by position
  result.updatedPageSegments.sort((a, b) => {
    const posA = a.position ?? 999;
    const posB = b.position ?? 999;
    return posA - posB;
  });
  
  // Update positions after sorting
  result.updatedPageSegments = result.updatedPageSegments.map((seg, idx) => ({
    ...seg,
    position: idx
  }));
  
  // Update tab_order: add missing segments in correct positions
  // Fixed-position types that should be at specific locations
  const fixedStartTypes = ['full-hero', 'action-hero'];
  const fixedEndTypes = ['footer', 'mini-footer'];
  
  for (const missing of missingSegments) {
    if (!existingTabOrderIds.has(missing.id)) {
      if (fixedStartTypes.includes(missing.type)) {
        // Add at the beginning
        result.updatedTabOrder.unshift(missing.id);
      } else if (fixedEndTypes.includes(missing.type)) {
        // Add at the end
        result.updatedTabOrder.push(missing.id);
      } else {
        // Add before footer segments
        const footerIndex = result.updatedTabOrder.findIndex(id => {
          const seg = result.updatedPageSegments.find(s => normalizeSegmentId(s.id) === normalizeSegmentId(id));
          return seg && fixedEndTypes.includes(seg.type);
        });
        
        if (footerIndex > 0) {
          result.updatedTabOrder.splice(footerIndex, 0, missing.id);
        } else {
          result.updatedTabOrder.push(missing.id);
        }
      }
    }
  }
  
  // Ensure proper ordering: fixed-start at beginning, fixed-end at end
  const fixedStart = result.updatedTabOrder.filter(id => {
    const seg = result.updatedPageSegments.find(s => normalizeSegmentId(s.id) === normalizeSegmentId(id));
    return seg && fixedStartTypes.includes(seg.type);
  });
  
  const fixedEnd = result.updatedTabOrder.filter(id => {
    const seg = result.updatedPageSegments.find(s => normalizeSegmentId(s.id) === normalizeSegmentId(id));
    return seg && fixedEndTypes.includes(seg.type);
  });
  
  const middle = result.updatedTabOrder.filter(id => {
    const seg = result.updatedPageSegments.find(s => normalizeSegmentId(s.id) === normalizeSegmentId(id));
    return seg && !fixedStartTypes.includes(seg.type) && !fixedEndTypes.includes(seg.type);
  });
  
  // Also include meta-navigation and other special types not in segments
  const unmapped = result.updatedTabOrder.filter(id => {
    const seg = result.updatedPageSegments.find(s => normalizeSegmentId(s.id) === normalizeSegmentId(id));
    return !seg;
  });
  
  result.updatedTabOrder = [...fixedStart, ...middle, ...unmapped, ...fixedEnd];
  
  result.synchronized = true;
  
  console.log('[segmentSyncUtils] Synchronization complete:', {
    addedCount: result.addedSegments.length,
    newPageSegmentsCount: result.updatedPageSegments.length,
    newTabOrderCount: result.updatedTabOrder.length
  });
  
  return result;
}

/**
 * Saves synchronized segments to the database
 */
export async function saveSynchronizedSegments(
  pageSlug: string,
  pageSegments: PageSegment[],
  tabOrder: string[],
  userId: string,
  language: string = 'en'
): Promise<boolean> {
  try {
    // Save page_segments
    const { error: segmentsError } = await supabase
      .from('page_content')
      .upsert({
        page_slug: pageSlug,
        section_key: 'page_segments',
        content_type: 'json',
        content_value: JSON.stringify(pageSegments),
        language,
        updated_at: new Date().toISOString(),
        updated_by: userId
      }, {
        onConflict: 'page_slug,section_key,language'
      });
    
    if (segmentsError) {
      console.error('[segmentSyncUtils] Error saving page_segments:', segmentsError);
      return false;
    }
    
    // Save tab_order
    const { error: tabOrderError } = await supabase
      .from('page_content')
      .upsert({
        page_slug: pageSlug,
        section_key: 'tab_order',
        content_type: 'json',
        content_value: JSON.stringify(tabOrder),
        language,
        updated_at: new Date().toISOString(),
        updated_by: userId
      }, {
        onConflict: 'page_slug,section_key,language'
      });
    
    if (tabOrderError) {
      console.error('[segmentSyncUtils] Error saving tab_order:', tabOrderError);
      return false;
    }
    
    console.log('[segmentSyncUtils] Successfully saved synchronized segments for:', pageSlug);
    return true;
  } catch (error) {
    console.error('[segmentSyncUtils] Error saving synchronized segments:', error);
    return false;
  }
}

/**
 * Main synchronization function that fetches registry, compares, and saves if needed.
 * Call this after loading page content to ensure consistency.
 */
export async function autoSyncSegmentsOnLoad(
  pageSlug: string,
  currentPageSegments: PageSegment[],
  currentTabOrder: string[],
  userId: string,
  language: string = 'en'
): Promise<SyncResult | null> {
  try {
    // Fetch segment registry
    const registryEntries = await fetchSegmentRegistry(pageSlug);
    
    if (registryEntries.length === 0) {
      console.log('[segmentSyncUtils] No segment_registry entries for page:', pageSlug);
      return null;
    }
    
    // Synchronize
    const result = synchronizeSegments(registryEntries, currentPageSegments, currentTabOrder);
    
    if (result.synchronized) {
      console.log('[segmentSyncUtils] Synchronization needed for page:', pageSlug, 
        'Adding segments:', result.addedSegments);
      
      // Save to database
      const saved = await saveSynchronizedSegments(
        pageSlug,
        result.updatedPageSegments,
        result.updatedTabOrder,
        userId,
        language
      );
      
      if (!saved) {
        console.error('[segmentSyncUtils] Failed to save synchronized segments');
        return null;
      }
    }
    
    return result;
  } catch (error) {
    console.error('[segmentSyncUtils] Error in autoSyncSegmentsOnLoad:', error);
    return null;
  }
}
