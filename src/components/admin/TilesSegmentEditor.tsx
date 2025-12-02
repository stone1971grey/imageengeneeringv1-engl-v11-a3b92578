import { useState, useEffect, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { 
  FileText, Download, BarChart3, Zap, Shield, Eye, Car, 
  Smartphone, Heart, CheckCircle, Lightbulb, Monitor 
} from "lucide-react";

interface TileItem {
  title: string;
  description: string;
  imageUrl?: string;
  icon?: string;
  metadata?: any;
  showButton?: boolean;
  ctaText?: string;
  ctaLink?: string;
  ctaStyle?: string;
}

interface TilesSegmentEditorProps {
  pageSlug: string;
  segmentId: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onSave?: () => void;
}

const TilesSegmentEditorComponent = ({ pageSlug, segmentId, language, onSave }: TilesSegmentEditorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState("3");
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    loadContent();
  }, [pageSlug, segmentId, language]);

  // Listen for translate event from SplitScreenSegmentEditor
  useEffect(() => {
    if (language === 'en') return; // Don't translate English

    const handleTranslate = () => {
      handleAutoTranslate();
    };

    window.addEventListener('tiles-translate', handleTranslate);
    return () => window.removeEventListener('tiles-translate', handleTranslate);
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
      const enTilesSegment = enSegments.find((seg: any) => seg.id === segmentId);
      
      if (!enTilesSegment?.data) {
        toast.error("No English tiles data found");
        return;
      }

      const enTitle = enTilesSegment.data.title || '';
      const enDescription = enTilesSegment.data.description || '';
      const enTiles = enTilesSegment.data.items || [];

      // Prepare texts to translate
      const textsToTranslate: Record<string, string> = {
        "title": enTitle,
        "description": enDescription
      };

      enTiles.forEach((tile: TileItem, index: number) => {
        textsToTranslate[`tile_title_${index}`] = tile.title || '';
        textsToTranslate[`tile_desc_${index}`] = tile.description || '';
        if (tile.ctaText) {
          textsToTranslate[`tile_cta_${index}`] = tile.ctaText;
        }
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
        setDescription(translated["description"] || enDescription);

        const translatedTiles = enTiles.map((tile: TileItem, index: number) => ({
          ...tile,
          title: translated[`tile_title_${index}`] || tile.title,
          description: translated[`tile_desc_${index}`] || tile.description,
          ctaText: translated[`tile_cta_${index}`] || tile.ctaText
        }));

        setTiles(translatedTiles);
        setColumns(enTilesSegment.data.columns || '3');
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
      // Load from page_segments (dynamic segment storage)
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .eq("language", language)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.content_value) {
        const segments = JSON.parse(data.content_value);
        const tilesSegment = segments.find((seg: any) => seg.id === segmentId);
        
        if (tilesSegment?.data) {
          setTitle(tilesSegment.data.title || '');
          setDescription(tilesSegment.data.description || '');
          setColumns(tilesSegment.data.columns || '3');
          setTiles(tilesSegment.data.items || []);
        }
      }

      // Fallback to English if no content found for non-EN language
      if (language !== 'en') {
        const hasContent = title || description || tiles.length > 0;
        if (!hasContent) {
          const { data: enData } = await supabase
            .from("page_content")
            .select("*")
            .eq("page_slug", pageSlug)
            .eq("section_key", "page_segments")
            .eq("language", "en")
            .single();

          if (enData?.content_value) {
            const enSegments = JSON.parse(enData.content_value);
            const enTilesSegment = enSegments.find((seg: any) => seg.id === segmentId);
            
            if (enTilesSegment?.data) {
              setTitle(enTilesSegment.data.title || '');
              setDescription(enTilesSegment.data.description || '');
              setColumns(enTilesSegment.data.columns || '3');
              setTiles(enTilesSegment.data.items || []);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading tiles content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      // Load existing page_segments for this language
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

      // Find and update the tiles segment
      const segmentIndex = segments.findIndex((seg: any) => seg.id === segmentId);
      const updatedSegmentData = {
        title,
        description,
        columns,
        items: tiles
      };

      if (segmentIndex >= 0) {
        segments[segmentIndex].data = updatedSegmentData;
      } else {
        // Create new segment entry if it doesn't exist
        segments.push({
          id: segmentId,
          type: 'tiles',
          data: updatedSegmentData
        });
      }

      // Save back to database
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segments),
          language,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, { onConflict: 'page_slug,section_key,language' });

      if (error) throw error;

      toast.success(`Tiles saved for ${language.toUpperCase()}!`);
      onSave?.();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTile = () => {
    setTiles([...tiles, { 
      title: 'New Tile', 
      description: 'Description here...', 
      showButton: true, 
      ctaStyle: 'standard',
      ctaText: 'Learn More'
    }]);
  };

  const handleDeleteTile = (index: number) => {
    setTiles(tiles.filter((_, i) => i !== index));
  };

  const handleTileChange = (index: number, field: keyof TileItem, value: any) => {
    const newTiles = [...tiles];
    newTiles[index] = { ...newTiles[index], [field]: value };
    setTiles(newTiles);
  };

  const iconMap: Record<string, any> = {
    'FileText': FileText,
    'Download': Download,
    'BarChart3': BarChart3,
    'Zap': Zap,
    'Shield': Shield,
    'Eye': Eye,
    'Car': Car,
    'Smartphone': Smartphone,
    'Heart': Heart,
    'CheckCircle': CheckCircle,
    'Lightbulb': Lightbulb,
    'Monitor': Monitor
  };

  if (isLoading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {isTranslating && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 rounded-lg p-4 text-center text-white font-semibold animate-pulse shadow-lg shadow-purple-500/50">
          ⏳ Translating content...
        </div>
      )}

      {/* Section Settings */}
      <Card className="bg-gray-700 border-gray-600">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="tiles-title" className="text-white">Section Title</Label>
            <Input
              id="tiles-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-gray-600 bg-white text-black"
            />
          </div>

          <div>
            <Label htmlFor="tiles-desc" className="text-white">Section Description</Label>
            <Textarea
              id="tiles-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-2 border-gray-600 bg-white text-black"
            />
          </div>

          <div>
            <Label htmlFor="tiles-columns" className="text-white">Number of Columns</Label>
            <Select value={columns} onValueChange={setColumns}>
              <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Tiles ({tiles.length})</h3>
          <Button onClick={handleAddTile} className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Tile
          </Button>
        </div>

        {tiles.map((tile, index) => (
          <Card key={index} className="bg-gray-600 border-gray-500">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md">
                  Tile {index + 1}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Tile?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete Tile {index + 1}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteTile(index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Icon Selection */}
              <div>
                <Label className="text-white">Icon (Optional)</Label>
                <Select
                  value={tile.icon || "none"}
                  onValueChange={(value) => handleTileChange(index, 'icon', value === 'none' ? '' : value)}
                >
                  <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                    <SelectValue>
                      {(() => {
                        const IconComponent = iconMap[tile.icon || ''];
                        return IconComponent ? (
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{tile.icon}</span>
                          </div>
                        ) : (
                          <span>{tile.icon || 'Select an icon'}</span>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="none">No Icon</SelectItem>
                    {Object.keys(iconMap).map((iconName) => {
                      const IconComponent = iconMap[iconName];
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Title</Label>
                <Input
                  value={tile.title}
                  onChange={(e) => handleTileChange(index, 'title', e.target.value)}
                  className="border-2 border-gray-600 bg-white text-black"
                />
              </div>

              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={tile.description}
                  onChange={(e) => handleTileChange(index, 'description', e.target.value)}
                  rows={3}
                  className="border-2 border-gray-600 bg-white text-black"
                />
              </div>

              {/* Button Settings */}
              <div className="pt-3 border-t border-gray-500">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={tile.showButton !== false}
                    onChange={(e) => handleTileChange(index, 'showButton', e.target.checked)}
                    className="h-5 w-5"
                  />
                  <Label className="text-white">Show Button</Label>
                </div>

                {tile.showButton !== false && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white">Button Text</Label>
                      <Input
                        value={tile.ctaText || ''}
                        onChange={(e) => handleTileChange(index, 'ctaText', e.target.value)}
                        placeholder="Learn More"
                        className="border-2 border-gray-600 bg-white text-black"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Button Link</Label>
                      <Input
                        value={tile.ctaLink || ''}
                        onChange={(e) => handleTileChange(index, 'ctaLink', e.target.value)}
                        placeholder="/page or https://..."
                        className="border-2 border-gray-600 bg-white text-black"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Button Style</Label>
                      <Select
                        value={tile.ctaStyle || 'standard'}
                        onValueChange={(value) => handleTileChange(index, 'ctaStyle', value)}
                      >
                        <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="standard">Standard (Yellow)</SelectItem>
                          <SelectItem value="technical">Technical (Dark Gray)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export const TilesSegmentEditor = memo(TilesSegmentEditorComponent);
