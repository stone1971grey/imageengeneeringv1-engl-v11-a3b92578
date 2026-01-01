import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';

interface IntroProps {
  title?: string;
  description?: string;
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  headingLevel?: 'h1' | 'h2';
  onContentUpdate?: () => void;
}

const Intro = ({ 
  title = "",
  description = "",
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  headingLevel = 'h1',
  onContentUpdate
}: IntroProps) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  
  // Allow editing if segment is being edited OR if we're in general edit mode with canEdit
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Always show the segment structure, even with empty content
  // This allows editors to see where content should be added
  const displayTitle = title || (isEditing ? '[Click to add title]' : '');
  const displayDescription = description || (isEditing ? '[Click to add description]' : '');

  // If both title and description are empty and not in edit mode, show nothing
  if (!title && !description && !isEditing) {
    return null;
  }

  // Dynamic heading element based on headingLevel prop
  const HeadingTag = headingLevel;
  const headingLabel = headingLevel === 'h1' ? 'Intro Title (H1)' : 'Intro Title (H2)';

  return (
    <section className="pt-6 pb-2 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          {isEditing ? (
            <>
              <EditableText
                value={displayTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-2xl md:text-3xl font-bold text-black mb-8 tracking-tight"
                as={headingLevel}
                onUpdate={onContentUpdate}
                fieldLabel={headingLabel}
              />
              {(description || isEditing) && (
                <EditableText
                  value={displayDescription}
                  sectionKey={`${segmentKey}-description`}
                  pageSlug={pageSlug}
                  language={language}
                  className="text-xl text-black max-w-2xl mx-auto font-light"
                  as="p"
                  multiline
                  onUpdate={onContentUpdate}
                  fieldLabel="Intro Description"
                />
              )}
            </>
          ) : (
            <>
              {title && (
                <HeadingTag className="text-2xl md:text-3xl font-bold text-black mb-8 tracking-tight">
                  {title}
                </HeadingTag>
              )}
              {description && (
                <div 
                  className="text-xl text-black max-w-2xl mx-auto font-light whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Intro;
