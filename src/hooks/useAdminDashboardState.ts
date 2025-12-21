// ============================================
// useAdminDashboardState - Centralized State Management
// ============================================

import { useState, useRef, useCallback } from 'react';
import { ImageMetadata } from '@/types/imageMetadata';
import { 
  PageInfo, 
  TileItem, 
  BannerImage, 
  SolutionItem,
  SupportedLanguage,
  PageSegment
} from '@/components/admin/dashboard/types';

// ============================================
// Initial State Defaults
// ============================================

const INITIAL_HERO_STATE = {
  imageUrl: '',
  imageMetadata: null as ImageMetadata | null,
  imagePosition: 'right',
  layout: '2-5',
  topPadding: 'medium',
  ctaLink: '#applications-start',
  ctaStyle: 'standard'
};

const INITIAL_BANNER_STATE = {
  title: '',
  subtext: '',
  images: [] as BannerImage[],
  buttonText: '',
  buttonLink: '',
  buttonStyle: 'standard'
};

const INITIAL_SOLUTIONS_STATE = {
  title: '',
  subtext: '',
  layout: '2-col',
  items: [] as SolutionItem[]
};

const INITIAL_FOOTER_STATE = {
  ctaTitle: '',
  ctaDescription: '',
  contactHeadline: '',
  contactSubline: '',
  contactDescription: '',
  teamImageUrl: '',
  teamImageMetadata: null as ImageMetadata | null,
  teamQuote: '',
  teamName: '',
  teamTitle: '',
  buttonText: ''
};

const INITIAL_SEO_STATE = {
  title: '',
  metaDescription: '',
  slug: '',
  canonical: '',
  robotsIndex: 'index',
  robotsFollow: 'follow',
  focusKeyword: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image'
};

const INITIAL_FLYOUT_STATE = {
  imageUrl: null as string | null,
  descriptionTranslations: {} as Record<string, string>,
  descriptionLanguage: 'en'
};

const INITIAL_CTA_STATE = {
  group: 'none',
  label: '',
  icon: 'auto'
};

// ============================================
// Hook Interface
// ============================================

export interface AdminDashboardState {
  // Content
  content: Record<string, string>;
  setContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  
  // Page State
  resolvedPageSlug: string;
  setResolvedPageSlug: (slug: string) => void;
  pageInfo: PageInfo | null;
  setPageInfo: (info: PageInfo | null) => void;
  
  // Segments
  pageSegments: PageSegment[];
  setPageSegments: React.Dispatch<React.SetStateAction<PageSegment[]>>;
  segmentRegistry: Record<string, number>;
  setSegmentRegistry: (registry: Record<string, number>) => void;
  nextSegmentId: number;
  setNextSegmentId: (id: number) => void;
  
  // Tabs
  activeTab: string;
  setActiveTab: (tab: string, pageKey?: string) => void;
  tabOrder: string[];
  setTabOrder: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Hero Section
  hero: typeof INITIAL_HERO_STATE;
  setHeroField: <K extends keyof typeof INITIAL_HERO_STATE>(field: K, value: typeof INITIAL_HERO_STATE[K]) => void;
  resetHero: () => void;
  
  // Tiles Section
  applications: TileItem[];
  setApplications: React.Dispatch<React.SetStateAction<TileItem[]>>;
  tilesColumns: string;
  setTilesColumns: (columns: string) => void;
  
  // Banner Section
  banner: typeof INITIAL_BANNER_STATE;
  setBannerField: <K extends keyof typeof INITIAL_BANNER_STATE>(field: K, value: typeof INITIAL_BANNER_STATE[K]) => void;
  resetBanner: () => void;
  
  // Solutions Section
  solutions: typeof INITIAL_SOLUTIONS_STATE;
  setSolutionsField: <K extends keyof typeof INITIAL_SOLUTIONS_STATE>(field: K, value: typeof INITIAL_SOLUTIONS_STATE[K]) => void;
  resetSolutions: () => void;
  
  // Footer Section
  footer: typeof INITIAL_FOOTER_STATE;
  setFooterField: <K extends keyof typeof INITIAL_FOOTER_STATE>(field: K, value: typeof INITIAL_FOOTER_STATE[K]) => void;
  resetFooter: () => void;
  
  // SEO
  seoData: typeof INITIAL_SEO_STATE;
  setSeoData: React.Dispatch<React.SetStateAction<typeof INITIAL_SEO_STATE>>;
  
