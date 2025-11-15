import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { availableIcons, IconName, IndustryItem } from "@/components/segments/IndustriesSegment";

interface IndustriesSegmentEditorProps {
  data: {
    title?: string;
    subtitle?: string;
    columns?: number;
    items?: IndustryItem[];
  };
  onChange: (data: any) => void;
}

export const IndustriesSegmentEditor = ({ data, onChange }: IndustriesSegmentEditorProps) => {
  const items = data.items || [];
  const columns = data.columns || 4;

  const handleAddItem = () => {
    const newItem: IndustryItem = {
      icon: 'Camera',
      title: 'New Industry',
      description: 'Description',
      link: ''
    };
    onChange({ ...data, items: [...items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const handleItemChange = (index: number, field: keyof IndustryItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  return (
    <div className="space-y-6 p-4 bg-background border rounded-lg">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="font-medium">Titel (H2)</Label>
          <Input
            id="title"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="z.B. Trusted Across All Industries"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="subtitle" className="font-medium">Subtitle</Label>
          <Input
            id="subtitle"
            value={data.subtitle || ''}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
            placeholder="z.B. Professional solutions for diverse applications"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="columns" className="font-medium">Spaltenzahl (1-4)</Label>
          <Select
            value={columns.toString()}
            onValueChange={(value) => onChange({ ...data, columns: parseInt(value) })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Spalte</SelectItem>
              <SelectItem value="2">2 Spalten</SelectItem>
              <SelectItem value="3">3 Spalten</SelectItem>
              <SelectItem value="4">4 Spalten</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-medium text-lg">Industries ({items.length})</Label>
          <Button
            type="button"
            onClick={handleAddItem}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Industry {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  className="ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Icon</Label>
                  <Select
                    value={item.icon}
                    onValueChange={(value) => handleItemChange(index, 'icon', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(availableIcons).map((iconName) => {
                        const Icon = availableIcons[iconName as IconName];
                        return (
                          <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{iconName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Titel</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                    placeholder="Industry Name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Beschreibung</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Kurze Beschreibung..."
                  rows={2}
                  className="mt-1 resize-none"
                />
              </div>

              <div>
                <Label className="text-xs">Link (Optional)</Label>
                <Input
                  value={item.link || ''}
                  onChange={(e) => handleItemChange(index, 'link', e.target.value)}
                  placeholder="/automotive"
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Keine Industries vorhanden. Klicke auf "Hinzufügen" um eine hinzuzufügen.
          </div>
        )}
      </div>
    </div>
  );
};
