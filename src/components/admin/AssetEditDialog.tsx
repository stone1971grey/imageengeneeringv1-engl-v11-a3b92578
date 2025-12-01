import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Save, FileText, Calendar, Weight, Image as ImageIcon, Database } from "lucide-react";

interface AssetEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    name: string;
    url: string;
    created_at: string;
    metadata: any;
    bucket_id: string;
    segmentIds?: string[];
    filePath: string;
    id: string;
  } | null;
  onSave: () => void;
}

export function AssetEditDialog({ isOpen, onClose, asset, onSave }: AssetEditDialogProps) {
  const [altText, setAltText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load alt text when dialog opens
  const loadAltText = async () => {
    if (!asset?.filePath) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_segment_mappings')
        .select('alt_text')
        .eq('file_path', asset.filePath)
        .eq('bucket_id', asset.bucket_id)
        .maybeSingle();
      
      if (error) throw error;
      
      setAltText(data?.alt_text || '');
    } catch (error: any) {
      console.error('Error loading alt text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load alt text when asset changes
  useEffect(() => {
    if (isOpen && asset) {
      loadAltText();
    }
  }, [isOpen, asset]);

  const handleSave = async () => {
    if (!asset?.filePath) return;
    
    setIsSaving(true);
    try {
      // Update or create the mapping with alt text
      const { error } = await supabase
        .from('file_segment_mappings')
        .upsert({
          file_path: asset.filePath,
          bucket_id: asset.bucket_id,
          segment_ids: asset.segmentIds || [],
          alt_text: altText,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'file_path,bucket_id'
        });
      
      if (error) throw error;
      
      toast.success('✅ Alt text saved successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving alt text:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!asset) return null;

  // Extract metadata info
  const fileName = asset.name.split('/').pop() || asset.name;
  const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'Unknown';
  const fileSize = asset.metadata?.size 
    ? (asset.metadata.size / 1024).toFixed(2) + ' KB'
    : 'Unknown';
  const createdDate = new Date(asset.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Edit Asset
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update alt text and view asset information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Asset Preview */}
          <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <img 
              src={asset.url} 
              alt={altText || fileName}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Format</div>
                <div className="text-sm font-medium">{fileExtension}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Size</div>
                <div className="text-sm font-medium">{fileSize}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Created</div>
                <div className="text-sm font-medium">{createdDate}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Filename</div>
                <div className="text-sm font-medium truncate max-w-[200px]" title={fileName}>
                  {fileName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <Database className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">Image ID</div>
                <div className="text-sm font-mono font-medium text-blue-400" title={asset.id}>
                  {asset.id}
                </div>
              </div>
            </div>
          </div>

          {/* Segment Assignments */}
          {asset.segmentIds && asset.segmentIds.length > 0 && (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Used in Segments:</div>
              <div className="flex flex-wrap gap-2">
                {asset.segmentIds.map(segmentId => (
                  <Badge 
                    key={segmentId}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                  >
                    #{segmentId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Alt Text Editor */}
          <div className="space-y-2">
            <Label htmlFor="alt-text" className="text-white">
              Alt Text (Image Description)
            </Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image for accessibility..."
              className="bg-gray-800 border-gray-700 text-white"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400">
              This alt text will be used in all segments that display this image.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
