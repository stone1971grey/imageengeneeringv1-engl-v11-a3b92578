import { useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseSegmentAutoSaveProps {
  pageSlug: string;
  segmentId: string;
  language: string;
  getDataToSave: () => any;
  debounceMs?: number;
}

/**
 * Wiederverwendbarer Auto-Save Hook für alle Segment-Editoren im Admin Dashboard.
 * Speichert Änderungen automatisch nach einer Verzögerung (Standard: 1 Sekunde).
 */
export function useSegmentAutoSave({
  pageSlug,
  segmentId,
  language,
  getDataToSave,
  debounceMs = 1000
}: UseSegmentAutoSaveProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const performAutoSave = useCallback(async () => {
    if (isSavingRef.current) {
      console.log('[AutoSave] Already saving, skipping...');
      return false;
    }

    isSavingRef.current = true;
    console.log('[AutoSave] 🔄 Starting...', { pageSlug, segmentId, language });

    try {
      const { data: existingData, error: loadError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .maybeSingle();

      if (loadError) {
        console.error('[AutoSave] Load error:', loadError);
        throw loadError;
      }

      if (!existingData) {
        console.error('[AutoSave] No page_segments found for:', pageSlug);
        toast.error('Segment-Daten nicht gefunden');
        return false;
      }

      let segments = JSON.parse(existingData.content_value || '[]');
      const segmentIndex = segments.findIndex((seg: any) => String(seg.id) === String(segmentId));

      if (segmentIndex === -1) {
        console.error('[AutoSave] Segment not found:', segmentId);
        toast.error(`Segment ${segmentId} nicht gefunden`);
        return false;
      }

      // Get data to save from the callback
      const dataToSave = getDataToSave();
      
      // Update segment data
      segments[segmentIndex].data = {
        ...segments[segmentIndex].data,
        ...dataToSave
      };

      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from("page_content")
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq("id", existingData.id);

      if (updateError) {
        console.error('[AutoSave] Update error:', updateError);
        throw updateError;
      }

      console.log('[AutoSave] ✅ Success');
      toast.success('✅ Änderungen gespeichert', { duration: 1500 });
      return true;

    } catch (error) {
      console.error('[AutoSave] Error:', error);
      toast.error('Auto-Save fehlgeschlagen');
      return false;
    } finally {
      isSavingRef.current = false;
    }
  }, [pageSlug, segmentId, language, getDataToSave]);

  const triggerAutoSave = useCallback(() => {
    console.log('[AutoSave] Triggered');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, debounceMs);
  }, [performAutoSave, debounceMs]);

  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return performAutoSave();
  }, [performAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save pending changes
        performAutoSave();
      }
    };
  }, []);

  return {
    triggerAutoSave,
    saveNow,
    isSaving: isSavingRef.current
  };
}
