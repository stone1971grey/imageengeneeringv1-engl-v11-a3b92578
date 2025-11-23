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
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePosition, setImagePosition] = useState<'left' | 'right'>('right');
  const [layoutRatio, setLayoutRatio] = useState<'1-1' | '2-3' | '2-5'>('1-1');
  const [topSpacing, setTopSpacing] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [kenBurnsEffect, setKenBurnsEffect] = useState<string>('standard');
  const [kenBurnsLoop, setKenBurnsLoop] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(15);
  const [gradientDirection, setGradientDirection] = useState<'none' | 'left-to-right' | 'right-to-left'>('none');
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
      setVideoUrl(content.videoUrl || "");
      setImagePosition(content.imagePosition || 'right');
      setLayoutRatio(content.layoutRatio || '1-1');
      setTopSpacing(content.topSpacing || 'medium');
      setKenBurnsEffect(content.kenBurnsEffect || 'standard');
      setKenBurnsLoop(content.kenBurnsLoop !== undefined ? content.kenBurnsLoop : true);
      setOverlayOpacity(content.overlayOpacity || 15);
      setGradientDirection(content.gradientDirection || 'none');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${pageSlug}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('page-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
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
      videoUrl,
      imagePosition,
      layoutRatio,
      topSpacing,
      kenBurnsEffect,
      kenBurnsLoop,
      overlayOpacity,
      gradientDirection,
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
                        onClick={() => setImageUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded" />
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