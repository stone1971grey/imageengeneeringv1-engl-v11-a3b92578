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
export const extractImageMetadata = (file: File, url: string): Promise<Omit<ImageMetadata, 'altText'>> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const metadata: Omit<ImageMetadata, 'altText'> = {
        url,
        originalFileName: file.name,
        width: img.width,
        height: img.height,
        fileSizeKB: Math.round(file.size / 1024),
        format: file.type.replace('image/', '').toUpperCase(),
        uploadDate: new Date().toISOString(),
      };
      resolve(metadata);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
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
