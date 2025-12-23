import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
// User and Session types are now handled by useAdminAuth hook
import { Save, Plus, Trash2, GripVertical, Eye, Copy, PlayCircle, Upload, FileText, Zap, Shield, Monitor, Camera, Settings, Sparkles, Languages, Navigation2, Type, LayoutGrid, Image as ImageIcon, ListChecks, Table2, HelpCircle, Images, Building2, List, PanelBottom, SplitSquareVertical, Palette, History as HistoryIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { TilesSegmentEditor } from '@/components/admin/TilesSegmentEditor';
import { SEOEditor } from '@/components/admin/SEOEditor';
import SpecificationEditor from '@/components/admin/SpecificationEditor';
import NewsSegmentEditor from '@/components/admin/NewsSegmentEditor';
import NewsListSegmentEditor from '@/components/admin/NewsListSegmentEditor';
import BannerEditor from '@/components/admin/BannerEditor';
import { BannerSegmentEditor } from '@/components/admin/BannerSegmentEditor';
import { BannerPEditor } from '@/components/admin/BannerPEditor';
import { FullHeroEditor } from '@/components/admin/FullHeroEditor';
import { ProductHeroEditor } from '@/components/admin/ProductHeroEditor';
import { SplitScreenSegmentEditor } from '@/components/admin/SplitScreenSegmentEditor';
import IntroEditor from '@/components/admin/IntroEditor';
import { IndustriesSegmentEditor } from '@/components/admin/IndustriesSegmentEditor';
import { ImageTextEditor } from '@/components/admin/ImageTextEditor';
import { CopySegmentDialog } from '@/components/admin/CopySegmentDialog';
import { HierarchicalPageSelect } from '@/components/admin/HierarchicalPageSelect';
import { useAdminAutosave, loadAutosavedData, clearAutosavedData, hasAutosavedData } from '@/hooks/useAdminAutosave';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ImageMetadata, extractImageMetadata, formatFileSize, formatUploadDate } from '@/types/imageMetadata';
import DebugEditor from '@/components/admin/DebugEditor';
import { CreateCMSPageDialog } from '@/components/admin/CreateCMSPageDialog';
import { CopyPageDialog } from '@/components/admin/CopyPageDialog';
import { GlossaryManager } from '@/components/admin/GlossaryManager';
import { loadAltTextFromMapping } from '@/utils/loadAltTextFromMapping';
import { FooterEditor } from '@/components/admin/FooterEditor';
import { ActionHeroEditor } from '@/components/admin/ActionHeroEditor';
import { EventsSegmentEditor } from '@/components/admin/EventsSegmentEditor';
import { ProductListSegmentEditor } from '@/components/admin/ProductListSegmentEditor';
import { DownloadsSegmentEditor } from '@/components/admin/DownloadsSegmentEditor';
import { createContentBackup, createMultipleBackups } from '@/utils/createContentBackup';
import { VersionHistoryPanel } from '@/components/admin/VersionHistoryPanel';
import { SegmentHistoryButton } from '@/components/admin/SegmentHistoryButton';
import { TemplateSelectionDialog } from '@/components/admin/dashboard/TemplateSelectionDialog';
import { WelcomeTab } from '@/components/admin/dashboard/WelcomeTab';
import { AdminHeader } from '@/components/admin/dashboard/AdminHeader';
import { DesignElementDialog } from '@/components/admin/dashboard/DesignElementDialog';
import { NavigationCtaDialog } from '@/components/admin/dashboard/NavigationCtaDialog';
import { FlyoutContentDialog } from '@/components/admin/dashboard/FlyoutContentDialog';
import { DynamicSegmentRenderer } from '@/components/admin/dashboard/DynamicSegmentRenderer';
import { 
  STATIC_SEGMENT_IDS, 
  INDUSTRY_PARENT_CATEGORY_BY_SLUG,
  LANGUAGES, 
  DESIGN_ICON_OPTIONS, 
  CTA_GROUP_OPTIONS,
  buildSegmentLabel,
  getSegmentTypeName
} from '@/components/admin/dashboard/AdminConstants';
import { CMS_VERSION } from '@/components/admin/dashboard/config';
import { getDefaultSegmentData, getLanguageIndependentFields } from '@/components/admin/dashboard/segmentUtils';
import { createNewCMSPage, createNewCMSPageWithSlug } from '@/components/admin/dashboard/cmsPageUtils';
import { 
  PageInfo, 
  isAllowedPageLevel, 
  resolvePageSlug as resolvePageSlugUtil,
  loadPageInfo as loadPageInfoUtil,
  saveFlyoutInfo,
  clearFlyoutInfo,
  saveDesignElement,
  removeDesignElement,
  saveCtaConfig,
  loadFlyoutTranslations,
  handleFlyoutImageSelection
} from '@/components/admin/dashboard/pageRegistryUtils';
import { 
  loadSegmentRegistryData, 
  calculateGlobalMaxSegmentId as calcGlobalMaxSegmentId,
  setGlobalReverseRegistry 
} from '@/components/admin/dashboard/segmentRegistryUtils';
import {
  validateImageFile,
  uploadImageToStorage,
  handleHeroImageUpload,
  handleTileImageUpload as handleTileImageUploadUtil,
  handleSolutionImageUploadUtil,
  handleImageTextHeroUpload,
  handleImageTextItemUpload,
  handleFooterTeamImageUploadUtil,
  handleBannerImageUploadUtil,
  UploadContext
} from '@/components/admin/dashboard/imageUploadUtils';
import {
  addSegment,
  deleteSegment,
  saveSegments,
  autoSaveSegmentDebounced,
  SegmentContext,
  checkSegmentConflicts
} from '@/components/admin/dashboard/segmentManagementUtils';
import {
  saveHeroSection,
  saveApplicationsSection,
  saveFooterSection,
  saveSEOSettings,
  saveBannerSection,
  saveSolutionsSection,
  autoSaveTileImageUploadUtil,
  SaveContext
} from '@/components/admin/dashboard/saveContentUtils';
import {
  parseContentItems,
  filterTabOrder,
  rebuildTabOrderFromSegments,
  saveUpdatedSegments,
  saveCleanedTabOrder
} from '@/components/admin/dashboard/contentLoadingUtils';
import {
  addNewSegment,
  deleteSegment as deleteSegmentFull,
  saveAllSegments,
  SegmentOperationContext
} from '@/components/admin/dashboard/segmentOperationsUtils';
import { ContentItem } from '@/components/admin/dashboard/contentLoadingUtils';
import { SortableTab } from '@/components/admin/dashboard/SortableTab';
import { AdminDashboardErrorBoundary } from '@/components/admin/dashboard/AdminErrorBoundary';
import { TileItem, BannerImage, SolutionItem } from '@/components/admin/dashboard/types';

