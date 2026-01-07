import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Camera, 
  Smartphone, 
  Car, 
  Tv, 
  Shield, 
  Cog, 
  Stethoscope, 
  ScanLine,
  Lightbulb,
  Microscope,
  Factory,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Target,
  Settings,
  Package,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
  ChevronDown
} from "lucide-react";
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Available icons mapping
export const availableIcons = {
  Camera,
  Smartphone,
  Car,
  Tv,
  Shield,
  Cog,
  Stethoscope,
  ScanLine,
  Lightbulb,
  Microscope,
  Factory,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Target,
  Settings,
  Package
} as const;

export type IconName = keyof typeof availableIcons;
const iconOptions = Object.keys(availableIcons) as IconName[];

export interface IndustryItem {
  icon: IconName;
  title: string;
  description: string;
  link?: string;
}

interface IndustriesSegmentProps {
  title?: string;
  subtitle?: string;
  columns?: number;
  items?: IndustryItem[];
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const IndustriesSegment = ({ 
  title = "Trusted Across All Industries",
  subtitle = "Professional solutions for diverse applications",
  columns = 4,
  items = [],
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}: IndustriesSegmentProps) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || (editContext?.isEditMode && editContext?.canEdit) || false;

  // Local state for editing
  const [editColumns, setEditColumns] = useState(columns);
  const [editItems, setEditItems] = useState<IndustryItem[]>(items);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Refs for auto-save on navigation
  const editColumnsRef = useRef(editColumns);
  const editItemsRef = useRef(editItems);
  const hasChangesRef = useRef(hasChanges);
  const saveInProgressRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { editColumnsRef.current = editColumns; }, [editColumns]);
  useEffect(() => { editItemsRef.current = editItems; }, [editItems]);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);

  // Sync with props
  useEffect(() => {
    setEditColumns(columns);
    setEditItems(items);
    setHasChanges(false);
  }, [columns, items]);

  // Enable save button when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setHasChanges(true);
    }
  }, [isEditing]);

  // Enable save button when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setHasChanges(true);
    }
  }, [isEditing]);

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }[isEditing ? editColumns : columns] || 'grid-cols-2 md:grid-cols-4';

  const handleColumnsChange = (newColumns: number) => {
    setEditColumns(newColumns);
    setHasChanges(true);
  };

  const handleItemChange = (index: number, field: keyof IndustryItem, value: string) => {
    const newItems = [...editItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditItems(newItems);
    setHasChanges(true);
  };

  const handleAddItem = () => {
    const newItem: IndustryItem = {
      icon: 'Camera',
      title: '',
      description: '',
      link: ''
    };
    setEditItems([...editItems, newItem]);
    setHasChanges(true);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editItems.filter((_, i) => i !== index);
    setEditItems(newItems);
    setHasChanges(true);
  };

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      // Extract segment ID from segmentKey
      const segmentKeyParts = segmentKey.split('-');
      const segmentId = segmentKeyParts[segmentKeyParts.length - 1];

      // Load page_segments
      let { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[IndustriesSegment] Error loading:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (pageSegmentsData) {
        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          console.error('[IndustriesSegment] Error parsing:', e);
          toast.error('Error parsing content');
          setIsSaving(false);
          return;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId;
        });

        if (segmentIndex === -1) {
          console.error('[IndustriesSegment] Segment not found');
          toast.error('Segment not found');
          setIsSaving(false);
          return;
        }

        // Update segment data
        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data.columns = editColumns;
        segments[segmentIndex].data.items = editItems;

        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsData.id);

        if (updateError) {
          console.error('[IndustriesSegment] Error updating:', updateError);
          toast.error('Error saving');
          setIsSaving(false);
          return;
        }
      }

      toast.success('Industries saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[IndustriesSegment] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, segmentKey, pageSlug, language, editColumns, editItems, onContentUpdate]);

  // AUTO-SAVE: Save when clicking on links (before navigation)
  useEffect(() => {
    const performAutoSave = async () => {
      if (!hasChangesRef.current || saveInProgressRef.current) return;
      
      saveInProgressRef.current = true;
      console.log('[IndustriesSegment] Auto-saving before navigation...');
      
      try {
        const segmentKeyParts = segmentKey.split('-');
        const segmentId = segmentKeyParts[segmentKeyParts.length - 1];

        const { data: pageSegmentsData, error: loadError } = await supabase
          .from('page_content')
          .select('id, content_value')
          .eq('page_slug', pageSlug)
          .eq('section_key', 'page_segments')
          .eq('language', language)
          .maybeSingle();

        if (loadError || !pageSegmentsData) {
          saveInProgressRef.current = false;
          return;
        }

        let segments: any[] = [];
        try {
          segments = JSON.parse(pageSegmentsData.content_value || '[]');
        } catch (e) {
          saveInProgressRef.current = false;
          return;
        }

        const segmentIndex = segments.findIndex((seg: any) => {
          const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
          return segId === segmentId;
        });

        if (segmentIndex === -1) {
          saveInProgressRef.current = false;
          return;
        }

        if (!segments[segmentIndex].data) {
          segments[segmentIndex].data = {};
        }
        segments[segmentIndex].data.columns = editColumnsRef.current;
        segments[segmentIndex].data.items = editItemsRef.current;

        const { error: updateError } = await supabase
          .from('page_content')
          .update({
            content_value: JSON.stringify(segments),
            updated_at: new Date().toISOString()
          })
          .eq('id', pageSegmentsData.id);

        if (!updateError) {
          console.log('[IndustriesSegment] Auto-saved successfully');
          toast.success('Auto-saved', { duration: 2000, description: 'Industries' });
          hasChangesRef.current = false;
        }
      } catch (e) {
        console.error('[IndustriesSegment] Auto-save error:', e);
      } finally {
        saveInProgressRef.current = false;
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && hasChangesRef.current && !saveInProgressRef.current) {
        performAutoSave();
      }
    };

    document.addEventListener('click', handleLinkClick, true);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      if (hasChangesRef.current && !saveInProgressRef.current) {
        performAutoSave();
      }
    };
  }, [pageSlug, language, segmentKey]);

  const handleCancel = () => {
    setEditColumns(columns);
    setEditItems(items);
    setHasChanges(false);
  };

  const displayItems = isEditing ? editItems : items;
  const displayColumns = isEditing ? editColumns : columns;

  // Don't render if no items are configured and not editing
  if ((!displayItems || displayItems.length === 0) && !isEditing) {
    return null;
  }

  return (
    <section className="pt-[50px] pb-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          {isEditing ? (
            <>
              <EditableText
                value={title}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="Industries Title"
              />
              <EditableText
                value={subtitle}
                sectionKey={`${segmentKey}-subtitle`}
                pageSlug={pageSlug}
                language={language}
                className="text-xl text-black max-w-2xl mx-auto font-light"
                as="p"
                multiline
                onUpdate={onContentUpdate}
                fieldLabel="Industries Subtitle"
              />
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">
                {title}
              </h2>
              <p className="text-xl text-black max-w-2xl mx-auto font-light whitespace-pre-line">
                {subtitle}
              </p>
            </>
          )}
        </div>

        {/* Column Selector (Edit Mode Only) - matches Tiles style */}
        {isEditing && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
              <span className="text-xs text-gray-500 font-medium px-2">Columns:</span>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleColumnsChange(num)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    editColumns === num 
                      ? 'bg-[#f9dc24] text-black' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Industry Grid */}
        <div className={`grid ${gridColsClass} gap-8 md:gap-12 max-w-6xl mx-auto`}>
          {displayItems.map((item, index) => {
            const IconComponent = availableIcons[item.icon] || Camera;

            return (
              <div
                key={index}
                className="group flex flex-col items-center relative"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slide-in-up 0.6s ease-out both'
                }}
              >
                {/* Delete button in edit mode */}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white rounded-full shadow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                {/* Icon Circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg hover:shadow-xl hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105">
                    <IconComponent 
                      size={36} 
                      className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                      strokeWidth={1.8}
                    />
                  </div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-xl" />
                </div>

                {/* Icon Selector in edit mode - simple dropdown like Tiles */}
                {isEditing && (
                  <div className="relative mb-4">
                    <select
                      value={item.icon}
                      onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm cursor-pointer hover:border-[#f9dc24] focus:border-[#f9dc24] focus:ring-1 focus:ring-[#f9dc24] outline-none"
                    >
                      {iconOptions.map((iconName) => (
                        <option key={iconName} value={iconName}>
                          {iconName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                )}

                {/* Text Content */}
                <div className="text-center space-y-2 w-full">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                        className="text-lg md:text-xl font-bold text-gray-900 w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                        placeholder="Title..."
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="text-sm md:text-base text-gray-600 font-light w-full text-center bg-transparent border border-dashed border-gray-300 focus:border-[#f9dc24] outline-none p-2 hover:bg-[#f9dc24]/10 transition-colors resize-none rounded min-h-[60px]"
                        placeholder="Description..."
                        rows={2}
                      />
                      <input
                        type="text"
                        value={item.link || ''}
                        onChange={(e) => handleItemChange(index, 'link', e.target.value)}
                        className="text-xs text-gray-500 w-full text-center bg-gray-50 border border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 px-2 hover:bg-[#f9dc24]/10 transition-colors rounded"
                        placeholder="Link (optional): /en/page or #anchor"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed px-2 whitespace-pre-line">
                        {item.description}
                      </p>
                    </>
                  )}
                </div>

                {/* Wrap in Link only in view mode */}
                {!isEditing && item.link && (
                  <Link 
                    to={item.link}
                    className="absolute inset-0 z-10"
                    aria-label={item.title}
                  />
                )}
              </div>
            );
          })}

          {/* Add Item Button in edit mode */}
          {isEditing && (
            <div 
              onClick={handleAddItem}
              className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#f9dc24] hover:bg-[#f9dc24]/5 transition-all group"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#f9dc24]/20 transition-colors">
                <Plus className="h-8 w-8 text-gray-400 group-hover:text-[#f9dc24]" />
              </div>
              <span className="mt-3 text-sm text-gray-500 group-hover:text-gray-700">Add Item</span>
            </div>
          )}
        </div>

        {/* Save/Cancel Bar - matches Tiles style */}
        {isEditing && hasChanges && (
          <div className="flex justify-center gap-3 mt-8">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#f9dc24] text-black hover:bg-[#e5c91f]"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Industries
            </Button>
          </div>
        )}

        {/* Empty state for editing */}
        {isEditing && displayItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No items configured yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default IndustriesSegment;
