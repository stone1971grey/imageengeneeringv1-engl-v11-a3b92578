import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface SpecificationRow {
  specification: string;
  value: string;
}

interface SpecificationProps {
  id: string;
  title?: string;
  rows?: SpecificationRow[];
  description?: string;
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const Specification = ({ 
  id, 
  title = "", 
  rows = [], 
  description,
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: SpecificationProps) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;
  
  // Local state for rows editing
  const [localRows, setLocalRows] = useState<SpecificationRow[]>(rows);
  
  // Sync local rows with props
  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);
  
  console.log('Specification render:', { id, title, rowsCount: localRows.length, localRows, description, isEditing });
  
  // Show placeholder in edit mode, hide completely if no content and not editing
  const displayTitle = title || (isEditing ? '[Click to add title]' : '');
  
  if (!title && localRows.length === 0 && !description && !isEditing) {
    return null;
  }

  const handleRowChange = (index: number, field: 'specification' | 'value', newValue: string) => {
    const updatedRows = [...localRows];
    updatedRows[index] = { ...updatedRows[index], [field]: newValue };
    setLocalRows(updatedRows);
    // Note: Actual save would need to update page_segments in database
    // This would require an update function similar to onContentUpdate
  };

  const handleAddRow = () => {
    setLocalRows([...localRows, { specification: '', value: '' }]);
  };

  const handleDeleteRow = (index: number) => {
    const updatedRows = localRows.filter((_, i) => i !== index);
    setLocalRows(updatedRows);
  };

  return (
    <section id={id} className="pt-[20px] pb-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-10 hover:shadow-xl transition-shadow duration-300">
          {(displayTitle || isEditing) && (
            isEditing ? (
              <EditableText
                value={displayTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-2xl font-semibold text-[#2D2D2D] mb-6"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="Specification Title"
              />
            ) : (
              title && <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-6">{title}</h2>
            )
          )}
          
          {(localRows.length > 0 || isEditing) ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Specification</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Value</th>
                    {isEditing && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {localRows.map((row, index) => (
                    <tr 
                      key={index} 
                      className={index !== localRows.length - 1 ? "border-b border-gray-100" : ""}
                    >
                      <td className="py-3 px-4 text-[#555] whitespace-pre-line">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.specification}
                            onChange={(e) => handleRowChange(index, 'specification', e.target.value)}
                            className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                            placeholder="Specification name..."
                          />
                        ) : (
                          row.specification
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#555] whitespace-pre-line">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => handleRowChange(index, 'value', e.target.value)}
                            className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                            placeholder="Value..."
                          />
                        ) : (
                          row.value
                        )}
                      </td>
                      {isEditing && (
                        <td className="py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {isEditing && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="text-gray-600 hover:text-gray-800 border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                </div>
              )}
            </div>
          ) : (
            !isEditing && <p className="text-gray-500">No specifications available.</p>
          )}
          
          {/* Description/Links section - renders HTML content including internal links */}
          {(description || isEditing) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {isEditing ? (
                <EditableText
                  value={description || '[Click to add description/links]'}
                  sectionKey={`${segmentKey}-description`}
                  pageSlug={pageSlug}
                  language={language}
                  className="text-[#555] [&_a]:inline-block [&_a]:font-semibold [&_a]:text-[#2D2D2D] [&_a]:underline [&_a]:decoration-2 [&_a]:bg-[#f9dc24]/60 [&_a]:px-2 [&_a]:py-0.5 [&_a]:rounded [&_a]:hover:bg-[#f9dc24]/90 [&_a]:transition-colors"
                  as="div"
                  multiline
                  onUpdate={onContentUpdate}
                  fieldLabel="Specification Description"
                />
              ) : (
                <div 
                  className="text-[#555] [&_a]:inline-block [&_a]:font-semibold [&_a]:text-[#2D2D2D] [&_a]:underline [&_a]:decoration-2 [&_a]:bg-[#f9dc24]/60 [&_a]:px-2 [&_a]:py-0.5 [&_a]:rounded [&_a]:hover:bg-[#f9dc24]/90 [&_a]:transition-colors"
                  dangerouslySetInnerHTML={{ __html: description || '' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Specification;
