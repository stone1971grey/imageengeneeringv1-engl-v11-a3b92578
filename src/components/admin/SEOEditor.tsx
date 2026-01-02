import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, CheckCircle2, AlertTriangle, X, Loader2, ChevronDown, Link2, Trash2, Link as LinkIcon, Plus, Check, ExternalLink, Sparkles, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { SERPPreview } from "./SERPPreview";
import { RedirectManager } from "./RedirectManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GeminiIcon } from "@/components/GeminiIcon";

interface SEOData {
  title?: string;
  metaDescription?: string;
  slug?: string;
  canonical?: string;
  robotsIndex?: 'index' | 'noindex';
  robotsFollow?: 'follow' | 'nofollow';
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  introduction?: string;
  h1?: string;
  /** If true, h1 was manually set via Smart H1 and should not be auto-detected */
  h1Locked?: boolean;
}

interface SEOEditorProps {
  pageSlug: string;
  data: SEOData;
  onChange: (data: SEOData) => void;
  onSave: () => void;
  pageSegments?: any[];
  /** 
   * Access level for SEO features:
   * - 'basic': Only basic SEO features (Title, Meta, Slug, H1 detection)
   * - 'advanced': Full access including Focus Keywords, Smart H1, Smart FKW, etc.
   * Advanced features influence/override Basic features when active.
   */
  accessLevel?: 'basic' | 'advanced';
  /** Current editor language for database queries */
  editorLanguage?: 'en' | 'de' | 'ja' | 'ko' | 'zh';
}

