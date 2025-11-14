import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadImageToStorage = async (
  file: File,
  path: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('page-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload image');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('page-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    toast.error('Failed to upload image');
    return null;
  }
};

export const extractImageMetadata = (file: File) => {
  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadDate: new Date().toISOString(),
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
