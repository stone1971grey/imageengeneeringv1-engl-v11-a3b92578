import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { LogOut, Save, Plus, Trash2, X, GripVertical, Eye, Copy, MousePointer, Layers, Pencil, PlayCircle, Upload } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import lovableIcon from "@/assets/lovable-icon.png";
import lovableLogo from "@/assets/lovable-logo.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigationData } from "@/hooks/useNavigationData";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MetaNavigationEditor from '@/components/admin/MetaNavigationEditor';
import ProductHeroGalleryEditor from '@/components/admin/ProductHeroGalleryEditor';
import FeatureOverviewEditor from '@/components/admin/FeatureOverviewEditor';
import TableEditor from '@/components/admin/TableEditor';
import FAQEditor from '@/components/admin/FAQEditor';
import { VideoSegmentEditor } from '@/components/admin/VideoSegmentEditor';
import { SEOEditor } from '@/components/admin/SEOEditor';
import SpecificationEditor from '@/components/admin/SpecificationEditor';
import NewsSegmentEditor from '@/components/admin/NewsSegmentEditor';
import BannerEditor from '@/components/admin/BannerEditor';
import { FullHeroEditor } from '@/components/admin/FullHeroEditor';
import IntroEditor from '@/components/admin/IntroEditor';
import { IndustriesSegmentEditor } from '@/components/admin/IndustriesSegmentEditor';
import { CopySegmentDialog } from '@/components/admin/CopySegmentDialog';
import { HierarchicalPageSelect } from '@/components/admin/HierarchicalPageSelect';
import { useAdminAutosave, loadAutosavedData, clearAutosavedData, hasAutosavedData } from '@/hooks/useAdminAutosave';
import { ImageMetadata, extractImageMetadata, formatFileSize, formatUploadDate } from '@/types/imageMetadata';
import NewsEditor from '@/components/admin/NewsEditor';

// Type definitions for CMS content structures
interface TileItem {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
  metadata?: ImageMetadata;
}

interface BannerImage {
  imageUrl: string;
  altText: string;
  metadata?: ImageMetadata;
}

interface SolutionItem {
  imageUrl: string;
  title: string;
  description: string;
  metadata?: ImageMetadata;
}

interface ContentItem {
  id: string;
  section_key: string;
  content_type: string;
  content_value: string;
}

interface SortableTabProps {
  id: string;
  value: string;
  children: React.ReactNode;
  isDraggable?: boolean;
}

