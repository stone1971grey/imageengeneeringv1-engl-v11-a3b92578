import { useState, useEffect, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface FeatureItem {
  title: string;
  description: string;
}

interface FeatureOverviewEditorProps {
  pageSlug: string;
  segmentId: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onSave?: () => void;
}

const FeatureOverviewEditorComponent = ({ pageSlug, segmentId, language, onSave }: FeatureOverviewEditorProps) => {
  const [title, setTitle] = useState('');
  const [subtext, setSubtext] = useState('');
  const [layout, setLayout] = useState<'1' | '2' | '3'>('3');
  const [rows, setRows] = useState<'1' | '2' | '3'>('1');
  const [items, setItems] = useState<FeatureItem[]>([{ title: '', description: '' }]);
  const [loading, setLoading] = useState(false);
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

    window.addEventListener('feature-overview-translate', handleTranslate);
    return () => window.removeEventListener('feature-overview-translate', handleTranslate);
  }, [language, pageSlug, segmentId]);

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
      const enSegment = enSegments.find((seg: any) => seg.id === segmentId);
      
      if (!enSegment?.data) {
        toast.error("No English feature overview data found");
        return;
      }

      const enTitle = enSegment.data.title || '';
      const enSubtext = enSegment.data.subtext || '';
      const enItems = enSegment.data.items || [];

      // Prepare texts to translate
      const textsToTranslate: Record<string, string> = {
        "title": enTitle,
        "subtext": enSubtext
      };

      enItems.forEach((item: FeatureItem, index: number) => {
        textsToTranslate[`item_title_${index}`] = item.title || '';
        textsToTranslate[`item_desc_${index}`] = item.description || '';
      });

      const { data: translateData, error: translateError } = await supabase.functions.invoke('translate-content', {
        body: {
          texts: textsToTranslate,
          targetLanguage: language
        }
      });

      if (translateError) throw translateError;

      if (translateData?.translatedTexts) {
        const translated = translateData.translatedTexts;
        setTitle(translated["title"] || enTitle);
        setSubtext(translated["subtext"] || enSubtext);

        const translatedItems = enItems.map((item: FeatureItem, index: number) => ({
          title: translated[`item_title_${index}`] || item.title,
          description: translated[`item_desc_${index}`] || item.description
        }));

        setItems(translatedItems);
        setLayout(enSegment.data.layout || '3');
        setRows(enSegment.data.rows || '1');
        toast.success("Content translated successfully!");
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      toast.error(error.message || "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading content:', error);
      }

      if (data?.content_value) {
        const segments = JSON.parse(data.content_value);
        const segment = segments.find((seg: any) => seg.id === segmentId);
        
        if (segment?.data) {
          setTitle(segment.data.title || '');
          setSubtext(segment.data.subtext || '');
          setLayout(segment.data.layout || '3');
          setRows(segment.data.rows || '1');
          setItems(segment.data.items || [{ title: '', description: '' }]);
          setIsLoading(false);
          return;
        }
      }

      // No content found for this language - start with empty state (not English fallback)
      if (language !== 'en') {
        setTitle('');
        setSubtext('');
        setLayout('3');
        setRows('1');
        setItems([{ title: '', description: '' }]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const segmentData = {
        title,
        subtext,
        layout,
        rows,
        items
      };

      // Load existing page_segments
      const { data: existingData } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      let segments = [];
      if (existingData?.content_value) {
        segments = JSON.parse(existingData.content_value);
      }

      // Update or add the segment
      const segmentIndex = segments.findIndex((seg: any) => seg.id === segmentId);
      if (segmentIndex >= 0) {
        segments[segmentIndex].data = segmentData;
      } else {
        segments.push({
          id: segmentId,
          type: 'feature-overview',
          data: segmentData
        });
      }

      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segments),
          language
        }, {
          onConflict: 'page_slug,section_key,language'
        });

      if (error) throw error;

      toast.success('Feature Overview saved successfully');
      onSave?.();
    } catch (error) {
      console.error('Error saving feature overview:', error);
      toast.error('Failed to save Feature Overview');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { title: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'title' | 'description', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  if (isLoading) {
    return <div className="p-4 text-center text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Translation Progress Indicator */}
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg animate-pulse shadow-lg shadow-purple-500/30">
          <p className="text-white font-bold text-center">⏳ Translating content...</p>
        </div>
      )}

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Section Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">Section Title (H2)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Key Benefits of LE7"
              className="bg-gray-800 text-white border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="subtext" className="text-white">Subtext (optional)</Label>
            <Textarea
              id="subtext"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="Optional description text below the title"
              rows={2}
              className="bg-gray-800 text-white border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="layout" className="text-white">Columns per Row</Label>
            <Select value={layout} onValueChange={(value: '1' | '2' | '3') => setLayout(value)}>
              <SelectTrigger id="layout" className="bg-gray-800 text-white border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="1" className="text-white">1 Column</SelectItem>
                <SelectItem value="2" className="text-white">2 Columns</SelectItem>
                <SelectItem value="3" className="text-white">3 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rows" className="text-white">Number of Rows</Label>
            <Select value={rows} onValueChange={(value: '1' | '2' | '3') => setRows(value)}>
              <SelectTrigger id="rows" className="bg-gray-800 text-white border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="1" className="text-white">1 Row</SelectItem>
                <SelectItem value="2" className="text-white">2 Rows</SelectItem>
                <SelectItem value="3" className="text-white">3 Rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Feature Items</CardTitle>
            <Button onClick={addItem} size="sm" className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <Card key={index} className="border-2 bg-gray-800 border-gray-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-white">Item {index + 1}</CardTitle>
                  {items.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Item</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            Are you sure you want to delete this item? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeItem(index)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`item-title-${index}`} className="text-white">Title (H3)</Label>
                  <Input
                    id={`item-title-${index}`}
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder="Feature title"
                    className="bg-gray-800 text-white border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor={`item-description-${index}`} className="text-white">Description</Label>
                  <Textarea
                    id={`item-description-${index}`}
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Feature description"
                    rows={3}
                    className="bg-gray-800 text-white border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default memo(FeatureOverviewEditorComponent);
