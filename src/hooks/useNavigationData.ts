import { useLanguage } from '@/contexts/LanguageContext';
import { navigationDataEn } from '@/translations/navigationData';
import { navigationDataDe } from '@/translations/navigationData.de';
import { navigationDataZh } from '@/translations/navigationData.zh';
import { navigationDataJa } from '@/translations/navigationData.ja';
import { navigationDataKo } from '@/translations/navigationData.ko';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get navigation data
 * Tries to load from database first, falls back to static files if DB is empty or errors
 */
export const useNavigationData = () => {
  const { language } = useLanguage();
  
  // Static fallback data
  const staticNavigationData = {
    en: navigationDataEn,
    de: navigationDataDe,
    zh: navigationDataZh,
    ja: navigationDataJa,
    ko: navigationDataKo
  };

  // Query navigation links from database
  const { data: dbLinks, isError } = useQuery({
    queryKey: ['navigation-links', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_links')
        .select('*')
        .eq('language', language)
        .eq('active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // If DB has data, reconstruct navigation structure from DB
  if (dbLinks && dbLinks.length > 0 && !isError) {
    // Reconstruct the navigation data structure from flat DB records
    const reconstructed: any = {
      industries: {},
      products: {},
      testServices: {},
      solutions: staticNavigationData[language].solutions || {},
      solutionPackages: staticNavigationData[language].solutionPackages || {},
      targetGroups: staticNavigationData[language].targetGroups || {}
    };

    dbLinks.forEach(link => {
      const category = link.category;
      const parentCategory = link.parent_category;

      if (!reconstructed[category]) {
        reconstructed[category] = {};
      }

      if (!reconstructed[category][parentCategory]) {
        reconstructed[category][parentCategory] = {
          description: link.description || '',
          subgroups: category === 'testServices' ? undefined : [],
          services: category === 'testServices' ? [] : undefined
        };
      }

      const item = {
        name: link.parent_label,
        link: link.slug,
        active: link.active
      };

      if (category === 'testServices') {
        reconstructed[category][parentCategory].services.push(item);
      } else {
        reconstructed[category][parentCategory].subgroups.push(item);
      }
    });

    return reconstructed;
  }

  // Fallback to static files if DB is empty or error
  return staticNavigationData[language];
};
