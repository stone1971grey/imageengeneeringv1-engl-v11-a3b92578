import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableRichText } from '@/components/frontend-edit/EditableRichText';
import { EditableImage } from '@/components/frontend-edit/EditableImage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { syncAltTextToMediaManagement } from '@/utils/syncAltTextToMediaManagement';

// Simple inline editable component for image title/alt text
const EditableImageTitle: React.FC<{
  value: string;
  onSave: (value: string) => void;
  className?: string;
}> = ({ value, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <h4 
        className={`${className} cursor-pointer hover:bg-[#f9dc24]/20 rounded px-2 py-1 transition-colors`}
        onClick={() => setIsEditing(true)}
        title="Click to edit image description"
      >
        {value || 'Click to add description'}
      </h4>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') { setEditValue(value); setIsEditing(false); }
      }}
      className={`${className} bg-white border-2 border-[#f9dc24] rounded px-2 py-1 text-center w-full max-w-md mx-auto`}
      placeholder="Image description / Alt text"
    />
  );
};

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
  headingLevel?: 'h1' | 'h2';
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
  headingLevel = 'h1',
  data,
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: ProductHeroGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  
  // Local state for button editing
  const [cta1Text, setCta1Text] = useState(data.cta1Text);
  const [cta1Link, setCta1Link] = useState(data.cta1Link);
  const [cta1Style, setCta1Style] = useState(data.cta1Style);
  const [cta2Text, setCta2Text] = useState(data.cta2Text);
  const [cta2Link, setCta2Link] = useState(data.cta2Link);
  const [cta2Style, setCta2Style] = useState(data.cta2Style);
  
  // Track which button is being edited
  const [editingButton, setEditingButton] = useState<'cta1' | 'cta2' | null>(null);
  
  // Sync local state with props
  useEffect(() => {
    setCta1Text(data.cta1Text);
    setCta1Link(data.cta1Link);
    setCta1Style(data.cta1Style);
    setCta2Text(data.cta2Text);
    setCta2Link(data.cta2Link);
    setCta2Style(data.cta2Style);
  }, [data.cta1Text, data.cta1Link, data.cta1Style, data.cta2Text, data.cta2Link, data.cta2Style]);
  
  // Use FrontendEditContext directly instead of SegmentEditContext
  const editContext = useFrontendEditOptional();
  const isEditing = editContext?.isEditMode && editContext?.canEdit;

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

  // Save button data to page_segments
  const saveButtonData = async (buttonId: 'cta1' | 'cta2', field: 'Text' | 'Link' | 'Style', value: string) => {
    try {
      // Get the segment ID from segmentKey (e.g., "product-hero-gallery-123" -> "123")
      const segmentIdMatch = segmentKey.match(/-(\d+)$/);
      if (!segmentIdMatch) {
        console.error('[ProductHeroGallery] Cannot extract segment ID from segmentKey:', segmentKey);
        return;
      }
      
      // Fetch current page_segments
      const { data: pageData, error: fetchError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();
      
      if (fetchError) {
        console.error('[ProductHeroGallery] Error fetching page_segments:', fetchError);
        toast.error('Error loading page data');
        return;
      }
      
      if (!pageData) {
        console.error('[ProductHeroGallery] No page_segments found');
        toast.error('Page data not found');
        return;
      }
      
      // Parse and update the segments
      const segments = JSON.parse(pageData.content_value);
      const segmentIndex = segments.findIndex((s: any) => 
        String(s.id) === segmentIdMatch[1] || 
        s.type === 'product-hero-gallery' && String(s.id) === segmentIdMatch[1]
      );
      
      if (segmentIndex === -1) {
        console.error('[ProductHeroGallery] Segment not found in page_segments');
        toast.error('Segment not found');
        return;
      }
      
      // Update the button field
      const fieldKey = `${buttonId}${field}`;
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data[fieldKey] = value;
      
      // Save back to database with updated_by
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from('page_content')
        .update({ 
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', pageData.id);
      
      if (updateError) {
        console.error('[ProductHeroGallery] Error saving button data:', updateError);
        toast.error('Error saving');
        return;
      }
      
      toast.success('Saved');
      onContentUpdate?.();
    } catch (error) {
      console.error('[ProductHeroGallery] Error in saveButtonData:', error);
      toast.error('Error saving');
    }
  };

  // Handler to save image alt text and sync to Media Management
  const saveImageAltText = async (imageIndex: number, newAltText: string) => {
    try {
      const segmentIdMatch = segmentKey.match(/-(\d+)$/);
      if (!segmentIdMatch) {
        console.error('[ProductHeroGallery] Cannot extract segment ID from segmentKey:', segmentKey);
        return;
      }
      
      // Fetch current page_segments
      const { data: pageData, error: fetchError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();
      
      if (fetchError || !pageData) {
        console.error('[ProductHeroGallery] Error fetching page_segments:', fetchError);
        toast.error('Error loading page data');
        return;
      }
      
      // Parse and update the segments
      const segments = JSON.parse(pageData.content_value);
      const segmentIndex = segments.findIndex((s: any) => 
        String(s.id) === segmentIdMatch[1]
      );
      
      if (segmentIndex === -1) {
        console.error('[ProductHeroGallery] Segment not found in page_segments');
        toast.error('Segment not found');
        return;
      }
      
      // Ensure images array exists
      if (!segments[segmentIndex].data?.images?.[imageIndex]) {
        console.error('[ProductHeroGallery] Image not found at index:', imageIndex);
        toast.error('Image not found');
        return;
      }
      
      // Update the metadata.altText for this image
      if (!segments[segmentIndex].data.images[imageIndex].metadata) {
        segments[segmentIndex].data.images[imageIndex].metadata = {};
      }
      segments[segmentIndex].data.images[imageIndex].metadata.altText = newAltText;
      
      // Also update the title field for backward compatibility
      segments[segmentIndex].data.images[imageIndex].title = newAltText;
      
      // Save back to database with updated_by
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from('page_content')
        .update({ 
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', pageData.id);
      
      if (updateError) {
        console.error('[ProductHeroGallery] Error saving image alt text:', updateError);
        toast.error('Error saving');
        return;
      }
      
      // Sync alt text to Media Management (file_segment_mappings)
      const imageUrl = segments[segmentIndex].data.images[imageIndex].imageUrl;
      if (imageUrl) {
        await syncAltTextToMediaManagement(imageUrl, newAltText, language, 'page-images', false);
        console.log('[ProductHeroGallery] Alt text synced to Media Management:', newAltText);
      }
      
      toast.success('Image description saved');
      onContentUpdate?.();
    } catch (error) {
      console.error('[ProductHeroGallery] Error in saveImageAltText:', error);
      toast.error('Error saving');
    }
  };

  const renderButton = (text: string, link: string, style: string, size: string = 'lg', buttonId: 'cta1' | 'cta2' = 'cta1') => {
    const buttonStyle = getButtonStyle(style, true, buttonId);
    const buttonClasses = `border-0 px-8 py-4 text-lg font-medium shadow-soft transition-all duration-300`;
    const localText = buttonId === 'cta1' ? cta1Text : cta2Text;
    const localLink = buttonId === 'cta1' ? cta1Link : cta2Link;
    const localStyle = buttonId === 'cta1' ? cta1Style : cta2Style;
    const setLocalText = buttonId === 'cta1' ? setCta1Text : setCta2Text;
    const setLocalLink = buttonId === 'cta1' ? setCta1Link : setCta2Link;
    const setLocalStyle = buttonId === 'cta1' ? setCta1Style : setCta2Style;
    const isThisButtonEditing = editingButton === buttonId;

    // In editing mode, render editable button with portal for editor
    if (isEditing) {
      const buttonRef = useRef<HTMLDivElement>(null);
      const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 });

      // Update editor position when button editing starts
      useEffect(() => {
        if (isThisButtonEditing && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setEditorPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX
          });
        }
      }, [isThisButtonEditing]);

      return (
        <>
          <div ref={buttonRef} className="relative inline-block">
            {/* The actual button - editable inline when active */}
            {isThisButtonEditing ? (
              <input
                type="text"
                value={localText}
                onChange={(e) => setLocalText(e.target.value)}
                className={`${buttonClasses} inline-flex items-center justify-center rounded-md ring-2 ring-[#f9dc24] bg-transparent border-none outline-none text-center`}
                style={{ 
                  ...buttonStyle,
                  minWidth: '120px'
                }}
                autoFocus
                placeholder="Button text"
              />
            ) : (
              <div 
                className={`${buttonClasses} inline-flex items-center justify-center rounded-md cursor-pointer transition-all ring-2 ring-dashed ring-gray-400 hover:ring-gray-600`}
                style={buttonStyle}
                onClick={() => setEditingButton(buttonId)}
                title="Click to edit"
              >
                {localText || 'Button Text'}
              </div>
            )}
          </div>
          
          {/* Editor as portal with backdrop - only Style and Link, no Text field */}
          {isThisButtonEditing && createPortal(
            <>
              {/* Invisible backdrop to catch outside clicks */}
              <div 
                className="fixed inset-0"
                style={{ zIndex: 99998 }}
                onClick={() => {
                  // Reset to original values on outside click
                  if (buttonId === 'cta1') {
                    setCta1Text(data.cta1Text);
                    setCta1Link(data.cta1Link);
                    setCta1Style(data.cta1Style);
                  } else {
                    setCta2Text(data.cta2Text);
                    setCta2Link(data.cta2Link);
                    setCta2Style(data.cta2Style);
                  }
                  setEditingButton(null);
                }}
              />
              <div 
                className="absolute bg-white p-4 rounded-lg border border-gray-300 shadow-2xl min-w-[280px]"
                style={{ 
                  position: 'absolute',
                  top: editorPosition.top, 
                  left: editorPosition.left,
                  zIndex: 99999
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Style Selector - quadratisch, aktiv = größer */}
                <div className="flex gap-2 items-center mb-3">
                  <span className="text-xs text-gray-600 w-10 font-medium">Style:</span>
                  <div className="flex gap-2 items-end">
                    {buttonStyles.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setLocalStyle(s.value as any)}
                        className={`rounded transition-all border border-gray-400 ${
                          localStyle === s.value ? 'w-10 h-10' : 'w-7 h-7 hover:w-8 hover:h-8'
                        }`}
                        style={{ backgroundColor: s.color }}
                        title={s.label}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Link Editor */}
                <div className="flex gap-2 items-center mb-3">
                  <span className="text-xs text-gray-600 w-10 font-medium">Link:</span>
                  <input
                    type="text"
                    value={localLink}
                    onChange={(e) => setLocalLink(e.target.value)}
                    className="text-sm px-3 py-2 rounded flex-1 bg-gray-900 text-white border border-gray-600 placeholder:text-gray-400"
                    placeholder="/page-url or https://..."
                  />
                </div>
                
                {/* Save / Cancel Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                      await saveButtonData(buttonId, 'Text', localText);
                      await saveButtonData(buttonId, 'Style', localStyle);
                      await saveButtonData(buttonId, 'Link', localLink);
                      setEditingButton(null);
                    }}
                    className="flex-1 bg-[#f9dc24] hover:bg-[#e5c820] text-black font-medium"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Reset to original values
                      if (buttonId === 'cta1') {
                        setCta1Text(data.cta1Text);
                        setCta1Link(data.cta1Link);
                        setCta1Style(data.cta1Style);
                      } else {
                        setCta2Text(data.cta2Text);
                        setCta2Link(data.cta2Link);
                        setCta2Style(data.cta2Style);
                      }
                      setEditingButton(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>,
            document.body
          )}
        </>
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

  // Dynamic heading element based on headingLevel prop
  const HeadingTag = headingLevel;
  const headingLabel = headingLevel === 'h1' ? 'Title (H1)' : 'Title (H2)';
  const subtitleLabel = headingLevel === 'h1' ? 'Subtitle (H1)' : 'Subtitle (H2)';

  const textContent = (
    <div className="space-y-8">
      <div>
        {/* Title and Subtitle - same structure in both modes for layout stability */}
        <HeadingTag className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.05] tracking-tight mb-6 text-gray-900 mt-8 md:mt-0">
          {isEditing ? (
            <EditableText
              value={data.title}
              sectionKey={`${segmentKey}-title`}
              pageSlug={pageSlug}
              language={language}
              className="font-light"
              as="span"
              onUpdate={onContentUpdate}
              fieldLabel={headingLabel}
            />
          ) : (
            data.title
          )}
          <br />
          {isEditing ? (
            <EditableText
              value={data.subtitle}
              sectionKey={`${segmentKey}-subtitle`}
              pageSlug={pageSlug}
              language={language}
              className="font-medium text-gray-900"
              as="span"
              onUpdate={onContentUpdate}
              fieldLabel={subtitleLabel}
            />
          ) : (
            <span className="font-medium text-gray-900">{data.subtitle}</span>
          )}
        </HeadingTag>
        
        {/* Description - same container structure in both modes */}
        {isEditing ? (
          <EditableRichText
            value={data.description}
            sectionKey={`${segmentKey}-description`}
            pageSlug={pageSlug}
            language={language}
            className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed max-w-2xl [&>p]:mb-4 [&>p:last-child]:mb-0"
            onUpdate={onContentUpdate}
            fieldLabel="Description"
          />
        ) : (
          <div 
            className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed max-w-2xl [&>p]:mb-4 [&>p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        )}
      </div>
      
      <div className="pt-4 flex gap-4 flex-wrap">
        {(data.cta1Text || isEditing) && renderButton(data.cta1Text, data.cta1Link, data.cta1Style, 'lg', 'cta1')}
        {(data.cta2Text || isEditing) && renderButton(data.cta2Text, data.cta2Link, data.cta2Style, 'lg', 'cta2')}
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
      
      {/* Image Title / Alt Text - with sync to Media Management */}
      {(data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title || isEditing) && (
        <div className="text-center mt-3">
          {isEditing ? (
            <EditableImageTitle
              value={data.images[currentImageIndex]?.metadata?.altText || data.images[currentImageIndex]?.title || ''}
              onSave={(newValue) => saveImageAltText(currentImageIndex, newValue)}
              className="font-medium text-light-foreground text-sm lg:text-base"
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