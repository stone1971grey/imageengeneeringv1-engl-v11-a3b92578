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
    default: 'https://www.image-engineering.de/products/equipment/illumination-devices/1388-octa-light-player',
    de: 'https://www.image-engineering.de/de/produkte/equipment/illumination-devices/1388-octa-light-player',
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

  // Handle preparing segments for approval (not saving yet)
  const handlePrepareForApproval = async () => {
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

      // === LOAD MEDIA FROM STORAGE FOLDER ===
      const storageBaseUrl = 'https://afrcagkprhtvvucukubf.supabase.co/storage/v1/object/public/page-images';
      const folderPath = pageSlug;
      
      // Fetch files from the product's media folder
      const { data: storageFiles } = await supabase
        .storage
        .from('page-images')
        .list(folderPath, { limit: 50, sortBy: { column: 'name', order: 'asc' } });
      
      // Separate images and PDFs from storage
      const storageImages: { url: string; title: string }[] = [];
      const storagePdfs: { url: string; title: string; filename: string }[] = [];
      
      if (storageFiles && storageFiles.length > 0) {
        for (const file of storageFiles) {
          if (file.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
            // Image file
            const imageUrl = `${storageBaseUrl}/${folderPath}/${file.name}`;
            const title = file.name
              .replace(/\.(png|jpg|jpeg|webp|gif)$/i, '')
              .replace(/[-_]/g, ' ')
              .replace(/dummy/gi, parsedContent.title || 'Product Image');
            storageImages.push({ url: imageUrl, title });
          } else if (file.name.match(/\.pdf$/i)) {
            // PDF file
            const pdfUrl = `${storageBaseUrl}/${folderPath}/${file.name}`;
            const title = file.name
              .replace(/\.pdf$/i, '')
              .replace(/[-_]/g, ' ')
              .replace(/([a-z])([A-Z])/g, '$1 $2');
            storagePdfs.push({ url: pdfUrl, title, filename: file.name });
          }
        }
      }
      
      console.log('[ContentAutomation] Found storage images:', storageImages.length);
      console.log('[ContentAutomation] Found storage PDFs:', storagePdfs.length);

      // === DOWNLOAD EXTERNAL FILES TO STORAGE ===
      // If no local images exist, download scraped images to storage
      const downloadedImages: { url: string; title: string }[] = [];
      const downloadedPdfs: { url: string; title: string; filename: string }[] = [];
      
      if (storageImages.length === 0 && parsedContent.images.length > 0) {
        console.log('[ContentAutomation] No local images, downloading external images...');
        for (let i = 0; i < Math.min(parsedContent.images.length, 6); i++) {
          const img = parsedContent.images[i];
          try {
            // Generate filename from URL or index
            const urlParts = img.url.split('/');
            let filename = urlParts[urlParts.length - 1].split('?')[0];
            if (!filename.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
              filename = `product-image-${i + 1}.jpg`;
            }
            filename = filename.replace(/[^a-zA-Z0-9.-]/g, '-');
            
            const targetPath = `${folderPath}/${filename}`;
            
            const { data: dlResult, error: dlError } = await supabase.functions.invoke('download-external-file', {
              body: { fileUrl: img.url, targetPath, bucketId: 'page-images' }
            });
            
            if (!dlError && dlResult?.success) {
              console.log(`[ContentAutomation] Downloaded image: ${filename}`);
              downloadedImages.push({
                url: dlResult.publicUrl,
                title: img.title || parsedContent.title || 'Product Image',
              });
            } else {
              console.warn(`[ContentAutomation] Failed to download image:`, dlError || dlResult?.error);
            }
          } catch (err) {
            console.warn(`[ContentAutomation] Error downloading image ${i}:`, err);
          }
        }
      }
      
      // Download external PDFs to storage
      if (storagePdfs.length === 0 && parsedContent.downloads.length > 0) {
        console.log('[ContentAutomation] No local PDFs, downloading external PDFs...');
        for (const dl of parsedContent.downloads.filter(d => d.url.toLowerCase().includes('.pdf'))) {
          try {
            const urlParts = dl.url.split('/');
            let filename = urlParts[urlParts.length - 1].split('?')[0];
            if (!filename.toLowerCase().endsWith('.pdf')) {
              filename = `${dl.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
            }
            filename = filename.replace(/[^a-zA-Z0-9.-]/g, '-');
            
            const targetPath = `${folderPath}/${filename}`;
            
            const { data: dlResult, error: dlError } = await supabase.functions.invoke('download-external-file', {
              body: { fileUrl: dl.url, targetPath, bucketId: 'page-images' }
            });
            
            if (!dlError && dlResult?.success) {
              console.log(`[ContentAutomation] Downloaded PDF: ${filename}`);
              downloadedPdfs.push({
                url: dlResult.publicUrl,
                title: dl.title,
                filename,
              });
            } else {
              console.warn(`[ContentAutomation] Failed to download PDF:`, dlError || dlResult?.error);
            }
          } catch (err) {
            console.warn(`[ContentAutomation] Error downloading PDF:`, err);
          }
        }
      }
      
      // Merge: use local files first, then downloaded files
      const finalImages = storageImages.length > 0 ? storageImages : downloadedImages;
      const finalPdfs = storagePdfs.length > 0 ? storagePdfs : downloadedPdfs;
      
      console.log('[ContentAutomation] Final images count:', finalImages.length);
      console.log('[ContentAutomation] Final PDFs count:', finalPdfs.length);

      // Filter downloads by language (include 'en' as fallback if current language has none)
      // Merge with storage/downloaded PDFs
      let filteredDownloads = parsedContent.downloads.filter(d => d.language === language);
      if (filteredDownloads.length === 0) {
        filteredDownloads = parsedContent.downloads.filter(d => d.language === 'en');
      }
      
      // Add local/downloaded PDFs to downloads (they take priority)
      const localDownloads: { title: string; description: string; url: string; language: typeof language }[] = finalPdfs.map(pdf => ({
        title: pdf.title,
        description: getDownloadDescriptionFromTitle(pdf.title, language),
        url: pdf.url,
        language: language,
      }));
      
      // Combine: local PDFs first, then scraped downloads (avoiding duplicates)
      const allDownloads: { title: string; description: string; url: string; language: typeof language }[] = [...localDownloads];
      for (const dl of filteredDownloads) {
        if (!allDownloads.some(d => d.url === dl.url)) {
          allDownloads.push({ ...dl, language: dl.language as typeof language });
        }
      }

      // Build concise, clean description (max 2-3 sentences, no markdown artifacts)
      const buildCleanDescription = () => {
        // Get first meaningful paragraph from description
        const cleanDesc = parsedContent.description
          .replace(/\n+/g, ' ')  // Replace newlines with spaces
          .replace(/\s+/g, ' ')  // Normalize whitespace
          .replace(/[#*_`]/g, '') // Remove markdown formatting
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove link formatting
          .trim();
        
        // Split into sentences and take first 2-3
        const sentences = cleanDesc.match(/[^.!?]+[.!?]+/g) || [cleanDesc];
        const result = sentences.slice(0, 2).join(' ').trim();
        
        // Ensure max ~200 chars for hero
        if (result.length > 250) {
          return result.substring(0, 247) + '...';
        }
        return result || (language === 'de' ? 'Professionelle Lösung für Ihre Anforderungen.' : 'Professional solution for your requirements.');
      };

      // 1. Product Hero Gallery (with concise description and proper image format)
      // PRIORITY: Use storage images first, then fall back to scraped images
      if (selectedSegments.productHero && !existingSegmentTypes.has('product-hero-gallery')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-hero-${segId}`,
          segment_type: 'product-hero-gallery',
          position: position++,
        });
        
        // Use finalImages (local or downloaded from external source)
        const cleanTitle = parsedContent.title.replace(/[*#_`]/g, '').trim();
        let heroImages: { imageUrl: string; title: string; description: string; maxWidth: number | null; maxHeight: number | null }[] = [];
        
        if (finalImages.length > 0) {
          // Use images from storage (local or downloaded)
          heroImages = finalImages.slice(0, 4).map((img, idx) => ({
            imageUrl: img.url,
            title: img.title || (idx === 0 ? cleanTitle : `${cleanTitle} - View ${idx + 1}`),
            description: '',
            maxWidth: null,
            maxHeight: null,
          }));
          console.log('[ContentAutomation] Using final images for hero:', heroImages.length);
        } else {
          // Fall back to scraped images (external URLs - not downloaded)
          heroImages = parsedContent.images.slice(0, 4).map((img, idx) => ({
            imageUrl: img.url,
            title: img.title || (idx === 0 ? cleanTitle : `${cleanTitle} - View ${idx + 1}`),
            description: '',
            maxWidth: null,
            maxHeight: null,
          }));
          console.log('[ContentAutomation] Using external scraped images for hero:', heroImages.length);
        }
        
        // If still no images, add placeholder
        if (heroImages.length === 0) {
          heroImages.push({
            imageUrl: '/placeholder.svg',
            title: cleanTitle,
            description: '',
            maxWidth: null,
            maxHeight: null,
          });
        }
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'product-hero-gallery',
          data: {
            title: parsedContent.title.replace(/[*#_`]/g, '').trim(),
            subtitle: (parsedContent.subtitle || (language === 'de' ? 'Professionelle Lösung' : 'Professional Solution')).replace(/[*#_`]/g, '').trim(),
            description: buildCleanDescription(),
            imagePosition: 'right',
            layoutRatio: '2-5',
            topSpacing: 'small',
            cta1Text: language === 'de' ? 'Kontakt aufnehmen' : 'Contact Sales',
            cta1Link: '/contact',
            cta1Style: 'standard',
            cta2Text: language === 'de' ? 'Spezifikationen' : 'View Specifications',
            cta2Link: '#specifications',
            cta2Style: 'outline-white',
            images: heroImages,
            imageMaxWidth: null,
            imageMaxHeight: null,
          },
          position: position - 1,
        });
      }

      // 2. Intro with comprehensive content (description + benefits) - CLEAN HTML
      if (selectedSegments.intro && !existingSegmentTypes.has('intro')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-intro-${segId}`,
          segment_type: 'intro',
          position: position++,
        });
        
        // Helper to clean text from markdown artifacts
        const cleanText = (text: string): string => {
          return text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove link formatting
            .replace(/\*\*([^*]+)\*\*/g, '$1')        // Remove bold
            .replace(/\*([^*]+)\*/g, '$1')            // Remove italic
            .replace(/`([^`]+)`/g, '$1')              // Remove code
            .replace(/[#*_`]/g, '')                   // Remove remaining markdown chars
            .replace(/\n{3,}/g, '\n\n')               // Max 2 newlines
            .trim();
        };
        
        // Build COMPLETE intro HTML - include ALL paragraphs from description
        const allParagraphs = cleanText(parsedContent.description)
          .split(/\n\n+/)
          .filter(p => p.trim().length > 20)
          .map(p => `<p>${p.trim()}</p>`)
          .join('');
        
        // Add ALL benefits as a clean list (no limit)
        let benefitsHtml = '';
        if (parsedContent.benefits.length > 0) {
          const cleanBenefits = parsedContent.benefits
            .map(b => cleanText(b))
            .filter(b => b.length > 10 && b.length < 300);
          
          if (cleanBenefits.length > 0) {
            benefitsHtml = '<h3>' + (language === 'de' ? 'Hauptvorteile' : 'Key Benefits') + '</h3>';
            benefitsHtml += '<ul>' + cleanBenefits.map(b => `<li>${b}</li>`).join('') + '</ul>';
          }
        }
        
        const cleanTitle = cleanText(parsedContent.title);
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'intro',
          data: {
            headline: cleanTitle,
            headingLevel: 'h2',  // h2 since Hero already has h1
            introText: allParagraphs + benefitsHtml || `<p>${language === 'de' ? 'Professionelle Lösung für Ihre Anforderungen.' : 'Professional solution for your requirements.'}</p>`,
            alignment: 'left',
            showDivider: true,
          },
          position: position - 1,
        });
      }

      // 3. Specifications Table - clean values
      if (selectedSegments.specification && parsedContent.specifications.length > 0 && !existingSegmentTypes.has('specification')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-specs-${segId}`,
          segment_type: 'specification',
          position: position++,
        });
        
        // Clean specification values from markdown artifacts - NO LIMIT
        const cleanSpecs = parsedContent.specifications
          .map(s => ({
            specification: s.name.replace(/[*#_`\[\]]/g, '').trim(),
            value: s.value.replace(/[*#_`\[\]]/g, '').replace(/\([^)]*\)/g, '').trim(),
          }))
          .filter(s => s.specification.length > 1 && s.value.length > 0);
        
        const cleanTitle = parsedContent.title.replace(/[*#_`]/g, '').trim();
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'specification',
          data: {
            title: language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications',
            rows: cleanSpecs,
            description: language === 'de' 
              ? `Detaillierte technische Daten für ${cleanTitle}.`
              : `Detailed technical specifications for ${cleanTitle}.`,
          },
          position: position - 1,
        });
      }

      // 3b. Table Segment - structured table format from specifications
      if (selectedSegments.table && parsedContent.specifications.length >= 3 && !existingSegmentTypes.has('table')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-table-${segId}`,
          segment_type: 'table',
          position: position++,
        });
        
        // Convert specs to table format with headers
        const cleanSpecs = parsedContent.specifications
          .map(s => ({
            name: s.name.replace(/[*#_`\[\]]/g, '').trim(),
            value: s.value.replace(/[*#_`\[\]]/g, '').trim(),
          }))
          .filter(s => s.name.length > 1 && s.value.length > 0);
        
        // Build table data: 2 columns (Parameter, Value)
        const headers = [
          language === 'de' ? 'Parameter' : 'Parameter',
          language === 'de' ? 'Wert' : 'Value'
        ];
        const rows = cleanSpecs.map(s => [s.name, s.value]);
        
        const cleanTitle = parsedContent.title.replace(/[*#_`]/g, '').trim();
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'table',
          data: {
            title: language === 'de' ? 'Spezifikationen' : 'Specifications',
            subtext: language === 'de' 
              ? `Technische Daten für ${cleanTitle}`
              : `Technical data for ${cleanTitle}`,
            headers,
            rows,
          },
          position: position - 1,
        });
      }

      // 4. Feature Overview (Use Cases / Applications) - cleaned
      if (selectedSegments.featureOverview && parsedContent.useCases.length > 0 && !existingSegmentTypes.has('feature-overview')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-features-${segId}`,
          segment_type: 'feature-overview',
          position: position++,
        });
        
        // Clean and prepare feature items
        const cleanFeatureText = (text: string): string => {
          return text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/[*#_`\[\]]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        };
        
        let featureItems = parsedContent.useCases.slice(0, 6).map(uc => ({
          title: cleanFeatureText(uc.title).substring(0, 80),
          description: cleanFeatureText(uc.description).substring(0, 250),
        }));
        
        // If we have fewer than 3, add from benefits
        while (featureItems.length < 3 && parsedContent.benefits.length > featureItems.length) {
          const benefit = cleanFeatureText(parsedContent.benefits[featureItems.length]);
          if (benefit.length > 20) {
            const words = benefit.split(' ');
            featureItems.push({
              title: words.slice(0, 4).join(' '),
              description: benefit,
            });
          }
        }
        
        const cleanTitle = parsedContent.title.replace(/[*#_`]/g, '').trim();
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'feature-overview',
          data: {
            title: language === 'de' ? 'Anwendungen & Features' : 'Applications & Features',
            subtext: language === 'de' 
              ? `Entdecken Sie die vielfältigen Einsatzmöglichkeiten von ${cleanTitle}.`
              : `Discover the versatile applications of ${cleanTitle}.`,
            layout: String(Math.min(featureItems.length, 3)),
            rows: String(Math.ceil(featureItems.length / 3)),
            items: featureItems,
          },
          position: position - 1,
        });
      }

      // 5. Downloads (Tiles) - USE allDownloads (storage PDFs + scraped)
      if (selectedSegments.downloads && allDownloads.length > 0 && !existingSegmentTypes.has('tiles')) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-downloads-${segId}`,
          segment_type: 'tiles',
          position: position++,
        });
        
        const cleanedDownloads = allDownloads.slice(0, 6).map(d => ({
          title: d.title.replace(/[*#_`\[\]]/g, '').replace(/[-_]/g, ' ').trim().substring(0, 60),
          description: (d.description || (language === 'de' ? 'Produktdokumentation' : 'Product documentation')).substring(0, 120),
          icon: 'FileText',
          ctaText: language === 'de' ? 'PDF herunterladen' : 'Download PDF',
          ctaLink: d.url,
          showButton: true,
        }));
        
        console.log('[ContentAutomation] Downloads tiles using:', cleanedDownloads.length, 'items');
        
        newSegments.push({
          id: String(segId),
          segmentId: String(segId),
          type: 'tiles',
          data: {
            title: language === 'de' ? 'Dokumentation & Downloads' : 'Documentation & Downloads',
            columns: String(Math.min(cleanedDownloads.length, 3)),
            items: cleanedDownloads,
          },
          position: position - 1,
        });
      }

      // 6. FAQ Segment (generated from benefits and use cases) - cleaned
      if (!existingSegmentTypes.has('faq') && (parsedContent.benefits.length >= 2 || parsedContent.useCases.length >= 2)) {
        const segId = nextSegmentId++;
        newRegistryEntries.push({
          page_slug: pageSlug,
          segment_id: segId,
          segment_key: `content-auto-faq-${segId}`,
          segment_type: 'faq',
          position: position++,
        });
        
        // Helper to clean FAQ text
        const cleanFaqText = (text: string): string => {
          return text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/[*#_`\[\]]/g, '')
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };
        
        const cleanTitle = cleanFaqText(parsedContent.title);
        const cleanDescription = cleanFaqText(parsedContent.description);
        
        // Generate FAQs from content
        const faqItems: { question: string; answer: string }[] = [];
        
        // Q1: What is this product?
        faqItems.push({
          question: language === 'de' 
            ? `Was ist ${cleanTitle}?` 
            : `What is ${cleanTitle}?`,
          answer: cleanDescription.substring(0, 400) || (language === 'de' 
            ? `${cleanTitle} ist ein professionelles Produkt von Image Engineering.`
            : `${cleanTitle} is a professional product from Image Engineering.`),
        });
        
        // Q2: What are the main benefits?
        if (parsedContent.benefits.length > 0) {
          const cleanBenefits = parsedContent.benefits.slice(0, 3).map(b => cleanFaqText(b));
          faqItems.push({
            question: language === 'de' 
              ? `Welche Vorteile bietet ${cleanTitle}?`
              : `What are the benefits of ${cleanTitle}?`,
            answer: cleanBenefits.join('. ') + '.',
          });
        }
        
        // Q3: From use cases
        if (parsedContent.useCases.length > 0) {
          const cleanUseCases = parsedContent.useCases.slice(0, 2).map(uc => 
            `${cleanFaqText(uc.title)}: ${cleanFaqText(uc.description).substring(0, 100)}`
          );
          faqItems.push({
            question: language === 'de'
              ? `Welche Anwendungsbereiche gibt es?`
              : `What are the typical applications?`,
            answer: cleanUseCases.join(' '),
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
              ? `Häufige Fragen zu ${cleanTitle}`
              : `Frequently Asked Questions about ${cleanTitle}`,
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

      // NOTE: Banner-P segment removed - does not exist in the system

      if (newSegments.length === 0) {
        toast.info('No new segments to import (segments already exist or none selected)');
        setIsImporting(false);
        return;
      }

      // === FRONTEND APPROVAL WORKFLOW ===
      // Save segments directly to database with 'pending' status
      // Then redirect to frontend for in-context approval

      // 1. Insert segment registry entries
      const { error: registryError } = await supabase
        .from('segment_registry')
        .insert(newRegistryEntries);

      if (registryError) throw registryError;

      // 2. Load existing page_content for merging
      const { data: existingContent } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      let existingSegments: any[] = [];
      if (existingContent?.content_value) {
        existingSegments = JSON.parse(existingContent.content_value);
      }

      // Merge new segments
      const mergedSegments = [...existingSegments, ...newSegments];

      // 3. Update tab_order
      const { data: tabOrderData } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'tab_order')
        .eq('language', language)
        .maybeSingle();

      let tabOrder: string[] = [];
      if (tabOrderData?.content_value) {
        tabOrder = JSON.parse(tabOrderData.content_value);
      }
      const newTabOrder = [...tabOrder, ...newSegments.map((s: any) => s.id)];

      // 4. Save page_segments with 'pending' content_status
      const { error: contentError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: pageSlug,
          section_key: 'page_segments',
          language,
          content_type: 'json',
          content_value: JSON.stringify(mergedSegments),
          content_status: 'pending',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,language',
        });

      if (contentError) throw contentError;

      // 5. Save tab_order
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

      // 6. Save individual segment content with 'pending' status for each new segment
      for (const seg of newSegments) {
        const segmentKey = `segment-${seg.id}`;
        await supabase
          .from('page_content')
          .upsert({
            page_slug: pageSlug,
            section_key: segmentKey,
            language,
            content_type: 'json',
            content_value: JSON.stringify(seg.data),
            content_status: 'pending',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'page_slug,section_key,language',
          });
      }

      // 7. Save 301 redirect if checkbox is checked
      if (createRedirect && sourceUrl) {
        const targetUrl = `/${language}/${pageSlug}`;
        let sourceUrlPath = sourceUrl;
        try {
          const urlObj = new URL(sourceUrl);
          sourceUrlPath = urlObj.pathname;
        } catch {
          // Already a path
        }

        await supabase
          .from('redirects')
          .insert({
            source_url: sourceUrlPath,
            target_url: targetUrl,
            redirect_type: 301,
            is_active: true,
            notes: `Content Automation for page "${pageSlug}" [${language.toUpperCase()}] | Source: ${sourceUrl}`,
          });
      }

      toast.success(`${newSegments.length} segments imported with pending status!`, {
        description: 'Redirecting to frontend for approval...',
      });

      // 8. Redirect to frontend for in-context approval
      const frontendUrl = `/${language}/${pageSlug}?edit=true`;
      
      if (onRedirectToFrontend) {
        onRedirectToFrontend(frontendUrl);
      } else {
        // Fallback: open in new tab if no callback provided
        window.open(frontendUrl, '_blank');
      }

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

              {/* Import & Open Frontend Button */}
              <Button
                onClick={handlePrepareForApproval}
                disabled={isImporting}
                className="w-full bg-[#f9dc24] hover:bg-[#f5c800] text-black h-12 text-lg font-semibold"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Importing Segments...
                  </>
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
