import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Loader2,
  Wand2,
  Globe,
  ListPlus,
  MessageSquarePlus,
  Lightbulb
} from 'lucide-react';

interface RefineWithAIDialogProps {
  pageSlug: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onRefineComplete?: () => void;
  variant?: 'button' | 'compact';
  className?: string;
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
    label: 'Mehr Content laden',
    description: 'Originalseite erneut abrufen und zusätzliche Inhalte extrahieren',
    icon: <Globe className="h-4 w-4" />,
    category: 'fetch',
  },
  {
    id: 'add-segments',
    label: 'Neue Segmente vorschlagen',
    description: 'KI analysiert den Content und schlägt passende Segment-Typen vor',
    icon: <ListPlus className="h-4 w-4" />,
    category: 'enhance',
  },
  {
    id: 'expand-texts',
    label: 'Texte erweitern',
    description: 'Bestehende Texte mit KI-generierten Inhalten ergänzen',
    icon: <MessageSquarePlus className="h-4 w-4" />,
    category: 'enhance',
  },
  {
    id: 'generate-faq',
    label: 'FAQs generieren',
    description: 'Häufige Fragen aus dem vorhandenen Content ableiten',
    icon: <Lightbulb className="h-4 w-4" />,
    category: 'enhance',
  },
  {
    id: 'seo-optimize',
    label: 'SEO optimieren',
    description: 'Meta-Beschreibungen und Überschriften für Suchmaschinen verbessern',
    icon: <FileText className="h-4 w-4" />,
    category: 'enhance',
  },
];

