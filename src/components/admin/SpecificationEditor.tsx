import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SpecificationRow {
  specification: string;
  value: string;
}

interface SpecificationEditorProps {
  pageSlug: string;
  segmentId: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onSave?: () => void;
}

const SpecificationEditor = ({
  pageSlug,
  segmentId,
  language,
  onSave
}: SpecificationEditorProps) => {
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<SpecificationRow[]>([]);
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

    window.addEventListener('specification-translate', handleTranslate);
    return () => window.removeEventListener('specification-translate', handleTranslate);
  }, [language, pageSlug, segmentId]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Load from page_segments
      const { data: segmentsData } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      if (segmentsData?.content_value) {
        const segments = JSON.parse(segmentsData.content_value);
        const specSegment = segments.find((seg: any) => seg.id === segmentId);
        
        if (specSegment?.data) {
          setTitle(specSegment.data.title || "Detailed Specifications");
          setRows(specSegment.data.rows || [{ specification: "Specification Name", value: "Value" }]);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: empty state (no English fallback here - set empty)
      setTitle("Detailed Specifications");
      setRows([{ specification: "Specification Name", value: "Value" }]);
    } catch (error) {
      console.error('Error loading specification content:', error);
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
      const enSpecSegment = enSegments.find((seg: any) => seg.id === segmentId);

      if (!enSpecSegment?.data) {
        toast.error("No English specification data found");
        return;
      }

      const enTitle = enSpecSegment.data.title || '';
      const enRows = enSpecSegment.data.rows || [];

      // Prepare texts to translate
      const textsToTranslate: Record<string, string> = {
        "title": enTitle
      };

      enRows.forEach((row: SpecificationRow, index: number) => {
        textsToTranslate[`row_spec_${index}`] = row.specification || '';
        textsToTranslate[`row_value_${index}`] = row.value || '';
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
        
        const translatedRows = enRows.map((row: SpecificationRow, index: number) => ({
          specification: translateData.translatedTexts[`row_spec_${index}`] || row.specification,
          value: translateData.translatedTexts[`row_value_${index}`] || row.value
        }));
        setRows(translatedRows);

        toast.success('Content translated successfully');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleRowChange = (index: number, field: 'specification' | 'value', value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { specification: "New Specification", value: "Value" }]);
  };

  const handleDeleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Load current page_segments
      const { data: segmentsData, error: loadError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      if (loadError && loadError.code !== 'PGRST116') throw loadError;

      let segments = segmentsData?.content_value ? JSON.parse(segmentsData.content_value) : [];

      // Find and update the specification segment
      const segmentIndex = segments.findIndex((seg: any) => seg.id === segmentId);
      
      if (segmentIndex >= 0) {
        segments[segmentIndex].data = { title, rows };
      } else {
        segments.push({
          id: segmentId,
          type: 'specification',
          data: { title, rows }
        });
      }

      // Save to database
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

      toast.success('Specification saved successfully');
      onSave?.();
    } catch (error) {
      console.error('Error saving specification:', error);
      toast.error('Failed to save specification');
    } finally {
      setIsSaving(false);
    }
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
        <CardTitle className="text-white flex items-center justify-between">
          <span>Specification Segment (ID: {segmentId})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor={`spec-title-${segmentId}`} className="text-white text-base">
            Section Title
          </Label>
          <Input
            id={`spec-title-${segmentId}`}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Detailed Specifications"
            className="mt-2 bg-gray-700 border-2 border-gray-600 focus:border-[#f9dc24] text-xl text-white placeholder:text-gray-400 h-12"
          />
        </div>

        {/* Specification Rows */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white text-base">Specification Rows</Label>
            <Button
              type="button"
              onClick={handleAddRow}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>

          {rows.map((row, index) => (
            <Card key={index} className="bg-gray-700 border-gray-600">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-white font-medium">Row {index + 1}</span>
                  {rows.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Row?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this specification row. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteRow(index)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <div>
                  <Label htmlFor={`spec-name-${segmentId}-${index}`} className="text-white text-sm">
                    Specification Name
                  </Label>
                  <Input
                    id={`spec-name-${segmentId}-${index}`}
                    type="text"
                    value={row.specification}
                    onChange={(e) => handleRowChange(index, 'specification', e.target.value)}
                    placeholder="e.g. Light Source"
                    className="mt-1 bg-gray-600 border-2 border-gray-500 focus:border-[#f9dc24] text-lg text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor={`spec-value-${segmentId}-${index}`} className="text-white text-sm">
                    Value
                  </Label>
                  <Input
                    id={`spec-value-${segmentId}-${index}`}
                    type="text"
                    value={row.value}
                    onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                    placeholder="e.g. 36 temperature-controlled LEDs"
                    className="mt-1 bg-gray-600 border-2 border-gray-500 focus:border-[#f9dc24] text-lg text-white placeholder:text-gray-400"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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

export default memo(SpecificationEditor);
