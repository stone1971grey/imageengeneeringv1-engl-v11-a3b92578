// CMS Page Creation Utilities
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { INDUSTRY_PARENT_CATEGORY_BY_SLUG } from './AdminConstants';

interface CreateCMSPageParams {
  slug: string;
  languages: string[];
  userId: string;
  isEditor: boolean;
  isAdmin: boolean;
  language: string;
  navigationData: any;
  addAllowedPage: (slug: string) => void;
  navigate: (path: string) => void;
  setIsCreatingCMS: (creating: boolean) => void;
  setIsCreateCMSDialogOpen: (open: boolean) => void;
  setSelectedPageForCMS: (slug: string) => void;
}

// Helper function to infer parent from navigation structure
async function inferParentFromNavigation(slug: string, navigationData: any) {
  if (!navigationData) return { parent_id: null, parent_slug: null };

  const findParentFromUrl = async (link: string) => {
    if (!link || link === '#') return null;
    
    const parts = link.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const last = parts[parts.length - 1];
    if (last !== slug) return null;

    if (parts.length === 2) {
      const topLevel = parts[0];
      const { data } = await supabase
        .from('page_registry')
        .select('page_id, page_slug')
        .eq('page_slug', topLevel)
        .maybeSingle();
      return data ? { parent_id: data.page_id, parent_slug: data.page_slug } : null;
    } else if (parts.length >= 3) {
      const potentialParentSlugs = [
        parts.slice(0, -1).join('/'),
        parts[parts.length - 2],
      ];
      
      for (const potentialSlug of potentialParentSlugs) {
        const { data } = await supabase
          .from('page_registry')
          .select('page_id, page_slug')
          .eq('page_slug', potentialSlug)
          .maybeSingle();
        if (data) {
          return { parent_id: data.page_id, parent_slug: data.page_slug };
        }
      }
    }
    
    return null;
  };

  const allCategories = [
    ...(Object.values(navigationData.industries || {}) as any[]),
    ...(Object.values(navigationData.products || {}) as any[]),
    ...(Object.values(navigationData.solutions || {}) as any[]),
    ...(Object.values(navigationData.targetGroups || {}) as any[]),
    ...(Object.values(navigationData.testServices || {}) as any[]),
  ];

  for (const category of allCategories) {
    if (category.link) {
      const result = await findParentFromUrl(category.link);
      if (result) return result;
    }

    const subgroups = category.subgroups || category.services || [];
    for (const subgroup of subgroups) {
      const result = await findParentFromUrl(subgroup.link);
      if (result) return result;
    }
  }

  return { parent_id: null, parent_slug: null };
}

