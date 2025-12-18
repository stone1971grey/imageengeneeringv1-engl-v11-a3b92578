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

        // Check if user has __all__ access (legacy full access)
        const hasAllAccess = accessData.some(a => a.page_slug === '__all__');
        if (hasAllAccess) {
          setHasAccess(true);
          setAllowedLanguages(null);
          setIsLoading(false);
          return;
        }

        // Collect all language restrictions
        // If any entry has null language_code, user has full access for that editor/page
        // If all entries have language_code, user is restricted to those languages
        const languageRestrictions: LanguageCode[] = [];
        let hasUnrestrictedAccess = false;

        accessData.forEach(access => {
          // Check if this access applies to the current page/editor
          const matchesPage = !pageSlug || access.page_slug === pageSlug || access.page_slug === '__all__';
          
          if (matchesPage) {
            if (access.language_code === null) {
              hasUnrestrictedAccess = true;
            } else if (access.language_code) {
              languageRestrictions.push(access.language_code as LanguageCode);
            }
          }
        });

        setHasAccess(true);
        
        if (hasUnrestrictedAccess) {
          setAllowedLanguages(null); // Full access
        } else if (languageRestrictions.length > 0) {
          // Remove duplicates
          setAllowedLanguages([...new Set(languageRestrictions)]);
        } else {
          // No specific page access found, but user has some access
          // Collect all their language restrictions globally
          const allLanguages: LanguageCode[] = [];
          accessData.forEach(access => {
            if (access.language_code) {
              allLanguages.push(access.language_code as LanguageCode);
            }
          });
          
          if (allLanguages.length > 0) {
            setAllowedLanguages([...new Set(allLanguages)]);
          } else {
            setAllowedLanguages(null); // No restrictions found
          }
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
    if (allowedLanguages === null) return true; // Full access
    if (lang === 'en') return false; // English is always read-only for restricted editors
    return allowedLanguages.includes(lang);
  };

  const canEditEnglish = allowedLanguages === null;
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
