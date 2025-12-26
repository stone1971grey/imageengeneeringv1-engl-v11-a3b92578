import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FirecrawlIcon } from '@/components/FirecrawlIcon';
import { 
  Globe, 
  Download, 
  FileText, 
  Video, 
  List, 
  Table, 
  Loader2,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Link2
} from 'lucide-react';

interface ParsedContent {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  specifications: { name: string; value: string }[];
  useCases: { title: string; description: string }[];
  downloads: { title: string; description: string; url: string; language: string }[];
  videoUrl: string | null;
  images: { url: string; title: string }[];
}

interface ContentAutomationProps {
  pageSlug: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onImportComplete?: () => void;
}

// Mapping of page slugs to their original source URLs for migration
// Structure: { pageSlug: { default: url, de?: url, ja?: url, ... } }
type LanguageUrls = {
  default: string;
  de?: string;
  ja?: string;
  ko?: string;
  zh?: string;
};

const SOURCE_URL_MAPPING: Record<string, LanguageUrls> = {
  'products/illumination-devices/arcturus': {
    default: 'https://www.image-engineering.de/products/equipment/illumination-devices/1315-arcturus',
    de: 'https://www.image-engineering.de/de/produkte/equipment/illumination-devices/1315-arcturus',
  },
  'products/illumination-devices/vega': {
    default: 'https://www.image-engineering.de/products/equipment/illumination-devices/vega',
    de: 'https://www.image-engineering.de/de/produkte/equipment/illumination-devices/vega',
  },
  'products/lightboxes/le7': {
    default: 'https://www.image-engineering.de/products/equipment/lightboxes/le7',
    de: 'https://www.image-engineering.de/de/produkte/equipment/lightboxes/le7',
  },
  'products/test-charts': {
    default: 'https://www.image-engineering.de/products/test-charts',
    de: 'https://www.image-engineering.de/de/produkte/test-charts',
  },
  'products/software/iq-analyzer-x': {
    default: 'https://www.image-engineering.de/products/software/iq-analyzer-x',
    de: 'https://www.image-engineering.de/de/produkte/software/iq-analyzer-x',
  },
};

// Helper to get URL for current language
const getSourceUrlForLanguage = (pageSlug: string, language: string): string => {
  const mapping = SOURCE_URL_MAPPING[pageSlug];
  if (!mapping) return '';
  
  // Check for language-specific URL, fall back to default (English)
  if (language !== 'en' && mapping[language as keyof LanguageUrls]) {
    return mapping[language as keyof LanguageUrls] as string;
  }
  return mapping.default;
};

// Check if a language has its own source URL (not just default)
const hasLanguageSpecificUrl = (pageSlug: string, language: string): boolean => {
  const mapping = SOURCE_URL_MAPPING[pageSlug];
  if (!mapping || language === 'en') return false;
  return !!mapping[language as keyof LanguageUrls];
};