export const SEOEditor = ({ 
  pageSlug, 
  data, 
  onChange, 
  onSave, 
  pageSegments = [],
  accessLevel = 'advanced', // Default to advanced for now (full program)
  editorLanguage = 'en' // Default to English
}: SEOEditorProps) => {
  
  // Helper to check if advanced features are available
  const isAdvancedMode = accessLevel === 'advanced';
  const [checks, setChecks] = useState({
    titleLength: false,
    descriptionLength: false,
    hasH1: true,
    hasInternalLinks: false,
    hasExternalLinks: false,
    keywordInTitle: false,
    keywordInDescription: false,
    keywordInSlug: false,
    keywordInIntroduction: false,
    keywordInH1: false,
  });

  const [introductionText, setIntroductionText] = useState({ title: '', description: '' });
  const [pageContent, setPageContent] = useState<any[]>([]);
  const [segmentRegistry, setSegmentRegistry] = useState<any[]>([]);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [h1SourceInfo, setH1SourceInfo] = useState<{ type: string; key: string; id: string | number; label: string } | null>(null);
  const [introSourceInfo, setIntroSourceInfo] = useState<{ type: string; key: string; id: string | number; label: string } | null>(null);
  
  // Smart Focus Keyword state
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<Array<{ keyword: string; reason: string; priority: number }>>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);

  // Smart H1 Headline state
  const [isGeneratingH1, setIsGeneratingH1] = useState(false);
  const [h1Suggestions, setH1Suggestions] = useState<Array<{
    headline: string;
    reason: string;
    characterCount: number;
    keywordPosition: string;
    placementOptions?: Array<{
      rank: number;
      segmentType: string;
      segmentKey: string | null;
      segmentId: number | null;
      createNew: boolean;
      suggestedTabPosition: number;
      note: string;
    }>;
    placementSuggestion: { segmentType: string; segmentKey: string | null; note: string; segmentId?: number } | null;
    priority: number;
  }>>([]);
  const [showH1Suggestions, setShowH1Suggestions] = useState(false);
  const [selectedH1Suggestion, setSelectedH1Suggestion] = useState<{
    headline: string;
    selectedPlacement: {
      rank: number;
      segmentType: string;
      segmentKey: string | null;
      segmentId: number | null;
      createNew: boolean;
      suggestedTabPosition: number;
      note: string;
    } | null;
    allPlacementOptions: Array<{
      rank: number;
      segmentType: string;
      segmentKey: string | null;
      segmentId: number | null;
      createNew: boolean;
      suggestedTabPosition: number;
      note: string;
    }>;
  } | null>(null);
  const [isApplyingH1, setIsApplyingH1] = useState(false);
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);
  const [isRedirectManagerOpen, setIsRedirectManagerOpen] = useState(false);
  const [pageRedirects, setPageRedirects] = useState<Array<{ id: string; source_url: string; target_url: string; redirect_type: number; notes: string | null }>>([]);
  
  // Smart Title state
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<Array<{
    title: string;
    characterCount: number;
    reason: string;
    keywordPosition: string;
    priority: number;
  }>>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  
  // Smart Description state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<Array<{
    description: string;
    characterCount: number;
    reason: string;
    priority: number;
  }>>([]);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  
  // Smart Intro state
  const [isGeneratingIntro, setIsGeneratingIntro] = useState(false);
  const [generatedIntro, setGeneratedIntro] = useState<{
    introText: string;
    wordCount: number;
    keyphrasePosition: string;
    keyphraseCount: number;
    sentenceCount: number;
    reason: string;
  } | null>(null);
  const [showGeneratedIntro, setShowGeneratedIntro] = useState(false);
  const [isApplyingIntro, setIsApplyingIntro] = useState(false);
  
  // Smart Internal Links state
  const [isGeneratingInternalLinks, setIsGeneratingInternalLinks] = useState(false);
  const [internalLinkSuggestions, setInternalLinkSuggestions] = useState<Array<{
    anchorText: string;
    targetSlug: string;
    targetTitle: string;
    segmentKey: string;
    segmentId?: number | null;
    segmentField?: string;
    segmentType?: string;
    contextPreview?: string;
    reason: string;
    priority: number;
    applied?: boolean;
  }>>([]);
  const [showInternalLinkSuggestions, setShowInternalLinkSuggestions] = useState(false);
  // Persisted applied links (loaded from database)
  const [appliedInternalLinks, setAppliedInternalLinks] = useState<Array<{
    anchorText: string;
    targetSlug: string;
    targetTitle: string;
    segmentKey: string;
    segmentId?: number | null;
    segmentField?: string;
    segmentType?: string;
    appliedAt: string;
  }>>([]);
  
  // Delete confirmation state for internal links
  const [linkToDelete, setLinkToDelete] = useState<{
    suggestion: typeof internalLinkSuggestions[0];
    index: number;
  } | null>(null);
  const [isDeletingLink, setIsDeletingLink] = useState(false);
  
  // Smart External Links state
  const [isGeneratingExternalLinks, setIsGeneratingExternalLinks] = useState(false);
  const [externalLinkSuggestions, setExternalLinkSuggestions] = useState<Array<{
    anchorText: string;
    targetUrl: string;
    targetTitle: string;
    segmentKey: string;
    segmentId?: number | null;
    internalId?: string | null; // Internal ID for finding segment in page_segments array
    segmentType?: string;
    reason: string;
    sourceType: string;
    priority: number;
    applied?: boolean;
  }>>([]);
  const [showExternalLinkSuggestions, setShowExternalLinkSuggestions] = useState(false);
  const [externalLinkToDelete, setExternalLinkToDelete] = useState<{ suggestion: typeof externalLinkSuggestions[0]; index: number } | null>(null);
  
  // Possible Content Links state (for content suggestions)
  const [isGeneratingContentLinks, setIsGeneratingContentLinks] = useState(false);
  const [contentLinkSuggestions, setContentLinkSuggestions] = useState<Array<{
    suggestedSlug: string;
    suggestedTitle: string;
    segmentType: string;
    suggestionType: 'new_page' | 'existing_segment';
    reason: string;
    priority: number;
    parentSlug?: string | null;
    targetPageSlug?: string | null;
    saved?: boolean;
    createdSlug?: string; // Full slug of the created page
    linkPlacement?: {
      segmentId: number;
      segmentKey: string;
      segmentType: string;
      placementType: 'inline_text' | 'cta_button' | 'navigation_link' | 'feature_card';
      placementDescription: string;
    } | null;
    suggestedSegments?: Array<{
      type: string;
      content: string;
    }> | null;
    isApplying?: boolean;
    isGeneratingContent?: boolean;
    contentGenerated?: boolean;
  }>>([]);
  const [showContentLinkSuggestions, setShowContentLinkSuggestions] = useState(false);
  const [isSavingContentSuggestions, setIsSavingContentSuggestions] = useState(false);
  
  // Extracted internal links state (for display in Basics tab)
  const [extractedInternalLinks, setExtractedInternalLinks] = useState<Array<{
    anchorText: string;
    targetUrl: string;
    segmentKey: string;
    segmentId?: number | null;
    segmentType?: string;
  }>>([]);
  
  // Extracted external links state (for display in Basics tab)
  const [extractedExternalLinks, setExtractedExternalLinks] = useState<Array<{
    anchorText: string;
    targetUrl: string;
    segmentKey: string;
    segmentId?: number | null;
    segmentType?: string;
    targetTitle?: string;
  }>>([]);
  
  // Collapsible state for SEO Health Check and SERP Preview - with localStorage persistence
  const [isHealthCheckOpen, setIsHealthCheckOpen] = useState(() => {
    const saved = localStorage.getItem('seo-healthcheck-open');
    return saved !== null ? saved === 'true' : false; // Default: collapsed
  });
  const [isSerpPreviewOpen, setIsSerpPreviewOpen] = useState(() => {
    const saved = localStorage.getItem('seo-serp-preview-open');
    return saved !== null ? saved === 'true' : false; // Default: collapsed
  });
  
  // Persist collapsible states to localStorage
  useEffect(() => {
    localStorage.setItem('seo-healthcheck-open', String(isHealthCheckOpen));
  }, [isHealthCheckOpen]);
  
  useEffect(() => {
    localStorage.setItem('seo-serp-preview-open', String(isSerpPreviewOpen));
  }, [isSerpPreviewOpen]);
  
  // Advanced Tab Collapsible states - with localStorage persistence
  const [isMetaHeadlinesOpen, setIsMetaHeadlinesOpen] = useState(() => {
    const saved = localStorage.getItem('seo-advanced-meta-headlines-open');
    return saved !== null ? saved === 'true' : true; // Default: open
  });
  const [isFkwOptimizerOpen, setIsFkwOptimizerOpen] = useState(() => {
    const saved = localStorage.getItem('seo-advanced-fkw-optimizer-open');
    return saved !== null ? saved === 'true' : false; // Default: collapsed
  });
  const [isInternalLinksOpen, setIsInternalLinksOpen] = useState(() => {
    const saved = localStorage.getItem('seo-advanced-internal-links-open');
    return saved !== null ? saved === 'true' : false; // Default: collapsed
  });
  const [isExternalLinksOpen, setIsExternalLinksOpen] = useState(() => {
    const saved = localStorage.getItem('seo-advanced-external-links-open');
    return saved !== null ? saved === 'true' : false; // Default: collapsed
  });
  
  // Persist Advanced Tab collapsible states
  useEffect(() => {
    localStorage.setItem('seo-advanced-meta-headlines-open', String(isMetaHeadlinesOpen));
  }, [isMetaHeadlinesOpen]);
  useEffect(() => {
    localStorage.setItem('seo-advanced-fkw-optimizer-open', String(isFkwOptimizerOpen));
  }, [isFkwOptimizerOpen]);
  useEffect(() => {
    localStorage.setItem('seo-advanced-internal-links-open', String(isInternalLinksOpen));
  }, [isInternalLinksOpen]);
  useEffect(() => {
    localStorage.setItem('seo-advanced-external-links-open', String(isExternalLinksOpen));
  }, [isExternalLinksOpen]);
  
  // FKW Content Optimizer state
  const [isGeneratingFkwContent, setIsGeneratingFkwContent] = useState(false);
  const [fkwContentSuggestions, setFkwContentSuggestions] = useState<Array<{
    suggestionType: 'heading' | 'body';
    headingLevel?: 'h2' | 'h3';
    currentText: string;
    suggestedText: string;
    segmentKey: string;
    segmentId: number;
    segmentType: string;
    fieldPath: string;
    reason: string;
    priority: number;
    applied?: boolean;
    rejected?: boolean;
  }>>([]);
  const [showFkwContentSuggestions, setShowFkwContentSuggestions] = useState(false);
  const [fkwContentAnalysis, setFkwContentAnalysis] = useState<{
    totalWords: number;
    fkwOccurrences: number;
    fkwDensity: number;
    densityStatus: 'too_low' | 'optimal' | 'too_high';
    h1HasFkw: boolean;
    h2Count: number;
    h2WithFkw: number;
    h3Count: number;
    h3WithFkw: number;
    introHasFkw: boolean;
  } | null>(null);
  const [fkwContentScore, setFkwContentScore] = useState<number>(0);
  const [fkwContentRecommendations, setFkwContentRecommendations] = useState<string[]>([]);
  const [isApplyingFkwContent, setIsApplyingFkwContent] = useState<number | null>(null);
  
  // Smart H2 Generator state
  const [isGeneratingH2, setIsGeneratingH2] = useState(false);
  const [h2Suggestions, setH2Suggestions] = useState<Array<{
    originalText: string;
    suggestedText: string;
    segmentId: number | null;
    segmentType: string;
    segmentKey: string | null;
    reason: string;
    characterCount: number;
    priority: number;
    applied?: boolean;
  }>>([]);
  const [showH2Suggestions, setShowH2Suggestions] = useState(false);
  const [isApplyingH2, setIsApplyingH2] = useState<number | null>(null);
  
  // Smart H3 Generator state
  const [isGeneratingH3, setIsGeneratingH3] = useState(false);
  const [h3Suggestions, setH3Suggestions] = useState<Array<{
    originalText: string;
    suggestedText: string;
    segmentId: number | null;
    segmentType: string;
    segmentKey: string | null;
    itemIndex?: number;
    reason: string;
    characterCount: number;
    priority: number;
    applied?: boolean;
    alreadyOptimized?: boolean;
  }>>([]);
  const [showH3Suggestions, setShowH3Suggestions] = useState(false);
  const [isApplyingH3, setIsApplyingH3] = useState<number | null>(null);
  
  // H1 Change Log - documentation of what was changed
  const [h1ChangeLog, setH1ChangeLog] = useState<{
    timestamp: string;
    newH1: string;
    targetSegment: { id: number; key: string; type: string; label: string };
    createdNewSegment?: boolean;
    tabPosition?: number;
    oldH1?: { text: string; segment: { key: string; label: string }; action: string };
  } | null>(null);

  /**
   * Helper function for consistent character/word count display
   * Returns styling classes and checkmark based on value vs ideal range
   * - Green + ✓: Within ideal range
   * - Yellow: Slightly outside (within 20% of max)
   * - Red: Significantly outside (more than 20% over max or under min)
   */
  const getCountDisplay = (
    value: number,
    min: number,
    max: number,
    unit: 'chars' | 'words' = 'chars'
  ): { bgClass: string; textClass: string; showCheck: boolean } => {
    const isInRange = value >= min && value <= max;
    const slightlyOver = value > max && value <= max * 1.2;
    const slightlyUnder = value < min && value >= min * 0.8;
    
    if (isInRange) {
      return {
        bgClass: 'bg-green-500/20',
        textClass: 'text-green-400',
        showCheck: true
      };
    } else if (slightlyOver || slightlyUnder) {
      return {
        bgClass: 'bg-yellow-500/20',
        textClass: 'text-yellow-400',
        showCheck: false
      };
    } else {
      return {
        bgClass: 'bg-red-500/20',
        textClass: 'text-red-400',
        showCheck: false
      };
    }
  };

  // Keep localStorage cache updated when data changes (for instant loading on next visit)
  useEffect(() => {
    if (data.focusKeyword || data.h1 || data.title || data.metaDescription) {
      localStorage.setItem(`seo-data-${pageSlug}-${editorLanguage}`, JSON.stringify({
        focusKeyword: data.focusKeyword || '',
        h1: data.h1 || '',
        h1Locked: data.h1Locked ?? false,
        title: data.title || '',
        metaDescription: data.metaDescription || '',
        introduction: data.introduction || ''
      }));
    }
  }, [data.focusKeyword, data.h1, data.title, data.metaDescription, data.introduction, pageSlug, editorLanguage]);

  // Load page content and segment registry - OPTIMIZED WITH PARALLEL QUERIES
  useEffect(() => {
    const loadPageData = async () => {
      const startTime = performance.now();
      console.log('[SEO Editor] Loading page data for:', pageSlug, 'language:', editorLanguage);
      
      // FAST PATH: Load SEO data from localStorage cache FIRST for instant display
      const cachedSeoData = localStorage.getItem(`seo-data-${pageSlug}-${editorLanguage}`);
      if (cachedSeoData) {
        try {
          const cached = JSON.parse(cachedSeoData);
          console.log('[SEO Editor] Loading SEO data from cache (instant):', cached.focusKeyword);
          // Only apply cache if current data is empty (prevents overwriting fresher data)
          if (!data.focusKeyword && cached.focusKeyword) {
            onChange({
              ...data,
              focusKeyword: cached.focusKeyword || data.focusKeyword || '',
              h1: cached.h1 || data.h1 || '',
              h1Locked: cached.h1Locked ?? data.h1Locked ?? false,
              title: cached.title || data.title || '',
              metaDescription: cached.metaDescription || data.metaDescription || '',
              introduction: cached.introduction || data.introduction || ''
            });
          }
        } catch (e) {
          console.warn('[SEO Editor] Failed to parse cached SEO data');
        }
      }
      
      // FAST PATH: Load FKW analysis from localStorage cache first for instant display
      const cachedFkwAnalysis = localStorage.getItem(`seo-fkw-analysis-${pageSlug}-${editorLanguage}`);
      if (cachedFkwAnalysis) {
        try {
          const cached = JSON.parse(cachedFkwAnalysis);
          if (cached.analysis) setFkwContentAnalysis(cached.analysis);
          if (cached.score !== undefined) setFkwContentScore(cached.score);
          if (cached.recommendations) setFkwContentRecommendations(cached.recommendations);
          console.log('[SEO Editor] Loaded FKW analysis from cache (instant)');
        } catch (e) {
          console.warn('[SEO Editor] Failed to parse cached FKW analysis');
        }
      }
      
      // PARALLEL QUERIES: Load all data simultaneously for faster loading
      const [
        contentResult,
        registryResult,
        appliedLinksResult,
        appliedExternalLinksResult,
        contentSuggestionsResult,
        fkwContentResult
      ] = await Promise.all([
        // Main page content
        supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('language', editorLanguage),
        // Segment registry
        supabase
          .from('segment_registry')
          .select('*')
          .eq('page_slug', pageSlug),
        // Applied internal links
        supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_applied_internal_links')
          .eq('language', editorLanguage)
          .maybeSingle(),
        // Applied external links
        supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_applied_external_links')
          .eq('language', editorLanguage)
          .maybeSingle(),
        // Content suggestions
        supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_content_suggestions')
          .eq('language', editorLanguage)
          .maybeSingle(),
        // FKW content analysis
        supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_fkw_content_analysis')
          .eq('language', editorLanguage)
          .maybeSingle()
      ]);
      
      console.log('[SEO Editor] Parallel queries completed in', (performance.now() - startTime).toFixed(0), 'ms');
      
      let { data: contentData, error: contentError } = contentResult;
      
      console.log('[SEO Editor] Loaded content data:', contentData?.length, 'items for language:', editorLanguage);
      
      // CRITICAL FIX: If seo_settings not found in current language, load from EN fallback
      // SEO settings are typically stored in EN only
      const hasSeoInCurrentLang = contentData?.some(item => item.section_key === 'seo_settings');
      if (!hasSeoInCurrentLang && editorLanguage !== 'en') {
        console.log('[SEO Editor] SEO settings not found in current language, loading EN fallback');
        const { data: seoFallback } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_settings')
          .eq('language', 'en')
          .maybeSingle();
        
        if (seoFallback) {
          contentData = [...(contentData || []), seoFallback];
          console.log('[SEO Editor] SEO settings loaded from EN fallback');
        }
      }
      
      // CRITICAL: Also load seo_settings directly and merge with data prop if missing
      // This ensures Advanced SEO features are always loaded even if parent component fails
      const seoSettingsEntry = contentData?.find(item => item.section_key === 'seo_settings');
      if (seoSettingsEntry) {
        try {
          const savedSeoSettings = JSON.parse(seoSettingsEntry.content_value);
          console.log('[SEO Editor] Found seo_settings in DB:', savedSeoSettings);
          
          // ALWAYS merge DB values if they exist - don't rely on "missing" checks only
          // STABILITY FIX: Use explicit undefined checks instead of || to preserve values correctly
          const getVal = (dbVal: any, propVal: any, defaultVal: any) => {
            if (dbVal !== undefined && dbVal !== null) return dbVal;
            if (propVal !== undefined && propVal !== null) return propVal;
            return defaultVal;
          };
          
          const hasDbData = savedSeoSettings.focusKeyword !== undefined || 
                           savedSeoSettings.h1 !== undefined || 
                           savedSeoSettings.title !== undefined || 
                           savedSeoSettings.metaDescription !== undefined;
          
          if (hasDbData) {
            console.log('[SEO Editor] Merging SEO data from DB with stable values:', {
              focusKeyword: savedSeoSettings.focusKeyword,
              h1: savedSeoSettings.h1,
              title: savedSeoSettings.title?.substring(0, 30)
            });
            
            // Merge DB values into data, DB values take priority for SEO fields
            const mergedData = {
              ...data,
              focusKeyword: getVal(savedSeoSettings.focusKeyword, data.focusKeyword, ''),
              h1: getVal(savedSeoSettings.h1, data.h1, ''),
              h1Locked: savedSeoSettings.h1Locked !== undefined ? savedSeoSettings.h1Locked : (data.h1Locked ?? false),
              introduction: getVal(savedSeoSettings.introduction, data.introduction, ''),
              title: getVal(savedSeoSettings.title, data.title, ''),
              metaDescription: getVal(savedSeoSettings.metaDescription, data.metaDescription, ''),
              slug: getVal(savedSeoSettings.slug, data.slug, pageSlug),
              canonical: getVal(savedSeoSettings.canonical, data.canonical, ''),
              robotsIndex: getVal(savedSeoSettings.robotsIndex, data.robotsIndex, 'index'),
              robotsFollow: getVal(savedSeoSettings.robotsFollow, data.robotsFollow, 'follow'),
              ogTitle: getVal(savedSeoSettings.ogTitle, data.ogTitle, ''),
              ogDescription: getVal(savedSeoSettings.ogDescription, data.ogDescription, ''),
              ogImage: getVal(savedSeoSettings.ogImage, data.ogImage, ''),
              twitterCard: getVal(savedSeoSettings.twitterCard, data.twitterCard, 'summary_large_image')
            };
            onChange(mergedData);
            
            // Cache critical SEO data to localStorage for instant loading on next visit
            localStorage.setItem(`seo-data-${pageSlug}-${editorLanguage}`, JSON.stringify({
              focusKeyword: mergedData.focusKeyword,
              h1: mergedData.h1,
              h1Locked: mergedData.h1Locked,
              title: mergedData.title,
              metaDescription: mergedData.metaDescription,
              introduction: mergedData.introduction
            }));
            console.log('[SEO Editor] Cached SEO data to localStorage');
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse seo_settings:', e);
        }
      } else {
        console.log('[SEO Editor] No seo_settings found in DB for this page/language');
      }
      
      if (!contentError && contentData) {
        setPageContent(contentData);
        
        // Find hero image from content
        let foundHeroImage = '';
        
        // Look for full_hero image
        const fullHeroEntry = contentData.find(item => item.section_key.startsWith('full_hero_'));
        console.log('[SEO Editor] Full hero entry found:', fullHeroEntry);
        
        if (fullHeroEntry) {
          try {
            const fullHeroData = JSON.parse(fullHeroEntry.content_value);
            console.log('[SEO Editor] Parsed full hero data:', fullHeroData);
            foundHeroImage = fullHeroData.imageUrl || '';
            console.log('[SEO Editor] Extracted image URL:', foundHeroImage);
          } catch (e) {
            console.error('[SEO Editor] Failed to parse full hero data:', e);
          }
        }
        
        // Fallback: Look for other hero types
        if (!foundHeroImage) {
          const heroImageEntry = contentData.find(item => 
            item.section_key === 'hero_image_url' || 
            item.section_key === 'hero_image'
          );
          if (heroImageEntry) {
            foundHeroImage = heroImageEntry.content_value;
            console.log('[SEO Editor] Found fallback hero image:', foundHeroImage);
          }
        }
        
        console.log('[SEO Editor] Final hero image URL:', foundHeroImage);
        setHeroImageUrl(foundHeroImage);
        
        // Auto-set OG image if empty and hero image exists
        if (foundHeroImage && !data.ogImage) {
          console.log('[SEO Editor] Auto-setting OG image from hero to:', foundHeroImage);
          onChange({ ...data, ogImage: foundHeroImage });
        }
      }

      // Process segment registry result
      if (!registryResult.error && registryResult.data) {
        setSegmentRegistry(registryResult.data);
      }
      
      // Process applied internal links result
      if (!appliedLinksResult.error && appliedLinksResult.data) {
        try {
          const parsedLinks = JSON.parse(appliedLinksResult.data.content_value);
          if (Array.isArray(parsedLinks)) {
            setAppliedInternalLinks(parsedLinks);
            // Also set suggestions with applied status for display
            setInternalLinkSuggestions(parsedLinks.map((link: any) => ({
              ...link,
              applied: true,
              reason: 'Previously applied',
              priority: 0,
              contextPreview: ''
            })));
            setShowInternalLinkSuggestions(true);
            console.log('[SEO Editor] Loaded applied internal links:', parsedLinks.length);
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse applied links:', e);
        }
      }

      // Process applied external links result
      if (!appliedExternalLinksResult.error && appliedExternalLinksResult.data) {
        try {
          const parsedLinks = JSON.parse(appliedExternalLinksResult.data.content_value);
          if (Array.isArray(parsedLinks)) {
            // Set suggestions with applied status for display in Advanced tab
            setExternalLinkSuggestions(parsedLinks.map((link: any) => ({
              ...link,
              applied: true
            })));
            setShowExternalLinkSuggestions(true);
            console.log('[SEO Editor] Loaded applied external links:', parsedLinks.length);
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse applied external links:', e);
        }
      }

      // Process content suggestions result
      if (!contentSuggestionsResult.error && contentSuggestionsResult.data) {
        try {
          const parsedSuggestions = JSON.parse(contentSuggestionsResult.data.content_value);
          if (Array.isArray(parsedSuggestions)) {
            setContentLinkSuggestions(parsedSuggestions);
            setShowContentLinkSuggestions(true);
            console.log('[SEO Editor] Loaded saved content suggestions:', parsedSuggestions.length);
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse content suggestions:', e);
        }
      }

      // Process FKW content analysis result
      if (!fkwContentResult.error && fkwContentResult.data) {
        try {
          const parsed = JSON.parse(fkwContentResult.data.content_value);
          const loadedSuggestions = parsed.suggestions || [];
          const focusKw = parsed.focusKeyword || '';
          
          // If we have a focus keyword but no applied suggestions, try to detect them from segments
          if (focusKw && loadedSuggestions.filter((s: any) => s.applied).length === 0 && pageSegments.length > 0) {
            console.log('[SEO Editor] No applied suggestions found, scanning segments for FKW occurrences...');
            const detectedApplied: typeof loadedSuggestions = [];
            const fkwLower = focusKw.toLowerCase();
            
            for (const seg of pageSegments) {
              const segId = parseInt(seg.id);
              const segType = seg.type;
              const segData = seg.data || {};
              
              // Check intro segment
              if (segType === 'intro') {
                if (segData.headline && segData.headline.toLowerCase().includes(fkwLower)) {
                  detectedApplied.push({
                    suggestionType: 'heading',
                    headingLevel: 'h2',
                    currentText: '(detected)',
                    suggestedText: segData.headline,
                    segmentKey: `segment-${segId}`,
                    segmentId: segId,
                    segmentType: segType,
                    fieldPath: 'headline',
                    reason: 'Focus keyword detected in H2 headline',
                    priority: 1,
                    applied: true
                  });
                }
                if (segData.introText) {
                  const cleanText = segData.introText.replace(/<[^>]*>/g, '');
                  if (cleanText.toLowerCase().includes(fkwLower)) {
                    detectedApplied.push({
                      suggestionType: 'body',
                      currentText: '(detected)',
                      suggestedText: cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : ''),
                      segmentKey: `segment-${segId}`,
                      segmentId: segId,
                      segmentType: segType,
                      fieldPath: 'introText',
                      reason: 'Focus keyword detected in intro text',
                      priority: 2,
                      applied: true
                    });
                  }
                }
              }
              
              // Check image-text segments
              if (segType === 'image-text' && segData.items) {
                for (let i = 0; i < segData.items.length; i++) {
                  const item = segData.items[i];
                  if (item.title && item.title.toLowerCase().includes(fkwLower)) {
                    detectedApplied.push({
                      suggestionType: 'heading',
                      headingLevel: 'h2',
                      currentText: '(detected)',
                      suggestedText: item.title,
                      segmentKey: `segment-${segId}`,
                      segmentId: segId,
                      segmentType: segType,
                      fieldPath: `items[${i}].title`,
                      reason: 'Focus keyword detected in image-text title',
                      priority: 3,
                      applied: true
                    });
                  }
                  if (item.description) {
                    const cleanDesc = item.description.replace(/<[^>]*>/g, '');
                    if (cleanDesc.toLowerCase().includes(fkwLower)) {
                      detectedApplied.push({
                        suggestionType: 'body',
                        currentText: '(detected)',
                        suggestedText: cleanDesc.substring(0, 150) + (cleanDesc.length > 150 ? '...' : ''),
                        segmentKey: `segment-${segId}`,
                        segmentId: segId,
                        segmentType: segType,
                        fieldPath: `items[${i}].description`,
                        reason: 'Focus keyword detected in description',
                        priority: 4,
                        applied: true
                      });
                    }
                  }
                }
              }
            }
            
            if (detectedApplied.length > 0) {
              // De-duplicate detected suggestions (same segmentId + fieldPath)
              const uniqueDetected = detectedApplied.filter((s, idx, arr) => 
                arr.findIndex(x => x.segmentId === s.segmentId && x.fieldPath === s.fieldPath) === idx
              );
              console.log('[SEO Editor] Detected', uniqueDetected.length, 'unique FKW occurrences in segments');
              setFkwContentSuggestions(uniqueDetected);
              setShowFkwContentSuggestions(true);
            }
          } else if (loadedSuggestions.length > 0) {
            // De-duplicate loaded suggestions as well
            const uniqueLoaded = loadedSuggestions.filter((s: any, idx: number, arr: any[]) => 
              arr.findIndex(x => x.segmentId === s.segmentId && x.fieldPath === s.fieldPath) === idx
            );
            setFkwContentSuggestions(uniqueLoaded);
            setShowFkwContentSuggestions(true);
          }
          
          if (parsed.analysis) {
            setFkwContentAnalysis(parsed.analysis);
            // Update localStorage cache
            localStorage.setItem(`seo-fkw-analysis-${pageSlug}-${editorLanguage}`, JSON.stringify(parsed));
          }
          if (parsed.score !== undefined) {
            setFkwContentScore(parsed.score);
          }
          if (parsed.recommendations) {
            setFkwContentRecommendations(parsed.recommendations);
          }
          console.log('[SEO Editor] Loaded FKW content analysis from DB:', parsed);
        } catch (e) {
          console.error('[SEO Editor] Failed to parse FKW content analysis:', e);
        }
      }
      
      console.log('[SEO Editor] Total load time:', (performance.now() - startTime).toFixed(0), 'ms');
    };
    
    loadPageData();
  }, [pageSlug, editorLanguage]);

  // Load redirects for this page
  useEffect(() => {
    const loadRedirects = async () => {
      // Build possible target URLs for this page
      const possibleTargets = [
        `/${editorLanguage}/${pageSlug}`,
        `/${pageSlug}`,
        pageSlug,
      ];
      
      const { data: redirectData, error } = await supabase
        .from('redirects')
        .select('id, source_url, target_url, redirect_type, notes')
        .or(possibleTargets.map(t => `target_url.eq.${t}`).join(','));
      
      if (!error && redirectData) {
        setPageRedirects(redirectData);
      }
    };
    
    loadRedirects();
  }, [pageSlug, editorLanguage, isRedirectManagerOpen]);

  // AUTO-CALCULATE FKW ANALYSIS on page load if focusKeyword exists but no analysis data
  // This ensures the FKW Content Optimizer overview is always displayed after reload
  useEffect(() => {
    const autoCalculateFkwAnalysis = async () => {
      // Only run if we have a focus keyword but no analysis yet
      if (!data.focusKeyword || fkwContentAnalysis) return;
      
      // Get page_segments from pageContent
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      if (!pageSegmentsEntry) return;
      
      try {
        const segments = JSON.parse(pageSegmentsEntry.content_value);
        if (!segments || segments.length === 0) return;
        
        console.log('[SEO Editor] Auto-calculating FKW analysis on page load...');
        const newAnalysis = await recalculateFkwAnalysis(segments, data.focusKeyword);
        setFkwContentAnalysis(newAnalysis);
        
        // Generate recommendations based on analysis
        const recommendations: string[] = [];
        const actualH1HasFkw = !!(data.h1 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()));
        
        if (actualH1HasFkw) {
          recommendations.push('✓ H1 enthält das Focus Keyword');
        } else {
          recommendations.push('✗ H1: Füge das Focus Keyword zur H1-Überschrift hinzu (+25 Punkte)');
        }
        
        if (newAnalysis.introHasFkw) {
          recommendations.push('✓ Introduction enthält das Focus Keyword');
        } else {
          recommendations.push('✗ Introduction: Platziere das Focus Keyword im ersten Absatz (+20 Punkte)');
        }
        
        if (newAnalysis.h2WithFkw > 0) {
          recommendations.push(`✓ ${newAnalysis.h2WithFkw}/${newAnalysis.h2Count} H2-Überschriften enthalten das FKW`);
        } else if (newAnalysis.h2Count > 0) {
          recommendations.push(`○ H2: Integriere das FKW in mindestens eine H2-Überschrift (+15 Punkte)`);
        }
        
        if (newAnalysis.densityStatus === 'optimal') {
          recommendations.push(`✓ Keyword-Dichte optimal: ${newAnalysis.fkwDensity.toFixed(2)}%`);
        } else if (newAnalysis.densityStatus === 'too_low') {
          recommendations.push(`○ Keyword-Dichte zu niedrig: ${newAnalysis.fkwDensity.toFixed(2)}% (Ideal: 0.5% – 2.0%)`);
        } else {
          recommendations.push(`✗ Keyword-Dichte zu hoch: ${newAnalysis.fkwDensity.toFixed(2)}% (Ideal: 0.5% – 2.0%) – Entferne einige Keywords`);
        }
        
        if (newAnalysis.h3WithFkw > 0) {
          recommendations.push(`✓ ${newAnalysis.h3WithFkw}/${newAnalysis.h3Count} H3-Überschriften enthalten das FKW`);
        } else if (newAnalysis.h3Count > 0) {
          recommendations.push(`– H3: Optional - integriere das FKW in H3-Überschriften (+10 Punkte)`);
        }
        
        setFkwContentRecommendations(recommendations);
        
        // Calculate score
        let calculatedScore = 0;
        if (actualH1HasFkw) calculatedScore += 25;
        if (newAnalysis.introHasFkw) calculatedScore += 20;
        if (newAnalysis.h2WithFkw > 0) calculatedScore += 15;
        if (newAnalysis.h2Count > 0 && newAnalysis.h2WithFkw >= Math.ceil(newAnalysis.h2Count / 2)) calculatedScore += 10;
        if (newAnalysis.densityStatus === 'optimal') calculatedScore += 20;
        else if (newAnalysis.densityStatus === 'too_low' && newAnalysis.fkwDensity >= 0.3) calculatedScore += 10;
        if (newAnalysis.h3WithFkw > 0) calculatedScore += 10;
        calculatedScore = Math.min(100, calculatedScore);
        setFkwContentScore(calculatedScore);
        
        // Cache to localStorage for instant loading on next page visit
        const cacheData = {
          analysis: newAnalysis,
          score: calculatedScore,
          recommendations: recommendations
        };
        localStorage.setItem(`seo-fkw-analysis-${pageSlug}-${editorLanguage}`, JSON.stringify(cacheData));
        
        console.log('[SEO Editor] Auto-calculated FKW analysis:', newAnalysis, 'Score:', calculatedScore);
      } catch (e) {
        console.error('[SEO Editor] Failed to auto-calculate FKW analysis:', e);
      }
    };
    
    autoCalculateFkwAnalysis();
  }, [data.focusKeyword, data.h1, pageContent, fkwContentAnalysis]);

  useEffect(() => {
    const titleLength = (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60;
    const descriptionLength = (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160;
    
    const keyword = data.focusKeyword?.toLowerCase() || '';
    const keywordInTitle = keyword ? (data.title?.toLowerCase().includes(keyword) || false) : false;
    const keywordInDescription = keyword ? (data.metaDescription?.toLowerCase().includes(keyword) || false) : false;
    const keywordInSlug = keyword ? (data.slug?.toLowerCase().includes(keyword.replace(/\s+/g, '-')) || false) : false;

    // Check for keyword in introduction (ONLY from tiles or image-text segments that are NOT deleted)
    let keywordInIntroduction = false;
    let introTitle = '';
    let introDescription = '';
    
    // Check if tiles, image-text or intro segment exists and is NOT deleted
    const tilesRegistry = segmentRegistry.find(seg => seg.segment_type === 'tiles' && !seg.deleted);
    const imageTextRegistry = segmentRegistry.find(seg => seg.segment_type === 'image-text' && !seg.deleted);
    
    // CRITICAL FIX: For intro, find segment that actually exists in page_segments
    // The segment_registry may have orphaned entries that don't exist in page_segments
    let validIntroRegistry = null;
    const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
    if (pageSegmentsEntry) {
      try {
        const segments = JSON.parse(pageSegmentsEntry.content_value);
        const introSegmentIds = segments.filter((s: any) => s.type === 'intro').map((s: any) => String(s.id));
        
        // Find first registry entry that exists in page_segments
        validIntroRegistry = segmentRegistry.find(seg => 
          seg.segment_type === 'intro' && 
          !seg.deleted && 
          introSegmentIds.includes(String(seg.segment_id))
        );
        
        console.log('[SEO Editor] Valid intro registry found:', validIntroRegistry?.segment_id, 'from page_segments IDs:', introSegmentIds);
      } catch (e) {
        console.error('[SEO Editor] Failed to parse page_segments for intro validation:', e);
      }
    }
    
    console.log('[SEO Editor] Segment Registry Check:', {
      pageSlug,
      segmentRegistryLength: segmentRegistry.length,
      tilesRegistry,
      imageTextRegistry,
      validIntroRegistry,
      pageContentLength: pageContent.length
    });
    
    // Priority: Intro > Tiles > Image-Text (but only if NOT deleted AND exists in page_segments)
    let activeSegmentType = null;
    let activeSegmentKey = null;
    
    if (validIntroRegistry) {
      activeSegmentType = 'intro';
      activeSegmentKey = validIntroRegistry.segment_key;
      console.log('[SEO Editor] Using INTRO segment:', { activeSegmentKey, id: validIntroRegistry.segment_id });
    } else if (tilesRegistry) {
      activeSegmentType = 'tiles';
      activeSegmentKey = tilesRegistry.segment_key;
      console.log('[SEO Editor] Using TILES segment:', { activeSegmentKey });
    } else if (imageTextRegistry) {
      activeSegmentType = 'image-text';
      activeSegmentKey = imageTextRegistry.segment_key;
      console.log('[SEO Editor] Using IMAGE-TEXT segment:', { activeSegmentKey });
    }
    
    console.log('[SEO Editor] Active segment determined:', { activeSegmentType, activeSegmentKey });
    
    // Determine H1 heading dynamically with priority
    // Priority: 1. Intro Title > 2. Full Hero > 3. Product Hero Gallery > 4. Product Hero (hero) > 5. Action Hero
    let autoH1 = '';
    let h1Source: { type: string; key: string; id: string | number; label: string } | null = null;
    
    // 1. Check Intro segment first (highest priority) - ONLY if headingLevel is 'h1'
    // IMPORTANT: Intro segments are stored INSIDE page_segments JSON array, NOT as separate section_keys
    // CRITICAL: Search ALL intro segments in registry and find matching one in page_segments with h1
    const allIntroRegistries = segmentRegistry.filter(seg => seg.segment_type === 'intro' && !seg.deleted);
    
    if (allIntroRegistries.length > 0) {
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      if (pageSegmentsEntry) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          
          // Search for ANY intro in page_segments that matches ANY registry entry AND has headingLevel 'h1'
          for (const registryEntry of allIntroRegistries) {
            const introSegment = segments.find((seg: any) => 
              seg.type === 'intro' && String(seg.id) === String(registryEntry.segment_id)
            );
            
            if (introSegment?.data) {
              // Support both field variants: title (standard) and headline (Content Automation)
              const introTitle = introSegment.data.title || introSegment.data.headline || '';
              const introHeadingLevel = introSegment.data.headingLevel || 'h2';
              
              // ONLY use Intro as H1 source if it has headingLevel: 'h1'
              if (introTitle && introHeadingLevel === 'h1') {
                autoH1 = introTitle;
                h1Source = {
                  type: 'intro',
                  key: registryEntry.segment_key,
                  id: registryEntry.segment_id,
                  label: 'Intro'
                };
                console.log('[SEO Editor] H1 from Intro title (headingLevel=h1):', autoH1, '(segment_id:', registryEntry.segment_id, ')');
                break; // Found a valid H1, stop searching
              } else {
                console.log('[SEO Editor] Intro segment', registryEntry.segment_id, 'has headingLevel:', introHeadingLevel, '- skipping for H1');
              }
            }
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse page_segments for intro H1:', e);
        }
      }
    }
    
    // 2. Check Full Hero segment
    if (!autoH1) {
      const fullHeroEntry = pageContent.find(item => item.section_key.startsWith('full_hero_'));
      if (fullHeroEntry) {
        try {
          const fullHeroData = JSON.parse(fullHeroEntry.content_value);
          const titleLine1 = fullHeroData.titleLine1 || '';
          const titleLine2 = fullHeroData.titleLine2 || '';
          const combinedTitle = [titleLine1, titleLine2].filter(Boolean).join(' ');
          if (combinedTitle) {
            autoH1 = combinedTitle;
            const segmentKey = fullHeroEntry.section_key;
            const segmentId = segmentKey.replace('full_hero_', '');
            h1Source = {
              type: 'full-hero',
              key: segmentKey,
              id: segmentId,
              label: 'Full Hero'
            };
            console.log('[SEO Editor] H1 from Full Hero titles:', autoH1);
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse full hero for H1:', e);
        }
      }
    }
    
    // 3. Check Product Hero Gallery segment
    // IMPORTANT: Product Hero Gallery stores data INSIDE page_segments JSON array
    // CRITICAL: Search ALL product-hero-gallery segments in registry and find matching one in page_segments
    if (!autoH1) {
      const allPhgRegistries = segmentRegistry.filter(seg => seg.segment_type === 'product-hero-gallery' && !seg.deleted);
      
      if (allPhgRegistries.length > 0) {
        // First try page_segments array (where Content Automation stores data)
        const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
        if (pageSegmentsEntry) {
          try {
            const segments = JSON.parse(pageSegmentsEntry.content_value);
            
            // Search for ANY PHG in page_segments that matches ANY registry entry
            for (const registryEntry of allPhgRegistries) {
              const phgSegment = segments.find((seg: any) => 
                seg.type === 'product-hero-gallery' && String(seg.id) === String(registryEntry.segment_id)
              );
              if (phgSegment?.data) {
                const title = phgSegment.data.title || '';
                const subtitle = phgSegment.data.subtitle || '';
                const combinedTitle = [title, subtitle].filter(Boolean).join(' ');
                if (combinedTitle) {
                  autoH1 = combinedTitle;
                  h1Source = {
                    type: 'product-hero-gallery',
                    key: registryEntry.segment_key,
                    id: registryEntry.segment_id,
                    label: 'Product Hero Gallery'
                  };
                  console.log('[SEO Editor] H1 from Product Hero Gallery (page_segments):', autoH1, '(segment_id:', registryEntry.segment_id, ')');
                  break;
                }
              }
            }
          } catch (e) {
            console.error('[SEO Editor] Failed to parse page_segments for PHG H1:', e);
          }
        }
        
        // Fallback: check individual section_key (legacy storage)
        if (!autoH1) {
          for (const registryEntry of allPhgRegistries) {
            const phgContent = pageContent.find(item => item.section_key === registryEntry.segment_key);
            if (phgContent) {
              try {
                const phgData = JSON.parse(phgContent.content_value);
                const title = phgData.title || '';
                const subtitle = phgData.subtitle || '';
                const combinedTitle = [title, subtitle].filter(Boolean).join(' ');
                if (combinedTitle) {
                  autoH1 = combinedTitle;
                  h1Source = {
                    type: 'product-hero-gallery',
                    key: registryEntry.segment_key,
                    id: registryEntry.segment_id,
                    label: 'Product Hero Gallery'
                  };
                  console.log('[SEO Editor] H1 from Product Hero Gallery (legacy section_key):', autoH1);
                  break;
                }
              } catch (e) {
                console.error('[SEO Editor] Failed to parse product hero gallery for H1:', e);
              }
            }
          }
        }
      }
    }
    
    // 4. Check Product Hero segment (supports both 'hero' and 'product-hero' segment types)
    // Content Automation uses 'product-hero', legacy uses 'hero'
    // CRITICAL: Search ALL product-hero segments in registry and find matching one in page_segments
    if (!autoH1) {
      // Get ALL product hero entries from registry (there might be multiple from different imports)
      const allProductHeroRegistries = segmentRegistry.filter(seg => 
        (seg.segment_type === 'hero' || seg.segment_type === 'product-hero') && !seg.deleted
      );
      
      console.log('[SEO Editor] Looking for Product Hero, found registry entries:', allProductHeroRegistries.length);
      
      if (allProductHeroRegistries.length > 0) {
        // Product Hero stores data in page_segments JSON, not in individual section_keys
        const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
        if (pageSegmentsEntry) {
          try {
            const segments = JSON.parse(pageSegmentsEntry.content_value);
            
            // Search for ANY product hero in page_segments that matches ANY registry entry
            for (const registryEntry of allProductHeroRegistries) {
              const heroSegment = segments.find((seg: any) => 
                (seg.type === 'hero' || seg.type === 'product-hero') && 
                String(seg.id) === String(registryEntry.segment_id)
              );
              
              if (heroSegment?.data) {
                // Support both field naming conventions:
                // - Content Automation uses: title, subtitle
                // - Legacy uses: hero_title, hero_subtitle
                const title = heroSegment.data.title || heroSegment.data.hero_title || '';
                const subtitle = heroSegment.data.subtitle || heroSegment.data.hero_subtitle || '';
                const combinedTitle = [title, subtitle].filter(Boolean).join(' ');
                if (combinedTitle) {
                  autoH1 = combinedTitle;
                  h1Source = {
                    type: registryEntry.segment_type,
                    key: registryEntry.segment_key,
                    id: registryEntry.segment_id,
                    label: 'Product Hero'
                  };
                  console.log('[SEO Editor] H1 from Product Hero:', autoH1, '(segment_type:', registryEntry.segment_type, ', segment_id:', registryEntry.segment_id, ')');
                  break; // Found a valid H1, stop searching
                }
              }
            }
          } catch (e) {
            console.error('[SEO Editor] Failed to parse product hero for H1:', e);
          }
        }
      }
    }
    
    // 5. Check Action Hero segment
    if (!autoH1) {
      const actionHeroRegistry = segmentRegistry.find(seg => seg.segment_type === 'action-hero' && !seg.deleted);
      if (actionHeroRegistry) {
        const actionHeroContent = pageContent.find(item => item.section_key === actionHeroRegistry.segment_key);
        if (actionHeroContent) {
          try {
            const actionHeroData = JSON.parse(actionHeroContent.content_value);
            if (actionHeroData.title) {
              autoH1 = actionHeroData.title;
              h1Source = {
                type: 'action-hero',
                key: actionHeroRegistry.segment_key,
                id: actionHeroRegistry.segment_id,
                label: 'Action Hero'
              };
              console.log('[SEO Editor] H1 from Action Hero:', autoH1);
            }
          } catch (e) {
            console.error('[SEO Editor] Failed to parse action hero for H1:', e);
          }
        }
      }
    }
    
    // Store H1 source for display
    setH1SourceInfo(h1Source);
    
    // Update H1 field - BUT ONLY if h1 is not locked (manually set via Smart H1)
    // If h1Locked is true, keep the saved optimized H1 and don't auto-detect
    if (!data.h1Locked && data.h1 !== autoH1) {
      console.log('[SEO Editor] Updating H1 to:', autoH1 || '(empty)', '(auto-detected)');
      onChange({ ...data, h1: autoH1 });
    } else if (data.h1Locked) {
      console.log('[SEO Editor] H1 is locked (manually set), keeping:', data.h1);
    }
    
    // Check if keyword is in H1
    const keywordInH1 = keyword && autoH1 ? autoH1.toLowerCase().includes(keyword) : false;
    // Check if H1 is actually present
    const hasH1 = !!autoH1;
    console.log('[SEO Editor] H1 Detection Result:', {
      keyword,
      autoH1: autoH1 || '(none)',
      keywordInH1,
      hasH1,
      hasFocusKeyword: !!data.focusKeyword
    });
    
    // If we found an active segment, get its content for Introduction
    if (activeSegmentType && activeSegmentKey) {
      if (activeSegmentType === 'intro') {
        // For intro: ONLY use description (no title) - highest priority
        // IMPORTANT: Intro segments are stored INSIDE page_segments JSON array, NOT as separate section_keys
        const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
        
        console.log('[SEO Editor] Looking for intro content in page_segments');
        
        if (pageSegmentsEntry) {
          try {
            const segments = JSON.parse(pageSegmentsEntry.content_value);
            
            // CRITICAL FIX: Find ALL intro segments that exist in page_segments
            // and match them with non-deleted registry entries
            // This prevents issues where registry has orphaned entries
            const allIntroRegistryIds = segmentRegistry
              .filter(seg => seg.segment_type === 'intro' && !seg.deleted)
              .map(seg => String(seg.segment_id));
            
            // Find first intro segment that exists in BOTH page_segments AND registry (not deleted)
            let introSegment = null;
            for (const seg of segments) {
              if (seg.type === 'intro' && allIntroRegistryIds.includes(String(seg.id))) {
                introSegment = seg;
                console.log('[SEO Editor] Found matching intro segment:', seg.id);
                break;
              }
            }
            
            // Fallback: if no registry match, use first intro from page_segments
            if (!introSegment) {
              introSegment = segments.find((seg: any) => seg.type === 'intro');
              if (introSegment) {
                console.log('[SEO Editor] Using fallback intro segment from page_segments:', introSegment.id);
              }
            }
            
            console.log('[SEO Editor] Found intro segment in page_segments:', introSegment);
            
            if (introSegment?.data) {
              introTitle = ''; // Never use title for Intro segment in Introduction display
              // Support both 'description' and 'introText' field names
              introDescription = introSegment.data.description || introSegment.data.introText || '';
              // Strip HTML tags for clean SEO text
              introDescription = introDescription.replace(/<[^>]*>/g, '').trim();
              console.log('[SEO Editor] Extracted intro description from page_segments:', introDescription);
            }
          } catch (e) {
            console.error('[SEO Editor] Failed to parse page_segments for intro:', e);
          }
        } else {
          console.warn('[SEO Editor] No page_segments found for page:', pageSlug);
        }
      } else if (activeSegmentType === 'tiles') {
        // For tiles, look for applications_title/description in page_content
        const staticTilesTitle = pageContent.find(item => item.section_key === 'applications_title');
        const staticTilesDesc = pageContent.find(item => item.section_key === 'applications_description');
        
        introTitle = staticTilesTitle?.content_value || '';
        introDescription = staticTilesDesc?.content_value || '';
      } else if (activeSegmentType === 'image-text') {
        // For image-text, look for segment-specific title/description
        const titleKey = `${activeSegmentKey}_title`;
        const descKey = `${activeSegmentKey}_description`;
        
        const imageTextTitle = pageContent.find(item => item.section_key === titleKey);
        const imageTextDesc = pageContent.find(item => item.section_key === descKey);
        
        introTitle = imageTextTitle?.content_value || '';
        introDescription = imageTextDesc?.content_value || '';
      }
      
      // Check for keyword
      if (keyword && (introTitle || introDescription)) {
        const titleLower = introTitle.toLowerCase();
        const descLower = introDescription.toLowerCase();
        keywordInIntroduction = titleLower.includes(keyword) || descLower.includes(keyword);
      }
    }
    
    // Set intro source info for display
    if (activeSegmentType && activeSegmentKey) {
      const activeRegistry = activeSegmentType === 'intro' ? validIntroRegistry 
        : activeSegmentType === 'tiles' ? tilesRegistry 
        : imageTextRegistry;
      
      const labelMap: Record<string, string> = {
        'intro': 'Intro',
        'tiles': 'Tiles',
        'image-text': 'Image-Text'
      };
      
      setIntroSourceInfo({
        type: activeSegmentType,
        key: activeSegmentKey,
        id: activeRegistry?.segment_id || '',
        label: labelMap[activeSegmentType] || activeSegmentType
      });
    } else {
      setIntroSourceInfo(null);
    }
    
    setIntroductionText({ title: introTitle, description: introDescription });
    
    // Always sync introduction field with segment content (only if changed to avoid infinite loop)
    // If no active segments found, clear the introduction
    const combinedIntroText = [introTitle, introDescription].filter(Boolean).join('\n\n');
    console.log('[SEO Editor] Introduction sync:', {
      pageSlug,
      activeSegmentType,
      activeSegmentKey,
      introTitle,
      introDescription,
      combinedIntroText,
      currentIntroduction: data.introduction,
      shouldUpdate: data.introduction !== combinedIntroText
    });
    
    // Update introduction field if it differs (including clearing it if no segments found)
    if (data.introduction !== combinedIntroText) {
      console.log('[SEO Editor] Updating introduction field with:', combinedIntroText || '(empty)');
      onChange({ ...data, introduction: combinedIntroText });
    }

    // Check for internal and external links in page content
    let hasInternalLinks = false;
    let hasExternalLinks = false;
    
    // Scan all page content for links
    pageContent.forEach(item => {
      const content = item.content_value || '';
      // Check for internal links:
      // 1. Relative paths (href="/...", href="./...", href="#...")
      // 2. Smart Internal Links with class="internal-link"
      // 3. Links to same domain (href="https://domain.com/...")
      if (
        content.includes('href="/') || 
        content.includes('href="./') || 
        content.includes('href="#') ||
        content.includes('class="internal-link"') ||
        content.includes("class='internal-link'")
      ) {
        hasInternalLinks = true;
      }
      // Check for external links (http/https) - but exclude internal-link class
      const externalLinkPattern = /href=["'](https?:\/\/(?!localhost)[^"']+)["']/gi;
      if (externalLinkPattern.test(content)) {
        // Re-check without the internal-link exclusion for external links with class
        if (content.includes('class="external-link"') || content.includes("class='external-link'") || !content.includes('internal-link')) {
          hasExternalLinks = true;
        }
      }
    });

    // Extract internal links with details for display in Basics tab
    const extractedLinks: Array<{
      anchorText: string;
      targetUrl: string;
      segmentKey: string;
      segmentId?: number | null;
      segmentType?: string;
    }> = [];
    
    pageContent.forEach(item => {
      const content = item.content_value || '';
      // Match all anchor tags with internal-link class or relative hrefs
      const linkPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
      let match;
      while ((match = linkPattern.exec(content)) !== null) {
        const href = match[1];
        const text = match[2];
        const fullMatch = match[0]; // Get full <a> tag to check for class
        // Only include internal links: relative paths OR has internal-link class
        // Exclude external http/https links explicitly
        const isExternalUrl = href.startsWith('http://') || href.startsWith('https://');
        const isInternalPath = href.startsWith('/') || href.startsWith('./') || href.startsWith('#');
        const hasInternalLinkClass = fullMatch.includes('internal-link');
        
        if (isInternalPath || (hasInternalLinkClass && !isExternalUrl)) {
          // Find segment info from registry
          const segmentMatch = item.section_key.match(/segment-(\d+)/);
          const segmentId = segmentMatch ? parseInt(segmentMatch[1]) : null;
          const segmentInfo = segmentId ? segmentRegistry.find(s => s.segment_id === segmentId) : null;
          
          extractedLinks.push({
            anchorText: text.trim() || href,
            targetUrl: href,
            segmentKey: item.section_key,
            segmentId: segmentId,
            segmentType: segmentInfo?.segment_type || 'unknown'
          });
        }
      }
      
      // Also check page_segments JSON for links
      if (item.section_key === 'page_segments') {
        try {
          const segments = JSON.parse(content);
          segments.forEach((seg: any) => {
            const checkField = (fieldValue: string, fieldName: string) => {
              if (!fieldValue || typeof fieldValue !== 'string') return;
              let fieldMatch;
              const fieldPattern = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
              while ((fieldMatch = fieldPattern.exec(fieldValue)) !== null) {
                const href = fieldMatch[1];
                const text = fieldMatch[2];
                const fullTag = fieldMatch[0];
                // Only include internal links: relative paths OR has internal-link class
                // Exclude external http/https links explicitly
                const isExternalUrl = href.startsWith('http://') || href.startsWith('https://');
                const isInternalPath = href.startsWith('/') || href.startsWith('./') || href.startsWith('#');
                const hasInternalLinkClass = fullTag.includes('internal-link');
                
                if (isInternalPath || (hasInternalLinkClass && !isExternalUrl)) {
                  extractedLinks.push({
                    anchorText: text.trim() || href,
                    targetUrl: href,
                    segmentKey: `segment-${seg.id}`,
                    segmentId: seg.id,
                    segmentType: seg.type || 'unknown'
                  });
                }
              }
            };
            // Check common text fields - include all possible text fields
            if (seg.data) {
              checkField(seg.data.description, 'description');
              checkField(seg.data.text, 'text');
              checkField(seg.data.content, 'content');
              checkField(seg.data.introText, 'introText');
              checkField(seg.data.subtitle, 'subtitle');
              checkField(seg.data.cta_description, 'cta_description');
              checkField(seg.data.button_text, 'button_text');
              // Check tiles array for links
              if (Array.isArray(seg.data.tiles)) {
                seg.data.tiles.forEach((tile: any, tileIdx: number) => {
                  if (tile.description) checkField(tile.description, `tiles[${tileIdx}].description`);
                  if (tile.text) checkField(tile.text, `tiles[${tileIdx}].text`);
                });
              }
              // Check items array for links
              if (Array.isArray(seg.data.items)) {
                seg.data.items.forEach((item: any, itemIdx: number) => {
                  if (item.description) checkField(item.description, `items[${itemIdx}].description`);
                  if (item.text) checkField(item.text, `items[${itemIdx}].text`);
                });
              }
            }
          });
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
    
    setExtractedInternalLinks(extractedLinks);
    
    // Extract external links with details for display in Basics tab
    const extractedExtLinks: Array<{
      anchorText: string;
      targetUrl: string;
      segmentKey: string;
      segmentId?: number | null;
      segmentType?: string;
      targetTitle?: string;
    }> = [];
    
    pageContent.forEach(item => {
      const content = item.content_value || '';
      // Match all anchor tags with external-link class or absolute http/https hrefs
      const linkPattern = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]*)<\/a>/gi;
      let match;
      while ((match = linkPattern.exec(content)) !== null) {
        const href = match[1];
        const text = match[2];
        // Only include external links (exclude localhost)
        if (!href.includes('localhost')) {
          const segmentMatch = item.section_key.match(/segment-(\d+)/);
          const segmentId = segmentMatch ? parseInt(segmentMatch[1]) : null;
          const segmentInfo = segmentId ? segmentRegistry.find(s => s.segment_id === segmentId) : null;
          
          // Try to get domain name as title hint
          let domainTitle = '';
          try {
            const url = new URL(href);
            domainTitle = url.hostname.replace('www.', '');
          } catch {}
          
          extractedExtLinks.push({
            anchorText: text.trim() || href,
            targetUrl: href,
            segmentKey: item.section_key,
            segmentId: segmentId,
            segmentType: segmentInfo?.segment_type || 'unknown',
            targetTitle: domainTitle
          });
        }
      }
      
      // Also check page_segments JSON for external links
      if (item.section_key === 'page_segments') {
        try {
          const segments = JSON.parse(content);
          segments.forEach((seg: any) => {
            const checkExtField = (fieldValue: string) => {
              if (!fieldValue || typeof fieldValue !== 'string') return;
              let fieldMatch;
              const fieldPattern = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([^<]*)<\/a>/gi;
              while ((fieldMatch = fieldPattern.exec(fieldValue)) !== null) {
                const href = fieldMatch[1];
                const text = fieldMatch[2];
                if (!href.includes('localhost')) {
                  let domainTitle = '';
                  try {
                    const url = new URL(href);
                    domainTitle = url.hostname.replace('www.', '');
                  } catch {}
                  
                  extractedExtLinks.push({
                    anchorText: text.trim() || href,
                    targetUrl: href,
                    segmentKey: `segment-${seg.id}`,
                    segmentId: seg.id,
                    segmentType: seg.type || 'unknown',
                    targetTitle: domainTitle
                  });
                }
              }
            };
            if (seg.data) {
              checkExtField(seg.data.description);
              checkExtField(seg.data.text);
              checkExtField(seg.data.content);
              checkExtField(seg.data.introText);
              checkExtField(seg.data.subtitle);
              if (Array.isArray(seg.data.items)) {
                seg.data.items.forEach((itm: any) => {
                  if (itm.description) checkExtField(itm.description);
                  if (itm.text) checkExtField(itm.text);
                });
              }
            }
          });
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
    
    setExtractedExternalLinks(extractedExtLinks);
    
    // IMPORTANT: Use extractedLinks for hasInternalLinks check - this is more reliable
    // than string pattern matching since it parses the actual link structure
    const finalHasInternalLinks = hasInternalLinks || extractedLinks.length > 0;
    
    // Use extractedExtLinks for hasExternalLinks check as well
    const finalHasExternalLinks = hasExternalLinks || extractedExtLinks.length > 0;

    setChecks({
      titleLength,
      descriptionLength,
      hasH1,
      hasInternalLinks: finalHasInternalLinks,
      hasExternalLinks: finalHasExternalLinks,
      keywordInTitle,
      keywordInDescription,
      keywordInSlug,
      keywordInIntroduction,
      keywordInH1,
    });
    
    console.log('[SEO Editor] Final checks state:', {
      keywordInH1,
      keywordInTitle,
      keywordInDescription,
      keywordInSlug,
      keywordInIntroduction,
      hasInternalLinks: finalHasInternalLinks,
      extractedLinksCount: extractedLinks.length,
      hasExternalLinks: finalHasExternalLinks,
      extractedExtLinksCount: extractedExtLinks.length,
      hasH1
    });
  }, [data, pageSegments, pageContent, segmentRegistry]);

  const handleChange = (field: keyof SEOData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Generate Smart Focus Keywords using AI
  const handleGenerateFocusKeywords = async () => {
    setIsGeneratingKeywords(true);
    setKeywordSuggestions([]);
    setShowKeywordSuggestions(false);

    try {
      const pageData = {
        title: data.title,
        metaDescription: data.metaDescription,
        h1: data.h1,
        introduction: data.introduction,
        slug: data.slug,
        pageSlug: pageSlug,
      };

      console.log('[SEO Editor] Generating focus keywords with data:', pageData);

      const { data: result, error } = await supabase.functions.invoke('generate-focus-keyword', {
        body: { pageData }
      });

      if (error) {
        console.error('[SEO Editor] Error generating keywords:', error);
        toast.error('Error generating keywords: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.keywords && Array.isArray(result.keywords)) {
        console.log('[SEO Editor] Generated keywords:', result.keywords);
        setKeywordSuggestions(result.keywords);
        setShowKeywordSuggestions(true);
        toast.success(`${result.keywords.length} keyword suggestions generated`);
      } else {
        toast.error('No keywords generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating keywords');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    handleChange('focusKeyword', keyword);
    setShowKeywordSuggestions(false);
    toast.success(`Focus Keyword "${keyword}" selected`);
  };

  // Generate Smart SEO Titles using AI
  const handleGenerateSEOTitles = async () => {
    setIsGeneratingTitle(true);
    setTitleSuggestions([]);
    setShowTitleSuggestions(false);

    try {
      const pageData = {
        title: data.title,
        metaDescription: data.metaDescription,
        h1: data.h1,
        introduction: data.introduction,
        slug: data.slug,
        pageSlug: pageSlug,
      };

      console.log('[SEO Editor] Generating SEO titles with data:', pageData);

      const { data: result, error } = await supabase.functions.invoke('generate-seo-title', {
        body: { 
          pageData,
          focusKeyword: data.focusKeyword
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating titles:', error);
        toast.error('Error generating titles: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.titles && Array.isArray(result.titles)) {
        console.log('[SEO Editor] Generated titles:', result.titles);
        setTitleSuggestions(result.titles);
        setShowTitleSuggestions(true);
        toast.success(`${result.titles.length} title suggestions generated`);
      } else {
        toast.error('No titles generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating titles');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleSelectTitle = (title: string) => {
    handleChange('title', title);
    setShowTitleSuggestions(false);
    toast.success(`Title "${title.substring(0, 30)}..." applied`);
  };

  // Generate Smart SEO Descriptions using AI
  const handleGenerateSEODescriptions = async () => {
    setIsGeneratingDescription(true);
    setDescriptionSuggestions([]);
    setShowDescriptionSuggestions(false);

    try {
      const pageData = {
        title: data.title,
        description: data.metaDescription,
        h1: data.h1,
        introduction: data.introduction,
        slug: data.slug,
        pageSlug: pageSlug,
        introText: introductionText.description,
      };

      console.log('[SEO Editor] Generating SEO descriptions with data:', pageData);

      const { data: result, error } = await supabase.functions.invoke('generate-seo-description', {
        body: { 
          pageData,
          focusKeyword: data.focusKeyword
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating descriptions:', error);
        toast.error('Error generating descriptions: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        console.log('[SEO Editor] Generated descriptions:', result.suggestions);
        setDescriptionSuggestions(result.suggestions);
        setShowDescriptionSuggestions(true);
        toast.success(`${result.suggestions.length} description suggestions generated`);
      } else {
        toast.error('No descriptions generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating descriptions');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSelectDescription = (description: string) => {
    handleChange('metaDescription', description);
    setShowDescriptionSuggestions(false);
    toast.success(`Description applied`);
  };

  // Generate Smart Internal Links using AI
  const handleGenerateInternalLinks = async () => {
    setIsGeneratingInternalLinks(true);
    // Keep already applied links
    const existingApplied = internalLinkSuggestions.filter(s => s.applied);
    setShowInternalLinkSuggestions(false);

    try {
      console.log('[SEO Editor] Generating internal link suggestions for:', pageSlug);

      const { data: result, error } = await supabase.functions.invoke('generate-internal-links', {
        body: { 
          pageSlug,
          focusKeyword: data.focusKeyword,
          language: editorLanguage,
          // Send already applied targets so AI can suggest different links
          excludeTargets: appliedInternalLinks.map(l => l.targetSlug)
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating internal links:', error);
        toast.error('Error generating link suggestions: ' + error.message);
        // Restore existing applied links on error
        if (existingApplied.length > 0) {
          setInternalLinkSuggestions(existingApplied);
          setShowInternalLinkSuggestions(true);
        }
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        if (existingApplied.length > 0) {
          setInternalLinkSuggestions(existingApplied);
          setShowInternalLinkSuggestions(true);
        }
        return;
      }

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        console.log('[SEO Editor] Generated internal link suggestions:', result.suggestions);
        // Combine already applied links with new suggestions
        const newSuggestions = result.suggestions.map((s: any) => ({ ...s, applied: false }));
        // Put applied links first, then new suggestions
        const combinedSuggestions = [
          ...appliedInternalLinks.map(link => ({
            ...link,
            applied: true,
            reason: 'Previously applied',
            priority: 0,
            contextPreview: ''
          })),
          ...newSuggestions
        ];
        setInternalLinkSuggestions(combinedSuggestions);
        setShowInternalLinkSuggestions(true);
        
        if (newSuggestions.length === 0 && appliedInternalLinks.length === 0) {
          toast.info('No suitable internal link opportunities found');
        } else if (newSuggestions.length === 0 && appliedInternalLinks.length > 0) {
          toast.info(`${appliedInternalLinks.length} applied link(s) shown. No new suggestions.`);
        } else {
          toast.success(`${newSuggestions.length} new internal link suggestions + ${appliedInternalLinks.length} applied`);
        }
      } else {
        // Show applied links even if no new suggestions
        if (appliedInternalLinks.length > 0) {
          setInternalLinkSuggestions(appliedInternalLinks.map(link => ({
            ...link,
            applied: true,
            reason: 'Previously applied',
            priority: 0,
            contextPreview: ''
          })));
          setShowInternalLinkSuggestions(true);
          toast.info(`${appliedInternalLinks.length} applied link(s). No new suggestions.`);
        } else {
          toast.info('No suggestions generated');
        }
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating link suggestions');
      if (existingApplied.length > 0) {
        setInternalLinkSuggestions(existingApplied);
        setShowInternalLinkSuggestions(true);
      }
    } finally {
      setIsGeneratingInternalLinks(false);
    }
  };

  const handleApplyInternalLink = async (suggestion: typeof internalLinkSuggestions[0], index: number) => {
    try {
      // Build the link HTML
      const linkHtml = `<a href="/${editorLanguage}/${suggestion.targetSlug}" class="internal-link">${suggestion.anchorText}</a>`;
      
      let linkInserted = false;
      let updatedEntry: any = null;
      let updateId: string | null = null;
      
      // STRATEGY 1: Try page_segments JSON first (Content Automation stores data here)
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      if (pageSegmentsEntry && suggestion.segmentId) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          const segmentIndex = segments.findIndex((s: any) => String(s.id) === String(suggestion.segmentId));
          
          if (segmentIndex !== -1) {
            const segment = segments[segmentIndex];
            const textFields = ['introText', 'description', 'subtitle', 'headline', 'content', 'text'];
            
            for (const field of textFields) {
              if (segment.data?.[field] && typeof segment.data[field] === 'string') {
                if (segment.data[field].includes(suggestion.anchorText)) {
                  segment.data[field] = segment.data[field].replace(suggestion.anchorText, linkHtml);
                  segments[segmentIndex] = segment;
                  linkInserted = true;
                  updatedEntry = { content_value: JSON.stringify(segments) };
                  updateId = pageSegmentsEntry.id;
                  console.log('[SEO Editor] Link inserted in page_segments, segment:', suggestion.segmentId, 'field:', field);
                  break;
                }
              }
            }
            
            // Also check nested items array (for image-text segments)
            if (!linkInserted && segment.data?.items && Array.isArray(segment.data.items)) {
              for (let i = 0; i < segment.data.items.length; i++) {
                const item = segment.data.items[i];
                for (const field of ['description', 'text', 'content']) {
                  if (item[field] && typeof item[field] === 'string' && item[field].includes(suggestion.anchorText)) {
                    segment.data.items[i][field] = item[field].replace(suggestion.anchorText, linkHtml);
                    segments[segmentIndex] = segment;
                    linkInserted = true;
                    updatedEntry = { content_value: JSON.stringify(segments) };
                    updateId = pageSegmentsEntry.id;
                    console.log('[SEO Editor] Link inserted in page_segments items array, segment:', suggestion.segmentId);
                    break;
                  }
                }
                if (linkInserted) break;
              }
            }
          }
        } catch (e) {
          console.error('[SEO Editor] Error parsing page_segments:', e);
        }
      }
      
      // STRATEGY 2: Try individual section_key entry (legacy/direct storage)
      if (!linkInserted) {
        const segmentEntry = pageContent.find(item => item.section_key === suggestion.segmentKey);
        if (segmentEntry) {
          let updatedContent = segmentEntry.content_value;
          
          try {
            const contentObj = JSON.parse(segmentEntry.content_value);
            const textFields = ['introText', 'description', 'subtitle', 'headline', 'content', 'text', 'cta_description', 'button_text'];

            for (const field of textFields) {
              if (contentObj[field] && typeof contentObj[field] === 'string') {
                if (contentObj[field].includes(suggestion.anchorText)) {
                  contentObj[field] = contentObj[field].replace(suggestion.anchorText, linkHtml);
                  linkInserted = true;
                  updatedEntry = { content_value: JSON.stringify(contentObj) };
                  updateId = segmentEntry.id;
                  console.log('[SEO Editor] Link inserted in section_key entry:', suggestion.segmentKey, 'field:', field);
                  break;
                }
              }
            }
          } catch {
            // Not JSON - treat as plain text/HTML string
            if (updatedContent.includes(suggestion.anchorText)) {
              updatedContent = updatedContent.replace(suggestion.anchorText, linkHtml);
              linkInserted = true;
              updatedEntry = { content_value: updatedContent };
              updateId = segmentEntry.id;
            }
          }
        }
      }

      if (!linkInserted || !updatedEntry || !updateId) {
        toast.error(`Anchor-Text "${suggestion.anchorText}" nicht in Segment ${suggestion.segmentKey || suggestion.segmentId} gefunden`);
        return;
      }

      // Save to database using the correct ID
      const { error: saveError } = await supabase
        .from('page_content')
        .update({ 
          content_value: updatedEntry.content_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', updateId);

      if (saveError) {
        console.error('[SEO Editor] Error saving link:', saveError);
        toast.error('Fehler beim Speichern: ' + saveError.message);
        return;
      }

      // Update local state
      const updatedSuggestions = [...internalLinkSuggestions];
      updatedSuggestions[index] = { ...suggestion, applied: true };
      setInternalLinkSuggestions(updatedSuggestions);

      // Update pageContent locally
      setPageContent(prev => prev.map(item => 
        item.id === updateId 
          ? { ...item, content_value: updatedEntry.content_value }
          : item
      ));

      // Persist the applied link to database
      const newAppliedLink = {
        anchorText: suggestion.anchorText,
        targetSlug: suggestion.targetSlug,
        targetTitle: suggestion.targetTitle,
        segmentKey: suggestion.segmentKey,
        segmentId: suggestion.segmentId,
        segmentField: suggestion.segmentField,
        segmentType: suggestion.segmentType,
        appliedAt: new Date().toISOString()
      };
      
      const updatedAppliedLinks = [...appliedInternalLinks, newAppliedLink];
      setAppliedInternalLinks(updatedAppliedLinks);
      
      // Persist the applied links to page_content - check if exists first
      const { data: existingEntry } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_applied_internal_links')
        .eq('language', editorLanguage)
        .single();
      
      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(updatedAppliedLinks),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
        
        if (updateError) {
          console.error('[SEO Editor] Error updating applied links:', updateError);
        } else {
          console.log('[SEO Editor] Updated applied internal links:', updatedAppliedLinks.length);
        }
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('page_content')
          .insert({
            page_slug: pageSlug,
            section_key: 'seo_applied_internal_links',
            language: editorLanguage,
            content_type: 'json',
            content_value: JSON.stringify(updatedAppliedLinks),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('[SEO Editor] Error inserting applied links:', insertError);
        } else {
          console.log('[SEO Editor] Inserted applied internal links:', updatedAppliedLinks.length);
        }
      }

      toast.success(`Link to "${suggestion.targetTitle}" applied!`);
    } catch (error) {
      console.error('[SEO Editor] Error applying link:', error);
      toast.error('Error applying link');
    }
  };

  // Delete an applied internal link
  const handleDeleteInternalLink = async () => {
    if (!linkToDelete) return;
    
    const { suggestion, index } = linkToDelete;
    setIsDeletingLink(true);
    
    try {
      // Find the segment content
      const segmentEntry = pageContent.find(item => item.section_key === suggestion.segmentKey);
      if (!segmentEntry) {
        toast.error(`Segment ${suggestion.segmentKey} not found`);
        setIsDeletingLink(false);
        setLinkToDelete(null);
        return;
      }

      let updatedContent = segmentEntry.content_value;
      let linkRemoved = false;
      
      // Build the link patterns to search for
      const linkPatterns = [
        `<a href="/${editorLanguage}/${suggestion.targetSlug}" class="internal-link">${suggestion.anchorText}</a>`,
        `<a href="/${suggestion.targetSlug}" class="internal-link">${suggestion.anchorText}</a>`,
        new RegExp(`<a[^>]*href="[^"]*${suggestion.targetSlug}"[^>]*>${suggestion.anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</a>`, 'gi')
      ];

      // Try to parse as JSON first
      try {
        const contentObj = JSON.parse(segmentEntry.content_value);
        
        // Check different text fields where the link might be
        const textFields = ['introText', 'description', 'subtitle', 'content', 'text', 'cta_description', 'button_text'];

        for (const field of textFields) {
          if (contentObj[field] && typeof contentObj[field] === 'string') {
            let fieldValue = contentObj[field];
            
            // Try each pattern
            for (const pattern of linkPatterns) {
              if (typeof pattern === 'string') {
                if (fieldValue.includes(pattern)) {
                  fieldValue = fieldValue.replace(pattern, suggestion.anchorText);
                  linkRemoved = true;
                  break;
                }
              } else {
                if (pattern.test(fieldValue)) {
                  fieldValue = fieldValue.replace(pattern, suggestion.anchorText);
                  linkRemoved = true;
                  break;
                }
              }
            }
            
            if (linkRemoved) {
              contentObj[field] = fieldValue;
              break;
            }
          }
        }
        
        if (linkRemoved) {
          updatedContent = JSON.stringify(contentObj);
        }
      } catch {
        // Not JSON - treat as plain text/HTML string
        for (const pattern of linkPatterns) {
          if (typeof pattern === 'string') {
            if (updatedContent.includes(pattern)) {
              updatedContent = updatedContent.replace(pattern, suggestion.anchorText);
              linkRemoved = true;
              break;
            }
          } else {
            if (pattern.test(updatedContent)) {
              updatedContent = updatedContent.replace(pattern, suggestion.anchorText);
              linkRemoved = true;
              break;
            }
          }
        }
      }

      if (!linkRemoved) {
        console.warn('[SEO Editor] Link pattern not found in content, removing from tracking anyway');
      }

      // Save to database
      if (linkRemoved) {
        const { error: saveError } = await supabase
          .from('page_content')
          .update({ 
            content_value: updatedContent,
            updated_at: new Date().toISOString()
          })
          .eq('page_slug', pageSlug)
          .eq('section_key', suggestion.segmentKey)
          .eq('language', editorLanguage);

        if (saveError) {
          console.error('[SEO Editor] Error saving content after link removal:', saveError);
          toast.error('Error saving: ' + saveError.message);
          setIsDeletingLink(false);
          setLinkToDelete(null);
          return;
        }

        // Update pageContent locally
        setPageContent(prev => prev.map(item => 
          item.section_key === suggestion.segmentKey 
            ? { ...item, content_value: updatedContent }
            : item
        ));
      }

      // Update local state - remove from suggestions
      const updatedSuggestions = internalLinkSuggestions.filter((_, i) => i !== index);
      setInternalLinkSuggestions(updatedSuggestions);

      // Remove from appliedInternalLinks
      const updatedAppliedLinks = appliedInternalLinks.filter(
        link => !(link.targetSlug === suggestion.targetSlug && link.segmentKey === suggestion.segmentKey)
      );
      setAppliedInternalLinks(updatedAppliedLinks);
      
      // Update persisted applied links in database
      const { data: existingEntry } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_applied_internal_links')
        .eq('language', editorLanguage)
        .single();
      
      if (existingEntry) {
        if (updatedAppliedLinks.length > 0) {
          await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(updatedAppliedLinks),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id);
        } else {
          // Delete the entry if no applied links remain
          await supabase
            .from('page_content')
            .delete()
            .eq('id', existingEntry.id);
        }
      }

      toast.success(`Link to "${suggestion.targetTitle}" removed`);
    } catch (error) {
      console.error('[SEO Editor] Error deleting link:', error);
      toast.error('Error deleting link');
    } finally {
      setIsDeletingLink(false);
      setLinkToDelete(null);
    }
  };

  // Generate Smart External Links using AI
  const handleGenerateExternalLinks = async () => {
    setIsGeneratingExternalLinks(true);
    setShowExternalLinkSuggestions(false);

    try {
      console.log('[SEO Editor] Generating external link suggestions for:', pageSlug);

      const { data: result, error } = await supabase.functions.invoke('generate-external-links', {
        body: { 
          pageSlug,
          focusKeyword: data.focusKeyword,
          language: editorLanguage
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating external links:', error);
        toast.error('Error generating external link suggestions: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        console.log('[SEO Editor] Generated external link suggestions:', result.suggestions);
        setExternalLinkSuggestions(result.suggestions.map((s: any) => ({ ...s, applied: false })));
        setShowExternalLinkSuggestions(true);
        
        if (result.suggestions.length === 0) {
          toast.info(result.message || 'No suitable external link opportunities found');
        } else {
          toast.success(`${result.suggestions.length} external link suggestion(s) generated`);
        }
      } else {
        toast.info(result?.message || 'No suggestions generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating external link suggestions');
    } finally {
      setIsGeneratingExternalLinks(false);
    }
  };

  // Apply an external link suggestion
  const handleApplyExternalLink = async (suggestion: typeof externalLinkSuggestions[0], index: number) => {
    try {
      // Build the link HTML with target="_blank" for external links
      const linkHtml = `<a href="${suggestion.targetUrl}" target="_blank" rel="noopener noreferrer" class="external-link">${suggestion.anchorText}</a>`;
      
      let linkInserted = false;
      let updateId: string | null = null;
      
      // STRATEGY 1: Try page_segments JSON first
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      if (pageSegmentsEntry) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          
          // Use internalId if available (for finding in array), fallback to segmentKey parsing
          const internalIdToFind = suggestion.internalId || suggestion.segmentKey?.replace('segment-', '');
          const targetSegment = segments.find((s: any) => String(s.id) === String(internalIdToFind));
          
          if (targetSegment?.data) {
            const textFields = ['description', 'text', 'content', 'subtitle', 'introText'];
            for (const field of textFields) {
              if (targetSegment.data[field] && typeof targetSegment.data[field] === 'string') {
                if (targetSegment.data[field].includes(suggestion.anchorText)) {
                  targetSegment.data[field] = targetSegment.data[field].replace(
                    suggestion.anchorText,
                    linkHtml
                  );
                  linkInserted = true;
                  updateId = pageSegmentsEntry.id;
                  
                  // Update in database
                  const { error: updateError } = await supabase
                    .from('page_content')
                    .update({
                      content_value: JSON.stringify(segments),
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', pageSegmentsEntry.id);
                  
                  if (updateError) {
                    console.error('[SEO Editor] Error updating page_segments:', updateError);
                  } else {
                    console.log('[SEO Editor] External link inserted into page_segments, segment ID:', suggestion.segmentId, 'internal:', internalIdToFind);
                  }
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.error('[SEO Editor] Error parsing page_segments for external link:', e);
        }
      }
      
      // STRATEGY 2: Try individual segment entry
      if (!linkInserted) {
        const segmentEntry = pageContent.find(item => item.section_key === suggestion.segmentKey);
        if (segmentEntry) {
          try {
            const contentObj = JSON.parse(segmentEntry.content_value);
            const textFields = ['description', 'text', 'content', 'subtitle', 'introText'];
            
            for (const field of textFields) {
              if (contentObj[field] && typeof contentObj[field] === 'string') {
                if (contentObj[field].includes(suggestion.anchorText)) {
                  contentObj[field] = contentObj[field].replace(suggestion.anchorText, linkHtml);
                  linkInserted = true;
                  updateId = segmentEntry.id;
                  
                  const { error: updateError } = await supabase
                    .from('page_content')
                    .update({
                      content_value: JSON.stringify(contentObj),
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', segmentEntry.id);
                  
                  if (updateError) {
                    console.error('[SEO Editor] Error updating segment:', updateError);
                  }
                  break;
                }
              }
            }
          } catch (e) {
            // Non-JSON content
            if (segmentEntry.content_value.includes(suggestion.anchorText)) {
              const updatedContent = segmentEntry.content_value.replace(suggestion.anchorText, linkHtml);
              linkInserted = true;
              updateId = segmentEntry.id;
              
              await supabase
                .from('page_content')
                .update({
                  content_value: updatedContent,
                  updated_at: new Date().toISOString()
                })
                .eq('id', segmentEntry.id);
            }
          }
        }
      }

      if (!linkInserted) {
        toast.error(`"${suggestion.anchorText}" nicht im Segment gefunden`);
        return;
      }

      // Mark as applied in UI
      const updatedSuggestions = [...externalLinkSuggestions];
      updatedSuggestions[index] = { ...updatedSuggestions[index], applied: true };
      setExternalLinkSuggestions(updatedSuggestions);

      // Persist applied external links to database
      const appliedLinks = updatedSuggestions.filter(s => s.applied);
      const { data: existingEntry } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_applied_external_links')
        .eq('language', editorLanguage)
        .single();

      if (existingEntry) {
        await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(appliedLinks),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      } else {
        await supabase
          .from('page_content')
          .insert({
            page_slug: pageSlug,
            section_key: 'seo_applied_external_links',
            language: editorLanguage,
            content_type: 'json',
            content_value: JSON.stringify(appliedLinks)
          });
      }
      console.log('[SEO Editor] Persisted applied external links:', appliedLinks.length);

      toast.success(`External link to "${suggestion.targetTitle}" applied!`);
    } catch (error) {
      console.error('[SEO Editor] Error applying external link:', error);
      toast.error('Error applying external link');
    }
  };

  // Remove an applied external link
  const handleRemoveExternalLink = async (suggestion: typeof externalLinkSuggestions[0], index: number) => {
    try {
      // Build the link HTML that was inserted
      const linkHtml = `<a href="${suggestion.targetUrl}" target="_blank" rel="noopener noreferrer" class="external-link">${suggestion.anchorText}</a>`;
      
      let linkRemoved = false;
      
      // STRATEGY 1: Try page_segments JSON first
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      if (pageSegmentsEntry) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          const internalIdToFind = suggestion.internalId || suggestion.segmentKey?.replace('segment-', '');
          const targetSegment = segments.find((s: any) => String(s.id) === String(internalIdToFind));
          
          if (targetSegment?.data) {
            const textFields = ['description', 'text', 'content', 'subtitle', 'introText'];
            for (const field of textFields) {
              if (targetSegment.data[field] && typeof targetSegment.data[field] === 'string') {
                if (targetSegment.data[field].includes(linkHtml)) {
                  // Replace the link HTML with just the anchor text
                  targetSegment.data[field] = targetSegment.data[field].replace(linkHtml, suggestion.anchorText);
                  linkRemoved = true;
                  
                  const { error: updateError } = await supabase
                    .from('page_content')
                    .update({
                      content_value: JSON.stringify(segments),
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', pageSegmentsEntry.id);
                  
                  if (updateError) {
                    console.error('[SEO Editor] Error removing external link from page_segments:', updateError);
                  } else {
                    console.log('[SEO Editor] External link removed from page_segments');
                  }
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.error('[SEO Editor] Error parsing page_segments for external link removal:', e);
        }
      }
      
      // STRATEGY 2: Try individual segment entry
      if (!linkRemoved) {
        const segmentEntry = pageContent.find(item => item.section_key === suggestion.segmentKey);
        if (segmentEntry) {
          try {
            const contentObj = JSON.parse(segmentEntry.content_value);
            const textFields = ['description', 'text', 'content', 'subtitle', 'introText'];
            
            for (const field of textFields) {
              if (contentObj[field] && typeof contentObj[field] === 'string') {
                if (contentObj[field].includes(linkHtml)) {
                  contentObj[field] = contentObj[field].replace(linkHtml, suggestion.anchorText);
                  linkRemoved = true;
                  
                  const { error: updateError } = await supabase
                    .from('page_content')
                    .update({
                      content_value: JSON.stringify(contentObj),
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', segmentEntry.id);
                  
                  if (updateError) {
                    console.error('[SEO Editor] Error removing external link:', updateError);
                  }
                  break;
                }
              }
            }
          } catch (e) {
            // Non-JSON content
            if (segmentEntry.content_value.includes(linkHtml)) {
              const updatedContent = segmentEntry.content_value.replace(linkHtml, suggestion.anchorText);
              const { error: updateError } = await supabase
                .from('page_content')
                .update({
                  content_value: updatedContent,
                  updated_at: new Date().toISOString()
                })
                .eq('id', segmentEntry.id);
              
              if (!updateError) {
                linkRemoved = true;
              }
            }
          }
        }
      }

      if (linkRemoved) {
        // Update UI - mark as not applied
        const updatedSuggestions = [...externalLinkSuggestions];
        updatedSuggestions[index] = { ...updatedSuggestions[index], applied: false };
        setExternalLinkSuggestions(updatedSuggestions);

        // Update persisted external links in database
        const appliedLinks = updatedSuggestions.filter(s => s.applied);
        const { data: existingEntry } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_applied_external_links')
          .eq('language', editorLanguage)
          .single();

        if (existingEntry) {
          await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(appliedLinks),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id);
        }
        console.log('[SEO Editor] Updated persisted external links after removal:', appliedLinks.length);

        toast.success(`External link to "${suggestion.targetTitle}" removed`);
      } else {
        toast.error('Could not find the link to remove');
      }
      
      setExternalLinkToDelete(null);
    } catch (error) {
      console.error('[SEO Editor] Error removing external link:', error);
      toast.error('Error removing external link');
      setExternalLinkToDelete(null);
    }
  };

  // Generate Content Link Suggestions (pages/segments that should be created)
  const handleGenerateContentLinks = async () => {
    setIsGeneratingContentLinks(true);
    setContentLinkSuggestions([]);
    setShowContentLinkSuggestions(false);

    try {
      console.log('[SEO Editor] Generating content link suggestions for:', pageSlug);

      const { data: result, error } = await supabase.functions.invoke('suggest-content-links', {
        body: { 
          pageSlug,
          focusKeyword: data.focusKeyword,
          language: editorLanguage
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating content links:', error);
        toast.error('Error generating content suggestions: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        console.log('[SEO Editor] Generated content link suggestions:', result.suggestions);
        setContentLinkSuggestions(result.suggestions);
        setShowContentLinkSuggestions(true);
        
        if (result.suggestions.length === 0) {
          toast.info('No content suggestions found');
        } else {
          toast.success(`${result.suggestions.length} content suggestions generated`);
        }
      } else {
        toast.info('No suggestions generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating content suggestions');
    } finally {
      setIsGeneratingContentLinks(false);
    }
  };

  // Save Content Suggestions to database
  const handleSaveContentSuggestions = async () => {
    if (contentLinkSuggestions.length === 0) {
      toast.info('No suggestions to save');
      return;
    }

    setIsSavingContentSuggestions(true);
    try {
      const suggestionsToSave = contentLinkSuggestions.map(s => ({ ...s, saved: true }));
      
      // Check if entry already exists
      const { data: existing } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_content_suggestions')
        .eq('language', editorLanguage)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(suggestionsToSave),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('page_content')
          .insert({
            page_slug: pageSlug,
            section_key: 'seo_content_suggestions',
            content_type: 'json',
            content_value: JSON.stringify(suggestionsToSave),
            language: editorLanguage
          });
        
        if (error) throw error;
      }

      // Update local state with saved flag
      setContentLinkSuggestions(suggestionsToSave);
      toast.success(`${suggestionsToSave.length} content suggestions saved`);
    } catch (error) {
      console.error('[SEO Editor] Error saving content suggestions:', error);
      toast.error('Failed to save content suggestions');
    } finally {
      setIsSavingContentSuggestions(false);
    }
  };

  // Apply a Content Cluster Suggestion - create new page with segments
  const handleApplyClusterSuggestion = async (suggestion: typeof contentLinkSuggestions[0], index: number) => {
    if (suggestion.suggestionType !== 'new_page') {
      toast.error('Only new page suggestions can be applied');
      return;
    }

    // Mark as applying
    setContentLinkSuggestions(prev => prev.map((s, i) => 
      i === index ? { ...s, isApplying: true } : s
    ));

    try {
      // Step 1: Get the next available page_id atomically (prevents reuse of deleted IDs)
      const { data: nextIdResult, error: nextIdError } = await supabase
        .rpc('get_next_page_id');

      if (nextIdError) {
        console.error('Error getting next page_id:', nextIdError);
        throw new Error('Failed to get next page ID');
      }
      
      const newPageId = nextIdResult as number;
      
      // CRITICAL FIX: Check if suggestedSlug already contains the full path (from AI)
      // If it starts with the parentSlug, use it directly; otherwise construct the path
      let newSlug = suggestion.suggestedSlug;
      if (suggestion.parentSlug && !suggestion.suggestedSlug.startsWith(suggestion.parentSlug)) {
        // suggestedSlug is just the end portion, construct full path
        newSlug = `${suggestion.parentSlug}/${suggestion.suggestedSlug}`;
      }
      
      console.log('[SEO Editor] Creating new page with slug:', newSlug, 'from suggested:', suggestion.suggestedSlug);

      // Step 2: Create page registry entry
      const { error: registryError } = await supabase
        .from('page_registry')
        .insert({
          page_id: newPageId,
          page_slug: newSlug,
          page_title: suggestion.suggestedTitle,
          parent_slug: suggestion.parentSlug || null,
          position: 999
        });

      if (registryError) throw registryError;

      console.log('[SEO Editor] Created page registry entry:', newSlug, 'ID:', newPageId);

      // Step 3: Create segments for the new page
      const suggestedSegments = suggestion.suggestedSegments || [
        { type: 'action-hero', content: `Hero section for ${suggestion.suggestedTitle}` },
        { type: 'intro', content: `Introduction about ${suggestion.suggestedTitle}` }
      ];

      const segmentsToCreate: Array<{
        page_slug: string;
        segment_type: string;
        segment_key: string;
        segment_id: number;
        position: number;
      }> = [];

      const pageSegmentsForDb: Array<{
        id: string;
        type: string;
        data: Record<string, any>;
        position: number;
      }> = [];

      for (let i = 0; i < suggestedSegments.length; i++) {
        const seg = suggestedSegments[i];
        const segmentId = newPageId * 100 + i + 1; // Generate unique segment ID
        const segmentKey = `segment_${segmentId}_${seg.type}`;

        segmentsToCreate.push({
          page_slug: newSlug,
          segment_type: seg.type,
          segment_key: segmentKey,
          segment_id: segmentId,
          position: i
        });

        // Create rich initial content for the segment based on type
        const segmentData: Record<string, any> = {};
        
        switch (seg.type) {
          case 'action-hero':
            segmentData.headline = suggestion.suggestedTitle;
            segmentData.subline = seg.content || `Entdecken Sie detaillierte Informationen zu ${suggestion.suggestedTitle}`;
            segmentData.alignment = 'center';
            segmentData.backgroundStyle = 'gradient';
            segmentData.ctaText = 'Mehr erfahren';
            segmentData.ctaLink = '#intro';
            break;
          case 'intro':
            segmentData.headline = suggestion.suggestedTitle;
            segmentData.headingLevel = 'h1';
            segmentData.introText = `<p>${seg.content || `Willkommen auf der Detailseite zu ${suggestion.suggestedTitle}. Hier finden Sie alle wichtigen Informationen, technische Daten und Anwendungsbeispiele.`}</p>`;
            segmentData.alignment = 'left';
            segmentData.showDivider = true;
            break;
          case 'faq':
            segmentData.headline = `Häufige Fragen zu ${suggestion.suggestedTitle}`;
            segmentData.items = [
              { 
                question: `Was sind die Hauptvorteile von ${suggestion.suggestedTitle}?`, 
                answer: seg.content || 'Antwort wird in Kürze ergänzt.' 
              },
              { 
                question: `Für welche Anwendungen ist ${suggestion.suggestedTitle} geeignet?`, 
                answer: 'Antwort wird in Kürze ergänzt.' 
              },
              { 
                question: `Wie unterscheidet sich ${suggestion.suggestedTitle} von anderen Lösungen?`, 
                answer: 'Antwort wird in Kürze ergänzt.' 
              }
            ];
            break;
          case 'specification':
            segmentData.title = `Technische Spezifikationen: ${suggestion.suggestedTitle}`;
            segmentData.rows = [
              { specification: 'Kategorie', value: 'Wird ergänzt' },
              { specification: 'Typ', value: 'Wird ergänzt' },
              { specification: 'Merkmale', value: seg.content || 'Wird ergänzt' }
            ];
            segmentData.description = '';
            break;
          case 'feature-overview':
            segmentData.title = `Features & Vorteile`;
            segmentData.subtext = seg.content || `Die wichtigsten Merkmale von ${suggestion.suggestedTitle}`;
            segmentData.layout = '2';
            segmentData.rows = '2';
            segmentData.items = [
              { title: 'Feature 1', description: 'Beschreibung wird ergänzt.' },
              { title: 'Feature 2', description: 'Beschreibung wird ergänzt.' },
              { title: 'Feature 3', description: 'Beschreibung wird ergänzt.' },
              { title: 'Feature 4', description: 'Beschreibung wird ergänzt.' }
            ];
            break;
          default:
            segmentData.headline = suggestion.suggestedTitle;
            segmentData.description = seg.content || `Inhalt zu ${suggestion.suggestedTitle}`;
        }

        // Add to page_segments array with correct format
        pageSegmentsForDb.push({
          id: String(segmentId),
          type: seg.type,
          data: segmentData,
          position: i
        });
      }

      // Step 4: Insert segment registry entries
      if (segmentsToCreate.length > 0) {
        const { error: segmentError } = await supabase
          .from('segment_registry')
          .insert(segmentsToCreate);

        if (segmentError) throw segmentError;
      }

      // Step 5: Create page_segments content with correct format including data
      await supabase
        .from('page_content')
        .insert({
          page_slug: newSlug,
          section_key: 'page_segments',
          content_type: 'json',
          content_value: JSON.stringify(pageSegmentsForDb),
          language: 'en'
        });

      // Step 6: Create basic SEO entry
      await supabase
        .from('page_content')
        .insert({
          page_slug: newSlug,
          section_key: 'seo',
          content_type: 'json',
          content_value: JSON.stringify({
            title: suggestion.suggestedTitle,
            description: suggestion.reason,
            focusKeyword: '',
            canonical: ''
          }),
          language: 'en'
        });

      console.log('[SEO Editor] Created segments for new page:', segmentsToCreate.length);

      // Step 7: Insert link in parent segment if linkPlacement is specified
      let linkInserted = false;
      let insertedField = '';
      
      if (suggestion.linkPlacement) {
        const { segmentId, segmentType, placementType } = suggestion.linkPlacement;
        
        try {
          // CRITICAL: Content is stored in page_segments as JSON array, not individual section_keys
          // Find the page_segments entry for the current page
          const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
          
          if (pageSegmentsEntry) {
            const pageSegmentsArray = JSON.parse(pageSegmentsEntry.content_value);
            
            // Find the target segment by ID
            const targetSegmentIndex = pageSegmentsArray.findIndex(
              (seg: any) => String(seg.id) === String(segmentId)
            );
            
            if (targetSegmentIndex !== -1) {
              const targetSegment = pageSegmentsArray[targetSegmentIndex];
              const linkHtml = `<a href="/${newSlug}" class="text-primary hover:underline">${suggestion.suggestedTitle}</a>`;
              
              // Insert link based on segment type
              if (segmentType === 'specification' && targetSegment.data) {
                // For specification segments, add to description or create a notes field
                if (targetSegment.data.description) {
                  targetSegment.data.description = `${targetSegment.data.description}<p class="mt-4">→ ${linkHtml}</p>`;
                  insertedField = 'description';
                } else if (targetSegment.data.notes) {
                  targetSegment.data.notes = `${targetSegment.data.notes}<p>→ ${linkHtml}</p>`;
                  insertedField = 'notes';
                } else {
                  // Add a new description field with the link
                  targetSegment.data.description = `<p>→ ${linkHtml}</p>`;
                  insertedField = 'description (new)';
                }
                linkInserted = true;
              } else if (segmentType === 'feature-overview' && targetSegment.data?.items) {
                // Add link to the first item's description
                if (Array.isArray(targetSegment.data.items) && targetSegment.data.items.length > 0) {
                  const firstItem = targetSegment.data.items[0];
                  if (firstItem.description) {
                    firstItem.description = `${firstItem.description}<br/><br/>→ ${linkHtml}`;
                    insertedField = `items[0].description`;
                  }
                  linkInserted = true;
                }
              } else if (targetSegment.data?.introText) {
                targetSegment.data.introText = `${targetSegment.data.introText}<p class="mt-4">→ ${linkHtml}</p>`;
                insertedField = 'introText';
                linkInserted = true;
              } else if (targetSegment.data?.description) {
                targetSegment.data.description = `${targetSegment.data.description}<p class="mt-4">→ ${linkHtml}</p>`;
                insertedField = 'description';
                linkInserted = true;
              } else if (targetSegment.data?.body) {
                targetSegment.data.body = `${targetSegment.data.body}<p class="mt-4">→ ${linkHtml}</p>`;
                insertedField = 'body';
                linkInserted = true;
              } else if (targetSegment.data?.text) {
                targetSegment.data.text = `${targetSegment.data.text}<p class="mt-4">→ ${linkHtml}</p>`;
                insertedField = 'text';
                linkInserted = true;
              }
              
              // Update the page_segments with the modified segment
              if (linkInserted) {
                pageSegmentsArray[targetSegmentIndex] = targetSegment;
                
                await supabase
                  .from('page_content')
                  .update({
                    content_value: JSON.stringify(pageSegmentsArray),
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', pageSegmentsEntry.id);
                
                console.log('[SEO Editor] Inserted link in segment ID:', segmentId, 'field:', insertedField);
              }
            } else {
              console.warn('[SEO Editor] Target segment not found in page_segments:', segmentId);
            }
          } else {
            console.warn('[SEO Editor] No page_segments entry found for page');
          }
        } catch (linkError) {
          console.error('[SEO Editor] Error inserting link in parent segment:', linkError);
          // Don't fail the whole operation, just log the error
        }
      }

      // Step 8: Save the applied suggestion to persist it
      const updatedSuggestion = { ...suggestion, isApplying: false, saved: true, createdSlug: newSlug };
      const newSuggestions = contentLinkSuggestions.map((s, i) => 
        i === index ? updatedSuggestion : s
      );
      setContentLinkSuggestions(newSuggestions);
      
      // Persist the content suggestions to the database
      try {
        const { data: existingEntry } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_content_suggestions')
          .eq('language', editorLanguage)
          .single();
        
        if (existingEntry) {
          await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(newSuggestions),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id);
        } else {
          await supabase
            .from('page_content')
            .insert({
              page_slug: pageSlug,
              section_key: 'seo_content_suggestions',
              content_type: 'json',
              content_value: JSON.stringify(newSuggestions),
              language: editorLanguage
            });
        }
        console.log('[SEO Editor] Persisted content suggestions to database');
      } catch (persistError) {
        console.error('[SEO Editor] Error persisting content suggestions:', persistError);
      }

      // Log the segments that were created for debugging
      console.log('[SEO Editor] Created segments:', suggestedSegments);

      toast.success(
        <div className="space-y-2">
          <div>
            <strong className="text-green-300">✓ Cluster page created!</strong>
          </div>
          <div className="text-sm">
            <span className="text-gray-300">Page:</span> <span className="text-white font-medium">/{newSlug}</span>
          </div>
          <div>
            <span className="text-gray-300 text-xs block mb-1">Erstellte Segmente ({suggestedSegments.length}):</span>
            <div className="flex flex-wrap gap-1">
              {suggestedSegments.map((seg: { type: string; content?: string }, idx: number) => (
                <span key={idx} className="inline-block bg-green-600/20 text-green-300 px-1.5 py-0.5 rounded text-xs">
                  {seg.type}
                </span>
              ))}
            </div>
          </div>
          {suggestion.linkPlacement && (
            <div className="text-xs border-t border-green-600/30 pt-2 mt-2">
              {linkInserted 
                ? <span className="text-green-400">✓ Link in {suggestion.linkPlacement.segmentType} (ID {suggestion.linkPlacement.segmentId}) → "{insertedField}"</span>
                : <span className="text-yellow-400">⚠ Link konnte nicht eingefügt werden</span>}
            </div>
          )}
        </div>,
        { duration: 8000 }
      );

    } catch (error) {
      console.error('[SEO Editor] Error creating cluster page:', error);
      setContentLinkSuggestions(prev => prev.map((s, i) => 
        i === index ? { ...s, isApplying: false } : s
      ));
      toast.error('Failed to create cluster page: ' + (error as Error).message);
    }
  };

  // Generate AI content for a cluster page's segments
  const handleGenerateClusterContent = async (suggestion: typeof contentLinkSuggestions[0], index: number) => {
    if (!suggestion.saved || !suggestion.createdSlug) {
      toast.error('Page must be created first before generating content');
      return;
    }

    // Mark as generating
    setContentLinkSuggestions(prev => prev.map((s, i) => 
      i === index ? { ...s, isGeneratingContent: true } : s
    ));

    try {
      const clusterPageSlug = suggestion.createdSlug;
      
      // Get current page_segments to know what segments exist
      const { data: pageData, error: pageError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', clusterPageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', editorLanguage)
        .single();

      if (pageError) throw pageError;

      const currentSegments = JSON.parse(pageData.content_value || '[]');
      
      // Prepare segments for content generation - use segmentId field from page_segments structure
      const segmentsToGenerate = currentSegments.map((seg: any) => ({
        id: seg.segmentId || seg.id,  // page_segments uses segmentId, not id
        type: seg.type,
        currentData: seg.data
      }));

      // Get pillar page content for context
      let pillarContent = null;
      if (suggestion.parentSlug) {
        const { data: pillarData } = await supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', suggestion.parentSlug)
          .eq('section_key', 'seo')
          .eq('language', editorLanguage)
          .single();
        
        if (pillarData) {
          try {
            const seoData = JSON.parse(pillarData.content_value);
            pillarContent = {
              title: seoData.title,
              description: seoData.description,
              topics: [seoData.focusKeyword].filter(Boolean)
            };
          } catch (e) {
            console.error('[SEO Editor] Error parsing pillar SEO:', e);
          }
        }
      }

      // Try to get source URL from redirects table (set by Content Automation)
      let sourceUrl = null;
      const targetUrl = `/${editorLanguage}/${clusterPageSlug}`;
      const { data: redirectData } = await supabase
        .from('redirects')
        .select('source_url, notes')
        .eq('target_url', targetUrl)
        .eq('is_active', true)
        .single();
      
      if (redirectData?.source_url) {
        // Reconstruct full URL from redirect notes or path
        const notesMatch = redirectData.notes?.match(/Source: (https?:\/\/[^\s]+)/);
        if (notesMatch) {
          sourceUrl = notesMatch[1];
        } else {
          // Fallback: assume image-engineering.de domain
          sourceUrl = `https://www.image-engineering.de${redirectData.source_url}`;
        }
        console.log('[SEO Editor] Found source URL from redirect:', sourceUrl);
      }

      console.log('[SEO Editor] Generating content for cluster page:', clusterPageSlug);
      console.log('[SEO Editor] Segments to generate:', segmentsToGenerate.length);
      console.log('[SEO Editor] Source URL:', sourceUrl);
      console.log('[SEO Editor] Language:', editorLanguage);

      // Call edge function to generate content
      const { data: result, error: genError } = await supabase.functions.invoke('generate-cluster-content', {
        body: {
          pageSlug: clusterPageSlug,
          pageTitle: suggestion.suggestedTitle,
          parentPageSlug: suggestion.parentSlug,
          segments: segmentsToGenerate,
          pillarPageContent: pillarContent,
          sourceUrl: sourceUrl,
          language: editorLanguage
        }
      });

      if (genError) throw genError;

      console.log('[SEO Editor] Content generation result:', result);

      // Update state to mark content as generated
      const updatedSuggestion = { ...suggestion, isGeneratingContent: false, contentGenerated: true };
      const newSuggestions = contentLinkSuggestions.map((s, i) => 
        i === index ? updatedSuggestion : s
      );
      setContentLinkSuggestions(newSuggestions);

      // Persist to database
      try {
        const { data: existingEntry } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'seo_content_suggestions')
          .eq('language', editorLanguage)
          .single();
        
        if (existingEntry) {
          await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(newSuggestions),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id);
        }
      } catch (persistError) {
        console.error('[SEO Editor] Error persisting content suggestions:', persistError);
      }

      toast.success(
        <div className="space-y-1">
          <strong className="text-green-300">✓ AI-Inhalte generiert!</strong>
          <p className="text-sm text-gray-300">
            {result.generatedSegments || 0} Segmente mit Inhalten gefüllt
          </p>
        </div>,
        { duration: 5000 }
      );

    } catch (error) {
      console.error('[SEO Editor] Error generating cluster content:', error);
      setContentLinkSuggestions(prev => prev.map((s, i) => 
        i === index ? { ...s, isGeneratingContent: false } : s
      ));
      toast.error('Error generating content: ' + (error as Error).message);
    }
  };

  const handleGenerateH1Headlines = async () => {
    setIsGeneratingH1(true);
    setH1Suggestions([]);
    setShowH1Suggestions(false);

    try {
      // Get available segments from actual page_content (not segment_registry which can be stale)
      // This ensures we use the ACTUAL segments that exist on the page
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      let availableSegments: Array<{ type: string; key: string; id: string | number }> = [];
      
      if (pageSegmentsEntry) {
        try {
          const parsedSegments = JSON.parse(pageSegmentsEntry.content_value);
          availableSegments = parsedSegments.map((seg: any) => ({
            type: seg.type || seg.segmentType || 'unknown',
            key: seg.segmentKey || seg.id || '',
            id: seg.segmentId || seg.id || seg.segmentKey || ''
          }));
          console.log('[SEO Editor] Using actual segments from page_content:', availableSegments);
        } catch (parseError) {
          console.error('[SEO Editor] Failed to parse page_segments:', parseError);
        }
      }
      
      // Fallback to segment_registry only if page_content has no segments
      if (availableSegments.length === 0) {
        availableSegments = segmentRegistry
          .filter(seg => !seg.deleted)
          .map(seg => ({
            type: seg.segment_type,
            key: seg.segment_key,
            id: seg.segment_id
          }));
        console.log('[SEO Editor] Fallback to segment_registry:', availableSegments);
      }

      const pageData = {
        title: data.title,
        metaDescription: data.metaDescription,
        currentH1: data.h1,
        introduction: data.introduction,
        slug: data.slug,
        pageSlug: pageSlug,
      };

      console.log('[SEO Editor] Generating H1 headlines with data:', pageData);

      const { data: result, error } = await supabase.functions.invoke('generate-h1-headline', {
        body: { 
          pageData,
          focusKeyword: data.focusKeyword,
          segments: availableSegments
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating H1:', error);
        toast.error('Error generating H1: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        console.log('[SEO Editor] Generated H1 suggestions:', result.suggestions);
        setH1Suggestions(result.suggestions);
        setShowH1Suggestions(true);
        toast.success(`${result.suggestions.length} H1 suggestions generated`);
      } else {
        toast.error('No H1 suggestions generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating H1');
    } finally {
      setIsGeneratingH1(false);
    }
  };

  // Generate Smart H2 Headlines using AI
  const handleGenerateH2Headlines = async () => {
    setIsGeneratingH2(true);
    setH2Suggestions([]);
    setShowH2Suggestions(false);

    if (!data.focusKeyword) {
      toast.error('Please define a Focus Keyword first');
      setIsGeneratingH2(false);
      return;
    }

    try {
      // Get existing H2 headings from page segments
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      let existingH2s: Array<{ text: string; segmentType: string; segmentId: number | string; segmentKey: string }> = [];
      let availableSegments: Array<{ type: string; key: string; id: string | number }> = [];
      
      if (pageSegmentsEntry) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          availableSegments = segments.map((seg: any) => ({
            type: seg.type || seg.segmentType || 'unknown',
            key: seg.segmentKey || seg.id || '',
            id: seg.segmentId || seg.id || seg.segmentKey || ''
          }));
          
          // Extract H2 headings from each segment type
          segments.forEach((seg: any) => {
            const segData = seg.data || seg;
            const segType = seg.type || '';
            const segId = seg.segmentId || seg.id || '';
            const segKey = seg.segmentKey || seg.id || '';
            
            // Image-Text segments: 
            // - segment.data.title = H2 (Section Header)
            // - segment.data.items[].title = H3 (Item Headers, NOT H2)
            if (segType === 'image-text') {
              // Section title is the H2
              if (segData.title) {
                existingH2s.push({
                  text: segData.title,
                  segmentType: segType,
                  segmentId: segId,
                  segmentKey: segKey
                });
              }
              // Item titles are H3, NOT included in H2 list
              // (They will be handled separately in H3 generation)
            }
            
            // Feature overview, tiles, table, faq - their titles are typically H2
            if (['feature-overview', 'tiles', 'table', 'faq'].includes(segType)) {
              if (segData.title) {
                existingH2s.push({
                  text: segData.title,
                  segmentType: segType,
                  segmentId: segId,
                  segmentKey: segKey
                });
              }
            }
          });
          
          console.log('[SEO Editor] Extracted H2 headings:', existingH2s);
        } catch (parseError) {
          console.error('[SEO Editor] Failed to parse page_segments:', parseError);
        }
      }

      const pageData = {
        title: data.title,
        metaDescription: data.metaDescription,
        h1: data.h1,
        introduction: data.introduction,
        slug: data.slug,
        pageSlug: pageSlug,
      };

      console.log('[SEO Editor] Generating H2 headlines with data:', { pageData, existingH2s: existingH2s.length });

      const { data: result, error } = await supabase.functions.invoke('generate-h2-headlines', {
        body: { 
          pageData,
          focusKeyword: data.focusKeyword,
          existingH2s,
          segments: availableSegments
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating H2:', error);
        toast.error('Error generating H2: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        console.log('[SEO Editor] Generated H2 suggestions:', result.suggestions);
        
        // Mark already-optimized H2s (those that already contain FKW) as pre-applied
        // These will be shown with "Applied ✓" badge, not as suggestions
        const suggestionsWithStatus = result.suggestions.map((s: any) => {
          const alreadyHasFkw = s.originalText && data.focusKeyword &&
            s.originalText.toLowerCase().includes(data.focusKeyword.toLowerCase());
          return {
            ...s,
            applied: alreadyHasFkw, // Pre-mark as applied if already optimized
            alreadyOptimized: alreadyHasFkw
          };
        });
        
        // Also add H2s that are already optimized (contain FKW) but weren't suggested
        const suggestedOriginals = suggestionsWithStatus.map((s: any) => s.originalText?.toLowerCase());
        const alreadyOptimizedH2s = existingH2s
          .filter((h2: any) => {
            const hasFkw = h2.text && data.focusKeyword &&
              h2.text.toLowerCase().includes(data.focusKeyword.toLowerCase());
            const notAlreadySuggested = !suggestedOriginals.includes(h2.text.toLowerCase());
            return hasFkw && notAlreadySuggested;
          })
          .map((h2: any) => ({
            originalText: h2.text,
            suggestedText: h2.text, // Same text - already optimized
            segmentId: h2.segmentId,
            segmentType: h2.segmentType,
            segmentKey: h2.segmentKey,
            reason: 'Already contains Focus Keyword - no changes needed',
            characterCount: h2.text.length,
            priority: 99, // Low priority - show at end
            applied: true,
            alreadyOptimized: true
          }));
        
        const allSuggestions = [...suggestionsWithStatus, ...alreadyOptimizedH2s]
          .sort((a, b) => {
            // Sort: unapplied first (by priority), then applied
            if (a.applied && !b.applied) return 1;
            if (!a.applied && b.applied) return -1;
            return (a.priority || 99) - (b.priority || 99);
          });
        
        setH2Suggestions(allSuggestions);
        setShowH2Suggestions(true);
        
        const needsOptimization = allSuggestions.filter((s: any) => !s.alreadyOptimized).length;
        const alreadyOptimized = allSuggestions.filter((s: any) => s.alreadyOptimized).length;
        toast.success(`${needsOptimization} H2s to optimize, ${alreadyOptimized} already contain FKW`);
      } else {
        toast.error('No H2 suggestions generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating H2');
    } finally {
      setIsGeneratingH2(false);
    }
  };

  // Apply Smart H2 suggestion to segment
  const handleApplyH2Suggestion = async (suggestion: typeof h2Suggestions[0], index: number) => {
    setIsApplyingH2(index);
    
    console.log('[SEO Editor] === APPLYING H2 SUGGESTION ===');
    console.log('[SEO Editor] Suggestion:', {
      originalText: suggestion.originalText,
      suggestedText: suggestion.suggestedText,
      segmentId: suggestion.segmentId,
      segmentType: suggestion.segmentType
    });
    
    try {
      // Get current page_segments from database
      const { data: contentData, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage)
        .eq('section_key', 'page_segments')
        .maybeSingle();
      
      if (fetchError) {
        console.error('[SEO Editor] Fetch error:', fetchError);
        toast.error('Error fetching page segments: ' + fetchError.message);
        return;
      }
      
      if (!contentData) {
        console.error('[SEO Editor] No page segments found for:', { pageSlug, editorLanguage });
        toast.error('Page segments not found');
        return;
      }
      
      console.log('[SEO Editor] Found page_content id:', contentData.id);
      
      let segments = JSON.parse(contentData.content_value);
      let updated = false;
      let matchDetails = { segmentFound: false, typeMatched: false, titleMatched: false };
      
      // Find and update the H2 in the correct segment - PRESERVE ALL EXISTING DATA
      segments = segments.map((seg: any) => {
        const segIdMatch = String(seg.segmentId || seg.id) === String(suggestion.segmentId);
        
        if (segIdMatch) {
          matchDetails.segmentFound = true;
          const segType = seg.type || '';
          console.log('[SEO Editor] Found matching segment:', { segId: seg.id, segType, segData: seg.data });
          
          // Handle image-text segments - update the segment title (H2), NOT items (H3)
          if (segType === 'image-text') {
            matchDetails.typeMatched = true;
            const segData = seg.data ? { ...seg.data } : {};
            
            // Check segment-level title (this is the H2)
            const segTitle = (segData.title || '').trim();
            const originalTitle = (suggestion.originalText || '').trim();
            console.log('[SEO Editor] Checking image-text segment title:', { segTitle, originalTitle, match: segTitle === originalTitle });
            
            if (segTitle === originalTitle) {
              matchDetails.titleMatched = true;
              console.log('[SEO Editor] ✓ MATCH! Updating H2 in image-text segment title:', {
                from: segData.title,
                to: suggestion.suggestedText,
                segmentId: suggestion.segmentId
              });
              segData.title = suggestion.suggestedText;
              updated = true;
            }
            
            // Return segment with updated data, preserving everything else
            return { ...seg, data: segData };
          }
          
          // Handle segments with title field (feature-overview, tiles, table, faq)
          if (['feature-overview', 'tiles', 'table', 'faq'].includes(segType)) {
            matchDetails.typeMatched = true;
            const segData = seg.data ? { ...seg.data } : {};
            
            // First check segment-level title
            const segTitle = (segData.title || '').trim();
            const originalTitle = (suggestion.originalText || '').trim();
            console.log('[SEO Editor] Checking segment title:', { segTitle, originalTitle, match: segTitle === originalTitle });
            
            if (segTitle === originalTitle) {
              matchDetails.titleMatched = true;
              console.log('[SEO Editor] ✓ MATCH! Updating segment title:', {
                from: segData.title,
                to: suggestion.suggestedText,
                segmentId: suggestion.segmentId
              });
              segData.title = suggestion.suggestedText;
              updated = true;
              return { ...seg, data: segData };
            }
            
            // Also check items array for tiles/faq (they may have H2 titles in items)
            if (segData.items && Array.isArray(segData.items)) {
              console.log('[SEO Editor] Also checking', segData.items.length, 'items in', segType);
              segData.items = segData.items.map((item: any, idx: number) => {
                const itemTitle = (item.title || '').trim();
                if (itemTitle === originalTitle) {
                  matchDetails.titleMatched = true;
                  updated = true;
                  console.log(`[SEO Editor] ✓ MATCH in ${segType} item ${idx}:`, {
                    from: item.title,
                    to: suggestion.suggestedText
                  });
                  return { ...item, title: suggestion.suggestedText };
                }
                return item;
              });
            }
            
            return { ...seg, data: segData };
          }
        }
        return seg;
      });
      
      console.log('[SEO Editor] Match details:', matchDetails);
      
      if (!updated) {
        console.error('[SEO Editor] Could not find H2 to update. Details:', matchDetails);
        toast.error(`Could not find H2 to update (Segment: ${matchDetails.segmentFound ? 'found' : 'NOT found'}, Type: ${matchDetails.typeMatched ? 'matched' : 'NOT matched'}, Title: ${matchDetails.titleMatched ? 'matched' : 'NOT matched'})`);
        return;
      }
      
      // Save back to database
      console.log('[SEO Editor] Saving to database...');
      const { error: saveError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentData.id);
      
      if (saveError) {
        console.error('[SEO Editor] Save error:', saveError);
        toast.error('Failed to save: ' + saveError.message);
        return;
      }
      
      console.log('[SEO Editor] ✓ Successfully saved H2 update to database');
      
      // Update suggestion state
      setH2Suggestions(prev => prev.map((s, i) => 
        i === index ? { ...s, applied: true } : s
      ));
      
      // Refresh page content from database
      const { data: refreshedContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage);
      
      if (refreshedContent) {
        setPageContent(refreshedContent);
        
        // Recalculate FKW analysis with updated content
        if (data.focusKeyword) {
          const pageSegmentsEntry = refreshedContent.find((item: any) => item.section_key === 'page_segments');
          if (pageSegmentsEntry) {
            try {
              const updatedSegments = JSON.parse(pageSegmentsEntry.content_value);
              console.log('[SEO Editor] Recalculating FKW analysis after H2 update...', {
                segmentsCount: updatedSegments.length,
                focusKeyword: data.focusKeyword
              });
              
              const newAnalysis = await recalculateFkwAnalysis(updatedSegments, data.focusKeyword);
              console.log('[SEO Editor] New FKW analysis:', newAnalysis);
              setFkwContentAnalysis(newAnalysis);
              
              // Recalculate score
              let newScore = 0;
              const actualH1HasFkw = data.h1 && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase());
              if (actualH1HasFkw) newScore += 25;
              if (newAnalysis.introHasFkw) newScore += 20;
              if (newAnalysis.h2WithFkw > 0) newScore += 15;
              if (newAnalysis.h2Count > 0 && newAnalysis.h2WithFkw >= Math.ceil(newAnalysis.h2Count / 2)) newScore += 10;
              if (newAnalysis.densityStatus === 'optimal') newScore += 20;
              else if (newAnalysis.densityStatus === 'too_low' && newAnalysis.fkwDensity >= 0.3) newScore += 10;
              if (newAnalysis.h3WithFkw > 0) newScore += 10;
              setFkwContentScore(Math.min(100, newScore));
              
              // Update recommendations with new analysis
              const newRecommendations: string[] = [];
              
              // H1 recommendation
              if (!actualH1HasFkw) {
                newRecommendations.push(`✗ Füge "${data.focusKeyword}" in die H1-Überschrift ein`);
              } else {
                newRecommendations.push('✓ H1 enthält Focus Keyword');
              }
              
              // Intro recommendation
              if (!newAnalysis.introHasFkw) {
                newRecommendations.push(`✗ Füge "${data.focusKeyword}" in den Intro-Text ein (idealerweise in den ersten 15 Wörtern)`);
              } else {
                newRecommendations.push('✓ Intro enthält Focus Keyword');
              }
              
              // H2 recommendation - specific counts
              if (newAnalysis.h2Count > 0) {
                const h2Missing = newAnalysis.h2Count - newAnalysis.h2WithFkw;
                const targetH2s = Math.ceil(newAnalysis.h2Count / 2);
                const h2sNeeded = Math.max(0, targetH2s - newAnalysis.h2WithFkw);
                
                if (h2Missing === 0) {
                  newRecommendations.push(`✓ Alle ${newAnalysis.h2Count} H2-Überschriften enthalten das FKW`);
                } else if (newAnalysis.h2WithFkw === 0) {
                  newRecommendations.push(`✗ Füge "${data.focusKeyword}" in mindestens ${targetH2s} von ${newAnalysis.h2Count} H2-Überschriften ein`);
                } else if (h2sNeeded > 0) {
                  newRecommendations.push(`○ Füge "${data.focusKeyword}" in ${h2sNeeded} weitere H2-Überschrift${h2sNeeded > 1 ? 'en' : ''} ein (aktuell: ${newAnalysis.h2WithFkw}/${newAnalysis.h2Count})`);
                } else {
                  newRecommendations.push(`✓ ${newAnalysis.h2WithFkw}/${newAnalysis.h2Count} H2-Überschriften enthalten das FKW (≥50%)`);
                }
              }
              
              // Density recommendation
              if (newAnalysis.densityStatus === 'too_low') {
                const currentDensity = newAnalysis.fkwDensity.toFixed(2);
                const wordsNeeded = Math.ceil((0.5 * newAnalysis.totalWords / 100) - newAnalysis.fkwOccurrences);
                if (wordsNeeded > 0) {
                  newRecommendations.push(`✗ Keyword-Dichte zu niedrig (${currentDensity}%). Füge "${data.focusKeyword}" ca. ${wordsNeeded}× mehr im Text ein`);
                } else {
                  newRecommendations.push(`○ Keyword-Dichte leicht erhöhen (${currentDensity}% → Ziel: 0.5-2.0%)`);
                }
              } else if (newAnalysis.densityStatus === 'too_high') {
                const currentDensity = newAnalysis.fkwDensity.toFixed(2);
                newRecommendations.push(`✗ Keyword-Dichte zu hoch (${currentDensity}%). Reduziere die Verwendung von "${data.focusKeyword}"`);
              } else {
                newRecommendations.push(`✓ Keyword-Dichte optimal (${newAnalysis.fkwDensity.toFixed(2)}%)`);
              }
              
              // H3 recommendation
              if (newAnalysis.h3Count > 0 && newAnalysis.h3WithFkw === 0) {
                newRecommendations.push(`○ Optional: Füge "${data.focusKeyword}" in eine H3-Überschrift ein (+10 Punkte)`);
              } else if (newAnalysis.h3WithFkw > 0) {
                newRecommendations.push(`✓ ${newAnalysis.h3WithFkw} H3-Überschrift${newAnalysis.h3WithFkw > 1 ? 'en' : ''} enthält das FKW`);
              }
              
              setFkwContentRecommendations(newRecommendations);
              
              console.log('[SEO Editor] Updated after H2 apply:', {
                score: newScore,
                h2WithFkw: newAnalysis.h2WithFkw,
                h2Count: newAnalysis.h2Count
              });
            } catch (e) {
              console.error('[SEO Editor] Error recalculating FKW analysis:', e);
            }
          }
        }
      }
      
      toast.success('H2 aktualisiert! Content Score wurde neu berechnet.');
    } catch (error) {
      console.error('[SEO Editor] Error applying H2:', error);
      toast.error('Failed to apply H2 suggestion');
    } finally {
      setIsApplyingH2(null);
    }
  };

  // Remove FKW from H2 headline (revert to simple headline without keyword)
  const handleRemoveH2Optimization = async (suggestion: typeof h2Suggestions[0], index: number) => {
    setIsApplyingH2(index);
    
    console.log('[SEO Editor] === REMOVING H2 OPTIMIZATION ===');
    console.log('[SEO Editor] Removing FKW from:', suggestion.originalText);
    
    try {
      // Get current page_segments from database
      const { data: contentData, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage)
        .eq('section_key', 'page_segments')
        .maybeSingle();
      
      if (fetchError || !contentData) {
        toast.error('Error fetching page segments');
        return;
      }
      
      let segments = JSON.parse(contentData.content_value);
      let updated = false;
      const fkw = data.focusKeyword || '';
      
      // Find and remove FKW from the H2
      segments = segments.map((seg: any) => {
        const segIdMatch = String(seg.segmentId || seg.id) === String(suggestion.segmentId);
        
        if (segIdMatch) {
          const segType = seg.type || '';
          const segData = seg.data ? { ...seg.data } : {};
          
          // Handle image-text segments
          if (segType === 'image-text' && segData.title) {
            const currentTitle = segData.title;
            // Remove FKW variations (case-insensitive, with possible surrounding spaces/punctuation)
            const regex = new RegExp(`\\s*[-–—:]?\\s*${fkw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—:]?\\s*`, 'gi');
            const newTitle = currentTitle.replace(regex, ' ').trim().replace(/\s+/g, ' ');
            
            if (newTitle !== currentTitle) {
              console.log('[SEO Editor] Removing FKW from H2:', { from: currentTitle, to: newTitle });
              segData.title = newTitle;
              updated = true;
            }
            return { ...seg, data: segData };
          }
          
          // Handle other segment types with title field
          if (['feature-overview', 'tiles', 'table', 'faq'].includes(segType) && segData.title) {
            const currentTitle = segData.title;
            const regex = new RegExp(`\\s*[-–—:]?\\s*${fkw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—:]?\\s*`, 'gi');
            const newTitle = currentTitle.replace(regex, ' ').trim().replace(/\s+/g, ' ');
            
            if (newTitle !== currentTitle) {
              segData.title = newTitle;
              updated = true;
            }
            return { ...seg, data: segData };
          }
        }
        return seg;
      });
      
      if (!updated) {
        toast.info('Keine FKW-Optimierung gefunden, die entfernt werden könnte');
        return;
      }
      
      // Save back to database
      const { error: saveError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentData.id);
      
      if (saveError) {
        toast.error('Failed to save: ' + saveError.message);
        return;
      }
      
      // Remove from suggestions list
      setH2Suggestions(prev => prev.filter((_, i) => i !== index));
      
      // Refresh and recalculate
      const { data: refreshedContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage);
      
      if (refreshedContent) {
        setPageContent(refreshedContent);
        
        if (data.focusKeyword) {
          const pageSegmentsEntry = refreshedContent.find((item: any) => item.section_key === 'page_segments');
          if (pageSegmentsEntry) {
            const updatedSegments = JSON.parse(pageSegmentsEntry.content_value);
            const newAnalysis = await recalculateFkwAnalysis(updatedSegments, data.focusKeyword);
            setFkwContentAnalysis(newAnalysis);
          }
        }
      }
      
      toast.success('H2-Optimierung entfernt');
    } catch (error) {
      console.error('[SEO Editor] Error removing H2 optimization:', error);
      toast.error('Fehler beim Entfernen der H2-Optimierung');
    } finally {
      setIsApplyingH2(null);
    }
  };

  // Remove FKW from H3 headline
  const handleRemoveH3Optimization = async (suggestion: typeof h3Suggestions[0], index: number) => {
    setIsApplyingH3(index);
    
    console.log('[SEO Editor] === REMOVING H3 OPTIMIZATION ===');
    
    try {
      const { data: contentData, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage)
        .eq('section_key', 'page_segments')
        .maybeSingle();
      
      if (fetchError || !contentData) {
        toast.error('Error fetching page segments');
        return;
      }
      
      let segments = JSON.parse(contentData.content_value);
      let updated = false;
      const fkw = data.focusKeyword || '';
      
      segments = segments.map((seg: any) => {
        const segIdMatch = String(seg.segmentId || seg.id) === String(suggestion.segmentId);
        
        if (segIdMatch) {
          const segType = seg.type || '';
          const segData = seg.data ? { ...seg.data } : {};
          
          // Handle image-text segments - items[].title is H3
          if (segType === 'image-text' && segData.items && Array.isArray(segData.items)) {
            const itemIdx = suggestion.itemIndex ?? -1;
            if (itemIdx >= 0 && segData.items[itemIdx]) {
              const currentTitle = segData.items[itemIdx].title || '';
              const regex = new RegExp(`\\s*[-–—:]?\\s*${fkw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—:]?\\s*`, 'gi');
              const newTitle = currentTitle.replace(regex, ' ').trim().replace(/\s+/g, ' ');
              
              if (newTitle !== currentTitle) {
                segData.items[itemIdx] = { ...segData.items[itemIdx], title: newTitle };
                updated = true;
              }
            }
            return { ...seg, data: segData };
          }
          
          // Handle feature-overview - items[].title is H3
          if (segType === 'feature-overview' && segData.items && Array.isArray(segData.items)) {
            const itemIdx = suggestion.itemIndex ?? -1;
            if (itemIdx >= 0 && segData.items[itemIdx]) {
              const currentTitle = segData.items[itemIdx].title || '';
              const regex = new RegExp(`\\s*[-–—:]?\\s*${fkw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[-–—:]?\\s*`, 'gi');
              const newTitle = currentTitle.replace(regex, ' ').trim().replace(/\s+/g, ' ');
              
              if (newTitle !== currentTitle) {
                segData.items[itemIdx] = { ...segData.items[itemIdx], title: newTitle };
                updated = true;
              }
            }
            return { ...seg, data: segData };
          }
        }
        return seg;
      });
      
      if (!updated) {
        toast.info('Keine FKW-Optimierung gefunden');
        return;
      }
      
      const { error: saveError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentData.id);
      
      if (saveError) {
        toast.error('Failed to save: ' + saveError.message);
        return;
      }
      
      setH3Suggestions(prev => prev.filter((_, i) => i !== index));
      
      const { data: refreshedContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage);
      
      if (refreshedContent) {
        setPageContent(refreshedContent);
        
        if (data.focusKeyword) {
          const pageSegmentsEntry = refreshedContent.find((item: any) => item.section_key === 'page_segments');
          if (pageSegmentsEntry) {
            const updatedSegments = JSON.parse(pageSegmentsEntry.content_value);
            const newAnalysis = await recalculateFkwAnalysis(updatedSegments, data.focusKeyword);
            setFkwContentAnalysis(newAnalysis);
          }
        }
      }
      
      toast.success('H3-Optimierung entfernt');
    } catch (error) {
      console.error('[SEO Editor] Error removing H3 optimization:', error);
      toast.error('Fehler beim Entfernen der H3-Optimierung');
    } finally {
      setIsApplyingH3(null);
    }
  };

  // Generate Smart H3 Headlines using AI
  const handleGenerateH3Headlines = async () => {
    setIsGeneratingH3(true);
    setH3Suggestions([]);
    setShowH3Suggestions(false);

    if (!data.focusKeyword) {
      toast.error('Please define a Focus Keyword first');
      setIsGeneratingH3(false);
      return;
    }

    try {
      // Get existing H3 headings from page segments
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      let existingH3s: Array<{ text: string; segmentType: string; segmentId: number | string; segmentKey: string; itemIndex: number }> = [];
      let availableSegments: Array<{ type: string; key: string; id: string | number }> = [];
      
      if (pageSegmentsEntry) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          availableSegments = segments.map((seg: any) => ({
            type: seg.type || seg.segmentType || 'unknown',
            key: seg.segmentKey || seg.id || '',
            id: seg.segmentId || seg.id || seg.segmentKey || ''
          }));
          
          // Extract H3 headings from each segment type
          segments.forEach((seg: any) => {
            const segData = seg.data || seg;
            const segType = seg.type || '';
            const segId = seg.segmentId || seg.id || '';
            const segKey = seg.segmentKey || seg.id || '';
            
            // Image-Text segments: items[].title is H3
            if (segType === 'image-text' && segData.items && Array.isArray(segData.items)) {
              segData.items.forEach((item: any, idx: number) => {
                if (item.title) {
                  existingH3s.push({
                    text: item.title,
                    segmentType: segType,
                    segmentId: segId,
                    segmentKey: segKey,
                    itemIndex: idx
                  });
                }
              });
            }
            
            // Feature overview, tiles, faq - their items[].title are H3
            if (['feature-overview', 'tiles', 'faq'].includes(segType)) {
              const items = segData.items || [];
              items.forEach((item: any, idx: number) => {
                const title = item.title || item.question || '';
                if (title) {
                  existingH3s.push({
                    text: title,
                    segmentType: segType,
                    segmentId: segId,
                    segmentKey: segKey,
                    itemIndex: idx
                  });
                }
              });
            }
          });
          
          console.log('[SEO Editor] Extracted H3 headings:', existingH3s);
        } catch (parseError) {
          console.error('[SEO Editor] Failed to parse page_segments:', parseError);
        }
      }

      const pageData = {
        title: data.title,
        metaDescription: data.metaDescription,
        h1: data.h1,
        introduction: data.introduction,
        slug: data.slug,
        pageSlug: pageSlug,
      };

      console.log('[SEO Editor] Generating H3 headlines with data:', { pageData, existingH3s: existingH3s.length });

      const { data: result, error } = await supabase.functions.invoke('generate-h3-headlines', {
        body: { 
          pageData,
          focusKeyword: data.focusKeyword,
          existingH3s,
          segments: availableSegments
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating H3:', error);
        toast.error('Error generating H3: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.suggestions && Array.isArray(result.suggestions)) {
        console.log('[SEO Editor] Generated H3 suggestions:', result.suggestions);
        
        // Mark already-optimized H3s (those that already contain FKW) as pre-applied
        const suggestionsWithStatus = result.suggestions.map((s: any) => {
          const alreadyHasFkw = s.originalText && data.focusKeyword &&
            s.originalText.toLowerCase().includes(data.focusKeyword.toLowerCase());
          return {
            ...s,
            applied: alreadyHasFkw,
            alreadyOptimized: alreadyHasFkw
          };
        });
        
        // Also add H3s that are already optimized (contain FKW) but weren't suggested
        const suggestedOriginals = suggestionsWithStatus.map((s: any) => s.originalText?.toLowerCase());
        const alreadyOptimizedH3s = existingH3s
          .filter((h3: any) => {
            const hasFkw = h3.text && data.focusKeyword &&
              h3.text.toLowerCase().includes(data.focusKeyword.toLowerCase());
            const notAlreadySuggested = !suggestedOriginals.includes(h3.text.toLowerCase());
            return hasFkw && notAlreadySuggested;
          })
          .map((h3: any) => ({
            originalText: h3.text,
            suggestedText: h3.text,
            segmentId: h3.segmentId,
            segmentType: h3.segmentType,
            segmentKey: h3.segmentKey,
            itemIndex: h3.itemIndex,
            reason: 'Already contains Focus Keyword - no changes needed',
            characterCount: h3.text.length,
            priority: 99,
            applied: true,
            alreadyOptimized: true
          }));
        
        const allSuggestions = [...suggestionsWithStatus, ...alreadyOptimizedH3s]
          .sort((a, b) => {
            if (a.applied && !b.applied) return 1;
            if (!a.applied && b.applied) return -1;
            return (a.priority || 99) - (b.priority || 99);
          });
        
        setH3Suggestions(allSuggestions);
        setShowH3Suggestions(true);
        
        const needsOptimization = allSuggestions.filter((s: any) => !s.alreadyOptimized).length;
        const alreadyOptimized = allSuggestions.filter((s: any) => s.alreadyOptimized).length;
        toast.success(`${needsOptimization} H3s to optimize, ${alreadyOptimized} already contain FKW`);
      } else {
        toast.error('No H3 suggestions generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating H3');
    } finally {
      setIsGeneratingH3(false);
    }
  };

  // Apply Smart H3 suggestion to segment
  const handleApplyH3Suggestion = async (suggestion: typeof h3Suggestions[0], index: number) => {
    setIsApplyingH3(index);
    
    console.log('[SEO Editor] === APPLYING H3 SUGGESTION ===');
    console.log('[SEO Editor] Suggestion:', {
      originalText: suggestion.originalText,
      suggestedText: suggestion.suggestedText,
      segmentId: suggestion.segmentId,
      segmentType: suggestion.segmentType,
      itemIndex: suggestion.itemIndex
    });
    
    try {
      // Get current page_segments from database
      const { data: contentData, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage)
        .eq('section_key', 'page_segments')
        .maybeSingle();
      
      if (fetchError) {
        console.error('[SEO Editor] Fetch error:', fetchError);
        toast.error('Error fetching page segments: ' + fetchError.message);
        return;
      }
      
      if (!contentData) {
        console.error('[SEO Editor] No page segments found for:', { pageSlug, editorLanguage });
        toast.error('Page segments not found');
        return;
      }
      
      let segments = JSON.parse(contentData.content_value);
      let updated = false;
      
      // Find and update the H3 in the correct segment
      segments = segments.map((seg: any) => {
        const segIdMatch = String(seg.segmentId || seg.id) === String(suggestion.segmentId);
        
        if (segIdMatch) {
          const segType = seg.type || '';
          const segData = seg.data ? { ...seg.data } : {};
          
          // For all segment types with items array
          if (segData.items && Array.isArray(segData.items)) {
            segData.items = segData.items.map((item: any, idx: number) => {
              // Match by item index if provided, otherwise by title
              const matchByIndex = suggestion.itemIndex !== undefined && suggestion.itemIndex !== null && idx === suggestion.itemIndex;
              const itemTitle = (item.title || item.question || '').trim();
              const originalTitle = (suggestion.originalText || '').trim();
              const matchByTitle = itemTitle === originalTitle;
              
              if (matchByIndex || matchByTitle) {
                console.log(`[SEO Editor] ✓ MATCH in ${segType} item ${idx}:`, {
                  from: item.title || item.question,
                  to: suggestion.suggestedText
                });
                updated = true;
                
                // Handle FAQ questions vs regular titles
                if (segType === 'faq' && item.question) {
                  return { ...item, question: suggestion.suggestedText };
                }
                return { ...item, title: suggestion.suggestedText };
              }
              return item;
            });
          }
          
          return { ...seg, data: segData };
        }
        return seg;
      });
      
      if (!updated) {
        console.error('[SEO Editor] Could not find H3 to update');
        toast.error('Could not find H3 to update');
        return;
      }
      
      // Save back to database
      const { error: saveError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentData.id);
      
      if (saveError) {
        console.error('[SEO Editor] Save error:', saveError);
        toast.error('Failed to save: ' + saveError.message);
        return;
      }
      
      console.log('[SEO Editor] ✓ Successfully saved H3 update to database');
      
      // Update suggestion state
      setH3Suggestions(prev => prev.map((s, i) => 
        i === index ? { ...s, applied: true } : s
      ));
      
      // Refresh page content and recalculate FKW analysis
      const { data: refreshedContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage);
      
      if (refreshedContent) {
        setPageContent(refreshedContent);
        
        if (data.focusKeyword) {
          const pageSegmentsEntry = refreshedContent.find((item: any) => item.section_key === 'page_segments');
          if (pageSegmentsEntry) {
            try {
              const updatedSegments = JSON.parse(pageSegmentsEntry.content_value);
              const newAnalysis = await recalculateFkwAnalysis(updatedSegments, data.focusKeyword);
              setFkwContentAnalysis(newAnalysis);
              
              // Recalculate score
              let newScore = 0;
              const actualH1HasFkw = data.h1 && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase());
              if (actualH1HasFkw) newScore += 25;
              if (newAnalysis.introHasFkw) newScore += 20;
              if (newAnalysis.h2WithFkw > 0) newScore += 15;
              if (newAnalysis.h2Count > 0 && newAnalysis.h2WithFkw >= Math.ceil(newAnalysis.h2Count / 2)) newScore += 10;
              if (newAnalysis.densityStatus === 'optimal') newScore += 20;
              else if (newAnalysis.densityStatus === 'too_low' && newAnalysis.fkwDensity >= 0.3) newScore += 10;
              if (newAnalysis.h3WithFkw > 0) newScore += 10;
              setFkwContentScore(Math.min(100, newScore));
              
              console.log('[SEO Editor] Updated after H3 apply:', {
                score: newScore,
                h3WithFkw: newAnalysis.h3WithFkw,
                h3Count: newAnalysis.h3Count
              });
            } catch (e) {
              console.error('[SEO Editor] Error recalculating FKW analysis:', e);
            }
          }
        }
      }
      
      toast.success('H3 aktualisiert! Content Score wurde neu berechnet.');
    } catch (error) {
      console.error('[SEO Editor] Error applying H3:', error);
      toast.error('Failed to apply H3 suggestion');
    } finally {
      setIsApplyingH3(null);
    }
  };

  // Generate Smart Intro Text using AI
  const handleGenerateIntroText = async () => {
    setIsGeneratingIntro(true);
    setGeneratedIntro(null);
    setShowGeneratedIntro(false);

    try {
      // Collect page content for context
      let segmentContent = '';
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      if (pageSegmentsEntry) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          // Extract text content from segments for context
          segmentContent = segments.map((seg: any) => {
            const data = seg.data || {};
            return [
              data.title, data.titleLine1, data.titleLine2,
              data.subtitle, data.description, data.text
            ].filter(Boolean).join(' ');
          }).filter(Boolean).join(' ').slice(0, 1000); // Limit context
        } catch (e) {
          console.error('[SEO Editor] Failed to parse page_segments for context:', e);
        }
      }

      const pageData = {
        title: data.title,
        metaDescription: data.metaDescription,
        h1: data.h1,
        currentIntro: introductionText.description || '',
        slug: data.slug,
        pageSlug: pageSlug,
        segmentContent
      };

      console.log('[SEO Editor] Generating intro text with data:', pageData);

      const { data: result, error } = await supabase.functions.invoke('generate-intro-text', {
        body: { 
          pageData,
          focusKeyword: data.focusKeyword,
          language: editorLanguage
        }
      });

      if (error) {
        console.error('[SEO Editor] Error generating intro:', error);
        toast.error('Error generating intro: ' + error.message);
        return;
      }

      if (result?.error) {
        console.error('[SEO Editor] API error:', result.error);
        toast.error(result.error);
        return;
      }

      if (result?.introText) {
        console.log('[SEO Editor] Generated intro:', result);
        setGeneratedIntro(result);
        setShowGeneratedIntro(true);
        toast.success('Intro text generated successfully');
      } else {
        toast.error('No intro text generated');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unexpected error generating intro');
    } finally {
      setIsGeneratingIntro(false);
    }
  };

  // Apply generated intro to the Intro segment
  const handleApplyIntroToSegment = async () => {
    if (!generatedIntro) {
      toast.error('No generated intro text available.');
      return;
    }

    if (isApplyingIntro) {
      return;
    }

    setIsApplyingIntro(true);

    try {
      // Load page_segments content FIRST to find which intro segments actually exist
      // CRITICAL: page_segments is typically stored in 'en' only, so we need fallback logic
      let pageSegmentsRow = null;
      
      // First try current language
      const { data: currentLangData, error: currentLangError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', editorLanguage)
        .maybeSingle();
      
      if (currentLangData) {
        pageSegmentsRow = currentLangData;
      } else if (editorLanguage !== 'en') {
        // Fallback to 'en' if not found in current language
        console.log('[SEO Editor] page_segments not found in', editorLanguage, '- trying EN fallback');
        const { data: enData, error: enError } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', 'en')
          .maybeSingle();
        
        if (enData) {
          pageSegmentsRow = enData;
          console.log('[SEO Editor] Using EN fallback for page_segments');
        }
      }

      if (!pageSegmentsRow) {
        console.error('[SEO Editor] Failed to load page_segments - not found in any language');
        toast.error('page_segments not found', { duration: 5000 });
        setIsApplyingIntro(false);
        return;
      }

      try {
        const segments = JSON.parse(pageSegmentsRow.content_value);
        
        // Find intro segments that actually exist in page_segments
        const introSegmentsInPage = segments.filter((seg: any) => seg.type === 'intro');
        
        console.log('[SEO Editor] Found intro segments in page_segments:', introSegmentsInPage.map((s: any) => s.id));
        
        if (introSegmentsInPage.length === 0) {
          toast.error('No intro segment found on this page. Please create an intro segment first.', { duration: 5000 });
          setIsApplyingIntro(false);
          return;
        }
        
        // Use the first intro segment found in page_segments (or use introSourceInfo if available)
        let targetIntroId = introSegmentsInPage[0].id;
        
        // If we have introSourceInfo from detection, prefer that segment
        if (introSourceInfo?.id) {
          const matchingIntro = introSegmentsInPage.find((seg: any) => String(seg.id) === String(introSourceInfo.id));
          if (matchingIntro) {
            targetIntroId = matchingIntro.id;
            console.log('[SEO Editor] Using detected intro segment:', targetIntroId);
          }
        }
        
        console.log('[SEO Editor] Target intro segment ID:', targetIntroId);
        
        // Find the intro segment index by its ID
        const introIndex = segments.findIndex((seg: any) => 
          String(seg.id) === String(targetIntroId) && seg.type === 'intro'
        );
        
        if (introIndex === -1) {
          console.error('[SEO Editor] Intro segment not found at expected index');
          toast.error('Intro segment not found', { duration: 5000 });
          setIsApplyingIntro(false);
          return;
        }
        
        // Update the intro segment description
        // CRITICAL: Set BOTH introText and description to ensure Frontend picks up the new value
        // Frontend prioritizes introText over description, so we must update both
        segments[introIndex].data = {
          ...segments[introIndex].data,
          introText: generatedIntro.introText,
          description: generatedIntro.introText
        };
        
        console.log('[SEO Editor] Updated intro segment with new description:', segments[introIndex]);
        
        // Save the updated page_segments
        const { error: updateError } = await supabase
          .from('page_content')
          .update({ 
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsRow.id);
        
        if (updateError) {
          console.error('[SEO Editor] Failed to save page_segments:', updateError);
          toast.error(`Save failed: ${updateError.message}`, { duration: 5000 });
          setIsApplyingIntro(false);
          return;
        }
        
        console.log('[SEO Editor] Successfully saved Intro with new description');
        
        toast.success(`Intro text successfully applied to segment ${targetIntroId}`);
        
        // Refresh page content
        const { data: refreshedContent } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('language', editorLanguage);
        
        if (refreshedContent) {
          setPageContent(refreshedContent);
        }
        
        // Update the introduction text display
        setIntroductionText(prev => ({
          ...prev,
          description: generatedIntro.introText
        }));
        
        // Clear selection after applying
        setShowGeneratedIntro(false);
        setGeneratedIntro(null);
        
        // Auto-save SEO changes
        console.log('[SEO Editor] Auto-saving SEO changes after Intro update...');
        setTimeout(() => {
          onSave();
          toast.success('Intro saved automatically', { duration: 3000 });
        }, 100);
        
      } catch (parseError) {
        console.error('[SEO Editor] Failed to parse page_segments:', parseError);
        toast.error('Fehler beim Parsen der page_segments', { duration: 5000 });
      }
    } catch (error) {
      console.error('[SEO Editor] Error applying intro:', error);
      toast.error('Fehler beim Anwenden des Intros');
    } finally {
      setIsApplyingIntro(false);
    }
  };

  const handleSelectH1 = (suggestion: typeof h1Suggestions[0]) => {
    // Use placementOptions if available, otherwise convert from placementSuggestion
    let allPlacementOptions = suggestion.placementOptions || [];
    
    // Fallback: convert old format
    if (allPlacementOptions.length === 0 && suggestion.placementSuggestion) {
      const segmentKey = suggestion.placementSuggestion.segmentKey;
      const segmentType = suggestion.placementSuggestion.segmentType;
      let segmentId = suggestion.placementSuggestion.segmentId;
      
      if (!segmentId && (segmentKey || segmentType)) {
        const foundSegment = segmentRegistry.find(seg => 
          (segmentKey && seg.segment_key === segmentKey && !seg.deleted) ||
          (!segmentKey && segmentType && seg.segment_type === segmentType && !seg.deleted)
        );
        segmentId = foundSegment?.segment_id;
      }
      
      allPlacementOptions = [{
        rank: 1,
        segmentType: segmentType,
        segmentKey: segmentKey,
        segmentId: segmentId || null,
        createNew: !segmentKey,
        suggestedTabPosition: 1,
        note: suggestion.placementSuggestion.note
      }];
    }
    
    // Enrich placement options with segment IDs from actual page_content (not registry)
    // Parse page_segments to get real segment IDs
    const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
    let actualSegments: any[] = [];
    if (pageSegmentsEntry) {
      try {
        actualSegments = JSON.parse(pageSegmentsEntry.content_value);
      } catch (e) {
        console.error('[SEO Editor] Failed to parse page_segments for enrichment:', e);
      }
    }
    
    // CRITICAL: Check for EXISTING Intro segments in both page_content AND segment_registry
    // Intro segments are stored DIRECTLY in page_content, NOT in page_segments JSON
    const existingIntroRegistry = segmentRegistry.find(seg => seg.segment_type === 'intro' && !seg.deleted);
    const existingIntroContent = existingIntroRegistry 
      ? pageContent.find(item => item.section_key === existingIntroRegistry.segment_key)
      : null;
    
    console.log('[SEO Editor] Checking for existing Intro:', {
      existingIntroRegistry,
      existingIntroContent: existingIntroContent ? { key: existingIntroContent.section_key } : null
    });
    
    allPlacementOptions = allPlacementOptions.map(opt => {
      // IMPORTANT: If this option suggests "intro" with createNew=true,
      // but we ALREADY have an intro segment, convert it to use the existing one
      if (opt.segmentType === 'intro' && opt.createNew && existingIntroRegistry && existingIntroContent) {
        console.log('[SEO Editor] Converting "create new intro" to "use existing intro"');
        return {
          ...opt,
          segmentKey: existingIntroRegistry.segment_key,
          segmentId: existingIntroRegistry.segment_id,
          createNew: false,
          note: `Apply H1 to existing intro segment (ID: ${existingIntroRegistry.segment_id})`
        };
      }
      
      // First try to find by key in actual segments (for non-intro segments)
      if (opt.segmentKey && opt.segmentType !== 'intro') {
        const foundInContent = actualSegments.find((seg: any) => 
          seg.id === opt.segmentKey || 
          seg.segmentKey === opt.segmentKey
        );
        if (foundInContent) {
          return { 
            ...opt, 
            segmentId: foundInContent.segmentId || foundInContent.id || opt.segmentKey 
          };
        }
      }
      
      // If segment type matches, find first matching segment in actual content
      if (!opt.segmentId && opt.segmentType && opt.segmentType !== 'intro') {
        const typesToMatch = [opt.segmentType];
        if (opt.segmentType === 'product-hero' || opt.segmentType === 'product-hero-gallery') {
          typesToMatch.push('hero');
        }
        if (opt.segmentType === 'hero') {
          typesToMatch.push('product-hero', 'product-hero-gallery');
        }
        
        const foundByType = actualSegments.find((seg: any) => 
          typesToMatch.includes(seg.type) || typesToMatch.includes(seg.segmentType)
        );
        if (foundByType) {
          return { 
            ...opt, 
            segmentId: foundByType.segmentId || foundByType.id,
            segmentKey: foundByType.segmentKey || foundByType.id 
          };
        }
      }
      
      return opt;
    });
    
    handleChange('h1', suggestion.headline);
    setSelectedH1Suggestion({
      headline: suggestion.headline,
      selectedPlacement: allPlacementOptions[0] || null,
      allPlacementOptions
    });
    setShowH1Suggestions(false);
    setH1ChangeLog(null);
    toast.success(`H1 "${suggestion.headline}" selected`);
  };

  // Change selected placement option
  const handleChangePlacement = (placementIndex: number) => {
    if (!selectedH1Suggestion) return;
    const newPlacement = selectedH1Suggestion.allPlacementOptions[placementIndex];
    if (newPlacement) {
      setSelectedH1Suggestion({
        ...selectedH1Suggestion,
        selectedPlacement: newPlacement
      });
      toast.info(`Placement changed: ${getSegmentLabel(newPlacement.segmentType, newPlacement.segmentKey || '')}`);
    }
  };

  // Helper to get readable segment label
  // IMPORTANT: There is NO "hero" segment type - only product-hero, full-hero, action-hero, product-hero-gallery
  const getSegmentLabel = (segmentType: string, segmentKey: string): string => {
    const typeLabels: Record<string, string> = {
      'full_hero': 'Full Hero',
      'full-hero': 'Full Hero',
      'hero': 'Product Hero', // Legacy mapping - "hero" is really product-hero
      'product-hero': 'Product Hero',
      'product_hero': 'Product Hero',
      'product-hero-gallery': 'Product Hero Gallery',
      'product_hero_gallery': 'Product Hero Gallery',
      'action-hero': 'Action Hero',
      'action_hero': 'Action Hero',
      'intro': 'Intro',
      'tiles': 'Tiles',
      'image-text': 'Image-Text',
      'banner': 'Banner',
      
      'faq': 'FAQ',
      'specification': 'Specification',
      'table': 'Table',
      'video': 'Video',
      'news': 'News',
      'events': 'Events',
      'downloads': 'Downloads',
      'products': 'Products',
      'product-list': 'Product List',
      'feature-overview': 'Feature Overview',
      'news-list': 'News List',
      'downloads-list': 'Downloads List',
      'events-list': 'Events List',
      'footer': 'Footer',
      'industries': 'Industries',
      'debug': 'Debug',
    };
    return typeLabels[segmentType] || segmentType;
  };
  
  // Helper to check if segment type stores data in page_segments JSON
  // IMPORTANT: "hero" is legacy for product-hero
  const isPageSegmentType = (segmentType: string): boolean => {
    return ['full-hero', 'full_hero', 'action-hero', 'hero', 'product-hero', 'product-hero-gallery', 'banner'].includes(segmentType);
  };

  // Apply H1 to the suggested segment and convert old H1 to H2
  const handleApplyH1ToSegment = async () => {
    if (!selectedH1Suggestion || !selectedH1Suggestion.selectedPlacement) {
      toast.error('No H1 suggestion or placement selected.');
      return;
    }
    
    // Prevent double clicks
    if (isApplyingH1) {
      console.log('[SEO Editor] Already applying H1, ignoring click');
      return;
    }
    
    setIsApplyingH1(true);
    setH1ChangeLog(null);
    
    const placement = selectedH1Suggestion.selectedPlacement;
    const newH1 = selectedH1Suggestion.headline;
    
    console.log('[SEO Editor] Starting H1 application:', {
      newH1,
      placement,
      segmentRegistry: segmentRegistry.map(s => ({ id: s.segment_id, key: s.segment_key, type: s.segment_type }))
    });
    
    try {
      // Check if we need to create a new segment
      if (placement.createNew) {
        toast.info(`Creating new ${getSegmentLabel(placement.segmentType, '')} segment...`, { duration: 5000 });
        setIsCreatingSegment(true);
        
        toast.warning(
          `Please create a "${getSegmentLabel(placement.segmentType, '')}" segment at position ${placement.suggestedTabPosition} in the Tab Editor first. Then you can apply the H1.`,
          { duration: 8000 }
        );
        setIsApplyingH1(false);
        setIsCreatingSegment(false);
        return;
      }
      
      const targetSegmentKey = placement.segmentKey;
      const targetSegmentType = placement.segmentType;
      const targetSegmentId = placement.segmentId;
      
      // Find current H1 source to potentially convert to H2
      const oldH1Source = h1SourceInfo;
      const oldH1Text = data.h1;
      
      console.log('[SEO Editor] Applying H1:', {
        newH1,
        targetSegmentKey,
        targetSegmentType,
        targetSegmentId,
        oldH1Source,
        segmentRegistryCount: segmentRegistry.length,
        pageContentCount: pageContent.length
      });

      // SPECIAL HANDLING: Intro segments are stored INSIDE page_segments array, NOT as separate section_key
      if (targetSegmentType === 'intro' && targetSegmentId) {
        console.log('[SEO Editor] Intro segment detected - searching in page_segments array');
        
        // Load page_segments content
        const { data: pageSegmentsRow, error: loadError } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', editorLanguage)
          .maybeSingle();
        
        if (loadError || !pageSegmentsRow) {
          console.error('[SEO Editor] Failed to load page_segments:', loadError);
          toast.error(`page_segments not found for ${pageSlug}`, { duration: 5000 });
          setIsApplyingH1(false);
          return;
        }
        
        try {
          const segments = JSON.parse(pageSegmentsRow.content_value);
          console.log('[SEO Editor] Looking for intro segment with ID:', targetSegmentId);
          
          // Find the intro segment by its ID in the page_segments array
          const introIndex = segments.findIndex((seg: any) => 
            String(seg.id) === String(targetSegmentId) && seg.type === 'intro'
          );
          
          if (introIndex === -1) {
            console.error('[SEO Editor] Intro segment not found in page_segments. Available segments:', 
              segments.map((s: any) => ({ id: s.id, type: s.type })));
            toast.error(`Intro segment ${targetSegmentId} not found in page_segments`, { duration: 5000 });
            setIsApplyingH1(false);
            return;
          }
          
          // Update the intro segment in the array
          segments[introIndex].data = {
            ...segments[introIndex].data,
            title: newH1,
            headingLevel: 'h1'
          };
          
          console.log('[SEO Editor] Updated intro segment:', segments[introIndex]);
          
          // Save the updated page_segments
          const { error: updateError } = await supabase
            .from('page_content')
            .update({ 
              content_value: JSON.stringify(segments),
              updated_at: new Date().toISOString()
            })
            .eq('id', pageSegmentsRow.id);
          
          if (updateError) {
            console.error('[SEO Editor] Failed to save page_segments:', updateError);
            toast.error(`Speichern fehlgeschlagen: ${updateError.message}`, { duration: 5000 });
            setIsApplyingH1(false);
            return;
          }
          
          console.log('[SEO Editor] Successfully saved Intro with updated H1 in page_segments');
          
          // Build target segment info for changelog
          const targetSegmentInfo = {
            id: targetSegmentId || 0,
            key: targetSegmentKey,
            type: 'intro',
            label: 'Intro'
          };

          // Prepare changelog entry
          let changeLogEntry: typeof h1ChangeLog = {
            timestamp: new Date().toISOString(),
            newH1,
            targetSegment: {
              id: typeof targetSegmentInfo.id === 'string' ? parseInt(targetSegmentInfo.id) || 0 : (targetSegmentInfo.id as number),
              key: targetSegmentInfo.key,
              type: targetSegmentInfo.type,
              label: targetSegmentInfo.label
            }
          };

          // If old H1 is in a different segment, convert it to H2
          if (oldH1Source && oldH1Source.key !== targetSegmentKey) {
            // Handle old H1 conversion (same logic as below)
            if (isPageSegmentType(oldH1Source.type)) {
              const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
              if (pageSegmentsEntry) {
                try {
                  const segments = JSON.parse(pageSegmentsEntry.content_value);
                  const oldIdx = segments.findIndex((seg: any) => seg.id === oldH1Source.key || seg.id === oldH1Source.id);
                  
                  if (oldIdx !== -1) {
                    if (segments[oldIdx].data.titleLine1) {
                      segments[oldIdx].data.subtitle = segments[oldIdx].data.titleLine1 + (segments[oldIdx].data.titleLine2 ? ' ' + segments[oldIdx].data.titleLine2 : '');
                      segments[oldIdx].data.titleLine1 = '';
                      segments[oldIdx].data.titleLine2 = '';
                    } else if (segments[oldIdx].data.title) {
                      segments[oldIdx].data.subtitle = segments[oldIdx].data.title;
                      segments[oldIdx].data.title = '';
                    }
                    
                    if (segments[oldIdx].data.hasOwnProperty('useH1')) {
                      segments[oldIdx].data.useH1 = false;
                    }
                    
                    await supabase
                      .from('page_content')
                      .update({ 
                        content_value: JSON.stringify(segments),
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', pageSegmentsEntry.id);
                    
                    changeLogEntry.oldH1 = {
                      text: oldH1Text || '',
                      segment: { key: oldH1Source.key, label: oldH1Source.label },
                      action: 'Zu H2 konvertiert'
                    };
                  }
                } catch (e) {
                  console.error('[SEO Editor] Failed to update old segment in page_segments:', e);
                }
              }
            }
          }

          // Set the changelog for display
          setH1ChangeLog(changeLogEntry);
          
          toast.success(`H1 successfully set in intro segment (ID: ${targetSegmentId})`);
          
          // Refresh page content
          const { data: refreshedContent } = await supabase
            .from('page_content')
            .select('*')
            .eq('page_slug', pageSlug)
            .eq('language', editorLanguage);
          
          if (refreshedContent) {
            setPageContent(refreshedContent);
          }
          
          // Update the h1 in the SEO data AND lock it to prevent auto-detection override
          const updatedData = { ...data, h1: newH1, h1Locked: true };
          onChange(updatedData);
          
          // Clear selection after applying
          setSelectedH1Suggestion(null);
          
          // Auto-save
          console.log('[SEO Editor] Auto-saving SEO changes after Intro H1 update...');
          setTimeout(() => {
            onSave();
            toast.success('H1 saved automatically', { duration: 3000 });
          }, 100);
          
          setIsApplyingH1(false);
          return;
          
        } catch (parseError) {
          console.error('[SEO Editor] Failed to parse intro content:', parseError);
          toast.error('Error parsing intro segment', { duration: 5000 });
          setIsApplyingH1(false);
          return;
        }
      }

      // For NON-INTRO segments: use page_segments JSON
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      
      if (!pageSegmentsEntry) {
        toast.error('Keine page_segments Daten gefunden. Bitte Seite neu laden.', { duration: 5000 });
        setIsApplyingH1(false);
        return;
      }

      let segments: any[];
      try {
        segments = JSON.parse(pageSegmentsEntry.content_value);
        console.log('[SEO Editor] page_segments parsed, contains', segments.length, 'segments');
      } catch (e) {
        toast.error('Fehler beim Parsen von page_segments', { duration: 5000 });
        setIsApplyingH1(false);
        return;
      }

      // DIRECT SEARCH IN page_segments - bypass registry issues
      let targetIdx = -1;
      
      // Strategy 1: Find by segment ID
      if (targetSegmentId) {
        targetIdx = segments.findIndex((seg: any) => 
          seg.id === String(targetSegmentId) || 
          seg.segmentId === targetSegmentId ||
          seg.id === targetSegmentId
        );
        console.log('[SEO Editor] Lookup by segmentId', targetSegmentId, '→ index:', targetIdx);
      }
      
      // Strategy 2: Find by segment key
      if (targetIdx === -1 && targetSegmentKey) {
        targetIdx = segments.findIndex((seg: any) => 
          seg.segmentKey === targetSegmentKey ||
          seg.id === targetSegmentKey
        );
        console.log('[SEO Editor] Lookup by segmentKey', targetSegmentKey, '→ index:', targetIdx);
      }
      
      // Strategy 3: Find by segment type
      if (targetIdx === -1 && targetSegmentType) {
        const typesToMatch = [targetSegmentType];
        // Add type variations
        if (targetSegmentType === 'product-hero' || targetSegmentType === 'product-hero-gallery') {
          typesToMatch.push('hero', 'product-hero', 'product-hero-gallery');
        }
        if (targetSegmentType === 'hero') {
          typesToMatch.push('product-hero', 'product-hero-gallery');
        }
        
        targetIdx = segments.findIndex((seg: any) => 
          typesToMatch.includes(seg.type) || 
          typesToMatch.includes(seg.segmentType)
        );
        console.log('[SEO Editor] Lookup by types', typesToMatch, '→ index:', targetIdx);
      }

      if (targetIdx === -1) {
        console.error('[SEO Editor] Segment not found. Available segments:', 
          segments.map((s: any) => ({ id: s.id, segmentId: s.segmentId, type: s.type, segmentType: s.segmentType }))
        );
        toast.error(`Segment nicht gefunden in page_segments. ID: ${targetSegmentId}, Typ: ${targetSegmentType}`, { duration: 6000 });
        setIsApplyingH1(false);
        return;
      }

      const segmentData = segments[targetIdx];
      const actualSegmentType = segmentData.segmentType || segmentData.type || targetSegmentType;
      console.log('[SEO Editor] Found segment at index', targetIdx, 'type:', actualSegmentType);
      console.log('[SEO Editor] Segment data keys:', Object.keys(segmentData));
      console.log('[SEO Editor] Segment data.data keys:', segmentData.data ? Object.keys(segmentData.data) : 'no data wrapper');

      // Determine where to write the H1 based on actual segment structure
      // Check if segment has 'data' wrapper or direct properties
      const dataObj = segmentData.data || segmentData;
      let updateDetails = '';
      
      // Update the H1 field based on segment type
      if (actualSegmentType === 'full-hero' || actualSegmentType === 'full_hero') {
        dataObj.titleLine1 = newH1;
        dataObj.titleLine2 = '';
        updateDetails = 'titleLine1';
      } else if (actualSegmentType === 'product-hero-gallery') {
        // Product Hero Gallery has title + subtitle for two-line H1 display
        // Intelligently split the H1 at colon, em-dash, or en-dash for better visual presentation
        const colonIndex = newH1.indexOf(':');
        const emDashIndex = newH1.indexOf('–');
        const enDashIndex = newH1.indexOf('-');
        
        // Prioritize colon, then em-dash, then en-dash for splitting
        let splitIndex = -1;
        let separator = '';
        
        if (colonIndex > 10 && colonIndex < newH1.length - 5) {
          splitIndex = colonIndex;
          separator = ':';
        } else if (emDashIndex > 10 && emDashIndex < newH1.length - 5) {
          splitIndex = emDashIndex;
          separator = '–';
        } else if (enDashIndex > 10 && enDashIndex < newH1.length - 5) {
          // Only use hyphen if it's likely a separator (surrounded by spaces or after a word)
          const beforeChar = newH1[enDashIndex - 1];
          const afterChar = newH1[enDashIndex + 1];
          if (beforeChar === ' ' || afterChar === ' ') {
            splitIndex = enDashIndex;
            separator = '-';
          }
        }
        
        if (splitIndex > 0) {
          // Split at the separator - title includes the separator for visual flow
          const titlePart = newH1.substring(0, splitIndex + 1).trim();
          const subtitlePart = newH1.substring(splitIndex + 1).trim();
          dataObj.title = titlePart;
          dataObj.subtitle = subtitlePart;
          updateDetails = `title + subtitle (intelligent split at "${separator}")`;
          console.log('[SEO Editor] PHG intelligent split:', { title: titlePart, subtitle: subtitlePart });
        } else {
          // No good split point found - put everything in title
          dataObj.title = newH1;
          dataObj.subtitle = '';
          updateDetails = 'title only (no split point found)';
        }
      } else if (actualSegmentType === 'product-hero' || actualSegmentType === 'hero') {
        // Check which field exists
        if (dataObj.hasOwnProperty('hero_title')) {
          dataObj.hero_title = newH1;
          dataObj.hero_subtitle = '';
          updateDetails = 'hero_title';
        } else if (dataObj.hasOwnProperty('title')) {
          dataObj.title = newH1;
          updateDetails = 'title';
        } else {
          // Create hero_title if nothing exists
          dataObj.hero_title = newH1;
          updateDetails = 'hero_title (created)';
        }
      } else if (actualSegmentType === 'intro') {
        dataObj.title = newH1;
        dataObj.headingLevel = 'h1';
        updateDetails = 'title + headingLevel=h1';
      } else {
        dataObj.title = newH1;
        updateDetails = 'title';
      }
      
      // Set useH1 flag if available
      if (dataObj.hasOwnProperty('useH1')) {
        dataObj.useH1 = true;
      }
      
      // Write back the changes
      if (segmentData.data) {
        segments[targetIdx].data = dataObj;
      } else {
        // For product-hero-gallery which has direct properties
        Object.assign(segments[targetIdx], dataObj);
      }
      
      console.log('[SEO Editor] Updated field:', updateDetails, 'new value:', newH1);
      
      // Save the updated page_segments
      const { error: updateError } = await supabase
        .from('page_content')
        .update({ 
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', pageSegmentsEntry.id);
      
      if (updateError) {
        console.error('[SEO Editor] Failed to save:', updateError);
        toast.error(`Speichern fehlgeschlagen: ${updateError.message}`, { duration: 5000 });
        setIsApplyingH1(false);
        return;
      }
      
      console.log('[SEO Editor] Successfully saved page_segments with updated H1');

      // Build target segment info for changelog
      const targetSegmentInfo = {
        id: segmentData.segmentId || segmentData.id || targetSegmentId || 0,
        key: segmentData.segmentKey || segmentData.id || targetSegmentKey || '',
        type: actualSegmentType,
        label: getSegmentLabel(actualSegmentType, segmentData.segmentKey || '')
      };

      // Prepare changelog entry
      let changeLogEntry: typeof h1ChangeLog = {
        timestamp: new Date().toISOString(),
        newH1,
        targetSegment: {
          id: typeof targetSegmentInfo.id === 'string' ? parseInt(targetSegmentInfo.id) || 0 : targetSegmentInfo.id,
          key: targetSegmentInfo.key,
          type: targetSegmentInfo.type,
          label: targetSegmentInfo.label
        }
      };

      // If old H1 is in a different segment, convert it to H2
      if (oldH1Source && oldH1Source.key !== targetSegmentInfo.key) {
        // Check if old segment is in page_segments
        if (isPageSegmentType(oldH1Source.type)) {
          const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
          if (pageSegmentsEntry) {
            try {
              const segments = JSON.parse(pageSegmentsEntry.content_value);
              const oldIdx = segments.findIndex((seg: any) => seg.id === oldH1Source.key || seg.id === oldH1Source.id);
              
              if (oldIdx !== -1) {
                // Move title to subtitle
                if (segments[oldIdx].data.titleLine1) {
                  segments[oldIdx].data.subtitle = segments[oldIdx].data.titleLine1 + (segments[oldIdx].data.titleLine2 ? ' ' + segments[oldIdx].data.titleLine2 : '');
                  segments[oldIdx].data.titleLine1 = '';
                  segments[oldIdx].data.titleLine2 = '';
                } else if (segments[oldIdx].data.title) {
                  segments[oldIdx].data.subtitle = segments[oldIdx].data.title;
                  segments[oldIdx].data.title = '';
                }
                
                if (segments[oldIdx].data.hasOwnProperty('useH1')) {
                  segments[oldIdx].data.useH1 = false;
                }
                
                await supabase
                  .from('page_content')
                  .update({ 
                    content_value: JSON.stringify(segments),
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', pageSegmentsEntry.id);
                
                changeLogEntry.oldH1 = {
                  text: oldH1Text || '',
                  segment: { key: oldH1Source.key, label: oldH1Source.label },
                  action: 'Zu H2 konvertiert'
                };
              }
            } catch (e) {
              console.error('[SEO Editor] Failed to update old segment in page_segments:', e);
            }
          }
        } else {
          const oldContent = pageContent.find(item => item.section_key === oldH1Source.key);
          if (oldContent) {
            try {
              const oldContentData = JSON.parse(oldContent.content_value);
              if (oldContentData.title) {
                oldContentData.subtitle = oldContentData.title;
                oldContentData.title = '';
                if (oldContentData.headingLevel === 'h1') {
                  oldContentData.headingLevel = 'h2';
                }
                
                await supabase
                  .from('page_content')
                  .update({ 
                    content_value: JSON.stringify(oldContentData),
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', oldContent.id);
                
                console.log('[SEO Editor] Converted old H1 to H2 in segment:', oldH1Source.key);
                changeLogEntry.oldH1 = {
                  text: oldH1Text || '',
                  segment: { key: oldH1Source.key, label: oldH1Source.label },
                  action: 'Zu H2 konvertiert'
                };
              }
            } catch (parseError) {
              console.error('[SEO Editor] Failed to parse old segment content:', parseError);
            }
          }
        }
      }

      // Set the changelog for display
      setH1ChangeLog(changeLogEntry);
      
      toast.success(`H1 successfully set in "${targetSegmentInfo.label}" (ID: ${targetSegmentInfo.id})`);
      
      // Refresh page content - WITH LANGUAGE FILTER
      const { data: refreshedContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage);
      
      if (refreshedContent) {
        setPageContent(refreshedContent);
      }
      
      // Update the h1 in the SEO data (this syncs Basic and Advanced)
      // IMPORTANT: Use onChange directly with the updated h1 value AND lock it
      const updatedData = { ...data, h1: newH1, h1Locked: true };
      onChange(updatedData);
      
      // Clear selection after applying (but keep changelog visible)
      setSelectedH1Suggestion(null);
      
      // Auto-save after H1 was applied to segment
      // Use setTimeout to ensure React state update has propagated
      console.log('[SEO Editor] Auto-saving SEO changes after H1 update...');
      setTimeout(() => {
        onSave();
        toast.success('H1 saved automatically', { duration: 3000 });
      }, 100);
      
    } catch (error) {
      console.error('[SEO Editor] Error applying H1:', error);
      toast.error('Fehler beim Anwenden der H1');
    } finally {
      setIsApplyingH1(false);
    }
  };

  // FKW Content Optimizer - Generate suggestions
  const handleGenerateFkwContentSuggestions = async () => {
    // Robust Focus Keyword handling - try to get from state, fallback to DB
    let focusKeyword = data.focusKeyword;
    
    if (!focusKeyword) {
      // Try to load from database directly
      console.log('[SEO Editor] Focus keyword not in state, checking DB...');
      const { data: seoData } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_settings')
        .eq('language', editorLanguage)
        .maybeSingle();
      
      if (seoData?.content_value) {
        try {
          const parsed = JSON.parse(seoData.content_value);
          focusKeyword = parsed.focusKeyword || '';
          if (focusKeyword) {
            console.log('[SEO Editor] Loaded focus keyword from DB:', focusKeyword);
            // Also update the state so it's available
            onChange({ ...data, focusKeyword });
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse seo_settings:', e);
        }
      }
    }
    
    if (!focusKeyword) {
      toast.error('Please define a Focus Keyword first');
      return;
    }

    // Preserve already applied suggestions before regenerating
    const previouslyAppliedSuggestions = fkwContentSuggestions.filter(s => s.applied);
    
    setIsGeneratingFkwContent(true);
    // Keep applied suggestions visible
    setFkwContentSuggestions(previouslyAppliedSuggestions);
    setFkwContentAnalysis(null);
    setFkwContentScore(0);
    setFkwContentRecommendations([]);

    try {
      console.log('[SEO Editor] Generating FKW content suggestions with keyword:', focusKeyword);
      console.log('[SEO Editor] Preserving', previouslyAppliedSuggestions.length, 'applied suggestions');
      
      const response = await supabase.functions.invoke('generate-fkw-content-suggestions', {
        body: {
          pageSlug,
          focusKeyword, // Use the robust focusKeyword variable, not data.focusKeyword
          language: editorLanguage,
          pageSegments
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate suggestions');
      }

      const result = response.data;
      console.log('[SEO Editor] FKW content suggestions result:', result);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Merge: Keep applied suggestions + add new non-applied suggestions
      // CRITICAL: Use unique key (segmentId + fieldPath) to prevent duplicates
      const newSuggestions = result.suggestions || [];
      const existingKeys = new Set(
        previouslyAppliedSuggestions.map(s => `${s.segmentId}:${s.fieldPath}`)
      );
      
      const mergedSuggestions = [
        ...previouslyAppliedSuggestions,
        ...newSuggestions.filter((newS: any) => 
          !existingKeys.has(`${newS.segmentId}:${newS.fieldPath}`)
        )
      ];
      
      // Remove any remaining duplicates (same segmentId + fieldPath)
      const uniqueSuggestions = mergedSuggestions.filter((s, idx, arr) => 
        arr.findIndex(x => x.segmentId === s.segmentId && x.fieldPath === s.fieldPath) === idx
      );
      
      setFkwContentSuggestions(uniqueSuggestions);
      setFkwContentAnalysis(result.analysis || null);
      setFkwContentScore(result.score || 0);
      setFkwContentRecommendations(result.recommendations || []);
      setShowFkwContentSuggestions(true);

      // Persist the FKW content analysis to database (using de-duplicated suggestions)
      const fkwContentToSave = {
        suggestions: uniqueSuggestions,
        analysis: result.analysis || null,
        score: result.score || 0,
        recommendations: result.recommendations || [],
        generatedAt: new Date().toISOString(),
        focusKeyword
      };
      
      // Check if entry exists
      const { data: existingEntry } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_fkw_content_analysis')
        .eq('language', editorLanguage)
        .maybeSingle();
      
      if (existingEntry) {
        await supabase
          .from('page_content')
          .update({ 
            content_value: JSON.stringify(fkwContentToSave),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      } else {
        await supabase
          .from('page_content')
          .insert({
            page_slug: pageSlug,
            section_key: 'seo_fkw_content_analysis',
            content_type: 'json',
            content_value: JSON.stringify(fkwContentToSave),
            language: editorLanguage
          });
      }
      console.log('[SEO Editor] Persisted FKW content analysis to DB');

      const newSuggestionsCount = (result.suggestions || []).length;
      if (newSuggestionsCount === 0 && previouslyAppliedSuggestions.length === 0) {
        toast.info('Content is already well-optimized for the focus keyword!');
      } else if (newSuggestionsCount === 0 && previouslyAppliedSuggestions.length > 0) {
        toast.success(`Analysis updated. ${previouslyAppliedSuggestions.length} applied optimizations preserved.`);
      } else {
        toast.success(`${newSuggestionsCount} new suggestions generated, ${previouslyAppliedSuggestions.length} applied optimizations preserved.`);
      }
    } catch (error) {
      console.error('[SEO Editor] Error generating FKW content suggestions:', error);
      toast.error('Failed to generate content suggestions');
    } finally {
      setIsGeneratingFkwContent(false);
    }
  };

  // FKW Content Optimizer - Apply suggestion
  const handleApplyFkwContentSuggestion = async (suggestion: typeof fkwContentSuggestions[0], index: number) => {
    setIsApplyingFkwContent(index);
    
    try {
      console.log('[SEO Editor] Applying FKW content suggestion:', suggestion);
      
      // Find the segment in page_segments
      const segmentId = suggestion.segmentId;
      const fieldPath = suggestion.fieldPath;
      
      // Get current page_segments from database
      const { data: contentData } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage)
        .eq('section_key', 'page_segments')
        .maybeSingle();
      
      if (!contentData) {
        toast.error('Page segments not found');
        return;
      }
      
      let segments = JSON.parse(contentData.content_value);
      
      // Find segment by ID
      const segIdx = segments.findIndex((seg: any) => 
        parseInt(seg.id) === segmentId || seg.id === segmentId
      );
      
      if (segIdx === -1) {
        toast.error(`Segment ${segmentId} not found`);
        return;
      }
      
      const segmentData = segments[segIdx];
      const dataObj = segmentData.data || segmentData;
      
      // Parse field path and update value
      // fieldPath can be like: "headline", "introText", "items[0].title", "features[1].description"
      const pathParts = fieldPath.match(/([^\[\]\.]+)|\[(\d+)\]/g) || [];
      let current = dataObj;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const arrayMatch = part.match(/\[(\d+)\]/);
        if (arrayMatch) {
          current = current[parseInt(arrayMatch[1])];
        } else {
          current = current[part];
        }
        if (!current) {
          toast.error(`Field path ${fieldPath} not found in segment`);
          return;
        }
      }
      
      // Set the final value
      const finalPart = pathParts[pathParts.length - 1];
      const finalArrayMatch = finalPart.match(/\[(\d+)\]/);
      if (finalArrayMatch) {
        current[parseInt(finalArrayMatch[1])] = suggestion.suggestedText;
      } else {
        current[finalPart] = suggestion.suggestedText;
      }
      
      // Write back to segment
      if (segmentData.data) {
        segments[segIdx].data = dataObj;
      } else {
        segments[segIdx] = dataObj;
      }
      
      // Save to database
      const { error: updateError } = await supabase
        .from('page_content')
        .update({ 
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentData.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Mark suggestion as applied
      const updatedSuggestions = fkwContentSuggestions.map((s, i) => 
        i === index ? { ...s, applied: true } : s
      );
      setFkwContentSuggestions(updatedSuggestions);
      
      // Persist updated suggestions to database
      const fkwContentToSave = {
        suggestions: updatedSuggestions,
        analysis: fkwContentAnalysis,
        score: fkwContentScore,
        recommendations: fkwContentRecommendations,
        updatedAt: new Date().toISOString()
      };
      
      const { data: existingEntry } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_fkw_content_analysis')
        .eq('language', editorLanguage)
        .maybeSingle();
      
      if (existingEntry) {
        await supabase
          .from('page_content')
          .update({ 
            content_value: JSON.stringify(fkwContentToSave),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      }
      
      toast.success(`Applied: "${suggestion.suggestedText.substring(0, 40)}..."`);
      
      // Auto-save SEO settings
      setTimeout(() => onSave(), 100);
      
    } catch (error) {
      console.error('[SEO Editor] Error applying FKW content suggestion:', error);
      toast.error('Failed to apply suggestion');
    } finally {
      setIsApplyingFkwContent(null);
    }
  };

  // FKW Content Optimizer - Reject suggestion
  const handleRejectFkwContentSuggestion = async (index: number) => {
    const updatedSuggestions = fkwContentSuggestions.map((s, i) => 
      i === index ? { ...s, rejected: true } : s
    );
    setFkwContentSuggestions(updatedSuggestions);
    
    // Persist updated suggestions to database
    const fkwContentToSave = {
      suggestions: updatedSuggestions,
      analysis: fkwContentAnalysis,
      score: fkwContentScore,
      recommendations: fkwContentRecommendations,
      updatedAt: new Date().toISOString()
    };
    
    const { data: existingEntry } = await supabase
      .from('page_content')
      .select('id')
      .eq('page_slug', pageSlug)
      .eq('section_key', 'seo_fkw_content_analysis')
      .eq('language', editorLanguage)
      .maybeSingle();
    
    if (existingEntry) {
      await supabase
        .from('page_content')
        .update({ 
          content_value: JSON.stringify(fkwContentToSave),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id);
    }
    
    toast.info('Suggestion rejected');
  };

  // Helper function to recalculate FKW analysis from current page content
  const recalculateFkwAnalysis = async (segments: any[], focusKeyword: string): Promise<{
    totalWords: number;
    fkwOccurrences: number;
    fkwDensity: number;
    densityStatus: 'too_low' | 'optimal' | 'too_high';
    h1HasFkw: boolean;
    h2Count: number;
    h2WithFkw: number;
    h3Count: number;
    h3WithFkw: number;
    introHasFkw: boolean;
  }> => {
    const keywordLower = focusKeyword.toLowerCase();
    let totalWords = 0;
    let fkwOccurrences = 0;
    let h1HasFkw = false;
    let h2Count = 0;
    let h2WithFkw = 0;
    let h3Count = 0;
    let h3WithFkw = 0;
    let introHasFkw = false;

    // Helper to count words and FKW occurrences in text
    const analyzeText = (text: string, isH1 = false, isH2 = false, isH3 = false, isIntro = false) => {
      if (!text || typeof text !== 'string') return;
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      totalWords += words.length;
      
      // Count FKW occurrences (case insensitive)
      const textLower = text.toLowerCase();
      let searchIndex = 0;
      while (true) {
        const found = textLower.indexOf(keywordLower, searchIndex);
        if (found === -1) break;
        fkwOccurrences++;
        searchIndex = found + keywordLower.length;
      }
      
      const hasFkw = textLower.includes(keywordLower);
      if (isH1 && hasFkw) h1HasFkw = true;
      if (isH2) {
        h2Count++;
        if (hasFkw) h2WithFkw++;
      }
      if (isH3) {
        h3Count++;
        if (hasFkw) h3WithFkw++;
      }
      if (isIntro && hasFkw) introHasFkw = true;
    };

    // Analyze each segment
    segments.forEach(seg => {
      const segData = seg.data || seg;
      const segType = seg.type || seg.segment_type || '';
      
      // Hero segments (H1)
      if (segType.includes('hero') || segType.includes('product-hero')) {
        analyzeText(segData.title || segData.hero_title || '', true);
        analyzeText(segData.subtitle || segData.hero_subtitle || '');
        analyzeText(segData.description || '');
      }
      
      // Intro segments
      if (segType === 'intro') {
        analyzeText(segData.headline || segData.title || '', true);
        analyzeText(segData.introText || segData.description || '', false, false, false, true);
      }
      
      // Image-Text segments
      // segment.data.title = H2 (Section Header)
      // segment.data.items[].title = H3 (Item Headers)
      if (segType === 'image-text') {
        // Section title is H2
        if (segData.title) {
          analyzeText(segData.title, false, true, false);
        }
        // Item titles are H3
        const items = segData.items || [];
        items.forEach((item: any) => {
          analyzeText(item.title || '', false, false, true);
          analyzeText(item.description || '');
        });
      }
      
      // Feature overview
      if (segType === 'feature-overview') {
        analyzeText(segData.title || '', false, true);
        analyzeText(segData.subtext || '');
        const items = segData.items || [];
        items.forEach((item: any) => {
          analyzeText(item.title || '', false, false, true);
          analyzeText(item.description || '');
        });
      }
      
      // FAQ segments
      if (segType === 'faq') {
        analyzeText(segData.title || '', false, true);
        const items = segData.items || [];
        items.forEach((item: any) => {
          analyzeText(item.question || '', false, false, true);
          analyzeText(item.answer || '');
        });
      }
      
      // Table segments
      if (segType === 'table') {
        analyzeText(segData.title || '', false, true);
        analyzeText(segData.description || segData.subtext || '');
      }
      
      // Tiles segments
      if (segType === 'tiles') {
        analyzeText(segData.title || '', false, true);
        analyzeText(segData.description || '');
        const items = segData.items || [];
        items.forEach((item: any) => {
          analyzeText(item.title || '', false, false, true);
          analyzeText(item.description || '');
        });
      }
    });

    const fkwDensity = totalWords > 0 ? (fkwOccurrences / totalWords) * 100 : 0;
    let densityStatus: 'too_low' | 'optimal' | 'too_high' = 'too_low';
    if (fkwDensity >= 0.5 && fkwDensity <= 2.5) {
      densityStatus = 'optimal';
    } else if (fkwDensity > 2.5) {
      densityStatus = 'too_high';
    }

    return {
      totalWords,
      fkwOccurrences,
      fkwDensity,
      densityStatus,
      h1HasFkw,
      h2Count,
      h2WithFkw,
      h3Count,
      h3WithFkw,
      introHasFkw
    };
  };

  // FKW Content Optimizer - Remove/Revert an applied suggestion
  const handleRemoveFkwContentSuggestion = async (suggestion: typeof fkwContentSuggestions[0], index: number) => {
    try {
      console.log('[SEO Editor] Removing FKW content suggestion:', suggestion);
      
      // Find the segment in page_segments and revert to original text
      const segmentId = suggestion.segmentId;
      const fieldPath = suggestion.fieldPath;
      
      // Get current page_segments from database
      const { data: contentData } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage)
        .eq('section_key', 'page_segments')
        .maybeSingle();
      
      if (!contentData) {
        toast.error('Page segments not found');
        return;
      }
      
      let segments = JSON.parse(contentData.content_value);
      
      // Find segment by ID
      const segIdx = segments.findIndex((seg: any) => 
        parseInt(seg.id) === segmentId || seg.id === segmentId
      );
      
      if (segIdx === -1) {
        toast.error(`Segment ${segmentId} not found`);
        return;
      }
      
      const segmentData = segments[segIdx];
      const dataObj = segmentData.data || segmentData;
      
      // Parse field path and revert value to original
      const pathParts = fieldPath.match(/([^\[\]\.]+)|\[(\d+)\]/g) || [];
      let current = dataObj;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const arrayMatch = part.match(/\[(\d+)\]/);
        if (arrayMatch) {
          current = current[parseInt(arrayMatch[1])];
        } else {
          current = current[part];
        }
        if (!current) {
          toast.error(`Field path ${fieldPath} not found in segment`);
          return;
        }
      }
      
      // Revert to original text
      const finalPart = pathParts[pathParts.length - 1];
      const finalArrayMatch = finalPart.match(/\[(\d+)\]/);
      if (finalArrayMatch) {
        current[parseInt(finalArrayMatch[1])] = suggestion.currentText;
      } else {
        current[finalPart] = suggestion.currentText;
      }
      
      // Write back to segment
      if (segmentData.data) {
        segments[segIdx].data = dataObj;
      } else {
        segments[segIdx] = dataObj;
      }
      
      // Save to database
      const { error: updateError } = await supabase
        .from('page_content')
        .update({ 
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', contentData.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Remove the suggestion from the list entirely
      const updatedSuggestions = fkwContentSuggestions.filter((_, i) => i !== index);
      setFkwContentSuggestions(updatedSuggestions);
      
      // CRITICAL: Dynamically recalculate FKW analysis after removing optimization
      const focusKeyword = data.focusKeyword || '';
      if (focusKeyword) {
        console.log('[SEO Editor] Recalculating FKW analysis after removal...');
        const newAnalysis = await recalculateFkwAnalysis(segments, focusKeyword);
        setFkwContentAnalysis(newAnalysis);
        
        // Recalculate score based on new analysis
        let newScore = 0;
        if (newAnalysis.densityStatus === 'optimal') newScore += 30;
        else if (newAnalysis.densityStatus === 'too_low' && newAnalysis.fkwDensity >= 0.3) newScore += 15;
        if (newAnalysis.h1HasFkw) newScore += 20;
        if (newAnalysis.h2Count > 0 && newAnalysis.h2WithFkw > 0) newScore += 15;
        if (newAnalysis.introHasFkw) newScore += 20;
        if (newAnalysis.fkwOccurrences >= 3) newScore += 15;
        setFkwContentScore(Math.min(100, newScore));
        
        // Update recommendations based on new analysis - CONCRETE & ACTIONABLE
        const newRecommendations: string[] = [];
        
        // H1 recommendation
        if (!newAnalysis.h1HasFkw) {
          newRecommendations.push(`✗ Füge "${data.focusKeyword}" in die H1-Überschrift ein`);
        } else {
          newRecommendations.push('✓ H1 enthält Focus Keyword');
        }
        
        // Intro recommendation
        if (!newAnalysis.introHasFkw) {
          newRecommendations.push(`✗ Füge "${data.focusKeyword}" in den Intro-Text ein (idealerweise in den ersten 15 Wörtern)`);
        } else {
          newRecommendations.push('✓ Intro enthält Focus Keyword');
        }
        
        // H2 recommendation - specific counts
        if (newAnalysis.h2Count > 0) {
          const h2Missing = newAnalysis.h2Count - newAnalysis.h2WithFkw;
          const targetH2s = Math.ceil(newAnalysis.h2Count / 2); // At least 50%
          const h2sNeeded = Math.max(0, targetH2s - newAnalysis.h2WithFkw);
          
          if (h2Missing === 0) {
            newRecommendations.push(`✓ Alle ${newAnalysis.h2Count} H2-Überschriften enthalten das FKW`);
          } else if (newAnalysis.h2WithFkw === 0) {
            newRecommendations.push(`✗ Füge "${data.focusKeyword}" in mindestens ${targetH2s} von ${newAnalysis.h2Count} H2-Überschriften ein`);
          } else if (h2sNeeded > 0) {
            newRecommendations.push(`○ Füge "${data.focusKeyword}" in ${h2sNeeded} weitere H2-Überschrift${h2sNeeded > 1 ? 'en' : ''} ein (aktuell: ${newAnalysis.h2WithFkw}/${newAnalysis.h2Count})`);
          } else {
            newRecommendations.push(`✓ ${newAnalysis.h2WithFkw}/${newAnalysis.h2Count} H2-Überschriften enthalten das FKW (≥50%)`);
          }
        }
        
        // Density recommendation - specific targets
        if (newAnalysis.densityStatus === 'too_low') {
          const currentDensity = newAnalysis.fkwDensity.toFixed(2);
          const wordsNeeded = Math.ceil((0.5 * newAnalysis.totalWords / 100) - newAnalysis.fkwOccurrences);
          if (wordsNeeded > 0) {
            newRecommendations.push(`✗ Keyword-Dichte zu niedrig (${currentDensity}%). Füge "${data.focusKeyword}" ca. ${wordsNeeded}× mehr im Text ein`);
          } else {
            newRecommendations.push(`○ Keyword-Dichte leicht erhöhen (${currentDensity}% → Ziel: 0.5-2.0%)`);
          }
        } else if (newAnalysis.densityStatus === 'too_high') {
          const currentDensity = newAnalysis.fkwDensity.toFixed(2);
          newRecommendations.push(`✗ Keyword-Dichte zu hoch (${currentDensity}%). Reduziere die Verwendung von "${data.focusKeyword}" um Überoptimierung zu vermeiden`);
        } else {
          newRecommendations.push(`✓ Keyword-Dichte optimal (${newAnalysis.fkwDensity.toFixed(2)}%)`);
        }
        
        // H3 recommendation (bonus)
        if (newAnalysis.h3Count > 0 && newAnalysis.h3WithFkw === 0) {
          newRecommendations.push(`○ Optional: Füge "${data.focusKeyword}" in eine H3-Überschrift ein (+10 Punkte)`);
        } else if (newAnalysis.h3WithFkw > 0) {
          newRecommendations.push(`✓ ${newAnalysis.h3WithFkw} H3-Überschrift${newAnalysis.h3WithFkw > 1 ? 'en' : ''} enthält das FKW`);
        }
        
        setFkwContentRecommendations(newRecommendations);
        
        console.log('[SEO Editor] Updated FKW analysis:', newAnalysis);
      }
      
      // Persist updated suggestions and analysis to database
      const fkwContentToSave = {
        suggestions: updatedSuggestions,
        analysis: fkwContentAnalysis,
        score: fkwContentScore,
        recommendations: fkwContentRecommendations,
        updatedAt: new Date().toISOString()
      };
      
      const { data: existingEntry } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_fkw_content_analysis')
        .eq('language', editorLanguage)
        .maybeSingle();
      
      if (existingEntry) {
        await supabase
          .from('page_content')
          .update({ 
            content_value: JSON.stringify(fkwContentToSave),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      }
      
      toast.success('Optimization reverted to original text');
      
    } catch (error) {
      console.error('[SEO Editor] Error removing FKW content suggestion:', error);
      toast.error('Failed to remove optimization');
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-green-600 animate-scale-in" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-600" />
    );
  };

  // Highlight FKW in text with better contrast
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword || !text) return text;
    
    const keywordLower = keyword.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let searchText = text;
    let currentIndex = 0;
    
    // Find all occurrences (case insensitive)
    while (currentIndex < searchText.length) {
      const index = searchText.toLowerCase().indexOf(keywordLower, currentIndex);
      if (index === -1) break;
      
      // Add text before keyword
      if (index > lastIndex) {
        parts.push(searchText.substring(lastIndex, index));
      }
      
      // Add highlighted keyword with green background and dark text
      const actualKeyword = searchText.substring(index, index + keyword.length);
      parts.push(
        <span key={`kw-${index}`} className="bg-green-500 text-white font-semibold px-1.5 py-0.5 rounded">
          {actualKeyword}
        </span>
      );
      
      lastIndex = index + keyword.length;
      currentIndex = index + keyword.length;
    }
    
    // Add remaining text
    if (lastIndex < searchText.length) {
      parts.push(searchText.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Calculate basic and advanced check counts
  const basicChecks = [checks.titleLength, checks.descriptionLength, checks.hasH1, checks.hasInternalLinks, checks.hasExternalLinks];
  // Advanced includes focusKeyword defined + all the FKW position checks
  const advancedChecks = [!!data.focusKeyword, checks.keywordInTitle, checks.keywordInDescription, checks.keywordInSlug, checks.keywordInH1, checks.keywordInIntroduction];
  const basicPassedCount = basicChecks.filter(Boolean).length;
  const advancedPassedCount = advancedChecks.filter(Boolean).length;
  const totalPassedCount = basicPassedCount + advancedPassedCount;
  const totalChecks = basicChecks.length + advancedChecks.length; // 5 + 6 = 11

  return (
    <div className="space-y-6">
      {/* SEO Health Check - Collapsible */}
      <Collapsible open={isHealthCheckOpen} onOpenChange={setIsHealthCheckOpen}>
        <div className="rounded-lg overflow-hidden border border-border">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left p-4 bg-zinc-800/70 hover:bg-zinc-800 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">SEO Health Check</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  isAdvancedMode
                    ? (totalPassedCount >= 9 ? 'bg-green-500' : 
                       totalPassedCount >= 6 ? 'bg-yellow-500' : 'bg-red-500')
                    : (basicPassedCount >= 4 ? 'bg-green-500' : 
                       basicPassedCount >= 3 ? 'bg-yellow-500' : 'bg-red-500')
                }`} />
                <span className="text-sm font-medium text-muted-foreground">
                  {isAdvancedMode 
                    ? `${totalPassedCount}/${totalChecks} Checks`
                    : `${basicPassedCount}/5 Checks`
                  }
                </span>
                {isAdvancedMode && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">Advanced</Badge>
                )}
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isHealthCheckOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="p-4 bg-background border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Health Check - Always visible */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Basic ({basicPassedCount}/5)</h4>
                <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                  checks.titleLength ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {getStatusIcon(checks.titleLength)}
                  <span className="text-sm font-medium">Title Length</span>
                </div>
                <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                  checks.descriptionLength ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {getStatusIcon(checks.descriptionLength)}
                  <span className="text-sm font-medium">Description Length</span>
                </div>
                <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                  checks.hasH1 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {getStatusIcon(checks.hasH1)}
                  <span className="text-sm font-medium">H1 Present</span>
                </div>
                <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                  checks.hasInternalLinks ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {getStatusIcon(checks.hasInternalLinks)}
                  <span className="text-sm font-medium">Internal Links</span>
                </div>
                <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                  checks.hasExternalLinks ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {getStatusIcon(checks.hasExternalLinks)}
                  <span className="text-sm font-medium">External Links</span>
                </div>
              </div>

              {/* Advanced Health Check - Only visible in Advanced mode */}
              {isAdvancedMode && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Advanced ({advancedPassedCount}/6)</h4>
                  <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                    data.focusKeyword ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {getStatusIcon(!!data.focusKeyword)}
                    <span className="text-sm font-medium">Focus Keyword definiert</span>
                  </div>
                  <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                    checks.keywordInTitle ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {getStatusIcon(checks.keywordInTitle)}
                    <span className="text-sm font-medium">FKW in Title</span>
                  </div>
                  <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                    checks.keywordInDescription ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {getStatusIcon(checks.keywordInDescription)}
                    <span className="text-sm font-medium">FKW in Description</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-md transition-colors bg-zinc-700/30 border border-zinc-600/30">
                    <Info className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-400">FKW in Slug</span>
                    <span className="text-xs text-zinc-500 ml-auto">{checks.keywordInSlug ? '✓' : '–'}</span>
                  </div>
                  <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                    checks.keywordInH1 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {getStatusIcon(checks.keywordInH1)}
                    <span className="text-sm font-medium">FKW in H1</span>
                  </div>
                  <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                    checks.keywordInIntroduction ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {getStatusIcon(checks.keywordInIntroduction)}
                    <span className="text-sm font-medium">FKW in Introduction</span>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* SERP Preview - Collapsible */}
      <Collapsible open={isSerpPreviewOpen} onOpenChange={setIsSerpPreviewOpen}>
        <div className="rounded-lg overflow-hidden border border-border">
          <CollapsibleTrigger asChild>
            <button className="flex items-center justify-between w-full text-left p-4 bg-zinc-800/70 hover:bg-zinc-800 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span className="text-lg font-semibold">SERP Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Google Suche Vorschau</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isSerpPreviewOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t border-border">
            <SERPPreview
              title={data.title || ''}
              description={data.metaDescription || ''}
              url={data.slug ? `www.image-engineering.de › ${data.slug}` : 'www.image-engineering.de › your-page-slug'}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Tabs for different sections */}
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className={`grid w-full mb-6 bg-muted h-12 ${isAdvancedMode ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="basics" className="text-base font-medium py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black">Basics</TabsTrigger>
          <TabsTrigger value="social" className="text-base font-medium py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black">Social Media</TabsTrigger>
          {isAdvancedMode && (
            <TabsTrigger value="advanced" className="text-base font-medium py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black flex items-center gap-2">
              Advanced
              <GeminiIcon className="h-4 w-4" />
            </TabsTrigger>
          )}
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics" className="space-y-4">

          {/* SEO Title */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="seo-title" className="text-base font-semibold text-foreground">
                SEO Title
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-muted/50">Required</Badge>
                {isAdvancedMode && data.title && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                )}
              </div>
            </div>
            <Input
              id="seo-title"
              value={data.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Professional Camera Testing Solutions | Image Engineering"
              className="h-11 bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20"
            />
            {isAdvancedMode && data.focusKeyword && data.title && (
              <div className="mt-3 px-3 py-2 bg-muted/20 border border-border/50 rounded text-sm">
                {highlightKeyword(data.title, data.focusKeyword)}
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                  ? 'bg-green-500/20 text-green-400'
                  : (data.title?.length || 0) > 60
                  ? 'bg-red-500/20 text-red-400'
                  : (data.title?.length || 0) >= 40
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {data.title?.length || 0}/60 chars
              </span>
              <span className="text-xs text-muted-foreground">
                Optimal: 50-60 characters
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="meta-description" className="text-base font-semibold text-foreground">
                Meta Description
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-muted/50">Required</Badge>
                {isAdvancedMode && data.metaDescription && data.focusKeyword && data.metaDescription.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                )}
              </div>
            </div>
            <Textarea
              id="meta-description"
              value={data.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              placeholder="Describe your page in 120-160 characters..."
              className="min-h-[100px] bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20 resize-none"
              rows={3}
            />
            {isAdvancedMode && data.focusKeyword && data.metaDescription && (
              <div className="mt-3 px-3 py-2 bg-muted/20 border border-border/50 rounded text-sm">
                {highlightKeyword(data.metaDescription, data.focusKeyword)}
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                  ? 'bg-green-500/20 text-green-400'
                  : (data.metaDescription?.length || 0) > 160
                  ? 'bg-red-500/20 text-red-400'
                  : (data.metaDescription?.length || 0) >= 100
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {data.metaDescription?.length || 0}/160 chars
              </span>
              <span className="text-xs text-muted-foreground">
                Optimal: 120-160 characters
              </span>
            </div>
          </div>

          {/* URL Slug */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="slug" className="text-base font-semibold text-foreground">
                URL Slug
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-muted/50">Required</Badge>
                {data.slug && data.focusKeyword && data.slug.toLowerCase().includes(data.focusKeyword.toLowerCase().replace(/\s+/g, '-')) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-muted/50 rounded-l-md border border-r-0 border-border text-sm text-muted-foreground">
                /
              </span>
              <Input
                id="slug"
                value={data.slug || ''}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-'))}
                placeholder={pageSlug}
                className="rounded-l-none h-11 bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Only lowercase letters, numbers and hyphens
            </p>
          </div>

          {/* H1 Heading */}
          <div className={`p-5 rounded-lg ${data.h1 ? 'bg-zinc-800/50 border border-zinc-700' : 'bg-red-500/10 border border-red-500/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-lg font-semibold text-foreground">
                H1 Heading
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Auto-detect</Badge>
                {isAdvancedMode && data.h1 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                )}
              </div>
            </div>
            
            {/* H1 Value Display */}
            <div className={`px-4 py-4 rounded-md ${data.h1 ? 'bg-muted/20 border border-border/50' : 'bg-red-500/20 border border-red-500/30'}`}>
              {data.h1 ? (
                <div className="space-y-3">
                  {/* H1 Text - larger */}
                  <p className="text-lg font-medium text-foreground">{data.h1}</p>
                  
                  {/* Source Badge - simplified */}
                  {h1SourceInfo && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Source:</span>
                      <Badge className="bg-[#f9dc24] text-black font-medium text-sm px-3 py-1">
                        {h1SourceInfo.label} ({h1SourceInfo.id})
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <span className="flex items-center gap-2 text-red-400 text-base">
                  <AlertCircle className="h-5 w-5" />
                  No H1 found – please add an Intro, Hero or Product Hero Gallery segment
                </span>
              )}
            </div>
            
            {/* FKW Highlight */}
            {data.h1 && data.focusKeyword && (
              <div className="mt-3 px-4 py-3 bg-muted/20 border border-border/50 rounded text-base">
                {highlightKeyword(data.h1, data.focusKeyword)}
              </div>
            )}
            
            {/* Priority Explanation */}
            <p className="text-sm text-muted-foreground mt-3">
              <span className="font-medium">Auto-detect Priority:</span> Intro → Full Hero → Product Hero Gallery → Product Hero → Action Hero
            </p>
          </div>

          {/* Internal Links Overview */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Internal Links
              </Label>
              <Badge 
                variant="outline" 
                className={`text-xs ${extractedInternalLinks.length > 0 ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
              >
                {extractedInternalLinks.length} {extractedInternalLinks.length === 1 ? 'Link' : 'Links'}
              </Badge>
            </div>
            
            {extractedInternalLinks.length > 0 ? (
              <div className="space-y-2">
                {extractedInternalLinks.map((link, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/20 border border-border/50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">"{link.anchorText}"</span>
                        <span className="text-muted-foreground text-xs">→</span>
                        <code className="text-blue-400 text-sm bg-muted/30 px-2 py-0.5 rounded break-all">
                          {link.targetUrl}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-muted/30">
                          {link.segmentType}
                        </Badge>
                        {link.segmentId && (
                          <span className="text-xs text-muted-foreground">
                            Segment {link.segmentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-muted/20 border border-border/50 rounded-md text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">No internal links found on this page.</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              Shows all internal links on this page with anchor text, target, and segment position.
            </p>
          </div>

          {/* External Links Overview */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                External Links
              </Label>
              <Badge 
                variant="outline" 
                className={`text-xs ${extractedExternalLinks.length > 0 ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}
              >
                {extractedExternalLinks.length} {extractedExternalLinks.length === 1 ? 'Link' : 'Links'}
              </Badge>
            </div>
            
            {extractedExternalLinks.length > 0 ? (
              <div className="space-y-2">
                {extractedExternalLinks.map((link, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/20 border border-border/50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">"{link.anchorText}"</span>
                        <span className="text-muted-foreground text-xs">→</span>
                        <a 
                          href={link.targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 text-sm break-all flex items-center gap-1"
                        >
                          {link.targetUrl.length > 60 ? link.targetUrl.substring(0, 60) + '...' : link.targetUrl}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-muted/30">
                          {link.segmentType}
                        </Badge>
                        {link.segmentId && (
                          <span className="text-xs text-muted-foreground">
                            Segment {link.segmentId}
                          </span>
                        )}
                        {link.targetTitle && (
                          <span className="text-xs text-emerald-400/70">
                            ({link.targetTitle})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-muted/20 border border-border/50 rounded-md text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">No external links found on this page.</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              Shows all external links on this page with anchor text, target URL, and segment position.
            </p>
          </div>

        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          
          {/* OG Title */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="og-title" className="text-base font-semibold text-foreground">
                OG Title
              </Label>
              <Badge variant="outline" className="text-xs bg-muted/50">Optional</Badge>
            </div>
            <Input
              id="og-title"
              value={data.ogTitle || ''}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              placeholder="Leave empty = use SEO Title"
              className="h-11 bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20"
            />
            <p className="text-sm text-muted-foreground mt-3">
              Title for social media shares. Falls back to SEO Title.
            </p>
          </div>

          {/* OG Description */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="og-description" className="text-base font-semibold text-foreground">
                OG Description
              </Label>
              <Badge variant="outline" className="text-xs bg-muted/50">Optional</Badge>
            </div>
            <Textarea
              id="og-description"
              value={data.ogDescription || ''}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              placeholder="Leave empty = use Meta Description"
              className="min-h-[80px] bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20 resize-none"
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-3">
              Description for social media shares. Falls back to Meta Description.
            </p>
          </div>

          {/* OG Image */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="og-image" className="text-base font-semibold text-foreground">
                OG Image
              </Label>
              <div className="flex items-center gap-2">
                {heroImageUrl && (
                  <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Auto from Hero</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                id="og-image"
                value={data.ogImage || heroImageUrl || ''}
                onChange={(e) => handleChange('ogImage', e.target.value)}
                placeholder={heroImageUrl ? "Auto: Hero image" : "https://... (1200×630px)"}
                className="flex-1 h-11 bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    try {
                      const fileExt = file.name.split('.').pop();
                      const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9._-]/g, '_');
                      const shortId = Math.random().toString(36).slice(2, 6);
                      const fileName = `${baseName}-${shortId}.${fileExt}`;
                      const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('og-images')
                        .upload(fileName, file);
                      
                      if (uploadError) throw uploadError;
                      
                      const { data: { publicUrl } } = supabase.storage
                        .from('og-images')
                        .getPublicUrl(fileName);
                      
                      handleChange('ogImage', publicUrl);
                    } catch (error) {
                      console.error('Upload error:', error);
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" className="h-11 px-4">
                  Upload
                </Button>
              </label>
              {data.ogImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-11 px-3"
                  onClick={() => handleChange('ogImage', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Image Preview */}
            {(data.ogImage || heroImageUrl) && (
              <div className="mt-4 p-4 bg-muted/20 border border-border/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
                <img 
                  src={data.ogImage || heroImageUrl} 
                  alt="OG Image Preview" 
                  className="w-full max-w-sm rounded border border-border/50"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              Image for social shares (1200×630px recommended)
            </p>
          </div>

          {/* Twitter Card */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="twitter-card" className="text-base font-semibold text-foreground">
                Twitter Card Type
              </Label>
              <Badge variant="outline" className="text-xs bg-muted/50">Optional</Badge>
            </div>
            <Select
              value={data.twitterCard || 'summary_large_image'}
              onValueChange={(value: 'summary' | 'summary_large_image') => handleChange('twitterCard', value)}
            >
              <SelectTrigger className="h-11 bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-3">
              "Summary Large Image" is recommended for better visibility
            </p>
          </div>
        </TabsContent>

        {/* Advanced Tab - Only rendered in Advanced mode */}
        {isAdvancedMode && (
        <TabsContent value="advanced" className="space-y-4">
          
          {/* Focus Keyword */}
          <div className={`p-5 border rounded-lg transition-colors ${
            data.focusKeyword 
              ? 'bg-green-500/5 border-green-500/30' 
              : 'bg-zinc-800/50 border-zinc-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="focus-keyword" className="text-base font-semibold text-foreground">
                  Focus Keyword (FKW)
                </Label>
                {data.focusKeyword && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Optimized</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Recommended</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                id="focus-keyword"
                value={data.focusKeyword || ''}
                onChange={(e) => handleChange('focusKeyword', e.target.value)}
                placeholder="e.g. camera testing software"
                className={`h-11 flex-1 ${
                  data.focusKeyword 
                    ? 'bg-green-500/10 border-green-500/30 focus:border-green-500 focus:ring-green-500/20' 
                    : 'bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20'
                }`}
              />
              <Button
                onClick={handleGenerateFocusKeywords}
                disabled={isGeneratingKeywords}
                className="h-11 w-[200px] shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2"
              >
                {isGeneratingKeywords ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4" />
                    <span>Smart FKW</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Character count indicator for Focus Keyword */}
            {data.focusKeyword && (() => {
              const countStyle = getCountDisplay(data.focusKeyword.length, 15, 40);
              return (
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass}`}>
                    {countStyle.showCheck && <Check className="h-3 w-3" />}
                    {data.focusKeyword.length} chars
                  </span>
                  <span className="text-xs text-muted-foreground">(Ideal: 15-40 chars, 3-6 words)</span>
                </div>
              );
            })()}
            
            {/* Keyword Suggestions */}
            {showKeywordSuggestions && keywordSuggestions.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground">AI Suggestions:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeywordSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {keywordSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors cursor-pointer group"
                      onClick={() => handleSelectKeyword(suggestion.keyword)}
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-semibold text-purple-400">
                        {suggestion.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg text-foreground group-hover:text-purple-400 transition-colors">
                            {suggestion.keyword}
                          </p>
                          {(() => {
                            const countStyle = getCountDisplay(suggestion.keyword.length, 15, 40);
                            return (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass}`}>
                                {countStyle.showCheck && <Check className="h-3 w-3" />}
                                {suggestion.keyword.length} chars
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {suggestion.reason}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-3">
              Main keyword for this page – should appear in Title, Description, and Slug
            </p>
          </div>

          {/* ===== META & HEADLINES COLLAPSIBLE SECTION ===== */}
          <Collapsible open={isMetaHeadlinesOpen} onOpenChange={setIsMetaHeadlinesOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isMetaHeadlinesOpen ? 'rotate-180' : ''}`} />
                  <span className="text-base font-semibold text-foreground">Meta & Headlines</span>
                  <span className="text-sm text-muted-foreground">(Title, Description, H1, Intro)</span>
                </div>
                <div className="flex items-center gap-2">
                  {data.title && data.metaDescription && data.h1 && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Complete</Badge>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
          
          {/* Smart Title Optimization */}
          <div className={`p-5 border rounded-lg transition-colors ${
            data.title && data.title.length >= 50 && data.title.length <= 60 && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase())
              ? 'bg-green-500/5 border-green-500/30' 
              : 'bg-zinc-800/50 border-zinc-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">
                  Optimized Title
                </Label>
                {/* Optimized Badge: shown when length is 50-60 AND FKW is included */}
                {data.title && data.title.length >= 50 && data.title.length <= 60 && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Optimized</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Recommended</Badge>
                {data.title && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                )}
              </div>
            </div>
            
            {/* Title Input with Smart Button */}
            <div className="flex gap-2">
              <Input
                value={data.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Professional Camera Testing Solutions | Image Engineering"
                className={`h-11 flex-1 ${
                  data.title && data.title.length >= 50 && data.title.length <= 60 && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase())
                    ? 'bg-green-500/10 border-green-500/30 focus:border-green-500 focus:ring-green-500/20' 
                    : 'bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20'
                }`}
              />
              <Button
                onClick={handleGenerateSEOTitles}
                disabled={isGeneratingTitle}
                className="h-11 w-[200px] shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2"
              >
                {isGeneratingTitle ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generiere...</span>
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4" />
                    <span>Smart Title</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Character count indicator */}
            {(() => {
              const titleLen = data.title?.length || 0;
              const countStyle = getCountDisplay(titleLen, 50, 60);
              return (
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass}`}>
                    {countStyle.showCheck && <Check className="h-3 w-3" />}
                    {titleLen} chars
                  </span>
                  <span className="text-xs text-muted-foreground">(Ideal: 50-60)</span>
                </div>
              );
            })()}
            
            {/* FKW Highlight Preview */}
            {data.title && data.focusKeyword && (
              <div className="mt-3 px-3 py-2 bg-muted/20 border border-border/50 rounded text-sm">
                {highlightKeyword(data.title, data.focusKeyword)}
              </div>
            )}
            
            {/* Title Suggestions */}
            {showTitleSuggestions && titleSuggestions.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground">AI Suggestions:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTitleSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {titleSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors cursor-pointer group"
                      onClick={() => handleSelectTitle(suggestion.title)}
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-semibold text-purple-400">
                        {suggestion.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg text-foreground group-hover:text-purple-400 transition-colors">
                            {suggestion.title}
                          </p>
                          {(() => {
                            const countStyle = getCountDisplay(suggestion.characterCount, 50, 60);
                            return (
                              <Badge className={`shrink-0 text-xs flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass} border-0`}>
                                {countStyle.showCheck && <Check className="h-3 w-3" />}
                                {suggestion.characterCount} chars
                              </Badge>
                            );
                          })()}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {suggestion.reason}
                        </p>
                        {suggestion.keywordPosition && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Keyword-Position: {suggestion.keywordPosition}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-3">
              Optimized Title with Focus Keyword – Ideal: 50-60 characters
            </p>
          </div>

          {/* Smart Description Optimization */}
          <div className={`p-5 border rounded-lg transition-colors ${
            data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160 && data.focusKeyword && data.metaDescription.toLowerCase().includes(data.focusKeyword.toLowerCase())
              ? 'bg-green-500/5 border-green-500/30' 
              : 'bg-zinc-800/50 border-zinc-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">
                  Optimized Description
                </Label>
                {/* Optimiert Badge: shown when length is 120-160 AND FKW is included */}
                {data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160 && data.focusKeyword && data.metaDescription.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Optimized</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Recommended</Badge>
                {data.metaDescription && data.focusKeyword && data.metaDescription.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                )}
              </div>
            </div>
            
            {/* Description Input with Smart Button */}
            <div className="flex gap-2">
              <Textarea
                value={data.metaDescription || ''}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                placeholder="e.g. Discover professional camera testing solutions for automotive, medical, and security industries. Get accurate image quality analysis."
                className={`min-h-[80px] flex-1 ${
                  data.metaDescription && data.metaDescription.length >= 120 && data.metaDescription.length <= 160 && data.focusKeyword && data.metaDescription.toLowerCase().includes(data.focusKeyword.toLowerCase())
                    ? 'bg-green-500/10 border-green-500/30 focus:border-green-500 focus:ring-green-500/20' 
                    : 'bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20'
                }`}
              />
              <Button
                onClick={handleGenerateSEODescriptions}
                disabled={isGeneratingDescription}
                className="h-11 w-[200px] shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2"
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4" />
                    <span>Smart Description</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Character count indicator */}
            {(() => {
              const descLen = data.metaDescription?.length || 0;
              const countStyle = getCountDisplay(descLen, 120, 160);
              return (
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass}`}>
                    {countStyle.showCheck && <Check className="h-3 w-3" />}
                    {descLen} chars
                  </span>
                  <span className="text-xs text-muted-foreground">(Ideal: 120-160)</span>
                </div>
              );
            })()}
            
            {/* FKW Highlight Preview */}
            {data.metaDescription && data.focusKeyword && (
              <div className="mt-3 px-3 py-2 bg-muted/20 border border-border/50 rounded text-sm">
                {highlightKeyword(data.metaDescription, data.focusKeyword)}
              </div>
            )}
            
            {/* Description Suggestions */}
            {showDescriptionSuggestions && descriptionSuggestions.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground">AI Suggestions:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDescriptionSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {descriptionSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors cursor-pointer group"
                      onClick={() => handleSelectDescription(suggestion.description)}
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-semibold text-purple-400">
                        {suggestion.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground group-hover:text-purple-400 transition-colors">
                            {suggestion.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const countStyle = getCountDisplay(suggestion.characterCount, 120, 160);
                            return (
                              <Badge className={`shrink-0 text-xs flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass} border-0`}>
                                {countStyle.showCheck && <Check className="h-3 w-3" />}
                                {suggestion.characterCount} chars
                              </Badge>
                            );
                          })()}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                          {suggestion.reason}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-3">
              Optimized Meta Description with Focus Keyword – Ideal: 120-160 characters
            </p>
          </div>
          <div className={`p-5 border rounded-lg transition-colors ${
            data.h1 && data.h1.length >= 40 && data.h1.length <= 70 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase())
              ? 'bg-green-500/5 border-green-500/30' 
              : 'bg-zinc-800/50 border-zinc-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">
                  H1 Headline Optimization
                </Label>
                {data.h1 && data.h1.length >= 40 && data.h1.length <= 70 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Optimiert</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Recommended</Badge>
                {data.h1 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                )}
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-muted/20 border border-border/50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Current H1</p>
                  {data.h1Locked && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      🔒 Locked (manually set)
                    </Badge>
                  )}
                  {/* H1 character count - LEFT side */}
                  {data.h1 && (() => {
                    const countStyle = getCountDisplay(data.h1.length, 20, 70);
                    return (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass}`}>
                          {countStyle.showCheck && <Check className="h-3 w-3" />}
                          {data.h1.length} chars
                        </span>
                        <span className="text-xs text-muted-foreground">(Ideal: 20-70)</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              {data.h1 ? (
                <p className="text-base font-medium">{highlightKeyword(data.h1, data.focusKeyword || '')}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No H1 found. Add a Full Hero, Intro or Action Hero segment.</p>
              )}
              {h1SourceInfo && (
                <p className="text-xs text-muted-foreground mt-2">
                  Source: {h1SourceInfo.label} ({h1SourceInfo.key}) – Segment ID: {h1SourceInfo.id}
                </p>
              )}
              {/* Unlock button for locked H1 */}
              {data.h1Locked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChange({ ...data, h1Locked: false })}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  🔓 Unlock (enable auto-detection)
                </Button>
              )}
            </div>

            {/* Selected H1 with Apply Button */}
            {selectedH1Suggestion && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-400">✓ Selected H1</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedH1Suggestion(null)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-lg font-semibold text-foreground">
                    "{selectedH1Suggestion.headline}"
                  </p>
                  {(() => {
                    const countStyle = getCountDisplay(selectedH1Suggestion.headline.length, 40, 70);
                    return (
                      <Badge variant="outline" className={`shrink-0 flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass} border-0`}>
                        {countStyle.showCheck && <Check className="h-3 w-3" />}
                        {selectedH1Suggestion.headline.length} chars
                      </Badge>
                    );
                  })()}
                </div>
                
                {selectedH1Suggestion.selectedPlacement && (
                  <div className="mb-3 space-y-3">
                    {/* Placement Options Selector */}
                    {selectedH1Suggestion.allPlacementOptions.length > 1 && (
                      <div className="p-3 bg-muted/20 rounded-md border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Placement options (Best → Alternative):</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedH1Suggestion.allPlacementOptions.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleChangePlacement(idx)}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                opt.rank === selectedH1Suggestion.selectedPlacement?.rank
                                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                  : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50'
                              }`}
                            >
                              <span className="font-semibold mr-1">#{opt.rank}</span>
                              {getSegmentLabel(opt.segmentType, opt.segmentKey || '')}
                              {opt.createNew && <span className="ml-1 text-yellow-400">+ NEW</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Selected Placement Details */}
                    <div className="p-3 bg-muted/30 rounded-md border border-purple-500/20">
                      <p className="text-sm font-medium text-purple-400 mb-2">
                        📍 {selectedH1Suggestion.selectedPlacement.createNew ? 'Create new segment:' : 'Placement:'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">{selectedH1Suggestion.selectedPlacement.note}</p>
                      
                      {/* Segment Details Box */}
                      <div className="mt-2 p-2 bg-muted/50 rounded border border-border/50">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Segment Type:</span>
                            <p className="font-medium text-foreground">
                              {getSegmentLabel(selectedH1Suggestion.selectedPlacement.segmentType, selectedH1Suggestion.selectedPlacement.segmentKey || '')}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tab Position:</span>
                            <p className="font-mono font-medium text-purple-400">
                              #{selectedH1Suggestion.selectedPlacement.suggestedTabPosition}
                            </p>
                          </div>
                          {selectedH1Suggestion.selectedPlacement.segmentId && !selectedH1Suggestion.selectedPlacement.createNew && (
                            <div>
                              <span className="text-muted-foreground">Segment ID:</span>
                              <p className="font-mono font-medium text-purple-400">
                                #{selectedH1Suggestion.selectedPlacement.segmentId}
                              </p>
                            </div>
                          )}
                          {selectedH1Suggestion.selectedPlacement.segmentKey && !selectedH1Suggestion.selectedPlacement.createNew && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Segment Key:</span>
                              <p className="font-mono font-medium text-purple-400 break-all">
                                {selectedH1Suggestion.selectedPlacement.segmentKey}
                              </p>
                            </div>
                          )}
                          {selectedH1Suggestion.selectedPlacement.createNew && (
                            <div className="col-span-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              <p className="text-yellow-400 text-xs font-medium">
                                ⚡ New segment will be created at position {selectedH1Suggestion.selectedPlacement.suggestedTabPosition}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {h1SourceInfo && selectedH1Suggestion.selectedPlacement.segmentKey !== h1SourceInfo.key && !selectedH1Suggestion.selectedPlacement.createNew && (
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
                          <p className="text-yellow-400 font-medium">
                            ⚠️ Existing H1 will be adjusted:
                          </p>
                          <p className="text-yellow-400/80 mt-1">
                            H1 in "{h1SourceInfo.label}" ({h1SourceInfo.key}) → will be converted to H2
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleApplyH1ToSegment}
                  disabled={isApplyingH1}
                  className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isApplyingH1 ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Apply H1 to Segment
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* H1 Change Log - Documentation of applied changes */}
            {h1ChangeLog && (
              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-blue-400">📋 Change Log</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setH1ChangeLog(null)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-3 text-sm">
                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Applied at:</span>
                    <span className="font-mono">{new Date(h1ChangeLog.timestamp).toLocaleString('en-US')}</span>
                  </div>
                  
                  {/* New H1 */}
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <p className="text-xs text-green-400 font-medium mb-1">✅ New H1 set:</p>
                    <p className="text-foreground font-semibold">"{h1ChangeLog.newH1}"</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span>Target Segment: </span>
                      <span className="font-medium text-green-400">{h1ChangeLog.targetSegment.label}</span>
                      <span className="text-muted-foreground"> (ID: #{h1ChangeLog.targetSegment.id}, Key: {h1ChangeLog.targetSegment.key})</span>
                    </div>
                  </div>
                  
                  {/* Old H1 conversion if applicable */}
                  {h1ChangeLog.oldH1 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <p className="text-xs text-yellow-400 font-medium mb-1">🔄 Previous H1 converted:</p>
                      <p className="text-foreground">"{h1ChangeLog.oldH1.text}"</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span>Segment: </span>
                        <span className="font-medium text-yellow-400">{h1ChangeLog.oldH1.segment.label}</span>
                        <span> ({h1ChangeLog.oldH1.segment.key})</span>
                        <span className="text-yellow-400 ml-2">→ {h1ChangeLog.oldH1.action}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Info about Basic/Advanced sync */}
                  <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                    <p>💡 The H1 was updated both in the segment and in the SEO settings (Basic & Advanced).</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button - aligned right like Smart FKW */}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateH1Headlines}
                disabled={isGeneratingH1}
                className="h-11 w-[200px] shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2"
              >
                {isGeneratingH1 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analysiere...</span>
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4" />
                    <span>Smart H1</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* H1 Suggestions */}
            {showH1Suggestions && h1Suggestions.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground">AI H1 Suggestions:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowH1Suggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {h1Suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors cursor-pointer group"
                      onClick={() => handleSelectH1(suggestion)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-semibold text-purple-400">
                          {suggestion.priority}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-lg text-foreground group-hover:text-purple-400 transition-colors">
                            "{suggestion.headline}"
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              suggestion.characterCount >= 20 && suggestion.characterCount <= 70 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {suggestion.characterCount} chars
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                              FKW: {suggestion.keywordPosition}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {suggestion.reason}
                          </p>
                          {suggestion.placementSuggestion && (() => {
                            // Find segment ID from registry
                            const segKey = suggestion.placementSuggestion.segmentKey;
                            const segType = suggestion.placementSuggestion.segmentType;
                            const foundSeg = segmentRegistry.find(seg => 
                              (segKey && seg.segment_key === segKey && !seg.deleted) ||
                              (!segKey && segType && seg.segment_type === segType && !seg.deleted)
                            );
                            const segId = foundSeg?.segment_id;
                            
                            return (
                              <div className="mt-2 p-2 bg-muted/30 rounded text-xs border border-purple-500/10">
                                <span className="font-medium text-purple-400">📍 Platzierung: </span>
                                <span className="text-muted-foreground">{suggestion.placementSuggestion.note}</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  <span className="px-1.5 py-0.5 bg-purple-500/10 rounded text-purple-400">
                                    {getSegmentLabel(segType, segKey || '')}
                                  </span>
                                  {segId && (
                                    <span className="px-1.5 py-0.5 bg-muted/50 rounded font-mono">
                                      ID: #{segId}
                                    </span>
                                  )}
                                  {segKey && (
                                    <span className="px-1.5 py-0.5 bg-muted/50 rounded font-mono text-muted-foreground">
                                      {segKey}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mt-3">
              Ideal H1: 20-70 characters, contains Focus Keyword at the start
            </p>
          </div>

          {/* Introduction Text */}
          <div className={`p-5 border rounded-lg transition-colors ${
            introductionText.description && 
            introductionText.description.trim().split(/\s+/).length >= 40 && 
            introductionText.description.trim().split(/\s+/).length <= 80 && 
            data.focusKeyword && 
            introductionText.description.toLowerCase().includes(data.focusKeyword.toLowerCase())
              ? 'bg-green-500/5 border-green-500/30' 
              : 'bg-zinc-800/50 border-zinc-700'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">
                  Introduction Text
                </Label>
                {introductionText.description && 
                 introductionText.description.trim().split(/\s+/).length >= 40 && 
                 introductionText.description.trim().split(/\s+/).length <= 80 && 
                 data.focusKeyword && 
                 introductionText.description.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Optimiert</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Auto-detect</Badge>
                {(introductionText.title || introductionText.description) && data.focusKeyword && (
                  (introductionText.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) || 
                   introductionText.description.toLowerCase().includes(data.focusKeyword.toLowerCase())) && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ FKW</Badge>
                  )
                )}
              </div>
            </div>
            
            {/* Intro Source Info */}
            {introSourceInfo && (
              <p className="text-xs text-muted-foreground mb-3">
                Source: {introSourceInfo.label} ({introSourceInfo.key}) – Segment ID: {introSourceInfo.id}
              </p>
            )}
            
            {/* Current Intro Display */}
            <div className="px-4 py-3 bg-muted/20 border border-border/50 rounded-md mb-4">
              {introductionText.title && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Title</p>
                  <p className="text-sm">{highlightKeyword(introductionText.title, data.focusKeyword || '')}</p>
                </div>
              )}
              {introductionText.description && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    {/* Character/word count - LEFT side */}
                    {(() => {
                      const wordCount = introductionText.description.trim().split(/\s+/).length;
                      const charStyle = getCountDisplay(introductionText.description.length, 200, 500);
                      const wordStyle = getCountDisplay(wordCount, 40, 80, 'words');
                      return (
                        <>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${charStyle.bgClass} ${charStyle.textClass}`}>
                            {charStyle.showCheck && <Check className="h-3 w-3" />}
                            {introductionText.description.length} chars
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 ${wordStyle.bgClass} ${wordStyle.textClass}`}>
                            {wordStyle.showCheck && <Check className="h-3 w-3" />}
                            {wordCount} words
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{highlightKeyword(introductionText.description, data.focusKeyword || '')}</p>
                </div>
              )}
              {!introductionText.title && !introductionText.description && (
                <p className="text-sm text-muted-foreground italic">
                  No introduction found. Add an Intro, Tiles or Image-Text segment.
                </p>
              )}
            </div>

            {/* Generated Intro Display */}
            {showGeneratedIntro && generatedIntro && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-green-400">✓ Generated Intro Text</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowGeneratedIntro(false);
                      setGeneratedIntro(null);
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="mb-3">
                  <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                    {data.focusKeyword 
                      ? highlightKeyword(generatedIntro.introText, data.focusKeyword)
                      : generatedIntro.introText
                    }
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {(() => {
                    const countStyle = getCountDisplay(generatedIntro.wordCount, 40, 80, 'words');
                    return (
                      <Badge variant="outline" className={`text-xs flex items-center gap-1 ${countStyle.bgClass} ${countStyle.textClass} border-0`}>
                        {countStyle.showCheck && <Check className="h-3 w-3" />}
                        {generatedIntro.wordCount} words
                      </Badge>
                    );
                  })()}
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                    {generatedIntro.sentenceCount} sentences
                  </Badge>
                  {data.focusKeyword && (
                    <Badge variant="outline" className={`text-xs ${
                      generatedIntro.keyphraseCount === 1
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>
                      FKW: {generatedIntro.keyphrasePosition}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{generatedIntro.reason}</p>
                
                <Button
                  onClick={handleApplyIntroToSegment}
                  disabled={isApplyingIntro}
                  className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isApplyingIntro ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Apply Intro to Segment
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* Smart Intro Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateIntroText}
                disabled={isGeneratingIntro}
                className="h-11 w-[200px] shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center gap-2"
              >
                {isGeneratingIntro ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generiere...</span>
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4" />
                    <span>Smart Intro</span>
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Optimal: 40-80 words, Focus Keyphrase in first sentence (first 10-15 words)
            </p>
          </div>

            </CollapsibleContent>
          </Collapsible>

          {/* ===== FKW CONTENT OPTIMIZER COLLAPSIBLE SECTION ===== */}
          <Collapsible open={isFkwOptimizerOpen} onOpenChange={setIsFkwOptimizerOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 hover:from-orange-500/15 hover:to-amber-500/15 border border-orange-500/30 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-5 w-5 text-orange-400 transition-transform duration-200 ${isFkwOptimizerOpen ? 'rotate-180' : ''}`} />
                  <span className="text-base font-semibold text-foreground">FKW Content Optimizer</span>
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400 border-orange-500/30">AI-Powered</Badge>
                </div>
                {fkwContentAnalysis && (() => {
                  const actualH1ContainsFkw = !!(data.h1 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()));
                  let calculatedScore = 0;
                  if (actualH1ContainsFkw) calculatedScore += 25;
                  if (fkwContentAnalysis.introHasFkw) calculatedScore += 20;
                  if (fkwContentAnalysis.h2WithFkw > 0) calculatedScore += 15;
                  if (fkwContentAnalysis.h2Count > 0 && fkwContentAnalysis.h2WithFkw >= Math.ceil(fkwContentAnalysis.h2Count / 2)) calculatedScore += 10;
                  if (fkwContentAnalysis.densityStatus === 'optimal') calculatedScore += 20;
                  else if (fkwContentAnalysis.densityStatus === 'too_low' && fkwContentAnalysis.fkwDensity >= 0.3) calculatedScore += 10;
                  if (fkwContentAnalysis.h3WithFkw > 0) calculatedScore += 10;
                  calculatedScore = Math.min(100, calculatedScore);
                  return (
                    <Badge className={`text-sm ${
                      calculatedScore >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      calculatedScore >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      Score: {calculatedScore}/100
                    </Badge>
                  );
                })()}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
          
          {/* FKW Content Optimizer - Smart content optimization */}
          <div className="p-5 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label className="text-lg font-semibold text-foreground">
                  FKW Content Optimizer
                </Label>
                <Badge variant="outline" className="text-sm bg-orange-500/10 text-orange-400 border-orange-500/30">
                  AI-Powered
                </Badge>
              </div>
              {fkwContentAnalysis && (() => {
                // v2.0: Calculate corrected score using actual H1 from SEO data (not backend)
                const actualH1ContainsFkw = !!(data.h1 && data.focusKeyword && 
                  data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()));
                
                // Recalculate score client-side with correct H1 status
                let calculatedScore = 0;
                if (actualH1ContainsFkw) calculatedScore += 25;
                if (fkwContentAnalysis.introHasFkw) calculatedScore += 20;
                if (fkwContentAnalysis.h2WithFkw > 0) calculatedScore += 15;
                if (fkwContentAnalysis.h2Count > 0 && fkwContentAnalysis.h2WithFkw >= Math.ceil(fkwContentAnalysis.h2Count / 2)) calculatedScore += 10;
                if (fkwContentAnalysis.densityStatus === 'optimal') calculatedScore += 20;
                else if (fkwContentAnalysis.densityStatus === 'too_low' && fkwContentAnalysis.fkwDensity >= 0.3) calculatedScore += 10;
                if (fkwContentAnalysis.h3WithFkw > 0) calculatedScore += 10;
                calculatedScore = Math.min(100, calculatedScore);
                
                console.log('[FKW Score v2.0] H1:', data.h1, 'FKW:', data.focusKeyword, 'H1hasFKW:', actualH1ContainsFkw, 'Score:', calculatedScore);
                
                return (
                  <div className="flex items-center gap-2">
                    <Badge className={`text-sm ${
                      calculatedScore >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      calculatedScore >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      Score: {calculatedScore}/100
                    </Badge>
                  </div>
                );
              })()}
            </div>
            
            <p className="text-base text-muted-foreground mb-4">
              Analyze content for keyword optimization. Get AI suggestions for H2/H3 headings and body text to naturally include your focus keyword.
            </p>

            {/* Analysis Results - v2.0 */}
            {fkwContentAnalysis && (() => {
              // v2.0: Calculate corrected score using actual H1 from SEO data (not backend)
              const actualH1ContainsFkw = !!(data.h1 && data.focusKeyword && 
                data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()));
              
              // Recalculate score client-side with correct H1 status
              let calculatedScore = 0;
              if (actualH1ContainsFkw) calculatedScore += 25;
              if (fkwContentAnalysis.introHasFkw) calculatedScore += 20;
              if (fkwContentAnalysis.h2WithFkw > 0) calculatedScore += 15;
              if (fkwContentAnalysis.h2Count > 0 && fkwContentAnalysis.h2WithFkw >= Math.ceil(fkwContentAnalysis.h2Count / 2)) calculatedScore += 10;
              if (fkwContentAnalysis.densityStatus === 'optimal') calculatedScore += 20;
              else if (fkwContentAnalysis.densityStatus === 'too_low' && fkwContentAnalysis.fkwDensity >= 0.3) calculatedScore += 10;
              if (fkwContentAnalysis.h3WithFkw > 0) calculatedScore += 10;
              calculatedScore = Math.min(100, calculatedScore);
              
              return (
              <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                {/* Score with explanation */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${
                      calculatedScore >= 80 ? 'text-green-400' :
                      calculatedScore >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {calculatedScore}/100
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">
                        {calculatedScore >= 80 ? 'Excellent' :
                         calculatedScore >= 50 ? 'Needs Improvement' :
                         'Optimization Required'}
                      </p>
                      <p className="text-xs">
                        {calculatedScore < 80 && 'Check items marked with ✗ below'}
                      </p>
                    </div>
                  </div>
                  {/* Score breakdown */}
                  <div className="text-xs text-muted-foreground text-right">
                    <p>H1 +25 | Intro +20 | H2 +25 | Density +20 | H3 +10</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
                  <div>
                    <span className="text-muted-foreground block text-sm">Word Count</span>
                    <span className="font-semibold text-foreground text-lg">{fkwContentAnalysis.totalWords}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-sm">FKW Occurrences</span>
                    <span className="font-semibold text-foreground text-lg">{fkwContentAnalysis.fkwOccurrences}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-sm">Keyword Density</span>
                    <span className={`font-semibold text-lg ${
                      fkwContentAnalysis.densityStatus === 'optimal' ? 'text-green-400' :
                      fkwContentAnalysis.densityStatus === 'too_low' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {fkwContentAnalysis.fkwDensity.toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground block">(Ideal: 0.5% – 2.0%)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-sm">H2 with FKW</span>
                    <span className="font-semibold text-foreground text-lg">
                      {fkwContentAnalysis.h2WithFkw}/{fkwContentAnalysis.h2Count}
                    </span>
                  </div>
                </div>
                
                {/* Status Indicators - use actual H1 from SEO data if available */}
                {(() => {
                  // Check if H1 from SEO data contains FKW (more accurate than segment detection)
                  const actualH1HasFkw = data.h1 && data.focusKeyword 
                    ? data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase())
                    : fkwContentAnalysis.h1HasFkw;
                  
                  return (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={`text-sm ${actualH1HasFkw ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {actualH1HasFkw ? '✓' : '✗'} H1 (+25)
                      </Badge>
                      <Badge className={`text-sm ${fkwContentAnalysis.introHasFkw ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {fkwContentAnalysis.introHasFkw ? '✓' : '✗'} Intro (+20)
                      </Badge>
                      <Badge className={`text-sm ${fkwContentAnalysis.h2WithFkw > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                        {fkwContentAnalysis.h2WithFkw > 0 ? '✓' : '○'} H2 (+15/+25)
                      </Badge>
                      <Badge className={`text-sm ${fkwContentAnalysis.densityStatus === 'optimal' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                        {fkwContentAnalysis.densityStatus === 'optimal' ? '✓' : '○'} Density (+20)
                      </Badge>
                      <Badge className={`text-sm ${fkwContentAnalysis.h3WithFkw > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'}`}>
                        {fkwContentAnalysis.h3WithFkw > 0 ? '✓' : '–'} H3 (+10)
                      </Badge>
                    </div>
                  );
                })()}
                
                {/* Actionable Recommendations - with color-coded status indicators */}
                {fkwContentRecommendations.length > 0 && (
                  <div className="mt-4 space-y-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Konkrete Handlungsanweisungen:
                    </p>
                    {fkwContentRecommendations
                      .filter(rec => {
                        // Filter out H1 success message if actual H1 from SEO data has FKW and this is the positive H1 message
                        if (rec.includes('H1') && rec.startsWith('✗') && data.h1 && data.focusKeyword) {
                          const actualH1HasFkw = data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase());
                          if (actualH1HasFkw) return false;
                        }
                        return true;
                      })
                      .map((rec, i) => {
                        // Determine styling based on status indicator
                        let statusClass = 'text-muted-foreground';
                        let bgClass = 'bg-transparent';
                        
                        if (rec.startsWith('✓')) {
                          statusClass = 'text-green-400';
                          bgClass = 'bg-green-500/5';
                        } else if (rec.startsWith('✗')) {
                          statusClass = 'text-red-400';
                          bgClass = 'bg-red-500/5';
                        } else if (rec.startsWith('○')) {
                          statusClass = 'text-yellow-400';
                          bgClass = 'bg-yellow-500/5';
                        }
                        
                        return (
                          <div key={i} className={`text-sm px-3 py-2 rounded ${bgClass} ${statusClass} flex items-start gap-2`}>
                            <span className="flex-shrink-0 w-4 text-center">{rec.charAt(0)}</span>
                            <span className="flex-1">{rec.substring(2)}</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
              );
            })()}

            {/* Smart H2 Generator */}
            {fkwContentAnalysis && fkwContentAnalysis.h2Count > 0 && fkwContentAnalysis.h2WithFkw < fkwContentAnalysis.h2Count && (
              <div className="mb-4 p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold text-foreground">
                      Smart H2 Generator
                    </Label>
                    <Badge variant="outline" className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30">
                      AI-Powered
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                    {fkwContentAnalysis.h2Count - fkwContentAnalysis.h2WithFkw} H2s ohne FKW
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {fkwContentAnalysis.h2WithFkw}/{fkwContentAnalysis.h2Count} H2-Überschriften enthalten das Focus Keyword. 
                  Generiere optimierte H2-Vorschläge, die das FKW natürlich integrieren.
                </p>
                
                {/* H2 Suggestions List */}
                {showH2Suggestions && h2Suggestions.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        H2 Optimization Suggestions:
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowH2Suggestions(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {h2Suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border transition-all ${
                            suggestion.applied 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : 'bg-muted/30 border-border/50 hover:border-teal-500/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Priority indicator */}
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              suggestion.applied 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-400'
                            }`}>
                              {suggestion.applied ? '✓' : suggestion.priority}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Type badge with Segment ID */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30">
                                  H2 Heading
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-zinc-700/50 border-zinc-600 text-cyan-400 font-mono">
                                  {suggestion.segmentType}
                                </Badge>
                                {suggestion.segmentId && (
                                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono">
                                    Segment ID: {suggestion.segmentId}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* For already-optimized H2s: show single green box with trash button */}
                              {(suggestion as any).alreadyOptimized ? (
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 p-2 bg-green-500/10 border border-green-500/20 rounded">
                                    <span className="text-xs text-green-400 block mb-1">✓ Bereits optimiert:</span>
                                    <p className="text-sm text-foreground font-medium">
                                      {data.focusKeyword 
                                        ? highlightKeyword(suggestion.originalText, data.focusKeyword)
                                        : suggestion.originalText}
                                    </p>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                      Enthält bereits das Focus Keyword
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => handleRemoveH2Optimization(suggestion, index)}
                                    disabled={isApplyingH2 === index}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                                    title="FKW aus H2 entfernen"
                                  >
                                    {isApplyingH2 === index ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {/* Original text */}
                                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                                    <span className="text-xs text-red-400 block mb-1">Original:</span>
                                    <p className="text-sm text-foreground/70 line-through">
                                      {suggestion.originalText}
                                    </p>
                                  </div>
                                  
                                  {/* Suggested text */}
                                  <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                                    <span className="text-xs text-green-400 block mb-1">Optimiert:</span>
                                    <p className="text-sm text-foreground font-medium">
                                      {data.focusKeyword 
                                        ? highlightKeyword(suggestion.suggestedText, data.focusKeyword)
                                        : suggestion.suggestedText}
                                    </p>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                      {suggestion.characterCount} Zeichen
                                    </span>
                                  </div>
                                </>
                              )}
                              
                              {/* Reason */}
                              <p className="text-xs text-muted-foreground">
                                {suggestion.reason}
                              </p>
                            </div>
                            
                            {/* Action button */}
                            {!suggestion.applied && (
                              <Button
                                onClick={() => handleApplyH2Suggestion(suggestion, index)}
                                disabled={isApplyingH2 === index}
                                size="sm"
                                className="h-8 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              >
                                {isApplyingH2 === index ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Apply
                                  </>
                                )}
                              </Button>
                            )}
                            {suggestion.applied && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Applied ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Generate Button */}
                <Button
                  onClick={handleGenerateH2Headlines}
                  disabled={isGeneratingH2 || !data.focusKeyword}
                  className="w-full h-10 relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 hover:from-teal-700 hover:via-cyan-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all duration-300"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: isGeneratingH2 ? 'none' : 'shimmer 3s ease-in-out infinite',
                  }}
                >
                  {isGeneratingH2 ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing H2s...
                    </>
                  ) : (
                    <>
                      <GeminiIcon className="h-4 w-4 mr-2" />
                      Smart H2 Generator
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Smart H3 Generator - Show if there are H3s detected OR if we have focus keyword to analyze */}
            {(fkwContentAnalysis?.h3Count > 0 || data.focusKeyword) && (
              <div className="mb-4 p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold text-foreground">
                      Smart H3 Generator
                    </Label>
                    <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/30">
                      AI-Powered
                    </Badge>
                  </div>
                  {fkwContentAnalysis && fkwContentAnalysis.h3Count > 0 ? (
                    <Badge variant="outline" className="text-xs bg-zinc-700/50 text-zinc-300 border-zinc-600">
                      {fkwContentAnalysis.h3WithFkw}/{fkwContentAnalysis.h3Count} H3s mit FKW
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-zinc-700/50 text-zinc-300 border-zinc-600">
                      Analysiere H3s
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Optimiere H3-Überschriften (Item-Titel) mit dem Focus Keyword. 2-3 H3s mit FKW sind ideal.
                </p>
                
                {/* H3 Suggestions List */}
                {showH3Suggestions && h3Suggestions.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">H3 Optimization:</p>
                      <Button variant="ghost" size="sm" onClick={() => setShowH3Suggestions(false)} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {h3Suggestions.map((suggestion, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${suggestion.applied ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/30 border-border/50'}`}>
                          <div className="flex items-start gap-2">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${suggestion.applied ? 'bg-green-500/20 text-green-400' : 'bg-violet-500/20 text-violet-400'}`}>
                              {suggestion.applied ? '✓' : suggestion.priority}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/30">H3</Badge>
                                <Badge variant="outline" className="text-xs bg-zinc-700/50 text-cyan-400 font-mono">{suggestion.segmentType}</Badge>
                              </div>
                              {(suggestion as any).alreadyOptimized ? (
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
                                    <span className="text-xs text-green-400">✓ Bereits optimiert:</span>
                                    <p className="text-foreground">{data.focusKeyword ? highlightKeyword(suggestion.originalText, data.focusKeyword) : suggestion.originalText}</p>
                                  </div>
                                  <Button
                                    onClick={() => handleRemoveH3Optimization(suggestion, index)}
                                    disabled={isApplyingH3 === index}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                                    title="FKW aus H3 entfernen"
                                  >
                                    {isApplyingH3 === index ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                                    <span className="text-red-400">Original:</span> <span className="line-through">{suggestion.originalText}</span>
                                  </div>
                                  <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                                    <span className="text-green-400">Optimiert:</span> <span className="font-medium">{data.focusKeyword ? highlightKeyword(suggestion.suggestedText, data.focusKeyword) : suggestion.suggestedText}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            {!suggestion.applied && !(suggestion as any).alreadyOptimized && (
                              <Button onClick={() => handleApplyH3Suggestion(suggestion, index)} disabled={isApplyingH3 === index} size="sm" className="h-7 px-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs">
                                {isApplyingH3 === index ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3 mr-1" />Apply</>}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleGenerateH3Headlines}
                  disabled={isGeneratingH3 || !data.focusKeyword}
                  className="w-full h-10 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 hover:from-violet-700 hover:via-purple-600 hover:to-violet-700 text-white shadow-lg shadow-violet-500/20"
                >
                  {isGeneratingH3 ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing H3s...</> : <><GeminiIcon className="h-4 w-4 mr-2" />Smart H3 Generator</>}
                </Button>
              </div>
            )}

            {/* Single Suggestions List - v2.0 */}
            {showFkwContentSuggestions && fkwContentSuggestions.length > 0 && (
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground">
                    Optimization Suggestions:
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFkwContentSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fkwContentSuggestions.filter(s => !s.rejected).map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all ${
                        suggestion.applied 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-muted/30 border-border/50 hover:border-orange-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Priority indicator */}
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                          suggestion.applied 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400'
                        }`}>
                          {suggestion.applied ? '✓' : suggestion.priority}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Type badge */}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-sm ${
                              suggestion.suggestionType === 'heading' 
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>
                              {suggestion.suggestionType === 'heading' 
                                ? `${suggestion.headingLevel?.toUpperCase()} Heading` 
                                : 'Body Text'}
                            </Badge>
                            <Badge variant="outline" className="text-sm bg-zinc-700/50 border-zinc-600 text-cyan-400 font-mono">
                              Segment {suggestion.segmentId}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              ({suggestion.segmentType})
                            </span>
                          </div>
                          
                          {/* Current text */}
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                            <span className="text-sm text-red-400 block mb-1">Current:</span>
                            <p className="text-base text-foreground/70 line-through">
                              {suggestion.currentText.length > 150 
                                ? suggestion.currentText.substring(0, 150) + '...' 
                                : suggestion.currentText}
                            </p>
                          </div>
                          
                          {/* Suggested text */}
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                            <span className="text-sm text-green-400 block mb-1">Suggested:</span>
                            <p className="text-base text-foreground font-medium">
                              {data.focusKeyword 
                                ? highlightKeyword(suggestion.suggestedText, data.focusKeyword)
                                : suggestion.suggestedText}
                            </p>
                          </div>
                          
                          {/* Reason */}
                          <p className="text-sm text-muted-foreground mt-2">
                            {suggestion.reason}
                          </p>
                        </div>
                        
                        {/* Action buttons */}
                        {!suggestion.applied && (
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleApplyFkwContentSuggestion(suggestion, index)}
                              disabled={isApplyingFkwContent === index}
                              size="sm"
                              className="h-8 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              {isApplyingFkwContent === index ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Apply
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleRejectFkwContentSuggestion(index)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {suggestion.applied && (
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Applied ✓
                            </Badge>
                            <Button
                              onClick={() => handleRemoveFkwContentSuggestion(suggestion, fkwContentSuggestions.findIndex(s => s === suggestion))}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Revert to original text"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              <span className="text-xs">Revert</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Summary after processing */}
                {fkwContentSuggestions.every(s => s.applied || s.rejected) && fkwContentSuggestions.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <p className="text-base text-green-400 font-medium">
                      ✓ All suggestions processed! 
                      {fkwContentSuggestions.filter(s => s.applied).length} applied, 
                      {fkwContentSuggestions.filter(s => s.rejected).length} rejected.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerateFkwContentSuggestions}
              disabled={isGeneratingFkwContent || !data.focusKeyword}
              className="w-full h-12 relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 hover:from-orange-700 hover:via-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all duration-300 disabled:opacity-50"
              style={{
                backgroundSize: '200% 100%',
                animation: isGeneratingFkwContent ? 'none' : 'shimmer 3s ease-in-out infinite',
              }}
            >
              {isGeneratingFkwContent ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Content...
                </>
              ) : (
                <>
                  <GeminiIcon className="h-4 w-4 mr-2" />
                  Analyze & Optimize Content
                </>
              )}
            </Button>
            
            {!data.focusKeyword && (
              <p className="text-xs text-amber-400 mt-2 text-center">
                ⚠️ Please define a Focus Keyword first
              </p>
            )}
          </div>

            </CollapsibleContent>
          </Collapsible>

          {/* ===== INTERNAL LINKS COLLAPSIBLE SECTION ===== */}
          <Collapsible open={isInternalLinksOpen} onOpenChange={setIsInternalLinksOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isInternalLinksOpen ? 'rotate-180' : ''}`} />
                  <span className="text-base font-semibold text-foreground">Internal Links</span>
                  <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-400 border-pink-500/30">AI-Powered</Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${checks.hasInternalLinks ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}
                >
                  {checks.hasInternalLinks ? 'Present' : 'None'}
                </Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">

          {/* Smart Internal Links */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold text-foreground">
                  Internal Links
                </Label>
                <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-400 border-pink-500/30">
                  AI-Powered
                </Badge>
              </div>
              <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Recommended</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Find actionable internal links for existing content, or get suggestions for new pages to create.
            </p>
            
            {/* Two Button Row */}
            <div className="flex gap-3 mb-4">
              {/* Smart Internal Links Button (Pink) - AI gradient with animated shimmer */}
              <Button
                onClick={handleGenerateInternalLinks}
                disabled={isGeneratingInternalLinks}
                className="flex-1 h-12 relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-700 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all duration-300"
                style={{
                  backgroundSize: '200% 100%',
                  animation: isGeneratingInternalLinks ? 'none' : 'shimmer 3s ease-in-out infinite',
                }}
              >
                {isGeneratingInternalLinks ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4 mr-2" />
                    Smart Internal Links
                  </>
                )}
              </Button>
              
              {/* Possible Internal Links Button (Blue) - AI gradient with animated shimmer */}
              <Button
                onClick={handleGenerateContentLinks}
                disabled={isGeneratingContentLinks}
                className="flex-1 h-12 relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-700 hover:via-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all duration-300"
                style={{
                  backgroundSize: '200% 100%',
                  animation: isGeneratingContentLinks ? 'none' : 'shimmer 3s ease-in-out infinite',
                }}
              >
                {isGeneratingContentLinks ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4 mr-2" />
                    Possible Internal Links
                  </>
                )}
              </Button>
            </div>
            
            {/* Actionable Link Suggestions (from Smart Internal Links) */}
            {showInternalLinkSuggestions && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    Actionable Links:
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInternalLinkSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {internalLinkSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {internalLinkSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border transition-colors ${
                          suggestion.applied 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-muted/30 border-border/50 hover:border-pink-500/50 hover:bg-pink-500/5'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                            suggestion.applied 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-pink-400'
                          }`}>
                            {suggestion.applied ? '✓' : suggestion.priority}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Context Preview - shows where the link will be inserted */}
                            {suggestion.contextPreview && (
                              <div className="mb-3 p-2 bg-muted/30 rounded border border-border/30">
                                <span className="text-xs text-muted-foreground block mb-1">Textkontext:</span>
                                <p className="text-sm font-mono leading-relaxed">
                                  {suggestion.contextPreview.split(/\[|\]/).map((part, i) => 
                                    i === 1 ? (
                                      <span key={i} className="bg-pink-500/30 text-pink-300 px-1 rounded font-semibold">
                                        {part}
                                      </span>
                                    ) : (
                                      <span key={i} className="text-muted-foreground">{part}</span>
                                    )
                                  )}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">Segment:</span>
                              <code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded text-foreground">
                                {suggestion.segmentKey}
                              </code>
                              {(() => {
                                // For footer fields, get the actual footer segment ID from registry
                                let displaySegmentId = suggestion.segmentId;
                                let displaySegmentType = suggestion.segmentType || 'segment';
                                
                                if (!displaySegmentId && suggestion.segmentKey?.startsWith('footer')) {
                                  const footerSegment = segmentRegistry.find(
                                    s => s.segment_type === 'footer' && s.page_slug === pageSlug
                                  );
                                  if (footerSegment) {
                                    displaySegmentId = footerSegment.segment_id;
                                    displaySegmentType = 'footer';
                                  }
                                }
                                
                                return displaySegmentId ? (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono">
                                    ID {displaySegmentId}: {displaySegmentType}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono">
                                    ID -: {displaySegmentType}
                                  </Badge>
                                );
                              })()}
                              {suggestion.segmentType && suggestion.segmentType !== 'text' && (
                                <Badge variant="outline" className="text-xs bg-zinc-500/10 text-zinc-400 border-zinc-500/30">
                                  {suggestion.segmentType}
                                </Badge>
                              )}
                              {suggestion.segmentField && suggestion.segmentField !== 'raw' && (
                                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                  Feld: {suggestion.segmentField}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">→ Link zu:</span>
                              <span className="font-medium text-pink-400">
                                {suggestion.targetTitle}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (/{suggestion.targetSlug})
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground italic">
                              {suggestion.reason}
                            </p>
                          </div>
                          {!suggestion.applied && (
                            <Button
                              onClick={() => handleApplyInternalLink(suggestion, index)}
                              size="sm"
                              className="flex-shrink-0 h-8 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            >
                              Apply Link
                            </Button>
                          )}
                          {suggestion.applied && (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Applied ✓
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLinkToDelete({ suggestion, index })}
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                title="Link entfernen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      <span className="text-sm font-medium text-pink-400">Analysis Complete</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No internal link opportunities found. Add more text content or try "Possible Internal Links" for content suggestions.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Delete Link Confirmation Dialog */}
            <AlertDialog open={!!linkToDelete} onOpenChange={(open) => !open && setLinkToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove internal link?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Do you want to remove the link to <strong className="text-foreground">"{linkToDelete?.suggestion.targetTitle}"</strong>?
                    </p>
                    <p className="text-sm">
                      The link will be removed from segment <code className="bg-muted px-1 py-0.5 rounded">{linkToDelete?.suggestion.segmentKey}</code> and the anchor text "{linkToDelete?.suggestion.anchorText}" will be displayed as plain text.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingLink}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteInternalLink}
                    disabled={isDeletingLink}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeletingLink ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Link
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Content Suggestions (from Possible Internal Links) */}
            {showContentLinkSuggestions && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-amber-500"></span>
                    Content Cluster Suggestions:
                  </p>
                  <div className="flex items-center gap-2">
                    {contentLinkSuggestions.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveContentSuggestions}
                        disabled={isSavingContentSuggestions}
                        className="h-7 text-xs bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400"
                      >
                        {isSavingContentSuggestions ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowContentLinkSuggestions(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {contentLinkSuggestions.length > 0 ? (
                  <div className="space-y-6">
                    {/* Group 1: New Cluster Pages (blue) */}
                    {(() => {
                      const newPages = contentLinkSuggestions.filter(s => s.suggestionType === 'new_page' || !s.suggestionType);
                      if (newPages.length === 0) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <p className="text-base font-bold text-blue-400">
                              New Cluster Pages ({newPages.length})
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground italic pl-6">
                            Neue Seiten, die als Cluster-Content um diese Pillar-Page erstellt werden sollten:
                          </p>
                          {newPages.map((suggestion, index) => {
                            const originalIndex = contentLinkSuggestions.findIndex(s => s === suggestion);
                            return (
                            <div
                              key={`new-${index}`}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                suggestion.saved 
                                  ? 'border-green-500 bg-green-500/20 ring-2 ring-green-500/30' 
                                  : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Priority or Success Icon */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                  suggestion.saved 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {suggestion.saved ? (
                                    <Check className="h-5 w-5" />
                                  ) : (
                                    suggestion.priority
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className={`text-base font-semibold ${suggestion.saved ? 'text-green-400' : 'text-foreground'}`}>
                                      {suggestion.suggestedTitle}
                                    </span>
                                    <Badge variant="outline" className={`text-xs ${
                                      suggestion.saved 
                                        ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                    }`}>
                                      {suggestion.segmentType}
                                    </Badge>
                                    {suggestion.saved && (
                                      <Badge className="text-xs bg-green-500 text-white border-0 font-semibold">
                                        <Check className="h-3 w-3 mr-1" />
                                        Created
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-muted-foreground">Slug:</span>
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                                      suggestion.saved 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-muted/50 text-blue-400'
                                    }`}>
                                      /{suggestion.createdSlug || (suggestion.parentSlug ? `${suggestion.parentSlug}/${suggestion.suggestedSlug}` : suggestion.suggestedSlug)}
                                    </span>
                                  </div>
                                  {suggestion.parentSlug && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm text-muted-foreground">Parent (Pillar):</span>
                                      <span className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded text-purple-400">
                                        /{suggestion.parentSlug}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Link Placement Info - Enhanced with detailed field info */}
                                  {suggestion.linkPlacement && (
                                    <div className={`mt-3 p-3 border rounded-md ${
                                      suggestion.saved 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-purple-500/10 border-purple-500/20'
                                    }`}>
                                      <p className={`text-sm font-bold mb-2 flex items-center gap-1 ${
                                        suggestion.saved ? 'text-green-400' : 'text-purple-400'
                                      }`}>
                                        <LinkIcon className="h-4 w-4" />
                                        {suggestion.saved ? 'Link wurde eingefügt in:' : 'Link wird eingefügt auf der Pillar-Page:'}
                                      </p>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground font-medium">Segment:</span>
                                          <code className={`px-2 py-1 rounded font-mono text-sm ${
                                            suggestion.saved 
                                              ? 'bg-green-500/20 text-green-300' 
                                              : 'bg-muted/50 text-purple-300'
                                          }`}>
                                            {suggestion.linkPlacement.segmentType} (ID: {suggestion.linkPlacement.segmentId})
                                          </code>
                                        </div>
                                        {!suggestion.saved && (
                                          <>
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground font-medium">Einfügemodus:</span>
                                              <Badge variant="outline" className="text-sm bg-purple-500/10 text-purple-400 border-purple-500/30 px-2 py-0.5">
                                                {suggestion.linkPlacement.placementType === 'inline_text' ? 'Im Fließtext' : 
                                                 suggestion.linkPlacement.placementType === 'cta_button' ? 'Als CTA-Button' :
                                                 suggestion.linkPlacement.placementType === 'feature_card' ? 'In Feature-Card' :
                                                 suggestion.linkPlacement.placementType.replace('_', ' ')}
                                              </Badge>
                                            </div>
                                            <div className="mt-2 p-2 bg-purple-500/5 rounded border border-purple-500/20">
                                              <p className="text-sm text-purple-300 font-medium">
                                                📍 Genauer Platzierungsort:
                                              </p>
                                              <p className="text-sm text-muted-foreground mt-1">
                                                {suggestion.linkPlacement.placementDescription || 
                                                  `Der Link wird am Ende des Textfeldes im Segment "${suggestion.linkPlacement.segmentType}" eingefügt (z.B. description, introText, body, oder im ersten Feature-Item).`}
                                              </p>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Suggested/Created Segments - show before AND after saving */}
                                  {suggestion.suggestedSegments && suggestion.suggestedSegments.length > 0 && (
                                    <div className={`mt-3 p-3 border rounded-md ${
                                      suggestion.saved 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-blue-500/10 border-blue-500/20'
                                    }`}>
                                      <p className={`text-xs font-semibold mb-2 ${
                                        suggestion.saved ? 'text-green-400' : 'text-blue-400'
                                      }`}>
                                        {suggestion.saved ? '✓ Erstellte Segmente:' : 'Vorgeschlagene Segmente:'}
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {suggestion.suggestedSegments.map((seg: { type: string; content?: string }, segIdx: number) => (
                                          <Badge 
                                            key={segIdx}
                                            variant="outline" 
                                            className={`text-xs ${
                                              suggestion.saved 
                                                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                                : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                            }`}
                                          >
                                            {seg.type}
                                          </Badge>
                                        ))}
                                      </div>
                                      {suggestion.saved && (
                                        <p className="text-xs text-green-400/70 mt-2">
                                          {suggestion.suggestedSegments.length} Segmente mit Platzhalter-Inhalten erstellt
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {!suggestion.saved && (
                                    <p className="text-sm text-muted-foreground mt-3">
                                      {suggestion.reason}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Action Column */}
                                <div className="flex flex-col items-end gap-2">
                                  {suggestion.saved ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <Badge className="flex-shrink-0 text-xs bg-green-500 text-white border-0">
                                          <Check className="h-3 w-3 mr-1" />
                                          Applied
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setContentLinkSuggestions(prev => prev.filter((_, i) => i !== originalIndex));
                                            toast.success('Vorschlag entfernt');
                                          }}
                                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                          title="Vorschlag löschen"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <a
                                        href={`/${suggestion.createdSlug || (suggestion.parentSlug ? `${suggestion.parentSlug}/${suggestion.suggestedSlug}` : suggestion.suggestedSlug)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 h-11 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors w-full"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        Preview
                                      </a>
                                      
                                      {/* AI Content Generator Button - Rainbow style, same size as Smart Intro */}
                                      {suggestion.contentGenerated ? (
                                        <Badge className="flex items-center justify-center h-11 px-6 text-sm bg-purple-500 text-white border-0 w-full">
                                          <Sparkles className="h-4 w-4 mr-2" />
                                          Content Generated
                                        </Badge>
                                      ) : (
                                        <Button
                                          onClick={() => handleGenerateClusterContent(suggestion, originalIndex)}
                                          disabled={suggestion.isGeneratingContent}
                                          className="h-11 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg shadow-purple-500/25 transition-all duration-300"
                                        >
                                          {suggestion.isGeneratingContent ? (
                                            <>
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                              Generiere...
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="h-4 w-4 mr-2" />
                                              AI-Inhalte erstellen
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="flex-shrink-0 text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                        New Page
                                      </Badge>
                                      <Button
                                        size="sm"
                                        onClick={() => handleApplyClusterSuggestion(suggestion, originalIndex)}
                                        disabled={suggestion.isApplying}
                                        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        {suggestion.isApplying ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <>
                                            <Plus className="h-3 w-3 mr-1" />
                                            Apply
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setContentLinkSuggestions(prev => prev.filter((_, i) => i !== originalIndex));
                                          toast.success('Vorschlag entfernt');
                                        }}
                                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                        title="Vorschlag löschen"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                    
                    {/* Group 2: Segment Enhancements in Existing Pages (amber/yellow) */}
                    {(() => {
                      const segmentEnhancements = contentLinkSuggestions.filter(s => s.suggestionType === 'existing_segment');
                      if (segmentEnhancements.length === 0) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                            <p className="text-base font-bold text-amber-400">
                              Segment Enhancements ({segmentEnhancements.length})
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground italic pl-6">
                            Segmente in bestehenden Seiten, die ergänzt oder erstellt werden sollten:
                          </p>
                          {segmentEnhancements.map((suggestion, index) => (
                            <div
                              key={`seg-${index}`}
                              className={`p-4 rounded-lg border-2 transition-colors ${
                                suggestion.saved 
                                  ? 'border-green-500/50 bg-green-500/10' 
                                  : 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                                  {suggestion.priority}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="text-base font-bold text-foreground">
                                      {suggestion.suggestedTitle}
                                    </span>
                                    <Badge variant="outline" className="text-sm bg-amber-500/10 text-amber-400 border-amber-500/30 px-2 py-0.5">
                                      {suggestion.segmentType}
                                    </Badge>
                                    {suggestion.saved && (
                                      <Badge className="text-sm bg-green-500 text-white border-0 font-semibold px-2 py-0.5">
                                        <Check className="h-3 w-3 mr-1" />
                                        Created
                                      </Badge>
                                    )}
                                  </div>
                                  {suggestion.targetPageSlug && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-muted-foreground">Zielseite:</span>
                                      <a 
                                        href={`/${suggestion.targetPageSlug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm font-mono bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded text-amber-400 hover:text-amber-300 transition-colors"
                                      >
                                        /{suggestion.targetPageSlug}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                  )}
                                  
                                  {/* Detailed action description */}
                                  <div className="mt-2 p-2 bg-amber-500/5 rounded border border-amber-500/20">
                                    <p className="text-sm text-amber-300 font-medium">
                                      📝 Vorgeschlagene Aktion:
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Ein neues <strong>{suggestion.segmentType}</strong>-Segment sollte auf der Seite <strong>/{suggestion.targetPageSlug}</strong> erstellt werden, um den Content zu vervollständigen.
                                    </p>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mt-3">
                                    {suggestion.reason}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant="outline" className="flex-shrink-0 text-sm bg-amber-500/10 text-amber-400 border-amber-500/30 px-2 py-1">
                                    ⚠️ Segment fehlt
                                  </Badge>
                                  {suggestion.targetPageSlug && (
                                    <a
                                      href={`/admin?page=${suggestion.targetPageSlug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded transition-colors"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Edit Page
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-4 bg-muted/20 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      No content suggestions found. Your site structure may already be comprehensive.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

            </CollapsibleContent>
          </Collapsible>

          {/* ===== EXTERNAL LINKS COLLAPSIBLE SECTION ===== */}
          <Collapsible open={isExternalLinksOpen} onOpenChange={setIsExternalLinksOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isExternalLinksOpen ? 'rotate-180' : ''}`} />
                  <span className="text-base font-semibold text-foreground">External Links</span>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">AI-Powered</Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${checks.hasExternalLinks ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}
                >
                  {checks.hasExternalLinks ? 'Present' : 'None'}
                </Badge>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">

          {/* External Links - Smart Suggestions (Advanced Feature) */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Smart External Links
              </Label>
              <Badge 
                variant="outline" 
              className={`text-xs ${checks.hasExternalLinks ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}
              >
                {checks.hasExternalLinks ? 'Present' : 'None'}
              </Badge>
            </div>
            
            {/* Generate Button - Green AI gradient with animated shimmer */}
            <Button
              onClick={handleGenerateExternalLinks}
              disabled={isGeneratingExternalLinks}
              className="w-full mb-4 h-12 relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 hover:from-emerald-700 hover:via-teal-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300"
              style={{
                backgroundSize: '200% 100%',
                animation: isGeneratingExternalLinks ? 'none' : 'shimmer 3s ease-in-out infinite',
              }}
            >
              {isGeneratingExternalLinks ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <GeminiIcon className="h-4 w-4 mr-2" />
                  Generate Smart External Links
                </>
              )}
            </Button>

            {/* External Link Suggestions */}
            {showExternalLinkSuggestions && externalLinkSuggestions.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Suggestions (neutral, authoritative sources only):
                </p>
                {externalLinkSuggestions.map((suggestion, idx) => {
                  // Map sourceType to clear display labels with icons
                  const sourceTypeLabels: Record<string, { label: string; color: string }> = {
                    'academic': { label: '🎓 Academic Research', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
                    'standards': { label: '📐 Industry Standard', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
                    'knowledge': { label: '📚 Knowledge Base', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
                    'government': { label: '🏛️ Government/Official', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
                    'technical': { label: '⚙️ Technical Docs', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
                  };
                  const sourceInfo = sourceTypeLabels[suggestion.sourceType] || { 
                    label: `📎 ${suggestion.sourceType || 'Resource'}`, 
                    color: 'bg-muted/30 text-muted-foreground border-border' 
                  };

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border transition-all ${
                        suggestion.applied 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-muted/20 border-border/50 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Left side: Checkmark or priority indicator */}
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                          suggestion.applied 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400'
                        }`}>
                          {suggestion.applied ? '✓' : suggestion.priority}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Source segment info */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs bg-zinc-700/50 border-zinc-600 text-cyan-400 font-mono">
                              Segment {suggestion.segmentId || suggestion.internalId || suggestion.segmentKey?.replace('segment-', '') || '?'}
                            </Badge>
                            {suggestion.segmentType && suggestion.segmentType !== 'unknown' && (
                              <span className="text-xs text-muted-foreground">
                                ({suggestion.segmentType})
                              </span>
                            )}
                          </div>

                          {/* Anchor text */}
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Link text:</span>
                            <span className="font-medium text-foreground text-sm">"{suggestion.anchorText}"</span>
                          </div>

                          {/* Target URL - show full URL */}
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Target URL:</span>
                            <a 
                              href={suggestion.targetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 text-sm break-all flex items-start gap-1"
                            >
                              {suggestion.targetUrl}
                              <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            </a>
                          </div>

                          {/* Target page title / description */}
                          {suggestion.targetTitle && suggestion.targetTitle !== suggestion.targetUrl && (
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">Page title:</span>
                              <span className="text-sm text-foreground/80">{suggestion.targetTitle}</span>
                            </div>
                          )}

                          {/* Source type badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={`text-xs ${sourceInfo.color}`}>
                              {sourceInfo.label}
                            </Badge>
                          </div>

                          {/* Reason / summary */}
                          {suggestion.reason && (
                            <div className="mt-2 p-2 bg-muted/30 rounded-md">
                              <p className="text-xs text-muted-foreground">
                                <strong>Why link here:</strong> {suggestion.reason}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Right side: Apply button or Applied badge with trash */}
                        {!suggestion.applied && (
                          <Button
                            onClick={() => handleApplyExternalLink(suggestion, idx)}
                            size="sm"
                            className="flex-shrink-0 h-8 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                          >
                            Apply Link
                          </Button>
                        )}
                        {suggestion.applied && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Applied ✓
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExternalLinkToDelete({ suggestion, index: idx })}
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Remove link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showExternalLinkSuggestions && externalLinkSuggestions.length === 0 && (
              <div className="flex items-center gap-2 p-4 bg-muted/20 border border-border/50 rounded-md text-muted-foreground mb-4">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">No suitable external link opportunities found.</span>
              </div>
            )}

            {/* Delete External Link Confirmation Dialog */}
            <AlertDialog open={!!externalLinkToDelete} onOpenChange={(open) => !open && setExternalLinkToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove external link?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Do you want to remove the link to <strong className="text-foreground">"{externalLinkToDelete?.suggestion.targetTitle}"</strong>?
                    </p>
                    <p className="text-sm">
                      The anchor text "{externalLinkToDelete?.suggestion.anchorText}" will remain, but the link will be removed.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => externalLinkToDelete && handleRemoveExternalLink(externalLinkToDelete.suggestion, externalLinkToDelete.index)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Remove Link
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-md">
              <p className="text-xs text-emerald-300/80">
                <strong>Safety Rule:</strong> Only links to neutral, authoritative sources are suggested 
                (universities, standards organizations, Wikipedia, etc.). 
                Links to competitors or commercial providers are excluded.
              </p>
            </div>
          </div>

            </CollapsibleContent>
          </Collapsible>

          {/* Canonical URL */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="canonical" className="text-base font-semibold text-foreground">
                Canonical URL
              </Label>
              <Badge variant="outline" className="text-xs bg-muted/50">Optional</Badge>
            </div>
            <Input
              id="canonical"
              value={data.canonical || ''}
              onChange={(e) => handleChange('canonical', e.target.value)}
              placeholder="https://www.image-engineering.de/your-page"
              className="h-11 bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20"
            />
            <p className="text-sm text-muted-foreground mt-3">
              Only needed if this page is a duplicate of another
            </p>
          </div>

          {/* Redirect Manager Section */}
          <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-400" />
                  URL Redirects
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage 301/302 redirects for site migrations and SEO
                </p>
              </div>
              <Button
                onClick={() => setIsRedirectManagerOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Open Redirect Manager
              </Button>
            </div>
            
            {/* Display existing redirects for this page */}
            {pageRedirects.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Redirects pointing to this page:
                </Label>
                <div className="space-y-2">
                  {pageRedirects.map((redirect) => (
                    <div 
                      key={redirect.id}
                      className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border"
                    >
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                        {redirect.redirect_type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-mono text-foreground truncate">{redirect.source_url}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-mono text-blue-400 truncate">{redirect.target_url}</span>
                        </div>
                        {redirect.notes && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{redirect.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        )}

        {/* Redirect Manager Dialog */}
        <RedirectManager 
          isOpen={isRedirectManagerOpen} 
          onClose={() => setIsRedirectManagerOpen(false)} 
        />
      </Tabs>

      {/* Save Button - Yellow, full width, no icon (convention) */}
      <div className="pt-4 border-t">
        <Button 
          onClick={onSave}
          className="w-full h-12 bg-[#f9dc24] hover:bg-[#e5c820] text-black font-semibold text-lg"
        >
          Save
        </Button>
      </div>
    </div>
  );
};
