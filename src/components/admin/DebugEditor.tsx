import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DebugEditorProps {
  data: {
    title?: string;
    imageUrl?: string;
  };
  onChange: (data: any) => void;
  onSave: () => void;
  pageSlug: string;
  segmentId: number;
}

const DebugEditor = ({ data, onChange, onSave, pageSlug, segmentId }: DebugEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    const logEntry = `${new Date().toLocaleTimeString()}: ${message}`;
    console.log(`[DebugEditor] ${message}`);
    setStatusLog(prev => [...prev, logEntry]);
    toast.info(message, { duration: 5000 });
  };

  // Separate handler for button click
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addLog('🔵 Button clicked - Opening file dialog');
    fileInputRef.current?.click();
  };

  // Separate handler for file selection
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    addLog('🟢 File input onChange fired!');
    
    const files = e.target.files;
    addLog(`Files object: ${files ? `${files.length} file(s)` : 'null'}`);
    
    if (!files || files.length === 0) {
      addLog('⚠️ No file selected');
      return;
    }

    const file = files[0];
    addLog(`✅ File selected: ${file.name} (${Math.round(file.size / 1024)}KB, ${file.type})`);


    // Validate file type
    if (!file.type.startsWith('image/')) {
      addLog('❌ ERROR: Not an image file');
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      addLog('❌ ERROR: File too large (max 5MB)');
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    addLog('🚀 Starting upload process...');

    try {
      // Convert file to base64
      addLog('Converting file to base64...');
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          addLog('File converted to base64 successfully');
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          addLog('ERROR: FileReader failed');
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });

      const fileData = await fileDataPromise;

      // Get auth token
      addLog('Checking authentication...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        addLog('ERROR: No active session');
        throw new Error('No active session - please log in again');
      }
      addLog(`Authenticated as: ${session.user.email}`);

      // Call Edge Function
      addLog('Calling upload-image Edge Function...');
      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-image', {
        body: {
          fileName: file.name,
          fileData: fileData,
          bucket: 'page-images',
          folder: pageSlug,
          segmentId: segmentId
        }
      });

      addLog(`Edge Function response received`);
      console.log('[DebugEditor] Full response:', { uploadResult, uploadError });

      if (uploadError) {
        addLog(`ERROR from Edge Function: ${uploadError.message}`);
        throw uploadError;
      }

      if (!uploadResult?.success) {
        const errorMsg = uploadResult?.error || 'Upload failed without error message';
        addLog(`ERROR: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      addLog(`Upload successful! URL: ${uploadResult.url}`);
      onChange({ ...data, imageUrl: uploadResult.url });
      toast.success('Image uploaded successfully!');

      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      addLog(`FATAL ERROR: ${errorMsg}`);
      console.error('[DebugEditor] Upload failed:', error);
      toast.error('Upload failed: ' + errorMsg);
    } finally {
      setUploading(false);
      addLog('Upload process completed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Debug Segment
          <span className="text-xs font-normal text-muted-foreground">[Segment ID: {segmentId}]</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="debug-title">Title (Optional)</Label>
          <Input
            id="debug-title"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Enter debug title"
          />
        </div>

        <div className="space-y-2">
          <Label>Upload Image</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Test the image upload pipeline
          </p>
          
          {data.imageUrl && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <img
                src={data.imageUrl}
                alt="Debug preview"
                className="max-h-48 mx-auto object-contain"
              />
              <p className="text-xs text-center text-gray-600 mt-2 break-all">{data.imageUrl}</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            disabled={uploading}
            style={{ display: 'none' }}
            key={Date.now()} // Force remount on each render to ensure fresh state
          />
          
          <Button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            variant="outline"
            className="w-full"
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </>
            )}
          </Button>

          {/* Status Log */}
          {statusLog.length > 0 && (
            <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
              <p className="text-xs font-mono text-green-400 mb-2">Upload Status Log:</p>
              {statusLog.map((log, idx) => (
                <p key={idx} className="text-xs font-mono text-gray-300 mb-1">
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={onSave}
            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugEditor;
