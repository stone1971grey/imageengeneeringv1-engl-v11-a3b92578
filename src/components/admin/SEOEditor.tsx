import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, AlertCircle, CheckCircle2, AlertTriangle, X, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { SERPPreview } from "./SERPPreview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

interface SEOEditorProps {
  pageSlug: string;
  data: SEOData;
  onChange: (data: SEOData) => void;
  onSave: () => void;
  pageSegments?: any[];
}

export const SEOEditor = ({ pageSlug, data, onChange, onSave, pageSegments = [] }: SEOEditorProps) => {
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
  
  // Smart Focus Keyword state
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<Array<{ keyword: string; reason: string; priority: number }>>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);

  // Load page content and segment registry
  useEffect(() => {
    const loadPageData = async () => {
      console.log('[SEO Editor] Loading page data for:', pageSlug);
      
      // Load page content
      const { data: contentData, error: contentError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug);
      
      console.log('[SEO Editor] Loaded content data:', contentData?.length, 'items');
      
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
    };
    
    loadPageData();
  }, [pageSlug]);

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
    if (introRegistry && !introRegistry.deleted) {
      const introContent = pageContent.find(item => item.section_key === introRegistry.segment_key);
      if (introContent) {
        try {
          const introData = JSON.parse(introContent.content_value);
          if (introData.title) {
            autoH1 = introData.title;
            h1Source = {
              type: 'intro',
              key: introRegistry.segment_key,
              id: introRegistry.segment_id,
              label: 'Intro'
            };
            console.log('[SEO Editor] H1 from Intro title:', autoH1);
          }
        } catch (e) {
          console.error('[SEO Editor] Failed to parse intro for H1:', e);
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
    
    // Update H1 field - if different OR if we need to clear it
    if (data.h1 !== autoH1) {
      console.log('[SEO Editor] Updating H1 to:', autoH1 || '(empty)');
      onChange({ ...data, h1: autoH1 });
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
        // Intro segment stores data as JSON in a single content field
        const introContent = pageContent.find(item => item.section_key === activeSegmentKey);
        
        console.log('[SEO Editor] Looking for intro content with key:', activeSegmentKey);
        console.log('[SEO Editor] Found intro content:', introContent);
        
        if (introContent) {
          try {
            const introData = JSON.parse(introContent.content_value);
            console.log('[SEO Editor] Parsed intro data:', introData);
            introTitle = ''; // Never use title for Intro segment
            introDescription = introData.description || '';
            console.log('[SEO Editor] Extracted intro description:', introDescription);
          } catch (e) {
            console.error('[SEO Editor] Failed to parse intro content:', e);
          }
        } else {
          console.warn('[SEO Editor] No intro content found for key:', activeSegmentKey);
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

  const [healthCheckView, setHealthCheckView] = useState<'basic' | 'advanced'>('basic');

  // Calculate basic and advanced check counts
  const basicChecks = [checks.titleLength, checks.descriptionLength, checks.hasH1, checks.hasInternalLinks, checks.hasExternalLinks];
  const advancedChecks = [checks.keywordInTitle, checks.keywordInDescription, checks.keywordInSlug, checks.keywordInH1, checks.keywordInIntroduction];
  const basicPassedCount = basicChecks.filter(Boolean).length;
  const advancedPassedCount = advancedChecks.filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* SEO Health Check - Split into Basic and Advanced */}
      <div className="p-6 bg-background border rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            SEO Health Check
          </h3>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${
              Object.values(checks).filter(Boolean).length >= 8 ? 'bg-green-500' : 
              Object.values(checks).filter(Boolean).length >= 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {Object.values(checks).filter(Boolean).length}/10 Checks
            </span>
          </div>
        </div>

        {/* Toggle Buttons for Basic/Advanced */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setHealthCheckView('basic')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              healthCheckView === 'basic' 
                ? 'bg-[#f9dc24] text-black' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Basic ({basicPassedCount}/5)
          </button>
          <button
            onClick={() => setHealthCheckView('advanced')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              healthCheckView === 'advanced' 
                ? 'bg-[#f9dc24] text-black' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Advanced ({advancedPassedCount}/5)
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Health Check - Always visible */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Basic</h4>
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

          {/* Advanced Health Check - Only visible when Advanced is selected */}
          {healthCheckView === 'advanced' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Advanced</h4>
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
      </div>

      {/* SERP Preview - Always visible */}
      <SERPPreview
        title={data.title || ''}
        description={data.metaDescription || ''}
        url={data.slug ? `www.image-engineering.de › ${data.slug}` : 'www.image-engineering.de › your-page-slug'}
      />

      {/* Tabs for different sections */}
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
          <TabsTrigger value="basics" className="data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black">Basics</TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black">Social Media</TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black">Advanced</TabsTrigger>
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
                {data.title && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
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
            {data.focusKeyword && data.title && (
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
                {data.metaDescription && data.focusKeyword && data.metaDescription.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
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
            {data.focusKeyword && data.metaDescription && (
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
            <p className="text-xs text-muted-foreground mt-2">
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
                {data.h1 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
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
            <p className="text-xs text-muted-foreground mt-2">
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
            <p className="text-xs text-muted-foreground mt-2">
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
            <p className="text-xs text-muted-foreground mt-2">
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
            <p className="text-xs text-muted-foreground mt-2">
              "Summary Large Image" is recommended for better visibility
            </p>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          
          {/* Focus Keyword */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="focus-keyword" className="text-base font-semibold text-foreground">
                Focus Keyword (FKW)
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-[#f9dc24]/10 text-[#f9dc24] border-[#f9dc24]/30">Recommended</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFocusKeywords}
                  disabled={isGeneratingKeywords}
                  className="gap-1.5 text-xs h-7 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-500/50 hover:from-purple-500/20 hover:to-blue-500/20"
                >
                  {isGeneratingKeywords ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Smart FKW
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <Input
              id="focus-keyword"
              value={data.focusKeyword || ''}
              onChange={(e) => handleChange('focusKeyword', e.target.value)}
              placeholder="e.g. camera testing software"
              className="h-11 bg-muted/30 border-border focus:border-[#f9dc24] focus:ring-[#f9dc24]/20"
            />
            
            {/* Keyword Suggestions */}
            {showKeywordSuggestions && keywordSuggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">KI-Vorschläge:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeywordSuggestions(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {keywordSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors cursor-pointer group"
                      onClick={() => handleSelectKeyword(suggestion.keyword)}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xs font-semibold text-purple-400">
                        {suggestion.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground group-hover:text-purple-400 transition-colors">
                          {suggestion.keyword}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {suggestion.reason}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-500/10 hover:bg-purple-500/20 text-purple-400"
                      >
                        Auswählen
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Main keyword for this page – should appear in Title, Description, and Slug
            </p>
          </div>

          {/* Introduction Text */}
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold text-foreground">
                Introduction Text
              </Label>
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
            <div className="px-4 py-3 bg-muted/20 border border-border/50 rounded-md">
              {introductionText.title && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Title</p>
                  <p className="text-sm">{highlightKeyword(introductionText.title, data.focusKeyword || '')}</p>
                </div>
              )}
              {introductionText.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{highlightKeyword(introductionText.description, data.focusKeyword || '')}</p>
                </div>
              )}
              {!introductionText.title && !introductionText.description && (
                <p className="text-sm text-muted-foreground italic">
                  No introduction found. Add an Intro, Tiles or Image-Text segment.
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Auto-detected from first content segment
            </p>
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
            <p className="text-xs text-muted-foreground mt-2">
              Only needed if this page is a duplicate of another
            </p>
          </div>
        </TabsContent>
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
