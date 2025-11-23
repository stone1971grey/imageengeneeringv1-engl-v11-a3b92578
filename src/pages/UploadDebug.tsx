import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const UploadDebug = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log('[UploadDebug]', message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addLog('handleFileSelect called');
    const file = e.target.files?.[0];
    
    if (!file) {
      addLog('No file selected');
      return;
    }
    
    addLog(`File selected: ${file.name}, size: ${file.size}, type: ${file.type}`);
    setSelectedFile(file);
    
    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    addLog('Preview URL created');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addLog('ERROR: No file to upload');
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    addLog('Starting upload...');

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID?.().substring(0, 8) || Math.random().toString(36).substring(2, 10);
      const fileName = `debug-upload-${uniqueId}-${Date.now()}.${fileExt}`;
      addLog(`Generated filename: ${fileName}`);

      addLog('Calling supabase.storage.upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, selectedFile, { upsert: false });

      if (uploadError) {
        addLog(`Upload ERROR: ${uploadError.message}`);
        throw uploadError;
      }

      addLog(`Upload successful! Data: ${JSON.stringify(uploadData)}`);

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      addLog(`Public URL generated: ${publicUrl}`);
      setUploadedUrl(publicUrl);
      toast.success('Upload successful!');

    } catch (error: any) {
      addLog(`CATCH ERROR: ${error.message}`);
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      addLog('Upload finished');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Selection */}
            <div className="space-y-2">
              <label className="text-white font-semibold block">Select Image File</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="bg-white border-2 border-gray-600 text-black cursor-pointer"
              />
              {selectedFile && (
                <p className="text-green-400">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <label className="text-white font-semibold block">Preview (Local)</label>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-sm border-2 border-gray-600 rounded"
                />
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload to Supabase Storage'}
            </Button>

            {/* Uploaded Image */}
            {uploadedUrl && (
              <div className="space-y-2">
                <label className="text-white font-semibold block">Uploaded Image (from Storage)</label>
                <img 
                  src={uploadedUrl} 
                  alt="Uploaded" 
                  className="max-w-sm border-2 border-green-600 rounded"
                />
                <p className="text-xs text-gray-400 break-all">{uploadedUrl}</p>
              </div>
            )}

            {/* Logs */}
            <div className="space-y-2">
              <label className="text-white font-semibold block">Debug Logs</label>
              <div className="bg-black p-4 rounded font-mono text-xs text-green-400 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Select a file to start.</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadDebug;
