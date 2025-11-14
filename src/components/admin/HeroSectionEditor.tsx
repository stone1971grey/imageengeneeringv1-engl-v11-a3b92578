import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, Trash2, Upload } from "lucide-react";
import { uploadImageToStorage } from "./ImageUploadUtils";

interface HeroSectionEditorProps {
  content: Record<string, string>;
  heroImageUrl: string;
  heroImagePosition: string;
  heroLayout: string;
  heroTopPadding: string;
  heroCtaLink: string;
  heroCtaStyle: string;
  onContentChange: (key: string, value: string) => void;
  onHeroImageUrlChange: (url: string) => void;
  onHeroImagePositionChange: (position: string) => void;
  onHeroLayoutChange: (layout: string) => void;
  onHeroTopPaddingChange: (padding: string) => void;
  onHeroCtaLinkChange: (link: string) => void;
  onHeroCtaStyleChange: (style: string) => void;
  onSave: () => void;
  onDelete: () => void;
}

export const HeroSectionEditor = ({
  content,
  heroImageUrl,
  heroImagePosition,
  heroLayout,
  heroTopPadding,
  heroCtaLink,
  heroCtaStyle,
  onContentChange,
  onHeroImageUrlChange,
  onHeroImagePositionChange,
  onHeroLayoutChange,
  onHeroTopPaddingChange,
  onHeroCtaLinkChange,
  onHeroCtaStyleChange,
  onSave,
  onDelete,
}: HeroSectionEditorProps) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const publicUrl = await uploadImageToStorage(file, 'hero-images');
    
    if (publicUrl) {
      onHeroImageUrlChange(publicUrl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>Main hero section at the top of the page</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hero_title">Title</Label>
            <Input
              id="hero_title"
              value={content.hero_title || ''}
              onChange={(e) => onContentChange('hero_title', e.target.value)}
              placeholder="Hero Title"
            />
          </div>
          <div>
            <Label htmlFor="hero_subtitle">Subtitle</Label>
            <Input
              id="hero_subtitle"
              value={content.hero_subtitle || ''}
              onChange={(e) => onContentChange('hero_subtitle', e.target.value)}
              placeholder="Hero Subtitle"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hero_description">Description</Label>
          <Textarea
            id="hero_description"
            value={content.hero_description || ''}
            onChange={(e) => onContentChange('hero_description', e.target.value)}
            placeholder="Hero Description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hero_cta">CTA Text</Label>
            <Input
              id="hero_cta"
              value={content.hero_cta || ''}
              onChange={(e) => onContentChange('hero_cta', e.target.value)}
              placeholder="Learn More"
            />
          </div>
          <div>
            <Label htmlFor="hero_cta_link">CTA Link</Label>
            <Input
              id="hero_cta_link"
              value={heroCtaLink}
              onChange={(e) => onHeroCtaLinkChange(e.target.value)}
              placeholder="#applications-start"
            />
          </div>
          <div>
            <Label htmlFor="hero_cta_style">CTA Style</Label>
            <Select value={heroCtaStyle} onValueChange={onHeroCtaStyleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Yellow)</SelectItem>
                <SelectItem value="technical">Technical (Dark)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hero_image_url">Hero Image</Label>
            <div className="flex gap-2">
              <Input
                id="hero_image_url"
                value={heroImageUrl}
                onChange={(e) => onHeroImageUrlChange(e.target.value)}
                placeholder="Image URL"
              />
              <Button variant="outline" onClick={() => document.getElementById('hero_image_file')?.click()}>
                <Upload className="h-4 w-4" />
              </Button>
              <input
                id="hero_image_file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {heroImageUrl && (
              <img src={heroImageUrl} alt="Hero preview" className="mt-2 w-full h-32 object-cover rounded" />
            )}
          </div>

          <div>
            <Label htmlFor="hero_image_position">Image Position</Label>
            <Select value={heroImagePosition} onValueChange={onHeroImagePositionChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hero_layout">Layout</Label>
            <Select value={heroLayout} onValueChange={onHeroLayoutChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50-50">50-50 Split</SelectItem>
                <SelectItem value="2-5">2-5 Split (Text 40%)</SelectItem>
                <SelectItem value="2-3">2-3 Split (Text 40%)</SelectItem>
                <SelectItem value="1-2">1-2 Split (Text 33%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hero_top_padding">Top Padding</Label>
            <Select value={heroTopPadding} onValueChange={onHeroTopPaddingChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="xlarge">X-Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Hero
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Hero Section?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the hero section from this page. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={onSave} className="bg-[#f9dc24] hover:bg-yellow-400 text-black">
            <Save className="mr-2 h-4 w-4" />
            Save Hero
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
