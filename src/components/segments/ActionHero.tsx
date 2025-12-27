import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableImage } from '@/components/frontend-edit/EditableImage';

interface ActionHeroProps {
  id?: string;
  title: string;
  description: string;
  backgroundImage: string;
  flipImage?: boolean;
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const ActionHero = ({ 
  id, 
  title, 
  description, 
  backgroundImage, 
  flipImage = false,
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: ActionHeroProps) => {
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || false;

  return (
    <section 
      id={id}
      className="relative h-[280px] lg:h-[340px] flex items-end"
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10" />
      
      {/* Background image */}
      {isEditing ? (
        <EditableImage
          src={backgroundImage}
          alt={title}
          sectionKey={`${segmentKey}-background`}
          pageSlug={pageSlug}
          language={language}
          className="absolute inset-0"
          imgClassName={`w-full h-full object-cover ${flipImage ? 'scale-x-[-1]' : ''}`}
          onUpdate={onContentUpdate}
        />
      ) : (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            transform: flipImage ? 'scaleX(-1)' : 'none'
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative container mx-auto px-6 z-20 pb-8 lg:pb-12">
        <div className="max-w-4xl">
          {isEditing ? (
            <>
              <EditableText
                value={title}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-4xl lg:text-6xl font-bold text-white mb-4"
                as="h1"
                onUpdate={onContentUpdate}
              />
              <EditableText
                value={description}
                sectionKey={`${segmentKey}-description`}
                pageSlug={pageSlug}
                language={language}
                className="text-xl lg:text-2xl text-white max-w-2xl"
                as="p"
                multiline
                onUpdate={onContentUpdate}
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                {title}
              </h1>
              <p className="text-xl lg:text-2xl text-white max-w-2xl line-clamp-2 whitespace-pre-line">
                {description}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ActionHero;