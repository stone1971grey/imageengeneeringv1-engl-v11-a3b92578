import { useState, useCallback, useRef, useEffect } from "react";
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
  GripVertical,
  Link as LinkIcon
} from "lucide-react";
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with props
  useEffect(() => {
    setEditColumns(columns);
    setEditItems(items);
    setHasChanges(false);
  }, [columns, items]);

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }[isEditing ? editColumns : columns] || 'grid-cols-2 md:grid-cols-4';

  const handleColumnsChange = (value: string) => {
    setEditColumns(Number(value));
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
      title: 'New Item',
      description: 'Description here',
      link: ''
    };
    setEditItems([...editItems, newItem]);
    setEditingItemIndex(editItems.length);
    setHasChanges(true);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editItems.filter((_, i) => i !== index);
    setEditItems(newItems);
    setEditingItemIndex(null);
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

      toast.success('Saved!');
      setHasChanges(false);
      setEditingItemIndex(null);
      onContentUpdate?.();
    } catch (error) {
      console.error('[IndustriesSegment] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, segmentKey, pageSlug, language, editColumns, editItems, onContentUpdate]);

  const handleCancel = () => {
    setEditColumns(columns);
    setEditItems(items);
    setEditingItemIndex(null);
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

        {/* Edit Controls */}
        {isEditing && (
          <div className="bg-black/90 rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#f9dc24] text-sm font-medium">Columns:</span>
              <Select value={String(editColumns)} onValueChange={handleColumnsChange}>
                <SelectTrigger className="w-20 bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddItem}
              variant="outline"
              size="sm"
              className="bg-transparent border-[#f9dc24] text-[#f9dc24] hover:bg-[#f9dc24] hover:text-black"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>

            <div className="flex-1" />

            {hasChanges && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  disabled={isSaving}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isSaving}
                  className="bg-[#f9dc24] text-black hover:bg-[#e5c91f]"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Industry Grid */}
        <div className={`grid ${gridColsClass} gap-8 md:gap-12 max-w-6xl mx-auto`}>
          {displayItems.map((item, index) => {
            const IconComponent = availableIcons[item.icon] || Camera;
            const isItemEditing = isEditing && editingItemIndex === index;

            if (isItemEditing) {
              // Editing mode for this item
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-4 border-2 border-[#f9dc24]">
                  <div className="space-y-4">
                    {/* Icon Selection */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Icon</label>
                      <Select 
                        value={item.icon} 
                        onValueChange={(value) => handleItemChange(index, 'icon', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <span>{item.icon}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Object.keys(availableIcons).map((iconName) => {
                            const Icon = availableIcons[iconName as IconName];
                            return (
                              <SelectItem key={iconName} value={iconName}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{iconName}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#f9dc24] focus:ring-1 focus:ring-[#f9dc24] outline-none"
                        placeholder="Item title"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#f9dc24] focus:ring-1 focus:ring-[#f9dc24] outline-none resize-none"
                        rows={2}
                        placeholder="Item description"
                      />
                    </div>

                    {/* Link */}
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Link (optional)
                      </label>
                      <input
                        type="text"
                        value={item.link || ''}
                        onChange={(e) => handleItemChange(index, 'link', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#f9dc24] focus:ring-1 focus:ring-[#f9dc24] outline-none"
                        placeholder="/en/page-slug or #anchor"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        onClick={() => handleRemoveItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button
                        onClick={() => setEditingItemIndex(null)}
                        size="sm"
                        className="bg-[#f9dc24] text-black hover:bg-[#e5c91f]"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            // Display mode (with click to edit in edit mode)
            const content = (
              <div
                className={cn(
                  "group flex flex-col items-center",
                  isEditing && "cursor-pointer hover:bg-[#f9dc24]/10 rounded-xl p-4 transition-colors"
                )}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slide-in-up 0.6s ease-out both'
                }}
                onClick={isEditing ? () => setEditingItemIndex(index) : undefined}
              >
                {/* Icon Circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg hover:shadow-xl hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105 cursor-pointer">
                      <IconComponent 
                        size={36} 
                        className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                        strokeWidth={1.8}
                      />
                  </div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-xl" />
                </div>

                {/* Text Content */}
                <div className="text-center space-y-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-light leading-relaxed px-2 whitespace-pre-line">
                    {item.description}
                  </p>
                </div>

                {/* Edit indicator */}
                {isEditing && (
                  <span className="mt-2 text-xs text-[#f9dc24] bg-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to edit
                  </span>
                )}
              </div>
            );

            // In edit mode, don't wrap with Link
            if (isEditing) {
              return <div key={index}>{content}</div>;
            }

            if (item.link) {
              return (
                <Link 
                  key={index}
                  to={item.link}
                  className="block hover:scale-105 transition-transform duration-300"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={index}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Empty state for editing */}
        {isEditing && displayItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No items configured yet</p>
            <Button
              onClick={handleAddItem}
              className="bg-[#f9dc24] text-black hover:bg-[#e5c91f]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default IndustriesSegment;
