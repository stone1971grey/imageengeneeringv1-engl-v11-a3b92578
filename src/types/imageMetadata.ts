// Shared image metadata interface for all CMS segments
export interface ImageMetadata {
  url: string;
  originalFileName: string;
  width: number;
  height: number;
  fileSizeKB: number;
  format: string;
  uploadDate: string;
  altText: string;
}

// Helper function to extract image metadata from a File object
// Returns metadata with fallback values if extraction fails
export const extractImageMetadata = async (file: File, url: string): Promise<Omit<ImageMetadata, 'altText'>> => {
  // Fallback metadata in case image loading fails
  const fallbackMetadata: Omit<ImageMetadata, 'altText'> = {
    url,
    originalFileName: file.name,
    width: 0,
    height: 0,
    fileSizeKB: Math.round(file.size / 1024),
    format: file.type.replace('image/', '').toUpperCase(),
    uploadDate: new Date().toISOString(),
  };

  try {
    // Try to load image and extract dimensions
    const metadata = await new Promise<Omit<ImageMetadata, 'altText'>>((resolve, reject) => {
      const img = new Image();
      
      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        const fullMetadata: Omit<ImageMetadata, 'altText'> = {
          url,
          originalFileName: file.name,
          width: img.width,
          height: img.height,
          fileSizeKB: Math.round(file.size / 1024),
          format: file.type.replace('image/', '').toUpperCase(),
          uploadDate: new Date().toISOString(),
        };
        // Clean up blob URL
        URL.revokeObjectURL(img.src);
        resolve(fullMetadata);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
    
    return metadata;
  } catch (error) {
    console.warn('[IMAGE METADATA] Failed to extract dimensions, using fallback:', error);
    // Return fallback metadata instead of failing
    return fallbackMetadata;
  }
};

// Helper component for displaying image metadata
export const formatFileSize = (sizeKB: number): string => {
  if (sizeKB < 1024) {
    return `${sizeKB} KB`;
  }
  return `${(sizeKB / 1024).toFixed(2)} MB`;
};

export const formatUploadDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
