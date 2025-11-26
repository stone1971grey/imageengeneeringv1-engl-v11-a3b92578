import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, AlertCircle, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { SERPPreview } from "./SERPPreview";
import { supabase } from "@/integrations/supabase/client";

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
    
    // Determine H1 heading dynamically
    let autoH1 = '';
    
    // Priority for H1: Intro Title > Hero Title Lines
    if (introRegistry && !introRegistry.deleted) {
      // Get Intro title for H1
      const introContent = pageContent.find(item => item.section_key === introRegistry.segment_key);
      if (introContent) {
        try {
          const introData = JSON.parse(introContent.content_value);
          autoH1 = introData.title || '';
          console.log('[SEO Editor] H1 from Intro title:', autoH1);
        } catch (e) {
          console.error('[SEO Editor] Failed to parse intro for H1:', e);
        }
      }
    } else {
      // Fallback: Get Full Hero title lines
      const fullHeroEntry = pageContent.find(item => item.section_key.startsWith('full_hero_'));
      if (fullHeroEntry) {
        try {
          const fullHeroData = JSON.parse(fullHeroEntry.content_value);
          const titleLine1 = fullHeroData.titleLine1 || '';
          const titleLine2 = fullHeroData.titleLine2 || '';
          autoH1 = [titleLine1, titleLine2].filter(Boolean).join(' ');
          console.log('[SEO Editor] H1 from Hero titles:', autoH1);
        } catch (e) {
          console.error('[SEO Editor] Failed to parse hero for H1:', e);
        }
      }
    }
    
    // Auto-set H1 if different
    if (autoH1 && data.h1 !== autoH1) {
      console.log('[SEO Editor] Auto-setting H1 to:', autoH1);
      onChange({ ...data, h1: autoH1 });
    }
    
    // Check if keyword is in H1
    const keywordInH1 = keyword && autoH1 ? autoH1.toLowerCase().includes(keyword) : false;
    console.log('[SEO Editor] H1 Keyword Check:', {
      keyword,
      autoH1,
      keywordInH1,
      hasH1: !!data.h1,
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

    setChecks({
      titleLength,
      descriptionLength,
      hasH1: true, // Could be enhanced with actual H1 detection
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
      keywordInIntroduction
    });
  }, [data, pageSegments, pageContent, segmentRegistry]);

  const handleChange = (field: keyof SEOData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
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

  return (
    <div className="space-y-6">
      {/* SEO Score Overview - Always visible */}
      <div className="p-6 bg-background border rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            SEO Health Check
          </h3>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${
              Object.values(checks).filter(Boolean).length >= 5 ? 'bg-green-500' : 
              Object.values(checks).filter(Boolean).length >= 3 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {Object.values(checks).filter(Boolean).length}/7 Checks
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            checks.hasH1 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            {getStatusIcon(checks.hasH1)}
            <span className="text-sm font-medium">H1 Present</span>
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
      </div>

      {/* SERP Preview - Always visible */}
      <SERPPreview
        title={data.title || ''}
        description={data.metaDescription || ''}
        url={data.slug ? `www.image-engineering.de › ${data.slug}` : 'www.image-engineering.de › your-page-slug'}
      />

      {/* Tabs for different sections */}
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basics">Grundlagen</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics" className="space-y-6">

      {/* Basic SEO Fields */}
      <div className="p-6 bg-background border rounded-lg space-y-6">
        <div>
          <Label htmlFor="focus-keyword" className="flex items-center gap-2 font-medium">
            Fokus Keyword (FKW)
            <Badge variant="outline" className="text-xs">Empfohlen</Badge>
          </Label>
          <Input
            id="focus-keyword"
            value={data.focusKeyword || ''}
            onChange={(e) => handleChange('focusKeyword', e.target.value)}
            placeholder="z.B. camera testing software"
            className="mt-2 h-10 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Hauptkeyword für diese Seite - sollte in Title, Description und Slug vorkommen
          </p>
        </div>

            <div>
              <Label htmlFor="seo-title" className="flex items-center gap-2 font-medium">
                SEO Title (Meta Title)
                <Badge variant="outline" className="text-xs">Pflicht</Badge>
                {data.title && (
                  <Badge variant="secondary" className="text-xs">✓ Gesetzt</Badge>
                )}
                {data.title && data.focusKeyword && data.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500 text-white text-xs">✓ FKW enthalten</Badge>
                )}
              </Label>
              <Input
                id="seo-title"
                value={data.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="z.B. Professional Camera Testing Solutions | Image Engineering"
                className="mt-2 h-10 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
              />
              {data.focusKeyword && data.title && (
                <div className="mt-2 px-3 py-2 bg-muted/30 border-2 border-border rounded-md text-sm min-h-[40px] flex items-center">
                  <span className="font-medium text-muted-foreground mr-2">FKW:</span>
                  {highlightKeyword(data.title, data.focusKeyword)}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
            <p className={`text-sm font-medium ${
              (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                ? 'text-green-600'
                : (data.title?.length || 0) > 60
                ? 'text-red-600'
                : (data.title?.length || 0) >= 40
                ? 'text-yellow-600'
                : 'text-red-500'
            }`}>
              {data.title?.length || 0} / 60 Zeichen
            </p>
            <span className={`text-xs font-medium ${
              (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                ? 'text-green-600'
                : (data.title?.length || 0) > 60
                ? 'text-red-600'
                : (data.title?.length || 0) >= 40
                ? 'text-yellow-600'
                : 'text-red-500'
            }`}>
              {(data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                ? '✓ Optimal'
                : (data.title?.length || 0) > 60
                ? '⚠ Zu lang'
                : (data.title?.length || 0) >= 40
                ? '→ Fast optimal'
                : '⚠ Zu kurz'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Appears as title in search engines. Optimal: 50-60 characters with focus keyword.
          </p>
        </div>

            <div>
          <Label htmlFor="meta-description" className="flex items-center gap-2 font-medium">
                Meta Description
                <Badge variant="outline" className="text-xs">Pflicht</Badge>
                {data.metaDescription && (
                  <Badge variant="secondary" className="text-xs">✓ Set</Badge>
                )}
                {data.metaDescription && data.focusKeyword && data.metaDescription.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
                  <Badge className="bg-green-500 text-white text-xs">✓ FKW included</Badge>
                )}
              </Label>
          <Textarea
            id="meta-description"
            value={data.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            placeholder="z.B. Discover professional camera testing solutions with industry-leading precision. ISO-compliant measurement systems for automotive, medical, and industrial imaging applications."
            className="mt-2 min-h-[100px] border-2 border-border hover:border-primary/50 focus:border-primary transition-colors resize-none"
            rows={4}
          />
          {data.focusKeyword && data.metaDescription && (
            <div className="mt-2 px-3 py-2 bg-muted/30 border-2 border-border rounded-md text-sm min-h-[60px]">
              <span className="font-medium text-muted-foreground mr-2">FKW:</span>
              {highlightKeyword(data.metaDescription, data.focusKeyword)}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className={`text-sm font-medium ${
              (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                ? 'text-green-600'
                : (data.metaDescription?.length || 0) > 160
                ? 'text-red-600'
                : (data.metaDescription?.length || 0) >= 100
                ? 'text-yellow-600'
                : 'text-red-500'
            }`}>
              {data.metaDescription?.length || 0} / 160 characters
            </p>
            <span className={`text-xs font-medium ${
              (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                ? 'text-green-600'
                : (data.metaDescription?.length || 0) > 160
                ? 'text-red-600'
                : (data.metaDescription?.length || 0) >= 100
                ? 'text-yellow-600'
                : 'text-red-500'
            }`}>
              {(data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                ? '✓ Optimal'
                : (data.metaDescription?.length || 0) > 160
                ? '⚠ Too long'
                : (data.metaDescription?.length || 0) >= 100
                ? '→ Almost optimal'
                : '⚠ Too short'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Appears as description in search engines. Optimal: 120-160 characters with focus keyword.
          </p>
        </div>

        <div>
          <Label htmlFor="slug" className="flex items-center gap-2 font-medium">
            URL Slug
            <Badge variant="outline" className="text-xs">Pflicht</Badge>
            {data.slug && (
              <Badge variant="secondary" className="text-xs">✓ Set</Badge>
            )}
            {data.slug && data.focusKeyword && data.slug.toLowerCase().includes(data.focusKeyword.toLowerCase().replace(/\s+/g, '-')) && (
              <Badge className="bg-green-500 text-white text-xs">✓ FKW included</Badge>
            )}
          </Label>
          <div className="flex items-center mt-2">
            <span className="px-3 py-2 bg-muted rounded-l-md border-2 border-r-0 border-border font-medium h-10 flex items-center text-sm">
              /
            </span>
            <Input
              id="slug"
              value={data.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-'))}
              placeholder={pageSlug}
              className="rounded-l-none h-10 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Only lowercase letters, numbers and hyphens. FKW should be included.
          </p>
        </div>

        <div>
          <Label htmlFor="h1" className="flex items-center gap-2 font-medium">
            H1 Heading
            <Badge variant="secondary" className="text-xs">Auto-detect</Badge>
            {data.h1 && (
              <Badge variant="secondary" className="text-xs">✓ Set</Badge>
            )}
            {data.h1 && data.focusKeyword && data.h1.toLowerCase().includes(data.focusKeyword.toLowerCase()) && (
              <Badge className="bg-green-500 text-white text-xs">✓ FKW included</Badge>
            )}
          </Label>
          <div className="mt-2 px-3 py-2 h-10 bg-muted/50 border-2 border-border rounded-md cursor-not-allowed flex items-center text-sm">
            {data.h1 || <span className="text-muted-foreground">Auto-detected...</span>}
          </div>
          {data.h1 && data.focusKeyword && (
            <div className="mt-2 px-3 py-2 bg-muted/30 border-2 border-border rounded-md text-sm min-h-[40px] flex items-center">
              <span className="font-medium text-muted-foreground mr-2">FKW:</span>
              {highlightKeyword(data.h1, data.focusKeyword)}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Auto-detected from Intro title or Hero title. Only one H1 per page allowed.
          </p>
        </div>
      </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          {/* Open Graph / Social Media */}
          <div className="p-6 bg-background border rounded-lg space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                Open Graph / Social Media
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </h4>
            </div>
            
            <div>
              <Label htmlFor="og-title" className="font-medium">OG Title</Label>
              <Input
                id="og-title"
                value={data.ogTitle || ''}
                onChange={(e) => handleChange('ogTitle', e.target.value)}
                placeholder="Leave empty = use SEO Title"
                className="mt-2 h-10 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Title for social media shares. If empty, SEO Title is used.
              </p>
            </div>

            <div>
              <Label htmlFor="og-description" className="font-medium">OG Description</Label>
              <Textarea
                id="og-description"
                value={data.ogDescription || ''}
                onChange={(e) => handleChange('ogDescription', e.target.value)}
                placeholder="Leave empty = use Meta Description"
                className="mt-2 min-h-[80px] border-2 border-border hover:border-primary/50 focus:border-primary transition-colors resize-none"
                rows={3}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Description for social media shares. If empty, Meta Description is used.
              </p>
            </div>

            <div>
              <Label htmlFor="og-image" className="flex items-center gap-2 font-medium">
                OG Image URL
                {heroImageUrl && (
                  <Badge variant="secondary" className="text-xs">Auto-detected from Hero</Badge>
                )}
              </Label>
              
              <div className="flex gap-2 mt-2">
                <Input
                  id="og-image"
                  value={data.ogImage || heroImageUrl || ''}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  placeholder={heroImageUrl ? "Auto: Hero image is used (1200×630px)" : "https://... (recommended: 1200×630px)"}
                  className="flex-1 h-10 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
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
                        const fileName = `og-${pageSlug}-${Date.now()}.${file.name.split('.').pop()}`;
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
                  <Button type="button" variant="outline" size="sm" className="h-10">
                    Upload
                  </Button>
                </label>
                {data.ogImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={() => handleChange('ogImage', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Image for social media shares (1200x630px recommended). If empty, Hero image is used.
              </p>
              
              {/* Image Preview */}
              {(data.ogImage || heroImageUrl) && (
                <div className="mt-4 p-4 border-2 border-border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium mb-3">Preview</p>
                  <img 
                    src={data.ogImage || heroImageUrl} 
                    alt="OG Image Preview" 
                    className="w-full max-w-md rounded-lg border-2 border-border shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="twitter-card" className="font-medium">Twitter Card Type</Label>
              <Select
                value={data.twitterCard || 'summary_large_image'}
                onValueChange={(value: 'summary' | 'summary_large_image') => handleChange('twitterCard', value)}
              >
                <SelectTrigger className="mt-2 h-10 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Type of Twitter Card for shares. "Summary Large Image" is recommended.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          {/* Introduction (Read-only) */}
          <div className="p-6 bg-background border rounded-lg space-y-6">
            <div>
              <Label className="flex items-center gap-2 font-medium">
                Introduction Text
                <Badge variant="secondary" className="text-xs">Auto-detected (Read-only)</Badge>
                {(introductionText.title || introductionText.description) && (
                  <Badge variant="secondary" className="text-xs">✓ Set</Badge>
                )}
                {(introductionText.title || introductionText.description) && data.focusKeyword && (
                  (introductionText.title.toLowerCase().includes(data.focusKeyword.toLowerCase()) || 
                   introductionText.description.toLowerCase().includes(data.focusKeyword.toLowerCase())) && (
                    <Badge className="bg-green-500 text-white text-xs">✓ FKW included</Badge>
                  )
                )}
              </Label>
              <div className="mt-2 p-4 bg-muted/50 border-2 border-border rounded-lg">
                {introductionText.title && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Title:</p>
                    <p className="text-sm">{highlightKeyword(introductionText.title, data.focusKeyword || '')}</p>
                  </div>
                )}
                {introductionText.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Description:</p>
                    <p className="text-sm whitespace-pre-wrap">{highlightKeyword(introductionText.description, data.focusKeyword || '')}</p>
                  </div>
                )}
                {!introductionText.title && !introductionText.description && (
                  <p className="text-sm text-muted-foreground italic">
                    No introduction text found. Add an Intro, Tiles or Image-Text segment.
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Auto-detected from first Intro, Tiles or Image-Text segment. This text is used for SEO checks.
              </p>
            </div>
          </div>

          {/* Canonical URL */}
          <div className="p-6 bg-background border rounded-lg space-y-6">
            <div>
              <Label htmlFor="canonical" className="flex items-center gap-2 font-medium">
                Canonical URL
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </Label>
              <Input
                id="canonical"
                value={data.canonical || ''}
                onChange={(e) => handleChange('canonical', e.target.value)}
                placeholder="https://www.image-engineering.de/your-page"
                className="mt-2 h-10 border-2 border-border hover:border-primary/50 focus:border-primary transition-colors"
              />
              <p className="text-sm text-muted-foreground mt-2">
                If this page is a copy of another, enter the original URL here. Leave empty for normal pages.
              </p>
            </div>
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
