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
import { SEGMENT_CONFIG } from '@/components/admin/dashboard/config';
import { SegmentType } from '@/components/admin/dashboard/types';

import { GeminiIcon } from '@/components/GeminiIcon';
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
  Link2,
  Wand2,
  CheckCircle2,
  Clock
} from 'lucide-react';

// ============================================
// CRITICAL RULE: CONTENT AUTOMATION SEGMENT TYPES
// ============================================
// Content Automation darf NUR existierende Segment-Typen verwenden!
// Die erlaubten Typen sind in SEGMENT_CONFIG definiert.
// Fantasie-Segmente wie 'banner-p' sind STRIKT VERBOTEN.
// Diese Regel ist BINDEND für alle Content Automation Operationen.
// ============================================

// Validate that a segment type exists in the system
const isValidSegmentType = (type: string): type is SegmentType => {
  return type in SEGMENT_CONFIG;
};

// Get valid segment types for content automation (ALL content segments)
const CONTENT_AUTOMATION_SEGMENT_TYPES: SegmentType[] = [
  // Hero segments
  'hero',
  'product-hero-gallery',
  // Content segments
  'intro',
  'image-text',
  'tiles',
  'banner',
  'feature-overview',
  'table',
  'video',
  'specification',
  'faq',
];

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
  rawMarkdown?: string;
}

// Note: PendingSegment interface removed - approval now happens in frontend via EditableSegment

