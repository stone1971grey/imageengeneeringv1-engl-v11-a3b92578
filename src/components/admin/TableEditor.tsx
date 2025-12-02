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

interface TableEditorProps {
  pageSlug: string;
  segmentId: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onSave?: () => void;
}

const TableEditor = ({ pageSlug, segmentId, language, onSave }: TableEditorProps) => {
  const [title, setTitle] = useState('');
  const [subtext, setSubtext] = useState('');
  const [headers, setHeaders] = useState<string[]>(['Column 1', 'Column 2', 'Column 3']);
  const [rows, setRows] = useState<string[][]>([['Row 1 Cell 1', 'Row 1 Cell 2', 'Row 1 Cell 3']]);
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

    window.addEventListener('table-translate', handleTranslate);
    return () => window.removeEventListener('table-translate', handleTranslate);
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
        const tableSegment = segments.find((seg: any) => seg.id === segmentId);
        
        if (tableSegment?.data) {
          setTitle(tableSegment.data.title || '');
          setSubtext(tableSegment.data.subtext || '');
          setHeaders(tableSegment.data.headers || ['Column 1', 'Column 2', 'Column 3']);
          setRows(tableSegment.data.rows || [['', '', '']]);
          setIsLoading(false);
          return;
        }
      }

      // Fallback: empty state
      setTitle('');
      setSubtext('');
      setHeaders(['Column 1', 'Column 2', 'Column 3']);
      setRows([['', '', '']]);
    } catch (error) {
      console.error('Error loading table content:', error);
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
      const enTableSegment = enSegments.find((seg: any) => seg.id === segmentId);

      if (!enTableSegment?.data) {
        toast.error("No English table data found");
        return;
      }

      const enTitle = enTableSegment.data.title || '';
      const enSubtext = enTableSegment.data.subtext || '';
      const enHeaders = enTableSegment.data.headers || [];
      const enRows = enTableSegment.data.rows || [];

      // Prepare texts to translate
      const textsToTranslate: Record<string, string> = {
        "title": enTitle,
        "subtext": enSubtext
      };

      enHeaders.forEach((header: string, index: number) => {
        textsToTranslate[`header_${index}`] = header || '';
      });

      enRows.forEach((row: string[], rowIndex: number) => {
        row.forEach((cell: string, cellIndex: number) => {
          textsToTranslate[`cell_${rowIndex}_${cellIndex}`] = cell || '';
        });
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
        
        const translatedHeaders = enHeaders.map((header: string, index: number) => 
          translateData.translatedTexts[`header_${index}`] || header
        );
        setHeaders(translatedHeaders);

        const translatedRows = enRows.map((row: string[], rowIndex: number) => 
          row.map((cell: string, cellIndex: number) => 
            translateData.translatedTexts[`cell_${rowIndex}_${cellIndex}`] || cell
          )
        );
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
      const tableData = { title, subtext, headers, rows };
      
      if (segmentIndex >= 0) {
        segments[segmentIndex].data = tableData;
      } else {
        segments.push({
          id: segmentId,
          type: 'table',
          data: tableData
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

      toast.success('Table saved successfully');
      onSave?.();
    } catch (error) {
      console.error('Error saving table:', error);
      toast.error('Failed to save table');
    } finally {
      setIsSaving(false);
    }
  };

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (columnIndex: number) => {
    if (headers.length <= 1) {
      toast.error('Table must have at least one column');
      return;
    }
    setHeaders(headers.filter((_, i) => i !== columnIndex));
    setRows(rows.map(row => row.filter((_, i) => i !== columnIndex)));
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const addRow = () => {
    setRows([...rows, Array(headers.length).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) {
      toast.error('Table must have at least one row');
      return;
    }
    setRows(rows.filter((_, i) => i !== rowIndex));
  };

  const updateCell = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][cellIndex] = value;
    setRows(newRows);
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
        <CardTitle className="text-white">Table Segment (ID: {segmentId})</CardTitle>
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
              placeholder="e.g., Technical Specifications"
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

        {/* Table Headers */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Table Headers</CardTitle>
              <Button onClick={addColumn} size="sm" className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`header-${index}`} className="text-white text-sm">Column {index + 1}</Label>
                  <Input
                    id={`header-${index}`}
                    value={header}
                    onChange={(e) => updateHeader(index, e.target.value)}
                    placeholder={`Column ${index + 1} header`}
                    className="mt-1 bg-gray-600 border-2 border-gray-500 focus:border-[#f9dc24] text-white placeholder:text-gray-400"
                  />
                </div>
                {headers.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="mt-6 text-red-400 hover:text-red-300 hover:bg-red-950/50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Column</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this column? This will remove all data in this column.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeColumn(index)} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Table Rows */}
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Table Rows</CardTitle>
              <Button onClick={addRow} size="sm" className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map((row, rowIndex) => (
              <Card key={rowIndex} className="bg-gray-600 border-gray-500">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">Row {rowIndex + 1}</CardTitle>
                    {rows.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950/50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Row</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this row? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeRow(rowIndex)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {row.map((cell, cellIndex) => (
                    <div key={cellIndex}>
                      <Label htmlFor={`cell-${rowIndex}-${cellIndex}`} className="text-white text-sm">
                        {headers[cellIndex] || `Column ${cellIndex + 1}`}
                      </Label>
                      <Textarea
                        id={`cell-${rowIndex}-${cellIndex}`}
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                        placeholder={`Content for ${headers[cellIndex] || `Column ${cellIndex + 1}`}`}
                        rows={2}
                        className="mt-1 bg-gray-500 border-2 border-gray-400 focus:border-[#f9dc24] text-white placeholder:text-gray-300"
                      />
                    </div>
                  ))}
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

export default memo(TableEditor);
