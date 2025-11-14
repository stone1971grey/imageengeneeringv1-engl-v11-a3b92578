import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigationData } from "@/hooks/useNavigationData";
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
}

export const HierarchicalPageSelect = ({ value, onValueChange }: HierarchicalPageSelectProps) => {
  const navigationData = useNavigationData();
  const [cmsPages, setCmsPages] = useState<Set<string>>(new Set());
  const [pageStatuses, setPageStatuses] = useState<PageStatus[]>([]);

  useEffect(() => {
    loadCMSPages();
  }, []);

  useEffect(() => {
    if (cmsPages.size > 0) {
      buildPageStatuses();
    }
  }, [cmsPages, navigationData]);

  const loadCMSPages = async () => {
    const { data } = await supabase
      .from('segment_registry')
      .select('page_slug')
      .eq('deleted', false);

    if (data) {
      const uniqueSlugs = new Set(data.map(item => item.page_slug));
      console.log('Loaded CMS pages:', Array.from(uniqueSlugs));
      setCmsPages(uniqueSlugs);
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

    // Static pages (hardcoded, not in navigation structure)
    const staticPages = [
      { slug: 'index', title: 'Homepage', url: '/', isStatic: true },
      { slug: 'downloads', title: 'Downloads', url: '/downloads', isStatic: true },
      { slug: 'events', title: 'Events', url: '/events', isStatic: true },
      { slug: 'news', title: 'News', url: '/news', isStatic: true },
      { slug: 'contact', title: 'Contact', url: '/contact', isStatic: true },
    ];

    staticPages.forEach(page => {
      statuses.push({
        ...page,
        isCMS: cmsPages.has(page.slug),
      });
    });

    // Your Solution (industries in data structure)
    Object.entries(navigationData.industries).forEach(([categoryName, category]: [string, any]) => {
      // Add main category page
      const categorySlug = categoryName
        .toLowerCase()
        .replace(/\s*&\s*/g, '-')  // Replace " & " with single "-"
        .replace(/\s+/g, '-')       // Replace spaces with "-"
        .replace(/-+/g, '-');       // Replace multiple "-" with single "-"
      const categoryUrl = `/your-solution/${categorySlug}`;
      
      console.log(`Category: ${categoryName} -> Slug: ${categorySlug}, isCMS: ${cmsPages.has(categorySlug)}`);
      
      statuses.push({
        slug: categorySlug,
        title: categoryName,
        url: categoryUrl,
        isCMS: cmsPages.has(categorySlug),
        isStatic: false,
        category: 'Your Solution',
        subcategory: categoryName,
        isMainCategory: true,
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
          isCMS: slug ? cmsPages.has(slug) : false,
          isStatic: false,
          category: 'Your Solution',
          subcategory: categoryName,
          isMainCategory: false,
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
        isCMS: cmsPages.has(categorySlug),
        isStatic: false,
        category: 'Products',
        subcategory: categoryName,
        isMainCategory: true,
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
          isCMS: slug ? cmsPages.has(slug) : false,
          isStatic: false,
          category: 'Products',
          subcategory: categoryName,
          isMainCategory: false,
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
            isCMS: slug ? cmsPages.has(slug) : false,
            isStatic: false,
            category: 'Solutions',
            subcategory: categoryName,
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
            isCMS: slug ? cmsPages.has(slug) : false,
            isStatic: false,
            category: 'Solutions',
            subcategory: categoryName,
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

  const getItemLabel = (status: PageStatus) => {
    let label = status.title;
    if (status.isCMS) {
      label += " ✓";
    }
    return label;
  };

  // Group by main category and subcategory
  const static_pages = pageStatuses.filter(p => p.isStatic);
  
  // Group Your Solution by subcategory
  const yourSolutionPages = pageStatuses.filter(p => p.category === 'Your Solution');
  const yourSolutionBySubcat = yourSolutionPages.reduce((acc, page) => {
    const subcat = page.subcategory || 'Other';
    if (!acc[subcat]) acc[subcat] = [];
    acc[subcat].push(page);
    return acc;
  }, {} as Record<string, PageStatus[]>);

  // Group Products by subcategory
  const productsPages = pageStatuses.filter(p => p.category === 'Products');
  const productsBySubcat = productsPages.reduce((acc, page) => {
    const subcat = page.subcategory || 'Other';
    if (!acc[subcat]) acc[subcat] = [];
    acc[subcat].push(page);
    return acc;
  }, {} as Record<string, PageStatus[]>);

  // Group Solutions by subcategory
  const solutionsPages = pageStatuses.filter(p => p.category === 'Solutions');
  const solutionsBySubcat = solutionsPages.reduce((acc, page) => {
    const subcat = page.subcategory || 'Other';
    if (!acc[subcat]) acc[subcat] = [];
    acc[subcat].push(page);
    return acc;
  }, {} as Record<string, PageStatus[]>);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[700px] bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-[#f9dc24] transition-all duration-200">
        <SelectValue placeholder="Select a page to edit..." />
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-700 max-h-[600px] w-[700px] z-50 shadow-2xl">
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
  );
};
