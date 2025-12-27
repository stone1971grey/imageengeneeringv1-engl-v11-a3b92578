import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { GeminiIcon } from '@/components/GeminiIcon';
import { FirecrawlIcon } from '@/components/FirecrawlIcon';
import { 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Loader2,
  Globe,
  ListPlus,
  MessageSquarePlus,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Eye,
  ArrowLeft,
  AlertTriangle,
  Layers,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock
} from 'lucide-react';

interface RefineWithAIDialogProps {
  pageSlug: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onRefineComplete?: () => void;
  variant?: 'button' | 'compact' | 'inline';
  className?: string;
}

// Content block with target segment assignment
interface ContentBlock {
  id: string;
  type: 'description' | 'technical' | 'benefits' | 'use-cases' | 'notes' | 'specifications';
  content: string;
  suggestedSegment: TargetSegment;
  alternativeSegments: TargetSegment[];
  selectedSegment: TargetSegment;
  accepted: boolean;
  isNew: boolean; // true if segment needs to be created
}

// Applied result for success view
interface AppliedResult {
  blockType: string;
  segmentKey: string;
  segmentType: string;
  isNew: boolean;
  contentPreview: string;
}

interface TargetSegment {
  type: 'intro' | 'feature-overview' | 'specification' | 'faq' | 'banner-p' | 'skip';
  segmentKey?: string; // existing segment key if updating
  label: string;
}

interface RefineOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'fetch' | 'enhance';
}

const REFINE_OPTIONS: RefineOption[] = [
  {
    id: 'refetch-content',
    label: 'Fetch Additional Content',
    description: 'Re-scrape the original source page to extract more content',
    icon: <Globe className="h-5 w-5" />,
    category: 'fetch',
  },
  {
    id: 'add-segments',
    label: 'Suggest New Segments',
    description: 'AI analyzes content and proposes suitable segment types to add',
    icon: <ListPlus className="h-5 w-5" />,
    category: 'enhance',
  },
  {
    id: 'expand-texts',
    label: 'Expand Existing Texts',
    description: 'Enrich current texts with AI-generated additional information',
    icon: <MessageSquarePlus className="h-5 w-5" />,
    category: 'enhance',
  },
  {
    id: 'generate-faq',
    label: 'Generate FAQs',
    description: 'Create frequently asked questions from existing page content',
    icon: <Lightbulb className="h-5 w-5" />,
    category: 'enhance',
  },
  {
    id: 'seo-optimize',
    label: 'Optimize SEO',
    description: 'Improve meta descriptions and headlines for search engines',
    icon: <FileText className="h-5 w-5" />,
    category: 'enhance',
  },
];

// Segment type options for user selection
const SEGMENT_OPTIONS: TargetSegment[] = [
  { type: 'intro', label: 'Intro Segment (Beschreibungstext)' },
  { type: 'feature-overview', label: 'Feature Overview (Benefits/Features)' },
  { type: 'specification', label: 'Specification (Technische Details)' },
  { type: 'banner-p', label: 'Banner (Hinweis/Info-Box)' },
  { type: 'faq', label: 'FAQ (Frage & Antwort)' },
  { type: 'skip', label: '⏭️ Überspringen' },
];