  // Flyout
  flyout: typeof INITIAL_FLYOUT_STATE;
  setFlyoutField: <K extends keyof typeof INITIAL_FLYOUT_STATE>(field: K, value: typeof INITIAL_FLYOUT_STATE[K]) => void;
  
  // CTA
  cta: typeof INITIAL_CTA_STATE;
  setCtaField: <K extends keyof typeof INITIAL_CTA_STATE>(field: K, value: typeof INITIAL_CTA_STATE[K]) => void;
  
  // Design
  pendingDesignIcon: string | null;
  setPendingDesignIcon: (icon: string | null) => void;
  
  // Language
  editorLanguage: SupportedLanguage;
  setEditorLanguage: (lang: SupportedLanguage) => void;
  selectedLanguages: string[];
  setSelectedLanguages: (langs: string[]) => void;
  
  // Split Screen (Tiles Translation)
  isSplitScreenEnabled: boolean;
  setIsSplitScreenEnabled: (enabled: boolean) => void;
  targetTiles: {
    title: string;
    description: string;
    columns: string;
    applications: TileItem[];
  };
  setTargetTilesField: (field: string, value: any) => void;
  
  // Available Pages
  availablePages: Array<{ page_slug: string; page_title: string }>;
  setAvailablePages: (pages: Array<{ page_slug: string; page_title: string }>) => void;
  
  // CMS Page Creation
  selectedPageForCMS: string;
  setSelectedPageForCMS: (slug: string) => void;
  
  // Loading States
  saving: boolean;
  setSaving: (saving: boolean) => void;
  uploading: UploadingStates;
  setUploadingField: <K extends keyof UploadingStates>(field: K, value: UploadingStates[K]) => void;
  
  // Dialog States
  dialogs: DialogStates;
  openDialog: (dialog: keyof DialogStates) => void;
  closeDialog: (dialog: keyof DialogStates) => void;
  toggleDialog: (dialog: keyof DialogStates) => void;
  
  // Processing States
  isCreatingCMS: boolean;
  setIsCreatingCMS: (creating: boolean) => void;
  isSavingFlyout: boolean;
  setIsSavingFlyout: (saving: boolean) => void;
  isSavingCta: boolean;
  setIsSavingCta: (saving: boolean) => void;
  isTranslatingFlyout: boolean;
  setIsTranslatingFlyout: (translating: boolean) => void;
  isTranslatingTiles: boolean;
  setIsTranslatingTiles: (translating: boolean) => void;
  
  // Refs
  autoSaveTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  
  // Reset Functions
  resetAllState: () => void;
  resetPageState: () => void;
}

export interface UploadingStates {
  global: boolean;
  hero: boolean;
  tileIndex: number | null;
  solutionsIndex: number | null;
  imageTextHeroIndex: number | null;
  imageTextItemKey: string | null;
  footer: boolean;
  bannerIndex: number | null;
  dynamicTileKey: string | null;
}

export interface DialogStates {
  template: boolean;
  copyHero: boolean;
  copyTiles: boolean;
  copyBanner: boolean;
  copySolutions: boolean;
  copyFooter: boolean;
  seoEditor: boolean;
  glossary: boolean;
  createCMS: boolean;
  designElement: boolean;
  flyout: boolean;
  flyoutMedia: boolean;
  cta: boolean;
  userManagement: boolean;
  versionHistory: boolean;
}

const INITIAL_UPLOADING: UploadingStates = {
  global: false,
  hero: false,
  tileIndex: null,
  solutionsIndex: null,
  imageTextHeroIndex: null,
  imageTextItemKey: null,
  footer: false,
  bannerIndex: null,
  dynamicTileKey: null
};

const INITIAL_DIALOGS: DialogStates = {
  template: false,
  copyHero: false,
  copyTiles: false,
  copyBanner: false,
  copySolutions: false,
  copyFooter: false,
  seoEditor: false,
  glossary: false,
  createCMS: false,
  designElement: false,
  flyout: false,
  flyoutMedia: false,
  cta: false,
  userManagement: false,
  versionHistory: false
};

// ============================================
// Hook Implementation
// ============================================

