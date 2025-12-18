import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type LanguageCode = 'en' | 'de' | 'ja' | 'ko' | 'zh';

interface EditorLanguageAccess {
  hasAccess: boolean;
  allowedLanguages: LanguageCode[] | null; // null = full access (can edit all including English)
  isLoading: boolean;
  canEditLanguage: (lang: LanguageCode) => boolean;
  canEditEnglish: boolean;
  isLanguageRestricted: boolean;
}

/**
 * Hook to check editor's language access permissions
 * 
 * Unified permission model:
 * - `page_slug = '__global__'` with `language_code` = global language permissions
 *   These apply to ALL areas: CMS segments, News, Events, Products, Downloads
 * - `page_slug = 'specific-page-slug'` with `language_code` = page-specific override (optional)
 * - `page_slug = '__all__'` = legacy full access (no restrictions)
 * - Content editors (news, events, etc.) use page_slug to grant access, 
 *   but language restrictions come from global permissions
 * 
 * Priority: page-specific > global > full access check
 */
export const useEditorLanguageAccess = (pageSlug?: string): EditorLanguageAccess => {
  const [allowedLanguages, setAllowedLanguages] = useState<LanguageCode[] | null>(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Check if user is admin - admins have full access
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const isAdmin = roles?.some(r => r.role === 'admin');
        if (isAdmin) {
          setHasAccess(true);
          setAllowedLanguages(null); // Full access
          setIsLoading(false);
          return;
        }

        // Get editor's language access
        const { data: accessData } = await supabase
          .from('editor_page_access')
          .select('page_slug, language_code')
          .eq('user_id', user.id);

        if (!accessData || accessData.length === 0) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // Check for legacy __all__ access (full access)
        const hasAllAccess = accessData.some(a => a.page_slug === '__all__' && !a.language_code);
        if (hasAllAccess) {
          setHasAccess(true);
          setAllowedLanguages(null);
          setIsLoading(false);
          return;
        }

        // Collect page-specific permissions if pageSlug is provided
        const pageSpecificLanguages: LanguageCode[] = [];
        let hasPageSpecific = false;

        if (pageSlug) {
          accessData.forEach(access => {
            if (access.page_slug === pageSlug) {
              hasPageSpecific = true;
              if (access.language_code === null) {
                // Full access for this specific page
                pageSpecificLanguages.length = 0; // Clear to signal full access
              } else if (access.language_code) {
                pageSpecificLanguages.push(access.language_code as LanguageCode);
              }
            }
          });
        }

        // If page-specific permissions exist, use those
        if (hasPageSpecific) {
          setHasAccess(true);
          if (pageSpecificLanguages.length === 0) {
            // Full access for this page (had null language_code)
            setAllowedLanguages(null);
          } else {
            setAllowedLanguages([...new Set(pageSpecificLanguages)]);
          }
          setIsLoading(false);
          return;
        }

        // Fall back to global permissions (__global__)
        const globalLanguages: LanguageCode[] = [];
        let hasGlobalFullAccess = false;

        accessData.forEach(access => {
          if (access.page_slug === '__global__') {
            if (access.language_code === null) {
              hasGlobalFullAccess = true;
            } else if (access.language_code) {
              globalLanguages.push(access.language_code as LanguageCode);
            }
          }
        });

        if (hasGlobalFullAccess) {
          setHasAccess(true);
          setAllowedLanguages(null);
          setIsLoading(false);
          return;
        }

        if (globalLanguages.length > 0) {
          setHasAccess(true);
          setAllowedLanguages([...new Set(globalLanguages)]);
          setIsLoading(false);
          return;
        }

        // No global or page-specific access found - check for any access entry (legacy support)
        // Collect all language codes from any access entries
        const anyLanguages: LanguageCode[] = [];
        accessData.forEach(access => {
          if (access.language_code) {
            anyLanguages.push(access.language_code as LanguageCode);
          }
        });

        if (anyLanguages.length > 0) {
          setHasAccess(true);
          setAllowedLanguages([...new Set(anyLanguages)]);
        } else if (accessData.length > 0) {
          // Has some access entries but no language restrictions
          setHasAccess(true);
          setAllowedLanguages(null);
        } else {
          setHasAccess(false);
        }

      } catch (error) {
        console.error('Error checking editor language access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [pageSlug]);

  const canEditLanguage = (lang: LanguageCode): boolean => {
    if (allowedLanguages === null) return true; // Full access (admin)
    return allowedLanguages.includes(lang);
  };

  const canEditEnglish = allowedLanguages === null || allowedLanguages.includes('en');
  const isLanguageRestricted = allowedLanguages !== null && allowedLanguages.length > 0;

  return {
    hasAccess,
    allowedLanguages,
    isLoading,
    canEditLanguage,
    canEditEnglish,
    isLanguageRestricted
  };
};