const AdminDashboard = () => {
  // Authentication state from hook
  const { user, session, isAdmin, isEditor, allowedPages, loading, handleLogout, addAllowedPage } = useAdminAuth();
  
  const [content, setContent] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const navigationData = useNavigationData();
  
  // STATIC_SEGMENT_IDS and INDUSTRY_PARENT_CATEGORY_BY_SLUG are imported from AdminConstants
  
  // Get selected page from URL parameter
  // Keep full hierarchical slug if provided, otherwise use the raw value
  const searchParams = new URLSearchParams(location.search);
  const rawSelectedPage = searchParams.get('page') || '';
  // Use the full slug if it contains slashes, otherwise keep the raw value
  // This allows both hierarchical (your-solution/automotive) and simple (automotive) slugs
  // IMPORTANT: Empty string means no page selected (show Welcome screen)
  // If explicitly ?page=index, show index page editor
  const selectedPage = rawSelectedPage;
  const [resolvedPageSlug, setResolvedPageSlug] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
  const [tilesColumns, setTilesColumns] = useState<string>("3");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // legacy global flag, kept for compatibility
  // Separate uploading states per area to avoid blocking all uploads when one fails
  const [heroUploading, setHeroUploading] = useState(false);
  const [tileUploadingIndex, setTileUploadingIndex] = useState<number | null>(null);
  const [solutionsUploadingIndex, setSolutionsUploadingIndex] = useState<number | null>(null);
  const [imageTextHeroUploadingIndex, setImageTextHeroUploadingIndex] = useState<number | null>(null);
  const [imageTextItemUploadingKey, setImageTextItemUploadingKey] = useState<string | null>(null);
  const [footerUploading, setFooterUploading] = useState(false);
  const [bannerUploadingIndex, setBannerUploadingIndex] = useState<number | null>(null);
  const [dynamicTileUploadingKey, setDynamicTileUploadingKey] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImageMetadata, setHeroImageMetadata] = useState<ImageMetadata | null>(null);
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
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
  const [activeTab, setActiveTabState] = useState<string>("");
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [nextSegmentId, setNextSegmentId] = useState<number>(5); // Start from 5 after static segments (1-4)
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Wrapper to persist activeTab to localStorage (persists across page navigations)
  // Use selectedPage (from URL) as key since it's available immediately
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    // Use selectedPage directly since it's from URL and always available
    const pageKey = selectedPage || 'index';
    if (tab) {
      localStorage.setItem(`admin-activeTab-${pageKey}`, tab);
      console.log("[AdminDashboard] Saved activeTab:", tab, "for page:", pageKey);
    }
  };
  
  // Note: activeTab restoration from localStorage is handled in processLoadedContent (lines ~956-967)
  // after tab_order is fully loaded from the database, not in a separate useEffect
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [footerCtaTitle, setFooterCtaTitle] = useState<string>("");
  const [footerCtaDescription, setFooterCtaDescription] = useState<string>("");
  const [footerContactHeadline, setFooterContactHeadline] = useState<string>("");
  const [footerContactSubline, setFooterContactSubline] = useState<string>("");
  const [footerContactDescription, setFooterContactDescription] = useState<string>("");
  const [footerTeamImageUrl, setFooterTeamImageUrl] = useState<string>("");
  const [footerTeamImageMetadata, setFooterTeamImageMetadata] = useState<ImageMetadata | null>(null);
  const [footerTeamQuote, setFooterTeamQuote] = useState<string>("");
  
  // handleLogout is now provided by useAdminAuth hook

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const safeTabOrder = tabOrder || [];
    // Calculate new order
    const oldIndex = safeTabOrder.indexOf(String(active.id));
    const newIndex = safeTabOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newOrder = arrayMove(safeTabOrder, oldIndex, newIndex);
    
    // Update local state immediately for responsive UI
    setTabOrder(newOrder);
    
    // Save to database
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(newOrder),
          language: editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: currentUser.id
        }, { onConflict: 'page_slug,section_key,language' });

      if (error) {
        console.error("Error saving tab order:", error);
        toast.error("Failed to save segment order");
        // Revert to old order on error
        setTabOrder(tabOrder);
      } else {
        console.log("✅ Tab order saved successfully:", newOrder);
        toast.success("Segment order saved");
      }
    } catch (error) {
      console.error("Error saving tab order:", error);
      toast.error("Failed to save segment order");
      // Revert to old order on error
      setTabOrder(tabOrder);
    }
  };

  const handleDeleteStaticSegment = async (key: keyof typeof STATIC_SEGMENT_IDS) => {
    toast.error(`Static segment "${key}" cannot be deleted via UI yet.`);
  };

  const handleSaveHero = async () => {
    if (!user) return;
    setSaving(true);
    const ctx: SaveContext = { userId: user.id, resolvedPageSlug: resolvedPageSlug || selectedPage, selectedPage, editorLanguage };
    await saveHeroSection(ctx, content, heroImagePosition, heroLayout, heroTopPadding, heroCtaLink, heroCtaStyle, heroImageUrl, heroImageMetadata);
    setSaving(false);
  };
  const [footerTeamName, setFooterTeamName] = useState<string>("");
  const [footerTeamTitle, setFooterTeamTitle] = useState<string>("");
  const [footerButtonText, setFooterButtonText] = useState<string>("");
  const [segmentRegistry, setSegmentRegistry] = useState<Record<string, number>>({});
  const [isSEOEditorOpen, setIsSEOEditorOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
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
  const [isCopyPageDialogOpen, setIsCopyPageDialogOpen] = useState(false);
  const [selectedPageForCMS, setSelectedPageForCMS] = useState<string>("");
  const [isCreatingCMS, setIsCreatingCMS] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'de', 'ja', 'ko', 'zh']);
  const [editorLanguage, setEditorLanguage] = useState<'en' | 'de' | 'ja' | 'ko' | 'zh'>('en');
  const [pageInfo, setPageInfo] = useState<{
    pageId: number;
    pageTitle: string;
    pageSlug: string;
    parentSlug?: string | null;
    designIcon?: string | null;
    flyoutImageUrl?: string | null;
    flyoutDescription?: string | null;
    ctaGroup?: string | null;
    ctaLabel?: string | null;
    ctaIcon?: string | null;
    targetPageSlug?: string | null;
  } | null>(null);
  const [isDesignElementDialogOpen, setIsDesignElementDialogOpen] = useState(false);
  const [pendingDesignIcon, setPendingDesignIcon] = useState<string | null>(null);
  const [isFlyoutDialogOpen, setIsFlyoutDialogOpen] = useState(false);
  const [flyoutImageUrl, setFlyoutImageUrl] = useState<string | null>(null);
  const [flyoutDescriptionTranslations, setFlyoutDescriptionTranslations] = useState<Record<string, string>>({});
  const [flyoutDescriptionLanguage, setFlyoutDescriptionLanguage] = useState<string>('en');
  const [isSavingFlyout, setIsSavingFlyout] = useState(false);
  const [isTranslatingFlyout, setIsTranslatingFlyout] = useState(false);
  const [isFlyoutMediaDialogOpen, setIsFlyoutMediaDialogOpen] = useState(false);
  const [isCtaDialogOpen, setIsCtaDialogOpen] = useState(false);
  const [ctaGroup, setCtaGroup] = useState<string>('none');
  const [ctaLabel, setCtaLabel] = useState<string>('');
  const [ctaIcon, setCtaIcon] = useState<string>('auto');
  const [isSavingCta, setIsSavingCta] = useState(false);
  // Multilingual Rainbow - Split Screen State
  const [isSplitScreenEnabled, setIsSplitScreenEnabled] = useState(() => 
    localStorage.getItem('tiles-split-screen') === 'true'
  );

  // Multilingual Rainbow - Target Language States for Tiles
  const [targetTilesTitle, setTargetTilesTitle] = useState<string>('');
  const [targetTilesDescription, setTargetTilesDescription] = useState<string>('');
  const [targetTilesColumns, setTargetTilesColumns] = useState<string>('3');
  const [targetApplications, setTargetApplications] = useState<any[]>([]);
  const [isTranslatingTiles, setIsTranslatingTiles] = useState(false);

  // LANGUAGES, DESIGN_ICON_OPTIONS and CTA_GROUP_OPTIONS are imported from AdminConstants

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

  // Auth state change and checkUserAccess are now handled by useAdminAuth hook

  // Persist selected page to sessionStorage for navigation between admin views
  const ADMIN_SELECTED_PAGE_KEY = "admin_selected_page";
  
  // NOTE: We no longer auto-restore page from sessionStorage on login
  // This ensures editors see the Welcome page after login
  // The page is only saved for navigation between admin views (News/Products -> Dashboard)
  
  useEffect(() => {
    if (selectedPage) {
      sessionStorage.setItem(ADMIN_SELECTED_PAGE_KEY, selectedPage);
    } else {
      // Clear sessionStorage when no page is selected to prevent auto-loading old page
      sessionStorage.removeItem(ADMIN_SELECTED_PAGE_KEY);
    }
  }, [selectedPage]);

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
      
      // Comprehensive error handler for page loading
      const loadPageWithErrorHandling = async () => {
        try {
          console.log(`[AdminDashboard] Starting page load for: ${selectedPage}`);
          
          // First, load page info
          await loadPageInfo();
          console.log(`[AdminDashboard] Page info loaded successfully`);
          
          // Then load segment registry to get all segment IDs
          await loadSegmentRegistry();
          console.log(`[AdminDashboard] Segment registry loaded successfully`);
          
          // Then calculate global max segment ID across all pages
          await calculateGlobalMaxSegmentId();
          console.log(`[AdminDashboard] Global max segment ID calculated`);
          
          // Finally load content for current page
          await loadContent();
          console.log(`[AdminDashboard] Content loaded successfully for: ${selectedPage}`);
          
        } catch (error: any) {
          console.error(`[AdminDashboard] Critical error loading page "${selectedPage}":`, error);
          
          // Show user-friendly error message
          toast.error(
            `Failed to load page: ${selectedPage}. ${error?.message || 'Unknown error'}. Please try selecting a different page or refresh the browser.`,
            { duration: 8000 }
          );
          
          // Log additional debug info
          console.error('[AdminDashboard] Error details:', {
            selectedPage,
            editorLanguage,
            errorMessage: error?.message,
            errorStack: error?.stack
          });
        }
      };
      
      loadPageWithErrorHandling();
    }
  }, [user, selectedPage, isAdmin, isEditor, editorLanguage]);

  // Sync tabOrder with pageSegments - ensure consistency
  useEffect(() => {
    const safePageSegments = pageSegments || [];
    const safeTabOrder = tabOrder || [];
    if (!user || !selectedPage || safePageSegments.length === 0) return;
    
    // Get all current segment IDs from pageSegments (excluding ONLY meta-navigation which is fixed-position)
    // IMPORTANT: full-hero MUST be included in tab_order to be rendered!
    const segmentIds = safePageSegments
      .filter(seg => seg && seg.type !== 'meta-navigation')
      .map(seg => seg.id);
    
    // Remove deleted/non-existent segments from tabOrder
    const validTabOrder = safeTabOrder.filter(id => segmentIds.includes(id));
    
    // Add any new segments that aren't in tabOrder yet (append to end)
    const missingSegments = segmentIds.filter(id => !validTabOrder.includes(id));
    
    // Only update if there are actual changes needed
    const hasChanges = missingSegments.length > 0 || validTabOrder.length !== safeTabOrder.length;
    
    if (hasChanges) {
      const newOrder = [...validTabOrder, ...missingSegments];
      
      // Check if the order is actually different before updating
      const isDifferent = JSON.stringify(newOrder) !== JSON.stringify(safeTabOrder);
      
      if (isDifferent) {
        console.log("Updating tabOrder due to segment changes:", { old: safeTabOrder, new: newOrder });
        setTabOrder(newOrder);
        
        // Save to database
        supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "tab_order",
            content_type: "json",
            content_value: JSON.stringify(newOrder),
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key,language'
          });
      }
    }
  }, [pageSegments, selectedPage, user, tabOrder]);

  // checkUserAccess is now handled by useAdminAuth hook

  // Flyout image selection handler - uses extracted utility
  const handleFlyoutImageSelect = async (url: string) => {
    setFlyoutImageUrl(url || null);
    if (url) {
      const updatedTranslations = await handleFlyoutImageSelection(url, flyoutDescriptionTranslations);
      setFlyoutDescriptionTranslations(updatedTranslations);
    }
  };

  // Save flyout info handler - uses extracted utility
  const handleSaveFlyoutInfo = async () => {
    if (!pageInfo) {
      toast.error('No page selected');
      return;
    }

    if (!isAllowedPageLevel(pageInfo.parentSlug)) {
      toast.error('Flyout content is only available for second and third-level navigation pages.');
      return;
    }

    setIsSavingFlyout(true);
    const success = await saveFlyoutInfo(pageInfo.pageId, flyoutImageUrl, flyoutDescriptionTranslations);
    if (success) {
      const englishDesc = flyoutDescriptionTranslations['en'] || '';
      setPageInfo(prev => prev ? { ...prev, flyoutImageUrl, flyoutDescription: englishDesc } : prev);
      setIsFlyoutDialogOpen(false);
    }
    setIsSavingFlyout(false);
  };

  // Clear flyout info handler - uses extracted utility
  const handleClearFlyoutInfo = async () => {
    if (!pageInfo) return;

    setIsSavingFlyout(true);
    const success = await clearFlyoutInfo(pageInfo.pageId);
    if (success) {
      setFlyoutImageUrl(null);
      setFlyoutDescriptionTranslations({});
      setPageInfo(prev => prev ? { ...prev, flyoutImageUrl: null, flyoutDescription: null } : prev);
    }
    setIsSavingFlyout(false);
  };

  // Helper function to resolve non-hierarchical slug to full hierarchical slug
  const resolvePageSlug = async (slug: string): Promise<string> => {
    return resolvePageSlugUtil(slug, setResolvedPageSlug);
  };

  // Load page info (Page ID, Title, Slug) from page_registry
  const loadPageInfo = async () => {
    const info = await loadPageInfoUtil(selectedPage, resolvePageSlug, setResolvedPageSlug);
    setPageInfo(info);
  };

  // Sync flyout & CTA editor state when pageInfo changes
  useEffect(() => {
    const syncFlyoutState = async () => {
      if (pageInfo) {
        setFlyoutImageUrl(pageInfo.flyoutImageUrl ?? null);
        setCtaGroup(pageInfo.ctaGroup ?? 'none');
        setCtaLabel(pageInfo.ctaLabel ?? '');
        setCtaIcon(pageInfo.ctaIcon ?? 'auto');
        
        if (pageInfo.pageSlug) {
          const translations = await loadFlyoutTranslations(pageInfo.pageSlug);
          if (Object.keys(translations).length > 0) {
            setFlyoutDescriptionTranslations(translations);
          } else if (pageInfo.flyoutDescription) {
            setFlyoutDescriptionTranslations({ en: pageInfo.flyoutDescription });
          } else {
            setFlyoutDescriptionTranslations({});
          }
        }
      } else {
        setFlyoutImageUrl(null);
        setFlyoutDescriptionTranslations({});
        setCtaGroup('none');
        setCtaLabel('');
        setCtaIcon('auto');
      }
    };
    
    syncFlyoutState();
  }, [pageInfo]);

  // Save design element handler - uses extracted utility
  const handleSaveDesignElement = async () => {
    if (!pageInfo || !pendingDesignIcon) {
      toast.error("Please select a design element");
      return;
    }

    if (!isAllowedPageLevel(pageInfo.parentSlug)) {
      toast.error("Design elements are only allowed for second and third-level navigation pages.");
      return;
    }

    const success = await saveDesignElement(pageInfo.pageId, pendingDesignIcon);
    if (success) {
      setPageInfo(prev => prev ? { ...prev, designIcon: pendingDesignIcon } : prev);
      setIsDesignElementDialogOpen(false);
    }
  };

  // Remove design element handler - uses extracted utility
  const handleRemoveDesignElement = async () => {
    if (!pageInfo) return;

    const success = await removeDesignElement(pageInfo.pageId);
    if (success) {
      setPageInfo(prev => prev ? { ...prev, designIcon: null } : prev);
      setPendingDesignIcon(null);
      setIsDesignElementDialogOpen(false);
    }
  };

  // Save CTA config handler - uses extracted utility
  const handleSaveCtaConfig = async () => {
    if (!pageInfo) return;

    setIsSavingCta(true);
    const result = await saveCtaConfig(pageInfo.pageId, pageInfo.pageTitle, ctaGroup, ctaLabel, ctaIcon);
    if (result.success) {
      setPageInfo(prev => prev ? {
        ...prev,
        ctaGroup: ctaGroup === 'none' ? null : ctaGroup,
        ctaLabel: ctaGroup === 'none' ? null : (result.updates.cta_label as string),
        ctaIcon: ctaGroup === 'none' ? null : (result.updates.cta_icon as string | null),
      } : prev);
      setIsCtaDialogOpen(false);
    }
    setIsSavingCta(false);
  };
  // Load segment registry - uses extracted utility
  const loadSegmentRegistry = async () => {
    const querySlug = await resolvePageSlug(selectedPage);
    const { registry, reverseRegistry } = await loadSegmentRegistryData(querySlug);
    setSegmentRegistry(registry);
    setGlobalReverseRegistry(reverseRegistry);
  };

  // Calculate global max segment ID - uses extracted utility
  const calculateGlobalMaxSegmentId = async () => {
    const nextId = await calcGlobalMaxSegmentId();
    setNextSegmentId(nextId);
  };

  // CMS page creation wrapper functions - actual logic is in cmsPageUtils
  const handleCreateNewCMSPage = async () => {
    if (!user) return;
    await createNewCMSPage({
      selectedPageForCMS,
      userId: user.id,
      isAdmin,
      isEditor,
      language,
      navigationData,
      addAllowedPage,
      navigate,
      setIsCreatingCMS,
      setIsCreateCMSDialogOpen,
      setSelectedPageForCMS,
    });
  };

  const handleCreateNewCMSPageWithSlug = async (slug: string, languages: string[]) => {
    if (!user) return;
    await createNewCMSPageWithSlug({
      slug,
      languages,
      userId: user.id,
      isEditor,
      isAdmin,
      language,
      navigationData,
      addAllowedPage,
      navigate,
      setIsCreatingCMS,
      setIsCreateCMSDialogOpen,
      setSelectedPageForCMS,
    });
  };

  const loadContent = async () => {
    let querySlug = await resolvePageSlug(selectedPage);
    console.log('[AdminDashboard] Loading content for page:', querySlug, 'language:', editorLanguage);
    
    // First try with resolved slug
    let { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", querySlug)
      .eq("language", editorLanguage);

    // If no results and querySlug doesn't contain '/', try hierarchical search
    if ((!data || data.length === 0) && !querySlug.includes('/')) {
      const { data: hierarchicalData } = await supabase
        .from("page_content")
        .select("*")
        .ilike("page_slug", `%/${querySlug}`)
        .eq("language", editorLanguage);
      
      if (hierarchicalData && hierarchicalData.length > 0) {
        data = hierarchicalData;
        const foundSlug = hierarchicalData[0]?.page_slug;
        if (foundSlug) {
          setResolvedPageSlug(foundSlug);
          querySlug = foundSlug;
        }
      }
    }

    if (error) {
      toast.error("Error loading content");
      return;
    }

    // Parse all content items using extracted utility
    const result = parseContentItems(data || [], selectedPage, segmentRegistry, seoData);
    
    // Apply parsed content to state
    setContent(result.contentMap);
    setApplications(result.applications);
    setTilesColumns(result.tilesColumns);
    setHeroImageUrl(result.heroImageUrl);
    setHeroImageMetadata(result.heroImageMetadata);
    setHeroImagePosition(result.heroImagePosition);
    setHeroLayout(result.heroLayout);
    setHeroTopPadding(result.heroTopPadding);
    setHeroCtaLink(result.heroCtaLink);
    setHeroCtaStyle(result.heroCtaStyle);
    setBannerTitle(result.bannerTitle);
    setBannerSubtext(result.bannerSubtext);
    setBannerImages(result.bannerImages);
    setBannerButtonText(result.bannerButtonText);
    setBannerButtonLink(result.bannerButtonLink);
    setBannerButtonStyle(result.bannerButtonStyle);
    setSolutionsTitle(result.solutionsTitle);
    setSolutionsSubtext(result.solutionsSubtext);
    setSolutionsLayout(result.solutionsLayout);
    setSolutionsItems(result.solutionsItems);
    setPageSegments(result.pageSegments);
    setFooterCtaTitle(result.footerCtaTitle);
    setFooterCtaDescription(result.footerCtaDescription);
    setFooterContactHeadline(result.footerContactHeadline);
    setFooterContactSubline(result.footerContactSubline);
    setFooterContactDescription(result.footerContactDescription);
    setFooterTeamImageUrl(result.footerTeamImageUrl);
    setFooterTeamQuote(result.footerTeamQuote);
    setFooterTeamName(result.footerTeamName);
    setFooterTeamTitle(result.footerTeamTitle);
    setFooterButtonText(result.footerButtonText);
    setSeoData(result.seoData);
    
    // Process tab order with filtering - use pageSegments as source of truth
    const reverseRegistry = (window as any).__segmentKeyRegistry || {};
    const { validOrder, wasFiltered } = filterTabOrder(result.tabOrder, reverseRegistry, result.pageSegments);
    
    if (wasFiltered && user) {
      await saveCleanedTabOrder(resolvedPageSlug || selectedPage, validOrder, user.id);
    }
    setTabOrder(validOrder);
    
    // Set active tab
    if (validOrder.length > 0) {
      const pageKey = selectedPage || 'index';
      const savedTab = localStorage.getItem(`admin-activeTab-${pageKey}`);
      const isValidSavedTab = savedTab && (validOrder.includes(savedTab) || savedTab === "footer");
      if (isValidSavedTab) {
        setActiveTabState(savedTab);
      } else {
        setActiveTabState(validOrder[0]);
        localStorage.setItem(`admin-activeTab-${pageKey}`, validOrder[0]);
      }
    }
    
    // Save segment IDs if needed
    if (result.needsSegmentUpdate && user) {
      await saveUpdatedSegments(resolvedPageSlug || selectedPage, result.segmentsWithIds, user.id);
    }
    
    // SAFETY CHECK: Rebuild tab_order if empty but segments exist
    if (validOrder.length === 0 && result.pageSegments.length > 0 && user) {
      const rebuiltTabOrder = rebuildTabOrderFromSegments(result.pageSegments);
      if (rebuiltTabOrder.length > 0) {
        await saveCleanedTabOrder(resolvedPageSlug || selectedPage, rebuiltTabOrder, user.id);
        setTabOrder(rebuiltTabOrder);
      }
    }
    
    // Check for autosaved data
    setTimeout(() => restoreAutosavedDataIfAvailable(), 100);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setHeroUploading(true);
    const ctx: UploadContext = { resolvedPageSlug: resolvedPageSlug || selectedPage, selectedPage, editorLanguage, userId: user?.id };
    await handleHeroImageUpload(e.target.files[0], ctx, setHeroImageUrl, setHeroImageMetadata);
    setHeroUploading(false);
  };

  const handleTileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tileIndex: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const newApps = await handleTileImageUploadUtil(e.target.files[0], tileIndex, applications, setApplications);
    if (newApps) {
      // Use utility function for auto-save
      const ctx: SaveContext = { userId: user?.id || '', resolvedPageSlug: resolvedPageSlug || selectedPage, selectedPage, editorLanguage };
      await autoSaveTileImageUploadUtil(ctx, newApps, content, heroImagePosition, heroLayout, heroTopPadding, heroCtaLink, heroCtaStyle);
      toast.success("Image uploaded and saved successfully!");
    }
    setUploading(false);
  };

  // Auto-save tiles segment content with debounce
  const autoSaveTilesSegment = (segmentIndex: number, updatedSegments: any[]) => {
    if (!user) return;
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new timer for 1 second debounce
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        // 🔐 BACKUP before auto-save
        const currentSlug = resolvedPageSlug || selectedPage;
        await createContentBackup(currentSlug, 'page_segments', 'en');
        
        const segmentsWithPositions = updatedSegments.map((seg, idx) => ({
          ...seg,
          position: idx
        }));
        
        const { error } = await supabase
          .from("page_content")
          .upsert({
            page_slug: currentSlug,
            section_key: "page_segments",
            content_type: "json",
            content_value: JSON.stringify(segmentsWithPositions),
            updated_at: new Date().toISOString(),
            updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key,language'
            });

          if (error) throw error;
        
        console.log('[AUTO-SAVE] Tiles segment auto-saved successfully');
      } catch (error: any) {
        console.error('[AUTO-SAVE] Error auto-saving tiles segment:', error.message);
      }
    }, 1000);
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

  const handleSolutionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, segmentId?: string | number) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const currentSlug = resolvedPageSlug || selectedPage;
    await handleSolutionImageUploadUtil(e.target.files[0], index, solutionsItems, setSolutionsItems, currentSlug, segmentId);
    setUploading(false);
  };

  const handleImageTextHeroImageUpload = async (segmentIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const currentSlug = resolvedPageSlug || selectedPage;
    const segmentId = pageSegments[segmentIndex]?.id;
    const newSegments = await handleImageTextHeroUpload(file, segmentIndex, pageSegments, setPageSegments, currentSlug, segmentId);
    if (newSegments) {
      await autoSaveImageTextSegment(newSegments);
      toast.success("Hero image uploaded and saved successfully!");
    }
    setUploading(false);
  };

  const handleImageTextItemImageUpload = async (segmentIndex: number, itemIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const currentSlug = resolvedPageSlug || selectedPage;
    const segmentId = pageSegments[segmentIndex]?.id;
    const newSegments = await handleImageTextItemUpload(file, segmentIndex, itemIndex, pageSegments, setPageSegments, currentSlug, segmentId);
    if (newSegments) {
      await autoSaveImageTextSegment(newSegments);
      toast.success("Item image uploaded and saved successfully!");
    }
    setUploading(false);
  };

  const autoSaveImageTextSegment = async (updatedSegments: any[]) => {
    if (!user) return;
    try {
      const currentSlug = resolvedPageSlug || selectedPage;
      await createContentBackup(currentSlug, 'page_segments', 'en');
      await supabase
        .from("page_content")
        .upsert({
          page_slug: currentSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, { onConflict: 'page_slug,section_key,language' });
      console.log("✅ Image & Text segment auto-saved");
    } catch (error: any) {
      console.error("Auto-save error:", error);
    }
  };

  const handleFooterTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const ctx: UploadContext = { resolvedPageSlug: resolvedPageSlug || selectedPage, selectedPage, editorLanguage, userId: user?.id };
    await handleFooterTeamImageUploadUtil(e.target.files[0], ctx, setFooterTeamImageUrl, setFooterTeamImageMetadata);
    setUploading(false);
  };

  const handleAddBannerImage = () => {
    const newImage = { url: "", alt: `Banner image ${bannerImages.length + 1}` };
    setBannerImages([...bannerImages, newImage]);
    toast.success("New banner image slot added! Upload an image.");
  };

  const handleDeleteBannerImage = (index: number) => {
    setBannerImages(bannerImages.filter((_, i) => i !== index));
    toast.success("Banner image deleted! Don't forget to save changes.");
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    await handleBannerImageUploadUtil(e.target.files[0], index, bannerImages, setBannerImages);
    setUploading(false);
  };

  // getDefaultSegmentData and getLanguageIndependentFields are now imported from segmentUtils

  const handleAddSegment = async (templateType: string) => {
    if (!user) return;

    const ctx: SegmentOperationContext = {
      resolvedPageSlug: resolvedPageSlug || selectedPage,
      selectedPage,
      editorLanguage,
      userId: user.id,
      pageSegments,
      tabOrder
    };

    const success = await addNewSegment(
      templateType,
      ctx,
      setPageSegments,
      setTabOrder,
      setNextSegmentId,
      setActiveTab
    );

    if (success) {
      setIsTemplateDialogOpen(false);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    if (!user) return;

    const ctx: SegmentOperationContext = {
      resolvedPageSlug: resolvedPageSlug || selectedPage,
      selectedPage,
      editorLanguage,
      userId: user.id,
      pageSegments,
      tabOrder
    };

    await deleteSegmentFull(
      segmentId,
      ctx,
      setPageSegments,
      setTabOrder,
      setActiveTab,
      setSegmentRegistry
    );
  };

  const handleSaveSegments = async () => {
    if (!user) return;
    
    setSaving(true);

    const ctx: SegmentOperationContext = {
      resolvedPageSlug: resolvedPageSlug || selectedPage,
      selectedPage,
      editorLanguage,
      userId: user.id,
      pageSegments,
      tabOrder
    };

    await saveAllSegments(ctx, setPageSegments, setTabOrder);
    setSaving(false);
  };

  const handleSaveSEO = async () => {
    if (!user) return;
    setSaving(true);
    const ctx: SaveContext = { userId: user.id, resolvedPageSlug: resolvedPageSlug || selectedPage, selectedPage, editorLanguage };
    await saveSEOSettings(ctx, seoData);
    setSaving(false);
  };

  const handleSaveApplications = async () => {
    if (!user) return;
    setSaving(true);
    const ctx: SaveContext = { userId: user.id, resolvedPageSlug: resolvedPageSlug || selectedPage, selectedPage, editorLanguage };
    await saveApplicationsSection(ctx, content, applications, tilesColumns);
    setSaving(false);
  };

  const handleSaveFooter = async () => {
    if (!user) return;
    setSaving(true);
    const ctx: SaveContext = { userId: user.id, resolvedPageSlug: resolvedPageSlug || selectedPage, selectedPage, editorLanguage };
    await saveFooterSection(ctx, {
      ctaTitle: footerCtaTitle,
      ctaDescription: footerCtaDescription,
      contactHeadline: footerContactHeadline,
      contactSubline: footerContactSubline,
      contactDescription: footerContactDescription,
      teamQuote: footerTeamQuote,
      teamName: footerTeamName,
      teamTitle: footerTeamTitle,
      buttonText: footerButtonText
    });
    setSaving(false);
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

  const selectedDesignIconOption = pageInfo
    ? DESIGN_ICON_OPTIONS.find((opt) => opt.key === pageInfo.designIcon)
    : undefined;
  const SelectedDesignIcon = selectedDesignIconOption?.Icon;
  const SECOND_LEVEL_PARENTS = ['your-solution', 'products', 'downloads', 'events', 'news', 'inside-lab', 'contact', 'test-lab', 'training-events', 'info-hub', 'company'];
  const THIRD_LEVEL_PARENTS = ['test-lab', 'training-events', 'info-hub', 'company']; // Parents whose children (level 3) should also have design buttons
  const isSecondLevelPage = !!(pageInfo && pageInfo.parentSlug && SECOND_LEVEL_PARENTS.includes(pageInfo.parentSlug));
  // Third-level: pages whose parent_slug itself starts with a third-level parent (e.g., parent_slug='test-lab/overview' for a 4th level page)
  // For pages like 'training-events/webinars', parent_slug='training-events' which is in SECOND_LEVEL_PARENTS, so they are second-level
  const isThirdLevelPage = !!(pageInfo && pageInfo.parentSlug && THIRD_LEVEL_PARENTS.some(p => pageInfo.parentSlug?.startsWith(p + '/') ));
  const hasDesignButtons = isSecondLevelPage || isThirdLevelPage;

  return (
    <AdminDashboardErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
      
      <div className="container mx-auto px-6 py-32 max-w-[1600px]">
        <AdminHeader
          isAdmin={isAdmin}
          isEditor={isEditor}
          allowedPages={allowedPages}
          showUserManagement={showUserManagement}
          setShowUserManagement={setShowUserManagement}
          handleLogout={handleLogout}
          selectedPage={selectedPage}
          pageInfo={pageInfo}
          hasDesignButtons={hasDesignButtons}
          onAddSegmentClick={() => setIsTemplateDialogOpen(true)}
          onDesignElementClick={() => setIsDesignElementDialogOpen(true)}
          onCtaClick={() => setIsCtaDialogOpen(true)}
          onFlyoutClick={() => setIsFlyoutDialogOpen(true)}
          onCreatePageClick={() => setIsCreateCMSDialogOpen(true)}
          onCopyPageClick={() => setIsCopyPageDialogOpen(true)}
          isSEOEditorOpen={isSEOEditorOpen}
          setIsSEOEditorOpen={setIsSEOEditorOpen}
          isGlossaryOpen={isGlossaryOpen}
          setIsGlossaryOpen={setIsGlossaryOpen}
          loadPageInfo={loadPageInfo}
          currentUser={user}
        />

        {/* Segment Template Dialog */}
        <TemplateSelectionDialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
          onSelectTemplate={handleAddSegment}
          pageSegments={pageSegments}
        />

        {/* Design Element Dialog */}
        <DesignElementDialog
          open={isDesignElementDialogOpen}
          onOpenChange={setIsDesignElementDialogOpen}
          pageInfo={pageInfo}
          pendingDesignIcon={pendingDesignIcon}
          setPendingDesignIcon={setPendingDesignIcon}
          onSave={handleSaveDesignElement}
          onRemove={handleRemoveDesignElement}
        />

        {/* Navigation CTA Dialog */}
        <NavigationCtaDialog
          open={isCtaDialogOpen}
          onOpenChange={setIsCtaDialogOpen}
          pageInfo={pageInfo}
          ctaGroup={ctaGroup}
          setCtaGroup={setCtaGroup}
          ctaIcon={ctaIcon}
          setCtaIcon={setCtaIcon}
          ctaLabel={ctaLabel}
          setCtaLabel={setCtaLabel}
          isSaving={isSavingCta}
          onSave={handleSaveCtaConfig}
        />

        {/* Flyout Content Dialog */}
        <FlyoutContentDialog
          open={isFlyoutDialogOpen}
          onOpenChange={setIsFlyoutDialogOpen}
          pageInfo={pageInfo}
          hasDesignButtons={hasDesignButtons}
          flyoutImageUrl={flyoutImageUrl}
          setFlyoutImageUrl={setFlyoutImageUrl}
          flyoutDescriptionTranslations={flyoutDescriptionTranslations}
          setFlyoutDescriptionTranslations={setFlyoutDescriptionTranslations}
          isSaving={isSavingFlyout}
          onSave={handleSaveFlyoutInfo}
          onClear={handleClearFlyoutInfo}
          onImageSelect={handleFlyoutImageSelect}
        />

        {/* Copy Page Dialog */}
        <CopyPageDialog
          open={isCopyPageDialogOpen}
          onOpenChange={setIsCopyPageDialogOpen}
          sourcePageSlug={pageInfo?.pageSlug || selectedPage}
          sourcePageTitle={pageInfo?.pageTitle || selectedPage}
          onSuccess={(newSlug) => {
            // Navigate to the newly created page
            navigate(`/${language}/admin-dashboard?page=${encodeURIComponent(newSlug)}`);
          }}
        />

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
                editorLanguage={editorLanguage}
              />
            </CardContent>
          </Card>
        )}

        {/* Glossary Manager - Conditional Rendering */}
        {isGlossaryOpen && (
          <div className="mb-8">
            <GlossaryManager />
          </div>
        )}

        {/* Welcome Screen - Show when no page is selected */}
        {/* Note: Only show welcome when no page selected. If a page is selected but has no segments, still show tab UI */}
        {!selectedPage ? (
          <WelcomeTab version={CMS_VERSION} />
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            >
              <TabsList className="flex flex-wrap justify-start items-start w-full h-auto p-2 bg-gray-200 pl-3 gap-1">
                {/* MANDATORY: Meta Navigation - ALWAYS FIRST/LEFTMOST (Nothing before it!) */}
                {(pageSegments || [])
                  .filter(segment => segment && segment.type === 'meta-navigation')
                  .map((segment) => {
                    const segmentIndex = (pageSegments || []).indexOf(segment);
                    const sameTypeBefore = (pageSegments || []).slice(0, segmentIndex).filter(s => s && s.type === 'meta-navigation').length;
                    const displayNumber = sameTypeBefore + 1;
                    const segmentId = segmentRegistry[segment.id] || segment.id;
                    
                    return (
                      <TabsTrigger 
                        key={segment.id}
                        value={segment.id}
                        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                      >
                        ID {segmentId}: Meta Nav - E {displayNumber}
                      </TabsTrigger>
                    );
                  })}

                {/* Full Hero - Fixed Position (After Meta Nav if exists, otherwise first) */}
                {(pageSegments || [])
                  .filter(segment => segment && segment.type === 'full-hero')
                  .map((segment) => {
                    const segmentIndex = (pageSegments || []).indexOf(segment);
                    const sameTypeBefore = (pageSegments || []).slice(0, segmentIndex).filter(s => s && s.type === 'full-hero').length;
                    const displayNumber = sameTypeBefore + 1;
                    const segmentId = segmentRegistry[segment.id] || segment.id;
                    
                    return (
                      <TabsTrigger 
                        key={segment.id}
                        value={segment.id}
                        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                      >
                        ID {segmentId}: Full Hero - A {displayNumber}
                      </TabsTrigger>
                    );
                  })}

                {/* Action Hero - Fixed Position (After Meta Nav / Full Hero, before other segments) */}
                {(pageSegments || [])
                  .filter(segment => segment && segment.type === 'action-hero')
                  .map((segment) => {
                    const segmentIndex = (pageSegments || []).indexOf(segment);
                    const sameTypeBefore = (pageSegments || []).slice(0, segmentIndex).filter(s => s && s.type === 'action-hero').length;
                    const displayNumber = sameTypeBefore + 1;
                    const segmentId = segmentRegistry[segment.id] || segment.id;
                    
                    return (
                      <TabsTrigger 
                        key={segment.id}
                        value={segment.id}
                        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                      >
                        ID {segmentId}: Action Hero - Q-{displayNumber}
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

                {/* Draggable Middle Tabs - ALL segments EXCEPT Meta Navigation, Full Hero, Action Hero, Hero, Footer, and Mini-Footer */}
                <SortableContext
                  items={(tabOrder || []).filter(tabId => {
                    const segment = (pageSegments || []).find(s => s && s.id === tabId);
                    // Exclude meta-navigation, full-hero, action-hero, footer, and mini-footer from draggable section
                    return !segment || (segment.type !== 'meta-navigation' && segment.type !== 'full-hero' && segment.type !== 'action-hero' && segment.type !== 'footer' && segment.type !== 'mini-footer');
                  })}
                  strategy={horizontalListSortingStrategy}
                >
                  {(tabOrder || [])
                    .filter(tabId => {
                      const segment = (pageSegments || []).find(s => s && s.id === tabId);
                      // Exclude meta-navigation, full-hero, action-hero, footer, and mini-footer from draggable section
                      return !segment || (segment.type !== 'meta-navigation' && segment.type !== 'full-hero' && segment.type !== 'action-hero' && segment.type !== 'footer' && segment.type !== 'mini-footer');
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
                    const segment = (pageSegments || []).find(s => s && s.id === tabId);
                    if (segment) {
                      const segmentIndex = (pageSegments || []).indexOf(segment);
                      const sameTypeBefore = (pageSegments || []).slice(0, segmentIndex).filter(s => s && s.type === segment.type).length;
                      const displayNumber = sameTypeBefore + 1;
                      
                      const segmentId = segmentRegistry[tabId] || tabId;
                      const reverseRegistry = (window as any).__segmentKeyRegistry || {};
                      const customKey = reverseRegistry[String(segmentId)];
                      
                      let label = '';
                      // Always use type-based label for consistent display
                      if (segment.type === 'hero') label = `Produkt Hero - F ${displayNumber}`;
                      if (segment.type === 'product-hero-gallery') label = `Product Gallery - G ${displayNumber}`;
                      if (segment.type === 'tiles') label = `Tiles - H ${displayNumber}`;
                      if (segment.type === 'banner') label = `Banner - J ${displayNumber}`;
                      if (segment.type === 'banner-p') label = `Banner-P ${displayNumber}`;
                      if (segment.type === 'image-text') label = `Image & Text - I ${displayNumber}`;
                      if (segment.type === 'feature-overview') label = `Features - K ${displayNumber}`;
                      if (segment.type === 'table') label = `Table - L ${displayNumber}`;
                      if (segment.type === 'faq') label = `FAQ - O ${displayNumber}`;
                      if (segment.type === 'video') label = `Video - M ${displayNumber}`;
                      if (segment.type === 'specification') label = `Specification - N ${displayNumber}`;
                      if (segment.type === 'news') label = `Latest News - D ${displayNumber}`;
                      if (segment.type === 'full-hero') label = `Full Hero - A ${displayNumber}`;
                      if (segment.type === 'intro') label = `Intro - B ${displayNumber}`;
                      if (segment.type === 'industries') label = `Industries - C ${displayNumber}`;
                      if (segment.type === 'debug') label = `Debug ${displayNumber}`;
                      if (segment.type === 'news-list') label = `News List - P-${displayNumber}`;
                      if (segment.type === 'action-hero') label = `Action Hero - Q-${displayNumber}`;
                      if (segment.type === 'events') label = `Events List - R-${displayNumber}`;
                      if (segment.type === 'product-list') label = `Product List - S-${displayNumber}`;
                      if (segment.type === 'downloads') label = `Downloads - T-${displayNumber}`;
                      if (segment.type === 'mini-footer') label = `Mini Footer - U-${displayNumber}`;
                      
                      return (
                        <SortableTab key={tabId} id={tabId} value={tabId}>
                          ID {segmentId}: {label}
                        </SortableTab>
                      );
                    }
                    return null;
                  })}
                </SortableContext>

                {/* Footer Tab - Fixed Right (show if footer exists AND mini-footer NOT active) */}
                {(() => {
                  const hasMiniFooter = (pageSegments || []).some(s => s && s.type === 'mini-footer');
                  const footerSegment = (pageSegments || []).find(s => s && s.type === 'footer');
                  const footerId = segmentRegistry['footer'] || (footerSegment ? segmentRegistry[footerSegment.id] : null) || footerSegment?.id;
                  
                  // Only show regular footer tab if mini-footer is not active
                  if (footerId && !hasMiniFooter) {
                    return (
                      <TabsTrigger 
                        value="footer"
                        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                      >
                        ID {footerId}: Footer
                      </TabsTrigger>
                    );
                  }
                  return null;
                })()}

                {/* Mini Footer Tab - Fixed Right (show if mini-footer is active) */}
                {(() => {
                  const miniFooterSegment = (pageSegments || []).find(s => s && s.type === 'mini-footer');
                  if (miniFooterSegment) {
                    const miniFooterId = segmentRegistry[miniFooterSegment.id] || miniFooterSegment.id;
                    return (
                      <TabsTrigger 
                        value={miniFooterSegment.id}
                        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                      >
                        ID {miniFooterId}: Mini Footer - U
                      </TabsTrigger>
                    );
                  }
                  return null;
                })()}

                {/* Version History Tab - Fixed Right (Admin or Editor) - Toggle behavior */}
                {(isAdmin || isEditor) && (
                  <div 
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-3 text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ml-auto ${
                      activeTab === "version-history" 
                        ? "bg-amber-500 text-white shadow" 
                        : "bg-transparent hover:bg-muted"
                    }`}
                    onClick={() => {
                      // Toggle: if on history go back, otherwise go to history
                      if (activeTab === "version-history" && (tabOrder || []).length > 0) {
                        setActiveTab((tabOrder || [])[0]);
                      } else {
                        setActiveTab("version-history");
                      }
                    }}
                  >
                    <HistoryIcon className="h-4 w-4 mr-2" />
                    History
                  </div>
                )}
              </TabsList>
            </DndContext>

            {/* Hero Section Tab */}
          <TabsContent value="hero">
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">Produkt Hero</CardTitle>
                  <CardDescription className="text-gray-300">Edit the main hero section content</CardDescription>
                  <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                    ID: {segmentRegistry['hero'] || 1}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SegmentHistoryButton
                    pageSlug={resolvedPageSlug || selectedPage}
                    sectionKey="hero_title"
                    language={editorLanguage}
                    onRestore={() => loadContent()}
                  />
                  <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                    Produkt-Hero Template
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
            <CardContent className="space-y-4">
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
                     disabled={false}
                     className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                   >
                     Replace Image
                  </Button>
                ) : null}
                
                <Input
                   id="hero_image"
                   type="file"
                   accept="image/*"
                   onChange={handleImageUpload}
                   disabled={false}
                   className={`border-2 border-gray-600 ${heroImageUrl ? "hidden" : ""}`}
                 />
                
                
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
              <div>
                <Label htmlFor="hero_cta" className="text-white">CTA Button Text</Label>
                <Input
                  id="hero_cta"
                  value={content.hero_cta || ""}
                  onChange={(e) => setContent({ ...content, hero_cta: e.target.value })}
                  className="border-2 border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="hero_cta_link" className="text-white">CTA Button Link</Label>
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
                <Label htmlFor="hero_cta_style" className="text-white">CTA Button Style</Label>
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

              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button
                  onClick={handleSaveHero}
                  disabled={saving}
                  className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  onClick={() => setCopyHeroDialogOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2 self-start"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Page...
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
                  // Use full hierarchical slug for navigation
                  navigate(`/${language}/admin-dashboard?page=${encodeURIComponent(targetPageSlug)}`);
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
                  <div className="flex items-center gap-4 mb-3">
                    <CardTitle className="text-white">Tiles Template</CardTitle>
                    <div className="flex items-center gap-2">
                      {LANGUAGES.map((lang) => (
                        <Button
                          key={lang.code}
                          onClick={() => setEditorLanguage(lang.code as 'en' | 'de' | 'ja' | 'ko' | 'zh')}
                          variant={editorLanguage === lang.code ? "default" : "outline"}
                          size="sm"
                          className={editorLanguage === lang.code ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" : ""}
                        >
                          {lang.flag} {lang.name}
                        </Button>
                      ))}
                    </div>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSplitScreenEnabled}
                        onChange={(e) => {
                          setIsSplitScreenEnabled(e.target.checked);
                          localStorage.setItem('tiles-split-screen', String(e.target.checked));
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-white text-sm">Split Screen</span>
                    </Label>
                  </div>
                  <CardDescription className="text-gray-300">Edit the tiles section content</CardDescription>
                  <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                    ID: {segmentRegistry['tiles'] || 2}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SegmentHistoryButton
                    pageSlug={resolvedPageSlug || selectedPage}
                    sectionKey="tiles"
                    language={editorLanguage}
                    onRestore={() => loadContent()}
                  />
                  <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                    Tiles Template
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
            <CardContent>
              {isSplitScreenEnabled && editorLanguage !== 'en' ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* English Reference Panel (Left) */}
                  <div className="border-r border-gray-600 pr-6">
                    <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇺🇸</span>
                        <span className="text-blue-300 font-semibold">English (Reference)</span>
                      </div>
                    </div>
                    <TilesSegmentEditor
                      key={`tiles-en-${selectedPage}`}
                      pageSlug={selectedPage}
                      segmentId={segmentRegistry['tiles']?.toString() || '2'}
                      language="en"
                      onSave={() => loadContent()}
                    />
                  </div>
                  
                  {/* Target Language Panel (Right) */}
                  <div className="pl-6">
                    <TilesSegmentEditor
                      key={`tiles-${editorLanguage}-${selectedPage}`}
                      pageSlug={selectedPage}
                      segmentId={segmentRegistry['tiles']?.toString() || '2'}
                      language={editorLanguage}
                      onSave={() => loadContent()}
                    />
                  </div>
                </div>
              ) : (
                <TilesSegmentEditor
                  key={`tiles-${editorLanguage}-${selectedPage}`}
                  pageSlug={selectedPage}
                  segmentId={segmentRegistry['tiles']?.toString() || '2'}
                  language={editorLanguage}
                  onSave={() => loadContent()}
                />
              )}

              <div className="mt-6 pt-4 border-t border-gray-600">
                <Button
                  onClick={() => setCopyTilesDialogOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Page...
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
                  // Use full hierarchical slug for navigation
                  navigate(`/${language}/admin-dashboard?page=${encodeURIComponent(targetPageSlug)}`);
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
                    <CardTitle className="text-white">Banner Template Section</CardTitle>
                    <CardDescription className="text-gray-300">Edit the banner section with title, subtext, images, and button</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['banner'] || 3}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SegmentHistoryButton
                      pageSlug={resolvedPageSlug || selectedPage}
                      sectionKey="banner_title"
                      language={editorLanguage}
                      onRestore={() => loadContent()}
                    />
                    <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                      Banner Template
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
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "banner_title",
                            content_type: "heading",
                            content_value: bannerTitle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "banner_subtext",
                            content_type: "text",
                            content_value: bannerSubtext,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "banner_images",
                            content_type: "json",
                            content_value: JSON.stringify(bannerImages),
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "banner_button_text",
                            content_type: "text",
                            content_value: bannerButtonText,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "banner_button_link",
                            content_type: "text",
                            content_value: bannerButtonLink,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
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
                          onConflict: 'page_slug,section_key,language'
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
                    className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                  >
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
                    <CardTitle className="text-white">Image & Text Template</CardTitle>
                    <CardDescription className="text-gray-300">Edit image & text section with flexible column layout (1/2/3 columns)</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['solutions'] || 4}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SegmentHistoryButton
                      pageSlug={resolvedPageSlug || selectedPage}
                      sectionKey="solutions_title"
                      language={editorLanguage}
                      onRestore={() => loadContent()}
                    />
                    <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                      Image & Text Template
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
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "solutions_title",
                            content_type: "heading",
                            content_value: solutionsTitle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "solutions_subtext",
                            content_type: "text",
                            content_value: solutionsSubtext,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
                            section_key: "solutions_layout",
                            content_type: "text",
                            content_value: solutionsLayout,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: resolvedPageSlug || selectedPage,
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
                          onConflict: 'page_slug,section_key,language'
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
                    className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                  >
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
                    <CardDescription className="text-gray-300">
                      Edit footer content for the {selectedPage} page
                    </CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['footer'] || 7}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SegmentHistoryButton
                      pageSlug={resolvedPageSlug || selectedPage}
                      sectionKey="footer_cta_title"
                      language={editorLanguage}
                      onRestore={() => loadContent()}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <SplitScreenSegmentEditor
                  segmentTitle="Footer"
                  segmentType="footer"
                >
                  {(language) => (
                    <FooterEditor
                      key={`${resolvedPageSlug || selectedPage}-footer-${language}`}
                      pageSlug={resolvedPageSlug || selectedPage}
                      language={language}
                    />
                  )}
                </SplitScreenSegmentEditor>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dynamic Segment Tabs */}
          <DynamicSegmentRenderer
            pageSegments={pageSegments}
            segmentRegistry={segmentRegistry}
            resolvedPageSlug={resolvedPageSlug}
            selectedPage={selectedPage}
            editorLanguage={editorLanguage}
            loadContent={loadContent}
            handleDeleteSegment={handleDeleteSegment}
            handleSaveSegments={handleSaveSegments}
            setPageSegments={setPageSegments}
          />

          {/* Version History Tab Content */}
          {(isAdmin || isEditor) && (
            <TabsContent value="version-history">
              <VersionHistoryPanel 
                pageSlug={resolvedPageSlug || selectedPage}
                currentLanguage={editorLanguage}
                onRestore={() => loadContent()}
              />
            </TabsContent>
          )}
        </Tabs>
        )}
      </div>

      <CreateCMSPageDialog
        open={isCreateCMSDialogOpen}
        onOpenChange={setIsCreateCMSDialogOpen}
        onSuccess={(slug, languages) => handleCreateNewCMSPageWithSlug(slug, languages)}
      />
      </div>
    </AdminDashboardErrorBoundary>
  );
};

export default AdminDashboard;