// Create a new CMS page with the given slug
export async function createNewCMSPageWithSlug(params: CreateCMSPageParams): Promise<void> {
  const {
    slug,
    languages,
    userId,
    isEditor,
    isAdmin,
    language,
    addAllowedPage,
    navigate,
    setIsCreatingCMS,
    setIsCreateCMSDialogOpen,
    setSelectedPageForCMS,
  } = params;

  if (!slug || !userId) {
    toast.error("Please provide a valid slug");
    return;
  }

  if (!isAdmin) {
    toast.error("Only admins can create new CMS pages.");
    return;
  }

  setIsCreatingCMS(true);
  toast("Starting CMS page creation...");
  
  try {
    // Parse slug to extract parent and child
    const slugParts = slug.split('/').filter(Boolean);
    const childSlug = slugParts[slugParts.length - 1];
    const parentSlug = slugParts.length > 1 ? slugParts.slice(0, -1).join('/') : null;

    // Get highest page_id
    const { data: maxPage } = await supabase
      .from("page_registry")
      .select("page_id")
      .order("page_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPageId = (maxPage?.page_id || 0) + 1;

    let parent_id: number | null = null;
    let parent_slug_value: string | null = null;

    // If there's a parent, validate it exists
    if (parentSlug) {
      const { data: parentPage } = await supabase
        .from('page_registry')
        .select('page_id, page_slug')
        .or(`page_slug.eq.${parentSlug},page_slug.ilike.%/${parentSlug}`)
        .maybeSingle();

      if (!parentPage) {
        toast.error(`Parent page "${parentSlug}" not found. Create parent first.`);
        setIsCreatingCMS(false);
        return;
      }

      parent_id = parentPage.page_id;
      parent_slug_value = (parentPage.page_slug !== 'index') ? parentPage.page_slug : null;
    }

    // Generate page title from child slug
    const pageTitle = childSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // Create page_registry entry
    const { data: newPageData, error: insertError } = await supabase
      .from("page_registry")
      .insert({
        page_id: nextPageId,
        page_slug: slug,
        page_title: pageTitle,
        parent_id,
        parent_slug: parent_slug_value,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating page_registry entry:", insertError);
      toast.error("Failed to create page registry entry");
      setIsCreatingCMS(false);
      return;
    }

    toast.success("✅ Page registry entry created!");

    // Get highest segment_id
    const { data: maxSegment } = await supabase
      .from("segment_registry")
      .select("segment_id")
      .order("segment_id", { ascending: false})
      .limit(1)
      .maybeSingle();

    const baseSegmentId = (maxSegment?.segment_id || 0) + 1;

    // Create segment_registry entry for footer
    const segmentEntries = [
      { page_slug: slug, segment_key: 'footer', segment_id: baseSegmentId, segment_type: 'footer', is_static: true, deleted: false, position: 999 },
    ];

    const { error: segmentError } = await supabase
      .from("segment_registry")
      .insert(segmentEntries);

    if (segmentError) throw segmentError;

    toast.success("✅ Segment registry created!");

    // Create page_content entries
    const contentEntries = [
      { page_slug: slug, section_key: 'tab_order', content_type: 'json', content_value: '["footer"]' },
      { page_slug: slug, section_key: 'page_segments', content_type: 'json', content_value: '[]' },
      { page_slug: slug, section_key: 'seo_settings', content_type: 'json', content_value: JSON.stringify({
        title: `${pageTitle} | Image Engineering`,
        description: '',
        canonical: `https://www.image-engineering.de/${slug}`,
        robotsIndex: true,
        robotsFollow: true
      }) },
    ];

    const { error: contentError } = await supabase
      .from("page_content")
      .insert(contentEntries);

    if (contentError) throw contentError;

    toast.success("✅ Page content initialized!");

    // Automatically create navigation_links entries
    const industryParentCategory = parent_slug_value
      ? INDUSTRY_PARENT_CATEGORY_BY_SLUG[parent_slug_value]
      : undefined;

    if (industryParentCategory) {
      try {
        const navigationRows = languages.map((lang) => ({
          category: 'industries',
          language: lang,
          active: true,
          position: 0,
          slug: `/${slug}`,
          label_key: `industries.${industryParentCategory}.${pageTitle}`,
          parent_category: industryParentCategory,
          parent_label: pageTitle,
          description: '',
          icon_key: null,
        }));

        const { error: navError } = await supabase
          .from('navigation_links')
          .insert(navigationRows as any);

        if (navError) {
          console.error('[createNewCMSPageWithSlug] Error creating navigation_links:', navError);
        } else {
          toast.success('✅ Navigation entry created – page is now visible in Your Solution flyout');
        }
      } catch (navErr) {
        console.error('[createNewCMSPageWithSlug] Unexpected navigation_links error:', navErr);
      }
    }

    // Grant editor access if needed
    if (isEditor && !isAdmin) {
      await supabase
        .from("editor_page_access")
        .insert({ user_id: userId, page_slug: slug });
      addAllowedPage(slug);
    }

    // Success notification
    toast.success(
      <div className="space-y-2">
        <p className="font-bold">🎉 Page Created Successfully ID {nextPageId}</p>
        <p className="text-sm">Page is fully configured and immediately available.</p>
        <p className="text-sm"><strong>URL:</strong> /{slug}</p>
        <p className="text-sm"><strong>Languages:</strong> {languages.join(', ')}</p>
      </div>,
      {
        duration: 5000,
      }
    );

    setIsCreateCMSDialogOpen(false);
    setSelectedPageForCMS("");
    
    // Trigger refresh
    window.dispatchEvent(new Event('refreshPageSelector'));
    
    // Navigate to new page in admin
    navigate(`/${language}/admin-dashboard?page=${encodeURIComponent(childSlug)}`);
      
  } catch (error: any) {
    console.error("Error creating CMS page:", error);
    toast.error(`Failed to create CMS page: ${error.message}`);
  } finally {
    setIsCreatingCMS(false);
  }
}

// Legacy function for creating CMS page from selected page
export async function createNewCMSPage(params: {
  selectedPageForCMS: string;
  userId: string;
  isAdmin: boolean;
  isEditor: boolean;
  language: string;
  navigationData: any;
  addAllowedPage: (slug: string) => void;
  navigate: (path: string) => void;
  setIsCreatingCMS: (creating: boolean) => void;
  setIsCreateCMSDialogOpen: (open: boolean) => void;
  setSelectedPageForCMS: (slug: string) => void;
}): Promise<void> {
  const {
    selectedPageForCMS,
    userId,
    isAdmin,
    isEditor,
    language,
    navigationData,
    addAllowedPage,
    navigate,
    setIsCreatingCMS,
    setIsCreateCMSDialogOpen,
    setSelectedPageForCMS,
  } = params;

  if (!selectedPageForCMS || !userId) {
    toast.error("Please select a page");
    return;
  }

  if (!isAdmin) {
    toast.error("Only admins can create new CMS pages.");
    return;
  }

  setIsCreatingCMS(true);
  toast("Step 1: Start CMS page creation");
  
  try {
    // 1. Ensure page exists in page_registry
    let { data: pageInfo } = await supabase
      .from("page_registry")
      .select("page_id, page_title, page_slug, parent_id, parent_slug")
      .or(`page_slug.eq.${selectedPageForCMS},page_slug.ilike.%/${selectedPageForCMS}`)
      .maybeSingle();

    if (!pageInfo) {
      toast("Step 2: Page not in registry, creating entry");
      console.log("Page not in registry, creating entry...");

      const { data: maxPage } = await supabase
        .from("page_registry")
        .select("page_id")
        .order("page_id", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPageId = (maxPage?.page_id || 0) + 1;

      let parent_id: number | null = null;
      let parent_slug: string | null = null;

      const inferred = await inferParentFromNavigation(selectedPageForCMS, navigationData);
      parent_id = inferred.parent_id;
      parent_slug = inferred.parent_slug;

      if (!parent_id) {
        const { data: yourSolutionParent } = await supabase
          .from("page_registry")
          .select("page_id, page_slug")
          .eq("page_slug", "your-solution")
          .maybeSingle();

        if (yourSolutionParent) {
          parent_id = yourSolutionParent.page_id;
          parent_slug = yourSolutionParent.page_slug;
        }
      }

      const inferredTitle = selectedPageForCMS
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      let hierarchicalSlug = selectedPageForCMS;
      
      if (parent_slug) {
        if (parent_slug.includes('/')) {
          hierarchicalSlug = `${parent_slug}/${selectedPageForCMS}`;
        } else {
          const { data: parentPage } = await supabase
            .from('page_registry')
            .select('page_slug, parent_slug')
            .eq('page_slug', parent_slug)
            .maybeSingle();

          if (parentPage?.parent_slug && parentPage.parent_slug !== 'index') {
            hierarchicalSlug = `${parentPage.parent_slug}/${parent_slug}/${selectedPageForCMS}`;
          } else {
            hierarchicalSlug = `${parent_slug}/${selectedPageForCMS}`;
          }
        }
      }

      const { data: newPageData, error: insertError } = await supabase
        .from("page_registry")
        .insert({
          page_id: nextPageId,
          page_slug: hierarchicalSlug,
          page_title: inferredTitle,
          parent_id,
          parent_slug,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating page_registry entry:", insertError);
        toast.error("Failed to create page registry entry");
        setIsCreatingCMS(false);
        return;
      }

      pageInfo = newPageData;
      toast.success("✅ Page registry entry created!");
    }

    // 2. Find highest segment_id
    const { data: maxSegment } = await supabase
      .from("segment_registry")
      .select("segment_id")
      .order("segment_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const baseId = (maxSegment?.segment_id || 0) + 1;

    // 3. Create segment_registry entry for footer
    const finalSlug = pageInfo.page_slug;
    
    const segmentEntries = [
      { page_slug: finalSlug, segment_key: 'footer', segment_id: baseId, segment_type: 'footer', is_static: true, deleted: false, position: 999 },
    ];

    const { error: segmentError } = await supabase
      .from("segment_registry")
      .insert(segmentEntries);

    if (segmentError) throw segmentError;

    // 4. Create page_content entries
    const contentEntries = [
      { page_slug: finalSlug, section_key: 'tab_order', content_type: 'json', content_value: '["footer"]' },
      { page_slug: finalSlug, section_key: 'page_segments', content_type: 'json', content_value: '[]' },
      { page_slug: finalSlug, section_key: 'seo_settings', content_type: 'json', content_value: JSON.stringify({
        title: `${pageInfo.page_title} | Image Engineering`,
        description: '',
        canonical: `https://www.image-engineering.de/${finalSlug}`,
        robotsIndex: true,
        robotsFollow: true
      }) },
    ];

    const { error: contentError } = await supabase
      .from("page_content")
      .insert(contentEntries);

    if (contentError) throw contentError;

    // 5. Grant editor access if needed
    if (isEditor && !isAdmin && userId) {
      const { error: accessError } = await supabase
        .from("editor_page_access")
        .insert({
          user_id: userId,
          page_slug: finalSlug,
        });

      if (accessError) {
        console.error("Error granting editor access to new page:", accessError);
      } else {
        addAllowedPage(finalSlug);
      }
    }

    // 6. Build hierarchical URL
    const hierarchicalUrl = `/${pageInfo.page_slug}`;

    toast.success(
      <div className="space-y-2">
        <p className="font-bold">🎉 Page Created Successfully ID {pageInfo.page_id}</p>
        <p className="text-sm">Die Seite ist vollständig eingerichtet und sofort verfügbar.</p>
        <p className="text-sm"><strong>URL:</strong> {hierarchicalUrl}</p>
      </div>,
      {
        duration: 5000,
      }
    );

    setIsCreateCMSDialogOpen(false);
    setSelectedPageForCMS("");
    
    window.dispatchEvent(new Event('refreshPageSelector'));
    navigate(`/${language}/admin-dashboard?page=${encodeURIComponent(pageInfo.page_slug)}`);
    
  } catch (error: any) {
    console.error("Error creating CMS page:", error);
    toast.error(`Failed to create CMS page: ${error.message}`);
  } finally {
    setIsCreatingCMS(false);
  }
}
