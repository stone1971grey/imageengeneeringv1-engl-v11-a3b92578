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

    // Industries
    Object.entries(navigationData.industries).forEach(([categoryName, category]: [string, any]) => {
      category.subgroups.forEach((subgroup: any) => {
        if (!subgroup.link || subgroup.link === '#') return;
        
        const slug = extractSlugFromUrl(subgroup.link);
        if (!slug) return;

        statuses.push({
          slug,
          title: `${categoryName} → ${subgroup.name}`,
          url: subgroup.link,
          isCMS: cmsPages.has(slug),
          isStatic: false,
        });
      });
    });

    // Products
    Object.entries(navigationData.products).forEach(([categoryName, category]: [string, any]) => {
      category.subgroups.forEach((subgroup: any) => {
        if (!subgroup.link || subgroup.link === '#') return;
        
        const slug = extractSlugFromUrl(subgroup.link);
        if (!slug) return;

        statuses.push({
          slug,
          title: `${categoryName} → ${subgroup.name}`,
          url: subgroup.link,
          isCMS: cmsPages.has(slug),
          isStatic: false,
        });
      });
    });

    // Solutions
    Object.entries(navigationData.solutions).forEach(([categoryName, category]: [string, any]) => {
      if (category.solutions) {
        category.solutions.forEach((solution: any) => {
          if (!solution.link || solution.link === '#') return;
          
          const slug = extractSlugFromUrl(solution.link);
          if (!slug) return;

          statuses.push({
            slug,
            title: `${categoryName} → ${solution.name}`,
            url: solution.link,
            isCMS: cmsPages.has(slug),
            isStatic: false,
          });
        });
      }
      if (category.services) {
        category.services.forEach((service: any) => {
          if (!service.link || service.link === '#') return;
          
          const slug = extractSlugFromUrl(service.link);
          if (!slug) return;

          statuses.push({
            slug,
            title: `${categoryName} → ${service.name}`,
            url: service.link,
            isCMS: cmsPages.has(slug),
            isStatic: false,
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

  // Group by main category
  const groupedStatuses = {
    static: pageStatuses.filter(p => p.isStatic),
    industries: pageStatuses.filter(p => !p.isStatic && p.title.includes('→') && 
      Object.keys(navigationData.industries).some(cat => p.title.startsWith(cat))),
    products: pageStatuses.filter(p => !p.isStatic && p.title.includes('→') && 
      Object.keys(navigationData.products).some(cat => p.title.startsWith(cat))),
    solutions: pageStatuses.filter(p => !p.isStatic && p.title.includes('→') && 
      Object.keys(navigationData.solutions).some(cat => p.title.startsWith(cat))),
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[450px] bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-[#f9dc24] transition-all duration-200">
        <SelectValue placeholder="Select a page to edit..." />
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-700 max-h-[600px] z-50 shadow-2xl">
        {/* Static Pages */}
        {groupedStatuses.static.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
              Static Pages
            </SelectLabel>
            {groupedStatuses.static.map((status) => (
              <SelectItem 
                key={status.slug} 
                value={status.slug}
                className={`${getItemClassName(status)} hover:bg-gray-800 px-3 py-2.5 cursor-pointer transition-colors`}
              >
                {getItemLabel(status)}
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* Industries */}
        {groupedStatuses.industries.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2">
              Industries
            </SelectLabel>
            {groupedStatuses.industries.map((status) => (
              <SelectItem 
                key={status.slug} 
                value={status.slug}
                className={`${getItemClassName(status)} hover:bg-gray-800 px-3 py-2.5 cursor-pointer transition-colors`}
              >
                {getItemLabel(status)}
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* Products */}
        {groupedStatuses.products.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2">
              Products
            </SelectLabel>
            {groupedStatuses.products.map((status) => (
              <SelectItem 
                key={status.slug} 
                value={status.slug}
                className={`${getItemClassName(status)} hover:bg-gray-800 px-3 py-2.5 cursor-pointer transition-colors`}
              >
                {getItemLabel(status)}
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {/* Solutions */}
        {groupedStatuses.solutions.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2">
              Solutions
            </SelectLabel>
            {groupedStatuses.solutions.map((status) => (
              <SelectItem 
                key={status.slug} 
                value={status.slug}
                className={`${getItemClassName(status)} hover:bg-gray-800 px-3 py-2.5 cursor-pointer transition-colors`}
              >
                {getItemLabel(status)}
              </SelectItem>
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