const SortableTab = ({ id, value, children, isDraggable = true }: SortableTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDraggable ? 'grab' : 'default',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <TabsTrigger 
        value={value}
        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black flex-1"
      >
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div {...attributes} {...listeners}>
              <GripVertical className="h-4 w-4 text-gray-500" />
            </div>
          )}
          {children}
        </div>
      </TabsTrigger>
    </div>
  );
};

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const navigationData = useNavigationData();
  
  // Static segment IDs - these are fixed and never change
  const STATIC_SEGMENT_IDS = {
    hero: 1,
    tiles: 2, 
    banner: 3,
    solutions: 4
  };
  
  // Get selected page from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const selectedPage = searchParams.get('page') || '';
  const [resolvedPageSlug, setResolvedPageSlug] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [tilesColumns, setTilesColumns] = useState<string>("3");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImageMetadata, setHeroImageMetadata] = useState<ImageMetadata | null>(null);
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroImageDimensions, setHeroImageDimensions] = useState<'600x600' | '800x600' | '1200x800' | '1920x1080'>('600x600');
  const [heroCropPosition, setHeroCropPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerSubtext, setBannerSubtext] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [bannerButtonText, setBannerButtonText] = useState<string>("");
  const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
  const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
  const [solutionsTitle, setSolutionsTitle] = useState<string>("");
  const [solutionsSubtext, setSolutionsSubtext] = useState<string>("");
  const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col");
  const [solutionsItems, setSolutionsItems] = useState<any[]>([]);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [copyHeroDialogOpen, setCopyHeroDialogOpen] = useState(false);
  const [copyTilesDialogOpen, setCopyTilesDialogOpen] = useState(false);
  const [copyBannerDialogOpen, setCopyBannerDialogOpen] = useState(false);
  const [copySolutionsDialogOpen, setCopySolutionsDialogOpen] = useState(false);
  const [copyFooterDialogOpen, setCopyFooterDialogOpen] = useState(false);
  const [availablePages, setAvailablePages] = useState<Array<{ page_slug: string; page_title: string }>>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [nextSegmentId, setNextSegmentId] = useState<number>(5); // Start from 5 after static segments (1-4)
  const [segmentTabStates, setSegmentTabStates] = useState<Record<string, string>>({});
  const [footerCtaTitle, setFooterCtaTitle] = useState<string>("");
  const [footerCtaDescription, setFooterCtaDescription] = useState<string>("");
  const [footerContactHeadline, setFooterContactHeadline] = useState<string>("");
  const [footerContactSubline, setFooterContactSubline] = useState<string>("");
  const [footerContactDescription, setFooterContactDescription] = useState<string>("");
  const [footerTeamImageUrl, setFooterTeamImageUrl] = useState<string>("");
  const [footerTeamImageMetadata, setFooterTeamImageMetadata] = useState<ImageMetadata | null>(null);
  const [footerTeamQuote, setFooterTeamQuote] = useState<string>("");
  const [footerTeamName, setFooterTeamName] = useState<string>("");
  const [footerTeamTitle, setFooterTeamTitle] = useState<string>("");
  const [footerButtonText, setFooterButtonText] = useState<string>("");
  const [segmentRegistry, setSegmentRegistry] = useState<Record<string, number>>({});
  const [isSEOEditorOpen, setIsSEOEditorOpen] = useState(false);
  const [seoData, setSeoData] = useState<any>({
    title: '',
    metaDescription: '',
    slug: selectedPage,
    canonical: '',
    robotsIndex: 'index',
    robotsFollow: 'follow',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image'
  });
  const [isCreateCMSDialogOpen, setIsCreateCMSDialogOpen] = useState(false);
  const [selectedPageForCMS, setSelectedPageForCMS] = useState<string>("");
  const [isCreatingCMS, setIsCreatingCMS] = useState(false);

  // Autosave for Hero section - only saves to localStorage
  useAdminAutosave({
    key: `${selectedPage}_hero`,
    data: {
      content: {
        hero_title: content.hero_title,
        hero_subtitle: content.hero_subtitle,
        hero_description: content.hero_description,
        hero_cta: content.hero_cta
      },
      heroImagePosition,
      heroLayout,
      heroTopPadding,
      heroCtaLink,
      heroCtaStyle,
      heroImageUrl,
      heroImageMetadata
    },
    enabled: !!user && (isAdmin || isEditor)
  });

  // Autosave for Tiles/Applications section
  useAdminAutosave({
    key: `${selectedPage}_tiles`,
    data: {
      applications,
      tilesColumns,
      content: {
        applications_title: content.applications_title,
        applications_description: content.applications_description
      }
    },
    enabled: !!user && (isAdmin || isEditor)
  });

  // Autosave for Banner section
  useAdminAutosave({
    key: `${selectedPage}_banner`,
    data: {
      bannerTitle,
      bannerSubtext,
      bannerImages,
      bannerButtonText,
      bannerButtonLink,
      bannerButtonStyle
    },
    enabled: !!user && (isAdmin || isEditor)
  });

  // Autosave for Solutions/Image & Text section
  useAdminAutosave({
    key: `${selectedPage}_solutions`,
    data: {
      solutionsTitle,
      solutionsSubtext,
      solutionsLayout,
      solutionsItems
    },
    enabled: !!user && (isAdmin || isEditor)
  });

  // Autosave for Footer section
  useAdminAutosave({
    key: `${selectedPage}_footer`,
    data: {
      footerCtaTitle,
      footerCtaDescription,
      footerContactHeadline,
      footerContactSubline,
      footerContactDescription,
      footerTeamQuote,
      footerTeamName,
      footerTeamTitle,
      footerButtonText
    },
    enabled: !!user && (isAdmin || isEditor)
  });

  // Autosave for SEO settings
  useAdminAutosave({
    key: `${selectedPage}_seo`,
    data: seoData,
    enabled: !!user && (isAdmin || isEditor)
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkUserAccess();
    }
  }, [user]);

  // Load available pages once on mount for Copy functionality
  useEffect(() => {
    if (user && (isAdmin || isEditor)) {
      loadAvailablePages();
    }
  }, [user, isAdmin, isEditor]);

  const loadAvailablePages = async () => {
    const { data: registryData } = await supabase
      .from('segment_registry')
      .select('page_slug')
      .eq('deleted', false);

    if (registryData) {
      const cmsPages = [...new Set(registryData.map(item => item.page_slug))];
      const pageTitleMap: Record<string, string> = {
        'photography': 'Photo & Video',
        'scanners-archiving': 'Scanners & Archiving',
        'medical-endoscopy': 'Medical & Endoscopy',
        'web-camera': 'Web Camera',
        'machine-vision': 'Machine Vision',
        'mobile-phone': 'Mobile Phone',
        'automotive': 'Automotive',
        'in-cabin-testing': 'In-Cabin Testing',
        'le7': 'LE7 Test Chart',
        'your-solution': 'Your Solution',
        'iq-led': 'iQ-LED Illumination'
      };
      
      const pageList = cmsPages
        .map(slug => ({
          page_slug: slug,
          page_title: pageTitleMap[slug] || slug
        }))
        .sort((a, b) => a.page_title.localeCompare(b.page_title));
      
      setAvailablePages(pageList);
    }
  };

  useEffect(() => {
    if (user && (isAdmin || isEditor)) {
      // Reset all state when changing pages
      setHeroImageUrl("");
      setHeroImageMetadata(null);
      setHeroImagePosition("right");
      setHeroLayout("2-5");
      setHeroTopPadding("medium");
      setHeroCtaLink("#applications-start");
      setHeroCtaStyle("standard");
      setBannerTitle("");
      setBannerSubtext("");
      setBannerImages([]);
      setBannerButtonText("");
      setBannerButtonLink("");
      setBannerButtonStyle("standard");
      setSolutionsTitle("");
      setSolutionsSubtext("");
      setSolutionsLayout("2-col");
      setSolutionsItems([]);
      setApplications([]);
      setTilesColumns("3");
      setPageSegments([]);
      setTabOrder([]);
      setSegmentRegistry({}); // Reset segment registry to prevent cross-page ID contamination
      setFooterCtaTitle("");
      setFooterCtaDescription("");
      setFooterContactHeadline("");
      setFooterContactSubline("");
      setFooterContactDescription("");
      setFooterTeamImageUrl("");
      setFooterTeamQuote("");
      setFooterTeamName("");
      setFooterTeamTitle("");
      setFooterButtonText("");
      setContent({});
      setSeoData({
        title: '',
        metaDescription: '',
        slug: selectedPage,
        canonical: '',
        robotsIndex: 'index',
        robotsFollow: 'follow',
        focusKeyword: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterCard: 'summary_large_image'
      });
      
      // First, load segment registry to get all segment IDs
      loadSegmentRegistry().then(() => {
        // Then calculate global max segment ID across all pages
        calculateGlobalMaxSegmentId().then(() => {
          // Finally load content for current page
          loadContent();
        });
      });
    }
  }, [user, selectedPage, isAdmin, isEditor]);

  // Sync tabOrder with pageSegments - ensure consistency
  useEffect(() => {
    if (!user || !selectedPage || pageSegments.length === 0) return;
    
    // Get all current segment IDs from pageSegments (excluding ONLY meta-navigation which is fixed-position)
    // IMPORTANT: full-hero MUST be included in tab_order to be rendered!
    const segmentIds = pageSegments
      .filter(seg => seg.type !== 'meta-navigation')
      .map(seg => seg.id);
    
    // Remove deleted/non-existent segments from tabOrder
    const validTabOrder = tabOrder.filter(id => segmentIds.includes(id));
    
    // Add any new segments that aren't in tabOrder yet (append to end)
    const missingSegments = segmentIds.filter(id => !validTabOrder.includes(id));
    
    // Only update if there are actual changes needed
    const hasChanges = missingSegments.length > 0 || validTabOrder.length !== tabOrder.length;
    
    if (hasChanges) {
      const newOrder = [...validTabOrder, ...missingSegments];
      
      // Check if the order is actually different before updating
      const isDifferent = JSON.stringify(newOrder) !== JSON.stringify(tabOrder);
      
      if (isDifferent) {
        console.log("Updating tabOrder due to segment changes:", { old: tabOrder, new: newOrder });
        setTabOrder(newOrder);
        
        // Save to database
        supabase
          .from("page_content")
          .upsert({
            page_slug: selectedPage,
            section_key: "tab_order",
            content_type: "json",
            content_value: JSON.stringify(newOrder),
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key'
          });
      }
    }
  }, [pageSegments, selectedPage, user, tabOrder]);

  const checkUserAccess = async () => {
    if (!user) return;
    
    // Check if user is admin
    const { data: adminData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminData) {
      setIsAdmin(true);
      setIsEditor(false);
      setAllowedPages([]); // Admins have access to all pages
      setLoading(false);
      return;
    }

    // Check if user is editor
    const { data: editorData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "editor")
      .maybeSingle();

    if (editorData) {
      // Get editor's allowed pages
      const { data: pageAccessData, error: pageAccessError } = await supabase
        .from("editor_page_access")
        .select("page_slug")
        .eq("user_id", user.id);

      if (pageAccessError || !pageAccessData || pageAccessData.length === 0) {
        toast.error("You don't have access to any pages");
        navigate("/");
        return;
      }

      const pages = pageAccessData.map(p => p.page_slug);
      
      setIsEditor(true);
      setIsAdmin(false);
      setAllowedPages(pages);
      
      // Redirect to first allowed page if current page is not in allowed pages
      if (pages.length > 0 && !pages.includes(selectedPage)) {
        navigate(`/admin-dashboard?page=${pages[0]}`);
      }
      
      setLoading(false);
      return;
    }

    // No valid role found
    toast.error("You don't have admin or editor access");
    navigate("/");
  };

  
  // Helper function to resolve non-hierarchical slug to full hierarchical slug
  const resolvePageSlug = async (slug: string): Promise<string> => {
    if (!slug) return slug;
    
    // Try to find full hierarchical slug in page_registry
    const { data: pageData } = await supabase
      .from('page_registry')
      .select('page_slug')
      .or(`page_slug.eq.${slug},page_slug.like.%/${slug}`)
      .maybeSingle();
    
    if (pageData) {
      console.log(`🔍 Resolved slug "${slug}" to "${pageData.page_slug}"`);
      setResolvedPageSlug(pageData.page_slug); // Store resolved slug
      return pageData.page_slug;
    }
    
    setResolvedPageSlug(slug); // Use original if not found
    return slug;
  };

  // Load segment registry to get all segment IDs
  // IMPORTANT: Only load non-deleted segments (deleted=false or deleted IS NULL)
  // to prevent showing deleted segments, but keep their IDs in registry forever
  const loadSegmentRegistry = async () => {
    try {
      const querySlug = await resolvePageSlug(selectedPage);
      
      const { data, error } = await supabase
        .from("segment_registry")
        .select("*")
        .eq("page_slug", querySlug)
        .or("deleted.is.null,deleted.eq.false"); // Only load active segments

      if (error) {
        console.error("Error loading segment registry:", error);
        return;
      }

      // Create a map of segment_key to segment_id
      const registry: Record<string, number> = {};
      // Create a reverse map of segment_id to segment_key for dynamic labels
      const reverseRegistry: Record<string, string> = {};
      data?.forEach((item: any) => {
        registry[item.segment_key] = item.segment_id;
        reverseRegistry[String(item.segment_id)] = item.segment_key;
      });

      setSegmentRegistry(registry);
      // Store reverse registry in a separate state or use it directly below
      (window as any).__segmentKeyRegistry = reverseRegistry;
      console.log("✅ Loaded segment registry for", querySlug, ":", registry);
    } catch (error) {
      console.error("Error loading segment registry:", error);
    }
  };

  // Calculate the maximum segment ID across ALL pages to ensure global uniqueness
  const calculateGlobalMaxSegmentId = async () => {
    try {
      // Query segment_registry to get the highest segment_id
      const { data, error } = await supabase
        .from("segment_registry")
        .select("segment_id")
        .order("segment_id", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error fetching global max segment ID:", error);
        setNextSegmentId(18); // Default to 18 (after initial 17 segments)
        return;
      }

      const globalMaxId = data?.segment_id || 17;
      const nextId = globalMaxId + 1;
      setNextSegmentId(nextId);
      console.log("✅ Global max segment ID:", globalMaxId, "| Next available ID:", nextId);
    } catch (error) {
      console.error("Error calculating global max segment ID:", error);
      setNextSegmentId(18); // Default to 18 if error
    }
  };

  const createNewCMSPage = async () => {
    if (!selectedPageForCMS || !user) {
      toast.error("Please select a page");
      return;
    }

    setIsCreatingCMS(true);
    
    try {
      // 1. Ensure page exists in page_registry; create entry if missing
      let { data: pageInfo } = await supabase
        .from("page_registry")
        .select("page_id, page_title, page_slug, parent_id, parent_slug")
        .eq("page_slug", selectedPageForCMS)
        .maybeSingle();

      if (!pageInfo) {
        console.log("Page not in registry, creating entry...");

        // Get highest page_id to generate next ID
        const { data: maxPage } = await supabase
          .from("page_registry")
          .select("page_id")
          .order("page_id", { ascending: false })
          .limit(1)
          .maybeSingle();

        const nextPageId = (maxPage?.page_id || 0) + 1;

        // Infer parent info based on navigation structure first
        let parent_id: number | null = null;
        let parent_slug: string | null = null;

        const inferParentFromNavigation = async (slug: string) => {
          if (!navigationData) return { parent_id: null, parent_slug: null };

          // Helper to find parent info from hierarchical URL
          const findParentFromUrl = async (link: string) => {
            if (!link || link === '#') return null;
            
            const parts = link.split('/').filter(Boolean);
            if (parts.length < 2) return null;
            const last = parts[parts.length - 1];
            if (last !== slug) return null;

            // Extract parent slug from URL path
            // For /your-solution/automotive/adas → parent is 'automotive' 
            // For /your-solution/automotive → parent is 'your-solution'
            // For /products/test-charts/le7 → parent is 'test-charts'
            if (parts.length === 2) {
              // Direct child of top-level category (e.g., /your-solution/automotive)
              const topLevel = parts[0];
              const { data } = await supabase
                .from('page_registry')
                .select('page_id, page_slug')
                .eq('page_slug', topLevel)
                .maybeSingle();
              return data ? { parent_id: data.page_id, parent_slug: data.page_slug } : null;
            } else if (parts.length >= 3) {
              // Multi-level hierarchy (e.g., /your-solution/automotive/adas)
              // Parent could be hierarchical slug like 'your-solution/automotive' or just 'automotive'
              const potentialParentSlugs = [
                parts.slice(0, -1).join('/'),  // Full hierarchical: 'your-solution/automotive'
                parts[parts.length - 2],        // Just immediate parent: 'automotive'
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

          // Search in all navigation categories
          const allCategories = [
            ...(Object.values(navigationData.industries || {}) as any[]),
            ...(Object.values(navigationData.products || {}) as any[]),
            ...(Object.values(navigationData.solutions || {}) as any[]),
            ...(Object.values(navigationData.targetGroups || {}) as any[]),
            ...(Object.values(navigationData.testServices || {}) as any[]),
          ];

          for (const category of allCategories) {
            // Check main category link
            if (category.link) {
              const result = await findParentFromUrl(category.link);
              if (result) return result;
            }

            // Check subgroups
            const subgroups = category.subgroups || category.services || [];
            for (const subgroup of subgroups) {
              const result = await findParentFromUrl(subgroup.link);
              if (result) return result;
            }
          }

          return { parent_id: null, parent_slug: null };
        };

        const inferred = await inferParentFromNavigation(selectedPageForCMS);
        parent_id = inferred.parent_id;
        parent_slug = inferred.parent_slug;

        // Fallback: attach under "your-solution" if nothing inferred
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

        // Generate hierarchical page_slug based on parent relationship
        let hierarchicalSlug = selectedPageForCMS;
        
        if (parent_slug) {
          // If parent_slug is already hierarchical (contains '/'), just append
          if (parent_slug.includes('/')) {
            hierarchicalSlug = `${parent_slug}/${selectedPageForCMS}`;
          } else {
            // Look up parent page to see if it has its own parent_slug (e.g. your-solution → automotive)
            const { data: parentPage } = await supabase
              .from('page_registry')
              .select('page_slug, parent_slug')
              .eq('page_slug', parent_slug)
              .maybeSingle();

            if (parentPage?.parent_slug) {
              // Build full hierarchy, e.g. your-solution/automotive/geometric-calibration-automotive
              hierarchicalSlug = `${parentPage.parent_slug}/${parent_slug}/${selectedPageForCMS}`;
            } else {
              // Simple parent/child, e.g. products/test-charts
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

      // 3. Create segment_registry entry for footer only (UDA approach)
      // Use hierarchical slug from pageInfo
      const finalSlug = pageInfo.page_slug;
      
      const segmentEntries = [
        { page_slug: finalSlug, segment_key: 'footer', segment_id: baseId, segment_type: 'footer', is_static: true, deleted: false, position: 999 },
      ];

      const { error: segmentError } = await supabase
        .from("segment_registry")
        .insert(segmentEntries);

      if (segmentError) throw segmentError;

      // 4. Create page_content entries (UDA structure: only tab_order, page_segments, seo_settings)
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

      // 5. Build hierarchical URL from page_slug (which is now already hierarchical)
      const hierarchicalUrl = `/${pageInfo.page_slug}`;

      toast.success(`✅ Backend erstellt! Starte automatisches Frontend-Setup...`, {
        duration: 3000,
      });

      // 6. AUTO-UPDATE APP.TSX - Add route
      // This will be handled by a separate function call after this completes
      
      // Show success
      toast.success(
        <div className="space-y-2">
          <p className="font-bold">🎉 CMS-Seite erfolgreich erstellt!</p>
          <p className="text-sm">Die Seite ist vollständig eingerichtet und sofort verfügbar.</p>
          <p className="text-sm"><strong>URL:</strong> {hierarchicalUrl}</p>
        </div>,
        {
          duration: 8000,
        }
      );

      setIsCreateCMSDialogOpen(false);
      setSelectedPageForCMS("");
      
      // Trigger refresh of page selector dropdown
      window.dispatchEvent(new Event('refreshPageSelector'));
      
      // Extract last part of slug for navigation (HierarchicalPageSelect works with non-hierarchical slugs)
      const slugParts = pageInfo.page_slug.split('/').filter(Boolean);
      const lastSlugPart = slugParts[slugParts.length - 1];
      
      // Navigate to the newly created page
      setTimeout(() => {
        navigate(`/admin-dashboard?page=${encodeURIComponent(lastSlugPart)}`);
      }, 300);
      
    } catch (error: any) {
      console.error("Error creating CMS page:", error);
      toast.error(`Failed to create CMS page: ${error.message}`);
    } finally {
      setIsCreatingCMS(false);
    }
  };

  const loadContent = async () => {
    const querySlug = await resolvePageSlug(selectedPage);
    
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", querySlug);

    if (error) {
      toast.error("Error loading content");
      return;
    }

    const contentMap: Record<string, string> = {};
    let apps: any[] = [];

    data?.forEach((item: ContentItem) => {
      if (item.section_key === "applications_items") {
        apps = JSON.parse(item.content_value);
      } else if (item.section_key === "tiles_columns") {
        setTilesColumns(item.content_value || "3");
      } else if (item.section_key === "solutions_title") {
        setSolutionsTitle(item.content_value);
      } else if (item.section_key === "solutions_subtext") {
        setSolutionsSubtext(item.content_value);
      } else if (item.section_key === "solutions_layout") {
        setSolutionsLayout(item.content_value || "2-col");
      } else if (item.section_key === "solutions_items") {
        setSolutionsItems(JSON.parse(item.content_value));
      } else if (item.section_key === "banner_images") {
        setBannerImages(JSON.parse(item.content_value));
      } else if (item.section_key === "banner_title") {
        setBannerTitle(item.content_value);
      } else if (item.section_key === "banner_subtext") {
        setBannerSubtext(item.content_value);
      } else if (item.section_key === "banner_button_text") {
        setBannerButtonText(item.content_value);
      } else if (item.section_key === "banner_button_link") {
        setBannerButtonLink(item.content_value);
      } else if (item.section_key === "banner_button_style") {
        setBannerButtonStyle(item.content_value || "standard");
      } else if (item.section_key === "hero_image_url") {
        setHeroImageUrl(item.content_value);
      } else if (item.section_key === "hero_image_metadata") {
        try {
          const metadata = JSON.parse(item.content_value);
          setHeroImageMetadata(metadata);
        } catch (e) {
          console.error("Error parsing hero image metadata:", e);
        }
      } else if (item.section_key === "hero_image_position") {
        setHeroImagePosition(item.content_value || "right");
      } else if (item.section_key === "hero_layout") {
        setHeroLayout(item.content_value || "2-5");
      } else if (item.section_key === "hero_top_padding") {
        setHeroTopPadding(item.content_value || "medium");
      } else if (item.section_key === "hero_cta_link") {
        setHeroCtaLink(item.content_value || "#applications-start");
      } else if (item.section_key === "hero_cta_style") {
        setHeroCtaStyle(item.content_value || "standard");
      } else if (item.section_key === "page_segments") {
        try {
          const segments = JSON.parse(item.content_value);
          console.log('Loading page_segments for', selectedPage, ':', segments);
          
          let needsUpdate = false;
          let segmentsWithIds: any[] = [];
          
          // Only process non-empty segments array
          if (segments && segments.length > 0) {
            // CRITICAL: Log raw segments before sorting
            console.log('[POSITION DEBUG] Raw segments before sorting:', JSON.stringify(segments.map(s => ({ id: s.id, type: s.type, position: s.position }))));
            
            // CRITICAL: Robust sort by position with fallback to original array order
            const sortedSegments = [...segments].sort((a, b) => {
              const posA = typeof a.position === 'number' ? a.position : 999;
              const posB = typeof b.position === 'number' ? b.position : 999;
              
              // If positions are equal or both undefined, maintain original order by using array index
              if (posA === posB) {
                return segments.indexOf(a) - segments.indexOf(b);
              }
              return posA - posB;
            });
            
            console.log('[POSITION DEBUG] Sorted segments:', JSON.stringify(sortedSegments.map(s => ({ id: s.id, type: s.type, position: s.position }))));
            
            // Ensure all segments have numeric IDs from segment_registry
            segmentsWithIds = sortedSegments.map((seg: any, idx: number) => {
              console.log('Processing segment:', seg);
              if (!seg.id || typeof seg.id !== 'number' && !seg.id.match(/^\d+$/)) {
                needsUpdate = true;
                // Find this segment's ID from segmentRegistry
                const registryKey = `${selectedPage}-${seg.type || 'unknown'}`;
                const registryId = segmentRegistry[registryKey];
                return {
                  ...seg,
                  id: registryId || String(nextSegmentId + idx),
                  position: idx // ALWAYS use sorted array index for stable positions
                };
              }
              return {
                ...seg,
                position: idx // ALWAYS use sorted array index for stable positions
              };
            });
            
            console.log('[POSITION DEBUG] Final segments with positions:', JSON.stringify(segmentsWithIds.map(s => ({ id: s.id, type: s.type, position: s.position }))));
            
            console.log('Final segmentsWithIds (sorted):', segmentsWithIds);
            setPageSegments(segmentsWithIds);
          } else {
            // Empty segments array - this is normal for pages with only static segments
            console.log('No dynamic segments for', selectedPage);
            setPageSegments([]);
          }
          
          // If we added IDs, save back to database immediately
          if (needsUpdate && user) {
            console.log("Updating segments with numeric IDs:", segmentsWithIds);
            supabase
              .from("page_content")
              .upsert({
                page_slug: selectedPage,
                section_key: "page_segments",
                content_type: "json",
                content_value: JSON.stringify(segmentsWithIds),
                updated_at: new Date().toISOString(),
                updated_by: user.id
              }, {
                onConflict: 'page_slug,section_key'
              })
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating segment IDs:", error);
                } else {
                  console.log("Segment IDs updated successfully");
                }
              });
          }
          
          // Note: Global max ID is already calculated in calculateGlobalMaxSegmentId()
        } catch {
          setPageSegments([]);
        }
      } else if (item.section_key === "tab_order") {
        try {
          const order = JSON.parse(item.content_value);
          
          // Get valid segment IDs from segment_registry (excluding deleted)
          const reverseRegistry = (window as any).__segmentKeyRegistry || {};
          const validSegmentIds = Object.keys(reverseRegistry);
          
          // Filter out deleted segments - tabId is a segment_id string like "197"
          const validOrder = (order || []).filter((tabId: string) => {
            return validSegmentIds.includes(tabId);
          });
          
          // If we filtered anything out, save the cleaned tab_order back to database
          if (validOrder.length !== order.length && user) {
            console.log("🧹 Cleaning tab_order: Removed deleted segments", {
              original: order,
              cleaned: validOrder,
              validSegmentIds
            });
            supabase
              .from("page_content")
              .upsert({
                page_slug: selectedPage,
                section_key: "tab_order",
                content_type: "json",
                content_value: JSON.stringify(validOrder),
                updated_at: new Date().toISOString(),
                updated_by: user.id
              }, {
                onConflict: 'page_slug,section_key'
              });
          }
          
          setTabOrder(validOrder.length > 0 ? validOrder : []);
          
          // Set activeTab to first available tab if not already set or if current tab is invalid
          if (validOrder.length > 0 && (!activeTab || !validOrder.includes(activeTab))) {
            setActiveTab(validOrder[0]);
          }
        } catch {
          setTabOrder([]);
        }
      } else if (item.section_key === "footer_cta_title") {
        setFooterCtaTitle(item.content_value);
      } else if (item.section_key === "footer_cta_description") {
        setFooterCtaDescription(item.content_value);
      } else if (item.section_key === "footer_contact_headline") {
        setFooterContactHeadline(item.content_value);
      } else if (item.section_key === "footer_contact_subline") {
        setFooterContactSubline(item.content_value);
      } else if (item.section_key === "footer_contact_description") {
        setFooterContactDescription(item.content_value);
      } else if (item.section_key === "footer_team_image_url") {
        setFooterTeamImageUrl(item.content_value);
      } else if (item.section_key === "footer_team_quote") {
        setFooterTeamQuote(item.content_value);
      } else if (item.section_key === "footer_team_name") {
        setFooterTeamName(item.content_value);
      } else if (item.section_key === "footer_team_title") {
        setFooterTeamTitle(item.content_value);
      } else if (item.section_key === "footer_button_text") {
        setFooterButtonText(item.content_value);
      } else if (item.section_key === "seo_settings") {
        try {
          const seoSettings = JSON.parse(item.content_value);
          setSeoData({
            ...seoData,
            ...seoSettings,
            slug: seoSettings.slug || selectedPage
          });
        } catch {
          // Keep default SEO data
        }
      } else {
        contentMap[item.section_key] = item.content_value;
      }
    });

    setContent(contentMap);
    setApplications(apps);
    
    // SAFETY CHECK: If tab_order is empty but page_segments exist, rebuild tab_order
    // This prevents the "empty page" bug when segments are accidentally removed from tab_order
    if (tabOrder.length === 0 && pageSegments.length > 0) {
      console.log("🚨 SAFETY CHECK: tab_order is empty but segments exist. Rebuilding tab_order...");
      
      // Build tab_order from existing segments (exclude meta-navigation and full-hero)
      const rebuiltTabOrder = pageSegments
        .filter(seg => seg.type !== 'meta-navigation' && seg.type !== 'full-hero')
        .map(seg => seg.id);
      
      if (rebuiltTabOrder.length > 0 && user) {
        // Save the rebuilt tab_order to database
        supabase
          .from("page_content")
          .upsert({
            page_slug: selectedPage,
            section_key: "tab_order",
            content_type: "json",
            content_value: JSON.stringify(rebuiltTabOrder),
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key'
          })
          .then(({ error }) => {
            if (!error) {
              console.log("✅ tab_order successfully rebuilt:", rebuiltTabOrder);
              setTabOrder(rebuiltTabOrder);
            }
          });
      }
    }
    
    // Check for autosaved data and restore if available
    setTimeout(() => {
      restoreAutosavedDataIfAvailable();
    }, 100);
  };
  
  const restoreAutosavedDataIfAvailable = () => {
    const autosaveKey = `${selectedPage}`;
    
    // Check each section for autosaved data
    const sections = ['hero', 'tiles', 'banner', 'solutions', 'footer', 'seo'];
    let hasAnyAutosave = false;
    
    sections.forEach(section => {
      if (hasAutosavedData(`${autosaveKey}_${section}`)) {
        hasAnyAutosave = true;
        const data = loadAutosavedData(`${autosaveKey}_${section}`);
        
        // Restore the data for this section
        if (section === 'hero' && data) {
          if (data.content) setContent(prev => ({ ...prev, ...data.content }));
          if (data.heroImagePosition) setHeroImagePosition(data.heroImagePosition);
          if (data.heroLayout) setHeroLayout(data.heroLayout);
          if (data.heroTopPadding) setHeroTopPadding(data.heroTopPadding);
          if (data.heroCtaLink) setHeroCtaLink(data.heroCtaLink);
          if (data.heroCtaStyle) setHeroCtaStyle(data.heroCtaStyle);
          if (data.heroImageUrl) setHeroImageUrl(data.heroImageUrl);
          if (data.heroImageMetadata) setHeroImageMetadata(data.heroImageMetadata);
        } else if (section === 'tiles' && data) {
          if (data.applications) setApplications(data.applications);
          if (data.content) setContent(prev => ({ ...prev, ...data.content }));
        } else if (section === 'banner' && data) {
          if (data.bannerTitle) setBannerTitle(data.bannerTitle);
          if (data.bannerSubtext) setBannerSubtext(data.bannerSubtext);
          if (data.bannerImages) setBannerImages(data.bannerImages);
          if (data.bannerButtonText) setBannerButtonText(data.bannerButtonText);
          if (data.bannerButtonLink) setBannerButtonLink(data.bannerButtonLink);
          if (data.bannerButtonStyle) setBannerButtonStyle(data.bannerButtonStyle);
        } else if (section === 'solutions' && data) {
          if (data.solutionsTitle) setSolutionsTitle(data.solutionsTitle);
          if (data.solutionsSubtext) setSolutionsSubtext(data.solutionsSubtext);
          if (data.solutionsLayout) setSolutionsLayout(data.solutionsLayout);
          if (data.solutionsItems) setSolutionsItems(data.solutionsItems);
        } else if (section === 'footer' && data) {
          if (data.footerCtaTitle) setFooterCtaTitle(data.footerCtaTitle);
          if (data.footerCtaDescription) setFooterCtaDescription(data.footerCtaDescription);
          if (data.footerContactHeadline) setFooterContactHeadline(data.footerContactHeadline);
          if (data.footerContactSubline) setFooterContactSubline(data.footerContactSubline);
          if (data.footerContactDescription) setFooterContactDescription(data.footerContactDescription);
          if (data.footerTeamQuote) setFooterTeamQuote(data.footerTeamQuote);
          if (data.footerTeamName) setFooterTeamName(data.footerTeamName);
          if (data.footerTeamTitle) setFooterTeamTitle(data.footerTeamTitle);
          if (data.footerButtonText) setFooterButtonText(data.footerButtonText);
        } else if (section === 'seo' && data) {
          setSeoData(prev => ({ ...prev, ...data }));
        }
      }
    });
    
    if (hasAnyAutosave) {
      toast.info("Restored unsaved changes from previous session", {
        duration: 5000,
      });
    }
  };

  const cropHeroImage = async (file: File, dimensions: string, position: 'top' | 'center' | 'bottom'): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const [targetWidth, targetHeight] = dimensions.split('x').map(Number);
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (targetWidth - scaledWidth) / 2;
        
        let y: number;
        switch (position) {
          case 'top':
            y = 0;
            break;
          case 'bottom':
            y = targetHeight - scaledHeight;
            break;
          case 'center':
          default:
            y = (targetHeight - scaledHeight) / 2;
            break;
        }

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.92);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      // Crop the image first
      const croppedBlob = await cropHeroImage(file, heroImageDimensions, heroCropPosition);
      const croppedFile = new File([croppedBlob], file.name, { type: 'image/jpeg' });

      const fileExt = 'jpg';
      const fileName = `${selectedPage}-hero-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload cropped image to storage
      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, croppedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract image metadata from cropped file
      const baseMetadata = await extractImageMetadata(croppedFile, publicUrl);
      const metadata: ImageMetadata = { ...baseMetadata, altText: '' };
      
      setHeroImageUrl(publicUrl);
      setHeroImageMetadata(metadata);
      
      // Save URL to database
      const { error: dbError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "hero_image_url",
          content_type: "image_url",
          content_value: publicUrl,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (dbError) throw dbError;

      // Save metadata to database
      const { error: metadataError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "hero_image_metadata",
          content_type: "json",
          content_value: JSON.stringify(metadata),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (metadataError) throw metadataError;

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tileIndex: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `tile-${tileIndex}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract image metadata
      const metadata = await extractImageMetadata(file, publicUrl);

      // Update applications array with URL and metadata
      const newApps = [...applications];
      newApps[tileIndex].imageUrl = publicUrl;
      newApps[tileIndex].metadata = { ...metadata, altText: '' };
      setApplications(newApps);

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleDeleteStaticSegment = async (segmentType: 'hero' | 'tiles' | 'banner' | 'solutions') => {
    if (!user) return;
    
    setSaving(true);
    try {
      let sectionKeys: string[] = [];
      
      switch (segmentType) {
        case 'hero':
          sectionKeys = ['hero_title', 'hero_subtitle', 'hero_description', 'hero_cta', 'hero_image_url', 'hero_image_position', 'hero_layout', 'hero_top_padding', 'hero_cta_link', 'hero_cta_style'];
          break;
        case 'tiles':
          sectionKeys = ['applications_title', 'applications_description', 'applications_items'];
          break;
        case 'banner':
          sectionKeys = ['banner_title', 'banner_subtext', 'banner_images', 'banner_button_text', 'banner_button_link', 'banner_button_style'];
          break;
        case 'solutions':
          sectionKeys = ['solutions_title', 'solutions_subtext', 'solutions_layout', 'solutions_items'];
          break;
      }

      // CRITICAL: Mark segment as deleted in registry instead of removing it
      // This ensures the segment_id is NEVER reused, even after deletion
      const { error: registryError } = await supabase
        .from("segment_registry")
        .update({ deleted: true })
        .eq("segment_key", segmentType)
        .eq("page_slug", selectedPage);

      if (registryError) {
        console.error("Error marking segment as deleted in registry:", registryError);
        throw registryError;
      }

      const { error } = await supabase
        .from("page_content")
        .delete()
        .eq("page_slug", selectedPage)
        .in("section_key", sectionKeys);

      if (error) throw error;

      // Remove from tab order
      const updatedTabOrder = tabOrder.filter(id => id !== segmentType);
      
      // Save updated tab order
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      setTabOrder(updatedTabOrder);
      toast.success("Segment deleted successfully! (ID will never be reused)");
      
      // Reload content
      await loadContent();
      
      // Switch to first available tab
      setActiveTab("hero");
    } catch (error: any) {
      toast.error("Error deleting segment: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tabOrder.indexOf(active.id as string);
    const newIndex = tabOrder.indexOf(over.id as string);

    const newOrder = arrayMove(tabOrder, oldIndex, newIndex);
    setTabOrder(newOrder);

    // Save new order to database
    try {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(newOrder),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key'
        });
    } catch (error: any) {
      toast.error("Error saving tab order: " + error.message);
    }
  };

  const handleSaveHero = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // Update hero fields using upsert to handle both new and existing entries
      const heroFields = ['hero_title', 'hero_subtitle', 'hero_description', 'hero_cta'];
      
      for (const key of heroFields) {
        if (content[key] !== undefined) {
          const { error } = await supabase
            .from("page_content")
            .upsert({
              page_slug: selectedPage,
              section_key: key,
              content_type: "text",
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key'
            });

          if (error) throw error;
        }
      }

      // Update hero image position
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "hero_image_position",
          content_type: "text",
          content_value: heroImagePosition,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero layout
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "hero_layout",
          content_type: "text",
          content_value: heroLayout,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero top padding
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "hero_top_padding",
          content_type: "text",
          content_value: heroTopPadding,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero CTA link
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "hero_cta_link",
          content_type: "text",
          content_value: heroCtaLink,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero CTA style
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "hero_cta_style",
          content_type: "text",
          content_value: heroCtaStyle,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero image metadata if exists
      if (heroImageMetadata) {
        await supabase
          .from("page_content")
          .upsert({
            page_slug: selectedPage,
            section_key: "hero_image_metadata",
            content_type: "json",
            content_value: JSON.stringify(heroImageMetadata),
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key'
          });
      }

      toast.success("Hero section saved successfully!");
      
      // Clear autosaved data after successful save
      clearAutosavedData(`${selectedPage}_hero`);
    } catch (error: any) {
      toast.error("Error saving hero section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTile = () => {
    const newTile = {
      title: "New Application",
      description: "Add description here...",
      ctaLink: "",
      ctaStyle: "standard",
      ctaText: "Learn More",
      imageUrl: "",
      icon: ""
    };
    setApplications([...applications, newTile]);
    toast.success("New tile added! Don't forget to save changes.");
  };

  const handleDeleteTile = (index: number) => {
    const newApps = applications.filter((_, i) => i !== index);
    setApplications(newApps);
    toast.success("Tile deleted! Don't forget to save changes.");
  };

  const handleAddSolutionItem = () => {
    const newItem = {
      title: "New Solution",
      description: "Add description here...",
      imageUrl: ""
    };
    setSolutionsItems([...solutionsItems, newItem]);
    toast.success("New solution item added! Don't forget to save changes.");
  };

  const handleDeleteSolutionItem = (index: number) => {
    const newItems = solutionsItems.filter((_, i) => i !== index);
    setSolutionsItems(newItems);
    toast.success("Solution item deleted! Don't forget to save changes.");
  };

  const handleSolutionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `solution-${index}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract image metadata
      const metadata = await extractImageMetadata(file, publicUrl);

      const newItems = [...solutionsItems];
      newItems[index].imageUrl = publicUrl;
      newItems[index].metadata = { ...metadata, altText: '' };
      setSolutionsItems(newItems);

      toast.success("Solution image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageTextHeroImageUpload = async (segmentIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `image-text-hero-${segmentIndex}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract image metadata
      const metadata = await extractImageMetadata(file, publicUrl);

      const newSegments = [...pageSegments];
      newSegments[segmentIndex].data.heroImageUrl = publicUrl;
      newSegments[segmentIndex].data.heroImageMetadata = { ...metadata, altText: '' };
      setPageSegments(newSegments);

      toast.success("Hero image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageTextItemImageUpload = async (segmentIndex: number, itemIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `image-text-item-${segmentIndex}-${itemIndex}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract image metadata
      const metadata = await extractImageMetadata(file, publicUrl);

      const newSegments = [...pageSegments];
      newSegments[segmentIndex].data.items[itemIndex].imageUrl = publicUrl;
      newSegments[segmentIndex].data.items[itemIndex].metadata = { ...metadata, altText: '' };
      setPageSegments(newSegments);

      toast.success("Item image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFooterTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `footer-team-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract image metadata
      const metadata = await extractImageMetadata(file, publicUrl);

      setFooterTeamImageUrl(publicUrl);
      setFooterTeamImageMetadata({ ...metadata, altText: '' });
      
      // Save to database
      const { error: dbError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "footer_team_image_url",
          content_type: "image_url",
          content_value: publicUrl,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (dbError) throw dbError;

      toast.success("Team image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddBannerImage = () => {
    const newImage = {
      url: "",
      alt: `Banner image ${bannerImages.length + 1}`
    };
    setBannerImages([...bannerImages, newImage]);
    toast.success("New banner image slot added! Upload an image.");
  };

  const handleDeleteBannerImage = (index: number) => {
    const newImages = bannerImages.filter((_, i) => i !== index);
    setBannerImages(newImages);
    toast.success("Banner image deleted! Don't forget to save changes.");
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-image-${index}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract image metadata
      const metadata = await extractImageMetadata(file, publicUrl);

      const newImages = [...bannerImages];
      newImages[index].url = publicUrl;
      newImages[index].metadata = { ...metadata, altText: newImages[index].alt || '' };
      setBannerImages(newImages);

      toast.success("Banner image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getDefaultSegmentData = (templateType: string) => {
    switch (templateType) {
      case 'hero':
        return {
          hero_title: 'New Hero Section',
          hero_subtitle: '',
          hero_description: '',
          hero_cta_text: 'Learn More',
          hero_image_url: '',
          hero_image_metadata: null,
          hero_image_position: 'right',
          hero_layout_ratio: '2-5',
          hero_top_spacing: 'medium',
          hero_cta_link: '#',
          hero_cta_style: 'standard'
        };
      case 'meta-navigation':
        return {
          links: [
            { label: 'Overview', anchor: 'overview' },
            { label: 'Key Benefits', anchor: 'benefits' },
            { label: 'Use Cases', anchor: 'use-cases' }
          ]
        };
      case 'product-hero-gallery':
        return {
          title: 'Product Name',
          subtitle: 'Product Variants',
          description: 'Product description',
          imagePosition: 'right',
          layoutRatio: '1-1',
          topSpacing: 'medium',
          cta1Text: 'Contact Sales',
          cta1Link: '#contact',
          cta1Style: 'standard',
          cta2Text: 'Learn More',
          cta2Link: '',
          cta2Style: 'outline-white',
          images: [{
            imageUrl: '',
            title: '',
            description: ''
          }]
        };
      case 'tiles':
        return {
          title: 'New Tiles Section',
          description: 'Section description text',
          columns: '3',
          items: [
            {
              title: 'New Application',
              description: 'Add description here...',
              ctaLink: '',
              ctaStyle: 'standard',
              ctaText: 'Learn More',
              imageUrl: '',
              icon: ''
            }
          ]
        };
      case 'banner':
        return {
          title: 'New Banner Section',
          subtext: '',
          images: [],
          buttonText: '',
          buttonLink: '',
          buttonStyle: 'standard'
        };
      case 'image-text':
        return {
          title: 'New Image & Text Section',
          subtext: '',
          layout: '2-col',
          items: [
            {
              title: 'New Item',
              description: 'Add description here...',
              imageUrl: ''
            }
          ]
        };
      case 'feature-overview':
        return {
          title: 'Key Benefits',
          subtext: '',
          layout: '3',
          items: [
            {
              title: 'Feature Title',
              description: 'Feature description text goes here...'
            }
          ]
        };
      case 'table':
        return {
          title: 'Technical Specifications',
          subtext: 'Detailed technical specifications and performance data',
          headers: ['Criterion', 'Column 2', 'Column 3'],
          rows: [
            ['Row 1', 'Data 1', 'Data 2'],
            ['Row 2', 'Data 3', 'Data 4']
          ]
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          subtext: '',
          items: [
            {
              question: 'What is your question?',
              answer: 'Your answer goes here...'
            }
          ]
        };
      case 'video':
        return {
          title: 'Product in Action',
          videoUrl: '',
          caption: ''
        };
      case 'full-hero':
        return {
          titleLine1: 'Precision Engineering for',
          titleLine2: 'Image Quality Testing',
          subtitle: 'Professional solutions for testing and calibrating camera systems with precision and accuracy.',
          button1Text: 'Find Your Solution',
          button1Link: '#applications-start',
          button1Color: 'yellow',
          button2Text: '',
          button2Link: '',
          button2Color: 'black',
          backgroundType: 'image',
          imageUrl: '',
          videoUrl: '',
          kenBurnsEffect: 'standard',
          overlayOpacity: 15
        };
      case 'specification':
        return {
          title: 'Detailed Specifications',
          rows: [
            {
              specification: 'Specification Name',
              value: 'Value'
            }
          ]
        };
      case 'intro':
        return {
          title: 'Your Partner for Objective Camera & Sensor Testing',
          description: 'Industry-leading solutions for comprehensive camera and sensor evaluation',
          headingLevel: 'h2'
        };
      case 'industries':
        return {
          title: 'Trusted Across All Industries',
          subtitle: 'Professional solutions for diverse applications',
          columns: 4,
          items: [
            {
              icon: 'Camera',
              title: 'Photography',
              description: 'Professional camera testing',
              link: ''
            }
          ]
        };
      default:
        return {};
    }
  };

  const handleAddSegment = async (templateType: string) => {
    if (!user) return;

    // Check for mutual exclusivity between Full Hero and Meta Navigation
    const hasFullHero = pageSegments.some(seg => seg.type === 'full-hero');
    const hasMetaNav = pageSegments.some(seg => seg.type === 'meta-navigation');

    if (templateType === 'full-hero' && hasMetaNav) {
      toast.error("Full Hero cannot be added when Meta Navigation is present. Please remove Meta Navigation first.");
      return;
    }

    if (templateType === 'meta-navigation' && hasFullHero) {
      toast.error("Meta Navigation cannot be added when Full Hero is present. Please remove Full Hero first.");
      return;
    }

    // Generate a unique numeric ID for this segment (globally unique across all pages)
    const segmentId = nextSegmentId;
    console.log("Creating new segment with global ID:", segmentId);
    setNextSegmentId(nextSegmentId + 1);
    
    const newSegment = {
      id: String(segmentId),
      type: templateType,
      data: getDefaultSegmentData(templateType)
    };

    const updatedSegments = [...pageSegments, newSegment];
    
    // Add new segment to end of tab order
    // Meta-navigation and full-hero are fixed position and NOT added to tabOrder
    let updatedTabOrder: string[];
    if (templateType === 'meta-navigation' || templateType === 'full-hero') {
      // Fixed position segments don't go in tabOrder
      updatedTabOrder = tabOrder;
    } else {
      // Add all other segments to end
      updatedTabOrder = [...tabOrder, String(segmentId)];
    }

    try {
      // CRITICAL: Register segment in segment_registry with global unique ID
      const { error: registryError } = await supabase
        .from("segment_registry")
        .insert({
          segment_id: segmentId,
          page_slug: selectedPage,
          segment_type: templateType,
          segment_key: String(segmentId),
          is_static: false,
          deleted: false
        });

      if (registryError) {
        console.error("Error registering segment in registry:", registryError);
        throw registryError;
      }

      // Save segments
      const { error: segmentsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (segmentsError) throw segmentsError;

      // Save tab order
      const { error: orderError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (orderError) throw orderError;

      setPageSegments(updatedSegments);
      setTabOrder(updatedTabOrder);
      setIsTemplateDialogOpen(false);
      
      // Switch to the newly added segment tab
      setActiveTab(String(segmentId));
      
      toast.success(`New segment added successfully with ID ${segmentId}!`);
    } catch (error: any) {
      toast.error("Error adding segment: " + error.message);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    if (!user) return;

    // Remove the segment with this ID (no need to renumber positions)
    const updatedSegments = pageSegments.filter(seg => seg.id !== segmentId);
    
    // Remove from tab order
    const updatedTabOrder = tabOrder.filter(id => id !== segmentId);

    try {
      // CRITICAL: Mark segment as deleted in registry instead of removing it
      // This ensures the segment_id is NEVER reused, even after deletion
      const { error: registryError } = await supabase
        .from("segment_registry")
        .update({ deleted: true })
        .eq("segment_key", segmentId)
        .eq("page_slug", selectedPage);

      if (registryError) {
        console.error("Error marking segment as deleted in registry:", registryError);
        throw registryError;
      }

      const { error: segmentsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (segmentsError) throw segmentsError;

      const { error: orderError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (orderError) throw orderError;

      setPageSegments(updatedSegments);
      setTabOrder(updatedTabOrder);
      
      // Switch to first available tab
      const firstTab = updatedTabOrder[0] || 'tiles';
      setActiveTab(firstTab);
      
      toast.success("Segment deleted successfully! (ID will never be reused)");
    } catch (error: any) {
      toast.error("Error deleting segment: " + error.message);
    }
  };

  const handleSaveSegments = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // CRITICAL: Ensure all segments have correct positions based on current order
      const segmentsWithPositions = pageSegments.map((seg, idx) => ({
        ...seg,
        position: idx
      }));
      
      console.log('[POSITION DEBUG] Saving segments with positions:', JSON.stringify(segmentsWithPositions.map(s => ({ id: s.id, type: s.type, position: s.position }))));
      
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segmentsWithPositions),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (error) throw error;
      
      // Update local state with new positions
      setPageSegments(segmentsWithPositions);
      
      console.log('[POSITION DEBUG] Segments saved successfully');
      
      toast.success("Segment saved successfully!");
    } catch (error: any) {
      toast.error("Error saving segment: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSEO = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "seo_settings",
          content_type: "json",
          content_value: JSON.stringify(seoData),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (error) throw error;
      toast.success("SEO Settings saved successfully!");
      
      // Clear autosaved data after successful save
      clearAutosavedData(`${selectedPage}_seo`);
    } catch (error: any) {
      toast.error("Error saving SEO settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApplications = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // Update applications title and description using upsert
      const appFields = ['applications_title', 'applications_description'];
      
      for (const key of appFields) {
        if (content[key] !== undefined) {
          const { error } = await supabase
            .from("page_content")
            .upsert({
              page_slug: selectedPage,
              section_key: key,
              content_type: "text",
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key'
            });

          if (error) throw error;
        }
      }

      // Update applications items using upsert
      const { error: appsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "applications_items",
          content_type: "json",
          content_value: JSON.stringify(applications),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (appsError) throw appsError;

      // Save tiles columns setting
      const { error: columnsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tiles_columns",
          content_type: "text",
          content_value: tilesColumns,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (columnsError) throw columnsError;

      toast.success("Applications section saved successfully!");
      
      // Clear autosaved data after successful save
      clearAutosavedData(`${selectedPage}_tiles`);
    } catch (error: any) {
      toast.error("Error saving applications section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      const footerFields = {
        'footer_cta_title': footerCtaTitle,
        'footer_cta_description': footerCtaDescription,
        'footer_contact_headline': footerContactHeadline,
        'footer_contact_subline': footerContactSubline,
        'footer_contact_description': footerContactDescription,
        'footer_team_quote': footerTeamQuote,
        'footer_team_name': footerTeamName,
        'footer_team_title': footerTeamTitle,
        'footer_button_text': footerButtonText
      };

      for (const [key, value] of Object.entries(footerFields)) {
        await supabase
          .from("page_content")
          .upsert({
            page_slug: selectedPage,
            section_key: key,
            content_type: "text",
            content_value: value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key'
          });
      }

      toast.success("Footer section saved successfully!");
      
      // Clear autosaved data after successful save
      clearAutosavedData(`${selectedPage}_footer`);
    } catch (error: any) {
      toast.error("Error saving footer section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!isAdmin && !isEditor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-32 max-w-[1600px]">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-gray-600">Editing:</p>
              <HierarchicalPageSelect 
                value={selectedPage} 
                onValueChange={(value) => navigate(`/admin-dashboard?page=${value}`)}
              />
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {/* Erste Reihe: Add New Segment, Preview, Logout */}
            <div className="flex items-center gap-3">
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Segment
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-3xl font-bold text-white">Choose a Segment</DialogTitle>
                  <DialogDescription className="text-base text-white/80 mt-2">
                    Select a content segment to add to your page
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="overview">Start / Overview Templates</TabsTrigger>
                    <TabsTrigger value="content">Content Templates</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                      {/* Full Hero */}
                      <div 
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white hover:shadow-xl ${
                          pageSegments.some(seg => seg.type === 'meta-navigation')
                            ? 'border-red-300 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-[#f9dc24] cursor-pointer'
                        }`}
                        onClick={() => handleAddSegment('full-hero')}
                      >
                        {pageSegments.some(seg => seg.type === 'meta-navigation') && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                            Blocked by Meta Nav
                          </div>
                        )}
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Full Hero - A</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Full-width hero with background image, title, subtitle and description
                            </p>
                            {pageSegments.some(seg => seg.type === 'meta-navigation') && (
                              <p className="text-xs text-red-600 mt-2 font-semibold">
                                ⚠️ Cannot be used with Meta Navigation
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Intro */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('intro')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Intro - B</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Introduction section with optional image, title and text content
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Industries */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('industries')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Industries - C</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Icon grid with industry categories, descriptions and optional links
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Latest News */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('news')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Latest News - D</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Display news articles in a carousel slider
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                      {/* Meta Navigation */}
                      <div 
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white hover:shadow-xl ${
                          pageSegments.some(seg => seg.type === 'full-hero')
                            ? 'border-red-300 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-[#f9dc24] cursor-pointer'
                        }`}
                        onClick={() => handleAddSegment('meta-navigation')}
                      >
                        {pageSegments.some(seg => seg.type === 'full-hero') && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                            Blocked by Full Hero
                          </div>
                        )}
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Meta Navigation - E</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Navigation links to related pages or sections
                            </p>
                            {pageSegments.some(seg => seg.type === 'full-hero') && (
                              <p className="text-xs text-red-600 mt-2 font-semibold">
                                ⚠️ Cannot be used with Full Hero
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Hero Section */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('hero')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#f9dc24] to-yellow-300 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Eye className="h-7 w-7 text-gray-900" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Produkt Hero - F</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Main page hero with image, title, description and CTA button
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f9dc24] to-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Product Gallery */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('product-hero-gallery')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Product Gallery - G</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Product hero with image gallery and description
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Intro */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('intro')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Intro - B</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Introduction section with optional image, title and text content
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Tiles */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('tiles')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <GripVertical className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Tiles - H</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Feature cards with icons, titles, descriptions and CTA links
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Image & Text */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('image-text')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Image & Text - I</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Side-by-side image and text content with flexible layout
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-500 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Banner */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('banner')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Banner - J</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Full-width promotional banner with title, subtitle and CTA
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Feature Overview */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('feature-overview')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Feature - K</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Feature list with checkmarks, descriptions and optional image
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Table */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('table')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Table - L</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Data table with customizable columns and rows
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Video */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('video')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Video - M</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Embedded video player with title and description
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-500 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Specification */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('specification')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-500 to-slate-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Specification - N</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Technical specifications with key-value pairs
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-slate-500 to-slate-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
              </Dialog>
              <Button
                variant="default"
                onClick={async () => {
                  if (!selectedPage) {
                    toast.error('Please select a page first');
                    return;
                  }

                  const { data: pageData } = await supabase
                    .from('page_registry')
                    .select('page_slug, parent_slug, parent_id')
                    .eq('page_slug', selectedPage)
                    .maybeSingle();

                  let previewUrl = '/';
                  
                  if (pageData) {
                    if (pageData.parent_slug) {
                      // Check if parent is a product category (illumination, standards, test-charts, software)
                      const productCategories = ['illumination', 'standards', 'test-charts', 'software', 'illumination-devices'];
                      
                      if (productCategories.includes(pageData.parent_slug)) {
                        // Product pages: /products/{category}/{slug}
                        previewUrl = `/products/${pageData.parent_slug}/${pageData.page_slug}`;
                      } else {
                        // Check if parent_slug is already "your-solution" (Industry pages)
                        if (pageData.parent_slug === 'your-solution') {
                          // Industry pages: /your-solution/{page}
                          previewUrl = `/your-solution/${pageData.page_slug}`;
                        } else {
                          // Check if parent has its own parent (3-level hierarchy)
                          const { data: parentData } = await supabase
                            .from('page_registry')
                            .select('parent_slug')
                            .eq('page_slug', pageData.parent_slug)
                            .maybeSingle();
                          
                          if (parentData?.parent_slug) {
                            // Check if grandparent is "your-solution"
                            if (parentData.parent_slug === 'your-solution') {
                              // 3-level Industry: /your-solution/{parent}/{page}
                              previewUrl = `/your-solution/${pageData.parent_slug}/${pageData.page_slug}`;
                            } else {
                              // 3-level other: /{grandparent}/{parent}/{page}
                              previewUrl = `/${parentData.parent_slug}/${pageData.parent_slug}/${pageData.page_slug}`;
                            }
                          } else {
                            // 2-level: /your-solution/{parent}/{page}
                            previewUrl = `/your-solution/${pageData.parent_slug}/${pageData.page_slug}`;
                          }
                        }
                      }
                    } else {
                      previewUrl = `/${pageData.page_slug}`;
                    }
                  } else {
                    const urlMap: Record<string, string> = {
                      'index': '/',
                      'your-solution': '/your-solution',
                      'products': '/products',
                      'downloads': '/downloads',
                      'events': '/events',
                      'news': '/news',
                      'inside-lab': '/inside-lab',
                      'contact': '/contact'
                    };
                    // Fallback: assume new CMS page under /your-solution/{slug} instead of sending user to homepage
                    previewUrl = urlMap[selectedPage] || `/your-solution/${selectedPage}`;
                  }

                  window.open(previewUrl, '_blank');
                }}
                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            
            {/* Zweite Reihe: Manage News, SEO Settings */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/admin-dashboard/news")}
                className="!bg-indigo-600 !text-white hover:!bg-indigo-700 flex items-center gap-2 border-0"
              >
                <Pencil className="h-4 w-4" />
                Manage News
              </Button>
              <Button
                onClick={() => setIsSEOEditorOpen(!isSEOEditorOpen)}
                className="!bg-teal-600 !text-white hover:!bg-teal-700 border-0"
              >
                SEO Settings
              </Button>
            </div>
          </div>
        </div>

        {/* SEO Editor - Conditional Rendering */}
        {isSEOEditorOpen && selectedPage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>SEO Settings for {selectedPage}</CardTitle>
              <CardDescription className="text-xl text-white">
                Konfiguriere alle SEO-relevanten Einstellungen für diese Seite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SEOEditor
                pageSlug={selectedPage}
                data={seoData}
                onChange={setSeoData}
                onSave={handleSaveSEO}
                pageSegments={pageSegments}
              />
            </CardContent>
          </Card>
        )}

        {/* Welcome Screen - Show when no page is selected or page has no segments */}
        {(!selectedPage || (pageSegments.length === 0 && Object.keys(segmentRegistry).length === 0)) ? (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
              <CardContent className="p-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <img 
                        src={lovableIcon} 
                        alt="Lovable" 
                        className="h-20 w-20 object-contain"
                      />
                      <div>
                        <div className="flex items-baseline gap-3">
                          <h1 className="text-5xl font-black text-white tracking-tight">
                            Lovable
                          </h1>
                          <span className="text-3xl font-bold text-[#f9dc24]">CMS</span>
                        </div>
                        <p className="text-xl text-gray-400 mt-1">Content Management System</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                      Welcome to your central hub for managing all CMS pages. 
                      Select a page from the dropdown above to start editing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create New CMS Page Section */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
              <CardContent className="p-10 relative z-10">
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-start gap-6 flex-1">
                    <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl flex-shrink-0">
                      <Plus className="h-9 w-9 text-gray-900" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white mb-3 tracking-tight">
                        Create New CMS Page
                      </h3>
                      <p className="text-lg text-gray-300 max-w-2xl leading-relaxed font-medium">
                        Automatically set up a complete CMS-enabled page with database entries, 
                        segment registry, and initial content. Select any page from the dropdown to convert it.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsCreateCMSDialogOpen(true)}
                    size="lg"
                    className="bg-white hover:bg-gray-100 text-gray-900 font-bold shadow-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all duration-300 px-8 py-6 text-base flex-shrink-0 hover:scale-105"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    Create Page
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Segments Grid */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#f9dc24] flex items-center justify-center">
                    <Plus className="h-6 w-6 text-gray-900" />
                  </div>
                  Available Content Segments
                </CardTitle>
                <CardDescription className="text-base text-gray-600 mt-2">
                  Build your pages using these powerful content segments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Hero Segment */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#f9dc24] to-yellow-300 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Eye className="h-7 w-7 text-gray-900" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Produkt Hero - F</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Main page hero with image, title, description and CTA button
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f9dc24] to-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Tiles Segment */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <GripVertical className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Tiles - H</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Feature cards with icons, titles, descriptions and CTA links
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Banner Segment */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Banner - J</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Promotional banners with images, title and call-to-action
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Solutions Segment */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Solutions</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Showcase product solutions with images and descriptions
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-500 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Meta Navigation */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Meta Navigation - E</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          In-page navigation with anchor links to content sections
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Product Hero Gallery */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Product Gallery - G</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Image gallery carousel for product showcase
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Feature Overview */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Feature Overview - K</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Highlight key features with icons and descriptions
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Table */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Table - L</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Structured data tables with customizable columns and rows
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* FAQ */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">FAQ - H</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Frequently asked questions with expandable answers
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-500 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Video */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Video - M</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Embedded video player with preview image and controls
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Full Hero */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Eye className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Full Hero - A</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Full-screen hero with two-line title, buttons, and Ken Burns effect
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Intro */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Intro - B</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Simple title and description section with H1 or H2 heading
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Specification */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Specification - N</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Technical specifications with detailed parameters
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>

                  {/* Image-Text */}
                  <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                    <div className="p-6 space-y-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-lime-500 to-lime-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Image-Text - I</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Combined image and text content with flexible layouts
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-lime-500 to-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <Card className="border-2 border-gray-200 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-2xl font-bold text-gray-900">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {[
                    { num: "1", title: "Wähle eine Seite", desc: "Wähle eine Seite aus dem Dropdown oben", icon: MousePointer },
                    { num: "2", title: "Füge Segmente hinzu", desc: "Nutze Drag & Drop um neue Segmente hinzuzufügen", icon: Layers },
                    { num: "3", title: "Bearbeite Inhalte", desc: "Bearbeite die Inhalte direkt im Editor", icon: Pencil },
                    { num: "4", title: "Vorschau", desc: "Klicke auf Preview Frontend um deine Änderungen live zu sehen", icon: PlayCircle }
                  ].map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.num} className="flex items-center gap-5 p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group border border-gray-200">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#f9dc24] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                          <span className="text-xl font-black text-gray-900">{step.num}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-1">
                          <Icon className="w-6 h-6 text-gray-400 flex-shrink-0" strokeWidth={2} />
                          <div>
                            <p className="text-base font-bold text-gray-900 mb-1">{step.title}</p>
                            <p className="text-sm text-gray-600">{step.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <TabsList className="flex flex-wrap w-full mb-6 h-auto p-2 bg-gray-200">
              {/* MANDATORY: Meta Navigation - ALWAYS FIRST/LEFTMOST (Nothing before it!) */}
              {pageSegments
                .filter(segment => segment.type === 'meta-navigation')
                .map((segment) => {
                  const segmentIndex = pageSegments.indexOf(segment);
                  const sameTypeBefore = pageSegments.slice(0, segmentIndex).filter(s => s.type === 'meta-navigation').length;
                  const displayNumber = sameTypeBefore + 1;
                  const segmentId = segmentRegistry[segment.id] || segment.id;
                  
                  return (
                    <TabsTrigger 
                      key={segment.id}
                      value={segment.id}
                      className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                    >
                      ID {segmentId}: Meta Nav {displayNumber} - E
                    </TabsTrigger>
                  );
                })}

              {/* Full Hero - Fixed Position (After Meta Nav if exists, otherwise first) */}
              {pageSegments
                .filter(segment => segment.type === 'full-hero')
                .map((segment) => {
                  const segmentIndex = pageSegments.indexOf(segment);
                  const sameTypeBefore = pageSegments.slice(0, segmentIndex).filter(s => s.type === 'full-hero').length;
                  const displayNumber = sameTypeBefore + 1;
                  const segmentId = segmentRegistry[segment.id] || segment.id;
                  
                  return (
                    <TabsTrigger 
                      key={segment.id}
                      value={segment.id}
                      className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                    >
                      ID {segmentId}: Full Hero {displayNumber} - A
                    </TabsTrigger>
                  );
                })}

              {/* Hero Tab - Fixed Second Position (After Meta Nav) */}
              {segmentRegistry['hero'] && (
                <TabsTrigger 
                  value="hero" 
                  className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                >
                  ID {segmentRegistry['hero']}: Produkt-Hero - F
                </TabsTrigger>
              )}

              {/* Draggable Middle Tabs - ALL segments EXCEPT Meta Navigation, Full Hero, Hero, and Footer */}
              <SortableContext
                items={tabOrder.filter(tabId => {
                  const segment = pageSegments.find(s => s.id === tabId);
                  // Exclude meta-navigation and full-hero from draggable section
                  return !segment || (segment.type !== 'meta-navigation' && segment.type !== 'full-hero');
                })}
                strategy={horizontalListSortingStrategy}
              >
                {tabOrder
                  .filter(tabId => {
                    const segment = pageSegments.find(s => s.id === tabId);
                    // Exclude meta-navigation and full-hero from draggable section
                    return !segment || (segment.type !== 'meta-navigation' && segment.type !== 'full-hero');
                  })
                  .map((tabId) => {
                  // Static tabs - only show if not deleted (in segmentRegistry)
                  if (tabId === 'tiles' && segmentRegistry['tiles']) {
                    return (
                      <SortableTab key="tiles" id="tiles" value="tiles">
                        ID {segmentRegistry['tiles']}: Tiles - H
                      </SortableTab>
                    );
                  }
                  if (tabId === 'banner' && segmentRegistry['banner']) {
                    return (
                      <SortableTab key="banner" id="banner" value="banner">
                        ID {segmentRegistry['banner']}: Banner - J
                      </SortableTab>
                    );
                  }
                  if (tabId === 'solutions' && segmentRegistry['solutions']) {
                    return (
                      <SortableTab key="solutions" id="solutions" value="solutions">
                        ID {segmentRegistry['solutions']}: Image & Text - I
                      </SortableTab>
                    );
                  }
                  
                  // Dynamic segment tabs (excluding meta-navigation which is already shown)
                  const segment = pageSegments.find(s => s.id === tabId);
                  if (segment) {
                    const segmentIndex = pageSegments.indexOf(segment);
                    const sameTypeBefore = pageSegments.slice(0, segmentIndex).filter(s => s.type === segment.type).length;
                    const displayNumber = sameTypeBefore + 1;
                    
                    const segmentId = segmentRegistry[tabId] || tabId;
                    const reverseRegistry = (window as any).__segmentKeyRegistry || {};
                    const customKey = reverseRegistry[String(segmentId)];
                    
                    let label = '';
                    // Use custom segment_key if available, otherwise use type-based label
                    if (customKey && customKey !== String(segmentId)) {
                      label = customKey;
                    } else {
                      if (segment.type === 'hero') label = `Produkt Hero ${displayNumber} - F`;
                      if (segment.type === 'product-hero-gallery') label = `Product Gallery ${displayNumber} - G`;
                      if (segment.type === 'tiles') label = `Tiles ${displayNumber} - H`;
                      if (segment.type === 'banner') label = `Banner ${displayNumber} - J`;
                      if (segment.type === 'image-text') label = `Image & Text ${displayNumber} - I`;
                      if (segment.type === 'feature-overview') label = `Features ${displayNumber} - K`;
                      if (segment.type === 'table') label = `Table ${displayNumber} - L`;
                      if (segment.type === 'faq') label = `FAQ ${displayNumber}`;
                      if (segment.type === 'video') label = `Video ${displayNumber} - M`;
                      if (segment.type === 'specification') label = `Specification ${displayNumber} - N`;
                      if (segment.type === 'news') label = `Latest News ${displayNumber} - D`;
                      if (segment.type === 'full-hero') label = `Full Hero ${displayNumber} - A`;
                      if (segment.type === 'intro') label = `Intro ${displayNumber} - B`;
                      if (segment.type === 'industries') label = `Industries ${displayNumber} - C`;
                    }
                    
                    return (
                      <SortableTab key={tabId} id={tabId} value={tabId}>
                        ID {segmentId}: {label}
                      </SortableTab>
                    );
                  }
                  return null;
                })}
              </SortableContext>

              {/* Footer Tab - Fixed Right (only if not deleted) */}
              {segmentRegistry['footer'] && (
                <TabsTrigger 
                  value="footer"
                  className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                >
                  ID {segmentRegistry['footer']}: Footer
                </TabsTrigger>
              )}
            </TabsList>
          </DndContext>

          {/* Hero Section Tab */}
          <TabsContent value="hero">
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">Produkt Hero - F</CardTitle>
                  <CardDescription className="text-gray-300">Edit the main hero section content</CardDescription>
                  <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                    ID: {segmentRegistry['hero'] || 1}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                    Produkt-Hero Template - F
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Segment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hero Segment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the entire Hero section and all its content. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStaticSegment('hero')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="layout">Layout & Image</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4 mt-0">
                  <div>
                    <Label htmlFor="hero_title" className="text-white">Title</Label>
                    <Input
                      id="hero_title"
                      value={content.hero_title || ""}
                      onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                      className="border-2 border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hero_subtitle" className="text-white">Subtitle</Label>
                    <Input
                      id="hero_subtitle"
                      value={content.hero_subtitle || ""}
                      onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                      className="border-2 border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hero_description" className="text-white">Description</Label>
                    <Textarea
                      id="hero_description"
                      value={content.hero_description || ""}
                      onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
                      rows={3}
                      className="border-2 border-gray-600"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-white font-semibold mb-3">Call-to-Action Button</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="hero_cta" className="text-white">Button Text</Label>
                        <Input
                          id="hero_cta"
                          value={content.hero_cta || ""}
                          onChange={(e) => setContent({ ...content, hero_cta: e.target.value })}
                          className="border-2 border-gray-600"
                        />
                      </div>

                      <div>
                        <Label htmlFor="hero_cta_link" className="text-white">Button Link</Label>
                        <Input
                          id="hero_cta_link"
                          value={heroCtaLink}
                          onChange={(e) => setHeroCtaLink(e.target.value)}
                          placeholder="#applications-start, /page-url, or https://example.com"
                          className="border-2 border-gray-600"
                        />
                        <p className="text-sm text-white mt-1">
                          Use '#section-id' for same page links, '/path' for internal pages, or 'https://...' for external URLs (opens in new tab)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="hero_cta_style" className="text-white">Button Style</Label>
                        <select
                          id="hero_cta_style"
                          value={heroCtaStyle}
                          onChange={(e) => setHeroCtaStyle(e.target.value)}
                          className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                        >
                          <option value="standard">Standard (Yellow with Black Text)</option>
                          <option value="technical">Technical (Dark Gray with White Text)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Layout & Image Tab */}
                <TabsContent value="layout" className="space-y-4 mt-0">
                  {/* Hero Image Upload */}
                  <div>
                    <Label htmlFor="hero_image" className="text-white">Hero Image</Label>
                    <p className="text-sm text-white mb-2">
                      {heroImageUrl ? "Current hero image - click 'Replace Image' to upload a new one" : "Upload a custom hero image (replaces the interactive hotspot image)"}
                    </p>
                    {heroImageUrl && (
                      <div className="mb-4">
                        <img 
                          src={heroImageUrl} 
                          alt="Current hero" 
                          className="max-w-xs h-auto object-contain rounded-lg border-2 border-gray-600"
                        />
                      </div>
                    )}
                    
                    {heroImageUrl ? (
                      <Button
                        type="button"
                        onClick={() => document.getElementById('hero_image')?.click()}
                        disabled={uploading}
                        className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                      >
                        {uploading ? "Uploading..." : "Replace Image"}
                      </Button>
                    ) : null}
                    
                    <Input
                      id="hero_image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className={`border-2 border-gray-600 ${heroImageUrl ? "hidden" : ""}`}
                    />
                    {uploading && <p className="text-sm text-white mt-2">Uploading...</p>}
                    
                    {/* Image Metadata Display */}
                    {heroImageMetadata && (
                      <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                        <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Original Name:</span>
                            <p className="text-black font-medium">{heroImageMetadata.originalFileName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Dimensions:</span>
                            <p className="text-black font-medium">{heroImageMetadata.width} × {heroImageMetadata.height} px</p>
                          </div>
                          <div>
                            <span className="text-gray-600">File Size:</span>
                            <p className="text-black font-medium">{formatFileSize(heroImageMetadata.fileSizeKB)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Format:</span>
                            <p className="text-black font-medium uppercase">{heroImageMetadata.format}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Upload Date:</span>
                            <p className="text-black font-medium">{formatUploadDate(heroImageMetadata.uploadDate)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Label htmlFor="hero_image_alt" className="text-black text-base">Alt Text (SEO)</Label>
                          <Input
                            id="hero_image_alt"
                            type="text"
                            value={heroImageMetadata.altText || ''}
                            onChange={(e) => {
                              if (heroImageMetadata) {
                                const updatedMetadata = { ...heroImageMetadata, altText: e.target.value };
                                setHeroImageMetadata(updatedMetadata);
                              }
                            }}
                            placeholder="Describe this image for accessibility and SEO"
                            className="mt-2 bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
                          />
                          <p className="text-white text-sm mt-1">Provide a descriptive alt text for screen readers and search engines</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero_image_dimensions" className="text-white">Image Dimensions</Label>
                      <select
                        id="hero_image_dimensions"
                        value={heroImageDimensions}
                        onChange={(e) => setHeroImageDimensions(e.target.value as any)}
                        className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                      >
                        <option value="600x600">600 × 600px (Square)</option>
                        <option value="800x600">800 × 600px (4:3)</option>
                        <option value="1200x800">1200 × 800px (3:2)</option>
                        <option value="1920x1080">1920 × 1080px (16:9)</option>
                      </select>
                      <p className="text-sm text-gray-400 mt-1">Images will be cropped to this size</p>
                    </div>

                    <div>
                      <Label htmlFor="hero_crop_position" className="text-white">Crop Position</Label>
                      <select
                        id="hero_crop_position"
                        value={heroCropPosition}
                        onChange={(e) => setHeroCropPosition(e.target.value as any)}
                        className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                      >
                        <option value="top">Top (Keep top, crop bottom)</option>
                        <option value="center">Center (Crop equally)</option>
                        <option value="bottom">Bottom (Keep bottom, crop top)</option>
                      </select>
                      <p className="text-sm text-gray-400 mt-1">Which part to keep when cropping</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero_image_position" className="text-white">Image Position</Label>
                      <select
                        id="hero_image_position"
                        value={heroImagePosition}
                        onChange={(e) => setHeroImagePosition(e.target.value)}
                        className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                      >
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="hero_layout" className="text-white">Layout Ratio</Label>
                      <select
                        id="hero_layout"
                        value={heroLayout}
                        onChange={(e) => setHeroLayout(e.target.value)}
                        className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                      >
                        <option value="50-50">50:50 (Equal)</option>
                        <option value="2-3">2:3 (Text:Image)</option>
                        <option value="1-2">1:2 (Text:Image)</option>
                        <option value="2-5">2:5 (Text:Image)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hero_top_padding" className="text-white">Top Spacing</Label>
                    <select
                      id="hero_top_padding"
                      value={heroTopPadding}
                      onChange={(e) => setHeroTopPadding(e.target.value)}
                      className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                    >
                      <option value="small">Small (PT-16)</option>
                      <option value="medium">Medium (PT-24)</option>
                      <option value="large">Large (PT-32)</option>
                      <option value="xlarge">Extra Large (PT-40)</option>
                    </select>
                    <p className="text-sm text-white mt-1">Controls the spacing from the top of the hero section</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700 mt-6">
                <Button
                  onClick={() => setCopyHeroDialogOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Page...
                </Button>
                
                <Button
                  onClick={handleSaveHero}
                  disabled={saving}
                  className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <CopySegmentDialog
                open={copyHeroDialogOpen}
                onOpenChange={setCopyHeroDialogOpen}
                currentPageSlug={selectedPage}
                segmentId={segmentRegistry['hero']?.toString() || '1'}
                segmentType="hero"
                segmentData={{
                  hero_title: content.hero_title,
                  hero_subtitle: content.hero_subtitle,
                  hero_description: content.hero_description,
                  hero_image_url: heroImageUrl,
                  hero_image_metadata: heroImageMetadata,
                  hero_cta_text: content.hero_cta,
                  hero_cta_link: heroCtaLink,
                  hero_cta_style: heroCtaStyle,
                  hero_image_position: heroImagePosition,
                  hero_layout_ratio: heroLayout,
                  hero_top_spacing: heroTopPadding
                }}
                availablePages={availablePages}
                onCopySuccess={(targetPageSlug) => {
                  navigate(`/admin-dashboard?page=${targetPageSlug}`);
                }}
              />
            </CardContent>
          </Card>
          </TabsContent>

          {/* Applications Section Tab */}
          <TabsContent value="tiles">
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">Tiles Template - H</CardTitle>
                  <CardDescription className="text-gray-300">Edit the tiles section content</CardDescription>
                  <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                    ID: {segmentRegistry['tiles'] || 2}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                    Tiles Template - H
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Segment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tiles Segment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the entire Tiles section and all its tiles. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStaticSegment('tiles')}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="applications_title" className="text-white">Section Title</Label>
                <Input
                  id="applications_title"
                  value={content.applications_title || ""}
                  onChange={(e) => setContent({ ...content, applications_title: e.target.value })}
                  className="border-2 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="applications_description" className="text-white">Section Description</Label>
                <Textarea
                  id="applications_description"
                  value={content.applications_description || ""}
                  onChange={(e) => setContent({ ...content, applications_description: e.target.value })}
                  rows={3}
                  className="border-2 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="tiles_columns" className="text-white">Number of Columns</Label>
                <Select value={tilesColumns} onValueChange={setTilesColumns}>
                  <SelectTrigger className="border-2 border-gray-600 text-black h-12">
                    <SelectValue placeholder="Select columns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Columns</SelectItem>
                    <SelectItem value="3">3 Columns</SelectItem>
                    <SelectItem value="4">4 Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Application Items */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Application Items</h3>
                  <Button
                    onClick={handleAddTile}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Tile
                  </Button>
                </div>
                {applications.map((app, index) => (
                  <Card key={index} className={`border-2 ${index % 2 === 0 ? 'bg-gray-600 border-gray-500' : 'bg-gray-800 border-gray-700'}`}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-4 py-2 ${index % 2 === 0 ? 'bg-[#f9dc24]' : 'bg-orange-400'} text-black text-base font-bold rounded-md shadow-lg`}>
                          Tile {index + 1}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "Tile {index + 1}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTile(index)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      {/* Image Upload */}
                      <div>
                        <Label htmlFor={`app_image_${index}`} className="text-white">Tile Image (Optional)</Label>
                        <p className="text-sm text-white mb-2">
                          {app.imageUrl ? "Current image - click 'Replace' to upload a new one" : "Upload an image for this tile (appears above the title)"}
                        </p>
                        {app.imageUrl && (
                          <div className="mb-3">
                            <img 
                              src={app.imageUrl} 
                              alt={`Tile ${index + 1}`} 
                              className="max-w-xs h-auto object-contain rounded-lg border-2 border-gray-600"
                            />
                          </div>
                        )}
                        
                        {app.imageUrl ? (
                          <Button
                            type="button"
                            onClick={() => document.getElementById(`app_image_${index}`)?.click()}
                            disabled={uploading}
                            className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                          >
                            {uploading ? "Uploading..." : "Replace Image"}
                          </Button>
                        ) : null}
                        
                        <Input
                          id={`app_image_${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTileImageUpload(e, index)}
                          disabled={uploading}
                          className={`border-2 border-gray-600 ${app.imageUrl ? "hidden" : ""}`}
                        />
                        
                        {/* Image Metadata Display */}
                        {app.metadata && (
                          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                            <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Original Name:</span>
                                <p className="text-black font-medium">{app.metadata.originalFileName}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Dimensions:</span>
                                <p className="text-black font-medium">{app.metadata.width} × {app.metadata.height} px</p>
                              </div>
                              <div>
                                <span className="text-gray-600">File Size:</span>
                                <p className="text-black font-medium">{formatFileSize(app.metadata.fileSizeKB)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Format:</span>
                                <p className="text-black font-medium uppercase">{app.metadata.format}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-600">Upload Date:</span>
                                <p className="text-black font-medium">{formatUploadDate(app.metadata.uploadDate)}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Label htmlFor={`app_image_alt_${index}`} className="text-black text-base">Alt Text (SEO)</Label>
                              <Input
                                id={`app_image_alt_${index}`}
                                type="text"
                                value={app.metadata.altText || ''}
                                onChange={(e) => {
                                  const newApps = [...applications];
                                  if (newApps[index].metadata) {
                                    newApps[index].metadata.altText = e.target.value;
                                    setApplications(newApps);
                                  }
                                }}
                                placeholder="Describe this image for accessibility and SEO"
                                className="mt-2 bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
                              />
                              <p className="text-white text-sm mt-1">Provide a descriptive alt text for screen readers and search engines</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Icon Selection */}
                      <div>
                        <Label htmlFor={`app_icon_${index}`} className="text-white">Icon (Optional)</Label>
                        <Select
                          value={app.icon || "none"}
                          onValueChange={(value) => {
                            const newApps = [...applications];
                            newApps[index].icon = value === "none" ? "" : value;
                            setApplications(newApps);
                          }}
                        >
                          <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                            <SelectValue placeholder="Select an icon" className="text-black" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="none" className="text-black">No Icon</SelectItem>
                            <SelectItem value="FileText" className="text-black">Document (FileText)</SelectItem>
                            <SelectItem value="Download" className="text-black">Download</SelectItem>
                            <SelectItem value="BarChart3" className="text-black">Bar Chart</SelectItem>
                            <SelectItem value="Zap" className="text-black">Lightning (Zap)</SelectItem>
                            <SelectItem value="Shield" className="text-black">Shield</SelectItem>
                            <SelectItem value="Eye" className="text-black">Eye</SelectItem>
                            <SelectItem value="Car" className="text-black">Car</SelectItem>
                            <SelectItem value="Smartphone" className="text-black">Smartphone</SelectItem>
                            <SelectItem value="Heart" className="text-black">Heart</SelectItem>
                            <SelectItem value="CheckCircle" className="text-black">Check Circle</SelectItem>
                            <SelectItem value="Lightbulb" className="text-black">Lightbulb</SelectItem>
                            <SelectItem value="Monitor" className="text-black">Monitor</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-white mt-1">
                          Icon appears in a yellow circle above the title
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor={`app_title_${index}`} className="text-white">Application {index + 1} Title</Label>
                        <Input
                          id={`app_title_${index}`}
                          value={app.title}
                          onChange={(e) => {
                            const newApps = [...applications];
                            newApps[index].title = e.target.value;
                            setApplications(newApps);
                          }}
                          className="border-2 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`app_desc_${index}`} className="text-white">Application {index + 1} Description</Label>
                        <Textarea
                          id={`app_desc_${index}`}
                          value={app.description}
                          onChange={(e) => {
                            const newApps = [...applications];
                            newApps[index].description = e.target.value;
                            setApplications(newApps);
                          }}
                          rows={3}
                          className="border-2 border-gray-600"
                        />
                      </div>
                      
                      {/* Button Settings */}
                      <div className="pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-white">Button Settings</h4>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`app_show_button_${index}`}
                              checked={app.showButton !== false}
                              onChange={(e) => {
                                const newApps = [...applications];
                                newApps[index].showButton = e.target.checked;
                                setApplications(newApps);
                              }}
                              className="h-5 w-5 rounded border-gray-600"
                            />
                            <Label htmlFor={`app_show_button_${index}`} className="text-white cursor-pointer">
                              Show Button
                            </Label>
                          </div>
                        </div>
                        
                        {app.showButton !== false && (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`app_cta_link_${index}`} className="text-white">Button Link</Label>
                              <Input
                                id={`app_cta_link_${index}`}
                                value={app.ctaLink || ""}
                                onChange={(e) => {
                                  const newApps = [...applications];
                                  newApps[index].ctaLink = e.target.value;
                                  setApplications(newApps);
                                }}
                                placeholder="/page-url or https://example.com"
                                className="border-2 border-gray-600"
                              />
                              <p className="text-sm text-white mt-1">
                                Use '/path' for internal pages or 'https://...' for external URLs
                              </p>
                            </div>
                            
                            <div>
                              <Label htmlFor={`app_cta_text_${index}`} className="text-white">Button Text</Label>
                              <Input
                                id={`app_cta_text_${index}`}
                                value={app.ctaText || ""}
                                onChange={(e) => {
                                  const newApps = [...applications];
                                  newApps[index].ctaText = e.target.value;
                                  setApplications(newApps);
                                }}
                                placeholder="Learn More"
                                className="border-2 border-gray-600"
                              />
                              <p className="text-sm text-white mt-1">
                                Text displayed on the button (default: "Learn More")
                              </p>
                            </div>
                            
                            <div>
                              <Label htmlFor={`app_cta_style_${index}`} className="text-white">Button Style</Label>
                              <Select
                                value={app.ctaStyle || "standard"}
                                onValueChange={(value) => {
                                  const newApps = [...applications];
                                  newApps[index].ctaStyle = value;
                                  setApplications(newApps);
                                }}
                              >
                                <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                                  <SelectValue placeholder="Select button style" className="text-black" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="standard" className="text-black">Standard (Yellow with Black Text)</SelectItem>
                                  <SelectItem value="technical" className="text-black">Technical (Dark Gray with White Text)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  onClick={() => setCopyTilesDialogOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Page...
                </Button>
                
                <Button
                  onClick={handleSaveApplications}
                  disabled={saving}
                  className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              <CopySegmentDialog
                open={copyTilesDialogOpen}
                onOpenChange={setCopyTilesDialogOpen}
                currentPageSlug={selectedPage}
                segmentId={segmentRegistry['tiles']?.toString() || '2'}
                segmentType="tiles"
                segmentData={{
                  tiles_title: content.applications_title,
                  tiles_description: content.applications_description,
                  tiles_columns: tilesColumns,
                  tiles: applications
                }}
                availablePages={availablePages}
                onCopySuccess={(targetPageSlug) => {
                  navigate(`/admin-dashboard?page=${targetPageSlug}`);
                }}
              />
            </CardContent>
          </Card>
          </TabsContent>

          {/* Banner Template Tab */}
          <TabsContent value="banner">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">Banner Template Section - J</CardTitle>
                    <CardDescription className="text-gray-300">Edit the banner section with title, subtext, images, and button</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['banner'] || 3}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                      Banner Template - J
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Segment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Banner Segment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the entire Banner section and all its content. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteStaticSegment('banner')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="banner_title" className="text-white">Section Title</Label>
                  <Input
                    id="banner_title"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g., Automotive International Standards"
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Subtext */}
                <div>
                  <Label htmlFor="banner_subtext" className="text-white">Subtext (Optional)</Label>
                  <Textarea
                    id="banner_subtext"
                    value={bannerSubtext}
                    onChange={(e) => setBannerSubtext(e.target.value)}
                    placeholder="Optional description text (max width 600px, centered)"
                    rows={3}
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Banner Images */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-lg font-semibold">Banner Images</Label>
                    <Button
                      onClick={handleAddBannerImage}
                      className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Image
                    </Button>
                  </div>

                  {bannerImages.map((image, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between mb-4">
                          <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md">
                            Image {index + 1}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "Image {index + 1}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBannerImage(index)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {image.url && (
                          <div className="mb-3">
                            <img 
                              src={image.url} 
                              alt={`Banner ${index + 1}`} 
                              className="w-40 h-24 object-contain rounded-lg border-2 border-gray-600 bg-white p-2"
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor={`banner_image_${index}`} className="text-white">Image File</Label>
                          <Input
                            id={`banner_image_${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBannerImageUpload(e, index)}
                            disabled={uploading}
                            className="border-2 border-gray-600"
                          />
                        </div>

                        {/* Image Metadata Display */}
                        {image.metadata && (
                          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                            <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Original Name:</span>
                                <p className="text-black font-medium">{image.metadata.originalFileName}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Dimensions:</span>
                                <p className="text-black font-medium">{image.metadata.width} × {image.metadata.height} px</p>
                              </div>
                              <div>
                                <span className="text-gray-600">File Size:</span>
                                <p className="text-black font-medium">{formatFileSize(image.metadata.fileSizeKB)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Format:</span>
                                <p className="text-black font-medium uppercase">{image.metadata.format}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-600">Upload Date:</span>
                                <p className="text-black font-medium">{formatUploadDate(image.metadata.uploadDate)}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <Label htmlFor={`banner_image_alt_${index}`} className="text-white">Alt Text</Label>
                          <Input
                            id={`banner_image_alt_${index}`}
                            value={image.alt}
                            onChange={(e) => {
                              const newImages = [...bannerImages];
                              newImages[index].alt = e.target.value;
                              if (newImages[index].metadata) {
                                newImages[index].metadata.altText = e.target.value;
                              }
                              setBannerImages(newImages);
                            }}
                            placeholder="Image description for accessibility"
                            className="border-2 border-gray-600"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Button Settings */}
                <div className="pt-4 border-t border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Button Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="banner_button_text" className="text-white">Button Text</Label>
                      <Input
                        id="banner_button_text"
                        value={bannerButtonText}
                        onChange={(e) => setBannerButtonText(e.target.value)}
                        placeholder="e.g., View Standards"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner_button_link" className="text-white">Button Link</Label>
                      <Input
                        id="banner_button_link"
                        value={bannerButtonLink}
                        onChange={(e) => setBannerButtonLink(e.target.value)}
                        placeholder="/page-url or https://example.com"
                        className="border-2 border-gray-600"
                      />
                      <p className="text-sm text-white mt-1">
                        Use '/path' for internal pages or 'https://...' for external URLs
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="banner_button_style" className="text-white">Button Style</Label>
                      <Select
                        value={bannerButtonStyle}
                        onValueChange={(value) => setBannerButtonStyle(value)}
                      >
                        <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                          <SelectValue placeholder="Select button style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="standard" className="text-black">Standard (Yellow with Black Text)</SelectItem>
                          <SelectItem value="technical" className="text-black">Technical (Dark Gray with White Text)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-600">
                  <Button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const updates = [
                          {
                            page_slug: selectedPage,
                            section_key: "banner_title",
                            content_type: "heading",
                            content_value: bannerTitle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_subtext",
                            content_type: "text",
                            content_value: bannerSubtext,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_images",
                            content_type: "json",
                            content_value: JSON.stringify(bannerImages),
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_button_text",
                            content_type: "text",
                            content_value: bannerButtonText,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_button_link",
                            content_type: "text",
                            content_value: bannerButtonLink,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_button_style",
                            content_type: "text",
                            content_value: bannerButtonStyle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          }
                        ];

                        const { error } = await supabase
                          .from("page_content")
                          .upsert(updates, {
                            onConflict: 'page_slug,section_key'
                          });

                        if (error) throw error;

                        toast.success("Banner content saved successfully!");
                        
                        // Clear autosaved data after successful save
                        clearAutosavedData(`${selectedPage}_banner`);
                      } catch (error: any) {
                        toast.error("Error saving banner content: " + error.message);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image & Text Template Tab */}
          <TabsContent value="solutions">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">Image & Text Template - I</CardTitle>
                    <CardDescription className="text-gray-300">Edit image & text section with flexible column layout (1/2/3 columns)</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['solutions'] || 4}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                      Image & Text Template - I
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Segment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image & Text Segment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the entire Image & Text section and all its content. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteStaticSegment('solutions')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="solutions_title" className="text-white">Section Title</Label>
                  <Input
                    id="solutions_title"
                    value={solutionsTitle}
                    onChange={(e) => setSolutionsTitle(e.target.value)}
                    placeholder="e.g., Automotive Camera Test Solutions"
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Subtext */}
                <div>
                  <Label htmlFor="solutions_subtext" className="text-white">Subtext (Optional)</Label>
                  <Textarea
                    id="solutions_subtext"
                    value={solutionsSubtext}
                    onChange={(e) => setSolutionsSubtext(e.target.value)}
                    placeholder="Optional description text below the title"
                    rows={3}
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Layout Selection */}
                <div>
                  <Label htmlFor="solutions_layout" className="text-white">Column Layout</Label>
                  <Select
                    value={solutionsLayout}
                    onValueChange={(value) => setSolutionsLayout(value)}
                  >
                    <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1-col" className="text-black">1 Column (Full Width)</SelectItem>
                      <SelectItem value="2-col" className="text-black">2 Columns</SelectItem>
                      <SelectItem value="3-col" className="text-black">3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Solution Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-lg font-semibold">Solution Items</Label>
                    <Button
                      onClick={handleAddSolutionItem}
                      className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {solutionsItems.map((item, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between mb-4">
                          <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md">
                            Item {index + 1}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "Item {index + 1}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSolutionItem(index)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <Label htmlFor={`solution_image_${index}`} className="text-white">Image (Optional - Full Width)</Label>
                          {item.imageUrl && (
                            <div className="mb-3">
                              <img 
                                src={item.imageUrl} 
                                alt={`Solution ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-600"
                              />
                            </div>
                          )}
                          <Input
                            id={`solution_image_${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSolutionImageUpload(e, index)}
                            disabled={uploading}
                            className="border-2 border-gray-600"
                          />
                          
                          {/* Image Metadata Display */}
                          {item.metadata && (
                            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                              <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Original Name:</span>
                                  <p className="text-black font-medium">{item.metadata.originalFileName}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Dimensions:</span>
                                  <p className="text-black font-medium">{item.metadata.width} × {item.metadata.height} px</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">File Size:</span>
                                  <p className="text-black font-medium">{formatFileSize(item.metadata.fileSizeKB)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Format:</span>
                                  <p className="text-black font-medium uppercase">{item.metadata.format}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600">Upload Date:</span>
                                  <p className="text-black font-medium">{formatUploadDate(item.metadata.uploadDate)}</p>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <Label htmlFor={`solution_image_alt_${index}`} className="text-black text-base">Alt Text (SEO)</Label>
                                <Input
                                  id={`solution_image_alt_${index}`}
                                  type="text"
                                  value={item.metadata.altText || ''}
                                  onChange={(e) => {
                                    const newItems = [...solutionsItems];
                                    if (newItems[index].metadata) {
                                      newItems[index].metadata.altText = e.target.value;
                                      setSolutionsItems(newItems);
                                    }
                                  }}
                                  placeholder="Describe this image for accessibility and SEO"
                                  className="mt-2 bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
                                />
                                <p className="text-white text-sm mt-1">Provide a descriptive alt text for screen readers and search engines</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <Label htmlFor={`solution_title_${index}`} className="text-white">Title</Label>
                          <Input
                            id={`solution_title_${index}`}
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...solutionsItems];
                              newItems[index].title = e.target.value;
                              setSolutionsItems(newItems);
                            }}
                            placeholder="e.g., In-Cabin Testing"
                            className="border-2 border-gray-600"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <Label htmlFor={`solution_desc_${index}`} className="text-white">Description</Label>
                          <Textarea
                            id={`solution_desc_${index}`}
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...solutionsItems];
                              newItems[index].description = e.target.value;
                              setSolutionsItems(newItems);
                            }}
                            rows={6}
                            placeholder="Detailed description..."
                            className="border-2 border-gray-600"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-600">
                  <Button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const updates = [
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_title",
                            content_type: "heading",
                            content_value: solutionsTitle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_subtext",
                            content_type: "text",
                            content_value: solutionsSubtext,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_layout",
                            content_type: "text",
                            content_value: solutionsLayout,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_items",
                            content_type: "json",
                            content_value: JSON.stringify(solutionsItems),
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          }
                        ];

                        const { error } = await supabase
                          .from("page_content")
                          .upsert(updates, {
                            onConflict: 'page_slug,section_key'
                          });

                        if (error) throw error;

                        toast.success("Image & Text content saved successfully!");
                        
                        // Clear autosaved data after successful save
                        clearAutosavedData(`${selectedPage}_solutions`);
                      } catch (error: any) {
                        toast.error("Error saving image & text content: " + error.message);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">Footer Section</CardTitle>
                    <CardDescription className="text-gray-300">Edit footer content for the {selectedPage} page</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['footer'] || 7}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vision CTA Section */}
                <div className="border-b border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">1. Vision CTA Section</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="footer_cta_title" className="text-white">CTA Title</Label>
                      <Input
                        id="footer_cta_title"
                        value={footerCtaTitle}
                        onChange={(e) => setFooterCtaTitle(e.target.value)}
                        placeholder="e.g., Charts that help you win"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_cta_description" className="text-white">CTA Description</Label>
                      <Textarea
                        id="footer_cta_description"
                        value={footerCtaDescription}
                        onChange={(e) => setFooterCtaDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe your vision..."
                        className="border-2 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="border-b border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">2. Contact Section</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="footer_contact_headline" className="text-white">Contact Headline (Line 1)</Label>
                      <Input
                        id="footer_contact_headline"
                        value={footerContactHeadline}
                        onChange={(e) => setFooterContactHeadline(e.target.value)}
                        placeholder="e.g., Need help choosing"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_contact_subline" className="text-white">Contact Headline (Line 2)</Label>
                      <Input
                        id="footer_contact_subline"
                        value={footerContactSubline}
                        onChange={(e) => setFooterContactSubline(e.target.value)}
                        placeholder="e.g., the right test chart?"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_contact_description" className="text-white">Contact Description</Label>
                      <Textarea
                        id="footer_contact_description"
                        value={footerContactDescription}
                        onChange={(e) => setFooterContactDescription(e.target.value)}
                        rows={3}
                        placeholder="Contact description..."
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_button_text" className="text-white">Button Text</Label>
                      <Input
                        id="footer_button_text"
                        value={footerButtonText}
                        onChange={(e) => setFooterButtonText(e.target.value)}
                        placeholder="e.g., Get in Touch"
                        className="border-2 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Quote Section */}
                <div className="pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">3. Team Quote Section</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Team Member Photo</Label>
                      <div className="flex gap-2 items-start">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFooterTeamImageUpload}
                          disabled={uploading}
                          className="border-2 border-gray-600"
                        />
                      </div>
                      {footerTeamImageUrl && (
                        <div className="mt-2 relative inline-block">
                          <img 
                            src={footerTeamImageUrl} 
                            alt="Team member" 
                            className="w-32 h-32 object-cover rounded border"
                          />
                          <button
                            onClick={() => setFooterTeamImageUrl('')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      
                      {/* Image Metadata Display */}
                      {footerTeamImageMetadata && (
                        <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                          <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Original Name:</span>
                              <p className="text-black font-medium">{footerTeamImageMetadata.originalFileName}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Dimensions:</span>
                              <p className="text-black font-medium">{footerTeamImageMetadata.width} × {footerTeamImageMetadata.height} px</p>
                            </div>
                            <div>
                              <span className="text-gray-600">File Size:</span>
                              <p className="text-black font-medium">{formatFileSize(footerTeamImageMetadata.fileSizeKB)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Format:</span>
                              <p className="text-black font-medium uppercase">{footerTeamImageMetadata.format}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Upload Date:</span>
                              <p className="text-black font-medium">{formatUploadDate(footerTeamImageMetadata.uploadDate)}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Label htmlFor="footer_image_alt" className="text-black text-base">Alt Text (SEO)</Label>
                            <Input
                              id="footer_image_alt"
                              type="text"
                              value={footerTeamImageMetadata.altText || ''}
                              onChange={(e) => {
                                if (footerTeamImageMetadata) {
                                  const updatedMetadata = { ...footerTeamImageMetadata, altText: e.target.value };
                                  setFooterTeamImageMetadata(updatedMetadata);
                                }
                              }}
                              placeholder="Describe this image for accessibility and SEO"
                              className="mt-2 bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
                            />
                            <p className="text-white text-sm mt-1">Provide a descriptive alt text for screen readers and search engines</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="footer_team_quote" className="text-white">Team Quote</Label>
                      <Textarea
                        id="footer_team_quote"
                        value={footerTeamQuote}
                        onChange={(e) => setFooterTeamQuote(e.target.value)}
                        rows={3}
                        placeholder="Team member's quote..."
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_team_name" className="text-white">Team Member Name</Label>
                      <Input
                        id="footer_team_name"
                        value={footerTeamName}
                        onChange={(e) => setFooterTeamName(e.target.value)}
                        placeholder="e.g., Laura Neumann"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_team_title" className="text-white">Team Member Title</Label>
                      <Input
                        id="footer_team_title"
                        value={footerTeamTitle}
                        onChange={(e) => setFooterTeamTitle(e.target.value)}
                        placeholder="e.g., Head of Optical Systems"
                        className="border-2 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-600">
                  <Button
                    onClick={handleSaveFooter}
                    disabled={saving}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Footer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dynamic Segment Tabs */}
          {pageSegments.map((segment, index) => (
            <TabsContent key={`segment-content-${segment.id}`} value={segment.id}>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {segment.type === 'hero' && `Produkt Hero ${segment.position + 1} - F`}
                        {segment.type === 'meta-navigation' && `Meta Navigation ${segment.position + 1} - E`}
                        {segment.type === 'product-hero-gallery' && `Product Hero Gallery ${segment.position + 1} - G`}
                        {segment.type === 'tiles' && `Tiles Section ${segment.position + 1} - H`}
                        {segment.type === 'banner' && `Banner Section ${segment.position + 1} - J`}
                        {segment.type === 'image-text' && `Image & Text Section ${segment.position + 1} - I`}
                        {segment.type === 'full-hero' && `Full Hero ${segment.position + 1} - A`}
                        {segment.type === 'intro' && `Intro ${segment.position + 1} - B`}
                        {segment.type === 'industries' && `Industries ${segment.position + 1} - C`}
                        {segment.type === 'news' && `Latest News ${segment.position + 1} - D`}
                        {segment.type === 'feature-overview' && `Feature Overview ${segment.position + 1} - K`}
                        {segment.type === 'table' && `Table ${segment.position + 1} - L`}
                        {segment.type === 'faq' && `FAQ ${segment.position + 1}`}
                        {segment.type === 'video' && `Video ${segment.position + 1} - M`}
                        {segment.type === 'specification' && `Specification ${segment.position + 1} - N`}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Edit this {segment.type} segment
                      </CardDescription>
                      <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                        ID: {segmentRegistry[segment.id] || segment.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                        {segment.type === 'hero' && 'Produkt-Hero Template - F'}
                        {segment.type === 'meta-navigation' && 'Meta Navigation - E'}
                        {segment.type === 'product-hero-gallery' && 'Product Hero Gallery - G'}
                        {segment.type === 'tiles' && 'Tiles Template - H'}
                        {segment.type === 'banner' && 'Banner Template - J'}
                        {segment.type === 'image-text' && 'Image & Text Template - I'}
                        {segment.type === 'feature-overview' && 'Feature Overview Template - K'}
                        {segment.type === 'table' && 'Table Template - L'}
                        {segment.type === 'faq' && 'FAQ Template'}
                        {segment.type === 'video' && 'Video Template - M'}
                        {segment.type === 'full-hero' && 'Full Hero Template - A'}
                        {segment.type === 'specification' && 'Specification Template - N'}
                        {segment.type === 'news' && 'Latest News Template - D'}
                        {segment.type === 'intro' && 'Intro Template - B'}
                        {segment.type === 'industries' && 'Industries Template - C'}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Segment
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this segment. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSegment(segment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {segment.type === 'hero' && (() => {
                    console.log('Rendering hero segment:', segment.id, 'with data:', segment.data);
                    
                    // Get or initialize tab state for this segment
                    const segmentKey = `hero-${segment.id}`;
                    const currentTab = segmentTabStates[segmentKey] || 'content';
                    const setCurrentTab = (tab: string) => {
                      setSegmentTabStates(prev => ({ ...prev, [segmentKey]: tab }));
                    };
                    
                    // Get data or use defaults WITHOUT mutating the original
                    const heroData = segment.data || {
                      hero_title: '',
                      hero_subtitle: '',
                      hero_description: '',
                      hero_image_url: '',
                      hero_image_metadata: null,
                      hero_cta_text: '',
                      hero_cta_link: '#',
                      hero_cta_style: 'standard',
                      hero_image_position: 'right',
                      hero_layout_ratio: '2-5',
                      hero_top_spacing: 'medium',
                      hero_image_dimensions: '600x600',
                      hero_crop_position: 'center'
                    };
                    
                    const cropImage = async (file: File, dimensions: string, cropPosition: string): Promise<Blob> => {
                      return new Promise((resolve, reject) => {
                        const [targetWidth, targetHeight] = dimensions.split('x').map(Number);
                        const img = new Image();
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                          reject(new Error('Could not get canvas context'));
                          return;
                        }

                        img.onload = () => {
                          canvas.width = targetWidth;
                          canvas.height = targetHeight;

                          const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                          const scaledWidth = img.width * scale;
                          const scaledHeight = img.height * scale;

                          let sx = 0;
                          let sy = 0;

                          if (cropPosition === 'top') {
                            sx = (scaledWidth - targetWidth) / 2;
                            sy = 0;
                          } else if (cropPosition === 'bottom') {
                            sx = (scaledWidth - targetWidth) / 2;
                            sy = scaledHeight - targetHeight;
                          } else {
                            sx = (scaledWidth - targetWidth) / 2;
                            sy = (scaledHeight - targetHeight) / 2;
                          }

                          ctx.drawImage(img, -sx, -sy, scaledWidth, scaledHeight);

                          canvas.toBlob((blob) => {
                            if (blob) {
                              resolve(blob);
                            } else {
                              reject(new Error('Could not create blob'));
                            }
                          }, 'image/jpeg', 0.95);
                        };

                        img.onerror = () => reject(new Error('Failed to load image'));
                        img.src = URL.createObjectURL(file);
                      });
                    };
                    
                    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        setUploading(true);
                        
                        // Crop the image
                        const croppedBlob = await cropImage(
                          file, 
                          heroData.hero_image_dimensions || '600x600',
                          heroData.hero_crop_position || 'center'
                        );
                        
                        // Convert blob to file
                        const croppedFile = new File([croppedBlob], file.name, { type: 'image/jpeg' });

                        // Upload to Supabase Storage
                        const fileExt = 'jpg';
                        const fileName = `${Date.now()}.${fileExt}`;
                        const filePath = `${selectedPage}/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                          .from('page-images')
                          .upload(filePath, croppedFile);

                        if (uploadError) throw uploadError;

                        // Get public URL
                        const { data: urlData } = supabase.storage
                          .from('page-images')
                          .getPublicUrl(filePath);

                        // Extract metadata with URL
                        const metadataWithoutAlt = await extractImageMetadata(croppedFile, urlData.publicUrl);
                        const metadata: ImageMetadata = {
                          ...metadataWithoutAlt,
                          altText: ''
                        };

                        // Update segment with image URL and metadata
                        const newSegments = [...pageSegments];
                        newSegments[index].data = {
                          ...heroData,
                          hero_image_url: urlData.publicUrl,
                          hero_image_metadata: metadata
                        };
                        setPageSegments(newSegments);
                        
                        toast.success("Bild erfolgreich hochgeladen und zugeschnitten");
                      } catch (error) {
                        console.error('Image upload error:', error);
                        toast.error("Upload fehlgeschlagen");
                      } finally {
                        setUploading(false);
                      }
                    };

                    const handleImageDelete = async () => {
                      if (!heroData.hero_image_url) return;

                      try {
                        const filePath = heroData.hero_image_url.split('/page-images/')[1];
                        if (filePath) {
                          await supabase.storage
                            .from('page-images')
                            .remove([filePath]);
                        }

                        const newSegments = [...pageSegments];
                        newSegments[index].data = {
                          ...heroData,
                          hero_image_url: '',
                          hero_image_metadata: null
                        };
                        setPageSegments(newSegments);
                        
                        toast.success("Bild erfolgreich gelöscht");
                      } catch (error) {
                        console.error('Image delete error:', error);
                        toast.error("Löschen fehlgeschlagen");
                      }
                    };
                    
                    return (
                      <div className="space-y-6">
                        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="layout">Layout & Image</TabsTrigger>
                          </TabsList>

                          {/* Content Tab */}
                          <TabsContent value="content" className="space-y-4 mt-0">
                            <div>
                              <Label className="text-white">Title</Label>
                              <Input
                                value={heroData.hero_title || ''}
                                onChange={(e) => {
                                  const newSegments = [...pageSegments];
                                  newSegments[index].data = {
                                    ...heroData,
                                    hero_title: e.target.value
                                  };
                                  setPageSegments(newSegments);
                                }}
                                className="border-2 border-gray-600 text-white bg-gray-800"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-white">Subtitle (Optional)</Label>
                              <Input
                                value={heroData.hero_subtitle || ''}
                                onChange={(e) => {
                                  const newSegments = [...pageSegments];
                                  newSegments[index].data = {
                                    ...heroData,
                                    hero_subtitle: e.target.value
                                  };
                                  setPageSegments(newSegments);
                                }}
                                className="border-2 border-gray-600 text-white bg-gray-800"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-white">Description</Label>
                              <Textarea
                                value={heroData.hero_description || ''}
                                onChange={(e) => {
                                  const newSegments = [...pageSegments];
                                  newSegments[index].data = {
                                    ...heroData,
                                    hero_description: e.target.value
                                  };
                                  setPageSegments(newSegments);
                                }}
                                className="border-2 border-gray-600 text-white bg-gray-800 min-h-[100px]"
                              />
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                              <h4 className="text-white font-semibold mb-3">CTA Button</h4>
                              
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-white">Button Text</Label>
                                  <Input
                                    value={heroData.hero_cta_text || ''}
                                    onChange={(e) => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data = {
                                        ...heroData,
                                        hero_cta_text: e.target.value
                                      };
                                      setPageSegments(newSegments);
                                    }}
                                    className="border-2 border-gray-600 text-white bg-gray-800"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white">Button Link</Label>
                                  <Input
                                    value={heroData.hero_cta_link || ''}
                                    onChange={(e) => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data = {
                                        ...heroData,
                                        hero_cta_link: e.target.value
                                      };
                                      setPageSegments(newSegments);
                                    }}
                                    className="border-2 border-gray-600 text-white bg-gray-800"
                                    placeholder="#section-id or /path"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white">Button Style</Label>
                                  <Select 
                                    value={heroData.hero_cta_style || 'standard'}
                                    onValueChange={(value) => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data = {
                                        ...heroData,
                                        hero_cta_style: value
                                      };
                                      setPageSegments(newSegments);
                                    }}
                                  >
                                    <SelectTrigger className="border-2 border-gray-600 text-white bg-gray-800">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="standard">Standard (Yellow)</SelectItem>
                                      <SelectItem value="technical">Technical (Dark)</SelectItem>
                                      <SelectItem value="outline-white">Outline White</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Layout & Image Tab */}
                          <TabsContent value="layout" className="space-y-4 mt-0">
                            <div>
                              <Label className="text-white mb-2 block">Hero Image</Label>
                              {heroData.hero_image_url ? (
                                <div className="space-y-3">
                                  <div className="relative group">
                                    <img
                                      src={heroData.hero_image_url}
                                      alt="Hero Preview"
                                      className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <Button
                                      onClick={handleImageDelete}
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  {heroData.hero_image_metadata && (
                                    <div className="text-xs text-gray-400 space-y-1 bg-gray-900/50 p-3 rounded">
                                      <p><strong>Dateiname:</strong> {heroData.hero_image_metadata.originalFileName}</p>
                                      <p><strong>Größe:</strong> {heroData.hero_image_metadata.width} × {heroData.hero_image_metadata.height} px</p>
                                      <p><strong>Dateigröße:</strong> {formatFileSize(heroData.hero_image_metadata.fileSizeKB)}</p>
                                      <p><strong>Format:</strong> {heroData.hero_image_metadata.format}</p>
                                      <p><strong>Hochgeladen:</strong> {formatUploadDate(heroData.hero_image_metadata.uploadDate)}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label className="text-white">Alt Text (SEO)</Label>
                                    <Input
                                      value={heroData.hero_image_metadata?.altText || ''}
                                      onChange={(e) => {
                                        const newSegments = [...pageSegments];
                                        newSegments[index].data = {
                                          ...heroData,
                                          hero_image_metadata: {
                                            ...heroData.hero_image_metadata,
                                            altText: e.target.value
                                          }
                                        };
                                        setPageSegments(newSegments);
                                      }}
                                      placeholder="Beschreiben Sie das Bild für SEO..."
                                      className="border-2 border-gray-600 text-white bg-gray-800"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id={`hero-image-upload-${segment.id}`}
                                  />
                                  <label
                                    htmlFor={`hero-image-upload-${segment.id}`}
                                    className="cursor-pointer flex flex-col items-center gap-2"
                                  >
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <span className="text-sm text-gray-400">
                                      {uploading ? 'Uploading...' : 'Klicken zum Hochladen oder Datei hierher ziehen'}
                                    </span>
                                  </label>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-white">Image Dimensions</Label>
                                <select
                                  value={heroData.hero_image_dimensions || '600x600'}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_image_dimensions: e.target.value
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                                >
                                  <option value="600x600">600 × 600px (Square)</option>
                                  <option value="800x600">800 × 600px (4:3)</option>
                                  <option value="1200x800">1200 × 800px (3:2)</option>
                                  <option value="1920x1080">1920 × 1080px (16:9)</option>
                                </select>
                                <p className="text-sm text-gray-400 mt-1">Images will be cropped to this size</p>
                              </div>

                              <div>
                                <Label className="text-white">Crop Position</Label>
                                <select
                                  value={heroData.hero_crop_position || 'center'}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_crop_position: e.target.value
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                                >
                                  <option value="top">Top (Keep top, crop bottom)</option>
                                  <option value="center">Center (Crop equally)</option>
                                  <option value="bottom">Bottom (Keep bottom, crop top)</option>
                                </select>
                                <p className="text-sm text-gray-400 mt-1">Which part to keep when cropping</p>
                              </div>
                            </div>

                            {/* Image Position - Visual Selector */}
                            <div>
                              <Label className="text-white mb-3 block">Image Position</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_image_position: 'left'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-4 rounded-lg border-2 transition-all ${
                                    (heroData.hero_image_position || 'right') === 'left'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-12 h-8 bg-gray-700 rounded"></div>
                                    <div className="w-20 h-8 bg-gray-600 rounded"></div>
                                  </div>
                                  <span className="text-xs text-white">Image Left</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_image_position: 'right'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-4 rounded-lg border-2 transition-all ${
                                    (heroData.hero_image_position || 'right') === 'right'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-20 h-8 bg-gray-600 rounded"></div>
                                    <div className="w-12 h-8 bg-gray-700 rounded"></div>
                                  </div>
                                  <span className="text-xs text-white">Image Right</span>
                                </button>
                              </div>
                            </div>

                            {/* Layout Ratio - Visual Selector */}
                            <div>
                              <Label className="text-white mb-3 block">Layout Ratio (Text : Image)</Label>
                              <div className="grid grid-cols-3 gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_layout_ratio: '1-1'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    (heroData.hero_layout_ratio || '2-5') === '1-1'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="flex gap-1 mb-2">
                                    <div className="flex-1 h-6 bg-gray-600 rounded"></div>
                                    <div className="flex-1 h-6 bg-gray-700 rounded"></div>
                                  </div>
                                  <span className="text-xs text-white block">50 : 50</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_layout_ratio: '2-3'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    (heroData.hero_layout_ratio || '2-5') === '2-3'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="flex gap-1 mb-2">
                                    <div className="w-8 h-6 bg-gray-600 rounded"></div>
                                    <div className="flex-1 h-6 bg-gray-700 rounded"></div>
                                  </div>
                                  <span className="text-xs text-white block">40 : 60</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_layout_ratio: '2-5'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    (heroData.hero_layout_ratio || '2-5') === '2-5'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="flex gap-1 mb-2">
                                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                                    <div className="flex-1 h-6 bg-gray-700 rounded"></div>
                                  </div>
                                  <span className="text-xs text-white block">30 : 70</span>
                                </button>
                              </div>
                            </div>

                            {/* Top Spacing - Visual Selector */}
                            <div>
                              <Label className="text-white mb-3 block">Top Spacing</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_top_spacing: 'small'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    (heroData.hero_top_spacing || 'medium') === 'small'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="h-2 bg-gray-700 rounded mb-2"></div>
                                  <div className="h-6 bg-gray-600 rounded"></div>
                                  <span className="text-xs text-white block mt-2">Small (30px)</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_top_spacing: 'medium'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    (heroData.hero_top_spacing || 'medium') === 'medium'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                                  <div className="h-6 bg-gray-600 rounded"></div>
                                  <span className="text-xs text-white block mt-2">Medium (50px)</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_top_spacing: 'large'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    (heroData.hero_top_spacing || 'medium') === 'large'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                                  <div className="h-6 bg-gray-600 rounded"></div>
                                  <span className="text-xs text-white block mt-2">Large (70px)</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data = {
                                      ...heroData,
                                      hero_top_spacing: 'xlarge'
                                    };
                                    setPageSegments(newSegments);
                                  }}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    (heroData.hero_top_spacing || 'medium') === 'xlarge'
                                      ? 'border-[#f9dc24] bg-[#f9dc24]/10'
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                >
                                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                                  <div className="h-6 bg-gray-600 rounded"></div>
                                  <span className="text-xs text-white block mt-2">XL (90px)</span>
                                </button>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-end pt-4 border-t border-gray-600">
                          <Button
                            onClick={() => handleSaveSegments()}
                            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {segment.type === 'meta-navigation' && (() => {
                    // Build available segments list with their titles
                    // IMPORTANT: Use numeric segment_id from segmentRegistry, not string keys
                    const availableSegments = [];
                    
                    // Hero segment
                    if (segmentRegistry['hero']) {
                      availableSegments.push({
                        id: segmentRegistry['hero'].toString(),
                        title: content.hero_title || 'Produkt Hero'
                      });
                    }
                    
                    // Tiles segment
                    if (segmentRegistry['tiles']) {
                      availableSegments.push({
                        id: segmentRegistry['tiles'].toString(),
                        title: content.applications_title || 'Tiles Section'
                      });
                    }
                    
                    // Banner segment
                    if (segmentRegistry['banner']) {
                      availableSegments.push({
                        id: segmentRegistry['banner'].toString(),
                        title: bannerTitle || 'Banner Section'
                      });
                    }
                    
                    // Solutions/Image & Text segment
                    if (segmentRegistry['solutions']) {
                      availableSegments.push({
                        id: segmentRegistry['solutions'].toString(),
                        title: solutionsTitle || 'Image & Text Section'
                      });
                    }
                    
                    // Dynamic segments - ONLY include if they exist in segmentRegistry (not deleted)
                    pageSegments.forEach((seg) => {
                      if (seg.type !== 'meta-navigation' && seg.data?.title && segmentRegistry[seg.id]) {
                        availableSegments.push({
                          id: segmentRegistry[seg.id].toString(),
                          title: seg.data.title
                        });
                      }
                    });
                    
                    // Footer segment
                    if (segmentRegistry['footer']) {
                      availableSegments.push({
                        id: segmentRegistry['footer'].toString(),
                        title: 'Footer'
                      });
                    }
                    
                    return (
                      <MetaNavigationEditor
                        data={segment.data}
                        availableSegments={availableSegments}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                      />
                    );
                  })()}
                  {segment.type === 'tiles' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('tiles');
                    }
                    if (!segment.data.items) {
                      segment.data.items = [];
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`segment_${index}_title`} className="text-white">Section Title</Label>
                          <Input
                            id={`segment_${index}_title`}
                            value={segment.data.title || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.title = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            className="border-2 border-gray-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`segment_${index}_description`} className="text-white">Section Description</Label>
                          <Textarea
                            id={`segment_${index}_description`}
                            value={segment.data.description || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.description = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            rows={3}
                            className="border-2 border-gray-600"
                          />
                        </div>

                        {/* Column Layout */}
                        <div>
                          <Label htmlFor={`segment_${index}_columns`} className="text-white">Number of Columns</Label>
                          <select
                            id={`segment_${index}_columns`}
                            value={segment.data.columns || "3"}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.columns = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                          >
                            <option value="2">2 Columns</option>
                            <option value="3">3 Columns</option>
                            <option value="4">4 Columns</option>
                          </select>
                        </div>

                        {/* Tiles */}
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Tiles</h3>
                            <Button
                              onClick={() => {
                                const newSegments = [...pageSegments];
                                if (!newSegments[index].data.items) {
                                  newSegments[index].data.items = [];
                                }
                                newSegments[index].data.items.push({
                                  title: 'New Application',
                                  description: 'Add description here...',
                                  ctaLink: '',
                                  ctaStyle: 'standard',
                                  ctaText: 'Learn More',
                                  imageUrl: '',
                                  icon: ''
                                });
                                setPageSegments(newSegments);
                                toast.success("New tile added! Don't forget to save changes.");
                              }}
                              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add New Tile
                            </Button>
                          </div>
                          {segment.data.items.map((tile: any, tileIndex: number) => (
                          <Card key={tileIndex} className={`border-2 ${tileIndex % 2 === 0 ? 'bg-gray-600 border-gray-500' : 'bg-gray-800 border-gray-700'}`}>
                            <CardContent className="pt-6 space-y-3">
                              <div className="flex items-center justify-between mb-4">
                                <div className={`px-4 py-2 ${tileIndex % 2 === 0 ? 'bg-[#f9dc24]' : 'bg-orange-400'} text-black text-base font-bold rounded-md shadow-lg`}>
                                  Tile {tileIndex + 1}
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="flex items-center gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete "Tile {tileIndex + 1}". This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          const newSegments = [...pageSegments];
                                          newSegments[index].data.items = newSegments[index].data.items.filter((_: any, i: number) => i !== tileIndex);
                                          setPageSegments(newSegments);
                                          toast.success("Tile deleted! Don't forget to save changes.");
                                        }}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              
                              {/* Image Upload */}
                              <div>
                                <Label htmlFor={`dynamic_tile_image_${index}_${tileIndex}`} className="text-white">Tile Image (Optional)</Label>
                                <p className="text-sm text-white mb-2">
                                  {tile.imageUrl ? "Current image - click 'Replace' to upload a new one" : "Upload an image for this tile (appears above the title)"}
                                </p>
                                {tile.imageUrl && (
                                  <div className="mb-3 max-w-xs">
                                    <img 
                                      src={tile.imageUrl} 
                                      alt={`Tile ${tileIndex + 1}`} 
                                      className="w-full h-auto object-contain rounded-lg border-2 border-gray-600"
                                    />
                                  </div>
                                )}
                                
                                {tile.imageUrl ? (
                                  <Button
                                    type="button"
                                    onClick={() => document.getElementById(`dynamic_tile_image_${index}_${tileIndex}`)?.click()}
                                    disabled={uploading}
                                    className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                                  >
                                    {uploading ? "Uploading..." : "Replace Image"}
                                  </Button>
                                ) : null}
                                
                                <Input
                                  id={`dynamic_tile_image_${index}_${tileIndex}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    if (!e.target.files || !e.target.files[0]) return;
                                    
                                    const file = e.target.files[0];
                                    
                                    if (!file.type.startsWith('image/')) {
                                      toast.error("Please upload an image file");
                                      return;
                                    }

                                    if (file.size > 5 * 1024 * 1024) {
                                      toast.error("Image size must be less than 5MB");
                                      return;
                                    }

                                    setUploading(true);

                                    try {
                                      const fileExt = file.name.split('.').pop();
                                      const fileName = `dynamic-tile-${index}-${tileIndex}-${Date.now()}.${fileExt}`;
                                      const filePath = `${fileName}`;

                                      const { error: uploadError } = await supabase.storage
                                        .from('page-images')
                                        .upload(filePath, file, {
                                          cacheControl: '3600',
                                          upsert: false
                                        });

                                      if (uploadError) throw uploadError;

                                      const { data: { publicUrl } } = supabase.storage
                                        .from('page-images')
                                        .getPublicUrl(filePath);

                                      // Extract image metadata
                                      const metadata = await extractImageMetadata(file, publicUrl);

                                      const newSegments = [...pageSegments];
                                      newSegments[index].data.items[tileIndex].imageUrl = publicUrl;
                                      newSegments[index].data.items[tileIndex].metadata = { ...metadata, altText: '' };
                                      setPageSegments(newSegments);

                                      toast.success("Tile image uploaded successfully!");
                                    } catch (error: any) {
                                      toast.error("Error uploading image: " + error.message);
                                    } finally {
                                      setUploading(false);
                                    }
                                  }}
                                  disabled={uploading}
                                  className={`border-2 border-gray-600 ${tile.imageUrl ? "hidden" : ""}`}
                                />
                                
                                {/* Image Metadata Display */}
                                {tile.metadata && (
                                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                                    <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-gray-600">Original Name:</span>
                                        <p className="text-black font-medium">{tile.metadata.originalFileName}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Dimensions:</span>
                                        <p className="text-black font-medium">{tile.metadata.width} × {tile.metadata.height} px</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">File Size:</span>
                                        <p className="text-black font-medium">{formatFileSize(tile.metadata.fileSizeKB)}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Format:</span>
                                        <p className="text-black font-medium uppercase">{tile.metadata.format}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-gray-600">Upload Date:</span>
                                        <p className="text-black font-medium">{formatUploadDate(tile.metadata.uploadDate)}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                      <Label htmlFor={`dynamic_tile_alt_${index}_${tileIndex}`} className="text-black text-base">Alt Text (SEO)</Label>
                                      <Input
                                        id={`dynamic_tile_alt_${index}_${tileIndex}`}
                                        type="text"
                                        value={tile.metadata.altText || ''}
                                        onChange={(e) => {
                                          const newSegments = [...pageSegments];
                                          if (newSegments[index].data.items[tileIndex].metadata) {
                                            newSegments[index].data.items[tileIndex].metadata.altText = e.target.value;
                                            setPageSegments(newSegments);
                                          }
                                        }}
                                        placeholder="Describe this image for accessibility and SEO"
                                        className="mt-2 bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
                                      />
                                      <p className="text-white text-sm mt-1">Provide a descriptive alt text for screen readers and search engines</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Icon Selection */}
                              <div>
                                <Label htmlFor={`dynamic_tile_icon_${index}_${tileIndex}`} className="text-white">Icon (Optional)</Label>
                                <Select
                                  value={tile.icon || "none"}
                                  onValueChange={(value) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].icon = value === "none" ? "" : value;
                                    setPageSegments(newSegments);
                                  }}
                                >
                                  <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                                    <SelectValue placeholder="Select an icon" className="text-black" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    <SelectItem value="none" className="text-black">No Icon</SelectItem>
                                    <SelectItem value="FileText" className="text-black">Document (FileText)</SelectItem>
                                    <SelectItem value="Download" className="text-black">Download</SelectItem>
                                    <SelectItem value="BarChart3" className="text-black">Bar Chart</SelectItem>
                                    <SelectItem value="Zap" className="text-black">Lightning (Zap)</SelectItem>
                                    <SelectItem value="Shield" className="text-black">Shield</SelectItem>
                                    <SelectItem value="Eye" className="text-black">Eye</SelectItem>
                                    <SelectItem value="Car" className="text-black">Car</SelectItem>
                                    <SelectItem value="Smartphone" className="text-black">Smartphone</SelectItem>
                                    <SelectItem value="Heart" className="text-black">Heart</SelectItem>
                                    <SelectItem value="CheckCircle" className="text-black">Check Circle</SelectItem>
                                    <SelectItem value="Lightbulb" className="text-black">Lightbulb</SelectItem>
                                    <SelectItem value="Monitor" className="text-black">Monitor</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-sm text-white mt-1">
                                  Icon appears in a yellow circle above the title
                                </p>
                              </div>
                              
                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_title`} className="text-white">Title</Label>
                                <Input
                                  id={`tile_${index}_${tileIndex}_title`}
                                  value={tile.title}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].title = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  className="border-2 border-gray-600"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_description`} className="text-white">Description</Label>
                                <Textarea
                                  id={`tile_${index}_${tileIndex}_description`}
                                  value={tile.description}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].description = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  rows={3}
                                  className="border-2 border-gray-600"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_cta_text`} className="text-white">Button Text</Label>
                                <Input
                                  id={`tile_${index}_${tileIndex}_cta_text`}
                                  value={tile.ctaText || 'Learn More'}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].ctaText = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  className="border-2 border-gray-600"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_cta_link`} className="text-white">Button Link</Label>
                                <Input
                                  id={`tile_${index}_${tileIndex}_cta_link`}
                                  value={tile.ctaLink || ''}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].ctaLink = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  placeholder="/page, #section, or https://..."
                                  className="border-2 border-gray-600"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_cta_style`} className="text-white">Button Style</Label>
                                <select
                                  id={`tile_${index}_${tileIndex}_cta_style`}
                                  value={tile.ctaStyle || 'standard'}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].ctaStyle = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                                >
                                  <option value="standard">Standard (Yellow with Black Text)</option>
                                  <option value="technical">Technical (Dark Gray with White Text)</option>
                                </select>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-600">
                        <Button
                          onClick={async () => {
                            setSaving(true);
    try {
      // Ensure all segments have correct positions based on current order
      const segmentsWithPositions = pageSegments.map((seg, idx) => ({
        ...seg,
        position: idx
      }));
      
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
                                  content_type: "json",
                                  content_value: JSON.stringify(segmentsWithPositions),
                                  updated_at: new Date().toISOString(),
                                  updated_by: user?.id
                                }, {
                                  onConflict: 'page_slug,section_key'
                                });

                              if (error) throw error;
                              
                              // Update local state with new positions
                              setPageSegments(segmentsWithPositions);
                              
                              toast.success("Tiles segment saved successfully!");
                            } catch (error: any) {
                              toast.error("Error saving segment: " + error.message);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  );
                  })()}

                  {segment.type === 'image-text' && (() => {
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('image-text');
                    }
                    if (!segment.data.items) {
                      segment.data.items = [];
                    }
                    
                    return (
                      <div className="space-y-4">
                        {/* Hero Image Upload */}
                        <div>
                          <Label className="text-white">Section Image (optional)</Label>
                          <p className="text-sm text-white mb-2">
                            {segment.data.heroImageUrl ? "Current image - click 'Replace' to upload a new one" : "Upload an image for this section"}
                          </p>
                          {segment.data.heroImageUrl && (
                            <div className="mb-3 max-w-xs">
                              <img 
                                src={segment.data.heroImageUrl} 
                                alt="Section Image" 
                                className="w-full h-auto object-contain rounded-lg border-2 border-gray-600"
                              />
                            </div>
                          )}
                          
                          {segment.data.heroImageUrl ? (
                            <Button
                              type="button"
                              onClick={() => document.getElementById(`image_text_hero_${index}`)?.click()}
                              disabled={uploading}
                              className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                            >
                              {uploading ? "Uploading..." : "Replace Image"}
                            </Button>
                          ) : null}
                          
                          <Input
                            id={`image_text_hero_${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageTextHeroImageUpload(index, e)}
                            disabled={uploading}
                            className={`border-2 border-gray-600 ${segment.data.heroImageUrl ? "hidden" : ""}`}
                          />
                          
                          {/* Image Metadata Display */}
                          {segment.data.heroImageMetadata && (
                            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                              <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Original Name:</span>
                                  <p className="text-black font-medium">{segment.data.heroImageMetadata.originalFileName}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Dimensions:</span>
                                  <p className="text-black font-medium">{segment.data.heroImageMetadata.width} × {segment.data.heroImageMetadata.height} px</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">File Size:</span>
                                  <p className="text-black font-medium">{formatFileSize(segment.data.heroImageMetadata.fileSizeKB)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Format:</span>
                                  <p className="text-black font-medium uppercase">{segment.data.heroImageMetadata.format}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-600">Upload Date:</span>
                                  <p className="text-black font-medium">{formatUploadDate(segment.data.heroImageMetadata.uploadDate)}</p>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <Label htmlFor={`image_text_hero_alt_${index}`} className="text-black text-base">Alt Text (SEO)</Label>
                                <Input
                                  id={`image_text_hero_alt_${index}`}
                                  type="text"
                                  value={segment.data.heroImageMetadata.altText || ''}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    if (newSegments[index].data.heroImageMetadata) {
                                      newSegments[index].data.heroImageMetadata.altText = e.target.value;
                                      setPageSegments(newSegments);
                                    }
                                  }}
                                  placeholder="Describe this image for accessibility and SEO"
                                  className="mt-2 bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
                                />
                                <p className="text-white text-sm mt-1">Provide a descriptive alt text for screen readers and search engines</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`segment_${index}_title`} className="text-white">Section Title</Label>
                          <Input
                            id={`segment_${index}_title`}
                            value={segment.data.title || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.title = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            className="border-2 border-gray-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`segment_${index}_subtext`} className="text-white">Section Subtext (optional)</Label>
                          <Textarea
                            id={`segment_${index}_subtext`}
                            value={segment.data.subtext || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.subtext = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            rows={2}
                            className="border-2 border-gray-600"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`segment_${index}_layout`} className="text-white">Layout</Label>
                          <select
                            id={`segment_${index}_layout`}
                            value={segment.data.layout || '2-col'}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.layout = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md"
                          >
                            <option value="1-col">1 Column (Full Width)</option>
                            <option value="2-col">2 Columns</option>
                            <option value="3-col">3 Columns</option>
                          </select>
                        </div>

                        {/* Items */}
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Items</h3>
                            <Button
                              onClick={() => {
                                const newSegments = [...pageSegments];
                                if (!newSegments[index].data.items) {
                                  newSegments[index].data.items = [];
                                }
                                newSegments[index].data.items.push({
                                  title: 'New Item',
                                  description: 'Add description here...',
                                  imageUrl: ''
                                });
                                setPageSegments(newSegments);
                                toast.success("New item added! Don't forget to save changes.");
                              }}
                              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add Item
                            </Button>
                          </div>
                          {segment.data.items.map((item: any, itemIndex: number) => (
                            <Card key={itemIndex} className="border-2 bg-gray-600 border-gray-500">
                              <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md shadow-lg">
                                    Item {itemIndex + 1}
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data.items.splice(itemIndex, 1);
                                      setPageSegments(newSegments);
                                      toast.success("Item deleted! Don't forget to save changes.");
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>

                                <div>
                                  <Label className="text-white">Title</Label>
                                  <Input
                                    value={item.title || ''}
                                    onChange={(e) => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data.items[itemIndex].title = e.target.value;
                                      setPageSegments(newSegments);
                                    }}
                                    className="border-2 border-gray-600"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white">Description</Label>
                                  <Textarea
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data.items[itemIndex].description = e.target.value;
                                      setPageSegments(newSegments);
                                    }}
                                    rows={4}
                                    className="border-2 border-gray-600"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white">Item Image (optional)</Label>
                                  <p className="text-sm text-white mb-2">
                                    {item.imageUrl ? "Current image - click 'Replace' to upload a new one" : "Upload an image for this item"}
                                  </p>
                                  {item.imageUrl && (
                                    <div className="mb-3 max-w-xs">
                                      <img 
                                        src={item.imageUrl} 
                                        alt={item.title} 
                                        className="w-full h-auto object-contain rounded-lg border-2 border-gray-600"
                                      />
                                    </div>
                                  )}
                                  
                                  {item.imageUrl ? (
                                    <Button
                                      type="button"
                                      onClick={() => document.getElementById(`image_text_item_${index}_${itemIndex}`)?.click()}
                                      disabled={uploading}
                                      className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                                    >
                                      {uploading ? "Uploading..." : "Replace Image"}
                                    </Button>
                                  ) : null}
                                  
                                  <Input
                                    id={`image_text_item_${index}_${itemIndex}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageTextItemImageUpload(index, itemIndex, e)}
                                    disabled={uploading}
                                    className={`border-2 border-gray-600 ${item.imageUrl ? "hidden" : ""}`}
                                  />
                                  
                                  {/* Image Metadata Display */}
                                  {item.metadata && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-300 space-y-2">
                                      <h4 className="font-semibold text-black text-lg mb-3">Image Information</h4>
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <span className="text-gray-600">Original Name:</span>
                                          <p className="text-black font-medium">{item.metadata.originalFileName}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Dimensions:</span>
                                          <p className="text-black font-medium">{item.metadata.width} × {item.metadata.height} px</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">File Size:</span>
                                          <p className="text-black font-medium">{formatFileSize(item.metadata.fileSizeKB)}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Format:</span>
                                          <p className="text-black font-medium uppercase">{item.metadata.format}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <span className="text-gray-600">Upload Date:</span>
                                          <p className="text-black font-medium">{formatUploadDate(item.metadata.uploadDate)}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-4">
                                        <Label htmlFor={`image_text_item_alt_${index}_${itemIndex}`} className="text-black text-base">Alt Text (SEO)</Label>
                                        <Input
                                          id={`image_text_item_alt_${index}_${itemIndex}`}
                                          type="text"
                                          value={item.metadata.altText || ''}
                                          onChange={(e) => {
                                            const newSegments = [...pageSegments];
                                            if (newSegments[index].data.items[itemIndex].metadata) {
                                              newSegments[index].data.items[itemIndex].metadata.altText = e.target.value;
                                              setPageSegments(newSegments);
                                            }
                                          }}
                                          placeholder="Describe this image for accessibility and SEO"
                                          className="mt-2 bg-white border-2 border-gray-300 focus:border-[#f9dc24] text-xl text-black placeholder:text-gray-400 h-12"
                                        />
                                        <p className="text-white text-sm mt-1">Provide a descriptive alt text for screen readers and search engines</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-600">
                          <Button
                            onClick={async () => {
                              setSaving(true);
                              try {
                                // Ensure all segments have correct positions based on current order
                                const segmentsWithPositions = pageSegments.map((seg, idx) => ({
                                  ...seg,
                                  position: idx
                                }));
                                
                                const { error } = await supabase
                                  .from("page_content")
                                  .upsert({
                                    page_slug: selectedPage,
                                    section_key: "page_segments",
                                    content_type: "json",
                                    content_value: JSON.stringify(segmentsWithPositions),
                                    updated_at: new Date().toISOString(),
                                    updated_by: user?.id
                                  }, {
                                    onConflict: 'page_slug,section_key'
                                  });

                                if (error) throw error;
                                
                                // Update local state with new positions
                                setPageSegments(segmentsWithPositions);
                                
                                toast.success("Image & Text segment saved successfully!");
                              } catch (error: any) {
                                toast.error("Error saving segment: " + error.message);
                              } finally {
                                setSaving(false);
                              }
                            }}
                            disabled={saving}
                            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  {segment.type === 'feature-overview' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('feature-overview');
                    }
                    
                    return (
                      <FeatureOverviewEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        currentPageSlug={selectedPage}
                        segmentId={segment.id}
                      />
                    );
                  })()}

                  {segment.type === 'table' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('table');
                    }
                    
                    return (
                      <TableEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        currentPageSlug={selectedPage}
                        segmentId={segment.id}
                      />
                    );
                  })()}

                  {segment.type === 'faq' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('faq');
                    }
                    
                    return (
                      <FAQEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        currentPageSlug={selectedPage}
                        segmentId={segment.id}
                      />
                    );
                  })()}

                  {segment.type === 'video' && (() => {
                    // Initialize with default data if needed
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('video');
                    }
                    
                    return (
                      <VideoSegmentEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const updatedSegments = pageSegments.map(s =>
                            s.id === segment.id ? { ...s, data: newData } : s
                          );
                          setPageSegments(updatedSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        currentPageSlug={selectedPage}
                        segmentId={segment.id}
                      />
                    );
                  })()}

                  {segment.type === 'news' && (
                    <NewsSegmentEditor
                      pageSlug={selectedPage}
                      segmentId={segment.id}
                      onUpdate={() => handleSaveSegments()}
                      currentPageSlug={selectedPage}
                    />
                  )}

                  {segment.type === 'full-hero' && (
                    <FullHeroEditor
                      pageSlug={selectedPage}
                      segmentId={segment.id}
                      onSave={() => handleSaveSegments()}
                    />
                  )}

                  {segment.type === 'intro' && (
                    <IntroEditor
                      pageSlug={selectedPage}
                      segmentKey={segment.id}
                      onSave={() => handleSaveSegments()}
                    />
                  )}

                  {segment.type === 'industries' && (
                    <IndustriesSegmentEditor
                      data={segment.data || {}}
                      onChange={(newData) => {
                        const updatedSegments = pageSegments.map(s =>
                          s.id === segment.id ? { ...s, data: newData } : s
                        );
                        setPageSegments(updatedSegments);
                      }}
                      onSave={() => handleSaveSegments()}
                    />
                  )}

                  {segment.type === 'specification' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('specification');
                    }
                    
                    return (
                      <SpecificationEditor
                        segmentId={segment.id}
                        title={segment.data.title || 'Detailed Specifications'}
                        rows={segment.data.rows || []}
                        onUpdate={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        saving={saving}
                        currentPageSlug={selectedPage}
                      />
                    );
                  })()}

                  {segment.type === 'product-hero-gallery' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('product-hero-gallery');
                    }
                    
                    return (
                      <ProductHeroGalleryEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        pageSlug={selectedPage}
                        segmentId={segment.id}
                      />
                    );
                  })()}

                  {segment.type === 'banner' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('banner');
                    }
                    
                    return (
                      <BannerEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        pageSlug={selectedPage}
                        segmentId={segment.id}
                      />
                    );
                  })()}

                  {segment.type !== 'tiles' && segment.type !== 'image-text' && segment.type !== 'feature-overview' && segment.type !== 'table' && segment.type !== 'faq' && segment.type !== 'video' && segment.type !== 'specification' && segment.type !== 'product-hero-gallery' && segment.type !== 'meta-navigation' && segment.type !== 'banner' && (
                    <div className="p-8 bg-gray-700 rounded-lg border border-gray-600">
                       <p className="text-white text-center">
                        Segment editor for {segment.type} coming soon. This segment has been saved.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        )}
      </div>

      {/* Create New CMS Page Dialog */}
      <Dialog open={isCreateCMSDialogOpen} onOpenChange={setIsCreateCMSDialogOpen}>
        <DialogContent className="max-w-4xl bg-gray-900 border-2 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Create New CMS Page</DialogTitle>
            <DialogDescription className="text-base text-gray-300">
              Fully automated CMS page creation with one click. The system will handle all backend setup, routing, and frontend rendering automatically.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="page-select" className="text-base font-semibold text-white">
                Select Page
              </Label>
              <HierarchicalPageSelect
                value={selectedPageForCMS}
                onValueChange={setSelectedPageForCMS}
              />
              <p className="text-sm text-gray-400">
                Choose a page that is not yet CMS-enabled (pages without ✓ checkmark)
              </p>
            </div>

              {selectedPageForCMS && (
              <div className="rounded-lg border-2 border-[#f9dc24] bg-gray-800 p-5">
                <h4 className="font-semibold text-[#f9dc24] mb-3 text-lg">🚀 Fully Automated Setup</h4>
                <ul className="space-y-2 text-sm text-gray-200">
                  <li className="flex items-start gap-2">
                    <span className="text-[#f9dc24] mt-0.5">✓</span>
                    <span><strong>Backend Infrastructure:</strong> Automatic creation in segment_registry, page_content, and page_registry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f9dc24] mt-0.5">✓</span>
                    <span><strong>Frontend Rendering:</strong> Catch-all routes handle any new page automatically via DynamicCMSPage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f9dc24] mt-0.5">✓</span>
                    <span><strong>SEO Configuration:</strong> Default meta tags, Open Graph, and schema markup initialized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f9dc24] mt-0.5">✓</span>
                    <span><strong>Admin Dashboard:</strong> Instant access to edit all page segments</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Note:</strong> After creation, you can immediately start editing content. To add the page to the main navigation, manually update navigationData.ts files.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateCMSDialogOpen(false);
                setSelectedPageForCMS("");
              }}
              disabled={isCreatingCMS}
              className="border-2 border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={createNewCMSPage}
              disabled={!selectedPageForCMS || isCreatingCMS}
              className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-bold border-2 border-black"
            >
              {isCreatingCMS ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create CMS Page
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
