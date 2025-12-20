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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
// User and Session types are now handled by useAdminAuth hook
import { LogOut, Save, Plus, Trash2, X, GripVertical, Eye, Copy, MousePointer, Layers, Pencil, PlayCircle, Upload, FileText, Download, BarChart3, Zap, Shield, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor, Camera, Cog, Stethoscope, ScanLine, Target, FolderOpen, Book, Calendar, Newspaper, FlaskConical, Settings, Sparkles, Languages, Navigation2, Type, LayoutGrid, Image as ImageIcon, Columns, ListChecks, Table2, HelpCircle, Images, Building2, List, PanelBottom, SplitSquareVertical, Palette, Search, History as HistoryIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import lovableIcon from "@/assets/lovable-icon.png";
import lovableLogo from "@/assets/lovable-logo.png";
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
import { CMSPageOverview } from '@/components/admin/CMSPageOverview';
import { GlossaryManager } from '@/components/admin/GlossaryManager';
import { DataHubDialog } from '@/components/admin/DataHubDialog';
import { loadAltTextFromMapping } from '@/utils/loadAltTextFromMapping';
import { FooterEditor } from '@/components/admin/FooterEditor';
import { ShortcutEditor, ShortcutBadge } from '@/components/admin/ShortcutEditor';
import { ActionHeroEditor } from '@/components/admin/ActionHeroEditor';
import { EventsSegmentEditor } from '@/components/admin/EventsSegmentEditor';
import { ProductListSegmentEditor } from '@/components/admin/ProductListSegmentEditor';
import { DownloadsSegmentEditor } from '@/components/admin/DownloadsSegmentEditor';
import { createContentBackup, createMultipleBackups } from '@/utils/createContentBackup';
import { UserManagement } from '@/components/admin/UserManagement';
import { VersionHistoryPanel } from '@/components/admin/VersionHistoryPanel';
import { SegmentHistoryButton } from '@/components/admin/SegmentHistoryButton';
import { 
  STATIC_SEGMENT_IDS, 
  INDUSTRY_PARENT_CATEGORY_BY_SLUG, 
  LANGUAGES, 
  DESIGN_ICON_OPTIONS, 
  CTA_GROUP_OPTIONS,
  buildSegmentLabel,
  getSegmentTypeName
} from '@/components/admin/dashboard/AdminConstants';
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
  
  // Wrapper to persist activeTab to sessionStorage
  // Use selectedPage (from URL) as key since it's available immediately
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    // Use selectedPage directly since it's from URL and always available
    const pageKey = selectedPage || 'index';
    if (tab) {
      sessionStorage.setItem(`admin-activeTab-${pageKey}`, tab);
      console.log("[AdminDashboard] Saved activeTab:", tab, "for page:", pageKey);
    }
  };
  
  // Restore activeTab from sessionStorage on page load
  // This runs after tabOrder is loaded
  useEffect(() => {
    const pageKey = selectedPage || 'index';
    if (tabOrder.length > 0) {
      const savedTab = sessionStorage.getItem(`admin-activeTab-${pageKey}`);
      console.log("[AdminDashboard] Restore check - pageKey:", pageKey, "savedTab:", savedTab, "currentActiveTab:", activeTab);
      if (savedTab && tabOrder.includes(savedTab)) {
        console.log("[AdminDashboard] Restoring tab from sessionStorage:", savedTab);
        setActiveTabState(savedTab);
      }
    }
  }, [selectedPage, tabOrder]);
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

    // Calculate new order
    const oldIndex = tabOrder.indexOf(String(active.id));
    const newIndex = tabOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newOrder = arrayMove(tabOrder, oldIndex, newIndex);
    
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
    // Reuse existing hero save logic via autoSaveTileImageUpload side-effects
    await autoSaveTileImageUpload(applications);
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
    
    // Process tab order with filtering
    const reverseRegistry = (window as any).__segmentKeyRegistry || {};
    const { validOrder, wasFiltered } = filterTabOrder(result.tabOrder, reverseRegistry);
    
    if (wasFiltered && user) {
      await saveCleanedTabOrder(resolvedPageSlug || selectedPage, validOrder, user.id);
    }
    setTabOrder(validOrder);
    
    // Set active tab
    if (validOrder.length > 0) {
      const pageKey = selectedPage || 'index';
      const savedTab = sessionStorage.getItem(`admin-activeTab-${pageKey}`);
      const isValidSavedTab = savedTab && (validOrder.includes(savedTab) || savedTab === "footer");
      if (isValidSavedTab) {
        setActiveTabState(savedTab);
      } else {
        setActiveTabState(validOrder[0]);
        sessionStorage.setItem(`admin-activeTab-${pageKey}`, validOrder[0]);
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
      await autoSaveTileImageUpload(newApps);
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

  const autoSaveTileImageUpload = async (updatedApps: any[]) => {
    if (!user) return;
    
    try {
      const appFields = ['applications_title', 'applications_description'];
      
      for (const key of appFields) {
        if (content[key] !== undefined) {
          await supabase
            .from("page_content")
            .upsert({
              page_slug: resolvedPageSlug || selectedPage,
              section_key: key,
              content_type: "text",
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key,language'
            });
        }
      }

      // Update applications items
      const { error: appsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "applications_items",
          content_type: "json",
          content_value: JSON.stringify(updatedApps),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (appsError) throw appsError;

      // Update hero image position
      await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "hero_image_position",
          content_type: "text",
          content_value: heroImagePosition,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      // Update hero layout
      await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "hero_layout",
          content_type: "text",
          content_value: heroLayout,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      // Update hero top padding
      await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "hero_top_padding",
          content_type: "text",
          content_value: heroTopPadding,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      // Update hero CTA link
      await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "hero_cta_link",
          content_type: "text",
          content_value: heroCtaLink,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      // Update hero CTA style
      await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "hero_cta_style",
          content_type: "text",
          content_value: heroCtaStyle,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      // Update hero image metadata if exists
      if (heroImageMetadata) {
        await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "hero_image_metadata",
            content_type: "json",
            content_value: JSON.stringify(heroImageMetadata),
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key,language'
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
    setUploading(true);
    await handleSolutionImageUploadUtil(e.target.files[0], index, solutionsItems, setSolutionsItems);
    setUploading(false);
  };

  const handleImageTextHeroImageUpload = async (segmentIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const newSegments = await handleImageTextHeroUpload(file, segmentIndex, pageSegments, setPageSegments);
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
    const newSegments = await handleImageTextItemUpload(file, segmentIndex, itemIndex, pageSegments, setPageSegments);
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

    await saveAllSegments(ctx, setPageSegments);
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
        <div className="flex flex-wrap items-start gap-4 mb-8">
          {/* Linke Seite: Title + Buttons */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700"
                      >
                        <Shield className="h-4 w-4" />
                        User Management
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[1200px] max-h-[85vh] overflow-y-auto mt-16 bg-white [&>button]:hidden">
                      <DialogHeader className="relative">
                        <button
                          onClick={() => setShowUserManagement(false)}
                          className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-900 transition-colors text-3xl font-light leading-none focus:outline-none"
                          title="Schließen"
                        >
                          ×
                        </button>
                        <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
                          <Shield className="h-6 w-6 text-red-600" />
                          User Management - Roles & Permissions
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-700">
                          Manage user roles and permissions for the Admin Dashboard
                        </DialogDescription>
                      </DialogHeader>
                      <UserManagement />
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* CMS Hub Button */}
              <CMSPageOverview />
              
              {/* Media Management Button - in Gelb */}
              <DataHubDialog />
              
              {/* Preview Frontend Button */}
              <Button
                variant="default"
                onClick={async () => {
                  if (!selectedPage) {
                    toast.error('Please select a page first');
                    return;
                  }

                  // selectedPage enthält meist nur den letzten Slug-Teil (z.B. "iec-62676-5-testing"),
                  // deshalb suchen wir in page_registry nach einem passenden Eintrag.
                  const { data: pageData } = await supabase
                    .from('page_registry')
                    .select('page_id, page_slug, parent_slug, parent_id')
                    .or(`page_slug.eq.${selectedPage},page_slug.ilike.%/${selectedPage}`)
                    .order('page_id', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                  // Standard: nutze aktuelle Sprache als Präfix
                  let previewUrl = `/${language}/`;
                  
                  if (pageData?.page_id) {
                    // WICHTIG: Immer über PageIdRouter gehen, damit hierarchische URLs korrekt
                    // aufgelöst werden und keine 404 mehr entstehen.
                    previewUrl = `/${language}/${pageData.page_id}`;
                  } else {
                    // Fallback für sehr alte/statische Seiten ohne page_registry Eintrag
                    const urlMap: Record<string, string> = {
                      'photography': `/${language}/your-solution/photography`,
                      'scanners-archiving': `/${language}/your-solution/scanners-archiving`,
                      'medical-endoscopy': `/${language}/your-solution/medical-endoscopy`,
                      'web-camera': `/${language}/your-solution/web-camera`,
                      'machine-vision': `/${language}/your-solution/machine-vision`,
                      'mobile-phone': `/${language}/your-solution/mobile-phone`,
                      'automotive': `/${language}/your-solution/automotive`,
                      'in-cabin-testing': `/${language}/your-solution/automotive/in-cabin-testing`,
                    };
                    // Fallback: gehe von /{lang}/your-solution/{slug} aus, wenn nichts bekannt ist
                    previewUrl = urlMap[selectedPage] || `/${language}/your-solution/${selectedPage}`;
                  }

                  window.open(previewUrl, '_blank');
                }}
                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              
              {/* Home Icon - zur Welcome-Seite im Admin Dashboard */}
              <Button
                onClick={() => navigate(`/${language}/admin-dashboard`)}
                variant="outline"
                size="icon"
                className="h-10 w-10"
                title="Go to Admin Welcome Page"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Button>
              
              {/* Create Page Button - auffällig */}
              <Button
                onClick={() => setIsCreateCMSDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Page
              </Button>
            </div>

            {/* Page Info Display – einzeilig, große Schrift, unter Media Management */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg px-5 py-3 flex items-center gap-4 shadow-sm hover:shadow-md mt-4 w-full">
              {/* Icon Container mit hellblauer Umrandung */}
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              {/* Page Info Content – alles in einer Zeile */}
              <div className="flex items-center justify-between gap-4 min-w-0 flex-1">
                <div className="flex items-center gap-3 min-w-0 flex-wrap">
                  {selectedPage && pageInfo ? (
                    <>
                      <span className="font-bold text-base text-gray-900 whitespace-nowrap">
                        {pageInfo.pageTitle}
                      </span>
                      <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-sm font-semibold whitespace-nowrap flex-shrink-0">
                        ID {pageInfo.pageId}
                      </span>
                      <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                      <span 
                        className="text-base text-gray-700 font-mono truncate max-w-[200px] min-w-0"
                        title={pageInfo.pageSlug}
                      >
                        {pageInfo.pageSlug}
                      </span>
                      {pageInfo.targetPageSlug && (
                        <>
                          <span className="text-gray-400 text-lg whitespace-nowrap flex-shrink-0">|</span>
                          <ShortcutBadge targetSlug={pageInfo.targetPageSlug} />
                        </>
                      )}
                      {pageInfo.ctaGroup && pageInfo.ctaGroup !== 'none' && (
                        <>
                          <span className="text-gray-400 text-lg whitespace-nowrap flex-shrink-0">|</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold flex-shrink-0 ${
                              ['your-solution', 'info-hub', 'training-events', 'test-lab', 'products'].includes(pageInfo.ctaGroup)
                                ? 'bg-[#f9dc24] text-black border-[#f9dc24]'
                                : 'bg-black text-white border-gray-600'
                            }`}
                            title="Navigation CTA active for this page"
                          >
                            CTA
                          </span>
                        </>
                      )}
                      {selectedDesignIconOption && SelectedDesignIcon && hasDesignButtons && (
                        <>
                          <span className="text-gray-400 text-lg whitespace-nowrap flex-shrink-0">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!hasDesignButtons) {
                                toast.error('Flyout content is only available for navigation pages with design buttons.');
                                return;
                              }
                              setIsFlyoutDialogOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold whitespace-nowrap hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 flex-shrink-0"
                            title="Click to edit flyout image and description for this navigation item"
                          >
                            <SelectedDesignIcon className="h-4 w-4" />
                            <span>{selectedDesignIconOption.label}</span>
                          </button>
                        </>
                      )}
                    </>
                  ) : selectedPage && !pageInfo ? (
                    <>
                      <span className="font-bold text-base text-amber-700 whitespace-nowrap">No registry entry</span>
                      <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                      <span className="text-base text-gray-700 font-mono whitespace-nowrap">{selectedPage}</span>
                    </>
                  ) : (
                    <span className="text-base text-gray-500 italic whitespace-nowrap">No page selected</span>
                  )}
                </div>

                {/* Actions rechts in einer Flucht, ohne über den Badges zu liegen */}
                {selectedPage && pageInfo && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="decision"
                      className="flex items-center gap-2 bg-[hsl(var(--admin-control-1))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--admin-control-1))]/90 shadow-soft hover:shadow-lg"
                      title={!selectedPage || !pageInfo ? 'Select a CMS-ready page to add new segments' : undefined}
                      onClick={() => {
                        if (!selectedPage || !pageInfo) return;
                        setIsTemplateDialogOpen(true);
                      }}
                    >
                      <Layers className="h-4 w-4" />
                      Add New Segment
                    </Button>

                    <Button
                      variant="decision"
                      className="flex items-center gap-2 bg-[hsl(var(--admin-control-2))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--admin-control-2))]/90 shadow-soft hover:shadow-lg"
                      disabled={!hasDesignButtons}
                      title={!hasDesignButtons ? 'Design elements are only available for second and third-level navigation pages' : undefined}
                      onClick={() => {
                        if (!selectedPage || !pageInfo || !hasDesignButtons) return;
                        setIsDesignElementDialogOpen(true);
                      }}
                    >
                      <Palette className="h-4 w-4" />
                      Navigation Design
                    </Button>

                    <Button
                      variant="decision"
                      className="flex items-center gap-2 bg-[hsl(var(--admin-control-3))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--admin-control-3))]/90 shadow-soft hover:shadow-lg"
                      disabled={!hasDesignButtons}
                      title={!hasDesignButtons ? 'Navigation CTAs are only available for second and third-level navigation pages' : undefined}
                      onClick={() => {
                        if (!selectedPage || !pageInfo || !hasDesignButtons) return;
                        setIsCtaDialogOpen(true);
                      }}
                    >
                      <Zap className="h-4 w-4" />
                      Navigation CTA
                    </Button>

                    <ShortcutEditor
                      pageId={pageInfo.pageId}
                      pageSlug={pageInfo.pageSlug}
                      pageTitle={pageInfo.pageTitle}
                      currentTargetSlug={pageInfo.targetPageSlug || null}
                      onShortcutUpdated={loadPageInfo}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {/* Only show buttons for areas the user has access to */}
              {(isAdmin || allowedPages.includes('news') || allowedPages.includes('__all__')) && (
                <Button
                  variant="decision"
                  className="flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 shadow-soft hover:shadow-lg"
                  onClick={() => navigate(`/${language}/admin-dashboard/news`)}
                >
                  <Newspaper className="h-4 w-4" />
                  Manage News
                </Button>
              )}
              {(isAdmin || allowedPages.includes('events') || allowedPages.includes('__all__')) && (
                <Button
                  variant="decision"
                  className="flex items-center gap-2 bg-[hsl(var(--events-button))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--events-button))]/90 shadow-soft hover:shadow-lg"
                  onClick={() => navigate(`/${language}/admin-dashboard/events`)}
                >
                  <Calendar className="h-4 w-4" />
                  Manage Events
                </Button>
              )}
              {(isAdmin || allowedPages.includes('products') || allowedPages.includes('__all__')) && (
                <Button
                  variant="decision"
                  className="flex items-center gap-2 bg-[hsl(var(--accent-blue))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent-blue))]/90 shadow-soft hover:shadow-lg"
                  onClick={() => navigate(`/${language}/admin-dashboard/products`)}
                >
                  <Target className="h-4 w-4" />
                  Manage Products
                </Button>
              )}
              {(isAdmin || allowedPages.includes('downloads') || allowedPages.includes('__all__')) && (
                <Button
                  variant="decision"
                  className="flex items-center gap-2 bg-[hsl(180_60%_45%)] text-white hover:bg-[hsl(180_60%_40%)] shadow-soft hover:shadow-lg"
                  onClick={() => navigate(`/${language}/admin-dashboard/downloads`)}
                >
                  <Download className="h-4 w-4" />
                  Manage Downloads
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="decision"
                  className="flex items-center gap-2 bg-[hsl(var(--seo-button))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--seo-button))]/90 shadow-soft hover:shadow-lg"
                  onClick={() => setIsSEOEditorOpen(!isSEOEditorOpen)}
                >
                  <Eye className="h-4 w-4" />
                  SEO Settings
                </Button>
              )}
              {(isAdmin || allowedPages.includes('glossary')) && (
                <Button
                  variant="decision"
                  className="flex items-center gap-2 bg-[hsl(var(--accent-violet))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent-violet))]/90 shadow-soft hover:shadow-lg"
                  onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
                >
                  <Book className="h-4 w-4" />
                  Translation Glossary
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Segment Template Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-3xl font-bold text-white">Choose a Segment</DialogTitle>
                  <DialogDescription className="text-base text-white/80 mt-2">
                    Select a content segment to add to your page
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="page-heroes" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="page-heroes">Page Hero Segments</TabsTrigger>
                    <TabsTrigger value="content">Content Segments</TabsTrigger>
                    <TabsTrigger value="special">Special Segments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="page-heroes">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                      {/* Product Hero - F */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('hero')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#f9dc24] to-yellow-300 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Eye className="h-7 w-7 text-gray-900" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Product Hero - F</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Main page hero with image, title, description and CTA button
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#f9dc24] to-yellow-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Meta Navigation - E */}
                      <div 
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white hover:shadow-xl ${
                          pageSegments.some(seg => seg.type === 'full-hero')
                            ? 'border-red-300 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-orange-400 cursor-pointer'
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
                            <Navigation2 className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Meta Navigation - E</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Anchor links for page sections
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

                      {/* Product Gallery - G */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-pink-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('product-hero-gallery')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Images className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Product Gallery - G</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Product hero with image carousel
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Full Hero - A */}
                      <div 
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white hover:shadow-xl ${
                          pageSegments.some(seg => seg.type === 'meta-navigation')
                            ? 'border-red-300 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-rose-400 cursor-pointer'
                        }`}
                        onClick={() => handleAddSegment('full-hero')}
                      >
                        {pageSegments.some(seg => seg.type === 'meta-navigation') && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                            Blocked by Meta Nav
                          </div>
                        )}
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Monitor className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Full Hero - A</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Fullscreen Ken Burns background
                            </p>
                            {pageSegments.some(seg => seg.type === 'meta-navigation') && (
                              <p className="text-xs text-red-600 mt-2 font-semibold">
                                ⚠️ Cannot be used with Meta Navigation
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 to-rose-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Action Hero - Q */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-violet-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('action-hero')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Zap className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Action Hero - Q</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Slim hero with action focus
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-violet-500 to-violet-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                      {/* Intro - B */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-teal-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('intro')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Type className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Intro - B</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Title & description section
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Tiles - H */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('tiles')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <LayoutGrid className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Tiles - H</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Feature cards grid
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Banner - J */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('banner')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <ImageIcon className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Banner - J</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Promo with images
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Image & Text - I */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-lime-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('image-text')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-lime-500 to-lime-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <SplitSquareVertical className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Image & Text - I</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Split layout
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-lime-500 to-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Video - M */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('video')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <PlayCircle className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Video - M</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Embedded player
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Feature Overview - K */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('feature-overview')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <ListChecks className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Feature Overview - K</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Icon features list
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Table - L */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-emerald-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('table')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Table2 className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Table - L</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Data tables
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* FAQ - O */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-red-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('faq')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <HelpCircle className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">FAQ - O</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Q&A accordion
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-500 to-red-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Specification - N */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-amber-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('specification')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FileText className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Specification - N</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Tech specs
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Industries - C */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-slate-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('industries')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Industries - C</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Industry showcase
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-slate-600 to-slate-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="special">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                      {/* Latest News - D */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-sky-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('news')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Newspaper className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Latest News - D</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              News feed block
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-500 to-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* News List - P */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-fuchsia-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('news-list')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <List className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">News List - P</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Filterable news
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Events - R */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('events')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Calendar className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Events - R</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Event listings
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-500 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Product List - S */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('product-list')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Target className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Product List - S</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Product catalog
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Downloads - T */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('downloads')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Download className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Downloads - T</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Download center with forms
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Mini Footer - U */}
                      <div 
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white hover:shadow-xl ${
                          pageSegments.some(seg => seg.type === 'mini-footer')
                            ? 'border-gray-400 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-500 cursor-pointer'
                        }`}
                        onClick={() => !pageSegments.some(seg => seg.type === 'mini-footer') && handleAddSegment('mini-footer')}
                      >
                        {pageSegments.some(seg => seg.type === 'mini-footer') && (
                          <div className="absolute top-2 right-2 z-10 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                            Already active
                          </div>
                        )}
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-600 to-gray-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <PanelBottom className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Mini Footer - U</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Minimal footer (replaces full footer)
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gray-600 to-gray-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
              </Dialog>

              {/* Design Element Dialog */}
              <Dialog open={isDesignElementDialogOpen} onOpenChange={setIsDesignElementDialogOpen}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Select design element</DialogTitle>
                    <DialogDescription>
                      Choose an icon that will appear in the segment bar and navigation for this page.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <p className="text-xs text-gray-500">
                      Design elements can only be selected for second-level navigation pages (direct children of main sections like "Your Solution" or "Products").
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {DESIGN_ICON_OPTIONS.map((option) => {
                        const IconComp = option.Icon;
                        const isActive = (pendingDesignIcon ?? pageInfo?.designIcon) === option.key;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setPendingDesignIcon(option.key)}
                            className={`flex flex-col items-center justify-center rounded-lg border px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? 'border-primary bg-primary/10 text-primary-foreground'
                                : 'border-border bg-card text-foreground hover:border-primary hover:bg-muted'
                            }`}
                          >
                            <IconComp className="h-5 w-5 mb-1" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                      <div className="text-xs text-gray-500">
                        {pageInfo?.designIcon
                          ? `Current: ${pageInfo.designIcon}`
                          : 'No design element selected yet'}
                      </div>
                      <div className="flex gap-2">
                        {pageInfo?.designIcon && (
                          <Button variant="outline" size="sm" onClick={handleRemoveDesignElement}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        )}
                        <Button size="sm" onClick={handleSaveDesignElement} disabled={!pendingDesignIcon}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Navigation CTA Dialog */}
              <Dialog open={isCtaDialogOpen} onOpenChange={setIsCtaDialogOpen}>
                <DialogContent className="max-w-xl bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
                  <DialogHeader>
                    <DialogTitle>Navigation CTA for this page</DialogTitle>
                    <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                      Define whether this page should be used as a call-to-action button in the main navigation flyouts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                        Only one page can be assigned per CTA group. Saving here will replace any existing CTA for the selected group.
                      </p>
                      <Label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">CTA Group</Label>
                      <select
                        className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]"
                        value={ctaGroup}
                        onChange={(e) => setCtaGroup(e.target.value)}
                      >
                        {CTA_GROUP_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">CTA Icon</Label>
                      <select
                        className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))]"
                        value={ctaIcon}
                        onChange={(e) => setCtaIcon(e.target.value)}
                      >
                        <option value="auto">Automatic (recommended)</option>
                        <option value="search">Search icon (magnifier)</option>
                        <option value="microscope">Microscope icon</option>
                        <option value="none">No icon</option>
                      </select>
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        The selected icon appears left of the CTA label in the navigation flyout.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Button label</label>
                      <Input
                        type="text"
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        placeholder={pageInfo?.pageTitle || 'Button label'}
                        className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]"
                      />
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        If left empty, the page title "{pageInfo?.pageTitle}" will be used.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCtaGroup('none');
                          setCtaLabel('');
                        }}
                      >
                        Clear CTA
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveCtaConfig}
                        disabled={isSavingCta}
                      >
                        {isSavingCta ? 'Saving...' : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            Save CTA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Flyout Content Dialog (triggered by clicking the design element badge) */}
              <Dialog open={isFlyoutDialogOpen} onOpenChange={setIsFlyoutDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Flyout teaser for this navigation item</DialogTitle>
                    <DialogDescription>
                      Configure the image and description that appear in the lower flyout area for this second-level navigation item.
                    </DialogDescription>
                  </DialogHeader>

                  {!hasDesignButtons && (
                    <p className="text-xs text-red-600 mb-3">
                      Flyout content is only available for navigation pages with design buttons enabled.
                    </p>
                  )}

                  <div className="space-y-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                        <span>
                          Current page: <span className="font-semibold">{pageInfo?.pageTitle}</span> ({pageInfo?.pageSlug})
                        </span>
                        {pageInfo?.ctaGroup && pageInfo.ctaGroup !== 'none' && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                              pageInfo.ctaGroup === 'your-solution'
                                ? 'bg-[#f9dc24] text-black border-[#f9dc24]'
                                : 'bg-black text-white border-gray-600'
                            }`}
                          >
                            {pageInfo.ctaIcon === 'microscope' ? (
                              <span className="inline-flex items-center">🔬</span>
                            ) : (
                              <span className="inline-flex items-center">🔍</span>
                            )}
                            <span>
                              {(() => {
                                const labelMap: Record<string, string> = {
                                  'your-solution': 'Navigation CTA: Your Solution',
                                  'products': 'Navigation CTA: Products',
                                  'test-lab': 'Navigation CTA: Test Lab',
                                  'training-events': 'Navigation CTA: Training & Events',
                                  'info-hub': 'Navigation CTA: Info Hub',
                                };
                                return labelMap[pageInfo.ctaGroup] || `Navigation CTA: ${pageInfo.ctaGroup}`;
                              })()}
                            </span>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        This teaser is used in the main navigation flyout below the list of items.
                      </p>
                    </div>

                    {/* Image selection via Media Management */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Flyout image</label>

                      {flyoutImageUrl ? (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-black mb-2">
                          <img
                            src={flyoutImageUrl}
                            alt={flyoutDescriptionTranslations['en'] || 'Flyout teaser image'}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFlyoutImageUrl(null)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors z-10 text-xs"
                            title="Remove flyout image"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mb-1">No image selected yet.</p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={() => setIsFlyoutMediaDialogOpen(true)}
                          disabled={!hasDesignButtons}
                        >
                          <FolderOpen className="h-4 w-4" />
                          <span>Select from Media Management</span>
                        </Button>
                      </div>

                      {isFlyoutMediaDialogOpen && (
                        <DataHubDialog
                          isOpen={isFlyoutMediaDialogOpen}
                          onClose={() => setIsFlyoutMediaDialogOpen(false)}
                          selectionMode={true}
                          onSelect={(url) => {
                            handleFlyoutImageSelect(url);
                            setIsFlyoutMediaDialogOpen(false);
                          }}
                        />
                      )}

                      <p className="text-[11px] text-gray-500 mt-1">
                        When you select an image, the system will try to use its alt text as an initial description.
                      </p>
                    </div>

                    {/* Description text with language selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Flyout description</label>
                        <div className="flex items-center gap-2">
                          <Select value={flyoutDescriptionLanguage} onValueChange={setFlyoutDescriptionLanguage}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">🇺🇸 English</SelectItem>
                              <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                              <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                              <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                              <SelectItem value="zh">🇨🇳 中文</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Textarea
                        value={flyoutDescriptionTranslations[flyoutDescriptionLanguage] || ''}
                        onChange={(e) => setFlyoutDescriptionTranslations(prev => ({
                          ...prev,
                          [flyoutDescriptionLanguage]: e.target.value
                        }))}
                        rows={3}
                        placeholder={flyoutDescriptionLanguage === 'en' 
                          ? "Short description that appears under the title in the flyout..." 
                          : `Translation for ${flyoutDescriptionLanguage.toUpperCase()}...`
                        }
                      />
                      
                      {/* Auto-translate buttons */}
                      <div className="flex gap-2">
                        {flyoutDescriptionLanguage !== 'en' && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs border-purple-500 text-purple-600 hover:bg-purple-50"
                            disabled={isTranslatingFlyout || !flyoutDescriptionTranslations['en']}
                            onClick={async () => {
                              const englishText = flyoutDescriptionTranslations['en'];
                              if (!englishText) {
                                toast.error('Please enter English description first');
                                return;
                              }
                              setIsTranslatingFlyout(true);
                              try {
                                const { data, error } = await supabase.functions.invoke('translate-content', {
                                  body: {
                                    texts: { description: englishText },
                                    targetLanguage: flyoutDescriptionLanguage
                                  }
                                });
                                if (error) throw error;
                                if (data?.translatedTexts?.description) {
                                  setFlyoutDescriptionTranslations(prev => ({
                                    ...prev,
                                    [flyoutDescriptionLanguage]: data.translatedTexts.description
                                  }));
                                  toast.success('Translation complete');
                                }
                              } catch (err) {
                                console.error('Translation error:', err);
                                toast.error('Translation failed');
                              } finally {
                                setIsTranslatingFlyout(false);
                              }
                            }}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {isTranslatingFlyout ? 'Translating...' : 'Auto-Translate'}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs border-purple-500 text-purple-600 hover:bg-purple-50"
                          disabled={isTranslatingFlyout || !flyoutDescriptionTranslations['en']}
                          onClick={async () => {
                            const englishText = flyoutDescriptionTranslations['en'];
                            if (!englishText) {
                              toast.error('Please enter English description first');
                              return;
                            }
                            setIsTranslatingFlyout(true);
                            const targetLangs = ['de', 'ja', 'ko', 'zh'];
                            try {
                              const results = await Promise.all(
                                targetLangs.map(async (lang) => {
                                  const { data, error } = await supabase.functions.invoke('translate-content', {
                                    body: {
                                      texts: { description: englishText },
                                      targetLanguage: lang
                                    }
                                  });
                                  if (error) throw error;
                                  return { lang, text: data?.translatedTexts?.description || '' };
                                })
                              );
                              const newTranslations = { ...flyoutDescriptionTranslations };
                              results.forEach(({ lang, text }) => {
                                if (text) newTranslations[lang] = text;
                              });
                              setFlyoutDescriptionTranslations(newTranslations);
                              toast.success('All translations complete');
                            } catch (err) {
                              console.error('Translation error:', err);
                              toast.error('Some translations failed');
                            } finally {
                              setIsTranslatingFlyout(false);
                            }
                          }}
                        >
                          <Languages className="h-3 w-3 mr-1" />
                          {isTranslatingFlyout ? 'Translating...' : 'Translate All'}
                        </Button>
                      </div>
                      
                      {isTranslatingFlyout && (
                        <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded animate-pulse" />
                      )}
                      
                      <p className="text-[11px] text-gray-500">
                        Enter English first, then translate to other languages.
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                      <div className="text-xs text-gray-500">
                        {flyoutImageUrl ? 'Flyout image selected' : 'No flyout image selected yet'}
                      </div>
                      <div className="flex gap-2">
                        {flyoutImageUrl || Object.keys(flyoutDescriptionTranslations).some(k => flyoutDescriptionTranslations[k]) ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearFlyoutInfo}
                            disabled={isSavingFlyout}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveFlyoutInfo}
                          disabled={isSavingFlyout || !hasDesignButtons}
                        >
                          {isSavingFlyout ? (
                            'Saving...'
                          ) : (
                            <>
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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

        {/* Glossary Manager - Conditional Rendering */}
        {isGlossaryOpen && (
          <div className="mb-8">
            <GlossaryManager />
          </div>
        )}

        {/* Welcome Screen - Show when no page is selected */}
        {/* Note: Only show welcome when no page selected. If a page is selected but has no segments, still show tab UI */}
        {!selectedPage ? (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative">
              {/* Version Badge - Top Right */}
              <div className="absolute top-6 right-6 z-10">
                <span className="px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#f9dc24] via-yellow-300 to-[#f9dc24] text-gray-900 rounded-lg shadow-lg shadow-yellow-400/30 border border-yellow-400/50">
                  Version 0.9.2
                </span>
              </div>
              <CardContent className="p-12">
                <div className="space-y-8">
                  {/* Header */}
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

                  {/* Features Grid - Compact */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Layers className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Modular Segments</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Languages className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Multi-Language</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Book className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Translation Glossary</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Sparkles className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Auto Translation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <FolderOpen className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Media Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Newspaper className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">News Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Calendar className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Event Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Target className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Product Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Download className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Download Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Settings className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">CMS-Managed Navigation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <GripVertical className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Hierarchical Pages</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Eye className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">SEO Suite</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <Shield className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">User Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <HistoryIcon className="h-5 w-5 text-[#f9dc24]" />
                      <span className="text-white text-sm font-medium">Versionsmanagement</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Content Segments - Tabbed Overview */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#f9dc24] flex items-center justify-center">
                    <Layers className="h-6 w-6 text-gray-900" />
                  </div>
                  Available Content Segments
                </CardTitle>
                <CardDescription className="text-base text-gray-600 mt-2">
                  Build your pages using these powerful content segments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="page-heroes" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="page-heroes" className="text-sm font-semibold">Page Hero Segments</TabsTrigger>
                    <TabsTrigger value="content-segments" className="text-sm font-semibold">Content Segments</TabsTrigger>
                    <TabsTrigger value="special-templates" className="text-sm font-semibold">Special Segments</TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Page Heroes */}
                  <TabsContent value="page-heroes" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {/* F - Product Hero */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#f9dc24] text-gray-900 text-xs font-black rounded">F</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#f9dc24] to-yellow-300 flex items-center justify-center shadow">
                            <Eye className="h-5 w-5 text-gray-900" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Product Hero</h4>
                          <p className="text-xs text-gray-500">Hero with image & CTA</p>
                        </div>
                      </div>

                      {/* E - Meta Navigation */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-black rounded">E</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow">
                            <Navigation2 className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Meta Navigation</h4>
                          <p className="text-xs text-gray-500">Anchor links</p>
                        </div>
                      </div>

                      {/* G - Product Gallery */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-pink-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-pink-500 text-white text-xs font-black rounded">G</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-400 flex items-center justify-center shadow">
                            <Images className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Product Gallery</h4>
                          <p className="text-xs text-gray-500">Image carousel</p>
                        </div>
                      </div>

                      {/* A - Full Hero */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-rose-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-rose-500 text-white text-xs font-black rounded">A</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center shadow">
                            <Monitor className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Full Hero</h4>
                          <p className="text-xs text-gray-500">Fullscreen Ken Burns</p>
                        </div>
                      </div>

                      {/* Q - Action Hero */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-violet-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-500 text-white text-xs font-black rounded">Q</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-400 flex items-center justify-center shadow">
                            <Zap className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Action Hero</h4>
                          <p className="text-xs text-gray-500">Hero with action focus</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Content Segments */}
                  <TabsContent value="content-segments" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {/* B - Intro */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-teal-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-teal-500 text-white text-xs font-black rounded">B</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow">
                            <Type className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Intro</h4>
                          <p className="text-xs text-gray-500">Title & description</p>
                        </div>
                      </div>

                      {/* H - Tiles */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-black rounded">H</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow">
                            <LayoutGrid className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Tiles</h4>
                          <p className="text-xs text-gray-500">Feature cards grid</p>
                        </div>
                      </div>

                      {/* J - Banner */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-white text-xs font-black rounded">J</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow">
                            <ImageIcon className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Banner</h4>
                          <p className="text-xs text-gray-500">Promo with images</p>
                        </div>
                      </div>

                      {/* I - Image & Text */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-lime-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-lime-500 text-white text-xs font-black rounded">I</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-lime-500 to-lime-400 flex items-center justify-center shadow">
                            <SplitSquareVertical className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Image & Text</h4>
                          <p className="text-xs text-gray-500">Split layout</p>
                        </div>
                      </div>

                      {/* M - Video */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500 text-white text-xs font-black rounded">M</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow">
                            <PlayCircle className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Video</h4>
                          <p className="text-xs text-gray-500">Embedded player</p>
                        </div>
                      </div>

                      {/* K - Feature Overview */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-500 text-white text-xs font-black rounded">K</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow">
                            <ListChecks className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Feature Overview</h4>
                          <p className="text-xs text-gray-500">Icon features list</p>
                        </div>
                      </div>

                      {/* L - Table */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-emerald-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-black rounded">L</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow">
                            <Table2 className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Table</h4>
                          <p className="text-xs text-gray-500">Data tables</p>
                        </div>
                      </div>

                      {/* O - FAQ */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-red-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-black rounded">O</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-red-400 flex items-center justify-center shadow">
                            <HelpCircle className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">FAQ</h4>
                          <p className="text-xs text-gray-500">Q&A accordion</p>
                        </div>
                      </div>

                      {/* N - Specification */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-amber-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-black rounded">N</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Specification</h4>
                          <p className="text-xs text-gray-500">Tech specs</p>
                        </div>
                      </div>

                      {/* C - Industries */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-slate-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-600 text-white text-xs font-black rounded">C</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center shadow">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Industries</h4>
                          <p className="text-xs text-gray-500">Industry showcase</p>
                        </div>
                      </div>

                      {/* Z - Footer */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-gray-500 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-700 text-white text-xs font-black rounded">Z</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow">
                            <PanelBottom className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Footer</h4>
                          <p className="text-xs text-gray-500">Page footer</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Special Segments */}
                  <TabsContent value="special-templates" className="mt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {/* D - Latest News */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-sky-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-sky-500 text-white text-xs font-black rounded">D</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow">
                            <Newspaper className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Latest News</h4>
                          <p className="text-xs text-gray-500">News feed block</p>
                        </div>
                      </div>

                      {/* P - News List */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-fuchsia-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-fuchsia-500 text-white text-xs font-black rounded">P</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-fuchsia-400 flex items-center justify-center shadow">
                            <List className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">News List</h4>
                          <p className="text-xs text-gray-500">Filterable news</p>
                        </div>
                      </div>

                      {/* R - Events */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-black rounded">R</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center shadow">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Events</h4>
                          <p className="text-xs text-gray-500">Event listings</p>
                        </div>
                      </div>

                      {/* S - Product List */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-cyan-500 text-white text-xs font-black rounded">S</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Product List</h4>
                          <p className="text-xs text-gray-500">Filterable products</p>
                        </div>
                      </div>

                      {/* T - Downloads */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-black rounded">T</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow">
                            <Download className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Downloads</h4>
                          <p className="text-xs text-gray-500">Download resources</p>
                        </div>
                      </div>

                      {/* U - Mini Footer */}
                      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-gray-500 transition-all duration-300 bg-white hover:shadow-xl">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-600 text-white text-xs font-black rounded">U</div>
                        <div className="p-4 space-y-2">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-500 flex items-center justify-center shadow">
                            <PanelBottom className="h-5 w-5 text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Mini Footer</h4>
                          <p className="text-xs text-gray-500">Compact footer</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Available Content Editors - Functional for editors */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#f5743a] to-orange-400 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  {isEditor ? 'Your Content Editors' : 'Available Content Editors'}
                </CardTitle>
                <CardDescription className="text-base text-gray-600 mt-2">
                  {isEditor ? 'Click to access your assigned content areas' : 'Manage your content with these powerful editing tools'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Manage News - Primary Orange */}
                  {(isAdmin || allowedPages.includes('news') || allowedPages.includes('__all__')) && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[hsl(var(--primary))] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => navigate(`/${language}/admin-dashboard/news`)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--primary))]"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Newspaper className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Manage News</h4>
                        <p className="text-xs text-gray-500">Create & edit articles</p>
                      </div>
                    </div>
                  )}

                  {/* Manage Events - Events Button Blue */}
                  {(isAdmin || allowedPages.includes('events') || allowedPages.includes('__all__')) && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[hsl(var(--events-button))] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => navigate(`/${language}/admin-dashboard/events`)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--events-button))]"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-[hsl(var(--events-button))] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Manage Events</h4>
                        <p className="text-xs text-gray-500">Schedule & organize</p>
                      </div>
                    </div>
                  )}

                  {/* Manage Products - Accent Blue/Teal */}
                  {(isAdmin || allowedPages.includes('products') || allowedPages.includes('__all__')) && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[hsl(var(--accent-blue))] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => navigate(`/${language}/admin-dashboard/products`)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--accent-blue))]"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-[hsl(var(--accent-blue))] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Manage Products</h4>
                        <p className="text-xs text-gray-500">Product catalog</p>
                      </div>
                    </div>
                  )}

                  {/* Manage Downloads - Teal */}
                  {(isAdmin || allowedPages.includes('downloads') || allowedPages.includes('__all__')) && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[hsl(180_60%_45%)] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => navigate(`/${language}/admin-dashboard/downloads`)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(180_60%_45%)]"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-[hsl(180_60%_45%)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Download className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Manage Downloads</h4>
                        <p className="text-xs text-gray-500">Resources & files</p>
                      </div>
                    </div>
                  )}

                  {/* SEO Settings - SEO Button Orange - Admin only */}
                  {isAdmin && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[hsl(var(--seo-button))] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => {
                        toast.info('Select a page first to edit its SEO settings');
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--seo-button))]"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-[hsl(var(--seo-button))] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">SEO Settings</h4>
                        <p className="text-xs text-gray-500">Meta & optimization</p>
                      </div>
                    </div>
                  )}

                  {/* Translation Glossary - Accent Violet */}
                  {(isAdmin || allowedPages.includes('glossary')) && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[hsl(var(--accent-violet))] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => setIsGlossaryOpen(true)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--accent-violet))]"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-[hsl(var(--accent-violet))] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Book className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Translation Glossary</h4>
                        <p className="text-xs text-gray-500">Terminology database</p>
                      </div>
                    </div>
                  )}

                  {/* User Management - Red/Shield - Admin only */}
                  {isAdmin && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-red-500 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => setShowUserManagement(true)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">User Management</h4>
                        <p className="text-xs text-gray-500">Roles & permissions</p>
                      </div>
                    </div>
                  )}

                  {/* Version History - Amber/Clock - Admin only */}
                  {isAdmin && (
                    <div 
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-amber-500 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                      onClick={() => toast.info("Select a page first to view its version history")}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
                      <div className="p-5 space-y-3 text-center">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <HistoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">Version History</h4>
                        <p className="text-xs text-gray-500">Rollback & restore</p>
                      </div>
                    </div>
                  )}
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
              <TabsList className="flex flex-wrap w-full h-auto p-2 bg-gray-200 pl-3">
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
                        ID {segmentId}: Meta Nav - E {displayNumber}
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
                        ID {segmentId}: Full Hero - A {displayNumber}
                      </TabsTrigger>
                    );
                  })}

                {/* Action Hero - Fixed Position (After Meta Nav / Full Hero, before other segments) */}
                {pageSegments
                  .filter(segment => segment.type === 'action-hero')
                  .map((segment) => {
                    const segmentIndex = pageSegments.indexOf(segment);
                    const sameTypeBefore = pageSegments.slice(0, segmentIndex).filter(s => s.type === 'action-hero').length;
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
                  items={tabOrder.filter(tabId => {
                    const segment = pageSegments.find(s => s.id === tabId);
                    // Exclude meta-navigation, full-hero, action-hero, footer, and mini-footer from draggable section
                    return !segment || (segment.type !== 'meta-navigation' && segment.type !== 'full-hero' && segment.type !== 'action-hero' && segment.type !== 'footer' && segment.type !== 'mini-footer');
                  })}
                  strategy={horizontalListSortingStrategy}
                >
                  {tabOrder
                    .filter(tabId => {
                      const segment = pageSegments.find(s => s.id === tabId);
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
                    const segment = pageSegments.find(s => s.id === tabId);
                    if (segment) {
                      const segmentIndex = pageSegments.indexOf(segment);
                      const sameTypeBefore = pageSegments.slice(0, segmentIndex).filter(s => s.type === segment.type).length;
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
                  const hasMiniFooter = pageSegments.some(s => s.type === 'mini-footer');
                  const footerSegment = pageSegments.find(s => s.type === 'footer');
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
                  const miniFooterSegment = pageSegments.find(s => s.type === 'mini-footer');
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

                {/* Version History Tab - Fixed Right (Admin only) - Toggle behavior */}
                {isAdmin && (
                  <div 
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-3 text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ml-auto ${
                      activeTab === "version-history" 
                        ? "bg-amber-500 text-white shadow" 
                        : "bg-transparent hover:bg-muted"
                    }`}
                    onClick={() => {
                      // Toggle: if on history go back, otherwise go to history
                      if (activeTab === "version-history" && tabOrder.length > 0) {
                        setActiveTab(tabOrder[0]);
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
          {pageSegments.map((segment, index) => {
            // Calculate display number based on same type before this index (consistent with Tab Label logic)
            const sameTypeBefore = pageSegments.slice(0, index).filter(s => s.type === segment.type).length;
            const displayNumber = sameTypeBefore + 1;
            const segmentId = segmentRegistry[segment.id] || segment.id;
            const reverseRegistry = (window as any).__segmentKeyRegistry || {};
            const customKey = reverseRegistry[String(segmentId)];

            // Always generate formatted label based on segment type
            let label = '';
            if (segment.type === 'hero') label = `Produkt Hero - F-${displayNumber}`;
            else if (segment.type === 'meta-navigation') label = `Meta Navigation - E-${displayNumber}`;
            else if (segment.type === 'product-hero-gallery') label = `Product Gallery - G-${displayNumber}`;
            else if (segment.type === 'tiles') label = `Tiles - H-${displayNumber}`;
            else if (segment.type === 'banner') label = `Banner - J-${displayNumber}`;
            else if (segment.type === 'banner-p') label = `Banner P - ${displayNumber}`;
            else if (segment.type === 'image-text') label = `Image & Text - I-${displayNumber}`;
            else if (segment.type === 'full-hero') label = `Full Hero - A-${displayNumber}`;
            else if (segment.type === 'intro') label = `Intro - B-${displayNumber}`;
            else if (segment.type === 'industries') label = `Industries - C-${displayNumber}`;
            else if (segment.type === 'news') label = `Latest News - D-${displayNumber}`;
            else if (segment.type === 'debug') label = `Debug ${displayNumber}`;
            else if (segment.type === 'news-list') label = `News List - P-${displayNumber}`;
            else if (segment.type === 'action-hero') label = `Action Hero - Q-${displayNumber}`;
            else if (segment.type === 'events') label = `Events List - R-${displayNumber}`;
            else if (segment.type === 'product-list') label = `Product List - S-${displayNumber}`;
            else if (segment.type === 'downloads') label = `Downloads - T-${displayNumber}`;
            else if (segment.type === 'mini-footer') label = `Mini Footer - U-${displayNumber}`;
            else if (segment.type === 'feature-overview') label = `Features - K-${displayNumber}`;
            else if (segment.type === 'table') label = `Table - L-${displayNumber}`;
            else if (segment.type === 'faq') label = `FAQ - O-${displayNumber}`;
            else if (segment.type === 'video') label = `Video - M-${displayNumber}`;
            else if (segment.type === 'specification') label = `Specification - N-${displayNumber}`;
            else label = `${segment.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - ${displayNumber}`;
            
            return (
            <TabsContent key={`segment-content-${segment.id}`} value={segment.id}>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {label}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Edit this {
                          segment.type === 'action-hero' ? 'Action Hero' :
                          segment.type === 'news-list' ? 'News List' :
                          segment.type === 'full-hero' ? 'Full Hero' :
                          segment.type === 'meta-navigation' ? 'Meta Navigation' :
                          segment.type === 'product-hero-gallery' ? 'Product Hero Gallery' :
                          segment.type === 'feature-overview' ? 'Feature Overview' :
                          segment.type === 'image-text' ? 'Image Text' :
                          segment.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                        } Segment
                      </CardDescription>
                      <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                        ID: {segmentRegistry[segment.id] || segment.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <SegmentHistoryButton
                        pageSlug={resolvedPageSlug || selectedPage}
                        sectionKey={`${segment.id}_title`}
                        language={editorLanguage}
                        onRestore={() => loadContent()}
                      />
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
                  {segment.type === 'hero' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Product Hero"
                      segmentType="hero"
                    >
                      {(language) => (
                        <ProductHeroEditor
                          key={`hero-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          onSave={() => loadContent()}
                          language={language}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}
                  
                  {segment.type === 'meta-navigation' && (() => {
                    // Build available segments list with their titles
                    // IMPORTANT: Use numeric segment_id from segmentRegistry, not string keys
                    const availableSegments: { id: string; title: string }[] = [];
                    
                    // buildSegmentLabel is imported from AdminConstants

                    // Tiles segment (static tab)
                    if (segmentRegistry['tiles']) {
                      availableSegments.push({
                        id: segmentRegistry['tiles'].toString(),
                        title: 'Tiles - H',
                      });
                    }
                    
                    // Banner segment (static tab)
                    if (segmentRegistry['banner']) {
                      availableSegments.push({
                        id: segmentRegistry['banner'].toString(),
                        title: 'Banner - J',
                      });
                    }
                    
                    // Solutions/Image & Text segment (static tab)
                    if (segmentRegistry['solutions']) {
                      availableSegments.push({
                        id: segmentRegistry['solutions'].toString(),
                        title: 'Image & Text - I',
                      });
                    }
                    
                    // Dynamic segments - ONLY include if they exist in segmentRegistry (not deleted)
                    pageSegments.forEach((seg) => {
                      // Meta Navigation selbst NICHT als Ziel anbieten
                      if (seg.type === 'meta-navigation') return;
                      
                      const numericId = segmentRegistry[seg.id];
                      if (!numericId) return;
                      
                      const segmentIndex = pageSegments.indexOf(seg);
                      const sameTypeBefore = pageSegments
                        .slice(0, segmentIndex)
                        .filter((s) => s.type === seg.type).length;
                      const displayNumber = sameTypeBefore + 1;
                      const label = buildSegmentLabel(seg.type as string, displayNumber);
                      
                      availableSegments.push({
                        id: numericId.toString(),
                        title: label,
                      });
                    });
                    
                    // Footer segment (static tab)
                    if (segmentRegistry['footer']) {
                      availableSegments.push({
                        id: segmentRegistry['footer'].toString(),
                        title: 'Footer',
                      });
                    }
                    
                    // Immer numerisch nach Segment-ID sortieren (z.B. 337 vor 338)
                    availableSegments.sort((a, b) => Number(a.id) - Number(b.id));
                    
                    return (
                      <SplitScreenSegmentEditor
                        segmentTitle="Meta Navigation"
                        segmentType="meta-navigation"
                      >
                        {(language) => (
                          <MetaNavigationEditor
                            key={`meta-${segment.id}-${language}`}
                            pageSlug={resolvedPageSlug || selectedPage}
                            segmentId={segment.id}
                            language={language}
                            availableSegments={availableSegments}
                            onSave={() => loadContent()}
                          />
                        )}
                      </SplitScreenSegmentEditor>
                    );
                  })()}
                  {segment.type === 'tiles' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Tiles"
                      segmentType="tiles"
                    >
                      {(language) => (
                        <TilesSegmentEditor
                          key={`tiles-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'image-text' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Image & Text"
                      segmentType="image-text"
                    >
                      {(language) => (
                        <ImageTextEditor
                          key={`image-text-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'feature-overview' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Feature Overview"
                      segmentType="feature-overview"
                    >
                      {(language) => (
                        <FeatureOverviewEditor
                          key={`feature-overview-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'table' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Table"
                      segmentType="table"
                    >
                      {(language) => (
                        <TableEditor
                          key={`table-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'faq' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="FAQ"
                      segmentType="faq"
                    >
                      {(language) => (
                        <FAQEditor
                          key={`faq-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'video' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Video"
                      segmentType="video"
                    >
                      {(language) => {
                        // Initialize with default data if needed
                        if (!segment.data) {
                          segment.data = getDefaultSegmentData('video');
                        }
                        
                        return (
                          <VideoSegmentEditor
                            key={`video-${segment.id}-${language}`}
                            onSave={() => loadContent()}
                            currentPageSlug={resolvedPageSlug || selectedPage}
                            segmentId={segment.id}
                            language={language}
                          />
                        );
                      }}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'news' && (
                    <NewsSegmentEditor
                      pageSlug={resolvedPageSlug || selectedPage}
                      segmentId={segment.id}
                      onUpdate={() => handleSaveSegments()}
                      currentPageSlug={resolvedPageSlug || selectedPage}
                    />
                  )}

                  {segment.type === 'news-list' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="News List"
                      segmentType="news-list"
                    >
                      {(language) => (
                        <NewsListSegmentEditor
                          key={`news-list-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          data={segment.data}
                          onSave={() => loadContent()}
                          language={language}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'action-hero' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Action Hero"
                      segmentType="action-hero"
                    >
                      {(language) => (
                        <ActionHeroEditor
                          key={`action-hero-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          data={segment.data}
                          onSave={() => loadContent()}
                          language={language}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'events' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Events List"
                      segmentType="events"
                    >
                      {(language) => (
                        <EventsSegmentEditor
                          key={`events-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          data={segment.data}
                          onSave={() => loadContent()}
                          language={language}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'product-list' && (
                    <ProductListSegmentEditor
                      segmentId={segment.id}
                      pageSlug={resolvedPageSlug || selectedPage}
                      language={editorLanguage}
                      onSave={() => loadContent()}
                    />
                  )}

                  {segment.type === 'downloads' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Downloads"
                      segmentType="downloads"
                    >
                      {(language) => (
                        <DownloadsSegmentEditor
                          key={`downloads-${segment.id}-${language}`}
                          segmentId={segment.id}
                          pageSlug={resolvedPageSlug || selectedPage}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'mini-footer' && (
                    <div className="space-y-4">
                      <div className="bg-gray-700 rounded-lg p-6 text-center">
                        <PanelBottom className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Mini Footer Active</h3>
                        <p className="text-gray-300 mb-4">
                          This page uses a minimal footer with only copyright and legal links. 
                          The full footer with contact info and team quote is hidden.
                        </p>
                        <div className="bg-gray-600 rounded p-4 text-left text-sm text-gray-300">
                          <p><strong>Displays:</strong></p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>© 2025 Image Engineering GmbH & Co. KG</li>
                            <li>Terms, Imprint, Privacy, Compliance links</li>
                            <li>Carbon Neutral, ESG, Disposal info links</li>
                          </ul>
                        </div>
                        <p className="text-gray-400 text-sm mt-4">
                          To restore the full footer, delete this segment.
                        </p>
                      </div>
                    </div>
                  )}

                  {segment.type === 'debug' && (() => {
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('debug');
                    }
                    
                    return (
                      <DebugEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const updatedSegments = pageSegments.map(s =>
                            s.id === segment.id ? { ...s, data: newData } : s
                          );
                          setPageSegments(updatedSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        pageSlug="styleguide/segments/hub-page"
                        segmentId={parseInt(segment.id)}
                      />
                    );
                  })()}

                  {segment.type === 'full-hero' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Full Hero"
                      segmentType="full-hero"
                    >
                      {(language) => (
                        <FullHeroEditor
                          key={`full-hero-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          onSave={() => loadContent()}
                          language={language}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'intro' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Intro Section"
                      segmentType="intro"
                    >
                      {(language) => (
                        <IntroEditor
                          key={`intro-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentKey={segment.id}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
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
                      pageSlug={resolvedPageSlug || selectedPage}
                      segmentKey={segment.id}
                      language={editorLanguage}
                    />
                  )}

                  {segment.type === 'specification' && (
                    <SplitScreenSegmentEditor
                      segmentTitle="Specification"
                      segmentType="specification"
                    >
                      {(language) => (
                        <SpecificationEditor
                          key={`specification-${segment.id}-${language}`}
                          pageSlug={resolvedPageSlug || selectedPage}
                          segmentId={segment.id}
                          language={language}
                          onSave={() => loadContent()}
                        />
                      )}
                    </SplitScreenSegmentEditor>
                  )}

                  {segment.type === 'product-hero-gallery' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('product-hero-gallery');
                    }
                    
                    return (
                      <SplitScreenSegmentEditor
                        segmentTitle="Product Hero Gallery"
                        segmentType="product-hero-gallery"
                      >
                        {(language) => (
                          <ProductHeroGalleryEditor
                            key={`phg-${segment.id}-${language}`}
                            data={segment.data}
                            onChange={(newData) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data = newData;
                              setPageSegments(newSegments);
                            }}
                            onSave={() => handleSaveSegments()}
                            pageSlug={resolvedPageSlug || selectedPage}
                            segmentId={segment.id}
                            language={language}
                          />
                        )}
                      </SplitScreenSegmentEditor>
                    );
                  })()}

                  {segment.type === 'banner' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('banner');
                    }
                    
                    return (
                      <BannerSegmentEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentKey={`segment_${segment.id}`}
                        language={editorLanguage}
                      />
                    );
                  })()}

                  {segment.type === 'banner-p' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('banner-p');
                    }
                    
                    return (
                      <BannerPEditor
                        data={segment.data}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                        pageSlug={resolvedPageSlug || selectedPage}
                        segmentKey={`segment_${segment.id}`}
                        language={editorLanguage}
                      />
                    );
                  })()}

                </CardContent>
              </Card>
            </TabsContent>
            );
          })}

          {/* Version History Tab Content */}
          {isAdmin && (
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
