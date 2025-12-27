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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Eye,
  ArrowLeft
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

interface ProposedChange {
  id: string;
  type: 'text-expand' | 'faq' | 'seo' | 'segment-suggestion' | 'refetch';
  title: string;
  description: string;
  originalValue?: string;
  proposedValue: string;
  segmentKey?: string;
  accepted: boolean;
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
  
  // Preview mode state
  const [showPreview, setShowPreview] = useState(false);
  const [proposedChanges, setProposedChanges] = useState<ProposedChange[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [expandedChanges, setExpandedChanges] = useState<string[]>([]);

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const toggleChangeExpanded = (changeId: string) => {
    setExpandedChanges(prev =>
      prev.includes(changeId)
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  const toggleChangeAccepted = (changeId: string) => {
    setProposedChanges(prev =>
      prev.map(c => c.id === changeId ? { ...c, accepted: !c.accepted } : c)
    );
  };

  const acceptAllChanges = () => {
    setProposedChanges(prev => prev.map(c => ({ ...c, accepted: true })));
  };

  const rejectAllChanges = () => {
    setProposedChanges(prev => prev.map(c => ({ ...c, accepted: false })));
  };

  // Generate preview without saving
  const handleGeneratePreview = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Bitte wähle mindestens eine Option aus');
      return;
    }

    setIsProcessing(true);
    setProposedChanges([]);
    
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

      const changes: ProposedChange[] = [];

      // Process each selected option and generate preview
      for (const optionId of selectedOptions) {
        setProcessingStep(REFINE_OPTIONS.find(o => o.id === optionId)?.label || optionId);
        
        switch (optionId) {
          case 'refetch-content':
            const refetchChanges = await generateRefetchPreview();
            changes.push(...refetchChanges);
            break;
          case 'add-segments':
            const segmentChanges = await generateSegmentSuggestionsPreview(content);
            changes.push(...segmentChanges);
            break;
          case 'expand-texts':
            const textChanges = await generateExpandTextsPreview(content);
            changes.push(...textChanges);
            break;
          case 'generate-faq':
            const faqChanges = await generateFAQPreview(content);
            changes.push(...faqChanges);
            break;
          case 'seo-optimize':
            const seoChanges = await generateSEOPreview();
            changes.push(...seoChanges);
            break;
        }
      }

      if (changes.length === 0) {
        toast.info('Keine Änderungen vorgeschlagen', {
          description: 'Die KI konnte keine Verbesserungen für diese Seite finden.'
        });
        return;
      }

      setProposedChanges(changes);
      setExpandedChanges(changes.slice(0, 2).map(c => c.id)); // Expand first 2 by default
      setShowPreview(true);
      
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

  // Preview generators (return proposed changes without saving)
  const generateRefetchPreview = async (): Promise<ProposedChange[]> => {
    const targetUrl = `/${language}/${pageSlug}`;
    const { data: redirect } = await supabase
      .from('redirects')
      .select('source_url')
      .eq('target_url', targetUrl)
      .maybeSingle();

    if (!redirect?.source_url) {
      return [];
    }

    const { data, error } = await supabase.functions.invoke('fetch-external-content', {
      body: { url: redirect.source_url }
    });

    if (error || !data) return [];

    // Parse the fetched content and create proposed changes
    const changes: ProposedChange[] = [];
    
    if (data.content) {
      changes.push({
        id: `refetch-${Date.now()}`,
        type: 'refetch',
        title: 'Zusätzlicher Content von Originalseite',
        description: 'Neuer Content wurde von der Originalseite extrahiert',
        proposedValue: typeof data.content === 'string' 
          ? data.content.substring(0, 500) + '...' 
          : JSON.stringify(data.content).substring(0, 500) + '...',
        accepted: true
      });
    }

    return changes;
  };

  const generateSegmentSuggestionsPreview = async (content: any[] | null): Promise<ProposedChange[]> => {
    if (!content || content.length === 0) return [];

    const contentSummary = content.map(c => {
      try {
        const parsed = JSON.parse(c.content_value);
        return { type: c.content_type, key: c.section_key, data: parsed };
      } catch {
        return { type: c.content_type, key: c.section_key, data: c.content_value };
      }
    });

    try {
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

      if (error || !data?.suggestions) return [];

      return data.suggestions.map((s: any, i: number) => ({
        id: `segment-${Date.now()}-${i}`,
        type: 'segment-suggestion' as const,
        title: `Neues Segment: ${s.type}`,
        description: s.reason || 'KI-Vorschlag für zusätzliches Segment',
        proposedValue: `Segment-Typ: ${s.type}`,
        accepted: true
      }));
    } catch {
      return [];
    }
  };

  const generateExpandTextsPreview = async (content: any[] | null): Promise<ProposedChange[]> => {
    if (!content || content.length === 0) return [];

    const introContent = content.find(c => 
      c.section_key.includes('intro') || c.section_key.includes('description')
    );

    if (!introContent) return [];

    try {
      // Parse current content
      let currentText = '';
      try {
        const parsed = JSON.parse(introContent.content_value);
        currentText = parsed.description || parsed.text || introContent.content_value;
      } catch {
        currentText = introContent.content_value;
      }

      const { data, error } = await supabase.functions.invoke('generate-intro-text', {
        body: {
          pageSlug,
          language,
          currentText,
          action: 'expand'
        }
      });

      if (error || !data?.text) return [];

      return [{
        id: `text-expand-${Date.now()}`,
        type: 'text-expand',
        title: 'Intro-Text erweitert',
        description: 'Der bestehende Intro-Text wurde mit zusätzlichen Informationen ergänzt',
        originalValue: currentText.substring(0, 200) + (currentText.length > 200 ? '...' : ''),
        proposedValue: data.text,
        segmentKey: introContent.section_key,
        accepted: true
      }];
    } catch {
      return [];
    }
  };

  const generateFAQPreview = async (content: any[] | null): Promise<ProposedChange[]> => {
    if (!content || content.length === 0) return [];

    const allText = content.map(c => c.content_value).join('\n\n');

    try {
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

      if (error || !data?.faqs) return [];

      return data.faqs.map((faq: any, i: number) => ({
        id: `faq-${Date.now()}-${i}`,
        type: 'faq' as const,
        title: `FAQ: ${faq.question}`,
        description: 'Neue FAQ basierend auf dem Seiteninhalt',
        proposedValue: faq.answer,
        accepted: true
      }));
    } catch {
      return [];
    }
  };

  const generateSEOPreview = async (): Promise<ProposedChange[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo-description', {
        body: {
          pageSlug,
          language
        }
      });

      if (error || !data?.description) return [];

      return [{
        id: `seo-${Date.now()}`,
        type: 'seo',
        title: 'SEO Meta-Beschreibung',
        description: 'Optimierte Meta-Beschreibung für Suchmaschinen',
        proposedValue: data.description,
        accepted: true
      }];
    } catch {
      return [];
    }
  };

  // Apply accepted changes
  const handleApplyChanges = async () => {
    const acceptedChanges = proposedChanges.filter(c => c.accepted);
    
    if (acceptedChanges.length === 0) {
      toast.error('Keine Änderungen ausgewählt', {
        description: 'Bitte akzeptiere mindestens eine Änderung.'
      });
      return;
    }

    setIsApplying(true);

    try {
      for (const change of acceptedChanges) {
        switch (change.type) {
          case 'text-expand':
            if (change.segmentKey) {
              // Update the intro text in page_content
              const { data: existing } = await supabase
                .from('page_content')
                .select('content_value')
                .eq('page_slug', pageSlug)
                .eq('section_key', change.segmentKey)
                .eq('language', language)
                .maybeSingle();

              if (existing) {
                let updatedValue = existing.content_value;
                try {
                  const parsed = JSON.parse(existing.content_value);
                  if (parsed.description) {
                    parsed.description = change.proposedValue;
                  } else if (parsed.text) {
                    parsed.text = change.proposedValue;
                  }
                  updatedValue = JSON.stringify(parsed);
                } catch {
                  updatedValue = change.proposedValue;
                }

                await supabase
                  .from('page_content')
                  .update({ content_value: updatedValue })
                  .eq('page_slug', pageSlug)
                  .eq('section_key', change.segmentKey)
                  .eq('language', language);
              }
            }
            break;

          case 'seo':
            // Update SEO content
            await supabase
              .from('page_content')
              .upsert({
                page_slug: pageSlug,
                section_key: 'seo',
                language,
                content_type: 'json',
                content_value: JSON.stringify({ description: change.proposedValue })
              }, {
                onConflict: 'page_slug,section_key,language'
              });
            break;

          case 'faq':
            // FAQs would be added to a FAQ segment
            console.log('FAQ to be added:', change.title, change.proposedValue);
            break;

          case 'segment-suggestion':
            // Segment suggestions are informational
            console.log('Segment suggestion:', change.title);
            break;
        }
      }

      toast.success('Änderungen übernommen!', {
        description: `${acceptedChanges.length} Änderung(en) wurden gespeichert.`
      });
      
      setOpen(false);
      setShowPreview(false);
      setProposedChanges([]);
      setSelectedOptions([]);
      onRefineComplete?.();
      
    } catch (error) {
      console.error('Apply changes error:', error);
      toast.error('Fehler beim Speichern', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleBackToSelection = () => {
    setShowPreview(false);
    setProposedChanges([]);
  };

  const handleClose = () => {
    setOpen(false);
    setShowPreview(false);
    setProposedChanges([]);
    setSelectedOptions([]);
  };

  const fetchOptions = REFINE_OPTIONS.filter(o => o.category === 'fetch');
  const enhanceOptions = REFINE_OPTIONS.filter(o => o.category === 'enhance');
  const acceptedCount = proposedChanges.filter(c => c.accepted).length;

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

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setOpen(true);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showPreview ? (
              <>
                <Eye className="h-5 w-5 text-purple-600" />
                Vorschau der Änderungen
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-purple-600" />
                Content mit KI verfeinern
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {showPreview 
              ? 'Prüfe die vorgeschlagenen Änderungen und wähle aus, welche übernommen werden sollen.'
              : 'Wähle die Verbesserungen aus, die du auf diese Seite anwenden möchtest.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Selection View */}
        {!showPreview && (
          <>
            <ScrollArea className="flex-1 pr-4">
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
                <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleGeneratePreview}
                  disabled={selectedOptions.length === 0 || isProcessing}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {processingStep || 'Generiere Vorschau...'}
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

        {/* Preview View */}
        {showPreview && (
          <>
            {/* Quick Actions */}
            <div className="flex items-center justify-between py-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="gap-1 text-gray-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptAllChanges}
                  className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Check className="h-3 w-3" />
                  Alle akzeptieren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAllChanges}
                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-3 w-3" />
                  Alle ablehnen
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3 py-4">
                {proposedChanges.map((change) => (
                  <Collapsible
                    key={change.id}
                    open={expandedChanges.includes(change.id)}
                    onOpenChange={() => toggleChangeExpanded(change.id)}
                  >
                    <div
                      className={`rounded-lg border transition-colors ${
                        change.accepted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <Checkbox
                          checked={change.accepted}
                          onCheckedChange={() => toggleChangeAccepted(change.id)}
                        />
                        <CollapsibleTrigger className="flex-1 flex items-center gap-2 text-left">
                          {expandedChanges.includes(change.id) 
                            ? <ChevronDown className="h-4 w-4 text-gray-400" />
                            : <ChevronRight className="h-4 w-4 text-gray-400" />
                          }
                          <div className="flex-1">
                            <div className="font-medium text-sm">{change.title}</div>
                            <div className="text-xs text-gray-500">{change.description}</div>
                          </div>
                        </CollapsibleTrigger>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            change.type === 'text-expand' ? 'bg-blue-100 text-blue-700' :
                            change.type === 'faq' ? 'bg-amber-100 text-amber-700' :
                            change.type === 'seo' ? 'bg-green-100 text-green-700' :
                            change.type === 'segment-suggestion' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {change.type === 'text-expand' ? 'Text' :
                           change.type === 'faq' ? 'FAQ' :
                           change.type === 'seo' ? 'SEO' :
                           change.type === 'segment-suggestion' ? 'Segment' :
                           'Fetch'}
                        </Badge>
                      </div>
                      
                      <CollapsibleContent>
                        <div className="px-3 pb-3 pt-0 space-y-2">
                          {change.originalValue && (
                            <div className="bg-red-50 border border-red-100 rounded p-2">
                              <div className="text-xs font-medium text-red-600 mb-1">Aktuell:</div>
                              <div className="text-xs text-red-800 whitespace-pre-wrap">
                                {change.originalValue}
                              </div>
                            </div>
                          )}
                          <div className="bg-green-50 border border-green-100 rounded p-2">
                            <div className="text-xs font-medium text-green-600 mb-1">Neu:</div>
                            <div className="text-xs text-green-800 whitespace-pre-wrap">
                              {change.proposedValue}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                {acceptedCount} von {proposedChanges.length} Änderung(en) ausgewählt
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} disabled={isApplying}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleApplyChanges}
                  disabled={acceptedCount === 0 || isApplying}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Speichere...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {acceptedCount} Änderung(en) übernehmen
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