export const RefineWithAIDialog = ({ 
  pageSlug, 
  language, 
  onRefineComplete,
  variant = 'button',
  className = ''
}: RefineWithAIDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleRefine = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Bitte wähle mindestens eine Option aus');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get current segments for the page
      const { data: segments, error: segmentsError } = await supabase
        .from('segment_registry')
        .select('segment_key, segment_type, position')
        .eq('page_slug', pageSlug)
        .eq('deleted', false)
        .order('position');

      if (segmentsError) throw segmentsError;

      // Get current content for these segments
      const segmentKeys = segments?.map(s => s.segment_key) || [];
      
      const { data: content, error: contentError } = await supabase
        .from('page_content')
        .select('section_key, content_value, content_type')
        .eq('page_slug', pageSlug)
        .eq('language', language)
        .in('section_key', segmentKeys);

      if (contentError) throw contentError;

      // Process each selected option
      for (const optionId of selectedOptions) {
        setProcessingStep(REFINE_OPTIONS.find(o => o.id === optionId)?.label || optionId);
        
        switch (optionId) {
          case 'refetch-content':
            await handleRefetchContent();
            break;
          case 'add-segments':
            await handleSuggestSegments(content);
            break;
          case 'expand-texts':
            await handleExpandTexts(content);
            break;
          case 'generate-faq':
            await handleGenerateFAQ(content);
            break;
          case 'seo-optimize':
            await handleSEOOptimize(content);
            break;
        }
      }

      toast.success('Refine abgeschlossen!', {
        description: `${selectedOptions.length} Verbesserung(en) wurden angewendet.`
      });
      
      setOpen(false);
      setSelectedOptions([]);
      onRefineComplete?.();
      
    } catch (error) {
      console.error('Refine error:', error);
      toast.error('Fehler beim Refine', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  const handleRefetchContent = async () => {
    // Get the source URL from redirects table
    const targetUrl = `/${language}/${pageSlug}`;
    const { data: redirect } = await supabase
      .from('redirects')
      .select('source_url')
      .eq('target_url', targetUrl)
      .maybeSingle();

    if (!redirect?.source_url) {
      toast.info('Keine Quell-URL gefunden', {
        description: 'Die Originalseite wurde nicht als Redirect gespeichert.'
      });
      return;
    }

    // Use the fetch-external-content edge function
    const { data, error } = await supabase.functions.invoke('fetch-external-content', {
      body: { url: redirect.source_url }
    });

    if (error) throw error;

    // Store the fetched content for further processing
    console.log('Refetched content:', data);
    toast.success('Content neu geladen', {
      description: 'Die Originalseite wurde erneut abgerufen.'
    });
  };

  const handleSuggestSegments = async (content: any[] | null) => {
    if (!content || content.length === 0) {
      toast.info('Kein Content vorhanden', {
        description: 'Es gibt keinen Content zum Analysieren.'
      });
      return;
    }

    // Prepare content summary for AI
    const contentSummary = content.map(c => {
      try {
        const parsed = JSON.parse(c.content_value);
        return { type: c.content_type, key: c.section_key, data: parsed };
      } catch {
        return { type: c.content_type, key: c.section_key, data: c.content_value };
      }
    });

    // Call AI to suggest segments
    const { data, error } = await supabase.functions.invoke('generate-cluster-content', {
      body: {
        type: 'suggest-segments',
        pageSlug,
        language,
        currentContent: contentSummary,
        prompt: `Analysiere den vorhandenen Content dieser Produktseite und schlage 2-3 zusätzliche Segment-Typen vor, 
                 die den Content ergänzen würden. Verfügbare Segment-Typen sind: 
                 intro, specification, feature-overview, downloads, video, faq, banner, image-text, table, tiles.
                 Antworte im JSON-Format: { suggestions: [{ type: string, reason: string }] }`
      }
    });

    if (error) throw error;

    toast.success('Segment-Vorschläge generiert', {
      description: data?.suggestions?.length 
        ? `${data.suggestions.length} Vorschläge wurden erstellt.`
        : 'Die KI hat den Content analysiert.'
    });
  };

  const handleExpandTexts = async (content: any[] | null) => {
    if (!content || content.length === 0) {
      toast.info('Kein Content vorhanden');
      return;
    }

    // Find intro or description segments to expand
    const introContent = content.find(c => 
      c.section_key.includes('intro') || c.section_key.includes('description')
    );

    if (!introContent) {
      toast.info('Kein Intro-Segment gefunden');
      return;
    }

    const { data, error } = await supabase.functions.invoke('generate-intro-text', {
      body: {
        pageSlug,
        language,
        currentText: introContent.content_value,
        action: 'expand'
      }
    });

    if (error) throw error;

    toast.success('Text erweitert', {
      description: 'Der Intro-Text wurde mit KI-generierten Inhalten ergänzt.'
    });
  };

  const handleGenerateFAQ = async (content: any[] | null) => {
    if (!content || content.length === 0) {
      toast.info('Kein Content vorhanden');
      return;
    }

    // Collect all text content
    const allText = content.map(c => c.content_value).join('\n\n');

    const { data, error } = await supabase.functions.invoke('generate-cluster-content', {
      body: {
        type: 'generate-faq',
        pageSlug,
        language,
        content: allText,
        prompt: `Generiere 3-5 häufig gestellte Fragen (FAQs) basierend auf dem folgenden Produktcontent. 
                 Die Fragen sollten typische Kundenfragen sein.
                 Antworte im JSON-Format: { faqs: [{ question: string, answer: string }] }`
      }
    });

    if (error) throw error;

    toast.success('FAQs generiert', {
      description: data?.faqs?.length 
        ? `${data.faqs.length} FAQs wurden erstellt.`
        : 'Die KI hat FAQs generiert.'
    });
  };

  const handleSEOOptimize = async (content: any[] | null) => {
    const { data, error } = await supabase.functions.invoke('generate-seo-description', {
      body: {
        pageSlug,
        language
      }
    });

    if (error) throw error;

    toast.success('SEO optimiert', {
      description: 'Meta-Beschreibung wurde generiert.'
    });
  };

  const fetchOptions = REFINE_OPTIONS.filter(o => o.category === 'fetch');
  const enhanceOptions = REFINE_OPTIONS.filter(o => o.category === 'enhance');

  const triggerButton = variant === 'compact' ? (
    <Button 
      variant="outline" 
      size="sm" 
      className={`gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800 ${className}`}
    >
      <Wand2 className="h-4 w-4" />
      Refine with AI
    </Button>
  ) : (
    <Button 
      className={`gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white ${className}`}
    >
      <Sparkles className="h-4 w-4" />
      Refine with AI
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Content mit KI verfeinern
          </DialogTitle>
          <DialogDescription>
            Wähle die Verbesserungen aus, die du auf diese Seite anwenden möchtest.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6 py-4">
            {/* Re-Fetch Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-sm">Content laden</h4>
                <Badge variant="secondary" className="text-xs">Fetch</Badge>
              </div>
              <div className="space-y-2">
                {fetchOptions.map(option => (
                  <div
                    key={option.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedOptions.includes(option.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <Checkbox
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* AI Enhancement Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium text-sm">KI-Verbesserungen</h4>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">AI</Badge>
              </div>
              <div className="space-y-2">
                {enhanceOptions.map(option => (
                  <div
                    key={option.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedOptions.includes(option.id)
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <Checkbox
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedOptions.length} ausgewählt
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleRefine}
              disabled={selectedOptions.length === 0 || isProcessing}
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {processingStep || 'Verarbeite...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Refine starten
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
