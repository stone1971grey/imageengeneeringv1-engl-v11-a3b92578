import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigationData } from "@/hooks/useNavigationData";
import { Input } from "@/components/ui/input";
import { X, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HierarchicalPageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

interface PageStatus {
  slug: string;
  title: string;
  url: string;
  isCMS: boolean;
  isStatic: boolean;
  category?: string;
  subcategory?: string;
  isMainCategory?: boolean;
  pageId?: number;
  hasCta?: boolean;
}

export const HierarchicalPageSelect = ({ value, onValueChange }: HierarchicalPageSelectProps) => {
  const navigationData = useNavigationData();
  const [cmsPages, setCmsPages] = useState<Set<string>>(new Set());
  const [pageStatuses, setPageStatuses] = useState<PageStatus[]>([]);
  const [pageIdMap, setPageIdMap] = useState<Map<string, number>>(new Map());
  const [ctaPageIds, setCtaPageIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredStatuses, setFilteredStatuses] = useState<PageStatus[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [styleguideRegistryPages, setStyleguideRegistryPages] = useState<Array<{ slug: string; title: string; pageId: number }>>([]);

  // Expose refresh function to parent via custom event
  useEffect(() => {
    const handleRefresh = () => {
      console.log("🔄 HierarchicalPageSelect: Refreshing data...");
      loadCMSPages();
      loadPageIds();
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('refreshPageSelector', handleRefresh);
    return () => window.removeEventListener('refreshPageSelector', handleRefresh);
  }, []);

  useEffect(() => {
    loadCMSPages();
    loadPageIds();
    loadStyleguidePages();
  }, [refreshKey]);

  useEffect(() => {
    // Always build page statuses when data changes, even if no CMS pages exist yet
    buildPageStatuses();
  }, [cmsPages, navigationData, pageIdMap, styleguideRegistryPages]);

  useEffect(() => {
    // Filter statuses based on search query with smart ranking
    if (!searchQuery.trim()) {
      setFilteredStatuses(pageStatuses);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    
    // Score-based filtering for better relevance
    const scoredResults = pageStatuses.map(status => {
      let score = 0;
      const pageId = status.pageId ?? getPageIdForStatus(status);
      const pageIdStr = pageId?.toString() || '';
      const title = status.title.toLowerCase();
      const slug = status.slug.toLowerCase();
      const category = status.category?.toLowerCase() || '';
      const subcategory = status.subcategory?.toLowerCase() || '';
      
      // Exact matches (highest priority)
      if (pageIdStr === query) score += 100;
      if (title === query) score += 90;
      if (slug === query) score += 85;
      
      // Starts with (high priority)
      if (pageIdStr.startsWith(query)) score += 70;
      if (title.startsWith(query)) score += 60;
      if (slug.startsWith(query)) score += 55;
      
      // Contains (medium priority)
      if (pageIdStr.includes(query)) score += 40;
      if (title.includes(query)) score += 30;
      if (slug.includes(query)) score += 25;
      if (category.includes(query)) score += 20;
      if (subcategory.includes(query)) score += 15;
      
      // Word boundary matches (better than simple contains)
      const words = query.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          const wordRegex = new RegExp(`\\b${word}`, 'i');
          if (wordRegex.test(title)) score += 10;
          if (wordRegex.test(slug)) score += 8;
          if (wordRegex.test(category)) score += 5;
        }
      });
      
      return { status, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.status);
    
    setFilteredStatuses(scoredResults);
  }, [searchQuery, pageStatuses]);

  const loadCMSPages = async () => {
    const { data } = await supabase
      .from('segment_registry')
      .select('page_slug')
      .eq('deleted', false);

    if (data) {
      const uniqueSlugs = new Set(data.map(item => item.page_slug));
      setCmsPages(uniqueSlugs);
    }
  };

  const loadStyleguidePages = async () => {
    const { data } = await supabase
      .from('page_registry')
      .select('page_slug, page_id, page_title')
      .ilike('page_slug', 'styleguide%')
      .order('page_slug', { ascending: true });

    if (data) {
      setStyleguideRegistryPages(data.map(item => ({
        slug: item.page_slug,
        title: item.page_title,
        pageId: item.page_id
      })));
    }
  };

  const loadPageIds = async () => {
    const { data } = await supabase
      .from('page_registry')
      .select('page_slug, page_id, page_title, cta_group');

    if (data) {
      // Map by slug, normalized title, AND partial slug matches
      const mapping = new Map<string, number>();
      const ctaIds = new Set<number>();

      data.forEach(item => {
        // Direct slug mapping
        mapping.set(item.page_slug, item.page_id);

        // Track pages that have a navigation CTA configured
        if (item.cta_group && item.cta_group !== 'none') {
          ctaIds.add(item.page_id);
        }
        
        // Normalized title mapping (fallback)
        const normalizedTitle = item.page_title.toLowerCase().replace(/[^a-z0-9]/g, '');
        mapping.set(`title:${normalizedTitle}`, item.page_id);
        
        // For hierarchical slugs like "products/test-charts/le7", map by:
        // 1) Last segment only: "le7"
        // 2) Last two segments: "test-charts/le7"
        // 3) Last three segments: "products/test-charts/le7" (already covered by direct mapping)
        const slugParts = item.page_slug.split('/');
        if (slugParts.length > 1) {
          // Map by last segment only (most specific extraction)
          const lastSegment = slugParts[slugParts.length - 1];
          mapping.set(lastSegment, item.page_id);
          
          // Map by last two segments
          if (slugParts.length >= 2) {
            const lastTwoSegments = slugParts.slice(-2).join('/');
            mapping.set(lastTwoSegments, item.page_id);
          }
        }
        
        // Partial slug mapping with hyphens (legacy logic for backwards compatibility)
        const hyphenParts = item.page_slug.split('-');
        if (hyphenParts.length > 1) {
          const lastTwoParts = hyphenParts.slice(-2).join('-');
          const lastThreeParts = hyphenParts.slice(-3).join('-');
          mapping.set(`partial:${lastTwoParts}`, item.page_id);
          mapping.set(`partial:${lastThreeParts}`, item.page_id);
        }
      });
      setPageIdMap(mapping);
      setCtaPageIds(ctaIds);
    }
  };

  const extractSlugFromUrl = (url: string): string => {
    // Extract slug from URL path
    if (!url || url === '#') return '';
    
    const parts = url.split('/').filter(Boolean);
    if (parts.length === 0) return '';
    
    // For hierarchical URLs like /your-solution/automotive, use last part
    return parts[parts.length - 1];
  };

  const buildPageStatuses = () => {
    const statuses: PageStatus[] = [];

    // Helper function to check if a page is a CMS page
    // Checks both non-hierarchical and hierarchical slug formats
    const isPageInCMS = (slug: string, url: string): boolean => {
      // Direct slug match
      if (cmsPages.has(slug)) return true;
      
      // Check for hierarchical slug match by extracting from URL
      if (url && url !== '#') {
        const urlParts = url.split('/').filter(Boolean);
        // Try various hierarchical combinations
        for (let i = 0; i < urlParts.length; i++) {
          const hierarchicalSlug = urlParts.slice(i).join('/');
          if (cmsPages.has(hierarchicalSlug)) return true;
        }
      }
      
      return false;
    };

    // Static pages (hardcoded, not in navigation structure)
    const staticPages = [
      { slug: 'index', title: 'Homepage', url: '/', isStatic: true },
      { slug: 'downloads', title: 'Downloads', url: '/downloads', isStatic: true },
      { slug: 'events', title: 'Events', url: '/events', isStatic: true },
      { slug: 'news', title: 'News', url: '/news', isStatic: true },
      { slug: 'contact', title: 'Contact', url: '/contact', isStatic: true },
      { slug: 'styleguide', title: 'Styleguide', url: '/styleguide', isStatic: false },
    ];

    staticPages.forEach(page => {
      const pageId = pageIdMap.get(page.slug);
      statuses.push({
        ...page,
        isCMS: isPageInCMS(page.slug, page.url),
        pageId,
        hasCta: pageId !== undefined && ctaPageIds.has(pageId),
      });
    });

    // Styleguide pages from page_registry
    styleguideRegistryPages.forEach(page => {
      // Skip if already added as static page
      if (page.slug === 'styleguide') return;
      
      const url = `/${page.slug}`;
      statuses.push({
        slug: page.slug,
        title: page.title,
        url: url,
        isCMS: isPageInCMS(page.slug, url),
        isStatic: false,
        pageId: page.pageId,
      });
    });

    // Your Solution (industries in data structure)
    Object.entries(navigationData.industries).forEach(([categoryName, category]: [string, any]) => {
      // Special mapping for categories that have different slugs in the database
      const slugMapping: Record<string, string> = {
        'photo-video': 'photography',
      };
      
      // Add main category page
      let categorySlug = categoryName
        .toLowerCase()
        .replace(/\s*&\s*/g, '-')  // Replace " & " with single "-"
        .replace(/\s+/g, '-')       // Replace spaces with "-"
        .replace(/-+/g, '-');       // Replace multiple "-" with single "-"
      
      // Apply mapping if exists
      categorySlug = slugMapping[categorySlug] || categorySlug;
      
      const categoryUrl = `/your-solution/${categorySlug}`;
      
      statuses.push({
        slug: categorySlug,
        title: categoryName,
        url: categoryUrl,
        isCMS: isPageInCMS(categorySlug, categoryUrl),
        isStatic: false,
        category: 'Your Solution',
        subcategory: categoryName,
        isMainCategory: true,
        pageId: pageIdMap.get(categorySlug),
      });
      
      // Add subpages
      category.subgroups.forEach((subgroup: any) => {
        const slug = extractSlugFromUrl(subgroup.link);
        
        // Include all pages, even those with '#' link (show as not created)
        const displaySlug = slug || `${categorySlug}-${subgroup.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        statuses.push({
          slug: displaySlug,
          title: subgroup.name,
          url: subgroup.link,
          isCMS: slug ? isPageInCMS(slug, subgroup.link) : false,
          isStatic: false,
          category: 'Your Solution',
          subcategory: categoryName,
          isMainCategory: false,
          pageId: pageIdMap.get(displaySlug),
        });
      });
    });

    // Products
    Object.entries(navigationData.products).forEach(([categoryName, category]: [string, any]) => {
      // Add main category page
      const categorySlug = categoryName
        .toLowerCase()
        .replace(/\s*&\s*/g, '-')  // Replace " & " with single "-"
        .replace(/\s+/g, '-')       // Replace spaces with "-"
        .replace(/-+/g, '-');       // Replace multiple "-" with single "-"
      const categoryUrl = `/products/${categorySlug}`;
      
      statuses.push({
        slug: categorySlug,
        title: categoryName,
        url: categoryUrl,
        isCMS: isPageInCMS(categorySlug, categoryUrl),
        isStatic: false,
        category: 'Products',
        subcategory: categoryName,
        isMainCategory: true,
        pageId: pageIdMap.get(categorySlug),
      });
      
      // Add subpages
      category.subgroups.forEach((subgroup: any) => {
        const slug = extractSlugFromUrl(subgroup.link);
        
        // Include all pages, even those with '#' link (show as not created)
        const displaySlug = slug || `${categorySlug}-${subgroup.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        statuses.push({
          slug: displaySlug,
          title: subgroup.name,
          url: subgroup.link,
          isCMS: slug ? isPageInCMS(slug, subgroup.link) : false,
          isStatic: false,
          category: 'Products',
          subcategory: categoryName,
          isMainCategory: false,
          pageId: pageIdMap.get(displaySlug),
        });
      });
    });

    // Solutions
    Object.entries(navigationData.solutions).forEach(([categoryName, category]: [string, any]) => {
      if (category.solutions) {
        category.solutions.forEach((solution: any) => {
          const slug = extractSlugFromUrl(solution.link);
          
          const displaySlug = slug || `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${solution.name.toLowerCase().replace(/\s+/g, '-')}`;
          
          statuses.push({
            slug: displaySlug,
            title: solution.name,
            url: solution.link,
            isCMS: slug ? isPageInCMS(slug, solution.link) : false,
            isStatic: false,
            category: 'Solutions',
            subcategory: categoryName,
            pageId: pageIdMap.get(displaySlug),
          });
        });
      }
      if (category.services) {
        category.services.forEach((service: any) => {
          const slug = extractSlugFromUrl(service.link);
          
          const displaySlug = slug || `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${service.name.toLowerCase().replace(/\s+/g, '-')}`;
          
          statuses.push({
            slug: displaySlug,
            title: service.name,
            url: service.link,
            isCMS: slug ? isPageInCMS(slug, service.link) : false,
            isStatic: false,
            category: 'Solutions',
            subcategory: categoryName,
            pageId: pageIdMap.get(displaySlug),
          });
        });
      }
    });

    setPageStatuses(statuses);
  };

  const getItemClassName = (status: PageStatus) => {
    if (status.isCMS) {
      return "text-[#f9dc24] font-semibold bg-gray-900"; // Yellow - CMS pages
    }
    if (status.isStatic) {
      return "text-gray-500 bg-gray-900"; // Gray - Static pages
    }
    return "text-gray-300 bg-gray-900"; // Light gray - Not yet created
  };

  const getPageIdForStatus = (status: { slug: string; title: string }) => {
    // Try multiple matching strategies
    
    // 1. Direct slug lookup
    let pageId = pageIdMap.get(status.slug);
    if (pageId !== undefined) return pageId;
    
    // 2. Normalized title lookup
    const normalizedTitle = status.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    pageId = pageIdMap.get(`title:${normalizedTitle}`);
    if (pageId !== undefined) return pageId;
    
    // 3. Partial slug matching (for displaySlug mismatches)
    // Extract last 2-3 parts of slug and try partial match
    const slugParts = status.slug.split('-');
    if (slugParts.length > 1) {
      const lastTwoParts = slugParts.slice(-2).join('-');
      pageId = pageIdMap.get(`partial:${lastTwoParts}`);
      if (pageId !== undefined) return pageId;
      
      const lastThreeParts = slugParts.slice(-3).join('-');
      pageId = pageIdMap.get(`partial:${lastThreeParts}`);
      if (pageId !== undefined) return pageId;
    }
    
    return undefined;
  };

  const getItemLabel = (status: PageStatus) => {
    let label = status.title;
    const pageId = status.pageId ?? getPageIdForStatus(status);
    if (pageId !== undefined) {
      label += ` [${pageId}]`;
      if (ctaPageIds.has(pageId)) {
        label += " • CTA";
      }
    }
    if (status.isCMS) {
      label += " ✓";
    }
    return label;
  };

  // Group by main category and subcategory
  const static_pages = filteredStatuses.filter(p => p.isStatic);
  const styleGuidePages = filteredStatuses.filter(p => p.slug.startsWith('styleguide'));
  
  // Group Your Solution by subcategory
  const yourSolutionPages = filteredStatuses.filter(p => p.category === 'Your Solution');
  const yourSolutionBySubcat = yourSolutionPages.reduce((acc, page) => {
    const subcat = page.subcategory || 'Other';
    if (!acc[subcat]) acc[subcat] = [];
    acc[subcat].push(page);
    return acc;
  }, {} as Record<string, PageStatus[]>);

  // Group Products by subcategory
  const productsPages = filteredStatuses.filter(p => p.category === 'Products');
  const productsBySubcat = productsPages.reduce((acc, page) => {
    const subcat = page.subcategory || 'Other';
    if (!acc[subcat]) acc[subcat] = [];
    acc[subcat].push(page);
    return acc;
  }, {} as Record<string, PageStatus[]>);

  // Group Solutions by subcategory
  const solutionsPages = filteredStatuses.filter(p => p.category === 'Solutions');
  const solutionsBySubcat = solutionsPages.reduce((acc, page) => {
    const subcat = page.subcategory || 'Other';
    if (!acc[subcat]) acc[subcat] = [];
    acc[subcat].push(page);
    return acc;
  }, {} as Record<string, PageStatus[]>);

  const handleClearSelection = () => {
    onValueChange("");
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="flex-1 bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-[#f9dc24] transition-all duration-200">
          <SelectValue placeholder="Select a page to edit...">
            {value ? (
              (() => {
                // Find matching page status for display
                const matchingStatus = pageStatuses.find(s => 
                  s.slug === value || 
                  s.slug.endsWith(`/${value}`) ||
                  s.slug.split('/').pop() === value
                );
                if (matchingStatus) {
                  return getItemLabel(matchingStatus);
                }
                // Fallback: show the value itself with page ID if available
                const pageId = pageIdMap.get(value);
                return pageId ? `${value} [${pageId}]` : value;
              })()
            ) : "Select a page to edit..."}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700 max-h-[600px] w-[700px] z-50 shadow-2xl">
          {/* Search Bar */}
          <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search: Page ID, Name, Category, or Slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent Select from capturing keyboard events
                  e.stopPropagation();
                }}
                autoFocus
                className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#f9dc24] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Found {filteredStatuses.length} page{filteredStatuses.length !== 1 ? 's' : ''}
                </div>
                {filteredStatuses.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Sorted by relevance
                  </div>
                )}
              </div>
            )}
          </div>

          {/* No Results Message */}
          {searchQuery && filteredStatuses.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 space-y-3">
                <div className="text-lg font-medium">No pages found</div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Try searching for:</p>
                  <ul className="list-none space-y-1">
                    <li>• Page ID (e.g., "207", "9")</li>
                    <li>• Page name (e.g., "Photography", "Automotive")</li>
                    <li>• Partial name (e.g., "photo", "auto")</li>
                    <li>• Category (e.g., "products", "solution")</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          {filteredStatuses.length > 0 && (
            <>
              {/* Static Pages */}
              {static_pages.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 bg-gray-800/50">
                    Static Pages
                  </SelectLabel>
                  {static_pages.map((status) => (
                    <SelectItem 
                      key={status.slug} 
                      value={status.slug}
                      className={`${getItemClassName(status)} hover:bg-gray-800 px-3 py-2.5 cursor-pointer transition-colors text-sm`}
                    >
                      {getItemLabel(status)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}

        {/* Your Solution */}
        {Object.keys(yourSolutionBySubcat).length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2 bg-gray-800/50">
              Your Solution
            </SelectLabel>
            {Object.entries(yourSolutionBySubcat).map(([subcategory, pages]) => {
              const mainPage = pages.find(p => p.isMainCategory);
              const subPages = pages.filter(p => !p.isMainCategory);
              
              return (
                <div key={subcategory}>
                  <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {subcategory}
                  </div>
                  {mainPage && (
                    <SelectItem 
                      key={mainPage.slug} 
                      value={mainPage.slug}
                      className={`${getItemClassName(mainPage)} hover:bg-gray-800 pl-8 pr-3 py-2.5 cursor-pointer transition-colors text-sm font-medium`}
                    >
                      {getItemLabel(mainPage)} (Overview)
                    </SelectItem>
                  )}
                  {subPages.map((status) => (
                    <SelectItem 
                      key={status.slug} 
                      value={status.slug}
                      className={`${getItemClassName(status)} hover:bg-gray-800 pl-12 pr-3 py-2 cursor-pointer transition-colors text-sm`}
                    >
                      {getItemLabel(status)}
                    </SelectItem>
                  ))}
                </div>
              );
            })}
          </SelectGroup>
        )}

        {/* Products */}
        {Object.keys(productsBySubcat).length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2 bg-gray-800/50">
              Products
            </SelectLabel>
            {Object.entries(productsBySubcat).map(([subcategory, pages]) => {
              const mainPage = pages.find(p => p.isMainCategory);
              const subPages = pages.filter(p => !p.isMainCategory);
              
              return (
                <div key={subcategory}>
                  <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {subcategory}
                  </div>
                  {mainPage && (
                    <SelectItem 
                      key={mainPage.slug} 
                      value={mainPage.slug}
                      className={`${getItemClassName(mainPage)} hover:bg-gray-800 pl-8 pr-3 py-2.5 cursor-pointer transition-colors text-sm font-medium`}
                    >
                      {getItemLabel(mainPage)} (Overview)
                    </SelectItem>
                  )}
                  {subPages.map((status) => (
                    <SelectItem 
                      key={status.slug} 
                      value={status.slug}
                      className={`${getItemClassName(status)} hover:bg-gray-800 pl-12 pr-3 py-2 cursor-pointer transition-colors text-sm`}
                    >
                      {getItemLabel(status)}
                    </SelectItem>
                  ))}
                </div>
              );
            })}
          </SelectGroup>
        )}

        {/* Solutions */}
        {Object.keys(solutionsBySubcat).length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2 bg-gray-800/50">
              Solutions & Services
            </SelectLabel>
            {Object.entries(solutionsBySubcat).map(([subcategory, pages]) => (
              <div key={subcategory}>
                <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {subcategory}
                </div>
                {pages.map((status) => (
                  <SelectItem 
                    key={status.slug} 
                    value={status.slug}
                    className={`${getItemClassName(status)} hover:bg-gray-800 pl-10 pr-3 py-2 cursor-pointer transition-colors text-sm`}
                  >
                    {getItemLabel(status)}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectGroup>
        )}

              {/* Styleguide */}
              {styleGuidePages.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2 bg-gray-800/50">
                    Styleguide
                  </SelectLabel>
                  {styleGuidePages.map((status) => (
                    <SelectItem 
                      key={status.slug} 
                      value={status.slug}
                      className={`${getItemClassName(status)} hover:bg-gray-800 px-3 py-2.5 cursor-pointer transition-colors text-sm`}
                    >
                      {getItemLabel(status)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}

            </>
          )}

          {/* Legend */}
        <div className="px-4 py-4 border-t border-gray-700 bg-gray-950 text-xs space-y-2 mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f9dc24]"></div>
              <span className="text-[#f9dc24] font-semibold">✓</span>
            </div>
            <span className="text-gray-400">CMS Page (editable)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            </div>
            <span className="text-gray-400">Static Page</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
            <span className="text-gray-400">Not yet created</span>
          </div>
        </div>
      </SelectContent>
      </Select>
      
      {/* Clear Selection / Back to Dashboard Button */}
      <Button
        onClick={handleClearSelection}
        variant="outline"
        size="icon"
        className="bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-[#f9dc24] text-white"
        title="Back to Dashboard Overview"
      >
        <Home className="h-4 w-4" />
      </Button>
    </div>
  );
};
