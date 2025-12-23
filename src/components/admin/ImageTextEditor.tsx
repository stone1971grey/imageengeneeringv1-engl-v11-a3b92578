import { useState, useEffect, useCallback, memo } from "react";
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
import { SimpleRichTextEditor } from "./SimpleRichTextEditor";
import { MediaSelector } from "./MediaSelector";
import { createContentBackup } from "@/utils/createContentBackup";
import { updateSegmentMapping } from "@/utils/updateSegmentMapping";
import { loadAltTextFromMapping } from "@/utils/loadAltTextFromMapping";
import { syncAltTextToMediaManagement } from "@/utils/syncAltTextToMediaManagement";

interface ImageTextItem {
  title: string;
  description: string;
  imageUrl?: string;
  metadata?: any;
}

interface ImageTextData {
  title: string;
  subtext: string;
  layout: string;
  heroImageUrl?: string;
  heroImageMetadata?: any;
  items: ImageTextItem[];
}

interface ImageTextEditorProps {
  pageSlug: string;
  segmentId: string;
  language: 'en' | 'de' | 'ja' | 'ko' | 'zh';
  onSave?: () => void;
}

const ImageTextEditorComponent = ({ pageSlug, segmentId, language, onSave }: ImageTextEditorProps) => {
  const [title, setTitle] = useState("");
  const [subtext, setSubtext] = useState("");
  const [layout, setLayout] = useState("2-col");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageMetadata, setHeroImageMetadata] = useState<any>(null);
  const [items, setItems] = useState<ImageTextItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadContent();
  }, [pageSlug, segmentId, language]);

  // Listen for translate event from SplitScreenSegmentEditor
  useEffect(() => {
    if (language === 'en') return;

    const handleTranslate = () => {
      handleAutoTranslate();
    };

    window.addEventListener('image-text-translate', handleTranslate);
    return () => window.removeEventListener('image-text-translate', handleTranslate);
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
      const enImageTextSegment = enSegments.find((seg: any) => seg.id === segmentId);
      
      if (!enImageTextSegment?.data) {
        toast.error("No English Image & Text data found");
        return;
      }

      const enTitle = enImageTextSegment.data.title || '';
      const enSubtext = enImageTextSegment.data.subtext || '';
      const enItems = enImageTextSegment.data.items || [];

      // Prepare texts to translate
      const textsToTranslate: Record<string, string> = {
        "title": enTitle,
        "subtext": enSubtext
      };

      enItems.forEach((item: ImageTextItem, index: number) => {
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

        // Keep layout and images from English
        const enHeroUrl = enImageTextSegment.data.heroImageUrl || '';
        const enHeroMetadata = enImageTextSegment.data.heroImageMetadata || null;
        setLayout(enImageTextSegment.data.layout || '2-col');
        setHeroImageUrl(enHeroUrl);

        // Load language-specific alt-text for hero image from Media Management
        let heroMetadataWithAltText = enHeroMetadata;
        if (enHeroUrl) {
          const heroAltText = await loadAltTextFromMapping(enHeroUrl, 'page-images', language);
          if (heroAltText && enHeroMetadata) {
            heroMetadataWithAltText = { ...enHeroMetadata, altText: heroAltText };
          }
        }
        setHeroImageMetadata(heroMetadataWithAltText);

        // Translate items and load language-specific alt-texts for images
        const translatedItems = await Promise.all(
          enItems.map(async (item: ImageTextItem, index: number) => {
            let itemMetadata = item.metadata;
            
            // Load language-specific alt-text from Media Management
            if (item.imageUrl) {
              const itemAltText = await loadAltTextFromMapping(item.imageUrl, 'page-images', language);
              if (itemAltText) {
                itemMetadata = { ...item.metadata, altText: itemAltText };
              }
            }
            
            return {
              ...item,
              title: translated[`item_title_${index}`] || item.title,
              description: translated[`item_desc_${index}`] || item.description,
              metadata: itemMetadata
            };
          })
        );

        setItems(translatedItems);
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

      let foundContent = false;
      let loadedItems: ImageTextItem[] = [];
      let loadedHeroUrl = '';
      let loadedHeroMetadata: any = null;

      if (data?.content_value) {
        const segments = JSON.parse(data.content_value);
        const imageTextSegment = segments.find((seg: any) => seg.id === segmentId);
        
        if (imageTextSegment?.data) {
          setTitle(imageTextSegment.data.title || '');
          setSubtext(imageTextSegment.data.subtext || '');
          setLayout(imageTextSegment.data.layout || '2-col');
          loadedHeroUrl = imageTextSegment.data.heroImageUrl || '';
          loadedHeroMetadata = imageTextSegment.data.heroImageMetadata || null;
          loadedItems = imageTextSegment.data.items || [];
          foundContent = true;
        }
      }

      // Fallback to English if no content found for non-EN language
      if (language !== 'en' && !foundContent) {
        const { data: enData } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .eq("language", "en")
          .single();

        if (enData?.content_value) {
          const enSegments = JSON.parse(enData.content_value);
          const enImageTextSegment = enSegments.find((seg: any) => seg.id === segmentId);
          
          if (enImageTextSegment?.data) {
            setTitle(enImageTextSegment.data.title || '');
            setSubtext(enImageTextSegment.data.subtext || '');
            setLayout(enImageTextSegment.data.layout || '2-col');
            loadedHeroUrl = enImageTextSegment.data.heroImageUrl || '';
            loadedHeroMetadata = enImageTextSegment.data.heroImageMetadata || null;
            loadedItems = enImageTextSegment.data.items || [];
          }
        }
      }

      // Load current alt-texts from file_segment_mappings for all images
      if (loadedHeroUrl) {
        const heroAltText = await loadAltTextFromMapping(loadedHeroUrl, 'page-images', language);
        if (heroAltText && loadedHeroMetadata) {
          loadedHeroMetadata = { ...loadedHeroMetadata, altText: heroAltText };
        }
      }

      // Load alt-texts for all item images
      const itemsWithAltText = await Promise.all(
        loadedItems.map(async (item) => {
          if (item.imageUrl) {
            const altText = await loadAltTextFromMapping(item.imageUrl, 'page-images', language);
            if (altText) {
              return {
                ...item,
                metadata: { ...item.metadata, altText }
              };
            }
          }
          return item;
        })
      );

      setHeroImageUrl(loadedHeroUrl);
      setHeroImageMetadata(loadedHeroMetadata);
      setItems(itemsWithAltText);
    } catch (error: any) {
      console.error('Error loading image-text content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 🔐 BACKUP before saving
      await createContentBackup(pageSlug, 'page_segments', language);
      
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

      // CRITICAL: Always use String() for ID comparisons to prevent duplicates
      const segmentIdStr = String(segmentId);
      const segmentIndex = segments.findIndex((seg: any) => String(seg.id) === segmentIdStr);
      const updatedSegmentData = {
        title,
        subtext,
        layout,
        heroImageUrl,
        heroImageMetadata,
        items
      };

      if (segmentIndex >= 0) {
        segments[segmentIndex].id = segmentIdStr;
        segments[segmentIndex].data = updatedSegmentData;
      } else {
        // Create new segment entry if it doesn't exist
        segments.push({
          id: segmentIdStr,
          type: 'image-text',
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

      // Extract numeric segment ID for mapping
      const numericSegmentId = parseInt(segmentId.replace(/\D/g, '')) || 0;
      
      // Update segment mappings and sync alt-texts bidirectionally
      if (numericSegmentId > 0) {
        // Sync hero image alt-text
        if (heroImageUrl && heroImageMetadata?.altText) {
          await syncAltTextToMediaManagement(
            heroImageUrl,
            heroImageMetadata.altText,
            language,
            'page-images',
            false
          );
        }
        if (heroImageUrl) {
          await updateSegmentMapping(heroImageUrl, numericSegmentId, 'page-images', false, heroImageMetadata?.altText, language);
        }
        
        // Sync item images alt-texts
        for (const item of items) {
          if (item.imageUrl && item.metadata?.altText) {
            await syncAltTextToMediaManagement(
              item.imageUrl,
              item.metadata.altText,
              language,
              'page-images',
              false
            );
          }
          if (item.imageUrl) {
            await updateSegmentMapping(item.imageUrl, numericSegmentId, 'page-images', false, item.metadata?.altText, language);
          }
        }
        
        console.log(`[ImageTextEditor] Synced alt-texts and segment mappings for segment #${numericSegmentId} (${language})`);
      }

      toast.success(`Image & Text saved for ${language.toUpperCase()}!`);
      onSave?.();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Failed to save: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `segment-${segmentId}-hero-${Date.now()}.${fileExt}`;
      // Use pageSlug as folder path for proper organization
      const filePath = `${pageSlug}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Get image dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(resolve => img.onload = resolve);

      const metadata = {
        originalFileName: file.name,
        width: img.width,
        height: img.height,
        fileSizeKB: Math.round(file.size / 1024),
        format: fileExt,
        uploadDate: new Date().toISOString(),
        altText: ''
      };

      setHeroImageUrl(publicUrl);
      setHeroImageMetadata(metadata);
      
      // Create file segment mapping
      const numericSegmentId = parseInt(segmentId.replace(/\D/g, '')) || 0;
      if (numericSegmentId > 0) {
        await supabase
          .from('file_segment_mappings')
          .upsert({
            file_path: filePath,
            segment_ids: [String(numericSegmentId)],
            alt_text: '',
            visibility: 'public'
          }, { onConflict: 'file_path' });
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleItemImageUpload = async (itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9._-]/g, '_');
      const shortId = Math.random().toString(36).slice(2, 6);
      const fileName = `${baseName}-${shortId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      // Get image dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(resolve => img.onload = resolve);

      const metadata = {
        originalFileName: file.name,
        width: img.width,
        height: img.height,
        fileSizeKB: Math.round(file.size / 1024),
        format: fileExt,
        uploadDate: new Date().toISOString(),
        altText: ''
      };

      const newItems = [...items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        imageUrl: publicUrl,
        metadata
      };
      setItems(newItems);
      toast.success('Item image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { 
      title: 'New Item', 
      description: 'Add description here...',
      imageUrl: ''
    }]);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ImageTextItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const formatUploadDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handler for hero image file upload
  const handleHeroFileSelect = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9._-]/g, '_');
      const shortId = Math.random().toString(36).slice(2, 6);
      const fileName = `${baseName}-${shortId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(resolve => img.onload = resolve);

      const metadata = {
        originalFileName: file.name,
        width: img.width,
        height: img.height,
        fileSizeKB: Math.round(file.size / 1024),
        format: fileExt,
        uploadDate: new Date().toISOString(),
        altText: ''
      };

      setHeroImageUrl(publicUrl);
      setHeroImageMetadata(metadata);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handler for hero image media selection
  const handleHeroMediaSelect = (url: string, metadata?: any) => {
    if (!url) {
      setHeroImageUrl('');
      setHeroImageMetadata(null);
      return;
    }
    setHeroImageUrl(url);
    // Use alt_text from file_segment_mappings if available
    const altTextFromMapping = metadata?.alt_text || '';
    if (metadata) {
      setHeroImageMetadata({
        originalFileName: metadata.name || 'Media file',
        width: metadata.width || 0,
        height: metadata.height || 0,
        fileSizeKB: metadata.size ? Math.round(metadata.size / 1024) : 0,
        format: metadata.contentType?.split('/')[1] || 'unknown',
        uploadDate: metadata.created_at || new Date().toISOString(),
        altText: altTextFromMapping
      });
    }
    toast.success('Image selected from Media Management!');
    if (altTextFromMapping) {
      console.log('[ImageTextEditor] Hero alt-text loaded from Media Management:', altTextFromMapping);
    }
  };

  // Handler for item image file upload
  const handleItemFileSelect = async (itemIndex: number, file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const baseName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9._-]/g, '_');
      const shortId = Math.random().toString(36).slice(2, 6);
      const fileName = `${baseName}-${shortId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(resolve => img.onload = resolve);

      const metadata = {
        originalFileName: file.name,
        width: img.width,
        height: img.height,
        fileSizeKB: Math.round(file.size / 1024),
        format: fileExt,
        uploadDate: new Date().toISOString(),
        altText: ''
      };

      const newItems = [...items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        imageUrl: publicUrl,
        metadata
      };
      setItems(newItems);
      toast.success('Item image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Handler for item image media selection
  const handleItemMediaSelect = (itemIndex: number, url: string, metadata?: any) => {
    const newItems = [...items];
    if (!url) {
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        imageUrl: '',
        metadata: null
      };
    } else {
      // Use alt_text from file_segment_mappings if available
      const altTextFromMapping = metadata?.alt_text || '';
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        imageUrl: url,
        metadata: metadata ? {
          originalFileName: metadata.name || 'Media file',
          width: metadata.width || 0,
          height: metadata.height || 0,
          fileSizeKB: metadata.size ? Math.round(metadata.size / 1024) : 0,
          format: metadata.contentType?.split('/')[1] || 'unknown',
          uploadDate: metadata.created_at || new Date().toISOString(),
          altText: altTextFromMapping
        } : null
      };
      toast.success('Item image selected from Media Management!');
      if (altTextFromMapping) {
        console.log('[ImageTextEditor] Alt-text loaded from Media Management:', altTextFromMapping);
      }
    }
    setItems(newItems);
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

      {/* Hero Image Upload */}
      <Card className="bg-gray-700 border-gray-600">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-white mb-2 block">Section Image (optional)</Label>
            <MediaSelector
              onFileSelect={handleHeroFileSelect}
              onMediaSelect={handleHeroMediaSelect}
              currentImageUrl={heroImageUrl}
              label=""
            />
            
            {heroImageMetadata && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg border-2 border-gray-600 space-y-2">
                <h4 className="font-semibold text-white text-lg mb-3">Image Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Original Name:</span>
                    <p className="text-white font-medium">{heroImageMetadata.originalFileName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Dimensions:</span>
                    <p className="text-white font-medium">{heroImageMetadata.width} × {heroImageMetadata.height} px</p>
                  </div>
                  <div>
                    <span className="text-gray-400">File Size:</span>
                    <p className="text-white font-medium">{formatFileSize(heroImageMetadata.fileSizeKB)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Format:</span>
                    <p className="text-white font-medium uppercase">{heroImageMetadata.format}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-white text-base">Alt Text (SEO)</Label>
                  <Input
                    type="text"
                    value={heroImageMetadata.altText || ''}
                    onChange={(e) => setHeroImageMetadata({ ...heroImageMetadata, altText: e.target.value })}
                    placeholder="Describe this image for accessibility and SEO"
                    className="mt-2 bg-gray-700 border-2 border-gray-600 focus:border-[#f9dc24] text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section Settings */}
      <Card className="bg-gray-700 border-gray-600">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor={`imagetext-title-${language}`} className="text-white">Section Title (H2)</Label>
            <Input
              id={`imagetext-title-${language}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-gray-600 bg-gray-800 text-white"
            />
          </div>

          <div>
            <Label htmlFor={`imagetext-subtext-${language}`} className="text-white">Section Subtext (optional)</Label>
            <Textarea
              id={`imagetext-subtext-${language}`}
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              rows={2}
              className="border-2 border-gray-600 bg-gray-800 text-white"
            />
          </div>

          <div>
            <Label htmlFor={`imagetext-layout-${language}`} className="text-white">Layout</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger className="border-2 border-gray-600 bg-gray-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="1-col">1 Column (Full Width)</SelectItem>
                <SelectItem value="2-col">2 Columns</SelectItem>
                <SelectItem value="3-col">3 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Items ({items.length})</h3>
          <Button onClick={handleAddItem} className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={index} className="bg-gray-600 border-gray-500">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md">
                  Item {index + 1}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete Item {index + 1}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteItem(index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div>
                <Label className="text-white">Title</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  className="border-2 border-gray-600 bg-gray-800 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Description</Label>
                <SimpleRichTextEditor
                  value={item.description || ''}
                  onChange={(value) => handleItemChange(index, 'description', value)}
                  placeholder="Text eingeben..."
                  storageKey={`imagetext-${segmentId}-${index}`}
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Item Image (optional)</Label>
                <MediaSelector
                  onFileSelect={(file) => handleItemFileSelect(index, file)}
                  onMediaSelect={(url, metadata) => handleItemMediaSelect(index, url, metadata)}
                  currentImageUrl={item.imageUrl}
                  label=""
                />
                
                {item.metadata && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg border-2 border-gray-600 space-y-2">
                    <h4 className="font-semibold text-white text-lg mb-3">Image Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Original Name:</span>
                        <p className="text-white font-medium">{item.metadata.originalFileName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Dimensions:</span>
                        <p className="text-white font-medium">{item.metadata.width} × {item.metadata.height} px</p>
                      </div>
                      <div>
                        <span className="text-gray-400">File Size:</span>
                        <p className="text-white font-medium">{formatFileSize(item.metadata.fileSizeKB)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Format:</span>
                        <p className="text-white font-medium uppercase">{item.metadata.format}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label className="text-white text-base">Alt Text (SEO)</Label>
                      <Input
                        type="text"
                        value={item.metadata.altText || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index] = {
                            ...newItems[index],
                            metadata: { ...newItems[index].metadata, altText: e.target.value }
                          };
                          setItems(newItems);
                        }}
                        placeholder="Describe this image for accessibility and SEO"
                        className="mt-2 bg-gray-700 border-2 border-gray-600 focus:border-[#f9dc24] text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-600">
        <Button
          onClick={handleSave}
          disabled={isSaving || isTranslating}
          className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const ImageTextEditor = memo(ImageTextEditorComponent);
