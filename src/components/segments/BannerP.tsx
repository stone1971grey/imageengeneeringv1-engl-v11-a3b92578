import { ImageMetadata } from '@/types/imageMetadata';

interface BannerPImage {
  id: string;
  url: string;
  alt: string;
  metadata?: ImageMetadata;
}

interface BannerPProps {
  title?: string;
  subtext?: string;
  images?: BannerPImage[];
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: string;
}

export const BannerP = ({ 
  title, 
  subtext, 
  images = [], 
  buttonText, 
  buttonLink, 
  buttonStyle = 'standard' 
}: BannerPProps) => {
  const getButtonClasses = () => {
    switch (buttonStyle) {
      case 'technical':
        return 'bg-gray-800 text-white hover:bg-gray-900';
      case 'outline-white':
        return 'bg-white text-black border border-gray-300 hover:bg-black hover:text-white';
      default:
        return 'bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90';
    }
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          {title && (
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          )}

          {/* Subtext */}
          {subtext && (
            <p className="text-lg text-gray-700 mb-8">
              {subtext}
            </p>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
              {images.map((image) => 
                image.url ? (
                  <div key={image.id} className="bg-gray-200 rounded-lg p-6 w-48 h-32 flex items-center justify-center">
                    <img
                      src={image.url}
                      alt={image.alt || 'Banner image'}
                      className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Button */}
          {buttonText && buttonLink && (
            <a
              href={buttonLink}
              className={`inline-block px-8 py-3 rounded-lg font-semibold transition-all ${getButtonClasses()}`}
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
