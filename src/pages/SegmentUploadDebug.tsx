import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const SegmentUploadDebug = () => {
  // Full Hero
  const [fullHeroFile, setFullHeroFile] = useState<File | null>(null);
  const [fullHeroPreview, setFullHeroPreview] = useState<string>("");
  const [fullHeroUrl, setFullHeroUrl] = useState<string>("");
  const [fullHeroUploading, setFullHeroUploading] = useState(false);
  
  // Product Hero Gallery
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string>("");
  const [galleryUrl, setGalleryUrl] = useState<string>("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  
  // Tiles
  const [tilesFile, setTilesFile] = useState<File | null>(null);
  const [tilesPreview, setTilesPreview] = useState<string>("");
  const [tilesUrl, setTilesUrl] = useState<string>("");
  const [tilesUploading, setTilesUploading] = useState(false);
  
  // Banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [bannerUploading, setBannerUploading] = useState(false);
  
  // Image & Text
  const [imageTextFile, setImageTextFile] = useState<File | null>(null);
  const [imageTextPreview, setImageTextPreview] = useState<string>("");
  const [imageTextUrl, setImageTextUrl] = useState<string>("");
  const [imageTextUploading, setImageTextUploading] = useState(false);
  
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log('[SegmentUploadDebug]', message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Full Hero Upload
  const handleFullHeroSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addLog('Full Hero: No file selected');
      return;
    }
    addLog(`Full Hero: File selected - ${file.name}, ${file.size} bytes, ${file.type}`);
    setFullHeroFile(file);
    setFullHeroPreview(URL.createObjectURL(file));
  };

  const handleFullHeroUpload = async () => {
    if (!fullHeroFile) {
      addLog('Full Hero: ERROR - No file to upload');
      toast.error('Please select a file first');
      return;
    }

    setFullHeroUploading(true);
    addLog('Full Hero: Starting upload...');

    try {
      const fileExt = fullHeroFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID?.().substring(0, 8) || Math.random().toString(36).substring(2, 10);
      const fileName = `debug/full-hero-${uniqueId}-${Date.now()}.${fileExt}`;
      addLog(`Full Hero: Generated filename - ${fileName}`);

      addLog('Full Hero: Calling supabase.storage.upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, fullHeroFile, { upsert: false });

      if (uploadError) {
        addLog(`Full Hero: Upload ERROR - ${uploadError.message}`);
        throw uploadError;
      }

      addLog(`Full Hero: Upload successful! Data: ${JSON.stringify(uploadData)}`);

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      addLog(`Full Hero: Public URL generated - ${publicUrl}`);
      setFullHeroUrl(publicUrl);
      toast.success('Full Hero upload successful!');

    } catch (error: any) {
      addLog(`Full Hero: CATCH ERROR - ${error.message}`);
      toast.error('Full Hero upload failed: ' + error.message);
    } finally {
      setFullHeroUploading(false);
      addLog('Full Hero: Upload finished');
    }
  };

  // Product Hero Gallery Upload
  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addLog('Gallery: No file selected');
      return;
    }
    addLog(`Gallery: File selected - ${file.name}, ${file.size} bytes, ${file.type}`);
    setGalleryFile(file);
    setGalleryPreview(URL.createObjectURL(file));
  };

  const handleGalleryUpload = async () => {
    if (!galleryFile) {
      addLog('Gallery: ERROR - No file to upload');
      toast.error('Please select a file first');
      return;
    }

    setGalleryUploading(true);
    addLog('Gallery: Starting upload...');

    try {
      const fileExt = galleryFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID?.().substring(0, 8) || Math.random().toString(36).substring(2, 10);
      const fileName = `debug/gallery-${uniqueId}-${Date.now()}.${fileExt}`;
      addLog(`Gallery: Generated filename - ${fileName}`);

      addLog('Gallery: Calling supabase.storage.upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, galleryFile, { upsert: false });

      if (uploadError) {
        addLog(`Gallery: Upload ERROR - ${uploadError.message}`);
        throw uploadError;
      }

      addLog(`Gallery: Upload successful! Data: ${JSON.stringify(uploadData)}`);

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      addLog(`Gallery: Public URL generated - ${publicUrl}`);
      setGalleryUrl(publicUrl);
      toast.success('Gallery upload successful!');

    } catch (error: any) {
      addLog(`Gallery: CATCH ERROR - ${error.message}`);
      toast.error('Gallery upload failed: ' + error.message);
    } finally {
      setGalleryUploading(false);
      addLog('Gallery: Upload finished');
    }
  };

  // Tiles Upload
  const handleTilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addLog('Tiles: No file selected');
      return;
    }
    addLog(`Tiles: File selected - ${file.name}, ${file.size} bytes, ${file.type}`);
    setTilesFile(file);
    setTilesPreview(URL.createObjectURL(file));
  };

  const handleTilesUpload = async () => {
    if (!tilesFile) {
      addLog('Tiles: ERROR - No file to upload');
      toast.error('Please select a file first');
      return;
    }

    setTilesUploading(true);
    addLog('Tiles: Starting upload...');

    try {
      const fileExt = tilesFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID?.().substring(0, 8) || Math.random().toString(36).substring(2, 10);
      const fileName = `debug/tiles-${uniqueId}-${Date.now()}.${fileExt}`;
      addLog(`Tiles: Generated filename - ${fileName}`);

      addLog('Tiles: Calling supabase.storage.upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, tilesFile, { upsert: false });

      if (uploadError) {
        addLog(`Tiles: Upload ERROR - ${uploadError.message}`);
        throw uploadError;
      }

      addLog(`Tiles: Upload successful! Data: ${JSON.stringify(uploadData)}`);

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      addLog(`Tiles: Public URL generated - ${publicUrl}`);
      setTilesUrl(publicUrl);
      toast.success('Tiles upload successful!');

    } catch (error: any) {
      addLog(`Tiles: CATCH ERROR - ${error.message}`);
      toast.error('Tiles upload failed: ' + error.message);
    } finally {
      setTilesUploading(false);
      addLog('Tiles: Upload finished');
    }
  };

  // Banner Upload
  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addLog('Banner: No file selected');
      return;
    }
    addLog(`Banner: File selected - ${file.name}, ${file.size} bytes, ${file.type}`);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleBannerUpload = async () => {
    if (!bannerFile) {
      addLog('Banner: ERROR - No file to upload');
      toast.error('Please select a file first');
      return;
    }

    setBannerUploading(true);
    addLog('Banner: Starting upload...');

    try {
      const fileExt = bannerFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID?.().substring(0, 8) || Math.random().toString(36).substring(2, 10);
      const fileName = `debug/banner-${uniqueId}-${Date.now()}.${fileExt}`;
      addLog(`Banner: Generated filename - ${fileName}`);

      addLog('Banner: Calling supabase.storage.upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, bannerFile, { upsert: false });

      if (uploadError) {
        addLog(`Banner: Upload ERROR - ${uploadError.message}`);
        throw uploadError;
      }

      addLog(`Banner: Upload successful! Data: ${JSON.stringify(uploadData)}`);

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      addLog(`Banner: Public URL generated - ${publicUrl}`);
      setBannerUrl(publicUrl);
      toast.success('Banner upload successful!');

    } catch (error: any) {
      addLog(`Banner: CATCH ERROR - ${error.message}`);
      toast.error('Banner upload failed: ' + error.message);
    } finally {
      setBannerUploading(false);
      addLog('Banner: Upload finished');
    }
  };

  // Image & Text Upload
  const handleImageTextSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      addLog('Image&Text: No file selected');
      return;
    }
    addLog(`Image&Text: File selected - ${file.name}, ${file.size} bytes, ${file.type}`);
    setImageTextFile(file);
    setImageTextPreview(URL.createObjectURL(file));
  };

  const handleImageTextUpload = async () => {
    if (!imageTextFile) {
      addLog('Image&Text: ERROR - No file to upload');
      toast.error('Please select a file first');
      return;
    }

    setImageTextUploading(true);
    addLog('Image&Text: Starting upload...');

    try {
      const fileExt = imageTextFile.name.split('.').pop();
      const uniqueId = crypto.randomUUID?.().substring(0, 8) || Math.random().toString(36).substring(2, 10);
      const fileName = `debug/image-text-${uniqueId}-${Date.now()}.${fileExt}`;
      addLog(`Image&Text: Generated filename - ${fileName}`);

      addLog('Image&Text: Calling supabase.storage.upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('page-images')
        .upload(fileName, imageTextFile, { upsert: false });

      if (uploadError) {
        addLog(`Image&Text: Upload ERROR - ${uploadError.message}`);
        throw uploadError;
      }

      addLog(`Image&Text: Upload successful! Data: ${JSON.stringify(uploadData)}`);

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(fileName);

      addLog(`Image&Text: Public URL generated - ${publicUrl}`);
      setImageTextUrl(publicUrl);
      toast.success('Image&Text upload successful!');

    } catch (error: any) {
      addLog(`Image&Text: CATCH ERROR - ${error.message}`);
      toast.error('Image&Text upload failed: ' + error.message);
    } finally {
      setImageTextUploading(false);
      addLog('Image&Text: Upload finished');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Segment Upload Debug Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Full Hero Upload */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Full Hero Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFullHeroSelect}
                className="bg-white border-2 border-gray-600 text-black cursor-pointer"
              />
              {fullHeroFile && (
                <p className="text-green-400">
                  Selected: {fullHeroFile.name} ({(fullHeroFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {fullHeroPreview && (
                <div>
                  <p className="text-white mb-2">Preview:</p>
                  <img src={fullHeroPreview} alt="Preview" className="max-w-full h-40 object-cover rounded border-2 border-gray-600" />
                </div>
              )}
              <Button
                onClick={handleFullHeroUpload}
                disabled={!fullHeroFile || fullHeroUploading}
                className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              >
                {fullHeroUploading ? 'Uploading...' : 'Upload Full Hero Image'}
              </Button>
              {fullHeroUrl && (
                <div>
                  <p className="text-white mb-2">Uploaded:</p>
                  <img src={fullHeroUrl} alt="Uploaded" className="max-w-full h-40 object-cover rounded border-2 border-green-600" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Hero Gallery Upload */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Product Hero Gallery Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleGallerySelect}
                className="bg-white border-2 border-gray-600 text-black cursor-pointer"
              />
              {galleryFile && (
                <p className="text-green-400">
                  Selected: {galleryFile.name} ({(galleryFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {galleryPreview && (
                <div>
                  <p className="text-white mb-2">Preview:</p>
                  <img src={galleryPreview} alt="Preview" className="max-w-full h-40 object-cover rounded border-2 border-gray-600" />
                </div>
              )}
              <Button
                onClick={handleGalleryUpload}
                disabled={!galleryFile || galleryUploading}
                className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              >
                {galleryUploading ? 'Uploading...' : 'Upload Gallery Image'}
              </Button>
              {galleryUrl && (
                <div>
                  <p className="text-white mb-2">Uploaded:</p>
                  <img src={galleryUrl} alt="Uploaded" className="max-w-full h-40 object-cover rounded border-2 border-green-600" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tiles Upload */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Tiles Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleTilesSelect}
                className="bg-white border-2 border-gray-600 text-black cursor-pointer"
              />
              {tilesFile && (
                <p className="text-green-400">
                  Selected: {tilesFile.name} ({(tilesFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {tilesPreview && (
                <div>
                  <p className="text-white mb-2">Preview:</p>
                  <img src={tilesPreview} alt="Preview" className="max-w-full h-40 object-cover rounded border-2 border-gray-600" />
                </div>
              )}
              <Button
                onClick={handleTilesUpload}
                disabled={!tilesFile || tilesUploading}
                className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              >
                {tilesUploading ? 'Uploading...' : 'Upload Tiles Image'}
              </Button>
              {tilesUrl && (
                <div>
                  <p className="text-white mb-2">Uploaded:</p>
                  <img src={tilesUrl} alt="Uploaded" className="max-w-full h-40 object-cover rounded border-2 border-green-600" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Banner Upload */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Banner Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleBannerSelect}
                className="bg-white border-2 border-gray-600 text-black cursor-pointer"
              />
              {bannerFile && (
                <p className="text-green-400">
                  Selected: {bannerFile.name} ({(bannerFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {bannerPreview && (
                <div>
                  <p className="text-white mb-2">Preview:</p>
                  <img src={bannerPreview} alt="Preview" className="max-w-full h-40 object-cover rounded border-2 border-gray-600" />
                </div>
              )}
              <Button
                onClick={handleBannerUpload}
                disabled={!bannerFile || bannerUploading}
                className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              >
                {bannerUploading ? 'Uploading...' : 'Upload Banner Image'}
              </Button>
              {bannerUrl && (
                <div>
                  <p className="text-white mb-2">Uploaded:</p>
                  <img src={bannerUrl} alt="Uploaded" className="max-w-full h-40 object-cover rounded border-2 border-green-600" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image & Text Upload */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Image & Text Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageTextSelect}
                className="bg-white border-2 border-gray-600 text-black cursor-pointer"
              />
              {imageTextFile && (
                <p className="text-green-400">
                  Selected: {imageTextFile.name} ({(imageTextFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
              {imageTextPreview && (
                <div>
                  <p className="text-white mb-2">Preview:</p>
                  <img src={imageTextPreview} alt="Preview" className="max-w-full h-40 object-cover rounded border-2 border-gray-600" />
                </div>
              )}
              <Button
                onClick={handleImageTextUpload}
                disabled={!imageTextFile || imageTextUploading}
                className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              >
                {imageTextUploading ? 'Uploading...' : 'Upload Image & Text Image'}
              </Button>
              {imageTextUrl && (
                <div>
                  <p className="text-white mb-2">Uploaded:</p>
                  <img src={imageTextUrl} alt="Uploaded" className="max-w-full h-40 object-cover rounded border-2 border-green-600" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Logs */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black p-4 rounded font-mono text-xs text-green-400 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Select and upload files to start.</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SegmentUploadDebug;
