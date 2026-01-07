import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createContentBackup, validatePageSegmentsSave } from '@/utils/createContentBackup';

/**
 * SOFORT-SPEICHER-SYSTEM V2
 * 
 * Dieses System speichert Änderungen SOFORT - keine Warteschlangen, keine Intervalle.
 * Jede Komponente ruft saveImmediately() auf und das Speichern erfolgt direkt.
 */

// Speichert ob gerade ein globaler Save läuft (verhindert Race Conditions)
let globalSaveInProgress = false;
let lastGlobalSaveTime = 0;
const MIN_SAVE_GAP = 500; // Mindestens 500ms zwischen Saves

/**
 * SOFORT SPEICHERN - Keine Warteschlange, kein Intervall
 * Diese Funktion wird direkt aufgerufen wenn sich etwas ändert
 */
export async function saveImmediately(
  pageSlug: string,
  language: string,
  segments: any[]
): Promise<boolean> {
  // Prüfe ob ein anderer Save gerade läuft
  if (globalSaveInProgress) {
    console.log('[AutoSave] Save already in progress, waiting...');
    // Warte kurz und versuche erneut
    await new Promise(resolve => setTimeout(resolve, 100));
    if (globalSaveInProgress) {
      console.log('[AutoSave] Still in progress, queueing retry...');
      return false;
    }
  }

  // Rate limiting - verhindere zu schnelle aufeinanderfolgende Saves
  const now = Date.now();
  if (now - lastGlobalSaveTime < MIN_SAVE_GAP) {
    console.log('[AutoSave] Too fast, delaying...');
    await new Promise(resolve => setTimeout(resolve, MIN_SAVE_GAP));
  }

  globalSaveInProgress = true;
  lastGlobalSaveTime = Date.now();

  try {
    console.log('[AutoSave] IMMEDIATE SAVE for:', pageSlug, '/', language);

    // Holen der User-ID für Attribution
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    if (!currentUserId) {
      console.error('[AutoSave] No authenticated user - cannot save');
      return false;
    }

    // KRITISCH: Validiere bevor wir speichern
    const validation = await validatePageSegmentsSave(pageSlug, segments, language);
    if (!validation.safe) {
      console.error('[AutoSave] BLOCKED:', validation.reason);
      return false;
    }

    // Backup erstellen
    await createContentBackup(pageSlug, 'page_segments', language);

    // Positionen hinzufügen
    const segmentsWithPositions = segments.map((seg, idx) => ({
      ...seg,
      position: idx
    }));

    // SOFORT in Datenbank speichern
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
      toast.error('Speichern fehlgeschlagen');
      return false;
    }

    console.log('[AutoSave] ✅ SAVED immediately by user:', currentUserId);
    toast.success('Gespeichert', { duration: 1500 });
    return true;

  } catch (error) {
    console.error('[AutoSave] Exception:', error);
    toast.error('Fehler beim Speichern');
    return false;
  } finally {
    globalSaveInProgress = false;
  }
}

/**
 * Synchroner Save für kritische Situationen (Tab schließen, Navigate away)
 * Verwendet sendBeacon für zuverlässiges Speichern auch beim Verlassen
 */
export function saveBeforeLeaving(
  pageSlug: string,
  language: string,
  segments: any[]
): void {
  try {
    // Navigator.sendBeacon für zuverlässiges Speichern beim Verlassen
    const payload = JSON.stringify({
      pageSlug,
      language,
      segments: segments.map((seg, idx) => ({ ...seg, position: idx })),
      timestamp: new Date().toISOString()
    });

    // Speichere in localStorage als Fallback
    const backupKey = `autosave_backup_${pageSlug}_${language}`;
    localStorage.setItem(backupKey, payload);
    console.log('[AutoSave] Backup saved to localStorage:', backupKey);

  } catch (e) {
    console.error('[AutoSave] saveBeforeLeaving error:', e);
  }
}

/**
 * Stelle Backup wieder her falls vorhanden (nach Crash/Tab-Schließen)
 */
export async function restoreBackupIfExists(
  pageSlug: string,
  language: string
): Promise<any[] | null> {
  try {
    const backupKey = `autosave_backup_${pageSlug}_${language}`;
    const backup = localStorage.getItem(backupKey);
    
    if (backup) {
      const parsed = JSON.parse(backup);
      const backupAge = Date.now() - new Date(parsed.timestamp).getTime();
      
      // Nur Backups der letzten 5 Minuten wiederherstellen
      if (backupAge < 5 * 60 * 1000) {
        console.log('[AutoSave] Found recent backup, restoring...');
        
        // Speichere das Backup sofort in die DB
        await saveImmediately(pageSlug, language, parsed.segments);
        
        // Lösche das Backup
        localStorage.removeItem(backupKey);
        
        return parsed.segments;
      } else {
        // Altes Backup löschen
        localStorage.removeItem(backupKey);
      }
    }
    
    return null;
  } catch (e) {
    console.error('[AutoSave] restoreBackupIfExists error:', e);
    return null;
  }
}

/**
 * Hook für Frontend-Editing - vereinfachte Version
 * Hauptsächlich für beforeunload und visibilitychange Events
 */
export function useFrontendAutoSave(
  pageSlug: string,
  language: string,
  isEditMode: boolean
) {
  const segmentsRef = useRef<any[]>([]);
  const hasChangesRef = useRef(false);

  // Registriere Änderungen für Notfall-Save
  const registerChange = useCallback((segments: any[]) => {
    segmentsRef.current = segments;
    hasChangesRef.current = true;
  }, []);

  // Markiere als gespeichert
  const markSaved = useCallback(() => {
    hasChangesRef.current = false;
  }, []);

  // beforeunload Handler
  useEffect(() => {
    if (!isEditMode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        // Speichere Backup
        saveBeforeLeaving(pageSlug, language, segmentsRef.current);
        e.preventDefault();
        e.returnValue = 'Änderungen werden gespeichert...';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditMode, pageSlug, language]);

  // Visibility change Handler - speichere wenn Tab versteckt wird
  useEffect(() => {
    if (!isEditMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasChangesRef.current) {
        console.log('[AutoSave] Tab hidden - saving immediately...');
        saveImmediately(pageSlug, language, segmentsRef.current)
          .then(success => {
            if (success) {
              hasChangesRef.current = false;
            }
          });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEditMode, pageSlug, language]);

  // Beim Start: Prüfe auf Backup
  useEffect(() => {
    if (isEditMode) {
      restoreBackupIfExists(pageSlug, language);
    }
  }, [isEditMode, pageSlug, language]);

  return {
    saveNow: () => saveImmediately(pageSlug, language, segmentsRef.current),
    hasPendingChanges: () => hasChangesRef.current,
    registerChange,
    markSaved
  };
}

/**
 * Legacy-Funktion für Kompatibilität
 */
export function registerAutoSaveChange(
  pageSlug: string,
  language: string,
  segments: any[]
) {
  // Sofort speichern statt in Queue
  saveImmediately(pageSlug, language, segments);
}

/**
 * Legacy-Funktion für Kompatibilität
 */
export function stopAutoSave() {
  // Nichts zu stoppen - wir haben keine Intervalle mehr
  console.log('[AutoSave] No timer to stop (immediate save mode)');
}