interface ContentAutomationProps {
  pageSlug: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onImportComplete?: () => void;
  onRedirectToFrontend?: (url: string) => void;
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
  'products/illumination-devices/octa-light-player': {
    default: 'https://www.image-engineering.de/products/equipment/illumination-devices/1299-octa-light-player',
    de: 'https://www.image-engineering.de/de/produkte/equipment/illumination-devices/1299-octa-light-player',
  },
  'products/measurement-devices/aeon-camera-calibrator': {
    default: 'https://www.image-engineering.de/products/equipment/measurement-devices/1295-aeon-camera-calibrator',
    de: 'https://www.image-engineering.de/de/produkte/equipment/measurement-devices/1295-aeon-camera-calibrator',
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

export const ContentAutomation = ({ pageSlug, language, onImportComplete, onRedirectToFrontend }: ContentAutomationProps) => {
  // Initialize sourceUrl from mapping if available (language-aware)
  const initialSourceUrl = getSourceUrlForLanguage(pageSlug, language);
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [createRedirect, setCreateRedirect] = useState(false);
  const [existingRedirectId, setExistingRedirectId] = useState<string | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<{
    productHero: boolean;
    intro: boolean;
    specification: boolean;
    table: boolean;
    featureOverview: boolean;
    downloads: boolean;
    video: boolean;
  }>({
    productHero: true,
    intro: true,
    specification: true,
    table: true,
    featureOverview: true,
    downloads: true,
    video: true,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState<string>('');
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importTotal, setImportTotal] = useState<number>(0);
  const [isSavingRedirect, setIsSavingRedirect] = useState(false);
  
  // Note: Old approval state removed - approval now happens in frontend

  // Update sourceUrl when language changes
  useEffect(() => {
    const newUrl = getSourceUrlForLanguage(pageSlug, language);
    setSourceUrl(newUrl);
  }, [pageSlug, language]);

  // Check if redirect already exists for this page on mount and when pageSlug/language changes
  // Also load the original source URL from existing redirect
  useEffect(() => {
    const checkExistingRedirect = async () => {
      // Build target URL
      const targetUrl = `/${language}/${pageSlug}`;
      
      // Check by target URL - this also loads the original source URL for the field
      const { data: byTarget } = await supabase
        .from('redirects')
        .select('id, source_url, notes')
        .eq('target_url', targetUrl)
        .maybeSingle();
      
      if (byTarget) {
        setCreateRedirect(true);
        setExistingRedirectId(byTarget.id);
        
        // If we don't have a source URL from mapping, try to extract full URL from redirect notes
        // Notes format: "Content Automation for page ... | Source: https://www.example.com/..."
        if (!sourceUrl && byTarget.notes) {
          const sourceMatch = byTarget.notes.match(/Source:\s*(https?:\/\/[^\s]+)/);
          if (sourceMatch && sourceMatch[1]) {
            setSourceUrl(sourceMatch[1]);
            console.log('[ContentAutomation] Loaded source URL from redirect notes:', sourceMatch[1]);
          } else if (byTarget.source_url) {
            // Fall back to source_url path (less ideal but better than nothing)
            // Try to reconstruct full URL for common domains
            const fullUrl = `https://www.image-engineering.de${byTarget.source_url}`;
            setSourceUrl(fullUrl);
            console.log('[ContentAutomation] Reconstructed source URL from redirect path:', fullUrl);
          }
        }
        return;
      }
      
      setExistingRedirectId(null);
    };
    
    checkExistingRedirect();
  }, [pageSlug, language]); // Removed sourceUrl from deps to avoid infinite loop

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

  // Helper function to generate download descriptions from title
  const getDownloadDescriptionFromTitle = (title: string, lang: string): string => {
    const lower = title.toLowerCase();
    if (lower.includes('datasheet') || lower.includes('datenblatt') || lower.includes('specification')) {
      return lang === 'de' ? 'Technische Spezifikationen und Produktdetails' : 'Technical specifications and product details';
    }
    if (lower.includes('manual') || lower.includes('anleitung') || lower.includes('guide')) {
      return lang === 'de' ? 'Vollständige Bedienungsanleitung' : 'Complete operating instructions';
    }
    if (lower.includes('brochure') || lower.includes('broschüre') || lower.includes('flyer')) {
      return lang === 'de' ? 'Produktübersicht und Features' : 'Product overview and features';
    }
    if (lower.includes('whitepaper') || lower.includes('white paper')) {
      return lang === 'de' ? 'Technisches Whitepaper mit Analyse' : 'Technical whitepaper with in-depth analysis';
    }
    if (lower.includes('certificate') || lower.includes('zertifikat')) {
      return lang === 'de' ? 'Produktzertifizierung' : 'Product certification documentation';
    }
    if (lower.includes('black') || lower.includes('standard') || lower.includes('white')) {
      return lang === 'de' ? 'Produktdatenblatt' : 'Product datasheet';
    }
    return lang === 'de' ? 'Produktdokumentation' : 'Product documentation';
  };

  const handleFetchContent = async () => {
    if (!sourceUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Connecting to Firecrawl...');
    setParsedContent(null);

    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      setLoadingStep('Fetching page content...');
      
      const { data, error } = await supabase.functions.invoke('fetch-external-content', {
        body: { url: sourceUrl, language },
      });

      clearTimeout(timeoutId);

      if (error) throw error;

      setLoadingStep('Processing extracted data...');
      
      if (data?.success && data?.data) {
        setParsedContent(data.data);
        setLoadingStep('');
        toast.success('Content fetched successfully!', {
          description: `Found ${data.data.images?.length || 0} images, ${data.data.downloads?.length || 0} downloads`,
        });
      } else {
        throw new Error(data?.error || 'Failed to parse content');
      }
    } catch (error: unknown) {
      console.error('Error fetching content:', error);
      const errorMessage = error instanceof Error 
        ? (error.name === 'AbortError' ? 'Request timeout - try again' : error.message)
        : 'Failed to fetch content';
      toast.error(errorMessage);
      setLoadingStep('');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // MINIMAL DEBUG IMPORT - Step by step
  // ============================================
  const handlePrepareForApproval = async () => {
    // STEP 0: Immediate UI update
    console.log('=== STEP 0: Button clicked ===');
    setIsImporting(true);
    setImportStep('Starting...');
    setImportProgress(0);
    setImportTotal(10);

    // Check content exists
    if (!parsedContent) {
      console.error('=== No parsedContent! ===');
      toast.error('No content. Fetch first.');
      setIsImporting(false);
      return;
    }

    console.log('=== Content found:', parsedContent.title);
    
    // Run import with delay to allow UI to render
    setTimeout(() => runMinimalImport(), 100);
  };

  const runMinimalImport = async () => {
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Helper: Extract sections from markdown content
    const extractSectionsFromMarkdown = (markdown: string): { title: string; description: string }[] => {
      const sections: { title: string; description: string }[] = [];
      
      // Split by ##### headers (subsections)
      const sectionRegex = /#{4,5}\s+(.+?)(?=\n)([\s\S]*?)(?=#{4,5}\s|$)/g;
      let match;
      
      while ((match = sectionRegex.exec(markdown)) !== null) {
        const title = match[1].trim();
        let desc = match[2].trim();
        
        // Clean up description - remove links but keep text
        desc = desc.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        // Remove bullet points formatting but keep content
        desc = desc.replace(/^-\s+/gm, '• ');
        // Limit length
        desc = desc.substring(0, 300);
        
        if (title && desc && !title.includes('Main Menu')) {
          sections.push({ title, description: desc });
        }
      }
      
      return sections.slice(0, 6); // Max 6 tiles
    };

    try {
      // STEP 1: Setup
      console.log('=== STEP 1: Setup ===');
      setImportStep('Step 1/18: Setup...');
      setImportProgress(1);
      setImportTotal(18);
      await wait(150);

      const title = parsedContent?.title || 'Import';
      const description = parsedContent?.description || '';
      const rawMarkdown = parsedContent?.rawMarkdown || '';
      console.log('=== Title:', title);

      // STEP 2: Get max segment ID
      console.log('=== STEP 2: Get max ID ===');
      setImportStep('Step 2/18: Get ID...');
      setImportProgress(2);
      await wait(150);

      const { data: maxData } = await supabase
        .from('segment_registry')
        .select('segment_id')
        .order('segment_id', { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextId = (maxData?.segment_id || 0) + 1;
      console.log('=== Next ID:', nextId);

      // STEP 3: Get main product image
      console.log('=== STEP 3: Get product image ===');
      setImportStep('Step 3/18: Product image...');
      setImportProgress(3);
      await wait(150);

      let heroImageUrl = '';
      const mainImage = parsedContent?.images?.[0];
      if (mainImage?.url) {
        try {
          const imgResponse = await fetch(mainImage.url);
          if (imgResponse.ok) {
            const blob = await imgResponse.blob();
            const ext = mainImage.url.split('.').pop()?.split('?')[0] || 'png';
            const fileName = `hero-${Date.now()}.${ext}`;
            const filePath = `${pageSlug}/product-hero/${fileName}`;
            
            const { error: uploadErr } = await supabase.storage
              .from('page-images')
              .upload(filePath, blob, { contentType: blob.type });
            
            if (!uploadErr) {
              const { data: urlData } = supabase.storage
                .from('page-images')
                .getPublicUrl(filePath);
              heroImageUrl = urlData.publicUrl;
              console.log('=== Hero image uploaded');
            }
          }
        } catch (imgErr) {
          console.warn('=== Hero image failed:', imgErr);
        }
      }

      // STEP 4: Create Product Hero Gallery segment
      console.log('=== STEP 4: Create Product Hero Gallery ===');
      setImportStep('Step 4/18: Product Hero Gallery...');
      setImportProgress(4);
      await wait(150);

      const productHeroSegment = {
        id: String(nextId),
        type: 'product-hero-gallery',
        data: {
          title: title.split('|')[0].trim(),
          subtitle: 'Illumination Device',
          category: 'Equipment',
          description: description.substring(0, 200),
          images: heroImageUrl ? [{ url: heroImageUrl, alt: title }] : [],
          badges: [],
        },
      };

      // STEP 5: Insert Product Hero to registry
      console.log('=== STEP 5: Insert Product Hero registry ===');
      setImportStep('Step 5/18: Save Product Hero registry...');
      setImportProgress(5);
      await wait(150);

      const { error: regErr0 } = await supabase
        .from('segment_registry')
        .insert({
          page_slug: pageSlug,
          segment_id: nextId,
          segment_key: `import-product-hero-${nextId}`,
          segment_type: 'product-hero-gallery',
          position: 0,
        });

      if (regErr0) throw new Error('Product Hero Registry: ' + regErr0.message);
      const productHeroId = nextId;
      nextId++;

      // STEP 6: Create Intro segment
      console.log('=== STEP 6: Create Intro segment ===');
      setImportStep('Step 6/18: Intro segment...');
      setImportProgress(6);
      await wait(150);

      const introSegment = {
        id: String(nextId),
        type: 'intro',
        data: {
          headline: title.split('|')[0].trim(),
          introText: description.substring(0, 300),
        },
      };

      // STEP 7: Insert Intro to registry
      console.log('=== STEP 7: Insert Intro registry ===');
      setImportStep('Step 7/18: Save Intro registry...');
      setImportProgress(7);
      await wait(150);

      const { error: regErr1 } = await supabase
        .from('segment_registry')
        .insert({
          page_slug: pageSlug,
          segment_id: nextId,
          segment_key: `import-intro-${nextId}`,
          segment_type: 'intro',
          position: 1,
        });

      if (regErr1) throw new Error('Intro Registry: ' + regErr1.message);
      const introId = nextId;
      nextId++;

      // STEP 8: Download image for Image-Text
      console.log('=== STEP 8: Download detail image ===');
      setImportStep('Step 8/18: Detail image...');
      setImportProgress(8);
      await wait(150);

      let detailImageUrl = '';
      const detailImage = parsedContent?.images?.[1] || parsedContent?.images?.[0];
      if (detailImage?.url && detailImage.url !== mainImage?.url) {
        try {
          const imgResponse = await fetch(detailImage.url);
          if (imgResponse.ok) {
            const blob = await imgResponse.blob();
            const ext = detailImage.url.split('.').pop()?.split('?')[0] || 'jpg';
            const fileName = `detail-${Date.now()}.${ext}`;
            const filePath = `${pageSlug}/image-text/${fileName}`;
            
            const { error: uploadErr } = await supabase.storage
              .from('page-images')
              .upload(filePath, blob, { contentType: blob.type });
            
            if (!uploadErr) {
              const { data: urlData } = supabase.storage
                .from('page-images')
                .getPublicUrl(filePath);
              detailImageUrl = urlData.publicUrl;
            }
          }
        } catch (imgErr) {
          console.warn('=== Detail image failed');
        }
      }

      // STEP 9: Create Image-Text segment
      console.log('=== STEP 9: Create Image-Text segment ===');
      setImportStep('Step 9/18: Image-Text segment...');
      setImportProgress(9);
      await wait(150);

      const imageTextSegment = {
        id: String(nextId),
        type: 'image-text',
        data: {
          title: 'Details',
          items: [
            {
              title: 'Overview',
              description: description.substring(0, 500) || 'Content imported from source.',
              imageUrl: detailImageUrl || heroImageUrl,
              metadata: { altText: title },
            }
          ],
        },
      };

      // STEP 10: Insert Image-Text to registry
      console.log('=== STEP 10: Insert Image-Text registry ===');
      setImportStep('Step 10/18: Save Image-Text registry...');
      setImportProgress(10);
      await wait(150);

      const { error: regErr2 } = await supabase
        .from('segment_registry')
        .insert({
          page_slug: pageSlug,
          segment_id: nextId,
          segment_key: `import-imagetext-${nextId}`,
          segment_type: 'image-text',
          position: 2,
        });

      if (regErr2) throw new Error('Image-Text Registry: ' + regErr2.message);
      const imageTextId = nextId;
      nextId++;

      // STEP 11: Extract real tiles from markdown sections
      console.log('=== STEP 11: Extract tiles from markdown ===');
      setImportStep('Step 11/18: Extract tiles...');
      setImportProgress(11);
      await wait(150);

      const extractedSections = extractSectionsFromMarkdown(rawMarkdown);
      console.log('=== Found sections:', extractedSections.length);

      // Map sections to tiles with icons
      const iconMapping = ['Zap', 'Target', 'Shield', 'Settings', 'Monitor', 'Camera'];
      const realTiles = extractedSections.length > 0 
        ? extractedSections.map((sec, idx) => ({
            title: sec.title,
            description: sec.description,
            icon: iconMapping[idx % iconMapping.length],
          }))
        : [
            { title: 'Feature 1', description: 'Key feature from the content.', icon: 'Zap' },
            { title: 'Feature 2', description: 'Another important aspect.', icon: 'Target' },
            { title: 'Feature 3', description: 'Additional capability.', icon: 'Shield' },
          ];

      // STEP 12: Create Tiles segment
      console.log('=== STEP 12: Create Tiles segment ===');
      setImportStep('Step 12/18: Tiles segment...');
      setImportProgress(12);
      await wait(150);

      const tilesSegment = {
        id: String(nextId),
        type: 'tiles',
        data: {
          title: 'Key Features',
          columns: String(Math.min(realTiles.length, 3)),
          items: realTiles,
        },
      };

      // STEP 13: Insert Tiles to registry
      console.log('=== STEP 13: Insert Tiles registry ===');
      setImportStep('Step 13/18: Save Tiles registry...');
      setImportProgress(13);
      await wait(150);

      const { error: regErr3 } = await supabase
        .from('segment_registry')
        .insert({
          page_slug: pageSlug,
          segment_id: nextId,
          segment_key: `import-tiles-${nextId}`,
          segment_type: 'tiles',
          position: 3,
        });

      if (regErr3) throw new Error('Tiles Registry: ' + regErr3.message);
      const tilesId = nextId;

      // STEP 14: Save page_segments
      console.log('=== STEP 14: Save page_segments ===');
      setImportStep('Step 14/18: Save segments...');
      setImportProgress(14);
      await wait(150);

      const allSegments = [productHeroSegment, introSegment, imageTextSegment, tilesSegment];
      
      const { error: segErr } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'page_segments',
          language,
          content_type: 'json',
          content_value: JSON.stringify(allSegments),
          content_status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'page_slug,section_key,language' });

      if (segErr) throw new Error('Segments: ' + segErr.message);

      // STEP 15: Save tab_order
      console.log('=== STEP 15: Save tab_order ===');
      setImportStep('Step 15/18: Tab order...');
      setImportProgress(15);
      await wait(150);

      await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'tab_order',
          language,
          content_type: 'json',
          content_value: JSON.stringify([String(productHeroId), String(introId), String(imageTextId), String(tilesId)]),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'page_slug,section_key,language' });

      // STEP 16: Save segment content entries
      console.log('=== STEP 16: Save segment content ===');
      setImportStep('Step 16/18: Segment content...');
      setImportProgress(16);
      await wait(150);

      // Product Hero content
      await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: `segment-${productHeroId}`,
          language,
          content_type: 'json',
          content_value: JSON.stringify(productHeroSegment.data),
          content_status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'page_slug,section_key,language' });

      // Intro content
      await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: `segment-${introId}`,
          language,
          content_type: 'json',
          content_value: JSON.stringify(introSegment.data),
          content_status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'page_slug,section_key,language' });

      // Image-Text content
      await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: `segment-${imageTextId}`,
          language,
          content_type: 'json',
          content_value: JSON.stringify(imageTextSegment.data),
          content_status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'page_slug,section_key,language' });

      // Tiles content
      await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: `segment-${tilesId}`,
          language,
          content_type: 'json',
          content_value: JSON.stringify(tilesSegment.data),
          content_status: 'pending',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'page_slug,section_key,language' });

      console.log('=== Segment content saved');

      // STEP 17: Complete
      console.log('=== STEP 17: Complete ===');
      setImportStep('Step 17/18: ✅ Done!');
      setImportProgress(17);
      await wait(400);

      const segmentCount = allSegments.length;
      const tileCount = realTiles.length;
      toast.success(`Import done! ${segmentCount} segments, ${tileCount} tiles created`);

      // STEP 18: Cleanup & Redirect
      console.log('=== STEP 18: Redirect ===');
      setImportStep('Step 18/18: Redirect...');
      setImportProgress(18);

      setIsImporting(false);
      setParsedContent(null);

      const url = `/${language}/${pageSlug}?edit=true`;
      console.log('=== URL:', url);
      window.location.href = url;

    } catch (err) {
      console.error('=== IMPORT ERROR ===', err);
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(msg);
      setImportStep('❌ ' + msg);
      setTimeout(() => {
        setIsImporting(false);
        setImportStep('');
      }, 5000);
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
          <div className="p-3 bg-[#8B0000] rounded-xl">
            <FirecrawlIcon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-white text-2xl font-bold tracking-tight">Content Automation</CardTitle>
              <Badge className="text-xs text-white border-0 bg-[#8B0000]">
                Powered by Firecrawl
              </Badge>
            </div>
            <CardDescription className="text-gray-300 text-base mt-1">
              Import content from external URLs and create segments automatically
            </CardDescription>
          </div>
        </div>
        
        {/* GLOBAL IMPORT PROGRESS BAR - ALWAYS visible when importing */}
        {isImporting && (
          <div className="mt-4 bg-gradient-to-r from-gray-800 to-gray-900 border border-[#f9dc24]/40 rounded-lg p-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Wand2 className="h-5 w-5 text-[#f9dc24] animate-pulse" />
                <span className="text-[#f9dc24] font-bold text-lg">Import in Progress</span>
              </div>
              <span className="text-white font-mono text-sm bg-gray-700 px-3 py-1 rounded">
                {importProgress}/{importTotal}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-4 mb-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#f9dc24] to-[#f5c800] h-4 rounded-full transition-all duration-300 ease-out"
                style={{ width: importTotal > 0 ? `${(importProgress / importTotal) * 100}%` : '0%' }}
              />
            </div>
            
            {/* Percentage */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-xs">Progress</span>
              <span className="text-white font-bold text-lg">
                {importTotal > 0 ? Math.round((importProgress / importTotal) * 100) : 0}%
              </span>
            </div>
            
            {/* Current Step Details */}
            <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Current Step:</p>
              <p className="text-white font-medium text-sm break-all">
                {importStep || 'Initializing...'}
              </p>
            </div>
            
            {/* Emergency Cancel Button */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-gray-500 text-xs flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Sequential processing...
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => {
                  console.log('[ContentAutomation] ⚠️ EMERGENCY CANCEL triggered by user');
                  setIsImporting(false);
                  setImportStep('');
                  setImportProgress(0);
                  setImportTotal(0);
                  toast.warning('Import cancelled', { description: 'Partial data may have been saved.' });
                }}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
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

        {/* Phase 1: URL Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f9dc24]/20 text-[#f9dc24] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-white font-semibold">Import Content</h3>
          </div>
          
          <div className="space-y-3 pl-10">
            <Label htmlFor="sourceUrl" className="text-white text-base flex items-center gap-2 font-medium">
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
                className="bg-gradient-to-r from-[#f9dc24] to-[#f5c800] text-black hover:from-[#f5c800] hover:to-[#f9dc24] font-semibold h-12 px-6 min-w-[180px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">{loadingStep || 'Loading...'}</span>
                  </div>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Fetch Content
                  </>
                )}
              </Button>
            </div>
            
            {/* Loading Progress Indicator */}
            {isLoading && (
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mt-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-4 border-gray-600 border-t-[#f9dc24] rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{loadingStep || 'Processing...'}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      This may take up to 2 minutes depending on page size and assets
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Redirect Status/Checkbox with Save Button */}
            <div className={`flex items-center gap-3 p-4 rounded-lg border mt-4 ${
              existingRedirectId 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-gray-700/50 border-gray-600'
            }`}>
              <Checkbox
                id="createRedirect"
                checked={createRedirect}
                onCheckedChange={(checked) => setCreateRedirect(checked === true)}
                disabled={!!existingRedirectId}
                className="border-gray-400 data-[state=checked]:bg-[#f9dc24] data-[state=checked]:border-[#f9dc24]"
              />
              <div className="flex-1">
                <Label htmlFor="createRedirect" className={`font-medium flex items-center gap-2 ${existingRedirectId ? 'cursor-default' : 'cursor-pointer'} ${existingRedirectId ? 'text-green-300' : 'text-white'}`}>
                  <Link2 className={`h-4 w-4 ${existingRedirectId ? 'text-green-400' : 'text-[#f9dc24]'}`} />
                  {existingRedirectId ? '301 Redirect Active' : 'Create 301 Redirect'}
                </Label>
                <p className="text-gray-400 text-sm mt-0.5">
                  {existingRedirectId 
                    ? 'A redirect from the source URL to this page is already configured'
                    : 'The source URL will be saved as a permanent redirect to the new page (SEO Settings)'
                  }
                </p>
              </div>
              {existingRedirectId ? (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              ) : (
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
              )}
            </div>
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

                  {/* Table (from specifications) */}
                  {parsedContent.specifications.length >= 3 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="table"
                          checked={selectedSegments.table}
                          onCheckedChange={() => toggleSegment('table')}
                        />
                        <Label htmlFor="table" className="text-white font-medium flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          Table Format ({parsedContent.specifications.length} rows)
                        </Label>
                        <Badge variant="outline" className="text-xs">table</Badge>
                      </div>
                      <div className="ml-6 p-3 bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-400">
                          Creates a structured table with Parameter/Value columns
                        </p>
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

              {/* Import Progress Indicator - DETAILED with step counter and progress bar */}
              {isImporting && (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-3 space-y-3">
                  {/* Header with animated icon */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-gray-600 border-t-[#f9dc24] rounded-full animate-spin"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Import in Progress</p>
                      <p className="text-gray-400 text-sm">
                        {importProgress > 0 && importTotal > 0 
                          ? `Step ${importProgress} of ${importTotal}` 
                          : 'Initializing...'}
                      </p>
                    </div>
                    {/* Percentage badge */}
                    {importTotal > 0 && (
                      <div className="bg-[#f9dc24] text-black font-bold px-3 py-1 rounded-full text-sm">
                        {Math.round((importProgress / importTotal) * 100)}%
                      </div>
                    )}
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-[#f9dc24] h-full transition-all duration-200 ease-out"
                      style={{ width: importTotal > 0 ? `${(importProgress / importTotal) * 100}%` : '0%' }}
                    />
                  </div>
                  
                  {/* Current step description */}
                  {importStep && (
                    <p className="text-gray-300 text-sm truncate">
                      {importStep}
                    </p>
                  )}
                </div>
              )}

              {/* Import & Open Frontend Button */}
              <Button
                onClick={handlePrepareForApproval}
                disabled={isImporting}
                className="w-full bg-[#f9dc24] hover:bg-[#f5c800] text-black h-12 text-lg font-semibold"
              >
                {isImporting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{importStep || 'Importing...'}</span>
                  </div>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Import &amp; Approve in Frontend
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Segments will be saved with pending status. You'll be redirected to the page in edit mode to review and approve each segment.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
