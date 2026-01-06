import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get page titles from database (title_translations)
 * 
 * This provides localized page titles from page_registry.
 * Use this to get dynamic titles that editors can modify without code changes.
 * 
 * Part of the Database-First Navigation (Approach A) architecture.
 */
export const usePageTitles = () => {
  const { language } = useLanguage();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ['page-titles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select('page_slug, page_title, title_translations')
        .eq('status', 'published');

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  /**
   * Get localized title for a page by slug
   * Falls back to page_title if no translation exists
   */
  const getTitle = (pageSlug: string): string | null => {
    if (!pages) return null;
    
    const page = pages.find(p => p.page_slug === pageSlug);
    if (!page) return null;

    const translations = (page.title_translations as Record<string, string>) || {};
    return translations[language] || page.page_title;
  };

  /**
   * Get all titles as a map: slug -> localized title
   */
  const getTitleMap = (): Record<string, string> => {
    if (!pages) return {};
    
    const map: Record<string, string> = {};
    pages.forEach(page => {
      const translations = (page.title_translations as Record<string, string>) || {};
      map[page.page_slug] = translations[language] || page.page_title;
    });
    return map;
  };

  return {
    getTitle,
    getTitleMap,
    isLoading,
    error,
    language
  };
};
