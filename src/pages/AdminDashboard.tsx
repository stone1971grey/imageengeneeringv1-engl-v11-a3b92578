import { useEffect, useState, useRef, Component, type ErrorInfo, type ReactNode } from "react";
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
import { LogOut, Save, Plus, Trash2, X, GripVertical, Eye, Copy, MousePointer, Layers, Pencil, PlayCircle, Upload, FileText, Download, BarChart3, Zap, Shield, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor, Camera, Cog, Stethoscope, ScanLine, Target, FolderOpen, Book, Calendar, Newspaper, FlaskConical, Settings, Sparkles, Languages } from "lucide-react";
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

class AdminDashboardErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AdminDashboard ErrorBoundary] Caught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
          <div className="max-w-xl text-center space-y-4">
            <h1 className="text-2xl font-semibold">Editor error on this page</h1>
            <p className="text-sm text-gray-600">
              The CMS editor crashed while loading this page configuration.
              You can switch to another page in the CMS-UP selector and continue working.
            </p>
            {this.state.message && (
              <p className="text-xs text-gray-400 break-words">
                Technical info: {this.state.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const { language } = useLanguage();
  const navigationData = useNavigationData();
  
  // Static segment IDs - these are fixed and never change
  const STATIC_SEGMENT_IDS = {
    hero: 1,
    tiles: 2, 
    banner: 3,
    solutions: 4
  };

  // Mapping from parent page slugs to navigation "industry" categories
  // This is used to automatically create navigation_links entries for new CMS pages
  // so that they immediately appear in the Your Solution flyout.
  const INDUSTRY_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
    'your-solution/automotive': 'Automotive',
    'your-solution/security-surveillance': 'Security & Surveillance',
    'your-solution/mobile-phone': 'Mobile Phone',
    'your-solution/web-camera': 'Web Camera',
    'your-solution/machine-vision': 'Machine Vision',
    'your-solution/medical-endoscopy': 'Medical & Endoscopy',
    'your-solution/scanners-archiving': 'Scanners & Archiving',
    'your-solution/photography': 'Photo & Video',
  };
  
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
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

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

  // Multilingual Rainbow - Languages Definition
  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  ];

  const DESIGN_ICON_OPTIONS = [
    { key: 'car', label: 'Automotive', Icon: Car },
    { key: 'shield', label: 'Security', Icon: Shield },
    { key: 'smartphone', label: 'Mobile / VCX', Icon: Smartphone },
    { key: 'camera', label: 'Camera / Image Quality', Icon: Camera },
    { key: 'cog', label: 'Machine Vision', Icon: Cog },
    { key: 'stethoscope', label: 'Medical', Icon: Stethoscope },
    { key: 'scanline', label: 'Scanners', Icon: ScanLine },
    { key: 'monitor', label: 'Display / Monitor', Icon: Monitor },
    { key: 'zap', label: 'Technology', Icon: Zap },
    { key: 'target', label: 'Products (Siemens star)', Icon: Target },
    { key: 'file', label: 'Generic Page', Icon: FileText },
    { key: 'flask', label: 'Test Lab / Overview', Icon: FlaskConical },
    { key: 'check-circle', label: 'Standardized', Icon: CheckCircle },
    { key: 'settings', label: 'Specialized / Custom', Icon: Settings },
  ];

  const CTA_GROUP_OPTIONS = [
    { key: 'none', label: 'No CTA (disabled)' },
    { key: 'your-solution', label: 'Your Solution flyout' },
    { key: 'products', label: 'Products & Test Services flyout' },
  ];

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

  // Persist selected page to sessionStorage for navigation between admin views
  const ADMIN_SELECTED_PAGE_KEY = "admin_selected_page";
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
        navigate(`/${language}/admin-dashboard?page=${encodeURIComponent(pages[0])}`);
      }
      
      setLoading(false);
      return;
    }

    // No valid role found
    toast.error("You don't have admin or editor access");
    navigate("/");
  };

  const handleFlyoutImageSelect = async (url: string) => {
    setFlyoutImageUrl(url || null);

    // If no custom description is set yet, try to load alt text from mapping as a starting point
    const currentEnglishDesc = flyoutDescriptionTranslations['en'] || '';
    if (url && !currentEnglishDesc) {
      try {
        const altText = await loadAltTextFromMapping(url, 'page-images', 'en');
        if (altText) {
          setFlyoutDescriptionTranslations(prev => ({ ...prev, en: altText }));
        }
      } catch (error) {
        console.error('[handleFlyoutImageSelect] Failed to load alt text for flyout image:', error);
      }
    }
  };

  const handleSaveFlyoutInfo = async () => {
    if (!pageInfo) {
      toast.error('No page selected');
      return;
    }

    // Safety net: allow for second-level pages AND third-level pages under test-lab/training-events/info-hub
    const SECOND_LEVEL_PARENTS_SAVE = ['your-solution', 'products', 'downloads', 'events', 'news', 'inside-lab', 'contact', 'test-lab', 'training-events', 'info-hub', 'company'];
    const isSecondLevelSave = pageInfo.parentSlug && SECOND_LEVEL_PARENTS_SAVE.includes(pageInfo.parentSlug);
    const isThirdLevelUnderTestLabSave = pageInfo.parentSlug && pageInfo.parentSlug.startsWith('test-lab') && pageInfo.parentSlug !== 'test-lab';
    const isThirdLevelUnderTrainingEventsSave = pageInfo.parentSlug && pageInfo.parentSlug.startsWith('training-events') && pageInfo.parentSlug !== 'training-events';
    const isThirdLevelUnderInfoHubSave = pageInfo.parentSlug && pageInfo.parentSlug.startsWith('info-hub') && pageInfo.parentSlug !== 'info-hub';
    const isThirdLevelUnderCompanySave = pageInfo.parentSlug && pageInfo.parentSlug.startsWith('company') && pageInfo.parentSlug !== 'company';
    
    if (!isSecondLevelSave && !isThirdLevelUnderTestLabSave && !isThirdLevelUnderTrainingEventsSave && !isThirdLevelUnderInfoHubSave && !isThirdLevelUnderCompanySave) {
      toast.error('Flyout content is only available for second and third-level navigation pages.');
      return;
    }

    setIsSavingFlyout(true);

    try {
      const englishDesc = flyoutDescriptionTranslations['en'] || '';
      const { error } = await supabase
        .from('page_registry')
        .update({
          flyout_image_url: flyoutImageUrl,
          flyout_description: englishDesc || null,
          flyout_description_translations: flyoutDescriptionTranslations,
        })
        .eq('page_id', pageInfo.pageId);

      if (error) {
        console.error('[handleSaveFlyoutInfo] Error updating flyout content:', error);
        toast.error('Failed to save flyout content');
        return;
      }

      setPageInfo(prev => prev ? { ...prev, flyoutImageUrl, flyoutDescription: englishDesc } : prev);
      toast.success('Flyout content saved');
      setIsFlyoutDialogOpen(false);
    } catch (error) {
      console.error('[handleSaveFlyoutInfo] Unexpected error:', error);
      toast.error('Failed to save flyout content');
    } finally {
      setIsSavingFlyout(false);
    }
  };

  const handleClearFlyoutInfo = async () => {
    if (!pageInfo) return;

    setIsSavingFlyout(true);

    try {
      const { error } = await supabase
        .from('page_registry')
        .update({
          flyout_image_url: null,
          flyout_description: null,
          flyout_description_translations: {},
        })
        .eq('page_id', pageInfo.pageId);

      if (error) {
        console.error('[handleClearFlyoutInfo] Error clearing flyout content:', error);
        toast.error('Failed to clear flyout content');
        return;
      }

      setFlyoutImageUrl(null);
      setFlyoutDescriptionTranslations({});
      setPageInfo(prev => prev ? { ...prev, flyoutImageUrl: null, flyoutDescription: null } : prev);
      toast.success('Flyout content removed');
    } catch (error) {
      console.error('[handleClearFlyoutInfo] Unexpected error:', error);
      toast.error('Failed to clear flyout content');
    } finally {
      setIsSavingFlyout(false);
    }
  };
  // Helper function to resolve non-hierarchical slug to full hierarchical slug
  const resolvePageSlug = async (slug: string): Promise<string> => {
    if (!slug) return slug;
    
    // First try exact match
    const { data: exactMatch } = await supabase
      .from('page_registry')
      .select('page_slug')
      .eq('page_slug', slug)
      .maybeSingle();
    
    if (exactMatch) {
      console.log(`🔍 Exact match for slug "${slug}"`);
      setResolvedPageSlug(exactMatch.page_slug);
      return exactMatch.page_slug;
    }
    
    // If no exact match, try to find hierarchical slug ending with this slug
    // Use .limit(1) instead of .maybeSingle() to avoid errors when multiple pages match
    const { data: hierarchicalMatches } = await supabase
      .from('page_registry')
      .select('page_slug')
      .ilike('page_slug', `%/${slug}`)
      .limit(1);
    
    const hierarchicalMatch = hierarchicalMatches?.[0] || null;
    
    if (hierarchicalMatch) {
      console.log(`🔍 Resolved slug "${slug}" to "${hierarchicalMatch.page_slug}"`);
      setResolvedPageSlug(hierarchicalMatch.page_slug);
      return hierarchicalMatch.page_slug;
    }
    
    console.log(`⚠️ No match found for slug "${slug}"`);
    setResolvedPageSlug(slug);
    return slug;
  };

  // Load page info (Page ID, Title, Slug) from page_registry
  const loadPageInfo = async () => {
    try {
      let querySlug = await resolvePageSlug(selectedPage);
      console.log('[loadPageInfo] Querying for slug:', querySlug, 'original:', selectedPage);
      
      // First try exact match
      let { data, error } = await supabase
        .from("page_registry")
        .select("page_id, page_title, page_slug, parent_slug, design_icon, flyout_image_url, flyout_description, cta_group, cta_label, cta_icon, target_page_slug")
        .eq("page_slug", querySlug)
        .maybeSingle();
      
      // If no results and querySlug doesn't contain '/', try hierarchical search
      if (!data && !querySlug.includes('/')) {
        console.log('[loadPageInfo] No exact match, trying hierarchical search for:', querySlug);
        const { data: hierarchicalData, error: hierarchicalError } = await supabase
          .from("page_registry")
          .select("page_id, page_title, page_slug, parent_slug, design_icon, flyout_image_url, flyout_description, cta_group, cta_label, cta_icon, target_page_slug")
          .ilike("page_slug", `%/${querySlug}`)
          .limit(1);
        
        if (!hierarchicalError && hierarchicalData && hierarchicalData.length > 0) {
          data = hierarchicalData[0];
          console.log('[loadPageInfo] Found hierarchical match:', hierarchicalData[0].page_slug);
          setResolvedPageSlug(hierarchicalData[0].page_slug);
        }
      }
      
      if (error) {
        console.error('[loadPageInfo] Error loading page info:', error);
        setPageInfo(null);
        return;
      }
      
      if (data) {
        setPageInfo({
          pageId: data.page_id,
          pageTitle: data.page_title,
          pageSlug: data.page_slug,
          parentSlug: (data as any).parent_slug ?? null,
          designIcon: (data as any).design_icon ?? null,
          flyoutImageUrl: (data as any).flyout_image_url ?? null,
          flyoutDescription: (data as any).flyout_description ?? null,
          ctaGroup: (data as any).cta_group ?? null,
          ctaLabel: (data as any).cta_label ?? null,
          ctaIcon: (data as any).cta_icon ?? null,
          targetPageSlug: (data as any).target_page_slug ?? null,
        });
      } else {
        setPageInfo(null);
      }
    } catch (error) {
      console.error('[loadPageInfo] Unexpected error:', error);
      setPageInfo(null);
    }
  };

  // Sync flyout & CTA editor state when pageInfo changes
  useEffect(() => {
    const loadFlyoutTranslations = async () => {
      if (pageInfo) {
        setFlyoutImageUrl(pageInfo.flyoutImageUrl ?? null);
        setCtaGroup(pageInfo.ctaGroup ?? 'none');
        setCtaLabel(pageInfo.ctaLabel ?? '');
        setCtaIcon(pageInfo.ctaIcon ?? 'auto');
        
        // Load flyout description translations from database
        if (pageInfo.pageSlug) {
          const { data } = await supabase
            .from('page_registry')
            .select('flyout_description_translations')
            .eq('page_slug', pageInfo.pageSlug)
            .maybeSingle();
          
          if (data?.flyout_description_translations && typeof data.flyout_description_translations === 'object') {
            setFlyoutDescriptionTranslations(data.flyout_description_translations as Record<string, string>);
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
    
    loadFlyoutTranslations();
  }, [pageInfo]);

  const handleSaveDesignElement = async () => {
    console.log('[handleSaveDesignElement] pageInfo:', pageInfo);
    console.log('[handleSaveDesignElement] pendingDesignIcon:', pendingDesignIcon);
    console.log('[handleSaveDesignElement] parentSlug:', pageInfo?.parentSlug);
    
    if (!pageInfo || !pendingDesignIcon) {
      toast.error("Please select a design element");
      return;
    }

    const SECOND_LEVEL_PARENTS_SAVE = ['your-solution', 'products', 'downloads', 'events', 'news', 'inside-lab', 'contact', 'test-lab', 'training-events', 'info-hub', 'company'];
    const isSecondLevel = SECOND_LEVEL_PARENTS_SAVE.includes(pageInfo.parentSlug || '');
    const isThirdLevelUnderTestLabSave = pageInfo.parentSlug?.startsWith('test-lab') && pageInfo.parentSlug !== 'test-lab';
    const isThirdLevelUnderTrainingEventsSave = pageInfo.parentSlug?.startsWith('training-events') && pageInfo.parentSlug !== 'training-events';
    const isThirdLevelUnderInfoHubSave = pageInfo.parentSlug?.startsWith('info-hub') && pageInfo.parentSlug !== 'info-hub';
    const isThirdLevelUnderCompanySave = pageInfo.parentSlug?.startsWith('company') && pageInfo.parentSlug !== 'company';
    
    console.log('[handleSaveDesignElement] isSecondLevel:', isSecondLevel);
    console.log('[handleSaveDesignElement] isThirdLevelUnderTestLabSave:', isThirdLevelUnderTestLabSave);
    console.log('[handleSaveDesignElement] isThirdLevelUnderTrainingEventsSave:', isThirdLevelUnderTrainingEventsSave);
    console.log('[handleSaveDesignElement] isThirdLevelUnderInfoHubSave:', isThirdLevelUnderInfoHubSave);
    console.log('[handleSaveDesignElement] isThirdLevelUnderCompanySave:', isThirdLevelUnderCompanySave);
    
    if (!pageInfo.parentSlug || (!isSecondLevel && !isThirdLevelUnderTestLabSave && !isThirdLevelUnderTrainingEventsSave && !isThirdLevelUnderInfoHubSave && !isThirdLevelUnderCompanySave)) {
      console.log('[handleSaveDesignElement] BLOCKED - parentSlug validation failed');
      toast.error("Design elements are only allowed for second and third-level navigation pages.");
      return;
    }

    try {
      const { error } = await supabase
        .from("page_registry")
        .update({ design_icon: pendingDesignIcon })
        .eq("page_id", pageInfo.pageId);

      if (error) {
        console.error("[handleSaveDesignElement] Error updating design_icon:", error);
        toast.error("Failed to save design element");
        return;
      }

      setPageInfo(prev => prev ? { ...prev, designIcon: pendingDesignIcon } : prev);
      toast.success("Design element saved");
      setIsDesignElementDialogOpen(false);
    } catch (error) {
      console.error("[handleSaveDesignElement] Unexpected error:", error);
      toast.error("Failed to save design element");
    }
  };

  const handleRemoveDesignElement = async () => {
    if (!pageInfo) return;

    try {
      const { error } = await supabase
        .from("page_registry")
        .update({ design_icon: null })
        .eq("page_id", pageInfo.pageId);

      if (error) {
        console.error("[handleRemoveDesignElement] Error clearing design_icon:", error);
        toast.error("Failed to remove design element");
        return;
      }

      setPageInfo(prev => prev ? { ...prev, designIcon: null } : prev);
      setPendingDesignIcon(null);
      toast.success("Design element removed");
      setIsDesignElementDialogOpen(false);
    } catch (error) {
      console.error("[handleRemoveDesignElement] Unexpected error:", error);
      toast.error("Failed to remove design element");
    }
  };

  const handleSaveCtaConfig = async () => {
    if (!pageInfo) return;

    try {
      setIsSavingCta(true);

      // If a group (your-solution/products) is selected, first clear that group from other pages
      if (ctaGroup !== 'none') {
        const { error: clearError } = await supabase
          .from('page_registry')
          .update({ cta_group: null, cta_label: null, cta_icon: null })
          .eq('cta_group', ctaGroup)
          .neq('page_id', pageInfo.pageId);

        if (clearError) {
          console.warn('[handleSaveCtaConfig] Warning clearing existing CTA group:', clearError);
        }
      }

      let updates: any = {};

      if (ctaGroup === 'none') {
        updates = { cta_group: null, cta_label: null, cta_icon: null };
      } else {
        // Determine icon based on explicit selection or automatic default by group
        let iconKey: string | null;
        if (ctaIcon === 'auto') {
          iconKey = ctaGroup === 'your-solution'
            ? 'search'
            : ctaGroup === 'products'
              ? 'microscope'
              : null;
        } else if (ctaIcon === 'none') {
          iconKey = null;
        } else {
          iconKey = ctaIcon;
        }

        const finalLabel = ctaLabel && ctaLabel.trim().length > 0 ? ctaLabel.trim() : pageInfo.pageTitle;

        updates = {
          cta_group: ctaGroup,
          cta_label: finalLabel,
          cta_icon: iconKey,
        };
      }

      const { error } = await supabase
        .from('page_registry')
        .update(updates)
        .eq('page_id', pageInfo.pageId);

      if (error) {
        console.error('[handleSaveCtaConfig] Error updating CTA config:', error);
        toast.error('Failed to save navigation CTA');
        return;
      }

      setPageInfo(prev => prev ? {
        ...prev,
        ctaGroup: ctaGroup === 'none' ? null : ctaGroup,
        ctaLabel: ctaGroup === 'none' ? null : (updates.cta_label as string),
        ctaIcon: ctaGroup === 'none' ? null : (updates.cta_icon as string | null),
      } : prev);

      toast.success('Navigation CTA saved');
      setIsCtaDialogOpen(false);
    } catch (error) {
      console.error('[handleSaveCtaConfig] Unexpected error:', error);
      toast.error('Failed to save navigation CTA');
    } finally {
      setIsSavingCta(false);
    }
  };
  // IMPORTANT: Only load non-deleted segments (deleted=false or deleted IS NULL)
  // to prevent showing deleted segments, but keep their IDs in registry forever
  const loadSegmentRegistry = async () => {
    try {
      const querySlug = await resolvePageSlug(selectedPage);
      console.log('[loadSegmentRegistry] Querying for slug:', querySlug, 'original selectedPage:', selectedPage);
      
      // First try exact match
      let { data, error } = await supabase
        .from("segment_registry")
        .select("*")
        .eq("page_slug", querySlug)
        .or("deleted.is.null,deleted.eq.false");

      // If no results and querySlug doesn't contain '/', try finding by hierarchical pattern
      if ((!data || data.length === 0) && !querySlug.includes('/')) {
        console.log('[loadSegmentRegistry] No exact match, trying hierarchical search for:', querySlug);
        const { data: hierarchicalData, error: hierarchicalError } = await supabase
          .from("segment_registry")
          .select("*")
          .ilike("page_slug", `%/${querySlug}`)
          .or("deleted.is.null,deleted.eq.false");
        
        if (!hierarchicalError && hierarchicalData && hierarchicalData.length > 0) {
          data = hierarchicalData;
          console.log('[loadSegmentRegistry] Found hierarchical match:', hierarchicalData[0]?.page_slug);
        }
      }

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
        
        // Also register footer-* keys under 'footer' for backward compatibility
        if (item.segment_key.startsWith('footer-') && item.segment_type === 'footer') {
          registry['footer'] = item.segment_id;
        }
      });

      setSegmentRegistry(registry);
      // Store reverse registry in a separate state or use it directly below
      (window as any).__segmentKeyRegistry = reverseRegistry;
      console.log("✅ Loaded segment registry for", querySlug, ":", registry, "Reverse:", reverseRegistry);
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

    // For Sicherheit: Nur Admins dürfen neue CMS-Seiten anlegen (RLS erzwingt das ohnehin)
    if (!isAdmin) {
      toast.error("Only admins can create new CMS pages.");
      return;
    }

    setIsCreatingCMS(true);
    toast("Step 1: Start CMS page creation");
    
    try {
      // 1. Ensure page exists in page_registry; create entry if missing
      let { data: pageInfo } = await supabase
        .from("page_registry")
        .select("page_id, page_title, page_slug, parent_id, parent_slug")
        .or(`page_slug.eq.${selectedPageForCMS},page_slug.ilike.%/${selectedPageForCMS}`)
        .maybeSingle();

    if (!pageInfo) {
      toast("Step 2: Page not in registry, creating entry");
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

            if (parentPage?.parent_slug && parentPage.parent_slug !== 'index') {
              // Build full hierarchy, e.g. your-solution/automotive/geometric-calibration-automotive
              // Skip 'index' as it's not part of URL structure
              hierarchicalSlug = `${parentPage.parent_slug}/${parent_slug}/${selectedPageForCMS}`;
            } else {
              // Simple parent/child, e.g. products/test-charts OR your-solution/automotive
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

      // 5. If current user is an editor, automatically grant access to this new page
      if (isEditor && !isAdmin && user) {
        const { error: accessError } = await supabase
          .from("editor_page_access")
          .insert({
            user_id: user.id,
            page_slug: finalSlug,
          });

        if (accessError) {
          console.error("Error granting editor access to new page:", accessError);
        } else {
          // Update allowedPages state immediately so editor can access the new page
          setAllowedPages(prev => [...prev, finalSlug]);
        }
      }

      // 6. Build hierarchical URL from page_slug (which is now already hierarchical)
      const hierarchicalUrl = `/${pageInfo.page_slug}`;

      // Show success
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
      
      // Trigger refresh of page selector dropdown
      window.dispatchEvent(new Event('refreshPageSelector'));
      
      // Use full hierarchical slug for navigation (URL encoded)
      // Navigate using React Router (no full page reload)
      navigate(`/${language}/admin-dashboard?page=${encodeURIComponent(pageInfo.page_slug)}`);
      
    } catch (error: any) {
      console.error("Error creating CMS page:", error);
      toast.error(`Failed to create CMS page: ${error.message}`);
    } finally {
      setIsCreatingCMS(false);
    }
  };

  // New simplified slug-based CMS page creation
  const createNewCMSPageWithSlug = async (slug: string, languages: string[]) => {
    if (!slug || !user) {
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
        // Skip 'index' as parent_slug - it's the root and should not be part of the hierarchy
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

      // Automatically create navigation_links entries so the new page
      // appears in the Your Solution flyout (industries column)
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
          .insert({ user_id: user.id, page_slug: slug });
        setAllowedPages(prev => [...prev, slug]);
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
  };

  const loadContent = async () => {
    let querySlug = await resolvePageSlug(selectedPage);
    
    console.log('[AdminDashboard] Loading content for page:', querySlug, 'original:', selectedPage, 'language:', editorLanguage);
    
    // First try with resolved slug
    let { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", querySlug)
      .eq("language", editorLanguage);

    // If no results and querySlug doesn't contain '/', try hierarchical search
    if ((!data || data.length === 0) && !querySlug.includes('/')) {
      console.log('[loadContent] No exact match, trying hierarchical search for:', querySlug);
      const { data: hierarchicalData, error: hierarchicalError } = await supabase
        .from("page_content")
        .select("*")
        .ilike("page_slug", `%/${querySlug}`)
        .eq("language", editorLanguage);
      
      if (!hierarchicalError && hierarchicalData && hierarchicalData.length > 0) {
        data = hierarchicalData;
        // Update resolved slug for future operations
        const foundSlug = hierarchicalData[0]?.page_slug;
        if (foundSlug) {
          console.log('[loadContent] Found hierarchical match:', foundSlug);
          setResolvedPageSlug(foundSlug);
          querySlug = foundSlug;
        }
      }
    }

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
                page_slug: resolvedPageSlug || selectedPage,
                section_key: "page_segments",
                content_type: "json",
                content_value: JSON.stringify(segmentsWithIds),
                updated_at: new Date().toISOString(),
                updated_by: user.id
              }, {
                onConflict: 'page_slug,section_key,language'
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
          
          // IMPORTANT: Only filter if registry is populated - otherwise keep all segments
          // This prevents the bug where segments disappear when registry isn't loaded yet
          let validOrder = order || [];
          
          if (validSegmentIds.length > 0) {
            // Filter out deleted segments - tabId is a segment_id string like "197"
            validOrder = (order || []).filter((tabId: string) => {
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
                  page_slug: resolvedPageSlug || selectedPage,
                  section_key: "tab_order",
                  content_type: "json",
                  content_value: JSON.stringify(validOrder),
                  updated_at: new Date().toISOString(),
                  updated_by: user.id
                }, {
                  onConflict: 'page_slug,section_key,language'
                });
            }
          }
          
          setTabOrder(validOrder.length > 0 ? validOrder : []);
          
          // Set activeTab: First check sessionStorage for saved tab, otherwise use first available
          if (validOrder.length > 0) {
            const pageKey = selectedPage || 'index';
            const savedTab = sessionStorage.getItem(`admin-activeTab-${pageKey}`);
            console.log("[AdminDashboard] loadContent - pageKey:", pageKey, "savedTab:", savedTab, "validOrder:", validOrder);
            
            // Check if savedTab is valid: either in validOrder OR is "footer" (special static tab)
            const isValidSavedTab = savedTab && (validOrder.includes(savedTab) || savedTab === "footer");
            
            if (isValidSavedTab) {
              console.log("[AdminDashboard] loadContent - Using saved tab:", savedTab);
              setActiveTabState(savedTab);
            } else {
              console.log("[AdminDashboard] loadContent - No valid saved tab, using first:", validOrder[0]);
              setActiveTabState(validOrder[0]);
              // Also save this as the default
              sessionStorage.setItem(`admin-activeTab-${pageKey}`, validOrder[0]);
            }
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
             page_slug: resolvedPageSlug || selectedPage,
             section_key: "tab_order",
             content_type: "json",
             content_value: JSON.stringify(rebuiltTabOrder),
             updated_at: new Date().toISOString(),
             updated_by: user.id
           }, {
             onConflict: 'page_slug,section_key,language'
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

    setHeroUploading(true);
 
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${selectedPage}-hero-${Date.now()}.${fileExt}`;
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
       const baseMetadata = await extractImageMetadata(file, publicUrl);
       const metadata: ImageMetadata = { ...baseMetadata, altText: '' };
       
       setHeroImageUrl(publicUrl);
       setHeroImageMetadata(metadata);
       
       // Auto-sync to all languages
       const allLanguages: Array<'en' | 'de' | 'ja' | 'ko' | 'zh'> = ['en', 'de', 'ja', 'ko', 'zh'];
       
       for (const lang of allLanguages) {
         // Save URL to database for each language
         const { error: dbError } = await supabase
           .from("page_content")
           .upsert({
             page_slug: resolvedPageSlug || selectedPage,
             section_key: "hero_image_url",
             content_type: "image_url",
             content_value: publicUrl,
             language: lang,
             updated_at: new Date().toISOString(),
             updated_by: user?.id
           }, {
             onConflict: 'page_slug,section_key,language'
           });
   
         if (dbError) throw dbError;
   
         // Save metadata to database for each language
         const { error: metadataError } = await supabase
           .from("page_content")
           .upsert({
             page_slug: resolvedPageSlug || selectedPage,
             section_key: "hero_image_metadata",
             content_type: "json",
             content_value: JSON.stringify(metadata),
             language: lang,
             updated_at: new Date().toISOString(),
             updated_by: user?.id
           }, {
             onConflict: 'page_slug,section_key,language'
           });
  
         if (metadataError) throw metadataError;
       }
 
       toast.success("Image uploaded and synced to all languages!");
     } catch (error: any) {
       toast.error("Error uploading image: " + error.message);
     } finally {
       setHeroUploading(false);
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

      // Auto-save after successful upload
      await autoSaveTileImageUpload(newApps);

      toast.success("Image uploaded and saved successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
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
        const segmentsWithPositions = updatedSegments.map((seg, idx) => ({
          ...seg,
          position: idx
        }));
        
        const { error } = await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
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

      // Auto-save after upload
      await autoSaveImageTextSegment(newSegments);

      toast.success("Hero image uploaded and saved successfully!");
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

      // Auto-save after upload
      await autoSaveImageTextSegment(newSegments);

      toast.success("Item image uploaded and saved successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const autoSaveImageTextSegment = async (updatedSegments: any[]) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) {
        console.error("Auto-save error:", error);
      } else {
        console.log("✅ Image & Text segment auto-saved to database");
      }
    } catch (error: any) {
      console.error("Auto-save error:", error);
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
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "footer_team_image_url",
          content_type: "image_url",
          content_value: publicUrl,
          language: editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key,language'
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
      case 'banner-p':
        return {
          title: 'New Banner-P Section',
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
      case 'debug':
        return {
          title: 'Debug Segment',
          imageUrl: ''
        };
      case 'news-list':
        return {
          title: 'All News',
          description: 'Stay updated with the latest developments in image quality testing and measurement technology'
        };
      case 'action-hero':
        return {
          title: 'Page Title',
          description: 'Enter a brief description of the page content here.',
          backgroundImage: '',
          flipImage: false
        };
      default:
        return {};
    }
  };

  // Helper function to extract language-independent fields from segment data
  const getLanguageIndependentFields = (templateType: string, data: any) => {
    // These fields should be copied from English to all other languages
    const baseFields: any = {};
    
    switch (templateType) {
      case 'hero':
        return {
          hero_image_url: data.hero_image_url || '',
          hero_image_metadata: data.hero_image_metadata || null,
          hero_cta_link: data.hero_cta_link || '#',
          hero_cta_style: data.hero_cta_style || 'standard',
          hero_image_position: data.hero_image_position || 'right',
          hero_layout_ratio: data.hero_layout_ratio || '2-5',
          hero_top_spacing: data.hero_top_spacing || 'medium',
          // Text fields empty
          hero_title: '',
          hero_subtitle: '',
          hero_description: '',
          hero_cta_text: ''
        };
      
      case 'product-hero-gallery':
        return {
          imagePosition: data.imagePosition || 'right',
          layoutRatio: data.layoutRatio || '1-1',
          topSpacing: data.topSpacing || 'medium',
          cta1Link: data.cta1Link || '#contact',
          cta1Style: data.cta1Style || 'standard',
          cta2Link: data.cta2Link || '',
          cta2Style: data.cta2Style || 'outline-white',
          images: data.images || [],
          // Text fields empty
          title: '',
          subtitle: '',
          description: '',
          cta1Text: '',
          cta2Text: ''
        };
      
      case 'tiles':
        return {
          columns: data.columns || '3',
          items: (data.items || []).map((item: any) => ({
            imageUrl: item.imageUrl || '',
            icon: item.icon || '',
            ctaLink: item.ctaLink || '',
            ctaStyle: item.ctaStyle || 'standard',
            // Text fields empty
            title: '',
            description: '',
            ctaText: ''
          })),
          // Text fields empty
          title: '',
          description: ''
        };
      
      case 'banner':
        return {
          images: data.images || [],
          buttonLink: data.buttonLink || '',
          buttonStyle: data.buttonStyle || 'standard',
          // Text fields empty
          title: '',
          subtext: '',
          buttonText: ''
        };
      
      case 'banner-p':
        return {
          images: data.images || [],
          buttonLink: data.buttonLink || '',
          buttonStyle: data.buttonStyle || 'standard',
          // Text fields empty
          title: '',
          subtext: '',
          buttonText: ''
        };
      
      case 'image-text':
        return {
          layout: data.layout || '2-col',
          items: (data.items || []).map((item: any) => ({
            imageUrl: item.imageUrl || '',
            // Text fields empty
            title: '',
            description: ''
          })),
          // Text fields empty
          title: '',
          subtext: ''
        };
      
      case 'feature-overview':
        return {
          layout: data.layout || '3',
          items: (data.items || []).map((item: any) => ({
            icon: item.icon || '',
            // Text fields empty
            title: '',
            description: ''
          })),
          // Text fields empty
          title: '',
          subtext: ''
        };
      
      case 'meta-navigation':
        return {
          links: (data.links || []).map((link: any) => ({
            anchor: link.anchor || '',
            // Text fields empty
            label: ''
          }))
        };
      
      case 'full-hero':
        return {
          backgroundImage: data.backgroundImage || '',
          ctaLink: data.ctaLink || '#',
          ctaStyle: data.ctaStyle || 'standard',
          // Text fields empty
          title: '',
          subtitle: '',
          description: '',
          ctaText: ''
        };
      
      case 'video':
        return {
          videoUrl: data.videoUrl || '',
          thumbnailUrl: data.thumbnailUrl || '',
          // Text fields empty
          title: '',
          description: ''
        };
      
      case 'table':
      case 'faq':
      case 'specification':
      case 'intro':
      case 'industries':
      case 'news':
      case 'debug':
      case 'action-hero':
        // These segment types are mostly text-based, so return empty structure
        return {};
      
      default:
        return {};
    }
  };

  const handleAddSegment = async (templateType: string) => {
    if (!user) return;

    // Check for mutual exclusivity between Full Hero, Action Hero, Meta Navigation, and Product Hero Gallery
    const hasFullHero = pageSegments.some(seg => seg.type === 'full-hero');
    const hasMetaNav = pageSegments.some(seg => seg.type === 'meta-navigation');
    const hasActionHero = pageSegments.some(seg => seg.type === 'action-hero');
    const hasProductHeroGallery = pageSegments.some(seg => seg.type === 'product-hero-gallery');

    // Full Hero exclusions
    if (templateType === 'full-hero' && hasMetaNav) {
      toast.error("Full Hero cannot be added when Meta Navigation is present. Please remove Meta Navigation first.");
      return;
    }
    if (templateType === 'full-hero' && hasActionHero) {
      toast.error("Full Hero cannot be added when Action Hero is present. Please remove Action Hero first.");
      return;
    }

    // Meta Navigation exclusions
    if (templateType === 'meta-navigation' && hasFullHero) {
      toast.error("Meta Navigation cannot be added when Full Hero is present. Please remove Full Hero first.");
      return;
    }
    if (templateType === 'meta-navigation' && hasActionHero) {
      toast.error("Meta Navigation cannot be added when Action Hero is present. Please remove Action Hero first.");
      return;
    }

    // Action Hero exclusions (excludes: Full Hero, Meta Navigation, Product Hero Gallery)
    if (templateType === 'action-hero' && hasFullHero) {
      toast.error("Action Hero cannot be added when Full Hero is present. Please remove Full Hero first.");
      return;
    }
    if (templateType === 'action-hero' && hasMetaNav) {
      toast.error("Action Hero cannot be added when Meta Navigation is present. Please remove Meta Navigation first.");
      return;
    }
    if (templateType === 'action-hero' && hasProductHeroGallery) {
      toast.error("Action Hero cannot be added when Product Hero Gallery is present. Please remove Product Hero Gallery first.");
      return;
    }

    // Product Hero Gallery exclusions
    if (templateType === 'product-hero-gallery' && hasActionHero) {
      toast.error("Product Hero Gallery cannot be added when Action Hero is present. Please remove Action Hero first.");
      return;
    }

    // Generate a unique numeric ID for this segment (globally unique across all pages)
    // CRITICAL: Always fetch the latest max ID from database to avoid race conditions
    const { data: maxIdData, error: maxIdError } = await supabase
      .from("segment_registry")
      .select("segment_id")
      .order("segment_id", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (maxIdError) {
      console.error("Error fetching max segment ID:", maxIdError);
      toast.error("Failed to generate segment ID. Please try again.");
      return;
    }
    
    const segmentId = (maxIdData?.segment_id || 0) + 1;
    console.log("Creating new segment with global ID:", segmentId, "(fetched live from DB)");
    setNextSegmentId(segmentId + 1); // Update state for UI consistency
    
    const defaultData = getDefaultSegmentData(templateType);
    const newSegment = {
      id: String(segmentId),
      type: templateType,
      data: defaultData
    };

    // Add new segment to tab order
    // Meta-navigation is at start, full-hero/action-hero after meta-nav, other segments at end
    let updatedTabOrder: string[];
    if (templateType === 'meta-navigation') {
      // Meta-navigation always goes at the very start
      updatedTabOrder = [String(segmentId), ...tabOrder];
    } else if (templateType === 'full-hero' || templateType === 'action-hero') {
      // Full-hero and action-hero go at start (after meta-nav if present)
      const metaNavIndex = tabOrder.findIndex(id => {
        const seg = pageSegments.find(s => String(s.id) === id);
        return seg?.type === 'meta-navigation';
      });
      if (metaNavIndex >= 0) {
        updatedTabOrder = [...tabOrder.slice(0, metaNavIndex + 1), String(segmentId), ...tabOrder.slice(metaNavIndex + 1)];
      } else {
        updatedTabOrder = [String(segmentId), ...tabOrder];
      }
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
          page_slug: resolvedPageSlug || selectedPage,
          segment_type: templateType,
          segment_key: String(segmentId),
          is_static: false,
          deleted: false
        });

      if (registryError) {
        console.error("Error registering segment in registry:", registryError);
        throw registryError;
      }

      // Create segment for all languages
      const allLanguages: Array<'en' | 'de' | 'ja' | 'ko' | 'zh'> = ['en', 'de', 'ja', 'ko', 'zh'];
      
      for (const lang of allLanguages) {
        // Load existing segments for this language
        const { data: existingContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", resolvedPageSlug || selectedPage)
          .eq("section_key", "page_segments")
          .eq("language", lang)
          .single();

        const existingSegments = existingContent?.content_value 
          ? JSON.parse(existingContent.content_value) 
          : [];

        // For English: use full default data
        // For other languages: use language-independent fields from English, leave text fields empty
        const segmentData = lang === 'en' 
          ? defaultData 
          : getLanguageIndependentFields(templateType, defaultData);

        const languageSegment = {
          id: String(segmentId),
          type: templateType,
          data: segmentData
        };

        const updatedSegments = [...existingSegments, languageSegment];
        
        // Save segments for this language
        const { error: segmentsError } = await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "page_segments",
            content_type: "json",
            content_value: JSON.stringify(updatedSegments),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key,language'
          });

        if (segmentsError) throw segmentsError;

        // Save tab order for this language
        const { error: orderError } = await supabase
          .from("page_content")
          .upsert({
            page_slug: resolvedPageSlug || selectedPage,
            section_key: "tab_order",
            content_type: "json",
            content_value: JSON.stringify(updatedTabOrder),
            language: lang,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key,language'
          });

        if (orderError) throw orderError;
      }

      // Update UI state with current language segment
      const currentLanguageSegments = editorLanguage === 'en' 
        ? [...pageSegments, newSegment]
        : [...pageSegments, { ...newSegment, data: getLanguageIndependentFields(templateType, defaultData) }];

      setPageSegments(currentLanguageSegments);
      setTabOrder(updatedTabOrder);
      setIsTemplateDialogOpen(false);
      
      // Switch to the newly added segment tab
      setActiveTab(String(segmentId));
      
      toast.success(`New segment added successfully with ID ${segmentId} for all languages!`);
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
        .eq("page_slug", resolvedPageSlug || selectedPage);

      if (registryError) {
        console.error("Error marking segment as deleted in registry:", registryError);
        throw registryError;
      }

      // CRITICAL: Remove segment from ALL language versions, not just current editor language
      const languages = ['en', 'de', 'ja', 'ko', 'zh'];
      
      for (const lang of languages) {
        // Load page_segments for this language
        const { data: langContent } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", resolvedPageSlug || selectedPage)
          .eq("section_key", "page_segments")
          .eq("language", lang)
          .maybeSingle();

        if (langContent?.content_value) {
          const langSegments = JSON.parse(langContent.content_value);
          const cleanedSegments = langSegments.filter((seg: any) => seg.id !== segmentId);

          // Update page_segments for this language
          const { error: segmentsError } = await supabase
            .from("page_content")
            .upsert({
              page_slug: resolvedPageSlug || selectedPage,
              section_key: "page_segments",
              content_type: "json",
              content_value: JSON.stringify(cleanedSegments),
              language: lang,
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key,language'
            });

          if (segmentsError) throw segmentsError;
        }

        // Update tab_order for this language (remove deleted segment)
        const { data: langTabOrder } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", resolvedPageSlug || selectedPage)
          .eq("section_key", "tab_order")
          .eq("language", lang)
          .maybeSingle();

        if (langTabOrder?.content_value) {
          const langOrder = JSON.parse(langTabOrder.content_value);
          const cleanedOrder = langOrder.filter((id: string) => id !== segmentId);

          const { error: orderError } = await supabase
            .from("page_content")
            .upsert({
              page_slug: resolvedPageSlug || selectedPage,
              section_key: "tab_order",
              content_type: "json",
              content_value: JSON.stringify(cleanedOrder),
              language: lang,
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key,language'
            });

          if (orderError) throw orderError;
        }
      }

      setPageSegments(updatedSegments);
      setTabOrder(updatedTabOrder);
      
      // Switch to first available tab
      const firstTab = updatedTabOrder[0] || 'tiles';
      setActiveTab(firstTab);
      
      toast.success("Segment deleted from all languages! (ID will never be reused)");
    } catch (error: any) {
      toast.error("Error deleting segment: " + error.message);
    }
  };

  const handleSaveSegments = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // CRITICAL SAFETY CHECK: Fetch current segments from database before saving
      // This prevents accidental data loss from stale state
      const currentPageSlug = resolvedPageSlug || selectedPage;
      
      const { data: existingData } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", currentPageSlug)
        .eq("section_key", "page_segments")
        .eq("language", editorLanguage)
        .single();
      
      let existingSegments: any[] = [];
      if (existingData?.content_value) {
        try {
          existingSegments = JSON.parse(existingData.content_value);
        } catch (e) {
          console.warn('[SAVE GUARD] Could not parse existing segments');
        }
      }
      
      // SAFETY: If we're about to save significantly fewer segments than exist, warn and abort
      // This prevents accidental mass deletion
      if (existingSegments.length > 1 && pageSegments.length < existingSegments.length - 1) {
        const confirmed = window.confirm(
          `WARNUNG: Sie sind dabei, ${existingSegments.length - pageSegments.length} Segmente zu löschen. ` +
          `Aktuell: ${existingSegments.length} Segmente, Neu: ${pageSegments.length} Segmente. ` +
          `Fortfahren?`
        );
        if (!confirmed) {
          setSaving(false);
          toast.info("Speichern abgebrochen - Segmente wurden nicht geändert");
          return;
        }
      }
      
      // CRITICAL: Ensure all segments have correct positions based on current order
      const segmentsWithPositions = pageSegments.map((seg, idx) => ({
        ...seg,
        position: idx
      }));
      
      console.log('[POSITION DEBUG] Saving segments with positions:', JSON.stringify(segmentsWithPositions.map(s => ({ id: s.id, type: s.type, position: s.position }))));
      console.log('[SAVE GUARD] Existing segments:', existingSegments.length, 'New segments:', segmentsWithPositions.length);
      
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: currentPageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segmentsWithPositions),
          language: editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
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
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "seo_settings",
          content_type: "json",
          content_value: JSON.stringify(seoData),
          language: editorLanguage,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
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
              page_slug: resolvedPageSlug || selectedPage,
              section_key: key,
              content_type: "text",
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key,language'
            });

          if (error) throw error;
        }
      }

      // Update applications items using upsert
      const { error: appsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "applications_items",
          content_type: "json",
          content_value: JSON.stringify(applications),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (appsError) throw appsError;

      // Save tiles columns setting
      const { error: columnsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: resolvedPageSlug || selectedPage,
          section_key: "tiles_columns",
          content_type: "text",
          content_value: tilesColumns,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key,language'
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
            page_slug: resolvedPageSlug || selectedPage,
            section_key: key,
            content_type: "text",
            content_value: value,
            language: editorLanguage,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key,language'
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
                <div className="flex items-center gap-3 min-w-0">
                  {selectedPage && pageInfo ? (
                    <>
                      <span className="font-bold text-base text-gray-900 whitespace-nowrap">
                        {pageInfo.pageTitle}
                      </span>
                      <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-sm font-semibold whitespace-nowrap">
                        ID {pageInfo.pageId}
                      </span>
                      <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                      <span className="text-base text-gray-700 font-mono whitespace-nowrap">
                        {pageInfo.pageSlug}
                      </span>
                      {pageInfo.targetPageSlug && (
                        <>
                          <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                          <ShortcutBadge targetSlug={pageInfo.targetPageSlug} />
                        </>
                      )}
                      {pageInfo.ctaGroup && pageInfo.ctaGroup !== 'none' && (
                        <>
                          <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${
                              pageInfo.ctaGroup === 'your-solution'
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
                          <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!hasDesignButtons) {
                                toast.error('Flyout content is only available for navigation pages with design buttons.');
                                return;
                              }
                              setIsFlyoutDialogOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold whitespace-nowrap hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
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
                      <Plus className="h-4 w-4" />
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
                      <Layers className="h-4 w-4" />
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
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 shadow-soft hover:shadow-lg"
                onClick={() => navigate(`/${language}/admin-dashboard/news`)}
              >
                <Newspaper className="h-4 w-4" />
                Manage News
              </Button>
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--events-button))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--events-button))]/90 shadow-soft hover:shadow-lg"
                onClick={() => {/* TODO: implement events management navigation */}}
              >
                <Calendar className="h-4 w-4" />
                Manage Events
              </Button>
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--seo-button))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--seo-button))]/90 shadow-soft hover:shadow-lg"
                onClick={() => setIsSEOEditorOpen(!isSEOEditorOpen)}
              >
                <Eye className="h-4 w-4" />
                SEO Settings
              </Button>
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--accent-violet))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent-violet))]/90 shadow-soft hover:shadow-lg"
                onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
              >
                <Book className="h-4 w-4" />
                Translation Glossary
              </Button>
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
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview">Start / Overview Templates</TabsTrigger>
                    <TabsTrigger value="content">Content Templates</TabsTrigger>
                    <TabsTrigger value="special">Special Templates</TabsTrigger>
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

                      {/* Debug Upload */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('debug')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Upload className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Debug Upload</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Simple image upload test segment
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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

                      {/* Banner-P (Prototype) */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-pink-400 transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('banner-p')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl font-bold text-white">P</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Banner-P (Prototype)</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              NEW: Rebuilt banner with stable multi-image upload
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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

                      {/* FAQ */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('faq')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">FAQ - O</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Frequently Asked Questions with expandable answers
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                    </div>
                  </TabsContent>

                  <TabsContent value="special">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
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

                      {/* News List */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('news-list')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Newspaper className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">News List - P</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Display all news with frontend category filtering
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </div>

                      {/* Action Hero */}
                      <div 
                        className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#f9dc24] transition-all duration-300 bg-white hover:shadow-xl cursor-pointer"
                        onClick={() => handleAddSegment('action-hero')}
                      >
                        <div className="p-6 space-y-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Zap className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Action Hero - Q</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Slim hero with H1 title, description and background image
                            </p>
                          </div>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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
                              {pageInfo.ctaGroup === 'your-solution' ? 'Navigation CTA: Your Solution' : 'Navigation CTA: Products'}
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
            <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
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
                        <span className="ml-3 px-3 py-1 text-sm font-bold bg-[#f9dc24] text-black rounded-full">
                          v0.7
                        </span>
                      </div>
                      <p className="text-xl text-gray-400 mt-1">Content Management System</p>
                    </div>
                  </div>

                  {/* Welcome Text */}
                  <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                    Welcome to your central hub for managing all CMS pages. 
                    Open the CMS Hub to navigate between pages and start editing.
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {/* Feature 1 */}
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#f9dc24] flex items-center justify-center flex-shrink-0">
                        <Layers className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">Modular Segments</h3>
                        <p className="text-gray-400 text-sm">Build pages with drag-and-drop content blocks</p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#f9dc24] flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">Multilingual Content</h3>
                        <p className="text-gray-400 text-sm">Manage content in 5 languages with AI translation</p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#f9dc24] flex items-center justify-center flex-shrink-0">
                        <Eye className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">Live Preview</h3>
                        <p className="text-gray-400 text-sm">See changes instantly before publishing</p>
                      </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#f9dc24] flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">SEO Optimized</h3>
                        <p className="text-gray-400 text-sm">Built-in SEO tools for maximum visibility</p>
                      </div>
                    </div>

                    {/* Feature 5 */}
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#f9dc24] flex items-center justify-center flex-shrink-0">
                        <GripVertical className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">Hierarchical Pages</h3>
                        <p className="text-gray-400 text-sm">Organize content with parent-child relationships</p>
                      </div>
                    </div>

                    {/* Feature 6 */}
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#f9dc24] flex items-center justify-center flex-shrink-0">
                        <Upload className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold mb-1">Media Management</h3>
                        <p className="text-gray-400 text-sm">Upload and manage images with metadata tracking</p>
                      </div>
                    </div>
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
                        <h3 className="text-lg font-bold text-gray-900">Produkt Hero</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Tiles</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Banner</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Meta Navigation</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Product Gallery</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Feature Overview</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Table</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">FAQ</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Video</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Full Hero</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Intro</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Specification</h3>
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
                        <h3 className="text-lg font-bold text-gray-900">Image-Text</h3>
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
                        ID {segmentId}: Action Hero {displayNumber}
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

                {/* Draggable Middle Tabs - ALL segments EXCEPT Meta Navigation, Full Hero, Action Hero, Hero, and Footer */}
                <SortableContext
                  items={tabOrder.filter(tabId => {
                    const segment = pageSegments.find(s => s.id === tabId);
                    // Exclude meta-navigation, full-hero, action-hero, and footer from draggable section
                    return !segment || (segment.type !== 'meta-navigation' && segment.type !== 'full-hero' && segment.type !== 'action-hero' && segment.type !== 'footer');
                  })}
                  strategy={horizontalListSortingStrategy}
                >
                  {tabOrder
                    .filter(tabId => {
                      const segment = pageSegments.find(s => s.id === tabId);
                      // Exclude meta-navigation, full-hero, action-hero, and footer from draggable section
                      return !segment || (segment.type !== 'meta-navigation' && segment.type !== 'full-hero' && segment.type !== 'action-hero' && segment.type !== 'footer');
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
                        if (segment.type === 'news-list') label = `News-List - P ${displayNumber}`;
                        if (segment.type === 'action-hero') label = `Action Hero ${displayNumber}`;
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
                  <CardTitle className="text-white">Produkt Hero</CardTitle>
                  <CardDescription className="text-gray-300">Edit the main hero section content</CardDescription>
                  <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                    ID: {segmentRegistry['hero'] || 1}
                  </div>
                </div>
                <div className="flex items-center gap-3">
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

            let label = '';
            if (customKey && customKey !== String(segmentId)) {
              label = customKey;
            } else {
              if (segment.type === 'hero') label = `Produkt Hero - F ${displayNumber}`;
              if (segment.type === 'meta-navigation') label = `Meta Navigation - E ${displayNumber}`;
              if (segment.type === 'product-hero-gallery') label = `Product Gallery - G ${displayNumber}`;
              if (segment.type === 'tiles') label = `Tiles - H ${displayNumber}`;
              if (segment.type === 'banner') label = `Banner - J ${displayNumber}`;
              if (segment.type === 'banner-p') label = `Banner-P ${displayNumber}`;
              if (segment.type === 'image-text') label = `Image & Text - I ${displayNumber}`;
              if (segment.type === 'full-hero') label = `Full Hero - A ${displayNumber}`;
              if (segment.type === 'intro') label = `Intro - B ${displayNumber}`;
              if (segment.type === 'industries') label = `Industries - C ${displayNumber}`;
              if (segment.type === 'news') label = `Latest News - D ${displayNumber}`;
              if (segment.type === 'debug') label = `Debug ${displayNumber}`;
              if (segment.type === 'news-list') label = `News-List - P ${displayNumber}`;
              if (segment.type === 'action-hero') label = `Action Hero ${displayNumber}`;
              if (segment.type === 'feature-overview') label = `Features - K ${displayNumber}`;
              if (segment.type === 'table') label = `Table - L ${displayNumber}`;
              if (segment.type === 'faq') label = `FAQ - O ${displayNumber}`;
              if (segment.type === 'video') label = `Video - M ${displayNumber}`;
              if (segment.type === 'specification') label = `Specification - N ${displayNumber}`;
            }
            
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
                        Edit this {segment.type} segment
                      </CardDescription>
                      <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                        ID: {segmentRegistry[segment.id] || segment.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                    
                    // Helper: build label exactly like in the segment tab bar
                    const buildSegmentLabel = (segType: string, displayNumber: number): string => {
                      if (segType === 'hero') return `Produkt Hero - F ${displayNumber}`;
                      if (segType === 'product-hero-gallery') return `Product Gallery - G ${displayNumber}`;
                      if (segType === 'tiles') return `Tiles - H ${displayNumber}`;
                      if (segType === 'banner') return `Banner - J ${displayNumber}`;
                      if (segType === 'banner-p') return `Banner-P ${displayNumber}`;
                      if (segType === 'image-text') return `Image & Text - I ${displayNumber}`;
                      if (segType === 'feature-overview') return `Features - K ${displayNumber}`;
                      if (segType === 'table') return `Table - L ${displayNumber}`;
                      if (segType === 'faq') return `FAQ - O ${displayNumber}`;
                      if (segType === 'video') return `Video - M ${displayNumber}`;
                      if (segType === 'specification') return `Specification - N ${displayNumber}`;
                      if (segType === 'news') return `Latest News - D ${displayNumber}`;
                      if (segType === 'full-hero') return `Full Hero - A ${displayNumber}`;
                      if (segType === 'intro') return `Intro - B ${displayNumber}`;
                      if (segType === 'industries') return `Industries - C ${displayNumber}`;
                      if (segType === 'debug') return `Debug ${displayNumber}`;
                      if (segType === 'news-list') return `News-List - P ${displayNumber}`;
                      if (segType === 'action-hero') return `Action Hero ${displayNumber}`;
                      return segType;
                    };

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
                    <NewsListSegmentEditor
                      pageSlug={resolvedPageSlug || selectedPage}
                      segmentId={segment.id}
                      data={segment.data}
                      onSave={() => loadContent()}
                      editorLanguage={editorLanguage}
                    />
                  )}

                  {segment.type === 'action-hero' && (
                    <ActionHeroEditor
                      pageSlug={resolvedPageSlug || selectedPage}
                      segmentId={segment.id}
                      data={segment.data}
                      onSave={() => loadContent()}
                      targetLanguage={editorLanguage}
                    />
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
        </Tabs>
        )}
      </div>

      <CreateCMSPageDialog
        open={isCreateCMSDialogOpen}
        onOpenChange={setIsCreateCMSDialogOpen}
        onSuccess={(slug, languages) => createNewCMSPageWithSlug(slug, languages)}
      />
      </div>
    </AdminDashboardErrorBoundary>
  );
};

export default AdminDashboard;
