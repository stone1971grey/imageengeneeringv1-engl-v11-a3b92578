import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Save, AlertCircle, CheckCircle2, AlertTriangle, X, Loader2, ChevronDown, Link2 } from "lucide-react";
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
    segmentField?: string;
    segmentType?: string;
    appliedAt: string;
  }>>([]);
  
  // Possible Content Links state (for content suggestions)
  const [isGeneratingContentLinks, setIsGeneratingContentLinks] = useState(false);
  const [contentLinkSuggestions, setContentLinkSuggestions] = useState<Array<{
    suggestedSlug: string;
    suggestedTitle: string;
    segmentType: string;
    reason: string;
    priority: number;
    parentSlug?: string | null;
  }>>([]);
  const [showContentLinkSuggestions, setShowContentLinkSuggestions] = useState(false);
  
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
  
  // H1 Change Log - documentation of what was changed
  const [h1ChangeLog, setH1ChangeLog] = useState<{
    timestamp: string;
    newH1: string;
    targetSegment: { id: number; key: string; type: string; label: string };
    createdNewSegment?: boolean;
    tabPosition?: number;
    oldH1?: { text: string; segment: { key: string; label: string }; action: string };
  } | null>(null);

  // Load page content and segment registry
  useEffect(() => {
    const loadPageData = async () => {
      console.log('[SEO Editor] Loading page data for:', pageSlug, 'language:', editorLanguage);
      
      // Load page content - FILTER BY LANGUAGE
      const { data: contentData, error: contentError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language', editorLanguage);
      
      console.log('[SEO Editor] Loaded content data:', contentData?.length, 'items for language:', editorLanguage);
      
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

      // Load segment registry to check for deleted segments
      const { data: registryData, error: registryError } = await supabase
        .from('segment_registry')
        .select('*')
        .eq('page_slug', pageSlug);
      
      if (!registryError && registryData) {
        setSegmentRegistry(registryData);
      }
      
      // Load persisted applied internal links
      const { data: appliedLinksData, error: appliedLinksError } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'seo_applied_internal_links')
        .eq('language', editorLanguage)
        .single();
      
      if (!appliedLinksError && appliedLinksData) {
        try {
          const parsedLinks = JSON.parse(appliedLinksData.content_value);
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
    const tilesRegistry = segmentRegistry.find(seg => seg.segment_type === 'tiles');
    const imageTextRegistry = segmentRegistry.find(seg => seg.segment_type === 'image-text');
    const introRegistry = segmentRegistry.find(seg => seg.segment_type === 'intro');
    
    console.log('[SEO Editor] Segment Registry Check:', {
      pageSlug,
      segmentRegistryLength: segmentRegistry.length,
      tilesRegistry,
      imageTextRegistry,
      introRegistry,
      pageContentLength: pageContent.length
    });
    
    // Priority: Intro > Tiles > Image-Text (but only if NOT deleted)
    // INTRO has highest priority and ONLY uses description (no title)
    let activeSegmentType = null;
    let activeSegmentKey = null;
    
    if (introRegistry && !introRegistry.deleted) {
      activeSegmentType = 'intro';
      activeSegmentKey = introRegistry.segment_key;
      console.log('[SEO Editor] Using INTRO segment:', { activeSegmentKey, deleted: introRegistry.deleted });
    } else if (tilesRegistry && !tilesRegistry.deleted) {
      activeSegmentType = 'tiles';
      activeSegmentKey = tilesRegistry.segment_key;
      console.log('[SEO Editor] Using TILES segment:', { activeSegmentKey, deleted: tilesRegistry.deleted });
    } else if (imageTextRegistry && !imageTextRegistry.deleted) {
      activeSegmentType = 'image-text';
      activeSegmentKey = imageTextRegistry.segment_key;
      console.log('[SEO Editor] Using IMAGE-TEXT segment:', { activeSegmentKey, deleted: imageTextRegistry.deleted });
    }
    
    console.log('[SEO Editor] Active segment determined:', { activeSegmentType, activeSegmentKey });
    
    // Determine H1 heading dynamically with priority
    // Priority: 1. Intro Title > 2. Full Hero > 3. Product Hero Gallery > 4. Product Hero (hero) > 5. Action Hero
    let autoH1 = '';
    let h1Source: { type: string; key: string; id: string | number; label: string } | null = null;
    
    // 1. Check Intro segment first (highest priority)
    // IMPORTANT: Intro segments are stored INSIDE page_segments JSON array, NOT as separate section_keys
    if (introRegistry && !introRegistry.deleted) {
      const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
      if (pageSegmentsEntry) {
        try {
          const segments = JSON.parse(pageSegmentsEntry.content_value);
          const introSegment = segments.find((seg: any) => 
            seg.type === 'intro' && String(seg.id) === String(introRegistry.segment_id)
          );
          if (introSegment?.data?.title) {
            autoH1 = introSegment.data.title;
            h1Source = {
              type: 'intro',
              key: introRegistry.segment_key,
              id: introRegistry.segment_id,
              label: 'Intro'
            };
            console.log('[SEO Editor] H1 from Intro title (in page_segments):', autoH1);
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
    if (!autoH1) {
      const productHeroGalleryRegistry = segmentRegistry.find(seg => seg.segment_type === 'product-hero-gallery' && !seg.deleted);
      if (productHeroGalleryRegistry) {
        const phgContent = pageContent.find(item => item.section_key === productHeroGalleryRegistry.segment_key);
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
                key: productHeroGalleryRegistry.segment_key,
                id: productHeroGalleryRegistry.segment_id,
                label: 'Product Hero Gallery'
              };
              console.log('[SEO Editor] H1 from Product Hero Gallery:', autoH1);
            }
          } catch (e) {
            console.error('[SEO Editor] Failed to parse product hero gallery for H1:', e);
          }
        }
      }
    }
    
    // 4. Check Product Hero segment (legacy "hero" type that stores data in page_segments JSON)
    if (!autoH1) {
      const productHeroRegistry = segmentRegistry.find(seg => seg.segment_type === 'hero' && !seg.deleted);
      if (productHeroRegistry) {
        // Product Hero stores data in page_segments JSON, not in individual section_keys
        const pageSegmentsEntry = pageContent.find(item => item.section_key === 'page_segments');
        if (pageSegmentsEntry) {
          try {
            const segments = JSON.parse(pageSegmentsEntry.content_value);
            const heroSegment = segments.find((seg: any) => 
              seg.type === 'hero' && String(seg.id) === String(productHeroRegistry.segment_id)
            );
            if (heroSegment?.data) {
              const title = heroSegment.data.hero_title || '';
              const subtitle = heroSegment.data.hero_subtitle || '';
              const combinedTitle = [title, subtitle].filter(Boolean).join(' ');
              if (combinedTitle) {
                autoH1 = combinedTitle;
                h1Source = {
                  type: 'hero',
                  key: productHeroRegistry.segment_key,
                  id: productHeroRegistry.segment_id,
                  label: 'Product Hero'
                };
                console.log('[SEO Editor] H1 from Product Hero:', autoH1);
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
            // Find the intro segment by ID from the registry
            const introSegmentId = introRegistry?.segment_id;
            const introSegment = segments.find((seg: any) => 
              seg.type === 'intro' && String(seg.id) === String(introSegmentId)
            );
            
            console.log('[SEO Editor] Found intro segment in page_segments:', introSegment);
            
            if (introSegment?.data) {
              introTitle = ''; // Never use title for Intro segment in Introduction display
              introDescription = introSegment.data.description || '';
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
      const activeRegistry = activeSegmentType === 'intro' ? introRegistry 
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
      // Check for internal links (relative paths or same domain)
      if (content.includes('href="/') || content.includes('href="./') || content.includes('href="#')) {
        hasInternalLinks = true;
      }
      // Check for external links (http/https)
      const externalLinkPattern = /href=["'](https?:\/\/(?!localhost)[^"']+)["']/gi;
      if (externalLinkPattern.test(content)) {
        hasExternalLinks = true;
      }
    });

    setChecks({
      titleLength,
      descriptionLength,
      hasH1,
      hasInternalLinks,
      hasExternalLinks,
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
      hasInternalLinks,
      hasExternalLinks,
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
        toast.error('Fehler beim Generieren der Keywords: ' + error.message);
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
        toast.success(`${result.keywords.length} Keyword-Vorschläge generiert`);
      } else {
        toast.error('Keine Keywords generiert');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unerwarteter Fehler beim Generieren der Keywords');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    handleChange('focusKeyword', keyword);
    setShowKeywordSuggestions(false);
    toast.success(`Focus Keyword "${keyword}" ausgewählt`);
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
        toast.error('Fehler beim Generieren der Titles: ' + error.message);
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
        toast.success(`${result.titles.length} Title-Vorschläge generiert`);
      } else {
        toast.error('Keine Titles generiert');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unerwarteter Fehler beim Generieren der Titles');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleSelectTitle = (title: string) => {
    handleChange('title', title);
    setShowTitleSuggestions(false);
    toast.success(`Title "${title.substring(0, 30)}..." übernommen`);
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
        toast.error('Fehler beim Generieren der Descriptions: ' + error.message);
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
        toast.success(`${result.suggestions.length} Description-Vorschläge generiert`);
      } else {
        toast.error('Keine Descriptions generiert');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unerwarteter Fehler beim Generieren der Descriptions');
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
      // Find the segment content
      const segmentEntry = pageContent.find(item => item.section_key === suggestion.segmentKey);
      if (!segmentEntry) {
        toast.error(`Segment ${suggestion.segmentKey} nicht gefunden`);
        return;
      }

      let updatedContent = segmentEntry.content_value;
      let linkInserted = false;
      
      // Build the link HTML
      const linkHtml = `<a href="/${editorLanguage}/${suggestion.targetSlug}" class="internal-link">${suggestion.anchorText}</a>`;

      // Try to parse as JSON first
      try {
        const contentObj = JSON.parse(segmentEntry.content_value);
        
        // Check different text fields where the anchor might be
        const textFields = ['introText', 'description', 'subtitle', 'content', 'text', 'cta_description', 'button_text'];

        for (const field of textFields) {
          if (contentObj[field] && typeof contentObj[field] === 'string') {
            if (contentObj[field].includes(suggestion.anchorText)) {
              contentObj[field] = contentObj[field].replace(suggestion.anchorText, linkHtml);
              linkInserted = true;
              break;
            }
          }
        }
        
        if (linkInserted) {
          updatedContent = JSON.stringify(contentObj);
        }
      } catch {
        // Not JSON - treat as plain text/HTML string
        if (updatedContent.includes(suggestion.anchorText)) {
          updatedContent = updatedContent.replace(suggestion.anchorText, linkHtml);
          linkInserted = true;
        }
      }

      if (!linkInserted) {
        toast.error(`Anchor-Text "${suggestion.anchorText}" nicht in Segment ${suggestion.segmentKey} gefunden`);
        return;
      }

      // Save to database
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
        item.section_key === suggestion.segmentKey 
          ? { ...item, content_value: updatedContent }
          : item
      ));

      // Persist the applied link to database
      const newAppliedLink = {
        anchorText: suggestion.anchorText,
        targetSlug: suggestion.targetSlug,
        targetTitle: suggestion.targetTitle,
        segmentKey: suggestion.segmentKey,
        segmentField: suggestion.segmentField,
        segmentType: suggestion.segmentType,
        appliedAt: new Date().toISOString()
      };
      
      const updatedAppliedLinks = [...appliedInternalLinks, newAppliedLink];
      setAppliedInternalLinks(updatedAppliedLinks);
      
      // Upsert the applied links to page_content
      const { error: upsertError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'seo_applied_internal_links',
          language: editorLanguage,
          content_type: 'json',
          content_value: JSON.stringify(updatedAppliedLinks),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,section_key,language'
        });
      
      if (upsertError) {
        console.error('[SEO Editor] Error persisting applied links:', upsertError);
      } else {
        console.log('[SEO Editor] Persisted applied internal links:', updatedAppliedLinks.length);
      }

      toast.success(`Link zu "${suggestion.targetTitle}" eingefügt!`);
    } catch (error) {
      console.error('[SEO Editor] Error applying link:', error);
      toast.error('Fehler beim Anwenden des Links');
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

  // Generate Smart H1 Headlines using AI
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
        toast.error('Fehler beim Generieren der H1: ' + error.message);
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
        toast.success(`${result.suggestions.length} H1-Vorschläge generiert`);
      } else {
        toast.error('Keine H1-Vorschläge generiert');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unerwarteter Fehler beim Generieren der H1');
    } finally {
      setIsGeneratingH1(false);
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
        toast.error('Fehler beim Generieren des Intros: ' + error.message);
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
        toast.success('Intro-Text erfolgreich generiert');
      } else {
        toast.error('Kein Intro-Text generiert');
      }
    } catch (error) {
      console.error('[SEO Editor] Unexpected error:', error);
      toast.error('Unerwarteter Fehler beim Generieren des Intros');
    } finally {
      setIsGeneratingIntro(false);
    }
  };

  // Apply generated intro to the Intro segment
  const handleApplyIntroToSegment = async () => {
    if (!generatedIntro) {
      toast.error('Kein generierter Intro-Text vorhanden.');
      return;
    }

    if (isApplyingIntro) {
      return;
    }

    setIsApplyingIntro(true);

    try {
      // Find the intro segment
      const existingIntroRegistry = segmentRegistry.find(seg => seg.segment_type === 'intro' && !seg.deleted);
      
      if (!existingIntroRegistry) {
        toast.error('Kein Intro-Segment gefunden. Bitte zuerst ein Intro-Segment erstellen.', { duration: 5000 });
        setIsApplyingIntro(false);
        return;
      }

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
        toast.error('page_segments nicht gefunden', { duration: 5000 });
        setIsApplyingIntro(false);
        return;
      }

      try {
        const segments = JSON.parse(pageSegmentsRow.content_value);
        const introSegmentId = existingIntroRegistry.segment_id;
        
        console.log('[SEO Editor] Looking for intro segment with ID:', introSegmentId);
        
        // Find the intro segment by its ID
        const introIndex = segments.findIndex((seg: any) => 
          String(seg.id) === String(introSegmentId) && seg.type === 'intro'
        );
        
        if (introIndex === -1) {
          console.error('[SEO Editor] Intro segment not found in page_segments');
          toast.error('Intro-Segment nicht in page_segments gefunden', { duration: 5000 });
          setIsApplyingIntro(false);
          return;
        }
        
        // Update the intro segment description
        segments[introIndex].data = {
          ...segments[introIndex].data,
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
          toast.error(`Speichern fehlgeschlagen: ${updateError.message}`, { duration: 5000 });
          setIsApplyingIntro(false);
          return;
        }
        
        console.log('[SEO Editor] Successfully saved Intro with new description');
        
        toast.success(`Intro-Text erfolgreich in Segment ${introSegmentId} übernommen`);
        
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
          toast.success('Intro automatisch gespeichert', { duration: 3000 });
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
          note: `H1 in bestehendes Intro-Segment übernehmen (ID: ${existingIntroRegistry.segment_id})`
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
    toast.success(`H1 "${suggestion.headline}" ausgewählt`);
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
      toast.info(`Platzierung geändert: ${getSegmentLabel(newPlacement.segmentType, newPlacement.segmentKey || '')}`);
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
      'banner-p': 'Banner P',
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
    return ['full-hero', 'full_hero', 'action-hero', 'hero', 'product-hero', 'product-hero-gallery', 'banner', 'banner-p'].includes(segmentType);
  };

  // Apply H1 to the suggested segment and convert old H1 to H2
  const handleApplyH1ToSegment = async () => {
    if (!selectedH1Suggestion || !selectedH1Suggestion.selectedPlacement) {
      toast.error('Kein H1-Vorschlag oder Platzierung ausgewählt.');
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
        toast.info(`Neues ${getSegmentLabel(placement.segmentType, '')} Segment wird erstellt...`, { duration: 5000 });
        setIsCreatingSegment(true);
        
        toast.warning(
          `Bitte erstelle zuerst ein "${getSegmentLabel(placement.segmentType, '')}" Segment an Position ${placement.suggestedTabPosition} im Tab-Editor. Danach kannst du die H1 anwenden.`,
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
          toast.error(`page_segments nicht gefunden für ${pageSlug}`, { duration: 5000 });
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
            toast.error(`Intro-Segment ${targetSegmentId} nicht in page_segments gefunden`, { duration: 5000 });
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
          
          toast.success(`H1 erfolgreich in Intro-Segment (ID: ${targetSegmentId}) gesetzt`);
          
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
            toast.success('H1 automatisch gespeichert', { duration: 3000 });
          }, 100);
          
          setIsApplyingH1(false);
          return;
          
        } catch (parseError) {
          console.error('[SEO Editor] Failed to parse intro content:', parseError);
          toast.error('Fehler beim Parsen des Intro-Segments', { duration: 5000 });
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
      
      toast.success(`H1 erfolgreich in "${targetSegmentInfo.label}" (ID: ${targetSegmentInfo.id}) gesetzt`);
      
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
        toast.success('H1 automatisch gespeichert', { duration: 3000 });
      }, 100);
      
    } catch (error) {
      console.error('[SEO Editor] Error applying H1:', error);
      toast.error('Fehler beim Anwenden der H1');
    } finally {
      setIsApplyingH1(false);
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
                  <div className={`flex items-center gap-2 p-2.5 rounded-md transition-colors ${
                    checks.keywordInSlug ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                  }`}>
                    {getStatusIcon(checks.keywordInSlug)}
                    <span className="text-sm font-medium">FKW in Slug</span>
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
                      <span className="text-sm text-muted-foreground">Quelle:</span>
                      <Badge className="bg-[#f9dc24] text-black font-medium text-sm px-3 py-1">
                        {h1SourceInfo.label} ({h1SourceInfo.id})
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <span className="flex items-center gap-2 text-red-400 text-base">
                  <AlertCircle className="h-5 w-5" />
                  Keine H1 gefunden – bitte Intro, Hero oder Product Hero Gallery Segment hinzufügen
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
              <span className="font-medium">Auto-detect Priorität:</span> Intro → Full Hero → Product Hero Gallery → Product Hero → Action Hero
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
                    <span className="text-xs font-medium text-green-400">Optimiert</span>
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
                className="h-11 min-w-[180px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGeneratingKeywords ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4 mr-2" />
                    Smart FKW
                  </>
                )}
              </Button>
            </div>
            
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
                        <p className="font-semibold text-lg text-foreground group-hover:text-purple-400 transition-colors">
                          {suggestion.keyword}
                        </p>
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
                {/* Optimiert Badge: shown when length is 50-60 AND FKW is included */}
                {data.title && data.title.length >= 50 && data.title.length <= 60 && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Optimiert</span>
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
                className="h-11 min-w-[140px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGeneratingTitle ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generiere...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4 mr-2" />
                    Smart Title
                  </>
                )}
              </Button>
            </div>
            
            {/* Character count indicator */}
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60 
                  ? 'bg-green-500/20 text-green-400' 
                  : (data.title?.length || 0) > 60 
                  ? 'bg-red-500/20 text-red-400' 
                  : (data.title?.length || 0) >= 40
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {data.title?.length || 0}/60 Zeichen
                {(data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60 && ' ✓'}
              </span>
              <span className="text-xs text-muted-foreground">(Ideal: 50-60)</span>
            </div>
            
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
                          <Badge className={`shrink-0 text-xs ${
                            suggestion.characterCount >= 50 && suggestion.characterCount <= 60
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {suggestion.characterCount} Zeichen
                          </Badge>
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
              Optimierter Title mit Focus Keyword – Ideal: 50-60 Zeichen
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
                className="h-11 min-w-[140px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4 mr-2" />
                    Smart Description
                  </>
                )}
              </Button>
            </div>
            
            {/* Character count indicator */}
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160 
                  ? 'bg-green-500/20 text-green-400' 
                  : (data.metaDescription?.length || 0) > 160 
                  ? 'bg-red-500/20 text-red-400' 
                  : (data.metaDescription?.length || 0) >= 100
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {data.metaDescription?.length || 0}/160 characters
                {(data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160 && ' ✓'}
              </span>
              <span className="text-xs text-muted-foreground">(Ideal: 120-160)</span>
            </div>
            
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
                          <Badge className={`shrink-0 text-xs ${
                            suggestion.characterCount >= 120 && suggestion.characterCount <= 160
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {suggestion.characterCount} characters
                          </Badge>
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
            
            {/* Current H1 Display */}
            <div className="mb-4 p-4 bg-muted/20 border border-border/50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Current H1</p>
                  {data.h1Locked && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      🔒 Gesperrt (manuell gesetzt)
                    </Badge>
                  )}
                </div>
                {data.h1 && (
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${
                      data.h1.length >= 40 && data.h1.length <= 70 ? 'text-green-400' : 
                      data.h1.length >= 20 && data.h1.length < 40 ? 'text-yellow-400' : 
                      data.h1.length > 70 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {data.h1.length} characters {data.h1.length >= 40 && data.h1.length <= 70 ? '✓' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">(Ideal: 40-70)</span>
                  </div>
                )}
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
                  🔓 Entsperren (Auto-Erkennung aktivieren)
                </Button>
              )}
            </div>

            {/* Selected H1 with Apply Button */}
            {selectedH1Suggestion && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-green-400">✓ Ausgewählte H1</p>
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
                  <Badge variant="outline" className={`shrink-0 ${
                    selectedH1Suggestion.headline.length >= 40 && selectedH1Suggestion.headline.length <= 70
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {selectedH1Suggestion.headline.length} Zeichen
                  </Badge>
                </div>
                
                {selectedH1Suggestion.selectedPlacement && (
                  <div className="mb-3 space-y-3">
                    {/* Placement Options Selector */}
                    {selectedH1Suggestion.allPlacementOptions.length > 1 && (
                      <div className="p-3 bg-muted/20 rounded-md border border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Platzierungsoptionen (Beste → Alternativ):</p>
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
                              {opt.createNew && <span className="ml-1 text-yellow-400">+ NEU</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Selected Placement Details */}
                    <div className="p-3 bg-muted/30 rounded-md border border-purple-500/20">
                      <p className="text-sm font-medium text-purple-400 mb-2">
                        📍 {selectedH1Suggestion.selectedPlacement.createNew ? 'Neues Segment erstellen:' : 'Platzierung:'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">{selectedH1Suggestion.selectedPlacement.note}</p>
                      
                      {/* Segment Details Box */}
                      <div className="mt-2 p-2 bg-muted/50 rounded border border-border/50">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Segment-Typ:</span>
                            <p className="font-medium text-foreground">
                              {getSegmentLabel(selectedH1Suggestion.selectedPlacement.segmentType, selectedH1Suggestion.selectedPlacement.segmentKey || '')}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tab-Position:</span>
                            <p className="font-mono font-medium text-purple-400">
                              #{selectedH1Suggestion.selectedPlacement.suggestedTabPosition}
                            </p>
                          </div>
                          {selectedH1Suggestion.selectedPlacement.segmentId && !selectedH1Suggestion.selectedPlacement.createNew && (
                            <div>
                              <span className="text-muted-foreground">Segment-ID:</span>
                              <p className="font-mono font-medium text-purple-400">
                                #{selectedH1Suggestion.selectedPlacement.segmentId}
                              </p>
                            </div>
                          )}
                          {selectedH1Suggestion.selectedPlacement.segmentKey && !selectedH1Suggestion.selectedPlacement.createNew && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Segment-Key:</span>
                              <p className="font-mono font-medium text-purple-400 break-all">
                                {selectedH1Suggestion.selectedPlacement.segmentKey}
                              </p>
                            </div>
                          )}
                          {selectedH1Suggestion.selectedPlacement.createNew && (
                            <div className="col-span-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              <p className="text-yellow-400 text-xs font-medium">
                                ⚡ Neues Segment wird an Position {selectedH1Suggestion.selectedPlacement.suggestedTabPosition} erstellt
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {h1SourceInfo && selectedH1Suggestion.selectedPlacement.segmentKey !== h1SourceInfo.key && !selectedH1Suggestion.selectedPlacement.createNew && (
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
                          <p className="text-yellow-400 font-medium">
                            ⚠️ Bestehende H1 wird angepasst:
                          </p>
                          <p className="text-yellow-400/80 mt-1">
                            H1 in "{h1SourceInfo.label}" ({h1SourceInfo.key}) → wird zu H2 konvertiert
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
                      Wird angewendet...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      H1 in Segment übernehmen
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* H1 Change Log - Documentation of applied changes */}
            {h1ChangeLog && (
              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-blue-400">📋 Änderungsprotokoll</p>
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
                    <span>Angewendet am:</span>
                    <span className="font-mono">{new Date(h1ChangeLog.timestamp).toLocaleString('de-DE')}</span>
                  </div>
                  
                  {/* New H1 */}
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <p className="text-xs text-green-400 font-medium mb-1">✅ Neue H1 gesetzt:</p>
                    <p className="text-foreground font-semibold">"{h1ChangeLog.newH1}"</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span>Ziel-Segment: </span>
                      <span className="font-medium text-green-400">{h1ChangeLog.targetSegment.label}</span>
                      <span className="text-muted-foreground"> (ID: #{h1ChangeLog.targetSegment.id}, Key: {h1ChangeLog.targetSegment.key})</span>
                    </div>
                  </div>
                  
                  {/* Old H1 conversion if applicable */}
                  {h1ChangeLog.oldH1 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <p className="text-xs text-yellow-400 font-medium mb-1">🔄 Vorherige H1 konvertiert:</p>
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
                    <p>💡 Die H1 wurde sowohl im Segment als auch in den SEO-Einstellungen (Basic & Advanced) aktualisiert.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button - aligned right like Smart FKW */}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateH1Headlines}
                disabled={isGeneratingH1}
                className="h-11 min-w-[180px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGeneratingH1 ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4 mr-2" />
                    Smart H1
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
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      introductionText.description.trim().split(/\s+/).length >= 40 && 
                      introductionText.description.trim().split(/\s+/).length <= 80
                        ? 'bg-green-500/20 text-green-400'
                        : introductionText.description.trim().split(/\s+/).length > 80
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {introductionText.description.trim().split(/\s+/).length} Wörter
                    </span>
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
                  <p className="text-sm font-medium text-green-400">✓ Generierter Intro-Text</p>
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
                  <Badge variant="outline" className={`text-xs ${
                    generatedIntro.wordCount >= 40 && generatedIntro.wordCount <= 80
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {generatedIntro.wordCount} Wörter
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                    {generatedIntro.sentenceCount} Sätze
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
                      Wird übernommen...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Intro in Segment übernehmen
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
                className="h-11 min-w-[180px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGeneratingIntro ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generiere...
                  </>
                ) : (
                  <>
                    <GeminiIcon className="h-4 w-4 mr-2" />
                    Smart Intro
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              Optimal: 40-80 words, Focus Keyphrase in first sentence (first 10-15 words)
            </p>
          </div>

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
              {/* Smart Internal Links Button (Pink) - for existing links */}
              <Button
                onClick={handleGenerateInternalLinks}
                disabled={isGeneratingInternalLinks}
                className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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
              
              {/* Possible Internal Links Button (Blue) - for content suggestions */}
              <Button
                onClick={handleGenerateContentLinks}
                disabled={isGeneratingContentLinks}
                variant="outline"
                className="flex-1 h-11 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500"
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
                              <span className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">
                                {suggestion.segmentKey}
                              </span>
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
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Applied ✓
                            </Badge>
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
            
            {/* Content Suggestions (from Possible Internal Links) */}
            {showContentLinkSuggestions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Content Suggestions:
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContentLinkSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                {contentLinkSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground italic">
                      Diese Seiten/Segmente sollten erstellt werden, um die interne Verlinkung zu verbessern:
                    </p>
                    {contentLinkSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-400">
                            {suggestion.priority}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-foreground">
                                {suggestion.suggestedTitle}
                              </span>
                              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                {suggestion.segmentType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">Slug:</span>
                              <span className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded text-blue-400">
                                /{suggestion.suggestedSlug}
                              </span>
                            </div>
                            {suggestion.parentSlug && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-muted-foreground">Parent:</span>
                                <span className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">
                                  {suggestion.parentSlug}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {suggestion.reason}
                            </p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0 text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                            Seite fehlt
                          </Badge>
                        </div>
                      </div>
                    ))}
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

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={onSave}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save SEO Changes
        </Button>
      </div>
    </div>
  );
};
