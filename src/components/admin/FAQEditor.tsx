import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQEditorProps {
  pageSlug: string;
  segmentId: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onSave?: () => void;
}

const FAQEditor = ({ pageSlug, segmentId, language, onSave }: FAQEditorProps) => {
  const [title, setTitle] = useState('');
  const [subtext, setSubtext] = useState('');
  const [items, setItems] = useState<FAQItem[]>([{ question: '', answer: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    loadContent();
  }, [pageSlug, segmentId, language]);

  // Listen for translate event from SplitScreenSegmentEditor
  useEffect(() => {
    if (language === 'en') return;

    const handleTranslate = () => {
      handleAutoTranslate();
    };

    window.addEventListener('faq-translate', handleTranslate);
    return () => window.removeEventListener('faq-translate', handleTranslate);
  }, [language, pageSlug, segmentId]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const { data: segmentsData } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      if (segmentsData?.content_value) {
        const segments = JSON.parse(segmentsData.content_value);
        const faqSegment = segments.find((seg: any) => seg.id === segmentId);
        
        if (faqSegment?.data) {
          setTitle(faqSegment.data.title || '');
          setSubtext(faqSegment.data.subtext || '');
          setItems(faqSegment.data.items || [{ question: '', answer: '' }]);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: empty state
      setTitle('');
      setSubtext('');
      setItems([{ question: '', answer: '' }]);
    } catch (error) {
      console.error('Error loading FAQ content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (language === 'en') return;

    setIsTranslating(true);
    try {
      // Load English reference
      const { data: enData } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", "en")
        .single();

      if (!enData?.content_value) {
        toast.error("No English reference content found");
        return;
      }

      const enSegments = JSON.parse(enData.content_value);
      const enFaqSegment = enSegments.find((seg: any) => seg.id === segmentId);

      if (!enFaqSegment?.data) {
        toast.error("No English FAQ data found");
        return;
      }

      const enTitle = enFaqSegment.data.title || '';
      const enSubtext = enFaqSegment.data.subtext || '';
      const enItems = enFaqSegment.data.items || [];

      // Prepare texts to translate
      const textsToTranslate: Record<string, string> = {
        "title": enTitle,
        "subtext": enSubtext
      };

      enItems.forEach((item: FAQItem, index: number) => {
        textsToTranslate[`question_${index}`] = item.question || '';
        textsToTranslate[`answer_${index}`] = item.answer || '';
      });

      // Call translation API
      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: language,
        },
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        setTitle(translateData.translatedTexts.title || enTitle);
        setSubtext(translateData.translatedTexts.subtext || enSubtext);
        
        const translatedItems = enItems.map((item: FAQItem, index: number) => ({
          question: translateData.translatedTexts[`question_${index}`] || item.question,
          answer: translateData.translatedTexts[`answer_${index}`] || item.answer
        }));
        setItems(translatedItems);

        toast.success('Content translated successfully');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: segmentsData, error: loadError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      if (loadError && loadError.code !== 'PGRST116') throw loadError;

      let segments = segmentsData?.content_value ? JSON.parse(segmentsData.content_value) : [];

      const segmentIndex = segments.findIndex((seg: any) => seg.id === segmentId);
      const faqData = { title, subtext, items };
      
      if (segmentIndex >= 0) {
        segments[segmentIndex].data = faqData;
      } else {
        segments.push({
          id: segmentId,
          type: 'faq',
          data: faqData
        });
      }

      const { error: saveError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          language: language,
          content_type: "json",
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (saveError) throw saveError;

      toast.success('FAQ saved successfully');
      onSave?.();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { question: '', answer: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('FAQ must have at least one item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'question' | 'answer', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-8 text-center text-white">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
      {/* Translation Feedback */}
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 text-center font-bold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-white">FAQ Segment (ID: {segmentId})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Settings */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white text-base">Section Title (H2)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Frequently Asked Questions"
              className="mt-2 bg-gray-700 border-2 border-gray-600 focus:border-[#f9dc24] text-xl text-white placeholder:text-gray-400 h-12"
            />
          </div>

          <div>
            <Label htmlFor="subtext" className="text-white text-base">Subtext (optional)</Label>
            <Textarea
              id="subtext"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="Optional description text below the title"
              rows={2}
              className="mt-2 bg-gray-700 border-2 border-gray-600 focus:border-[#f9dc24] text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* FAQ Items */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">FAQ Items</CardTitle>
              <Button onClick={addItem} size="sm" className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <Card key={index} className="bg-gray-600 border-gray-500">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">FAQ {index + 1}</CardTitle>
                    {items.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950/50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this FAQ item? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeItem(index)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div>
                    <Label htmlFor={`question-${index}`} className="text-white text-sm">Question</Label>
                    <Input
                      id={`question-${index}`}
                      value={item.question}
                      onChange={(e) => updateItem(index, 'question', e.target.value)}
                      placeholder="Enter the question"
                      className="mt-1 bg-gray-500 border-2 border-gray-400 focus:border-[#f9dc24] text-white placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`answer-${index}`} className="text-white text-sm">Answer</Label>
                    <Textarea
                      id={`answer-${index}`}
                      value={item.answer}
                      onChange={(e) => updateItem(index, 'answer', e.target.value)}
                      placeholder="Enter the answer"
                      rows={4}
                      className="mt-1 bg-gray-500 border-2 border-gray-400 focus:border-[#f9dc24] text-white placeholder:text-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Save Button - Full Width */}
        <div className="pt-4 border-t border-gray-700">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 h-12 text-lg font-semibold"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(FAQEditor);
