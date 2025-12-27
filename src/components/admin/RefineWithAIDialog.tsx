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
  ArrowLeft
} from 'lucide-react';

interface RefineWithAIDialogProps {
  pageSlug: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onRefineComplete?: () => void;
  variant?: 'button' | 'compact' | 'inline';
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
                  // APPEND logic: add new text as additional paragraph instead of replacing
                  if (parsed.description) {
                    parsed.description = parsed.description + '\n\n' + change.proposedValue;
                  } else if (parsed.text) {
                    parsed.text = parsed.text + '\n\n' + change.proposedValue;
                  }
                  updatedValue = JSON.stringify(parsed);
                } catch {
                  // Append to plain text
                  updatedValue = existing.content_value + '\n\n' + change.proposedValue;
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
            // APPEND FAQs to existing FAQ segment instead of replacing
            const { data: faqSegment } = await supabase
              .from('page_content')
              .select('content_value, section_key')
              .eq('page_slug', pageSlug)
              .eq('language', language)
              .like('section_key', '%faq%')
              .maybeSingle();

            const newFaq = {
              question: change.title.replace('FAQ: ', ''),
              answer: change.proposedValue
            };

            if (faqSegment?.content_value) {
              // Append to existing FAQs
              try {
                const existingFaqs = JSON.parse(faqSegment.content_value);
                const faqsArray = existingFaqs.faqs || existingFaqs.items || [];
                faqsArray.push(newFaq);
                
                const updatedFaqContent = existingFaqs.faqs 
                  ? { ...existingFaqs, faqs: faqsArray }
                  : { ...existingFaqs, items: faqsArray };

                await supabase
                  .from('page_content')
                  .update({ content_value: JSON.stringify(updatedFaqContent) })
                  .eq('page_slug', pageSlug)
                  .eq('section_key', faqSegment.section_key)
                  .eq('language', language);
              } catch {
                console.error('Failed to parse existing FAQ content');
              }
            } else {
              // Create new FAQ segment if none exists
              const { data: maxIdData } = await supabase
                .from('segment_registry')
                .select('segment_id')
                .order('segment_id', { ascending: false })
                .limit(1)
                .single();

              const nextSegmentId = (maxIdData?.segment_id || 0) + 1;

              // Add to segment registry
              await supabase
                .from('segment_registry')
                .insert({
                  page_slug: pageSlug,
                  segment_id: nextSegmentId,
                  segment_key: `faq-${nextSegmentId}`,
                  segment_type: 'faq',
                  position: 99
                });

              // Add FAQ content
              await supabase
                .from('page_content')
                .insert({
                  page_slug: pageSlug,
                  section_key: `faq-${nextSegmentId}`,
                  language,
                  content_type: 'json',
                  content_value: JSON.stringify({
                    headline: language === 'de' ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions',
                    faqs: [newFaq]
                  })
                });
            }
            break;

          case 'refetch':
            // APPEND re-fetched content to existing intro/description instead of replacing
            const { data: introSegment } = await supabase
              .from('page_content')
              .select('content_value, section_key')
              .eq('page_slug', pageSlug)
              .eq('language', language)
              .or('section_key.ilike.%intro%,section_key.ilike.%description%')
              .limit(1)
              .maybeSingle();

            if (introSegment?.content_value) {
              try {
                const existingContent = JSON.parse(introSegment.content_value);
                // Append new content as additional paragraph
                if (existingContent.description) {
                  existingContent.description = existingContent.description + '\n\n' + change.proposedValue;
                } else if (existingContent.text) {
                  existingContent.text = existingContent.text + '\n\n' + change.proposedValue;
                } else {
                  // If no description/text field, add it
                  existingContent.additionalContent = (existingContent.additionalContent || '') + '\n\n' + change.proposedValue;
                }

                await supabase
                  .from('page_content')
                  .update({ content_value: JSON.stringify(existingContent) })
                  .eq('page_slug', pageSlug)
                  .eq('section_key', introSegment.section_key)
                  .eq('language', language);
                  
                console.log('Re-fetched content appended to:', introSegment.section_key);
              } catch {
                // Plain text fallback
                const appendedValue = introSegment.content_value + '\n\n' + change.proposedValue;
                await supabase
                  .from('page_content')
                  .update({ content_value: appendedValue })
                  .eq('page_slug', pageSlug)
                  .eq('section_key', introSegment.section_key)
                  .eq('language', language);
              }
            } else {
              console.log('No intro segment found to append re-fetched content');
            }
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

  // Inline variant - just the button trigger without Dialog wrapper
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
      variant="outline" 
      size="sm" 
      className={`gap-2 bg-black text-white border-black hover:bg-gray-800 hover:text-white ${className}`}
    >
      <GeminiIcon className="h-4 w-4" rainbow />
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
      <DialogContent className="sm:max-w-[700px] max-h-[75vh] flex flex-col bg-gray-900 border-gray-700 text-white top-[55%] translate-y-[-50%] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {showPreview ? (
              <>
                <Eye className="h-6 w-6 text-purple-400" />
                <span>Review Proposed Changes</span>
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
            {showPreview 
              ? 'Review the AI-generated suggestions below. Accept or reject each change before applying.'
              : 'Select the improvements you want to apply to this page. Changes will be previewed before saving.'
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
                  <div className="flex items-center gap-3 mb-4">
                    <FirecrawlIcon className="h-5 w-5 text-white" />
                    <h4 className="font-semibold text-base text-white">Content Fetching</h4>
                    <Badge className="text-xs bg-blue-900/50 text-blue-300 border-blue-700">Firecrawl</Badge>
                  </div>
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
                {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isProcessing}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGeneratePreview}
                  disabled={selectedOptions.length === 0 || isProcessing}
                  className="gap-2 bg-purple-600 hover:bg-purple-500 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {processingStep || 'Generating Preview...'}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Generate Preview
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
            <div className="flex items-center justify-between py-3 border-b border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Options
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={acceptAllChanges}
                  className="gap-1 text-green-400 border-green-700 hover:bg-green-900/30 hover:text-green-300"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAllChanges}
                  className="gap-1 text-red-400 border-red-700 hover:bg-red-900/30 hover:text-red-300"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject All
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
                      className={`rounded-lg border transition-all ${
                        change.accepted
                          ? 'bg-green-900/20 border-green-700/50'
                          : 'bg-gray-800/50 border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <Checkbox
                          checked={change.accepted}
                          onCheckedChange={() => toggleChangeAccepted(change.id)}
                          className="border-gray-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <CollapsibleTrigger className="flex-1 flex items-center gap-3 text-left">
                          <div className="text-gray-400">
                            {expandedChanges.includes(change.id) 
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-base text-white">{change.title}</div>
                            <div className="text-sm text-gray-400 mt-0.5">{change.description}</div>
                          </div>
                        </CollapsibleTrigger>
                        <Badge 
                          className={`text-xs flex-shrink-0 ${
                            change.type === 'text-expand' ? 'bg-blue-900/50 text-blue-300 border-blue-700' :
                            change.type === 'faq' ? 'bg-amber-900/50 text-amber-300 border-amber-700' :
                            change.type === 'seo' ? 'bg-green-900/50 text-green-300 border-green-700' :
                            change.type === 'segment-suggestion' ? 'bg-purple-900/50 text-purple-300 border-purple-700' :
                            'bg-gray-700 text-gray-300 border-gray-600'
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
                        <div className="px-4 pb-4 pt-0 space-y-3">
                          {change.originalValue && (
                            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                              <div className="text-xs font-medium text-red-400 mb-2">Current:</div>
                              <div className="text-sm text-red-200/80 whitespace-pre-wrap">
                                {change.originalValue}
                              </div>
                            </div>
                          )}
                          <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3">
                            <div className="text-xs font-medium text-green-400 mb-2">Proposed:</div>
                            <div className="text-sm text-green-200/80 whitespace-pre-wrap">
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

            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {acceptedCount} of {proposedChanges.length} change{proposedChanges.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  disabled={isApplying}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApplyChanges}
                  disabled={acceptedCount === 0 || isApplying}
                  className="gap-2 bg-green-600 hover:bg-green-500 text-white"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Apply {acceptedCount} Change{acceptedCount !== 1 ? 's' : ''}
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
