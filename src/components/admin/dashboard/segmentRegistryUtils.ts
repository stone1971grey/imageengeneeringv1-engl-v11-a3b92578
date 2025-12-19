// Segment Registry Loading Utilities
import { supabase } from "@/integrations/supabase/client";

export interface SegmentRegistryResult {
  registry: Record<string, number>;
  reverseRegistry: Record<string, string>;
}

// Load segment registry for a page
export async function loadSegmentRegistryData(
  querySlug: string
): Promise<SegmentRegistryResult> {
  try {
    console.log('[loadSegmentRegistry] Querying for slug:', querySlug);
    
    // First try exact match
    let { data, error } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", querySlug)
      .or("deleted.is.null,deleted.eq.false");

    // If no results and querySlug doesn't contain '/', try finding by hierarchical pattern
    if ((!data || data.length === 0) && !querySlug.includes('/')) {
      console.log('[loadSegmentRegistry] No exact match, trying hierarchical search for:', querySlug);
      const { data: hierarchicalData, error: hierarchicalError } = await supabase
        .from("segment_registry")
        .select("*")
        .ilike("page_slug", `%/${querySlug}`)
        .or("deleted.is.null,deleted.eq.false");
      
      if (!hierarchicalError && hierarchicalData && hierarchicalData.length > 0) {
        data = hierarchicalData;
        console.log('[loadSegmentRegistry] Found hierarchical match:', hierarchicalData[0]?.page_slug);
      }
    }

    if (error) {
      console.error("Error loading segment registry:", error);
      return { registry: {}, reverseRegistry: {} };
    }

    // Create a map of segment_key to segment_id
    const registry: Record<string, number> = {};
    // Create a reverse map of segment_id to segment_key for dynamic labels
    const reverseRegistry: Record<string, string> = {};
    
    console.log('[loadSegmentRegistry] Raw data from DB:', data);
    
    data?.forEach((item: any) => {
      registry[item.segment_key] = item.segment_id;
      reverseRegistry[String(item.segment_id)] = item.segment_key;
      
      // Register footer segments under 'footer' key for the Footer tab display
      if (item.segment_type === 'footer') {
        console.log('[loadSegmentRegistry] Found footer segment:', item.segment_id, item.segment_key, item.segment_type);
        registry['footer'] = item.segment_id;
      }
    });

    console.log("✅ Loaded segment registry for", querySlug, ":", registry, "Footer ID:", registry['footer']);
    return { registry, reverseRegistry };
  } catch (error) {
    console.error("Error loading segment registry:", error);
    return { registry: {}, reverseRegistry: {} };
  }
}

// Calculate the maximum segment ID across ALL pages to ensure global uniqueness
export async function calculateGlobalMaxSegmentId(): Promise<number> {
  try {
    // Query segment_registry to get the highest segment_id
    const { data, error } = await supabase
      .from("segment_registry")
      .select("segment_id")
      .order("segment_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching global max segment ID:", error);
      return 18; // Default to 18 (after initial 17 segments)
    }

    const globalMaxId = data?.segment_id || 17;
    const nextId = globalMaxId + 1;
    console.log("✅ Global max segment ID:", globalMaxId, "| Next available ID:", nextId);
    return nextId;
  } catch (error) {
    console.error("Error calculating global max segment ID:", error);
    return 18; // Default to 18 if error
  }
}

// Store reverse registry globally for access from other parts of the app
export function setGlobalReverseRegistry(reverseRegistry: Record<string, string>): void {
  (window as any).__segmentKeyRegistry = reverseRegistry;
}

// Get reverse registry from global storage
export function getGlobalReverseRegistry(): Record<string, string> {
  return (window as any).__segmentKeyRegistry || {};
}