export const ContentAutomation = ({ pageSlug, language, onImportComplete }: ContentAutomationProps) => {
  // Initialize sourceUrl from mapping if available (language-aware)
  const initialSourceUrl = getSourceUrlForLanguage(pageSlug, language);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [createRedirect, setCreateRedirect] = useState(false);
  const [existingRedirectId, setExistingRedirectId] = useState<string | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<{
    productHero: boolean;
    intro: boolean;
    specification: boolean;
    featureOverview: boolean;
    downloads: boolean;
    video: boolean;
  }>({
    productHero: true,
    intro: true,
    specification: true,
    featureOverview: true,
    downloads: true,
    video: true,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingRedirect, setIsSavingRedirect] = useState(false);

  // Update sourceUrl when language changes
  useEffect(() => {
    const newUrl = getSourceUrlForLanguage(pageSlug, language);
    setSourceUrl(newUrl);
  }, [pageSlug, language]);

  // Check if redirect already exists for this page on mount and when sourceUrl changes
  useEffect(() => {
    const checkExistingRedirect = async () => {
      // Build target URL
      const targetUrl = `/${language}/${pageSlug}`;
      
      // Check by target URL
      const { data: byTarget } = await supabase
        .from('redirects')
        .select('id, source_url')
        .eq('target_url', targetUrl)
        .maybeSingle();
      
      if (byTarget) {
        setCreateRedirect(true);
        setExistingRedirectId(byTarget.id);
        return;
      }

      // Also check if source URL already has a redirect
      if (sourceUrl) {
        let sourceUrlPath = sourceUrl;
        try {
          const urlObj = new URL(sourceUrl);
          sourceUrlPath = urlObj.pathname;
        } catch {
          // Already a path
        }
        
        const { data: bySource } = await supabase
          .from('redirects')
          .select('id')
          .eq('source_url', sourceUrlPath)
          .maybeSingle();
        
        if (bySource) {
          setCreateRedirect(true);
          setExistingRedirectId(bySource.id);
          return;
        }
      }
      
      setExistingRedirectId(null);
    };
    
    checkExistingRedirect();
  }, [pageSlug, language, sourceUrl]);

  const handleSaveRedirect = async () => {
    if (!sourceUrl) {
      toast.error('Please enter a source URL first');
      return;
    }

    setIsSavingRedirect(true);

    try {
      // Build target URL from page slug and language
      const targetUrl = `/${language}/${pageSlug}`;
      
      // Extract path from source URL (remove domain)
      let sourceUrlPath = sourceUrl;
      try {
        const urlObj = new URL(sourceUrl);
        sourceUrlPath = urlObj.pathname;
      } catch {
        // If it's already a path, use as-is
      }

      // Check if redirect already exists
      const { data: existing } = await supabase
        .from('redirects')
        .select('id')
        .eq('source_url', sourceUrlPath)
        .maybeSingle();

      if (existing) {
        toast.info('Redirect already exists for this source URL');
        setIsSavingRedirect(false);
        return;
      }

      const { error: redirectError } = await supabase
        .from('redirects')
        .insert({
          source_url: sourceUrlPath,
          target_url: targetUrl,
          redirect_type: 301,
          is_active: true,
          notes: `Content Automation for page "${pageSlug}" [${language.toUpperCase()}] | Source: ${sourceUrl}`,
        });

      if (redirectError) {
        console.error('Error creating redirect:', redirectError);
        toast.error('Failed to save redirect');
      } else {
        toast.success(`301 redirect saved: ${sourceUrlPath} → ${targetUrl}`);
        setCreateRedirect(true); // Mark checkbox as checked
      }
    } catch (error) {
      console.error('Error saving redirect:', error);
      toast.error('Failed to save redirect');
    } finally {
      setIsSavingRedirect(false);
    }
  };

  const handleFetchContent = async () => {
    if (!sourceUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setParsedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-external-content', {
        body: { url: sourceUrl, language },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setParsedContent(data.data);
        toast.success('Content fetched successfully!');
      } else {
        throw new Error(data?.error || 'Failed to parse content');
      }
    } catch (error: unknown) {
      console.error('Error fetching content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch content';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportContent = async () => {
    if (!parsedContent) return;

    setIsImporting(true);

    try {
      // Get the current max segment ID
      const { data: maxIdData } = await supabase
        .from('segment_registry')
        .select('segment_id')
        .order('segment_id', { ascending: false })
        .limit(1)
        .single();

      let nextSegmentId = (maxIdData?.segment_id || 0) + 1;

      // Get existing segments for this page
      const { data: existingRegistry } = await supabase
        .from('segment_registry')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('deleted', false);

      const existingSegmentTypes = new Set(existingRegistry?.map(s => s.segment_type) || []);

      // Prepare new segments to add
      const newRegistryEntries: any[] = [];
      const newSegments: any[] = [];
      let position = existingRegistry?.length || 0;

      // Filter downloads by language (include 'en' as fallback if current language has none)
      let filteredDownloads = parsedContent.downloads.filter(d => d.language === language);
      if (filteredDownloads.length === 0) {
        filteredDownloads = parsedContent.downloads.filter(d => d.language === 'en');
      }

      // Build rich description from all available content
      const buildRichDescription = () => {
        let desc = parsedContent.description || '';
        if (parsedContent.benefits.length > 0 && desc.length < 300) {
          desc += ' Key features include: ' + parsedContent.benefits.slice(0, 3).join(', ') + '.';
        }
        return desc;
      };

      // 1. Product Hero Gallery (with rich description)
      if (selectedSegments.productHero && !existingSegmentTypes.has('product-hero-gallery')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-hero-${segId}`,
          segment_type: 'product-hero-gallery',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'product-hero-gallery',
          data: {
            title: parsedContent.title,
            subtitle: parsedContent.subtitle || 'Professional Equipment',
            description: buildRichDescription(),
            imagePosition: 'right',
            layoutRatio: '2-5',
            topSpacing: 'small',
            cta1Text: language === 'de' ? 'Kontakt aufnehmen' : 'Contact Sales',
            cta1Link: '/contact',
            cta1Style: 'standard',
            cta2Text: language === 'de' ? 'Spezifikationen' : 'View Specifications',
            cta2Link: '#specifications',
            cta2Style: 'outline-white',
            images: parsedContent.images.slice(0, 3).map(img => img.url),
            imageMaxWidth: 480,
          },
          position: position - 1,
        });
      }

      // 2. Intro with comprehensive content (description + benefits)
      if (selectedSegments.intro && !existingSegmentTypes.has('intro')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-intro-${segId}`,
          segment_type: 'intro',
          position: position++,
        });
        
        // Build comprehensive intro HTML
        let introHtml = '';
        if (parsedContent.description) {
          introHtml += `<p>${parsedContent.description}</p>`;
        }
        if (parsedContent.benefits.length > 0) {
          introHtml += '<h3>' + (language === 'de' ? 'Hauptvorteile' : 'Key Benefits') + '</h3>';
          introHtml += '<ul>' + parsedContent.benefits.map(b => {
            const words = b.split(' ');
            if (words.length > 3) {
              return `<li><strong>${words.slice(0, 3).join(' ')}</strong> ${words.slice(3).join(' ')}</li>`;
            }
            return `<li>${b}</li>`;
          }).join('') + '</ul>';
        }
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'intro',
          data: {
            headline: parsedContent.title,
            headingLevel: 'h1',
            introText: introHtml || `<p>${language === 'de' ? 'Willkommen zur Produktseite.' : 'Welcome to the product page.'}</p>`,
            alignment: 'left',
            showDivider: true,
          },
          position: position - 1,
        });
      }

      // 3. Specifications Table
      if (selectedSegments.specification && parsedContent.specifications.length > 0 && !existingSegmentTypes.has('specification')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-specs-${segId}`,
          segment_type: 'specification',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'specification',
          data: {
            title: language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications',
            rows: parsedContent.specifications.map(s => ({
              specification: s.name,
              value: s.value,
            })),
            description: language === 'de' 
              ? `Detaillierte technische Daten für ${parsedContent.title}.`
              : `Detailed technical specifications for ${parsedContent.title}.`,
          },
          position: position - 1,
        });
      }

      // 4. Feature Overview (Use Cases / Applications)
      if (selectedSegments.featureOverview && parsedContent.useCases.length > 0 && !existingSegmentTypes.has('feature-overview')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-features-${segId}`,
          segment_type: 'feature-overview',
          position: position++,
        });
        
        // Ensure we have at least 4 items by duplicating or adding placeholders
        let featureItems = parsedContent.useCases.slice(0, 6).map(uc => ({
          title: uc.title,
          description: uc.description,
        }));
        
        // If we have fewer than 4, add generic ones based on benefits
        while (featureItems.length < 4 && parsedContent.benefits.length > featureItems.length) {
          const benefit = parsedContent.benefits[featureItems.length];
          featureItems.push({
            title: benefit.split(' ').slice(0, 4).join(' '),
            description: benefit,
          });
        }
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'feature-overview',
          data: {
            title: language === 'de' ? 'Anwendungen & Features' : 'Applications & Features',
            subtext: language === 'de' 
              ? `Entdecken Sie die vielfältigen Einsatzmöglichkeiten von ${parsedContent.title}.`
              : `Discover the versatile applications of ${parsedContent.title}.`,
            layout: String(Math.min(featureItems.length, 3)),
            rows: String(Math.ceil(featureItems.length / 3)),
            items: featureItems,
          },
          position: position - 1,
        });
      }

      // 5. Downloads (Tiles) - improved with better descriptions
      if (selectedSegments.downloads && filteredDownloads.length > 0 && !existingSegmentTypes.has('tiles')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-downloads-${segId}`,
          segment_type: 'tiles',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'tiles',
          data: {
            title: language === 'de' ? 'Dokumentation & Downloads' : 'Documentation & Downloads',
            columns: String(Math.min(filteredDownloads.length, 3)),
            items: filteredDownloads.map(d => ({
              title: d.title,
              description: d.description || (language === 'de' ? 'Produktdokumentation' : 'Product documentation'),
              icon: 'FileText',
              ctaText: language === 'de' ? 'PDF herunterladen' : 'Download PDF',
              ctaLink: d.url,
              showButton: true,
            })),
          },
          position: position - 1,
        });
      }

      // 6. FAQ Segment (generated from benefits and use cases)
      if (!existingSegmentTypes.has('faq') && (parsedContent.benefits.length >= 2 || parsedContent.useCases.length >= 2)) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-faq-${segId}`,
          segment_type: 'faq',
          position: position++,
        });
        
        // Generate FAQs from content
        const faqItems: { question: string; answer: string }[] = [];
        
        // Q1: What is this product?
        faqItems.push({
          question: language === 'de' 
            ? `Was ist ${parsedContent.title}?` 
            : `What is ${parsedContent.title}?`,
          answer: parsedContent.description || (language === 'de' 
            ? `${parsedContent.title} ist ein professionelles Produkt von Image Engineering.`
            : `${parsedContent.title} is a professional product from Image Engineering.`),
        });
        
        // Q2: What are the main benefits?
        if (parsedContent.benefits.length > 0) {
          faqItems.push({
            question: language === 'de' 
              ? `Welche Vorteile bietet ${parsedContent.title}?`
              : `What are the benefits of ${parsedContent.title}?`,
            answer: parsedContent.benefits.slice(0, 3).join('. ') + '.',
          });
        }
        
        // Q3: From use cases
        if (parsedContent.useCases.length > 0) {
          faqItems.push({
            question: language === 'de'
              ? `Welche Anwendungsbereiche gibt es?`
              : `What are the typical applications?`,
            answer: parsedContent.useCases.slice(0, 2).map(uc => `${uc.title}: ${uc.description}`).join(' '),
          });
        }
        
        // Q4: Standards/compatibility
        faqItems.push({
          question: language === 'de'
            ? 'Welche Standards werden unterstützt?'
            : 'What standards are supported?',
          answer: language === 'de'
            ? 'Image Engineering Produkte unterstützen internationale Standards wie ISO, IEEE und EMVA 1288.'
            : 'Image Engineering products support international standards including ISO, IEEE, and EMVA 1288.',
        });
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'faq',
          data: {
            headline: language === 'de' 
              ? `Häufige Fragen zu ${parsedContent.title}`
              : `Frequently Asked Questions about ${parsedContent.title}`,
            items: faqItems,
          },
          position: position - 1,
        });
      }

      // 7. Video Segment
      if (selectedSegments.video && parsedContent.videoUrl && !existingSegmentTypes.has('video')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-video-${segId}`,
          segment_type: 'video',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'video',
          data: {
            title: 'Product Video',
            videoUrl: parsedContent.videoUrl,
            aspectRatio: '16:9',
            autoplay: false,
            muted: true,
            loop: false,
          },
          position: position - 1,
        });
      }

      // 8. Banner-P (CTA) Segment - Always add at the end
      if (!existingSegmentTypes.has('banner-p')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-cta-${segId}`,
          segment_type: 'banner-p',
          position: position++,
        });
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'banner-p',
          data: {
            headline: language === 'de' 
              ? `Interesse an ${parsedContent.title}?`
              : `Interested in ${parsedContent.title}?`,
            description: language === 'de'
              ? 'Kontaktieren Sie unser Expertenteam für eine individuelle Beratung und ein maßgeschneidertes Angebot.'
              : 'Contact our expert team for personalized consultation and a tailored quote.',
            ctaText: language === 'de' ? 'Kontakt aufnehmen' : 'Get in Touch',
            ctaLink: '/contact',
            variant: 'gradient',
          },
          position: position - 1,
        });
      }

      if (newRegistryEntries.length === 0) {
        toast.info('No new segments to import (segments already exist or none selected)');
        setIsImporting(false);
        return;
      }

      // Insert into segment_registry
      const { error: registryError } = await supabase
        .from('segment_registry')
        .insert(newRegistryEntries);

      if (registryError) throw registryError;

      // Load existing page_content
      const { data: existingContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .single();

      let existingSegments: any[] = [];
      if (existingContent?.content_value) {
        existingSegments = JSON.parse(existingContent.content_value);
      }

      // Merge segments
      const mergedSegments = [...existingSegments, ...newSegments];

      // Update tab_order
      const { data: tabOrderData } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'tab_order')
        .eq('language', language)
        .single();

      let tabOrder: string[] = [];
      if (tabOrderData?.content_value) {
        tabOrder = JSON.parse(tabOrderData.content_value);
      }
      const newTabOrder = [...tabOrder, ...newSegments.map(s => s.id)];

      // Save page_content
      const { error: contentError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'page_segments',
          language,
          content_type: 'json',
          content_value: JSON.stringify(mergedSegments),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,language',
        });

      if (contentError) throw contentError;

      // Save tab_order
      const { error: tabError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'tab_order',
          language,
          content_type: 'json',
          content_value: JSON.stringify(newTabOrder),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,language',
        });

      if (tabError) throw tabError;

      // Save 301 redirect if checkbox is checked
      if (createRedirect && sourceUrl) {
        // Build target URL from page slug and language
        const targetUrl = `/${language}/${pageSlug}`;
        
        // Extract path from source URL (remove domain)
        let sourceUrlPath = sourceUrl;
        try {
          const urlObj = new URL(sourceUrl);
          sourceUrlPath = urlObj.pathname;
        } catch {
          // If it's already a path, use as-is
        }

        const { error: redirectError } = await supabase
          .from('redirects')
          .insert({
            source_url: sourceUrlPath,
            target_url: targetUrl,
            redirect_type: 301,
            is_active: true,
            notes: `Content Automation for page "${pageSlug}" [${language.toUpperCase()}] | Source: ${sourceUrl}`,
          });

        if (redirectError) {
          console.error('Error creating redirect:', redirectError);
          toast.error('Content imported, but redirect could not be saved');
        } else {
          toast.success(`301 redirect created: ${sourceUrlPath} → ${targetUrl}`);
        }
      }

      toast.success(`Successfully imported ${newSegments.length} segments!`);
      onImportComplete?.();

    } catch (error: unknown) {
      console.error('Error importing content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import content';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSegment = (key: keyof typeof selectedSegments) => {
    setSelectedSegments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredDownloads = parsedContent?.downloads.filter(d => d.language === language) || [];

  return (
    <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-600 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl">
            <FirecrawlIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-2xl font-bold tracking-tight">Content Automation</CardTitle>
            <CardDescription className="text-gray-300 text-base mt-1">
              Import content from external URLs and create segments automatically
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language-specific URL indicator */}
        {language !== 'en' && (
          <div className={`p-4 rounded-lg border ${
            hasLanguageSpecificUrl(pageSlug, language) 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                hasLanguageSpecificUrl(pageSlug, language) 
                  ? 'bg-green-500/20' 
                  : 'bg-amber-500/20'
              }`}>
                <Globe className={`h-5 w-5 ${
                  hasLanguageSpecificUrl(pageSlug, language) 
                    ? 'text-green-400' 
                    : 'text-amber-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  hasLanguageSpecificUrl(pageSlug, language) 
                    ? 'text-green-300' 
                    : 'text-amber-300'
                }`}>
                  {hasLanguageSpecificUrl(pageSlug, language) 
                    ? `✓ Language-specific source URL available for ${language.toUpperCase()}`
                    : `No language-specific source for ${language.toUpperCase()} - using English default`
                  }
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {hasLanguageSpecificUrl(pageSlug, language)
                    ? 'Fetched content will be from the native language source page.'
                    : 'Consider using Automatic Translate after importing English content, or add a language-specific URL below.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* URL Input */}
        <div className="space-y-3">
          <Label htmlFor="sourceUrl" className="text-white text-lg flex items-center gap-2 font-medium">
            <Globe className="h-5 w-5 text-[#f9dc24]" />
            Source URL {language !== 'en' && <Badge variant="outline" className="ml-2 text-xs">{language.toUpperCase()}</Badge>}
          </Label>
          <p className="text-gray-400 text-sm">
            Enter the source page URL to import content from.
            Images and PDFs should be uploaded to the Media Management folder beforehand.
          </p>
          <div className="flex gap-3">
            <Input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.example.com/products/your-product"
              className="bg-gray-700/80 border-gray-500 text-white placeholder:text-gray-400 flex-1 h-12 text-base px-4 focus:border-[#f9dc24] focus:ring-[#f9dc24]/20"
            />
            <Button
              onClick={handleFetchContent}
              disabled={isLoading || !sourceUrl}
              className="bg-gradient-to-r from-[#f9dc24] to-[#f5c800] text-black hover:from-[#f5c800] hover:to-[#f9dc24] font-semibold h-12 px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Fetch Content
                </>
              )}
            </Button>
          </div>

          {/* Redirect Checkbox with Save Button */}
          <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg border border-gray-600 mt-4">
            <Checkbox
              id="createRedirect"
              checked={createRedirect}
              onCheckedChange={(checked) => setCreateRedirect(checked === true)}
              className="border-gray-400 data-[state=checked]:bg-[#f9dc24] data-[state=checked]:border-[#f9dc24]"
            />
            <div className="flex-1">
              <Label htmlFor="createRedirect" className="text-white font-medium flex items-center gap-2 cursor-pointer">
                <Link2 className="h-4 w-4 text-[#f9dc24]" />
                Create 301 Redirect
              </Label>
              <p className="text-gray-400 text-sm mt-0.5">
                The source URL will be saved as a permanent redirect to the new page (SEO Settings)
              </p>
            </div>
            <Button
              onClick={handleSaveRedirect}
              disabled={!sourceUrl || isSavingRedirect}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isSavingRedirect ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save Redirect
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Parsed Content Preview */}
        {parsedContent && (
          <>
            <Separator className="bg-gray-700" />
            
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Content Preview
              </h3>

              <ScrollArea className="h-[400px] rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <div className="space-y-4">
                  {/* Title & Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="productHero"
                        checked={selectedSegments.productHero}
                        onCheckedChange={() => toggleSegment('productHero')}
                      />
                      <Label htmlFor="productHero" className="text-white font-medium">
                        Product Hero Gallery
                      </Label>
                      <Badge variant="outline" className="text-xs">product-hero-gallery</Badge>
                    </div>
                    <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                      <p className="text-lg font-bold text-white">{parsedContent.title}</p>
                      {parsedContent.subtitle && (
                        <p className="text-sm text-gray-400">{parsedContent.subtitle}</p>
                      )}
                      {parsedContent.description && (
                        <p className="text-sm text-gray-300 mt-2 line-clamp-3">{parsedContent.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Benefits */}
                  {parsedContent.benefits.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="intro"
                          checked={selectedSegments.intro}
                          onCheckedChange={() => toggleSegment('intro')}
                        />
                        <Label htmlFor="intro" className="text-white font-medium flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Key Benefits ({parsedContent.benefits.length})
                        </Label>
                        <Badge variant="outline" className="text-xs">intro</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <ul className="text-sm text-gray-300 space-y-1">
                          {parsedContent.benefits.slice(0, 4).map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#f9dc24]">•</span>
                              <span className="line-clamp-1">{b}</span>
                            </li>
                          ))}
                          {parsedContent.benefits.length > 4 && (
                            <li className="text-gray-500">+{parsedContent.benefits.length - 4} more...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {parsedContent.specifications.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="specification"
                          checked={selectedSegments.specification}
                          onCheckedChange={() => toggleSegment('specification')}
                        />
                        <Label htmlFor="specification" className="text-white font-medium flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          Specifications ({parsedContent.specifications.length})
                        </Label>
                        <Badge variant="outline" className="text-xs">specification</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <div className="text-sm space-y-1">
                          {parsedContent.specifications.slice(0, 4).map((s, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-gray-400">{s.name}</span>
                              <span className="text-white">{s.value}</span>
                            </div>
                          ))}
                          {parsedContent.specifications.length > 4 && (
                            <p className="text-gray-500">+{parsedContent.specifications.length - 4} more...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Use Cases */}
                  {parsedContent.useCases.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="featureOverview"
                          checked={selectedSegments.featureOverview}
                          onCheckedChange={() => toggleSegment('featureOverview')}
                        />
                        <Label htmlFor="featureOverview" className="text-white font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Features & Use Cases ({parsedContent.useCases.length})
                        </Label>
                        <Badge variant="outline" className="text-xs">feature-overview</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg space-y-2">
                        {parsedContent.useCases.slice(0, 3).map((uc, i) => (
                          <div key={i}>
                            <p className="text-white font-medium">{uc.title}</p>
                            <p className="text-sm text-gray-400 line-clamp-2">{uc.description}</p>
                          </div>
                        ))}
                        {parsedContent.useCases.length > 3 && (
                          <p className="text-gray-500 text-sm">+{parsedContent.useCases.length - 3} more...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Downloads */}
                  {filteredDownloads.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="downloads"
                          checked={selectedSegments.downloads}
                          onCheckedChange={() => toggleSegment('downloads')}
                        />
                        <Label htmlFor="downloads" className="text-white font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Downloads ({filteredDownloads.length} {language.toUpperCase()})
                        </Label>
                        <Badge variant="outline" className="text-xs">tiles</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <div className="text-sm space-y-1">
                          {filteredDownloads.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#f9dc24]" />
                              <span className="text-white">{d.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video */}
                  {parsedContent.videoUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="video"
                          checked={selectedSegments.video}
                          onCheckedChange={() => toggleSegment('video')}
                        />
                        <Label htmlFor="video" className="text-white font-medium flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Product Video
                        </Label>
                        <Badge variant="outline" className="text-xs">video</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-400 break-all">{parsedContent.videoUrl}</p>
                      </div>
                    </div>
                  )}

                  {/* No content warning */}
                  {!parsedContent.benefits.length && 
                   !parsedContent.specifications.length && 
                   !parsedContent.useCases.length && 
                   !filteredDownloads.length && (
                    <div className="flex items-center gap-2 text-yellow-500 p-3 bg-yellow-500/10 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <span>Limited content found. The page structure may not be fully supported.</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Import Button */}
              <Button
                onClick={handleImportContent}
                disabled={isImporting}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Importing Segments...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Import Selected Segments
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
