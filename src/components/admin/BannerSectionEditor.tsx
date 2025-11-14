import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { uploadImageToStorage } from "./ImageUploadUtils";

interface BannerImage {
  imageUrl: string;
  altText: string;
}

interface BannerSectionEditorProps {
  bannerTitle: string;
  bannerSubtext: string;
  bannerImages: BannerImage[];
  bannerButtonText: string;
  bannerButtonLink: string;
  bannerButtonStyle: string;
  onBannerTitleChange: (title: string) => void;
  onBannerSubtextChange: (subtext: string) => void;
  onBannerImagesChange: (images: BannerImage[]) => void;
  onBannerButtonTextChange: (text: string) => void;
  onBannerButtonLinkChange: (link: string) => void;
  onBannerButtonStyleChange: (style: string) => void;
  onSave: () => void;
}

export const BannerSectionEditor = ({
  bannerTitle,
  bannerSubtext,
  bannerImages,
  bannerButtonText,
  bannerButtonLink,
  bannerButtonStyle,
  onBannerTitleChange,
  onBannerSubtextChange,
  onBannerImagesChange,
  onBannerButtonTextChange,
  onBannerButtonLinkChange,
  onBannerButtonStyleChange,
  onSave,
}: BannerSectionEditorProps) => {
  const handleAddImage = () => {
    const newImage: BannerImage = {
      imageUrl: '',
      altText: '',
    };
    onBannerImagesChange([...bannerImages, newImage]);
  };

  const handleDeleteImage = (index: number) => {
    onBannerImagesChange(bannerImages.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, field: keyof BannerImage, value: string) => {
    const newImages = [...bannerImages];
    newImages[index] = { ...newImages[index], [field]: value };
    onBannerImagesChange(newImages);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const publicUrl = await uploadImageToStorage(file, 'banner-images');
    
    if (publicUrl) {
      handleImageChange(index, 'imageUrl', publicUrl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Banner / Logo Section</CardTitle>
            <CardDescription>Partner logos or certification badges</CardDescription>
          </div>
          <Button onClick={handleAddImage} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="banner_title">Banner Title</Label>
          <Input
            id="banner_title"
            value={bannerTitle}
            onChange={(e) => onBannerTitleChange(e.target.value)}
            placeholder="Banner Title"
          />
        </div>

        <div>
          <Label htmlFor="banner_subtext">Banner Subtext</Label>
          <Textarea
            id="banner_subtext"
            value={bannerSubtext}
            onChange={(e) => onBannerSubtextChange(e.target.value)}
            placeholder="Banner Subtext"
            rows={2}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Banner Images ({bannerImages.length})</h4>
          {bannerImages.map((image, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Image {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteImage(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={image.imageUrl}
                      onChange={(e) => handleImageChange(index, 'imageUrl', e.target.value)}
                      placeholder="Image URL"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`banner_image_${index}`)?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id={`banner_image_${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleBannerImageUpload(e, index)}
                    />
                  </div>
                  {image.imageUrl && (
                    <img src={image.imageUrl} alt="Banner preview" className="mt-2 w-full h-24 object-contain rounded bg-gray-100" />
                  )}
                </div>

                <div>
                  <Label>Alt Text</Label>
                  <Input
                    value={image.altText}
                    onChange={(e) => handleImageChange(index, 'altText', e.target.value)}
                    placeholder="Image description"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="banner_button_text">Button Text</Label>
            <Input
              id="banner_button_text"
              value={bannerButtonText}
              onChange={(e) => onBannerButtonTextChange(e.target.value)}
              placeholder="Button Text"
            />
          </div>
          <div>
            <Label htmlFor="banner_button_link">Button Link</Label>
            <Input
              id="banner_button_link"
              value={bannerButtonLink}
              onChange={(e) => onBannerButtonLinkChange(e.target.value)}
              placeholder="/path or URL"
            />
          </div>
          <div>
            <Label htmlFor="banner_button_style">Button Style</Label>
            <Select value={bannerButtonStyle} onValueChange={onBannerButtonStyleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onSave} className="bg-[#f9dc24] hover:bg-yellow-400 text-black">
            <Save className="mr-2 h-4 w-4" />
            Save Banner
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
