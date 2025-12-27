import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';

interface IntroProps {
  title?: string;
  description?: string;
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const Intro = ({ 
  title = "Your Partner for Objective Camera & Sensor Testing",
  description = "Industry-leading solutions for comprehensive camera and sensor evaluation",
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: IntroProps) => {
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || false;

  return (
    <section className="pt-10 pb-2 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          {isEditing ? (
            <>
              <EditableText
                value={title}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-2xl md:text-3xl font-bold text-black mb-8 tracking-tight"
                as="h1"
                onUpdate={onContentUpdate}
              />
              <EditableText
                value={description}
                sectionKey={`${segmentKey}-description`}
                pageSlug={pageSlug}
                language={language}
                className="text-xl text-black max-w-2xl mx-auto font-light"
                as="p"
                multiline
                onUpdate={onContentUpdate}
              />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-8 tracking-tight">
                {title}
              </h1>
              <p className="text-xl text-black max-w-2xl mx-auto font-light whitespace-pre-line">
                {description}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Intro;