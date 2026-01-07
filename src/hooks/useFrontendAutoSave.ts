import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createContentBackup, validatePageSegmentsSave } from '@/utils/createContentBackup';

interface AutoSaveChange {
  pageSlug: string;
  language: string;
  segments: any[];
  timestamp: number;
}

// Global pending changes registry
const pendingChangesMap = new Map<string, AutoSaveChange>();
let autoSaveTimerRef: NodeJS.Timeout | null = null;
let lastSaveTime = 0;

const AUTO_SAVE_INTERVAL = 10000; // 10 seconds
const MIN_SAVE_INTERVAL = 3000; // Minimum 3 seconds between saves

/**
 * Register a change for auto-save
 * Call this whenever segment content is modified
 */
export function registerAutoSaveChange(
  pageSlug: string,
  language: string,
  segments: any[]
) {
  const key = `${pageSlug}:${language}`;
  pendingChangesMap.set(key, {
    pageSlug,
    language,
    segments,
    timestamp: Date.now()
  });
  console.log('[AutoSave] Registered change for:', key, 'segments:', segments.length);
}

/**
 * Perform the actual save operation with safety checks
 */
async function performAutoSave(): Promise<boolean> {
  if (pendingChangesMap.size === 0) {
    return false;
  }

  // Rate limiting
  const now = Date.now();
  if (now - lastSaveTime < MIN_SAVE_INTERVAL) {
    console.log('[AutoSave] Skipping - too soon since last save');
    return false;
  }

  // CRITICAL: Get current user ID for attribution
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;
  
  if (!currentUserId) {
    console.error('[AutoSave] No authenticated user - cannot save');
    return false;
  }

  let savedCount = 0;
  const entries = Array.from(pendingChangesMap.entries());

  for (const [key, change] of entries) {
    try {
      const { pageSlug, language, segments } = change;

      // CRITICAL: Validate before saving to prevent data loss
      const validation = await validatePageSegmentsSave(pageSlug, segments, language);
      
      if (!validation.safe) {
        console.error('[AutoSave] BLOCKED:', validation.reason);
        // Don't save, but keep in pending for next attempt after user fixes issue
        continue;
      }

      // Create backup before save
      await createContentBackup(pageSlug, 'page_segments', language);

      // Add positions to segments
      const segmentsWithPositions = segments.map((seg, idx) => ({
        ...seg,
        position: idx
      }));

      // Save to database WITH user attribution
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'page_segments',
          content_type: 'json',
          content_value: JSON.stringify(segmentsWithPositions),
          language,
          updated_at: new Date().toISOString(),
          updated_by: currentUserId
        }, { onConflict: 'page_slug,section_key,language' });

      if (error) {
        console.error('[AutoSave] Error saving:', error);
        continue;
      }

      // Success - remove from pending
      pendingChangesMap.delete(key);
      savedCount++;
      console.log('[AutoSave] Saved:', key, 'by user:', currentUserId);

    } catch (error) {
      console.error('[AutoSave] Exception for', key, error);
    }
  }

  lastSaveTime = Date.now();

  if (savedCount > 0) {
    toast.success('Auto-saved', {
      description: `${savedCount} segment${savedCount > 1 ? 's' : ''} saved`,
      duration: 2000
    });
    return true;
  }

  return false;
}

/**
 * Hook for frontend editing auto-save functionality
 * Add this to the page component that wraps editable content
 */
export function useFrontendAutoSave(
  pageSlug: string,
  language: string,
  isEditMode: boolean
) {
  const isFirstRender = useRef(true);

  // Start/stop auto-save timer based on edit mode
  useEffect(() => {
    if (!isEditMode) {
      // Not in edit mode - no auto-save needed
      return;
    }

    // Start auto-save timer
    if (!autoSaveTimerRef) {
      console.log('[AutoSave] Starting auto-save timer (10s interval)');
      autoSaveTimerRef = setInterval(() => {
        performAutoSave();
      }, AUTO_SAVE_INTERVAL);
    }

    // Cleanup on unmount or mode change
    return () => {
      // Perform final save on unmount
      if (pendingChangesMap.size > 0) {
        console.log('[AutoSave] Performing final save on unmount');
        performAutoSave();
      }
    };
  }, [isEditMode]);

  // Warn user about unsaved changes when leaving
  useEffect(() => {
    if (!isEditMode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingChangesMap.size > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditMode]);

  // Function to trigger immediate save
  const saveNow = useCallback(async () => {
    return performAutoSave();
  }, []);

  // Function to check if there are pending changes
  const hasPendingChanges = useCallback(() => {
    return pendingChangesMap.size > 0;
  }, []);

  return {
    saveNow,
    hasPendingChanges,
    registerChange: (segments: any[]) => registerAutoSaveChange(pageSlug, language, segments)
  };
}

/**
 * Cleanup function - call when edit mode is disabled
 */
export function stopAutoSave() {
  if (autoSaveTimerRef) {
    clearInterval(autoSaveTimerRef);
    autoSaveTimerRef = null;
    console.log('[AutoSave] Stopped auto-save timer');
  }
}