export const RefineWithAIDialog = ({ 
  pageSlug, 
  language, 
  onRefineComplete,
  variant = 'button',
  className = ''
}: RefineWithAIDialogProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [isLoadingSourceUrl, setIsLoadingSourceUrl] = useState(false);
  
  // NEW: Content blocks with segment assignment
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [showBlockPreview, setShowBlockPreview] = useState(false);
  const [existingSegments, setExistingSegments] = useState<{key: string, type: string}[]>([]);
  
  const [isApplying, setIsApplying] = useState(false);
  const [expandedBlocks, setExpandedBlocks] = useState<string[]>([]);
  
  // NEW: Success view state
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [appliedResults, setAppliedResults] = useState<AppliedResult[]>([]);

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const toggleBlockExpanded = (blockId: string) => {
    setExpandedBlocks(prev =>
      prev.includes(blockId)
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const toggleBlockAccepted = (blockId: string) => {
    setContentBlocks(prev =>
      prev.map(b => b.id === blockId ? { ...b, accepted: !b.accepted } : b)
    );
  };

  const updateBlockSegment = (blockId: string, segmentType: string) => {
    const segment = SEGMENT_OPTIONS.find(s => s.type === segmentType);
    if (!segment) return;
    
    // Check if there's an existing segment of this type
    const existingSegment = existingSegments.find(s => s.type === segmentType);
    
    setContentBlocks(prev =>
      prev.map(b => b.id === blockId ? { 
        ...b, 
        selectedSegment: {
          ...segment,
          segmentKey: existingSegment?.key
        },
        isNew: !existingSegment && segmentType !== 'skip'
      } : b)
    );
  };

  const acceptAllBlocks = () => {
    setContentBlocks(prev => prev.map(b => ({ ...b, accepted: b.selectedSegment.type !== 'skip' })));
  };

  const rejectAllBlocks = () => {
    setContentBlocks(prev => prev.map(b => ({ ...b, accepted: false })));
  };

  // Load existing segments for this page
  const loadExistingSegments = async () => {
    const { data: segments } = await supabase
      .from('segment_registry')
      .select('segment_key, segment_type')
      .eq('page_slug', pageSlug)
      .eq('deleted', false);
    
    if (segments) {
      setExistingSegments(segments.map(s => ({ key: s.segment_key, type: s.segment_type })));
    }
  };

  // Intelligent text segmentation using AI
  const segmentTextWithAI = async (rawText: string): Promise<ContentBlock[]> => {
    console.log('[RefineWithAI] Segmenting text with AI, length:', rawText.length);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-cluster-content', {
        body: {
          type: 'segment-text',
          pageSlug,
          language,
          content: rawText,
          prompt: `Analysiere den folgenden Text und teile ihn in logische Inhaltsblöcke auf.
          
WICHTIG: Jeder Block soll einem dieser Typen zugeordnet werden:
- "description": Allgemeine Produktbeschreibung, Einleitung
- "technical": Technische Details, Spezifikationen, Messwerte
- "benefits": Vorteile, Features, Highlights
- "use-cases": Anwendungsfälle, Einsatzgebiete
- "notes": Hinweise, Disclaimers, Kontaktinfos (oft am Ende)
- "specifications": Zahlen, Daten, technische Parameter

REGELN:
1. Trenne den Text an logischen Stellen (Themenwechsel)
2. Jeder Block sollte 1-3 Absätze enthalten
3. "notes" Blöcke mit Kontaktinfos oder "*" Hinweisen sollten übersprungen werden
4. Behalte den EXAKTEN Originaltext, keine Umformulierungen!

Antworte im JSON-Format:
{
  "blocks": [
    { "type": "description", "content": "Exakter Originaltext...", "shouldSkip": false },
    { "type": "technical", "content": "Exakter Originaltext...", "shouldSkip": false },
    { "type": "notes", "content": "Kontaktinfo...", "shouldSkip": true }
  ]
}

TEXT ZUM ANALYSIEREN:
${rawText}`
        }
      });

      if (error) {
        console.error('[RefineWithAI] AI segmentation error:', error);
        // Fallback: treat entire text as one block
        return [{
          id: `block-${Date.now()}`,
          type: 'description',
          content: rawText,
          suggestedSegment: { type: 'intro', label: 'Intro Segment' },
          alternativeSegments: SEGMENT_OPTIONS.filter(s => s.type !== 'intro'),
          selectedSegment: { type: 'intro', label: 'Intro Segment' },
          accepted: true,
          isNew: false
        }];
      }

      if (!data?.blocks || !Array.isArray(data.blocks)) {
        console.log('[RefineWithAI] No blocks returned from AI');
        return [];
      }

      // Map AI blocks to ContentBlocks with segment suggestions
      const blocks: ContentBlock[] = data.blocks
        .filter((b: any) => !b.shouldSkip && b.content?.trim().length > 20)
        .map((block: any, index: number) => {
          // Suggest segment based on block type
          let suggestedSegment: TargetSegment;
          let alternativeSegments: TargetSegment[];
          
          switch (block.type) {
            case 'description':
              suggestedSegment = { type: 'intro', label: 'Intro Segment (Beschreibungstext)' };
              alternativeSegments = SEGMENT_OPTIONS.filter(s => s.type !== 'intro');
              break;
            case 'technical':
            case 'specifications':
              suggestedSegment = { type: 'specification', label: 'Specification (Technische Details)' };
              alternativeSegments = SEGMENT_OPTIONS.filter(s => s.type !== 'specification');
              break;
            case 'benefits':
              suggestedSegment = { type: 'feature-overview', label: 'Feature Overview (Benefits/Features)' };
              alternativeSegments = SEGMENT_OPTIONS.filter(s => s.type !== 'feature-overview');
              break;
            case 'use-cases':
              suggestedSegment = { type: 'feature-overview', label: 'Feature Overview (Benefits/Features)' };
              alternativeSegments = SEGMENT_OPTIONS.filter(s => s.type !== 'feature-overview');
              break;
            case 'notes':
              suggestedSegment = { type: 'skip', label: '⏭️ Überspringen' };
              alternativeSegments = SEGMENT_OPTIONS.filter(s => s.type !== 'skip');
              break;
            default:
              suggestedSegment = { type: 'intro', label: 'Intro Segment' };
              alternativeSegments = SEGMENT_OPTIONS.filter(s => s.type !== 'intro');
          }

          // Check if segment already exists
          const existingSegment = existingSegments.find(s => s.type === suggestedSegment.type);
          
          return {
            id: `block-${Date.now()}-${index}`,
            type: block.type as ContentBlock['type'],
            content: block.content,
            suggestedSegment,
            alternativeSegments,
            selectedSegment: {
              ...suggestedSegment,
              segmentKey: existingSegment?.key
            },
            accepted: suggestedSegment.type !== 'skip',
            isNew: !existingSegment && suggestedSegment.type !== 'skip'
          };
        });

      console.log('[RefineWithAI] Created', blocks.length, 'content blocks');
      return blocks;

    } catch (error) {
      console.error('[RefineWithAI] Segmentation failed:', error);
      return [];
    }
  };

  // Extract new text content from source
  const fetchAndAnalyzeContent = async (): Promise<ContentBlock[]> => {
    // Load existing content for comparison
    const { data: existingContent } = await supabase
      .from('page_content')
      .select('section_key, content_value, content_type')
      .eq('page_slug', pageSlug)
      .eq('language', language);

    // Extract all existing text for comparison
    let existingText = '';
    if (existingContent) {
      for (const item of existingContent) {
        try {
          const parsed = JSON.parse(item.content_value);
          if (parsed.description) existingText += ' ' + parsed.description;
          if (parsed.text) existingText += ' ' + parsed.text;
          if (parsed.introText) existingText += ' ' + parsed.introText;
        } catch {
          if (item.content_type === 'text') existingText += ' ' + item.content_value;
        }
      }
    }
    existingText = existingText.toLowerCase().trim();

    // Find source URL
    const productName = pageSlug.split('/').pop();
    let sourceUrlToFetch = sourceUrl;
    
    if (!sourceUrlToFetch) {
      const { data: redirect } = await supabase
        .from('redirects')
        .select('source_url')
        .ilike('target_url', `%${productName}%`)
        .maybeSingle();
      
      if (redirect?.source_url) {
        sourceUrlToFetch = redirect.source_url.startsWith('http')
          ? redirect.source_url
          : `https://www.image-engineering.de${redirect.source_url}`;
      }
    }

    if (!sourceUrlToFetch) {
      toast.error('Keine Source-URL gefunden', {
        description: 'Diese Seite hat keine verknüpfte Ursprungsseite.'
      });
      return [];
    }

    console.log('[RefineWithAI] Fetching from:', sourceUrlToFetch);

    // Fetch content from source
    const { data, error } = await supabase.functions.invoke('fetch-external-content', {
      body: { url: sourceUrlToFetch }
    });

    if (error || !data?.data) {
      console.error('[RefineWithAI] Fetch error:', error);
      toast.error('Fehler beim Laden der Quelldaten');
      return [];
    }

    const fetchedData = data.data;
    console.log('[RefineWithAI] Fetched description length:', fetchedData.description?.length || 0);

    // Extract only NEW text that isn't already on the page
    if (!fetchedData.description || fetchedData.description.length < 50) {
      toast.info('Kein neuer Textinhalt gefunden');
      return [];
    }

    // Split into phrases and find truly new content
    const fetchedPhrases = fetchedData.description
      .split(/[.!?]\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 30);

    const existingPhrases = existingText
      .split(/[.!?]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    // Find sentences that don't exist yet
    const newPhrases = fetchedPhrases.filter((phrase: string) => {
      const normalizedPhrase = phrase.toLowerCase();
      return !existingPhrases.some(existing => 
        existing.includes(normalizedPhrase.substring(0, 30)) ||
        normalizedPhrase.includes(existing.substring(0, 30))
      );
    });

    if (newPhrases.length === 0) {
      toast.info('Alle Textinhalte sind bereits vorhanden');
      return [];
    }

    // Combine new phrases back into text
    const newTextContent = newPhrases.join('. ');
    console.log('[RefineWithAI] New text content length:', newTextContent.length);
    console.log('[RefineWithAI] New phrases:', newPhrases.length, 'of', fetchedPhrases.length);

    // Use AI to segment the new text into logical blocks
    return await segmentTextWithAI(newTextContent);
  };

  // Generate preview with block segmentation
  const handleGeneratePreview = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Bitte wähle mindestens eine Option');
      return;
    }

    setIsProcessing(true);
    setContentBlocks([]);
    
    try {
      // Load existing segments first
      await loadExistingSegments();

      // Process "Fetch Additional Content" option
      if (selectedOptions.includes('refetch-content')) {
        setProcessingStep('Analysiere Quelldaten...');
        const blocks = await fetchAndAnalyzeContent();
        
        if (blocks.length > 0) {
          setContentBlocks(blocks);
          setExpandedBlocks(blocks.slice(0, 2).map(b => b.id));
          setShowBlockPreview(true);
        }
      }
      
      // TODO: Handle other options (add-segments, expand-texts, etc.)
      
    } catch (error) {
      console.error('Preview generation error:', error);
      toast.error('Fehler bei der Vorschau-Generierung', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  // Apply accepted content blocks to their target segments
  const handleApplyBlocks = async () => {
    const acceptedBlocks = contentBlocks.filter(b => b.accepted && b.selectedSegment.type !== 'skip');
    
    if (acceptedBlocks.length === 0) {
      toast.error('Keine Änderungen ausgewählt');
      return;
    }

    setIsApplying(true);
    const results: AppliedResult[] = [];

    try {
      for (const block of acceptedBlocks) {
        const segmentType = block.selectedSegment.type;
        let segmentKey = block.selectedSegment.segmentKey;
        let isNewSegment = false;
        
        console.log('[RefineWithAI] Applying block to:', segmentType, segmentKey || '(new)');

        if (segmentKey) {
          // UPDATE existing segment - APPEND to existing content
          const { data: existing } = await supabase
            .from('page_content')
            .select('content_value')
            .eq('page_slug', pageSlug)
            .eq('section_key', segmentKey)
            .eq('language', language)
            .maybeSingle();

          if (existing) {
            let updatedValue = existing.content_value;
            try {
              const parsed = JSON.parse(existing.content_value);
              
              // Append to the appropriate field based on segment type
              if (segmentType === 'intro') {
                if (parsed.introText) {
                  parsed.introText = parsed.introText + '\n\n' + block.content;
                } else if (parsed.description) {
                  parsed.description = parsed.description + '\n\n' + block.content;
                } else if (parsed.text) {
                  parsed.text = parsed.text + '\n\n' + block.content;
                } else {
                  parsed.description = block.content;
                }
              } else if (segmentType === 'feature-overview') {
                // Add as new benefit item
                if (!parsed.items) parsed.items = [];
                parsed.items.push({
                  headline: 'Zusätzliche Information',
                  text: block.content,
                  icon: 'Info'
                });
              } else if (segmentType === 'specification') {
                // Add to description or as new row
                if (parsed.description) {
                  parsed.description = parsed.description + '\n\n' + block.content;
                } else {
                  parsed.description = block.content;
                }
              }
              
              updatedValue = JSON.stringify(parsed);
            } catch {
              // Plain text: append
              updatedValue = existing.content_value + '\n\n' + block.content;
            }

            await supabase
              .from('page_content')
              .update({ 
                content_value: updatedValue,
                content_status: 'pending',
                import_stage: 2,
                draft_value: updatedValue
              })
              .eq('page_slug', pageSlug)
              .eq('section_key', segmentKey)
              .eq('language', language);
              
            console.log('[RefineWithAI] Updated segment with pending status:', segmentKey);
          }
        } else if (block.isNew) {
          // CREATE new segment
          isNewSegment = true;
          const { data: maxIdData } = await supabase
            .from('segment_registry')
            .select('segment_id')
            .order('segment_id', { ascending: false })
            .limit(1)
            .single();

          const nextSegmentId = (maxIdData?.segment_id || 0) + 1;
          segmentKey = `${segmentType}-${nextSegmentId}`;

          // Get max position for this page
          const { data: maxPosData } = await supabase
            .from('segment_registry')
            .select('position')
            .eq('page_slug', pageSlug)
            .order('position', { ascending: false })
            .limit(1)
            .single();

          const nextPosition = (maxPosData?.position || 0) + 1;

          // Create segment registry entry
          await supabase
            .from('segment_registry')
            .insert({
              page_slug: pageSlug,
              segment_id: nextSegmentId,
              segment_key: segmentKey,
              segment_type: segmentType,
              position: nextPosition
            });

          // Create content based on segment type
          let contentValue: any = {};
          
          switch (segmentType) {
            case 'intro':
              contentValue = {
                headline: 'Weitere Informationen',
                introText: block.content,
                alignment: 'left',
                showDivider: true
              };
              break;
            case 'feature-overview':
              contentValue = {
                title: 'Features',
                items: [{
                  headline: 'Highlight',
                  text: block.content,
                  icon: 'Star'
                }]
              };
              break;
            case 'specification':
              contentValue = {
                title: 'Technische Details',
                description: block.content,
                rows: []
              };
              break;
            case 'banner-p':
              contentValue = {
                title: 'Hinweis',
                text: block.content,
                variant: 'info'
              };
              break;
          }

          await supabase
            .from('page_content')
            .insert({
              page_slug: pageSlug,
              section_key: segmentKey,
              language,
              content_type: 'json',
              content_value: JSON.stringify(contentValue),
              content_status: 'pending',
              import_stage: 2,
              draft_value: JSON.stringify(contentValue)
            });

          console.log('[RefineWithAI] Created new segment with pending status:', segmentKey);
        }

        // Track result
        results.push({
          blockType: block.type,
          segmentKey: segmentKey || 'unknown',
          segmentType,
          isNew: isNewSegment,
          contentPreview: block.content.substring(0, 100) + (block.content.length > 100 ? '...' : '')
        });
      }

      // Show success view instead of closing
      setAppliedResults(results);
      setShowBlockPreview(false);
      setShowSuccessView(true);
      
      // Trigger reload for parent
      onRefineComplete?.();
      
    } catch (error) {
      console.error('Apply blocks error:', error);
      toast.error('Fehler beim Speichern', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Preview on frontend
  const handlePreviewOnFrontend = () => {
    const frontendUrl = `/${language}/${pageSlug}`;
    window.open(frontendUrl, '_blank');
  };

  // Close and reset everything
  const handleCloseSuccess = () => {
    setOpen(false);
    setShowSuccessView(false);
    setShowBlockPreview(false);
    setContentBlocks([]);
    setSelectedOptions([]);
    setAppliedResults([]);
  };

  const handleBackToSelection = () => {
    setShowBlockPreview(false);
    setContentBlocks([]);
  };

  const handleClose = () => {
    setOpen(false);
    setShowBlockPreview(false);
    setShowSuccessView(false);
    setContentBlocks([]);
    setSelectedOptions([]);
    setAppliedResults([]);
  };

  const fetchOptions = REFINE_OPTIONS.filter(o => o.category === 'fetch');
  const enhanceOptions = REFINE_OPTIONS.filter(o => o.category === 'enhance');
  const acceptedCount = contentBlocks.filter(b => b.accepted && b.selectedSegment.type !== 'skip').length;

  // Load source URL when dialog opens
  const loadSourceUrl = async () => {
    setIsLoadingSourceUrl(true);
    console.log('[RefineWithAI] Loading source URL for pageSlug:', pageSlug);
    
    const urlPatterns = [
      `/${language}/${pageSlug}`,
      `/${pageSlug}`,
      `/en/${pageSlug}`,
    ];
    
    for (const targetUrl of urlPatterns) {
      const { data: redirect } = await supabase
        .from('redirects')
        .select('source_url')
        .eq('target_url', targetUrl)
        .maybeSingle();
      
      if (redirect?.source_url) {
        const fullUrl = redirect.source_url.startsWith('http') 
          ? redirect.source_url 
          : `https://www.image-engineering.de${redirect.source_url}`;
        setSourceUrl(fullUrl);
        setIsLoadingSourceUrl(false);
        return;
      }
    }
    
    // Try LIKE search
    const productName = pageSlug.split('/').pop();
    const { data: redirect } = await supabase
      .from('redirects')
      .select('source_url')
      .ilike('target_url', `%${productName}%`)
      .maybeSingle();
    
    if (redirect?.source_url) {
      const fullUrl = redirect.source_url.startsWith('http') 
        ? redirect.source_url 
        : `https://www.image-engineering.de${redirect.source_url}`;
      setSourceUrl(fullUrl);
    } else {
      setSourceUrl(null);
    }
    setIsLoadingSourceUrl(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(true);
      loadSourceUrl();
      loadExistingSegments();
    } else {
      handleClose();
    }
  };

  // Inline variant
  if (variant === 'inline') {
    return (
      <Button 
        onClick={() => setOpen(true)}
        variant="outline"
        className={`gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 ${className}`}
      >
        <GeminiIcon className="h-4 w-4" rainbow />
        Refine with AI
      </Button>
    );
  }

  const triggerButton = variant === 'compact' ? (
    <Button 
      className={`gap-2 h-9 px-4 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 ${className}`}
    >
      <GeminiIcon className="h-4 w-4 text-white" />
      <FirecrawlIcon className="h-4 w-4 text-white" />
      Refine with AI
    </Button>
  ) : (
    <Button 
      className={`gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white ${className}`}
    >
      <GeminiIcon className="h-4 w-4" rainbow />
      Refine with AI
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col bg-gray-900 border-gray-700 text-white top-[55%] translate-y-[-50%] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {showSuccessView ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-400" />
                <span>Inhalte erfolgreich übernommen!</span>
              </>
            ) : showBlockPreview ? (
              <>
                <Layers className="h-6 w-6 text-purple-400" />
                <span>Content-Blöcke zuordnen</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <FirecrawlIcon className="h-5 w-5 text-white" />
                  <GeminiIcon className="h-5 w-5 text-white" />
                </div>
                <span>Refine Content with AI</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
            {showSuccessView
              ? `${appliedResults.length} Inhaltsblock(e) wurden erfolgreich verarbeitet.`
              : showBlockPreview 
              ? 'Ordne jeden Inhaltsblock dem passenden Segment zu. Neue Segmente werden automatisch erstellt.'
              : 'Select the improvements you want to apply to this page.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Success View */}
        {showSuccessView && (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {/* Info banner about approval */}
                <div className="rounded-lg border border-orange-700/50 bg-orange-900/20 p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-300 font-medium">Freigabe erforderlich</p>
                      <p className="text-xs text-orange-400/80 mt-1">
                        Die Inhalte wurden als "Pending" gespeichert. Öffne das Frontend im Edit-Modus, 
                        um die Änderungen zu überprüfen und freizugeben.
                      </p>
                    </div>
                  </div>
                </div>
                
                {appliedResults.map((result, index) => (
                  <div 
                    key={index}
                    className="rounded-lg border border-orange-700/50 bg-orange-900/10 p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {result.segmentType === 'intro' ? 'Intro Segment' :
                             result.segmentType === 'feature-overview' ? 'Feature Overview' :
                             result.segmentType === 'specification' ? 'Specification' :
                             result.segmentType === 'banner-p' ? 'Banner' : result.segmentType}
                          </span>
                          <Badge className="text-xs bg-orange-900/50 text-orange-300 border-orange-700">
                            Pending
                          </Badge>
                          {result.isNew && (
                            <Badge className="text-xs bg-blue-900/50 text-blue-300 border-blue-700">
                              <Plus className="h-3 w-3 mr-1" />
                              Neu
                            </Badge>
                          )}
                        </div>
                        <code className="text-xs text-gray-400">{result.segmentKey}</code>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 bg-gray-800/60 rounded p-2 mt-2">
                      {result.contentPreview}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <div className="text-sm text-orange-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {appliedResults.length} Segment(e) warten auf Freigabe
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCloseSuccess}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Schließen
                </Button>
                <Button 
                  onClick={handlePreviewOnFrontend}
                  className="gap-2 bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Im Frontend ansehen
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Selection View */}
        {!showBlockPreview && !showSuccessView && (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-4">
                {/* Fetch Section */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FirecrawlIcon className="h-5 w-5 text-white" />
                    <h4 className="font-semibold text-base text-white">Content Fetching</h4>
                    <Badge className="text-xs bg-blue-900/50 text-blue-300 border-blue-700">Firecrawl</Badge>
                  </div>
                  
                  {/* Source URL Display */}
                  {sourceUrl && (
                    <div className="mb-4 p-3 rounded-md bg-gray-800/60 border border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Source URL:</p>
                      <a 
                        href={sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 break-all"
                      >
                        {sourceUrl}
                      </a>
                    </div>
                  )}
                  {!sourceUrl && !isLoadingSourceUrl && (
                    <div className="mb-4 p-3 rounded-md bg-yellow-900/20 border border-yellow-700/50">
                      <p className="text-sm text-yellow-400">Keine Source-URL für diese Seite gefunden</p>
                    </div>
                  )}
                  {isLoadingSourceUrl && (
                    <div className="mb-4 p-3 rounded-md bg-gray-800/60 border border-gray-700">
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Lade Source-URL...
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {fetchOptions.map(option => (
                      <div
                        key={option.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedOptions.includes(option.id)
                            ? 'bg-blue-900/30 border-blue-500/50'
                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => toggleOption(option.id)}
                      >
                        <Checkbox
                          checked={selectedOptions.includes(option.id)}
                          onCheckedChange={() => toggleOption(option.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <div className="text-blue-400 flex-shrink-0">
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-base text-white block">{option.label}</span>
                          <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* AI Enhancement Section */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <GeminiIcon className="h-5 w-5 text-white" />
                    <h4 className="font-semibold text-base text-white">AI Enhancements</h4>
                    <Badge className="text-xs bg-purple-900/50 text-purple-300 border-purple-700">Gemini 2.5</Badge>
                  </div>
                  <div className="space-y-3">
                    {enhanceOptions.map(option => (
                      <div
                        key={option.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedOptions.includes(option.id)
                            ? 'bg-purple-900/30 border-purple-500/50'
                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => toggleOption(option.id)}
                      >
                        <Checkbox
                          checked={selectedOptions.includes(option.id)}
                          onCheckedChange={() => toggleOption(option.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="border-gray-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <div className="text-purple-400 flex-shrink-0">
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-base text-white block">{option.label}</span>
                          <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {selectedOptions.length} Option{selectedOptions.length !== 1 ? 'en' : ''} ausgewählt
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isProcessing}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleGeneratePreview}
                  disabled={selectedOptions.length === 0 || isProcessing}
                  className="gap-2 bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {processingStep || 'Analysiere...'}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Vorschau generieren
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Block Preview View */}
        {showBlockPreview && !showSuccessView && (
          <>
            {/* Quick Actions */}
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptAllBlocks}
                  className="gap-1 text-green-400 border-green-700 hover:bg-green-900/30 hover:text-green-300"
                >
                  <Check className="h-3.5 w-3.5" />
                  Alle akzeptieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAllBlocks}
                  className="gap-1 text-red-400 border-red-700 hover:bg-red-900/30 hover:text-red-300"
                >
                  <X className="h-3.5 w-3.5" />
                  Alle ablehnen
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {contentBlocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <p>Keine neuen Inhalte gefunden</p>
                    <p className="text-sm mt-2">Alle Textinhalte sind bereits auf der Seite vorhanden.</p>
                  </div>
                ) : (
                  contentBlocks.map((block, index) => (
                    <Collapsible
                      key={block.id}
                      open={expandedBlocks.includes(block.id)}
                      onOpenChange={() => toggleBlockExpanded(block.id)}
                    >
                      <div
                        className={`rounded-lg border transition-all ${
                          block.accepted && block.selectedSegment.type !== 'skip'
                            ? 'bg-green-900/20 border-green-700/50'
                            : block.selectedSegment.type === 'skip'
                            ? 'bg-gray-800/30 border-gray-700/50 opacity-60'
                            : 'bg-gray-800/50 border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <Checkbox
                            checked={block.accepted}
                            onCheckedChange={() => toggleBlockAccepted(block.id)}
                            disabled={block.selectedSegment.type === 'skip'}
                            className="border-gray-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          
                          <CollapsibleTrigger className="flex items-center gap-2 text-left">
                            <div className="text-gray-400">
                              {expandedBlocks.includes(block.id) 
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                              }
                            </div>
                            <div className="font-medium text-white">
                              Block {index + 1}: {block.type}
                            </div>
                          </CollapsibleTrigger>
                          
                          <div className="flex-1" />
                          
                          {/* Segment selector */}
                          <div className="flex items-center gap-2">
                            {block.isNew && block.selectedSegment.type !== 'skip' && (
                              <Badge className="text-xs bg-blue-900/50 text-blue-300 border-blue-700">
                                <Plus className="h-3 w-3 mr-1" />
                                Neu
                              </Badge>
                            )}
                            <Select
                              value={block.selectedSegment.type}
                              onValueChange={(value) => updateBlockSegment(block.id, value)}
                            >
                              <SelectTrigger className="w-[240px] bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {SEGMENT_OPTIONS.map(seg => (
                                  <SelectItem 
                                    key={seg.type} 
                                    value={seg.type}
                                    className="text-white hover:bg-gray-700"
                                  >
                                    {seg.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4">
                            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
                              <div className="text-xs font-medium text-gray-400 mb-2">Inhalt:</div>
                              <div className="text-sm text-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {block.content}
                              </div>
                            </div>
                            {block.selectedSegment.segmentKey && (
                              <div className="mt-2 text-xs text-gray-500">
                                → Wird an Segment <code className="bg-gray-800 px-1 rounded">{block.selectedSegment.segmentKey}</code> angehängt
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {acceptedCount} von {contentBlocks.length} Block{contentBlocks.length !== 1 ? 's' : ''} ausgewählt
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isApplying}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleApplyBlocks}
                  disabled={acceptedCount === 0 || isApplying}
                  className="gap-2 bg-green-600 hover:bg-green-500 text-white"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Übernehme...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {acceptedCount} Block{acceptedCount !== 1 ? 's' : ''} übernehmen
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
