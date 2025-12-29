import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableImage } from '@/components/frontend-edit/EditableImage';

interface ImageMetadata {
  url?: string;
  originalFileName?: string;
  width?: number;
  height?: number;
  fileSizeKB?: number;
  format?: string;
  uploadDate?: string;
  altText?: string;
}

interface ProductImage {
  imageUrl: string;
  title: string;
  description: string;
  maxWidth?: number | null;
  maxHeight?: number | null;
  metadata?: ImageMetadata;
}

interface ProductHeroGalleryProps {
  id?: string;
  hasMetaNavigation?: boolean;
  data: {
    title: string;
    subtitle: string;
    description: string;
    imagePosition?: 'left' | 'right';
    layoutRatio?: '1-1' | '2-3' | '2-5';
    topSpacing?: 'small' | 'medium' | 'large' | 'extra-large';
    imageMaxWidth?: number | null;
    imageMaxHeight?: number | null;
    cta1Text: string;
    cta1Link: string;
    cta1Style: 'standard' | 'technical' | 'outline-white';
    cta2Text: string;
    cta2Link: string;
    cta2Style: 'standard' | 'technical' | 'outline-white';
    images: ProductImage[];
  };
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const ProductHeroGallery = ({ 
  id, 
  hasMetaNavigation = false, 
  data,
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: ProductHeroGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || false;

  const imagePosition = data.imagePosition || 'right';
  const layoutRatio = data.layoutRatio || '1-1';
  const topSpacing = data.topSpacing || 'medium';
  const globalMaxWidth = data.imageMaxWidth || null;
  const globalMaxHeight = data.imageMaxHeight || null;

  const getCurrentImageStyle = (): React.CSSProperties => {
    const currentImage = data.images[currentImageIndex];
    const maxWidth = currentImage?.maxWidth ?? globalMaxWidth;
    const maxHeight = currentImage?.maxHeight ?? globalMaxHeight;
    return {
      ...(maxWidth ? { maxWidth: `${maxWidth}px` } : {}),
      ...(maxHeight ? { maxHeight: `${maxHeight}px` } : {}),
    };
  };

  const hasCurrentImageSizeConstraints = () => {
    const currentImage = data.images[currentImageIndex];
    const maxWidth = currentImage?.maxWidth ?? globalMaxWidth;
    const maxHeight = currentImage?.maxHeight ?? globalMaxHeight;
    return maxWidth || maxHeight;
  };

  const getTopPaddingClass = () => {
    switch (topSpacing) {
      case 'small': return hasMetaNavigation ? 'pt-[100px]' : 'pt-[40px]';
      case 'medium': return hasMetaNavigation ? 'pt-[120px]' : 'pt-[60px]';
      case 'large': return hasMetaNavigation ? 'pt-[140px]' : 'pt-[80px]';
      case 'extra-large': return hasMetaNavigation ? 'pt-[160px]' : 'pt-[100px]';
      default: return hasMetaNavigation ? 'pt-[120px]' : 'pt-[60px]';
    }
  };

  const getLayoutClasses = () => {
    switch (layoutRatio) {
      case '1-1':
        return 'lg:grid-cols-2';
      case '2-3':
        return 'lg:grid-cols-[2fr_1fr]';
      case '2-5':
        return 'lg:grid-cols-[2fr_3fr]';
      default:
        return 'lg:grid-cols-2';
    }
  };

  const getButtonStyle = (style: string, isHovered: boolean, buttonId: string) => {
    switch (style) {
      case 'technical':
        return { backgroundColor: '#1f2937', color: 'white' };
      case 'outline-white':
        return isHovered && hoveredButton === buttonId
          ? { backgroundColor: 'black', color: 'white', border: '1px solid black' }
          : { backgroundColor: 'white', color: 'black', border: '1px solid #e5e5e5' };
      default:
        return { backgroundColor: '#f9dc24', color: 'black' };
    }
  };

  const isExternalLink = (link: string): boolean => {
    if (link.startsWith('http://') || link.startsWith('https://')) return true;
    if (link.startsWith('www.')) return true;
    if (!link.startsWith('/') && !link.startsWith('#')) {
      const tldPattern = /\.[a-z]{2,}$/i;
      return tldPattern.test(link);
    }
    return false;
  };

  const normalizeExternalLink = (link: string): string => {
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return link;
    }
    return `https://${link}`;
  };

  const buttonStyles = [
    { value: 'standard', label: 'Yellow', color: '#f9dc24' },
    { value: 'technical', label: 'Dark', color: '#1f2937' },
    { value: 'outline-white', label: 'White', color: '#ffffff' }
  ];

  const renderButton = (text: string, link: string, style: string, size: string = 'lg', buttonId: string = 'cta1') => {
    const buttonStyle = getButtonStyle(style, true, buttonId);
    const buttonClasses = `border-0 px-8 py-4 text-lg font-medium shadow-soft transition-all duration-300`;

    // In editing mode, render editable button
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          {/* Editable Button Text */}
          <div 
            className={`${buttonClasses} inline-flex items-center justify-center rounded-md`}
            style={buttonStyle}
          >
            <EditableText
              value={text}
              sectionKey={`${segmentKey}-${buttonId}-text`}
              pageSlug={pageSlug}
              language={language}
              className="font-medium"
              as="span"
              onUpdate={onContentUpdate}
            />
          </div>
          {/* Style Selector */}
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Style:</span>
            {buttonStyles.map((s) => (
              <button
                key={s.value}
                onClick={async () => {
                  // Save the new style to the database
                  const { supabase } = await import('@/integrations/supabase/client');
                  const sectionKey = `${segmentKey}-${buttonId}-style`;
                  
                  const { data: existing } = await supabase
                    .from('page_content')
                    .select('id')
                    .eq('page_slug', pageSlug)
                    .eq('section_key', sectionKey)
                    .eq('language', language)
                    .maybeSingle();
                  
                  if (existing) {
                    await supabase
                      .from('page_content')
                      .update({ content_value: s.value, updated_at: new Date().toISOString() })
                      .eq('id', existing.id);
                  } else {
                    await supabase
                      .from('page_content')
                      .insert({
                        page_slug: pageSlug,
                        section_key: sectionKey,
                        language: language,
                        content_type: 'text',
                        content_value: s.value,
                        content_status: 'draft'
                      });
                  }
                  
                  onContentUpdate?.();
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  style === s.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                }`}
                style={{ backgroundColor: s.color }}
                title={s.label}
              />
            ))}
          </div>
          
          {/* Link Editor */}
          <div className="flex gap-1 items-center">
            <span className="text-xs text-gray-500 mr-1">Link:</span>
            <input
              type="text"
              defaultValue={link}
              onBlur={async (e) => {
                const newLink = e.target.value;
                if (newLink !== link) {
                  const { supabase } = await import('@/integrations/supabase/client');
                  const sectionKey = `${segmentKey}-${buttonId}-link`;
                  
                  const { data: existing } = await supabase
                    .from('page_content')
                    .select('id')
                    .eq('page_slug', pageSlug)
                    .eq('section_key', sectionKey)
                    .eq('language', language)
                    .maybeSingle();
                  
                  if (existing) {
                    await supabase
                      .from('page_content')
                      .update({ content_value: newLink, updated_at: new Date().toISOString() })
                      .eq('id', existing.id);
                  } else {
                    await supabase
                      .from('page_content')
                      .insert({
                        page_slug: pageSlug,
                        section_key: sectionKey,
                        language: language,
                        content_type: 'text',
                        content_value: newLink,
                        content_status: 'draft'
                      });
                  }
                  
                  onContentUpdate?.();
                }
              }}
              className="text-xs px-2 py-1 border border-gray-300 rounded flex-1 max-w-[200px]"
              placeholder="Link URL"
            />
          </div>
        </div>
      );
    }

    const buttonElement = (
      <Button 
        size={size as any}
        className={buttonClasses}
        style={buttonStyle}
        onMouseEnter={() => setHoveredButton(buttonId)}
        onMouseLeave={() => setHoveredButton(null)}
      >
        {text}
      </Button>
    );

    if (isExternalLink(link)) {
      return (
        <a href={normalizeExternalLink(link)} target="_blank" rel="noopener noreferrer">
          {buttonElement}
        </a>
      );
    } else if (link.startsWith('#')) {
      return (
        <a
          href={link}
          onClick={(e) => {
            e.preventDefault();
            const element = document.querySelector(link);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {buttonElement}
        </a>
      );
    } else {
      return <Link to={link}>{buttonElement}</Link>;
    }
  };

  const textContent = (
    <div className="space-y-8">
      <div>
        {isEditing ? (
          <>
            <div className="mb-6">
              <EditableText
                value={data.title}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.05] tracking-tight text-gray-900"
                as="span"
                onUpdate={onContentUpdate}
              />
              <br />
              <EditableText
                value={data.subtitle}
                sectionKey={`${segmentKey}-subtitle`}
                pageSlug={pageSlug}
                language={language}
                className="text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.05] tracking-tight text-gray-900"
                as="span"
                onUpdate={onContentUpdate}
              />
            </div>
            
            <EditableText
              value={data.description}
              sectionKey={`${segmentKey}-description`}
              pageSlug={pageSlug}
              language={language}
              className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed max-w-2xl"
              as="div"
              multiline
              onUpdate={onContentUpdate}
            />
          </>
        ) : (
          <>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.05] tracking-tight mb-6 text-gray-900 mt-8 md:mt-0">
              {data.title}
              <br />
              <span className="font-medium text-gray-900">{data.subtitle}</span>
            </h1>
            
            <div 
              className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed max-w-2xl [&>p]:mb-4 [&>p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          </>
        )}
      </div>
      
      <div className="pt-4 flex gap-4">
        {data.cta1Text && renderButton(data.cta1Text, data.cta1Link, data.cta1Style, 'lg', 'cta1')}
        {data.cta2Text && renderButton(data.cta2Text, data.cta2Link, data.cta2Style, 'lg', 'cta2')}
      </div>
    </div>
  );

  const imageGallery = (
    <div className="relative">
      <div 
        className="relative group cursor-pointer" 
        onClick={() => !isEditing && setIsModalOpen(true)}
        style={hasCurrentImageSizeConstraints() ? { display: 'flex', justifyContent: 'center' } : {}}
      >
        {isEditing ? (
          <EditableImage
            src={data.images[currentImageIndex]?.imageUrl}
            alt={data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title || data.title}
            sectionKey={`${segmentKey}-image-${currentImageIndex}`}
            pageSlug={pageSlug}
            language={language}
            className="w-full"
            imgClassName="w-full h-[500px] lg:h-[600px] object-contain bg-white relative z-10 transition-all duration-300"
            onUpdate={onContentUpdate}
          />
        ) : (
          <>
            <img 
              src={data.images[currentImageIndex]?.imageUrl} 
              alt={data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title || data.title}
              className="w-full h-[500px] lg:h-[600px] object-contain bg-white relative z-10 transition-all duration-300"
              style={getCurrentImageStyle()}
            />
            
            {/* Expand Icon Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center z-40">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                <Expand className="w-6 h-6 text-light-foreground" />
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Image Title */}
      {(data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title) && (
        <div className="text-center mt-3">
          {isEditing ? (
            <EditableText
              value={data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title || ''}
              sectionKey={`${segmentKey}-image-title-${currentImageIndex}`}
              pageSlug={pageSlug}
              language={language}
              className="font-medium text-light-foreground text-sm lg:text-base"
              as="h4"
              onUpdate={onContentUpdate}
            />
          ) : (
            <h4 className="font-medium text-light-foreground text-sm lg:text-base">
              {data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title}
            </h4>
          )}
        </div>
      )}
      
      {/* Thumbnail Navigation */}
      {data.images.length > 1 && (
        <div className="flex justify-center gap-3 mt-3">
          {data.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative aspect-[4/3] w-16 lg:w-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                currentImageIndex === index 
                  ? 'border-accent-soft-blue shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={image.imageUrl} 
                alt={image.metadata?.altText || image.title || `Image ${index + 1}`}
                className="w-full h-full object-contain bg-white"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section
      id={id}
      className={`min-h-[60vh] bg-white font-roboto relative overflow-hidden ${getTopPaddingClass()} pb-4`}
    >
      
      <div className="container mx-auto px-6 relative z-10">
        <div className={`grid ${getLayoutClasses()} gap-16 items-center`}>
          {imagePosition === 'left' ? (
            <>
              {imageGallery}
              {textContent}
            </>
          ) : (
            <>
              {textContent}
              {imageGallery}
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] p-4 bg-white">
          <div className="relative">
            <img 
              src={data.images[currentImageIndex]?.imageUrl} 
              alt={data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title || data.title}
              className="w-full h-full max-h-[75vh] object-contain"
            />
            
            {/* Navigation Arrows */}
            {data.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === 0 ? data.images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductHeroGallery;