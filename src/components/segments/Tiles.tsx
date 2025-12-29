import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableImage } from '@/components/frontend-edit/EditableImage';
import { Plus, Trash2, Loader2, FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const iconMap: Record<string, any> = {
  FileText,
  Download,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Car,
  Smartphone,
  Heart,
  CheckCircle,
  Lightbulb,
  Monitor,
};

interface TileItem {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  metadata?: { altText?: string };
  ctaText?: string;
  ctaLink?: string;
  ctaStyle?: 'standard' | 'technical';
  showButton?: boolean;
}

interface TilesProps {
  id?: string;
  title?: string;
  description?: string;
  columns?: '2' | '3' | '4';
  items?: TileItem[];
  segmentKey?: string;
  pageSlug?: string;
  language?: string;
  onContentUpdate?: () => void;
}

const Tiles: React.FC<TilesProps> = ({
  id,
  title = '',
  description = '',
  columns = '3',
  items = [],
  segmentKey = '',
  pageSlug = '',
  language = 'en',
  onContentUpdate
}) => {
  const editContext = useFrontendEditOptional();
  const segmentEdit = useSegmentEdit();
  const isEditing = segmentEdit?.isSegmentEditing || editContext?.isEditMode || false;

  // Local state for items editing
  const [localItems, setLocalItems] = useState<TileItem[]>(items);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local items with props
  useEffect(() => {
    setLocalItems(items);
    setHasChanges(false);
  }, [items]);

  const displayTitle = title || (isEditing ? '[Click to add title]' : '');
  const displayDescription = description || (isEditing ? '[Click to add description]' : '');

  // Hide if no content and not editing
  if (!title && !description && localItems.length === 0 && !isEditing) {
    return null;
  }

  const getGridColumns = () => {
    switch (columns) {
      case '4':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case '3':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const handleItemChange = (index: number, field: keyof TileItem, newValue: any) => {
    const updatedItems = [...localItems];
    updatedItems[index] = { ...updatedItems[index], [field]: newValue };
    setLocalItems(updatedItems);
    setHasChanges(true);
  };

  const handleAddItem = () => {
    setLocalItems([...localItems, { 
      title: '', 
      description: '', 
      icon: 'FileText',
      showButton: true,
      ctaText: '',
      ctaLink: '',
      ctaStyle: 'standard'
    }]);
    setHasChanges(true);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = localItems.filter((_, i) => i !== index);
    setLocalItems(updatedItems);
    setHasChanges(true);
  };

  const handleCancel = () => {
    setLocalItems(items);
    setHasChanges(false);
  };

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    
    try {
      // Load page_segments
      const { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError) {
        console.error('[Tiles] Error loading page_segments:', loadError);
        toast.error('Error loading content');
        setIsSaving(false);
        return;
      }

      if (!pageSegmentsData) {
        console.error('[Tiles] page_segments not found');
        toast.error('Content not found');
        setIsSaving(false);
        return;
      }

      // Parse segments
      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        console.error('[Tiles] Error parsing page_segments:', e);
        toast.error('Error parsing content');
        setIsSaving(false);
        return;
      }

      // Find the segment by ID
      const segmentIndex = segments.findIndex((seg: any) => {
        const segId = String(seg.id || seg.segmentId || seg.segment_id || '');
        return segId === segmentKey;
      });

      if (segmentIndex === -1) {
        console.error('[Tiles] Segment not found:', segmentKey);
        toast.error('Segment not found');
        setIsSaving(false);
        return;
      }

      // Update items in segment data
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.items = localItems;

      // Save
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString()
        })
        .eq('id', pageSegmentsData.id);

      if (updateError) {
        console.error('[Tiles] Error saving:', updateError);
        toast.error('Error saving');
        setIsSaving(false);
        return;
      }

      toast.success('Tiles saved!');
      setHasChanges(false);
      onContentUpdate?.();
    } catch (error) {
      console.error('[Tiles] Save error:', error);
      toast.error('Error saving');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, localItems, pageSlug, language, segmentKey, onContentUpdate]);

  return (
    <section id={id} className="pt-[60px] pb-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        {(displayTitle || isEditing) && (
          <div className="text-center mb-16">
            {isEditing ? (
              <EditableText
                value={displayTitle}
                sectionKey={`${segmentKey}-title`}
                pageSlug={pageSlug}
                language={language}
                className="text-4xl font-bold text-gray-900 mb-4"
                as="h2"
                onUpdate={onContentUpdate}
                fieldLabel="Tiles Title"
              />
            ) : (
              title && <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            )}
            
            {(displayDescription || isEditing) && (
              isEditing ? (
                <EditableText
                  value={displayDescription}
                  sectionKey={`${segmentKey}-description`}
                  pageSlug={pageSlug}
                  language={language}
                  className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-pre-line"
                  as="p"
                  multiline
                  onUpdate={onContentUpdate}
                  fieldLabel="Tiles Description"
                />
              ) : (
                description && (
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-pre-line">
                    {description}
                  </p>
                )
              )
            )}
          </div>
        )}

        {/* Tiles Grid */}
        <div className={`grid gap-8 ${getGridColumns()}`}>
          {localItems.map((tile, idx) => {
            const Icon = iconMap[tile.icon || 'FileText'] || FileText;
            const hasImage = tile.imageUrl;

            return (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden relative group">
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                
                <CardContent className="p-0">
                  {isEditing ? (
                    // Edit mode: Editable image or icon
                    hasImage ? (
                      <div className="w-full max-h-[200px] overflow-hidden">
                        <EditableImage
                          src={tile.imageUrl || ''}
                          alt={tile.metadata?.altText || tile.title}
                          sectionKey={`${segmentKey}-tile-${idx}-image`}
                          pageSlug={pageSlug}
                          language={language}
                          className="w-full h-full max-h-[200px] object-cover"
                          onUpdate={() => {
                            setHasChanges(true);
                            onContentUpdate?.();
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center pt-8">
                        <div className="p-4 bg-[#f9dc24]/10 rounded-full border-2 border-[#f9dc24]/20">
                          <Icon className="h-8 w-8 text-gray-900" />
                        </div>
                      </div>
                    )
                  ) : (
                    // View mode
                    hasImage ? (
                      <div className="w-full max-h-[200px] overflow-hidden">
                        <img 
                          src={tile.imageUrl} 
                          alt={tile.metadata?.altText || tile.title}
                          className="w-full h-full max-h-[200px] object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center pt-8">
                        <div className="p-4 bg-[#f9dc24]/10 rounded-full border-2 border-[#f9dc24]/20 hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-300">
                          <Icon className="h-8 w-8 text-gray-900" />
                        </div>
                      </div>
                    )
                  )}
                  
                  <div className="p-8">
                    <div className="space-y-3 flex-1 text-center">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={tile.title}
                            onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                            className="text-2xl font-bold text-gray-900 w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                            placeholder="Tile title..."
                          />
                          <textarea
                            value={tile.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="text-gray-600 leading-relaxed w-full text-center bg-transparent border border-dashed border-gray-300 focus:border-[#f9dc24] outline-none p-2 hover:bg-[#f9dc24]/10 transition-colors resize-none min-h-[80px]"
                            placeholder="Tile description..."
                          />
                          
                          {/* CTA Fields in Edit Mode */}
                          <div className="pt-4 space-y-2">
                            <input
                              type="text"
                              value={tile.ctaText || ''}
                              onChange={(e) => handleItemChange(idx, 'ctaText', e.target.value)}
                              className="w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors text-sm"
                              placeholder="Button text..."
                            />
                            <input
                              type="text"
                              value={tile.ctaLink || ''}
                              onChange={(e) => handleItemChange(idx, 'ctaLink', e.target.value)}
                              className="w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors text-sm"
                              placeholder="Button link..."
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold text-gray-900">{tile.title}</h3>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{tile.description}</p>
                        </>
                      )}
                    </div>
                    
                    {!isEditing && tile.showButton !== false && tile.ctaText && tile.ctaLink && (
                      <div className="mt-6 flex justify-center">
                        <Link
                          to={tile.ctaLink}
                          className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            tile.ctaStyle === "technical"
                              ? "bg-gray-800 text-white hover:bg-gray-900"
                              : "bg-[#f9dc24] text-gray-900 hover:bg-yellow-400"
                          }`}
                        >
                          {tile.ctaText}
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Tile Button */}
        {isEditing && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-gray-600 hover:text-gray-800 border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tile
            </Button>
          </div>
        )}

        {/* Save/Cancel buttons */}
        {isEditing && (
          <div className="mt-8 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving || !hasChanges}
              className="bg-black text-[#f9dc24] hover:bg-gray-900 border-black"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-black text-[#f9dc24] hover:bg-gray-900"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Tiles;