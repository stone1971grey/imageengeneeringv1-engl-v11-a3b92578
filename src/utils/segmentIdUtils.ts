/**
 * CRITICAL: Segment ID Utility Functions
 * 
 * All segment IDs MUST be stored and compared as strings to prevent
 * the duplication bug where "535" !== 535 causes duplicate segments.
 * 
 * ALWAYS use these utilities for segment ID operations.
 */

/**
 * Normalizes any segment ID to a consistent string format.
 * This prevents the String vs Number comparison bug.
 */
export function normalizeSegmentId(id: string | number | undefined | null): string {
  if (id === undefined || id === null) {
    console.warn('[SEGMENT ID] Received null/undefined ID');
    return '';
  }
  return String(id);
}

/**
 * Compares two segment IDs for equality, handling type mismatches.
 */
export function segmentIdsMatch(id1: string | number | undefined | null, id2: string | number | undefined | null): boolean {
  return normalizeSegmentId(id1) === normalizeSegmentId(id2);
}

/**
 * Finds a segment by ID in an array, handling type mismatches.
 */
export function findSegmentById<T extends { id: string | number }>(
  segments: T[],
  targetId: string | number
): T | undefined {
  const normalizedTarget = normalizeSegmentId(targetId);
  return segments.find(seg => normalizeSegmentId(seg.id) === normalizedTarget);
}

/**
 * Finds a segment index by ID in an array, handling type mismatches.
 */
export function findSegmentIndexById<T extends { id: string | number }>(
  segments: T[],
  targetId: string | number
): number {
  const normalizedTarget = normalizeSegmentId(targetId);
  return segments.findIndex(seg => normalizeSegmentId(seg.id) === normalizedTarget);
}

/**
 * Updates or adds a segment to an array, ensuring consistent string IDs.
 * Returns the updated array.
 */
export function upsertSegment<T extends { id: string | number; type: string; data: any }>(
  segments: T[],
  segmentId: string | number,
  segmentType: string,
  segmentData: any
): T[] {
  const normalizedId = normalizeSegmentId(segmentId);
  const existingIndex = findSegmentIndexById(segments, segmentId);
  
  const updatedSegments = [...segments];
  
  if (existingIndex >= 0) {
    // Update existing - ensure ID is normalized to string
    updatedSegments[existingIndex] = {
      ...updatedSegments[existingIndex],
      id: normalizedId,
      data: segmentData
    };
  } else {
    // Add new - always use string ID
    updatedSegments.push({
      id: normalizedId,
      type: segmentType,
      data: segmentData
    } as T);
  }
  
  return updatedSegments;
}

/**
 * Removes a segment from an array by ID, handling type mismatches.
 */
export function removeSegmentById<T extends { id: string | number }>(
  segments: T[],
  targetId: string | number
): T[] {
  const normalizedTarget = normalizeSegmentId(targetId);
  return segments.filter(seg => normalizeSegmentId(seg.id) !== normalizedTarget);
}

/**
 * Checks if a tab_order array includes a segment ID, handling type mismatches.
 */
export function tabOrderIncludes(
  tabOrder: (string | number)[],
  segmentId: string | number
): boolean {
  const normalizedTarget = normalizeSegmentId(segmentId);
  return tabOrder.some(id => normalizeSegmentId(id) === normalizedTarget);
}

/**
 * Normalizes all IDs in a tab_order array to strings.
 */
export function normalizeTabOrder(tabOrder: (string | number)[]): string[] {
  return tabOrder.map(id => normalizeSegmentId(id));
}

/**
 * Adds a segment ID to tab_order if not already present, returns normalized array.
 */
export function addToTabOrder(
  tabOrder: (string | number)[],
  segmentId: string | number
): string[] {
  const normalized = normalizeTabOrder(tabOrder);
  const normalizedId = normalizeSegmentId(segmentId);
  
  if (!normalized.includes(normalizedId)) {
    normalized.push(normalizedId);
  }
  
  return normalized;
}

/**
 * Removes a segment ID from tab_order, returns normalized array.
 */
export function removeFromTabOrder(
  tabOrder: (string | number)[],
  segmentId: string | number
): string[] {
  const normalizedId = normalizeSegmentId(segmentId);
  return normalizeTabOrder(tabOrder).filter(id => id !== normalizedId);
}

/**
 * Validates and cleans a page_segments array:
 * - Removes duplicates (by ID)
 * - Normalizes all IDs to strings
 * - Logs warnings for any issues found
 */
export function validateAndCleanSegments<T extends { id: string | number; type: string }>(
  segments: T[],
  context?: string
): T[] {
  const seenIds = new Set<string>();
  const cleanedSegments: T[] = [];
  let hadIssues = false;
  
  for (const segment of segments) {
    const normalizedId = normalizeSegmentId(segment.id);
    
    if (seenIds.has(normalizedId)) {
      console.warn(`[SEGMENT VALIDATION${context ? ` - ${context}` : ''}] Duplicate segment ID found and removed: ${normalizedId}`);
      hadIssues = true;
      continue;
    }
    
    seenIds.add(normalizedId);
    cleanedSegments.push({
      ...segment,
      id: normalizedId
    });
  }
  
  if (hadIssues) {
    console.warn(`[SEGMENT VALIDATION${context ? ` - ${context}` : ''}] Cleaned ${segments.length - cleanedSegments.length} duplicate(s)`);
  }
  
  return cleanedSegments;
}
