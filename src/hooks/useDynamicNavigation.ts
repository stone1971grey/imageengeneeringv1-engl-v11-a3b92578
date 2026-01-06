import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface NavigationPage {
  slug: string;
  title: string;
  titleTranslations: Record<string, string>;
  parentSlug: string | null;
  designIcon: string | null;
  flyoutImageUrl: string | null;
  flyoutDescription: string | null;
  flyoutDescriptionTranslations: Record<string, string>;
  navCategory: string;
  navVisible: boolean;
  navPosition: number | null;
  position: number | null;
  status: string;
  children?: NavigationPage[];
}

export interface NavigationStructure {
  mainNav: NavigationPage[];
  footerNav: NavigationPage[];
  utilityNav: NavigationPage[];
}

/**
 * Database-First Navigation Hook
 * 
 * Loads entire navigation structure from page_registry.
 * No hardcoded translation files - everything from DB.
 * 
 * Benefits:
 * - Single source of truth for navigation
 * - Slug changes auto-propagate via parent_slug
 * - Multi-tenant ready (same code, different DB)
 * - Editors can modify structure without deployments
 */
export const useDynamicNavigation = () => {
  const { language } = useLanguage();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ['navigation-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select(`
          page_slug,
          page_title,
          parent_slug,
          design_icon,
          flyout_image_url,
          flyout_description,
          flyout_description_translations,
          nav_category,
          nav_visible,
          nav_position,
          position,
          status,
          title_translations
        `)
        .eq('status', 'published')
        .order('nav_position', { ascending: true, nullsFirst: false })
        .order('position', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Transform flat DB records into hierarchical navigation structure
  const buildNavigation = (): NavigationStructure => {
    if (!pages || pages.length === 0) {
      return { mainNav: [], footerNav: [], utilityNav: [] };
    }

    // Convert DB records to NavigationPage objects
    const pageMap = new Map<string, NavigationPage>();
    
    pages.forEach((p: any) => {
      const titleTranslations = (p.title_translations as Record<string, string>) || {};
      const flyoutTranslations = (p.flyout_description_translations as Record<string, string>) || {};
      
      pageMap.set(p.page_slug, {
        slug: p.page_slug,
        title: titleTranslations[language] || p.page_title,
        titleTranslations,
        parentSlug: p.parent_slug,
        designIcon: p.design_icon,
        flyoutImageUrl: p.flyout_image_url,
        flyoutDescription: flyoutTranslations[language] || p.flyout_description,
        flyoutDescriptionTranslations: flyoutTranslations,
        navCategory: p.nav_category || 'main',
        navVisible: p.nav_visible !== false,
        navPosition: p.nav_position,
        position: p.position,
        status: p.status,
        children: []
      });
    });

    // Build hierarchy: attach children to parents
    pageMap.forEach((page) => {
      if (page.parentSlug && page.parentSlug !== 'index' && pageMap.has(page.parentSlug)) {
        const parent = pageMap.get(page.parentSlug)!;
        parent.children = parent.children || [];
        parent.children.push(page);
      }
    });

    // Sort children by nav_position or position
    pageMap.forEach((page) => {
      if (page.children && page.children.length > 0) {
        page.children.sort((a, b) => {
          const posA = a.navPosition ?? a.position ?? 999;
          const posB = b.navPosition ?? b.position ?? 999;
          return posA - posB;
        });
      }
    });

    // Get top-level navigation items (parent_slug = 'index')
    const topLevelPages = Array.from(pageMap.values())
      .filter(p => p.parentSlug === 'index' && p.navVisible)
      .sort((a, b) => {
        const posA = a.navPosition ?? a.position ?? 999;
        const posB = b.navPosition ?? b.position ?? 999;
        return posA - posB;
      });

    // Categorize by nav_category
    const mainNav = topLevelPages.filter(p => p.navCategory === 'main');
    const footerNav = topLevelPages.filter(p => p.navCategory === 'footer');
    const utilityNav = topLevelPages.filter(p => p.navCategory === 'utility');

    return { mainNav, footerNav, utilityNav };
  };

  const navigation = buildNavigation();

  // Helper: Get localized title for a page
  const getTitle = (page: NavigationPage): string => {
    return page.titleTranslations[language] || page.title;
  };

  // Helper: Get localized flyout description
  const getDescription = (page: NavigationPage): string | null => {
    return page.flyoutDescriptionTranslations[language] || page.flyoutDescription;
  };

  // Helper: Get full URL path for a page
  const getPath = (page: NavigationPage): string => {
    return `/${language}/${page.slug}`;
  };

  // Helper: Find a page by slug
  const findPage = (slug: string): NavigationPage | undefined => {
    if (!pages) return undefined;
    
    const allPages = Array.from(buildNavStructure().values());
    return allPages.find(p => p.slug === slug);
  };

  // Internal helper to get all pages as map
  const buildNavStructure = (): Map<string, NavigationPage> => {
    const pageMap = new Map<string, NavigationPage>();
    if (!pages) return pageMap;
    
    pages.forEach((p: any) => {
      const titleTranslations = (p.title_translations as Record<string, string>) || {};
      const flyoutTranslations = (p.flyout_description_translations as Record<string, string>) || {};
      
      pageMap.set(p.page_slug, {
        slug: p.page_slug,
        title: titleTranslations[language] || p.page_title,
        titleTranslations,
        parentSlug: p.parent_slug,
        designIcon: p.design_icon,
        flyoutImageUrl: p.flyout_image_url,
        flyoutDescription: flyoutTranslations[language] || p.flyout_description,
        flyoutDescriptionTranslations: flyoutTranslations,
        navCategory: p.nav_category || 'main',
        navVisible: p.nav_visible !== false,
        navPosition: p.nav_position,
        position: p.position,
        status: p.status,
        children: []
      });
    });
    
    return pageMap;
  };

  return {
    navigation,
    isLoading,
    error,
    getTitle,
    getDescription,
    getPath,
    findPage,
    language
  };
};

/**
 * Hook to get navigation items for a specific parent slug
 * Useful for rendering flyout menus dynamically
 */
export const useNavigationChildren = (parentSlug: string) => {
  const { language } = useLanguage();

  const { data: children, isLoading } = useQuery({
    queryKey: ['navigation-children', parentSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select(`
          page_slug,
          page_title,
          parent_slug,
          design_icon,
          flyout_image_url,
          flyout_description,
          flyout_description_translations,
          nav_position,
          position,
          status,
          title_translations
        `)
        .eq('parent_slug', parentSlug)
        .eq('status', 'published')
        .eq('nav_visible', true)
        .order('nav_position', { ascending: true, nullsFirst: false })
        .order('position', { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const items: NavigationPage[] = (children || []).map((p: any) => {
    const titleTranslations = (p.title_translations as Record<string, string>) || {};
    const flyoutTranslations = (p.flyout_description_translations as Record<string, string>) || {};
    
    return {
      slug: p.page_slug,
      title: titleTranslations[language] || p.page_title,
      titleTranslations,
      parentSlug: p.parent_slug,
      designIcon: p.design_icon,
      flyoutImageUrl: p.flyout_image_url,
      flyoutDescription: flyoutTranslations[language] || p.flyout_description,
      flyoutDescriptionTranslations: flyoutTranslations,
      navCategory: 'main',
      navVisible: true,
      navPosition: p.nav_position,
      position: p.position,
      status: p.status
    };
  });

  return { items, isLoading, language };
};
