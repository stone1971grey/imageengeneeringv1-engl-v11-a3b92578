import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  // Highlight FKW in text
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
      
      // Add highlighted keyword
      const actualKeyword = searchText.substring(index, index + keyword.length);
      parts.push(
        <span key={`kw-${index}`} className="bg-yellow-300 font-bold px-1 rounded">
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
      {/* SEO Score Overview */}
      <Card className="p-8 bg-white border-2 border-indigo-200 shadow-lg animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <AlertTriangle className="h-7 w-7 text-indigo-600" />
            </div>
            SEO Health Check
          </h3>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
            <div className={`h-3 w-3 rounded-full ${
              Object.values(checks).filter(Boolean).length >= 5 ? 'bg-green-500 animate-pulse' : 
              Object.values(checks).filter(Boolean).length >= 3 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-semibold text-gray-700">
              {Object.values(checks).filter(Boolean).length}/7 Checks
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.titleLength ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.titleLength)}
            <span className="text-base font-medium text-gray-900">Title Length</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.descriptionLength ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.descriptionLength)}
            <span className="text-base font-medium text-gray-900">Description Length</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.keywordInTitle ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.keywordInTitle)}
            <span className="text-base font-medium text-gray-900">FKW in Title</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.keywordInDescription ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.keywordInDescription)}
            <span className="text-base font-medium text-gray-900">FKW in Description</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.keywordInSlug ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.keywordInSlug)}
            <span className="text-base font-medium text-gray-900">FKW in Slug</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.hasH1 ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.hasH1)}
            <span className="text-base font-medium text-gray-900">H1 Present</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.keywordInH1 ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.keywordInH1)}
            <span className="text-base font-medium text-gray-900">FKW in H1</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
            checks.keywordInIntroduction ? 'bg-green-100 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
          }`}>
            {getStatusIcon(checks.keywordInIntroduction)}
            <span className="text-base font-medium text-gray-900">FKW in Introduction</span>
          </div>
        </div>
      </Card>

      {/* SERP Preview */}
      <SERPPreview
        title={data.title || ''}
        description={data.metaDescription || ''}
        url={data.slug ? `www.image-engineering.de › ${data.slug}` : 'www.image-engineering.de › your-page-slug'}
      />

      {/* Basic SEO Fields */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="focus-keyword" className="flex items-center gap-2 text-base font-semibold">
            Fokus Keyword (FKW)
            <Badge variant="outline" className="text-sm">Empfohlen</Badge>
          </Label>
          <Input
            id="focus-keyword"
            value={data.focusKeyword || ''}
            onChange={(e) => handleChange('focusKeyword', e.target.value)}
            placeholder="z.B. camera testing software"
            className="mt-3 text-xl h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 text-black placeholder:text-black"
          />
          <p className="text-base text-white mt-3 leading-relaxed">
            Hauptkeyword für diese Seite - sollte in Title, Description und Slug vorkommen
          </p>
        </div>

        <div>
          <Label htmlFor="seo-title" className="flex items-center gap-2 text-base font-semibold">
            SEO Title (Meta Title)
            <Badge variant="outline" className="text-sm">Pflicht</Badge>
          </Label>
          <Input
            id="seo-title"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="z.B. Professional Camera Testing Solutions | Image Engineering"
            className="mt-3 text-xl h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 text-black placeholder:text-black"
            maxLength={70}
          />
          <div className="mt-3 space-y-2">
            {/* Progress Bar */}
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                    ? 'bg-green-500'
                    : (data.title?.length || 0) > 60
                    ? 'bg-red-500'
                    : (data.title?.length || 0) >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(((data.title?.length || 0) / 70) * 100, 100)}%` }}
              />
            </div>
            {/* Character Count */}
            <div className="flex justify-between items-center">
              <p className={`text-base font-medium ${
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
              <span className={`text-sm font-medium ${
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
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2 text-base font-semibold">
            H1 Heading
            <Badge variant="secondary" className="text-sm">Auto</Badge>
            {data.h1 && (
              <Badge className="bg-green-500 text-white">✓ Gesetzt</Badge>
            )}
            {checks.keywordInH1 && (
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                FKW in H1
              </Badge>
            )}
            {!checks.keywordInH1 && data.focusKeyword && data.h1 && (
              <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                FKW fehlt in H1
              </Badge>
            )}
          </Label>
          <div
            className={`mt-3 min-h-12 p-3 text-xl text-black rounded-md border-2 flex items-center ${
              checks.keywordInH1 
                ? 'border-green-500 bg-green-50' 
                : data.focusKeyword && data.h1
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            {data.h1 ? (
              highlightKeyword(data.h1, data.focusKeyword || '')
            ) : (
              <span className="text-gray-500">Automatisch: Intro Titel oder Hero Titelzeilen</span>
            )}
          </div>
          <p className="text-base text-white mt-2 leading-relaxed">
            <strong>Automatisch synchronisiert:</strong><br/>
            <span className="ml-4 block mt-1">• <strong>Intro vorhanden</strong>: H1 = Intro Titel</span>
            <span className="ml-4 block">• <strong>Kein Intro</strong>: H1 = Hero Titelzeile 1 + 2</span>
            {data.focusKeyword && (
              <span className="ml-4 block mt-2">• <strong>SEO Check</strong>: Das Fokus-Keyword wird <span className="bg-yellow-300 font-bold px-1 rounded">gelb markiert</span></span>
            )}
          </p>
        </div>

        <div>
          <Label className="flex items-center gap-2 text-base font-semibold">
            Introduction
            <Badge variant="outline" className="text-sm">SEO-relevant</Badge>
            <Badge variant="secondary" className="text-sm">Auto-Sync</Badge>
            {checks.keywordInIntroduction && (
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Keyword gefunden
              </Badge>
            )}
          </Label>
          <div
            className={`mt-3 min-h-32 p-4 text-xl text-black rounded-md border-2 whitespace-pre-wrap ${
              checks.keywordInIntroduction 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            {highlightKeyword(
              [introductionText.title, introductionText.description].filter(Boolean).join('\n\n'),
              data.focusKeyword || ''
            ) || (
              <span className="text-gray-500">Automatisch aus Intro, Tiles oder Image & Text Segment (nur Description bei Intro)</span>
            )}
          </div>
          <p className="text-base text-white mt-3 leading-relaxed">
            <strong>Automatisch synchronisiert:</strong> Der Introduction-Text wird automatisch aus den Segmenten geladen:<br/>
            <span className="ml-4 block mt-1">• <strong>Intro Segment</strong> (höchste Priorität): Nur die Beschreibung wird verwendet</span>
            <span className="ml-4 block">• <strong>Tiles Segment</strong>: Titel + Beschreibung werden verwendet</span>
            <span className="ml-4 block">• <strong>Image & Text Segment</strong>: Titel + Beschreibung werden verwendet</span>
            <span className="block mt-2">Gelöschte Segmente werden automatisch ignoriert. Das Fokus-Keyword wird <span className="bg-yellow-300 font-bold px-1 rounded">gelb markiert</span>.</span>
          </p>
        </div>

        <div>
          <Label htmlFor="meta-description" className="flex items-center gap-2 text-base font-semibold">
            Meta Description
            <Badge variant="outline" className="text-sm">Pflicht</Badge>
          </Label>
          <Textarea
            id="meta-description"
            value={data.metaDescription || ''}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            placeholder="z.B. Discover professional camera testing solutions with Image Engineering. Industry-leading test charts, analysis software, and illumination devices for precise image quality measurement."
            className="mt-3 text-xl border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 py-3 text-black placeholder:text-black"
            rows={4}
            maxLength={170}
          />
          <div className="mt-3 space-y-2">
            {/* Progress Bar */}
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                    ? 'bg-green-500'
                    : (data.metaDescription?.length || 0) > 160
                    ? 'bg-red-500'
                    : (data.metaDescription?.length || 0) >= 100
                    ? 'bg-yellow-500'
                    : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(((data.metaDescription?.length || 0) / 170) * 100, 100)}%` }}
              />
            </div>
            {/* Character Count */}
            <div className="flex justify-between items-center">
              <p className={`text-base font-medium ${
                (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                  ? 'text-green-600'
                  : (data.metaDescription?.length || 0) > 160
                  ? 'text-red-600'
                  : (data.metaDescription?.length || 0) >= 100
                  ? 'text-yellow-600'
                  : 'text-red-500'
              }`}>
                {data.metaDescription?.length || 0} / 160 Zeichen
              </p>
              <span className={`text-sm font-medium ${
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
                  ? '⚠ Zu lang'
                  : (data.metaDescription?.length || 0) >= 100
                  ? '→ Fast optimal'
                  : '⚠ Zu kurz'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="slug" className="flex items-center gap-2 text-base font-semibold">
            URL Slug
            <Badge variant="outline" className="text-sm">Pflicht</Badge>
          </Label>
          <div className="flex items-center mt-3">
            <span className="text-xl text-black px-5 py-3 bg-gray-100 rounded-l-md border-2 border-r-0 border-gray-300 font-medium h-12 flex items-center">
              /
            </span>
            <Input
              id="slug"
              value={data.slug || ''}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-/]/g, '-'))}
              placeholder={pageSlug}
              className="rounded-l-none text-xl h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 text-black placeholder:text-black"
            />
          </div>
          <p className="text-base text-white mt-3 leading-relaxed">
            Nur Kleinbuchstaben, Zahlen und Bindestriche. FKW sollte enthalten sein.
          </p>
        </div>

        <div>
          <Label htmlFor="canonical" className="flex items-center gap-2 text-base font-semibold">
            Canonical URL
            <Badge variant="outline" className="text-sm">Empfohlen</Badge>
          </Label>
          <Input
            id="canonical"
            value={data.canonical || ''}
            onChange={(e) => handleChange('canonical', e.target.value)}
            placeholder=""
            className="mt-3 text-xl h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 text-black placeholder:text-black"
          />
          <p className="text-base text-white mt-3 leading-relaxed">
            Verhindert Duplicate Content. Leer lassen = aktuelle URL verwenden.
          </p>
        </div>
      </div>

      {/* Robots Settings */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label htmlFor="robots-index" className="text-base font-semibold">Robots Index</Label>
          <Select
            value={data.robotsIndex || 'index'}
            onValueChange={(value: 'index' | 'noindex') => handleChange('robotsIndex', value)}
          >
            <SelectTrigger className="mt-3 h-12 text-xl border-2 border-gray-300 focus:border-[#f9dc24] bg-white text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index" className="text-xl">index (empfohlen)</SelectItem>
              <SelectItem value="noindex" className="text-xl">noindex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="robots-follow" className="text-base font-semibold">Robots Follow</Label>
          <Select
            value={data.robotsFollow || 'follow'}
            onValueChange={(value: 'follow' | 'nofollow') => handleChange('robotsFollow', value)}
          >
            <SelectTrigger className="mt-3 h-12 text-xl border-2 border-gray-300 focus:border-[#f9dc24] bg-white text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="follow" className="text-xl">follow (empfohlen)</SelectItem>
              <SelectItem value="nofollow" className="text-xl">nofollow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Open Graph / Social Media */}
      <div className="border-t pt-8">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900">Open Graph / Social Media</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="og-title" className="text-base font-semibold">OG Title</Label>
            <Input
              id="og-title"
              value={data.ogTitle || ''}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              placeholder="Leer lassen = SEO Title verwenden"
              className="mt-3 text-xl h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 text-black placeholder:text-black"
            />
          </div>

          <div>
            <Label htmlFor="og-description" className="text-base font-semibold">OG Description</Label>
            <Textarea
              id="og-description"
              value={data.ogDescription || ''}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              placeholder="Leer lassen = Meta Description verwenden"
              className="mt-3 text-xl border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 py-3 text-black placeholder:text-black"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="og-image" className="flex items-center gap-2 text-base font-semibold">
              OG Image URL
              <Badge variant="secondary" className="text-sm">Auto</Badge>
              {heroImageUrl && !data.ogImage && (
                <Badge className="bg-green-500 text-white">Aus Hero übernommen</Badge>
              )}
            </Label>
            
            <div className="flex gap-3 mt-3">
              <Input
                id="og-image"
                value={data.ogImage || heroImageUrl || ''}
                onChange={(e) => handleChange('ogImage', e.target.value)}
                placeholder={heroImageUrl ? "Auto: Hero-Bild wird verwendet (1200×630px)" : "https://... (empfohlen: 1200×630px)"}
                className="flex-1 text-xl h-12 border-2 border-gray-300 focus:border-[#f9dc24] bg-white px-4 text-black placeholder:text-gray-500"
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
                      alert('Fehler beim Hochladen: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
                    }
                  }}
                />
                <Button type="button" variant="outline" className="h-12 px-4">
                  Upload
                </Button>
              </label>
              {data.ogImage && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-4"
                  onClick={() => handleChange('ogImage', '')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Image Preview */}
            {(data.ogImage || heroImageUrl) && (
              <div className="mt-4 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 w-[400px]">
                <div className="p-2 bg-gray-100 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-700">OG Image Preview</p>
                </div>
                <div className="relative aspect-[1200/630] bg-gray-200">
                  <img 
                    src={data.ogImage || heroImageUrl || ''}
                    alt="OG Image Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"%3E%3Crect fill="%23e5e7eb" width="1200" height="630"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif"%3EBild nicht gefunden%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-black/70 text-white px-2 py-0.5 rounded text-xs font-medium">
                    {data.ogImage ? 'Manuell' : 'Hero'}
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-base text-white mt-2">
              {heroImageUrl && !data.ogImage ? (
                <>✓ Hero-Bild wird automatisch verwendet. Überschreibe es mit Upload oder URL.</>
              ) : (
                <>Empfohlene Größe: 1200×630px für optimale Darstellung auf Social Media.</>
              )}
            </p>
          </div>

          <div>
            <Label htmlFor="twitter-card" className="text-base font-semibold">Twitter Card Type</Label>
            <Select
              value={data.twitterCard || 'summary_large_image'}
              onValueChange={(value: 'summary' | 'summary_large_image') => handleChange('twitterCard', value)}
            >
              <SelectTrigger className="mt-3 h-12 text-xl border-2 border-gray-300 focus:border-[#f9dc24] bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary_large_image" className="text-xl">Summary Large Image (empfohlen)</SelectItem>
                <SelectItem value="summary" className="text-xl">Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-8 border-t">
        <Button
          onClick={onSave}
          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-3 text-base h-12 px-6"
        >
          <Save className="h-5 w-5" />
          SEO Settings speichern
        </Button>
      </div>
    </div>
  );
};
