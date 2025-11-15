import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, AlertCircle, CheckCircle2, AlertTriangle, X, Search, Share2, Settings } from "lucide-react";
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
      {/* SERP Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Google Suchergebnis Vorschau
          </CardTitle>
          <CardDescription>
            So erscheint Ihre Seite in den Google-Suchergebnissen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SERPPreview
            title={data.title || ''}
            description={data.metaDescription || ''}
            url={data.slug ? `www.image-engineering.de › ${data.slug}` : 'www.image-engineering.de › your-page-slug'}
          />
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Basic SEO
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="checks" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            SEO Checks
            <Badge variant={Object.values(checks).filter(Boolean).length >= 5 ? "default" : "destructive"} className="ml-1">
              {Object.values(checks).filter(Boolean).length}/7
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Basic SEO Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basis SEO-Einstellungen</CardTitle>
              <CardDescription>
                Die wichtigsten Felder für Ihre Suchmaschinenoptimierung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Focus Keyword */}
              <div>
                <Label htmlFor="focus-keyword" className="flex items-center gap-2">
                  Fokus Keyword (FKW)
                  <Badge variant="outline">Empfohlen</Badge>
                </Label>
                <Input
                  id="focus-keyword"
                  value={data.focusKeyword || ''}
                  onChange={(e) => handleChange('focusKeyword', e.target.value)}
                  placeholder="z.B. camera testing software"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Hauptkeyword für diese Seite - sollte in Title, Description und Slug vorkommen
                </p>
              </div>

              {/* SEO Title */}
              <div>
                <Label htmlFor="seo-title" className="flex items-center gap-2">
                  SEO Title (Meta Title)
                  <Badge variant="outline">Pflicht</Badge>
                </Label>
                <Input
                  id="seo-title"
                  value={data.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="z.B. Professional Camera Testing Solutions | Image Engineering"
                  className="mt-2"
                  maxLength={70}
                />
                <div className="mt-2 space-y-2">
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
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
                  <div className="flex justify-between items-center text-sm">
                    <span className={
                      (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                        ? 'text-green-600'
                        : (data.title?.length || 0) > 60
                        ? 'text-red-600'
                        : (data.title?.length || 0) >= 40
                        ? 'text-yellow-600'
                        : 'text-red-500'
                    }>
                      {data.title?.length || 0} / 60 Zeichen
                    </span>
                    <span className={
                      (data.title?.length || 0) >= 50 && (data.title?.length || 0) <= 60
                        ? 'text-green-600'
                        : (data.title?.length || 0) > 60
                        ? 'text-red-600'
                        : (data.title?.length || 0) >= 40
                        ? 'text-yellow-600'
                        : 'text-red-500'
                    }>
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

              {/* H1 Heading */}
              <div>
                <Label className="flex items-center gap-2">
                  H1 Heading
                  <Badge variant="secondary">Auto</Badge>
                  {data.h1 && (
                    <Badge className="bg-green-500 text-white">✓ Gesetzt</Badge>
                  )}
                  {checks.keywordInH1 && (
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                      ✓ FKW enthalten
                    </Badge>
                  )}
                </Label>
                {data.h1 ? (
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightKeyword(data.h1, data.focusKeyword || '') 
                      }}
                      className="text-lg font-semibold"
                    />
                  </div>
                ) : (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Das H1-Tag wird automatisch aus dem ersten Segment der Seite übernommen (Intro oder Full Hero).
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Introduction */}
              <div>
                <Label className="flex items-center gap-2">
                  Introduction Content
                  <Badge variant="secondary">Auto</Badge>
                  {checks.keywordInIntroduction && (
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                      ✓ FKW enthalten
                    </Badge>
                  )}
                </Label>
                {introductionText.title || introductionText.description ? (
                  <div className="mt-2 p-4 bg-muted rounded-lg space-y-2">
                    {introductionText.title && (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: highlightKeyword(introductionText.title, data.focusKeyword || '') 
                        }}
                        className="font-semibold"
                      />
                    )}
                    {introductionText.description && (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: highlightKeyword(introductionText.description, data.focusKeyword || '') 
                        }}
                        className="text-sm"
                      />
                    )}
                  </div>
                ) : (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Der Introduction-Text wird automatisch aus den Segmenten geladen (Intro, Tiles oder Image & Text).
                    </AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Das Fokus-Keyword wird <span className="bg-yellow-300 font-bold px-1 rounded">gelb markiert</span>.
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <Label htmlFor="meta-description" className="flex items-center gap-2">
                  Meta Description
                  <Badge variant="outline">Pflicht</Badge>
                </Label>
                <Textarea
                  id="meta-description"
                  value={data.metaDescription || ''}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  placeholder="z.B. Discover professional camera testing solutions with Image Engineering..."
                  className="mt-2"
                  rows={4}
                  maxLength={170}
                />
                <div className="mt-2 space-y-2">
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
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
                  <div className="flex justify-between items-center text-sm">
                    <span className={
                      (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                        ? 'text-green-600'
                        : (data.metaDescription?.length || 0) > 160
                        ? 'text-red-600'
                        : (data.metaDescription?.length || 0) >= 100
                        ? 'text-yellow-600'
                        : 'text-red-500'
                    }>
                      {data.metaDescription?.length || 0} / 160 Zeichen
                    </span>
                    <span className={
                      (data.metaDescription?.length || 0) >= 120 && (data.metaDescription?.length || 0) <= 160
                        ? 'text-green-600'
                        : (data.metaDescription?.length || 0) > 160
                        ? 'text-red-600'
                        : (data.metaDescription?.length || 0) >= 100
                        ? 'text-yellow-600'
                        : 'text-red-500'
                    }>
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

              {/* URL Slug */}
              <div>
                <Label htmlFor="slug" className="flex items-center gap-2">
                  URL Slug
                  <Badge variant="outline">Pflicht</Badge>
                </Label>
                <div className="flex mt-2">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                    www.image-engineering.de/
                  </span>
                  <Input
                    id="slug"
                    value={data.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="your-page-url"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Nur Kleinbuchstaben, Zahlen und Bindestriche. FKW sollte enthalten sein.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Erweiterte Einstellungen</CardTitle>
              <CardDescription>
                Canonical URL und Robots Meta-Tags für fortgeschrittene SEO-Optimierung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Canonical URL */}
              <div>
                <Label htmlFor="canonical" className="flex items-center gap-2">
                  Canonical URL
                  <Badge variant="outline">Empfohlen</Badge>
                </Label>
                <Input
                  id="canonical"
                  value={data.canonical || ''}
                  onChange={(e) => handleChange('canonical', e.target.value)}
                  placeholder=""
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Verhindert Duplicate Content. Leer lassen = aktuelle URL verwenden.
                </p>
              </div>

              {/* Robots Index */}
              <div>
                <Label htmlFor="robots-index">Robots Index</Label>
                <Select 
                  value={data.robotsIndex || 'index'}
                  onValueChange={(value: 'index' | 'noindex') => handleChange('robotsIndex', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index">Index (empfohlen)</SelectItem>
                    <SelectItem value="noindex">NoIndex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Robots Follow */}
              <div>
                <Label htmlFor="robots-follow">Robots Follow</Label>
                <Select 
                  value={data.robotsFollow || 'follow'}
                  onValueChange={(value: 'follow' | 'nofollow') => handleChange('robotsFollow', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow">Follow (empfohlen)</SelectItem>
                    <SelectItem value="nofollow">NoFollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Integration</CardTitle>
              <CardDescription>
                Open Graph und Twitter Card Einstellungen für Social Media Vorschauen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OG Image */}
              <div>
                <Label htmlFor="og-image" className="flex items-center gap-2">
                  OG Image URL
                  <Badge variant="outline">Empfohlen</Badge>
                  {heroImageUrl && (
                    <Badge variant="secondary">Auto: Hero Image</Badge>
                  )}
                </Label>
                <Input
                  id="og-image"
                  value={data.ogImage || ''}
                  onChange={(e) => handleChange('ogImage', e.target.value)}
                  placeholder={heroImageUrl || "https://www.image-engineering.de/images/og-image.jpg"}
                  className="mt-2"
                />
                {heroImageUrl && (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Das Hero-Bild wurde automatisch als OG-Image gesetzt: {heroImageUrl}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* OG Title */}
              <div>
                <Label htmlFor="og-title">OG Title</Label>
                <Input
                  id="og-title"
                  value={data.ogTitle || ''}
                  onChange={(e) => handleChange('ogTitle', e.target.value)}
                  placeholder={data.title || "Leer lassen = SEO Title verwenden"}
                  className="mt-2"
                />
              </div>

              {/* OG Description */}
              <div>
                <Label htmlFor="og-description">OG Description</Label>
                <Textarea
                  id="og-description"
                  value={data.ogDescription || ''}
                  onChange={(e) => handleChange('ogDescription', e.target.value)}
                  placeholder={data.metaDescription || "Leer lassen = Meta Description verwenden"}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Twitter Card */}
              <div>
                <Label htmlFor="twitter-card">Twitter Card Type</Label>
                <Select 
                  value={data.twitterCard || 'summary_large_image'}
                  onValueChange={(value: 'summary' | 'summary_large_image') => handleChange('twitterCard', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary_large_image">Summary Large Image (empfohlen)</SelectItem>
                    <SelectItem value="summary">Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Checks Tab */}
        <TabsContent value="checks" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                SEO Health Check
              </CardTitle>
              <CardDescription>
                Überprüfung der wichtigsten SEO-Faktoren ({Object.values(checks).filter(Boolean).length}/7 bestanden)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert variant={checks.titleLength ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.titleLength)}
                    <span className="font-medium">Title Length</span>
                  </AlertDescription>
                </Alert>
                
                <Alert variant={checks.descriptionLength ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.descriptionLength)}
                    <span className="font-medium">Description Length</span>
                  </AlertDescription>
                </Alert>
                
                <Alert variant={checks.keywordInTitle ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.keywordInTitle)}
                    <span className="font-medium">FKW in Title</span>
                  </AlertDescription>
                </Alert>
                
                <Alert variant={checks.keywordInDescription ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.keywordInDescription)}
                    <span className="font-medium">FKW in Description</span>
                  </AlertDescription>
                </Alert>
                
                <Alert variant={checks.keywordInSlug ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.keywordInSlug)}
                    <span className="font-medium">FKW in Slug</span>
                  </AlertDescription>
                </Alert>
                
                <Alert variant={checks.hasH1 ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.hasH1)}
                    <span className="font-medium">H1 Present</span>
                  </AlertDescription>
                </Alert>
                
                <Alert variant={checks.keywordInH1 ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.keywordInH1)}
                    <span className="font-medium">FKW in H1</span>
                  </AlertDescription>
                </Alert>
                
                <Alert variant={checks.keywordInIntroduction ? "default" : "destructive"}>
                  <AlertDescription className="flex items-center gap-2">
                    {getStatusIcon(checks.keywordInIntroduction)}
                    <span className="font-medium">FKW in Introduction</span>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onSave}
          size="lg"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          SEO Settings speichern
        </Button>
      </div>
    </div>
  );
};
