import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { uploadImageToStorage } from "./ImageUploadUtils";

interface SolutionItem {
  imageUrl: string;
  title: string;
  description: string;
  icon?: string;
  ctaLink?: string;
  ctaText?: string;
  ctaStyle?: string;
}

interface SolutionsSectionEditorProps {
  solutionsTitle: string;
  solutionsSubtext: string;
  solutionsLayout: string;
  solutionsItems: SolutionItem[];
  segmentId?: number;
  pageSlug?: string;
  onSolutionsTitleChange: (title: string) => void;
  onSolutionsSubtextChange: (subtext: string) => void;
  onSolutionsLayoutChange: (layout: string) => void;
  onSolutionsItemsChange: (items: SolutionItem[]) => void;
  onSave: () => void;
}

export const SolutionsSectionEditor = ({
  solutionsTitle,
  solutionsSubtext,
  solutionsLayout,
  solutionsItems,
  segmentId,
  pageSlug,
  onSolutionsTitleChange,
  onSolutionsSubtextChange,
  onSolutionsLayoutChange,
  onSolutionsItemsChange,
  onSave,
}: SolutionsSectionEditorProps) => {
  const handleAddItem = () => {
    const newItem: SolutionItem = {
      imageUrl: '',
      title: '',
      description: '',
      icon: '',
      ctaLink: '',
      ctaText: 'Learn More',
      ctaStyle: 'standard',
    };
    onSolutionsItemsChange([...solutionsItems, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    onSolutionsItemsChange(solutionsItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SolutionItem, value: string) => {
    const newItems = [...solutionsItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onSolutionsItemsChange(newItems);
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const publicUrl = await uploadImageToStorage(file, 'solution-images');
    
    if (publicUrl) {
      handleItemChange(index, 'imageUrl', publicUrl);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-white">Solutions / Image-Text Section</CardTitle>
            <CardDescription className="text-gray-300">Grid of solution items with images and descriptions{pageSlug && ` for ${pageSlug}`}</CardDescription>
            {segmentId && (
              <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                ID: {segmentId}
              </div>
            )}
          </div>
          <Button onClick={handleAddItem} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Solution
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="solutions_title">Section Title</Label>
            <Input
              id="solutions_title"
              value={solutionsTitle}
              onChange={(e) => onSolutionsTitleChange(e.target.value)}
              placeholder="Solutions Title"
            />
          </div>
          <div>
            <Label htmlFor="solutions_layout">Layout</Label>
            <Select value={solutionsLayout} onValueChange={onSolutionsLayoutChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-col">1 Column</SelectItem>
                <SelectItem value="2-col">2 Columns</SelectItem>
                <SelectItem value="3-col">3 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="solutions_subtext">Section Subtext</Label>
          <Textarea
            id="solutions_subtext"
            value={solutionsSubtext}
            onChange={(e) => onSolutionsSubtextChange(e.target.value)}
            placeholder="Solutions Subtext"
            rows={2}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Solution Items ({solutionsItems.length})</h4>
          {solutionsItems.map((item, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Solution {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={item.title}
                      onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                      placeholder="Solution title"
                    />
                  </div>
                  <div>
                    <Label>Icon Name (optional)</Label>
                    <Input
                      value={item.icon || ''}
                      onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                      placeholder="e.g., Camera, Monitor"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Solution description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={item.imageUrl}
                      onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)}
                      placeholder="Image URL"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`solution_image_${index}`)?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id={`solution_image_${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleItemImageUpload(e, index)}
                    />
                  </div>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="Solution preview" className="mt-2 w-full h-32 object-cover rounded" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>CTA Text (optional)</Label>
                    <Input
                      value={item.ctaText || ''}
                      onChange={(e) => handleItemChange(index, 'ctaText', e.target.value)}
                      placeholder="Learn More"
                    />
                  </div>
                  <div>
                    <Label>CTA Link (optional)</Label>
                    <Input
                      value={item.ctaLink || ''}
                      onChange={(e) => handleItemChange(index, 'ctaLink', e.target.value)}
                      placeholder="/path or #section"
                    />
                  </div>
                  <div>
                    <Label>CTA Style</Label>
                    <Select
                      value={item.ctaStyle || 'standard'}
                      onValueChange={(val) => handleItemChange(index, 'ctaStyle', val)}
                    >
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
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onSave} className="bg-[#f9dc24] hover:bg-yellow-400 text-black">
            <Save className="mr-2 h-4 w-4" />
            Save Solutions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
