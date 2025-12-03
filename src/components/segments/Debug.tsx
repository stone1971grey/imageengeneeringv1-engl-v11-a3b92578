interface DebugImage {
  id: string;
  url: string;
  alt_text?: string;
}

interface DebugProps {
  id?: string;
  imageUrl?: string;
  title?: string;
  images?: DebugImage[];
}

const Debug = ({ id, imageUrl, title, images }: DebugProps) => {
  return (
    <section id={id?.toString()} className="pt-[150px] pb-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{title}</h2>
          )}
          
          {/* Legacy single image display */}
          {imageUrl && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <img
                src={imageUrl}
                alt={title || "Debug image"}
                className="w-full max-w-lg mx-auto h-auto object-contain"
              />
            </div>
          )}

          {/* Multi-image grid display */}
          {images && images.some(img => img.url) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {images.map((image, index) => (
                image.url && (
                  <div key={image.id} className="bg-white rounded-lg shadow-lg p-4">
                    <div className="aspect-video overflow-hidden rounded mb-2">
                      <img
                        src={image.url}
                        alt={image.alt_text || `Debug image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.alt_text && (
                      <p className="text-sm text-gray-600 text-center">{image.alt_text}</p>
                    )}
                    <p className="text-xs text-gray-400 text-center mt-1 font-mono">
                      ID: {image.id.slice(0, 8)}...
                    </p>
                  </div>
                )
              ))}
            </div>
          )}

          {/* No content fallback */}
          {!imageUrl && (!images || !images.some(img => img.url)) && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-500 italic text-center">No images uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Debug;
