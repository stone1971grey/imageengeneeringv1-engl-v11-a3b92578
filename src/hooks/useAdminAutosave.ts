import { useEffect, useRef } from 'react';

interface AutosaveOptions {
  key: string;
  data: any;
  delay?: number;
  enabled?: boolean;
}

/**
 * Custom hook for safe admin autosave functionality
 * CRITICAL: This ONLY saves to localStorage, NEVER to database
 * Database writes only happen on explicit "Save Changes" button clicks
 */
export const useAdminAutosave = ({ key, data, delay = 1000, enabled = true }: AutosaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Skip autosave on initial load to prevent overwriting with empty data
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    // Only autosave if enabled and data exists
    if (!enabled || !data) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounced save to localStorage
    timeoutRef.current = setTimeout(() => {
      try {
        const timestamp = new Date().toISOString();
        const autosaveData = {
          data,
          timestamp,
          version: '1.0'
        };
        
        localStorage.setItem(`admin_autosave_${key}`, JSON.stringify(autosaveData));
        console.log(`[Autosave] Saved draft for ${key} at ${timestamp}`);
      } catch (error) {
        console.error('[Autosave] Failed to save draft:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay, enabled]);
};

/**
 * Load autosaved data from localStorage
 * Returns null if no autosave exists or if it's invalid
 */
export const loadAutosavedData = (key: string): any | null => {
  try {
    const stored = localStorage.getItem(`admin_autosave_${key}`);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    console.log(`[Autosave] Loaded draft for ${key} from ${parsed.timestamp}`);
    return parsed.data;
  } catch (error) {
    console.error('[Autosave] Failed to load draft:', error);
    return null;
  }
};

/**
 * Clear autosaved data after successful save to database
 */
export const clearAutosavedData = (key: string): void => {
  try {
    localStorage.removeItem(`admin_autosave_${key}`);
    console.log(`[Autosave] Cleared draft for ${key}`);
  } catch (error) {
    console.error('[Autosave] Failed to clear draft:', error);
  }
};

/**
 * Check if autosaved data exists for a given key
 */
export const hasAutosavedData = (key: string): boolean => {
  try {
    const stored = localStorage.getItem(`admin_autosave_${key}`);
    return stored !== null;
  } catch (error) {
    return false;
  }
};
