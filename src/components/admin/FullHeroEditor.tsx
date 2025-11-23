import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Heading1 } from "lucide-react";
import { extractImageMetadata, ImageMetadata, formatFileSize, formatUploadDate } from '@/types/imageMetadata';

interface FullHeroEditorProps {
  pageSlug: string;
  segmentId: number;
  onSave: () => void;
}

export const FullHeroEditor = ({ pageSlug, segmentId, onSave }: FullHeroEditorProps) => {
  const [titleLine1, setTitleLine1] = useState("");
  const [titleLine2, setTitleLine2] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [button1Text, setButton1Text] = useState("");
  const [button1Link, setButton1Link] = useState("");
  const [button1Color, setButton1Color] = useState<'yellow' | 'black' | 'white'>('yellow');
  const [button2Text, setButton2Text] = useState("");
  const [button2Link, setButton2Link] = useState("");
  const [button2Color, setButton2Color] = useState<'yellow' | 'black' | 'white'>('black');
  const [backgroundType, setBackgroundType] = useState<'image' | 'video'>('image');
  const [imageUrl, setImageUrl] = useState("");
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>('right');
  const [layoutRatio, setLayoutRatio] = useState<'1-1' | '2-3' | '2-5'>('1-1');
  const [topSpacing, setTopSpacing] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [kenBurnsEffect, setKenBurnsEffect] = useState<string>('standard');
  const [kenBurnsLoop, setKenBurnsLoop] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(15);
  const [gradientDirection, setGradientDirection] = useState<'none' | 'left-to-right' | 'right-to-left'>('none');
  const [imageDimensions, setImageDimensions] = useState<'600x600' | '800x600' | '1200x800' | '1920x1080'>('600x600');
  const [cropPosition, setCropPosition] = useState<'top' | 'center' | 'bottom'>('center');
  const [isUploading, setIsUploading] = useState(false);
  const [isH1Segment, setIsH1Segment] = useState(false);

  useEffect(() => {
    loadContent();
    checkIfH1Segment();
  }, [pageSlug, segmentId]);

  const checkIfH1Segment = async () => {
    const { data: segments } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("deleted", false)
      .order("position", { ascending: true });

    if (!segments) return;

    const hasIntroSegment = segments.some(s => s.segment_type === "Intro");
    const currentSegmentKey = `full_hero_${segmentId}`;
    const firstContentSegment = segments[0];
    
    const isThisSegmentH1 = !hasIntroSegment && 
                            firstContentSegment?.segment_key === currentSegmentKey && 
                            firstContentSegment?.segment_type === "FullHero";
    setIsH1Segment(isThisSegmentH1);
  };

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("section_key", `full_hero_${segmentId}`);

    if (error) {
      console.error("Error loading full hero content:", error);
      return;
    }

    if (data && data.length > 0) {
      const content = JSON.parse(data[0].content_value);
      setTitleLine1(content.titleLine1 || "");
      setTitleLine2(content.titleLine2 || "");
      setSubtitle(content.subtitle || "");
      setButton1Text(content.button1Text || "");
      setButton1Link(content.button1Link || "");
      setButton1Color(content.button1Color || 'yellow');
      setButton2Text(content.button2Text || "");
      setButton2Link(content.button2Link || "");
      setButton2Color(content.button2Color || 'black');
      setBackgroundType(content.backgroundType || 'image');
      setImageUrl(content.imageUrl || "");
      setImageMetadata(content.imageMetadata || null);
      setVideoUrl(content.videoUrl || "");
      setImagePosition(content.imagePosition || 'right');
      setLayoutRatio(content.layoutRatio || '1-1');
      setTopSpacing(content.topSpacing || 'medium');
      setKenBurnsEffect(content.kenBurnsEffect || 'standard');
      setKenBurnsLoop(content.kenBurnsLoop !== undefined ? content.kenBurnsLoop : true);
      setOverlayOpacity(content.overlayOpacity || 15);
      setGradientDirection(content.gradientDirection || 'none');
      setImageDimensions(content.imageDimensions || '600x600');
      setCropPosition(content.cropPosition || 'center');
    }
  };

  const cropImage = async (file: File, dimensions: string, position: 'top' | 'center' | 'bottom'): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const [targetWidth, targetHeight] = dimensions.split('x').map(Number);
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Calculate scale to cover the entire target area
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center horizontally
        const x = (targetWidth - scaledWidth) / 2;
        
        // Calculate vertical position based on crop position
        let y: number;
        switch (position) {
          case 'top':
            y = 0;
            break;
          case 'bottom':
            y = targetHeight - scaledHeight;
            break;
          case 'center':
          default:
            y = (targetHeight - scaledHeight) / 2;
            break;
        }

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.92);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Crop the image first with selected position
      const croppedBlob = await cropImage(file, imageDimensions, cropPosition);
      const croppedFile = new File([croppedBlob], file.name, { type: 'image/jpeg' });

      const fileExt = 'jpg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${pageSlug}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('page-images')
        .upload(filePath, croppedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Extract metadata from cropped file
      const metadataWithoutAlt = await extractImageMetadata(croppedFile, publicUrl);
      const metadata: ImageMetadata = {
        ...metadataWithoutAlt,
        altText: imageMetadata?.altText || ''
      };

      setImageUrl(publicUrl);
      setImageMetadata(metadata);
      toast.success("Image uploaded and cropped successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAltTextChange = (newAltText: string) => {
    if (imageMetadata) {
      setImageMetadata({ ...imageMetadata, altText: newAltText });
    } else if (imageUrl) {
      // Create minimal metadata object if none exists
      setImageMetadata({
        url: imageUrl,
        originalFileName: '',
        width: 0,
        height: 0,
        fileSizeKB: 0,
        format: '',
        uploadDate: new Date().toISOString(),
        altText: newAltText
      });
    }
  };

  const handleSave = async () => {
    const content = {
      titleLine1,
      titleLine2,
      subtitle,
      button1Text,
      button1Link,
      button1Color,
      button2Text,
      button2Link,
      button2Color,
      backgroundType,
      imageUrl,
      imageMetadata,
      videoUrl,
      imagePosition,
      layoutRatio,
      topSpacing,
      kenBurnsEffect,
      kenBurnsLoop,
      overlayOpacity,
      gradientDirection,
      imageDimensions,
      cropPosition,
    };

    const { error } = await supabase
      .from("page_content")
      .upsert({
        page_slug: pageSlug,
        section_key: `full_hero_${segmentId}`,
        content_type: 'json',
        content_value: JSON.stringify(content),
      }, {
        onConflict: 'page_slug,section_key'
      });

    if (error) {
      console.error("Error saving full hero:", error);
      toast.error("Failed to save full hero");
      return;
    }

    toast.success("Full hero saved successfully");
    onSave();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Produkt Hero
          <span className="text-xs font-normal text-muted-foreground">[Segment ID: {segmentId}]</span>
        </CardTitle>
        <CardDescription>
          Fullscreen Hero mit zweizeiligem Titel, Untertitel, Buttons und Hintergrundbild/-video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isH1Segment && (
          <Alert className="border-primary/50 bg-primary/5">
            <Heading1 className="h-4 w-4" />
            <AlertDescription>
              Die Titelzeilen (Title Line 1 + Title Line 2) tragen die H1-Überschrift für SEO-Optimierung
            </AlertDescription>
          </Alert>
        )}
        
        {!isH1Segment && (
          <Alert className="border-muted bg-muted/20">
            <Heading1 className="h-4 w-4" />
            <AlertDescription>
              Die Titelzeilen (Title Line 1 + Title Line 2) werden als H2 dargestellt, da ein Intro-Segment die H1 trägt
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titleLine1">
                Title Line 1 (Light) {isH1Segment ? '- H1' : '- H2'}
              </Label>
              <Input
                id="titleLine1"
                value={titleLine1}
                onChange={(e) => setTitleLine1(e.target.value)}
                placeholder="Precision Engineering for"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titleLine2">
                Title Line 2 (Bold) {isH1Segment ? '- H1' : '- H2'}
              </Label>
              <Input
                id="titleLine2"
                value={titleLine2}
                onChange={(e) => setTitleLine2(e.target.value)}
                placeholder="Image Quality Testing"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Professional solutions for testing and calibrating camera systems..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Button 1</h3>
              <div className="space-y-2">
                <Label htmlFor="button1Text">Text</Label>
                <Input
                  id="button1Text"
                  value={button1Text}
                  onChange={(e) => setButton1Text(e.target.value)}
                  placeholder="Find Your Solution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button1Link">Link (use # for anchor)</Label>
                <Input
                  id="button1Link"
                  value={button1Link}
                  onChange={(e) => setButton1Link(e.target.value)}
                  placeholder="#section-id or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button1Color">Color</Label>
                <Select value={button1Color} onValueChange={(val: any) => setButton1Color(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Button 2 (Optional)</h3>
              <div className="space-y-2">
                <Label htmlFor="button2Text">Text</Label>
                <Input
                  id="button2Text"
                  value={button2Text}
                  onChange={(e) => setButton2Text(e.target.value)}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button2Link">Link (use # for anchor)</Label>
                <Input
                  id="button2Link"
                  value={button2Link}
                  onChange={(e) => setButton2Link(e.target.value)}
                  placeholder="#section-id or /path"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button2Color">Color</Label>
                <Select value={button2Color} onValueChange={(val: any) => setButton2Color(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <div className="space-y-2">
              <Label>Background Type</Label>
              <Select value={backgroundType} onValueChange={(val: any) => setBackgroundType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {backgroundType === 'image' ? (
              <>
                <div className="space-y-2">
                  <Label>Image Dimensions</Label>
                  <Select value={imageDimensions} onValueChange={(val: any) => setImageDimensions(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="600x600">600 × 600px (Square - Default)</SelectItem>
                      <SelectItem value="800x600">800 × 600px (4:3)</SelectItem>
                      <SelectItem value="1200x800">1200 × 800px (3:2)</SelectItem>
                      <SelectItem value="1920x1080">1920 × 1080px (16:9)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Uploaded images will be automatically cropped to this size
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Crop Position (Vertical)</Label>
                  <Select value={cropPosition} onValueChange={(val: any) => setCropPosition(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top (Crop from bottom)</SelectItem>
                      <SelectItem value="center">Center (Crop equally)</SelectItem>
                      <SelectItem value="bottom">Bottom (Crop from top)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Vertical position of the crop area when scaling the image
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Upload Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {imageUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setImageUrl("");
                          setImageMetadata(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {imageUrl && (
                    <div className="mt-4 space-y-4">
                      <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      
                      {/* Image Metadata Display - Always show if image exists */}
                      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-white mb-2">Image Information</h4>
                        
                        {imageMetadata ? (
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400">Filename:</span>
                              <p className="text-white truncate">{imageMetadata.originalFileName}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Format:</span>
                              <p className="text-white">{imageMetadata.format}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Dimensions:</span>
                              <p className="text-white">{imageMetadata.width} × {imageMetadata.height}px</p>
                            </div>
                            <div>
                              <span className="text-gray-400">File Size:</span>
                              <p className="text-white">{formatFileSize(imageMetadata.fileSizeKB)}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-400">Upload Date:</span>
                              <p className="text-white">{formatUploadDate(imageMetadata.uploadDate)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 pb-2">
                            Upload a new image to see detailed metadata information
                          </div>
                        )}
                        
                        {/* Alt Text Field - Always visible */}
                        <div className="pt-3 border-t border-gray-700">
                          <Label htmlFor="imageAltText" className="text-white text-sm mb-2 block">
                            Alt Text (SEO & Accessibility)
                          </Label>
                          <Textarea
                            id="imageAltText"
                            value={imageMetadata?.altText || ''}
                            onChange={(e) => handleAltTextChange(e.target.value)}
                            placeholder="Describe this image for SEO and accessibility..."
                            className="bg-white border-2 border-gray-600 text-black placeholder:text-gray-400 min-h-[60px]"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Provide a descriptive alternative text for screen readers and SEO
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Ken Burns Effect</Label>
                  <Select value={kenBurnsEffect} onValueChange={setKenBurnsEffect}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="zoom-out">Zoom Out</SelectItem>
                      <SelectItem value="pan-left">Pan Left</SelectItem>
                      <SelectItem value="pan-right">Pan Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kenBurnsLoop"
                      checked={kenBurnsLoop}
                      onCheckedChange={(checked) => setKenBurnsLoop(checked === true)}
                    />
                    <Label htmlFor="kenBurnsLoop" className="cursor-pointer font-normal">
                      Loop Animation (Continuous)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    When unchecked, animation plays once and pauses. When checked, animation loops continuously.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Overlay Opacity: {overlayOpacity}%</Label>
              <Slider
                value={[overlayOpacity]}
                onValueChange={(val) => setOverlayOpacity(val[0])}
                min={0}
                max={80}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Gradient Direction</Label>
              <Select value={gradientDirection} onValueChange={(val: any) => setGradientDirection(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Gradient (Uniform)</SelectItem>
                  <SelectItem value="left-to-right">Left to Right (Darker → Lighter)</SelectItem>
                  <SelectItem value="right-to-left">Right to Left (Lighter → Darker)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Gradient creates a smooth transition from darker to lighter overlay
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} className="w-full">
          Save Full Hero
        </Button>
      </CardContent>
    </Card>
  );
};