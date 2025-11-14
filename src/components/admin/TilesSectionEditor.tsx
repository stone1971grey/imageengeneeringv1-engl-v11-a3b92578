import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { uploadImageToStorage } from "./ImageUploadUtils";

interface TileItem {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
}

interface TilesSectionEditorProps {
  content: Record<string, string>;
  applications: TileItem[];
  tilesColumns: string;
  segmentId?: number;
  pageSlug?: string;
  onContentChange: (key: string, value: string) => void;
  onApplicationsChange: (apps: TileItem[]) => void;
  onTilesColumnsChange: (cols: string) => void;
  onSave: () => void;
}

export const TilesSectionEditor = ({
  content,
  applications,
  tilesColumns,
  segmentId,
  pageSlug,
  onContentChange,
  onApplicationsChange,
  onTilesColumnsChange,
  onSave,
}: TilesSectionEditorProps) => {
  const handleAddTile = () => {
    const newTile: TileItem = {
      title: '',
      description: '',
      ctaLink: '',
      ctaStyle: 'standard',
      ctaText: 'Learn More',
      imageUrl: '',
      icon: '',
    };
    onApplicationsChange([...applications, newTile]);
  };

  const handleDeleteTile = (index: number) => {
    onApplicationsChange(applications.filter((_, i) => i !== index));
  };

  const handleTileChange = (index: number, field: keyof TileItem, value: string) => {
    const newApps = [...applications];
    newApps[index] = { ...newApps[index], [field]: value };
    onApplicationsChange(newApps);
  };

  const handleTileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const publicUrl = await uploadImageToStorage(file, 'tile-images');
    
    if (publicUrl) {
      handleTileChange(index, 'imageUrl', publicUrl);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-white">Tiles / Applications Section</CardTitle>
            <CardDescription className="text-gray-300">Grid of application tiles with icons or images{pageSlug && ` for ${pageSlug}`}</CardDescription>
            {segmentId && (
              <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                ID: {segmentId}
              </div>
            )}
          </div>
          <Button onClick={handleAddTile} size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Tile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label htmlFor="applications_title">Section Title</Label>
            <Input
              id="applications_title"
              value={content.applications_title || ''}
              onChange={(e) => onContentChange('applications_title', e.target.value)}
              placeholder="Applications Title"
            />
          </div>
          <div>
            <Label htmlFor="tiles_columns">Columns</Label>
            <Select value={tilesColumns} onValueChange={onTilesColumnsChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="applications_description">Section Description</Label>
          <Textarea
            id="applications_description"
            value={content.applications_description || ''}
            onChange={(e) => onContentChange('applications_description', e.target.value)}
            placeholder="Applications Description"
            rows={2}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Tiles ({applications.length})</h4>
          {applications.map((app, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tile {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTile(index)}
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
                      value={app.title}
                      onChange={(e) => handleTileChange(index, 'title', e.target.value)}
                      placeholder="Tile title"
                    />
                  </div>
                  <div>
                    <Label>Icon Name</Label>
                    <Input
                      value={app.icon}
                      onChange={(e) => handleTileChange(index, 'icon', e.target.value)}
                      placeholder="e.g., Camera, Monitor"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={app.description}
                    onChange={(e) => handleTileChange(index, 'description', e.target.value)}
                    placeholder="Tile description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>CTA Text</Label>
                    <Input
                      value={app.ctaText}
                      onChange={(e) => handleTileChange(index, 'ctaText', e.target.value)}
                      placeholder="Learn More"
                    />
                  </div>
                  <div>
                    <Label>CTA Link</Label>
                    <Input
                      value={app.ctaLink}
                      onChange={(e) => handleTileChange(index, 'ctaLink', e.target.value)}
                      placeholder="/path or #section"
                    />
                  </div>
                  <div>
                    <Label>CTA Style</Label>
                    <Select
                      value={app.ctaStyle}
                      onValueChange={(val) => handleTileChange(index, 'ctaStyle', val)}
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

                <div>
                  <Label>Image (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={app.imageUrl}
                      onChange={(e) => handleTileChange(index, 'imageUrl', e.target.value)}
                      placeholder="Image URL"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`tile_image_${index}`)?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id={`tile_image_${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleTileImageUpload(e, index)}
                    />
                  </div>
                  {app.imageUrl && (
                    <img src={app.imageUrl} alt="Tile preview" className="mt-2 w-full h-24 object-cover rounded" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onSave} className="bg-[#f9dc24] hover:bg-yellow-400 text-black">
            <Save className="mr-2 h-4 w-4" />
            Save Tiles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