export function useAdminDashboardState(): AdminDashboardState {
  // Content
  const [content, setContent] = useState<Record<string, string>>({});
  
  // Page State
  const [resolvedPageSlug, setResolvedPageSlug] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  
  // Segments
  const [pageSegments, setPageSegments] = useState<PageSegment[]>([]);
  const [segmentRegistry, setSegmentRegistry] = useState<Record<string, number>>({});
  const [nextSegmentId, setNextSegmentId] = useState<number>(5);
  
  // Tabs
  const [activeTabState, setActiveTabState] = useState<string>('');
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  
  const setActiveTab = useCallback((tab: string, pageKey?: string) => {
    setActiveTabState(tab);
    if (tab && pageKey) {
      sessionStorage.setItem(`admin-activeTab-${pageKey}`, tab);
    }
  }, []);
  
  // Hero Section
  const [hero, setHero] = useState(INITIAL_HERO_STATE);
  
  const setHeroField = useCallback(<K extends keyof typeof INITIAL_HERO_STATE>(
    field: K, 
    value: typeof INITIAL_HERO_STATE[K]
  ) => {
    setHero(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetHero = useCallback(() => setHero(INITIAL_HERO_STATE), []);
  
  // Tiles Section
  const [applications, setApplications] = useState<TileItem[]>([]);
  const [tilesColumns, setTilesColumns] = useState<string>('3');
  
  // Banner Section
  const [banner, setBanner] = useState(INITIAL_BANNER_STATE);
  
  const setBannerField = useCallback(<K extends keyof typeof INITIAL_BANNER_STATE>(
    field: K, 
    value: typeof INITIAL_BANNER_STATE[K]
  ) => {
    setBanner(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetBanner = useCallback(() => setBanner(INITIAL_BANNER_STATE), []);
  
  // Solutions Section
  const [solutions, setSolutions] = useState(INITIAL_SOLUTIONS_STATE);
  
  const setSolutionsField = useCallback(<K extends keyof typeof INITIAL_SOLUTIONS_STATE>(
    field: K, 
    value: typeof INITIAL_SOLUTIONS_STATE[K]
  ) => {
    setSolutions(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetSolutions = useCallback(() => setSolutions(INITIAL_SOLUTIONS_STATE), []);
  
  // Footer Section
  const [footer, setFooter] = useState(INITIAL_FOOTER_STATE);
  
  const setFooterField = useCallback(<K extends keyof typeof INITIAL_FOOTER_STATE>(
    field: K, 
    value: typeof INITIAL_FOOTER_STATE[K]
  ) => {
    setFooter(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const resetFooter = useCallback(() => setFooter(INITIAL_FOOTER_STATE), []);
  
  // SEO
  const [seoData, setSeoData] = useState(INITIAL_SEO_STATE);
  
  // Flyout
  const [flyout, setFlyout] = useState(INITIAL_FLYOUT_STATE);
  
  const setFlyoutField = useCallback(<K extends keyof typeof INITIAL_FLYOUT_STATE>(
    field: K, 
    value: typeof INITIAL_FLYOUT_STATE[K]
  ) => {
    setFlyout(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // CTA
  const [cta, setCta] = useState(INITIAL_CTA_STATE);
  
  const setCtaField = useCallback(<K extends keyof typeof INITIAL_CTA_STATE>(
    field: K, 
    value: typeof INITIAL_CTA_STATE[K]
  ) => {
    setCta(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Design
  const [pendingDesignIcon, setPendingDesignIcon] = useState<string | null>(null);
  
  // Language
  const [editorLanguage, setEditorLanguage] = useState<SupportedLanguage>('en');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'de', 'ja', 'ko', 'zh']);
  
  // Split Screen
  const [isSplitScreenEnabled, setIsSplitScreenEnabledState] = useState(() => 
    localStorage.getItem('tiles-split-screen') === 'true'
  );
  
  const setIsSplitScreenEnabled = useCallback((enabled: boolean) => {
    setIsSplitScreenEnabledState(enabled);
    localStorage.setItem('tiles-split-screen', String(enabled));
  }, []);
  
  const [targetTiles, setTargetTiles] = useState({
    title: '',
    description: '',
    columns: '3',
    applications: [] as TileItem[]
  });
  
  const setTargetTilesField = useCallback((field: string, value: any) => {
    setTargetTiles(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Available Pages
  const [availablePages, setAvailablePages] = useState<Array<{ page_slug: string; page_title: string }>>([]);
  
  // CMS Page Creation
  const [selectedPageForCMS, setSelectedPageForCMS] = useState<string>('');
  
  // Loading States
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadingStates>(INITIAL_UPLOADING);
  
  const setUploadingField = useCallback(<K extends keyof UploadingStates>(
    field: K, 
    value: UploadingStates[K]
  ) => {
    setUploading(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Dialog States
  const [dialogs, setDialogs] = useState<DialogStates>(INITIAL_DIALOGS);
  
  const openDialog = useCallback((dialog: keyof DialogStates) => {
    setDialogs(prev => ({ ...prev, [dialog]: true }));
  }, []);
  
  const closeDialog = useCallback((dialog: keyof DialogStates) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }));
  }, []);
  
  const toggleDialog = useCallback((dialog: keyof DialogStates) => {
    setDialogs(prev => ({ ...prev, [dialog]: !prev[dialog] }));
  }, []);
  
  // Processing States
  const [isCreatingCMS, setIsCreatingCMS] = useState(false);
  const [isSavingFlyout, setIsSavingFlyout] = useState(false);
  const [isSavingCta, setIsSavingCta] = useState(false);
  const [isTranslatingFlyout, setIsTranslatingFlyout] = useState(false);
  const [isTranslatingTiles, setIsTranslatingTiles] = useState(false);
  
  // Refs
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset Functions
  const resetPageState = useCallback(() => {
    resetHero();
    resetBanner();
    resetSolutions();
    resetFooter();
    setApplications([]);
    setTilesColumns('3');
    setPageSegments([]);
    setTabOrder([]);
    setSegmentRegistry({});
    setContent({});
    setSeoData(INITIAL_SEO_STATE);
  }, [resetHero, resetBanner, resetSolutions, resetFooter]);
  
  const resetAllState = useCallback(() => {
    resetPageState();
    setResolvedPageSlug('');
    setPageInfo(null);
    setActiveTabState('');
    setAvailablePages([]);
    setDialogs(INITIAL_DIALOGS);
    setUploading(INITIAL_UPLOADING);
  }, [resetPageState]);
  
  return {
    // Content
    content,
    setContent,
    
    // Page State
    resolvedPageSlug,
    setResolvedPageSlug,
    pageInfo,
    setPageInfo,
    
    // Segments
    pageSegments,
    setPageSegments,
    segmentRegistry,
    setSegmentRegistry,
    nextSegmentId,
    setNextSegmentId,
    
    // Tabs
    activeTab: activeTabState,
    setActiveTab,
    tabOrder,
    setTabOrder,
    
    // Hero Section
    hero,
    setHeroField,
    resetHero,
    
    // Tiles Section
    applications,
    setApplications,
    tilesColumns,
    setTilesColumns,
    
    // Banner Section
    banner,
    setBannerField,
    resetBanner,
    
    // Solutions Section
    solutions,
    setSolutionsField,
    resetSolutions,
    
    // Footer Section
    footer,
    setFooterField,
    resetFooter,
    
    // SEO
    seoData,
    setSeoData,
    
    // Flyout
    flyout,
    setFlyoutField,
    
    // CTA
    cta,
    setCtaField,
    
    // Design
    pendingDesignIcon,
    setPendingDesignIcon,
    
    // Language
    editorLanguage,
    setEditorLanguage,
    selectedLanguages,
    setSelectedLanguages,
    
    // Split Screen
    isSplitScreenEnabled,
    setIsSplitScreenEnabled,
    targetTiles,
    setTargetTilesField,
    
    // Available Pages
    availablePages,
    setAvailablePages,
    
    // CMS Page Creation
    selectedPageForCMS,
    setSelectedPageForCMS,
    
    // Loading States
    saving,
    setSaving,
    uploading,
    setUploadingField,
    
    // Dialog States
    dialogs,
    openDialog,
    closeDialog,
    toggleDialog,
    
    // Processing States
    isCreatingCMS,
    setIsCreatingCMS,
    isSavingFlyout,
    setIsSavingFlyout,
    isSavingCta,
    setIsSavingCta,
    isTranslatingFlyout,
    setIsTranslatingFlyout,
    isTranslatingTiles,
    setIsTranslatingTiles,
    
    // Refs
    autoSaveTimerRef,
    
    // Reset Functions
    resetAllState,
    resetPageState
  };
}

export default useAdminDashboardState;
