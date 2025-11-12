import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MetaNavigationLink {
  label: string;
  anchor: string;
}

interface MetaNavigationData {
  links: MetaNavigationLink[];
}

interface MetaNavigationEditorProps {
  data: MetaNavigationData;
  onChange: (data: MetaNavigationData) => void;
  onSave: () => void;
}

const MetaNavigationEditor = ({ data, onChange, onSave }: MetaNavigationEditorProps) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleLinkChange = (index: number, field: keyof MetaNavigationLink, value: string) => {
    const updatedLinks = [...data.links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    onChange({ ...data, links: updatedLinks });
  };

  const handleAddLink = () => {
    onChange({
      ...data,
      links: [...data.links, { label: 'New Link', anchor: 'section' }]
    });
  };

  const handleDeleteLink = (index: number) => {
    const updatedLinks = data.links.filter((_, i) => i !== index);
    onChange({ ...data, links: updatedLinks });
    setDeleteIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Meta Navigation Settings</h3>
        <Button onClick={onSave} style={{ backgroundColor: '#f9dc24', color: 'black' }}>
          Save Changes
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-medium">Navigation Links</Label>
          <Button onClick={handleAddLink} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>

        {data.links.map((link, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Link {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteIndex(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Link Text</Label>
                <Input
                  value={link.label}
                  onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                  placeholder="e.g., Overview"
                />
              </div>
              <div>
                <Label>Target Segment</Label>
                <Select
                  value={link.anchor}
                  onValueChange={(value) => handleLinkChange(index, 'anchor', value)}
                >
                  <SelectTrigger className="bg-gray-700 text-white border-gray-600">
                    <SelectValue placeholder="Select target segment" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600 z-50">
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="tiles">Tiles Section</SelectItem>
                    <SelectItem value="banner">Banner Section</SelectItem>
                    <SelectItem value="solutions">Solutions Section</SelectItem>
                    <SelectItem value="applications">Applications</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this navigation link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIndex !== null && handleDeleteLink(deleteIndex)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MetaNavigationEditor;
