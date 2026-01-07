import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFrontendEditOptional } from '@/contexts/FrontendEditContext';
import { useSegmentEdit } from '@/components/frontend-edit/EditableSegment';
import { EditableText } from '@/components/frontend-edit/EditableText';
import { EditableImage } from '@/components/frontend-edit/EditableImage';
import { FrontendRichTextEditor } from '@/components/frontend-edit/FrontendRichTextEditor';
import { Plus, Trash2, Loader2, FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor, Settings, Camera, Clock, Globe, Mail, MapPin, Search, Star, Users, Wrench, Target, Activity, Award, BookOpen, Briefcase, Calendar, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Utility to strip HTML tags from text (safety measure for legacy data)
const stripHtml = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

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
  Settings,
  Camera,
  Clock,
  Globe,
  Mail,
  MapPin,
  Search,
  Star,
  Users,
  Wrench,
  Target,
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
};

const iconOptions = Object.keys(iconMap);

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
  
  // ROBUSTE isEditing-Logik (aus Memory: frontend-editing-resilient-is-editing-logic)
  // Prüfe auch URL-Parameter als Fallback
  const urlHasEditParam = typeof window !== 'undefined' && window.location.search.includes('edit=true');
  const isEditing = segmentEdit?.isSegmentEditing || 
                    (editContext?.isEditMode && editContext?.canEdit) || 
                    editContext?.isEditMode ||
                    urlHasEditParam ||
                    false;

  // DEBUG: Detaillierte Logs bei jedem Render
  console.log('[Tiles] 🎯 RENDER', { 
    segmentKey, 
    pageSlug, 
    language,
    isEditing,
    urlHasEditParam,
    hasEditContext: !!editContext,
    editContextMode: editContext?.isEditMode,
    editContextCanEdit: editContext?.canEdit,
    hasSegmentEdit: !!segmentEdit,
    segmentEditMode: segmentEdit?.isSegmentEditing,
    itemsCount: items?.length || 0
  });

  // Local state for items editing
  const [localItems, setLocalItems] = useState<TileItem[]>(items);
  const [localColumns, setLocalColumns] = useState<'2' | '3' | '4'>(columns);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Refs for auto-save on navigation
  const localItemsRef = useRef(localItems);
  const localColumnsRef = useRef(localColumns);
  const hasChangesRef = useRef(hasChanges);
  const saveInProgressRef = useRef(false);
  // KRITISCH: Flag um Props-Überschreibung nach Save zu verhindern
  const justSavedRef = useRef(false);
  const saveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => { localItemsRef.current = localItems; }, [localItems]);
  useEffect(() => { localColumnsRef.current = localColumns; }, [localColumns]);
  useEffect(() => { hasChangesRef.current = hasChanges; }, [hasChanges]);

  // Sync local items with props - BUT ONLY if:
  // 1. There are no pending changes
  // 2. We didn't just save (verhindert Race Condition)
  useEffect(() => {
    // Wenn wir gerade gespeichert haben, ignoriere Props für 2 Sekunden
    if (justSavedRef.current) {
      console.log('[Tiles] Ignoriere Props-Update nach Save');
      return;
    }
    if (!hasChangesRef.current && !saveInProgressRef.current) {
      setLocalItems(items);
    }
  }, [items]);

  useEffect(() => {
    if (justSavedRef.current) return;
    if (!hasChangesRef.current && !saveInProgressRef.current) {
      setLocalColumns(columns);
    }
  }, [columns]);

  const displayTitle = title || (isEditing ? '[Click to add title]' : '');
  const displayDescription = description || (isEditing ? '[Click to add description]' : '');

  // Hide if no content and not editing
  if (!title && !description && localItems.length === 0 && !isEditing) {
    console.log('[Tiles] ⚠️ VERSTECKT - keine Inhalte und nicht im Edit-Modus');
    return null;
  }

  const getGridColumns = () => {
    switch (localColumns) {
      case '4':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case '3':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  // ========= KERNFUNKTION: Sofortiges Speichern =========
  // Diese Funktion MUSS zuerst definiert werden, da sie von anderen Funktionen aufgerufen wird
  const performAutoSave = useCallback(async (): Promise<boolean> => {
    // KRITISCH: Prüfe ob alle notwendigen Props vorhanden sind
    if (!pageSlug || !segmentKey) {
      console.error('[Tiles] ❌ KRITISCH: Fehlende Props!', { pageSlug, segmentKey, language });
      toast.error('Auto-Save fehlgeschlagen: Fehlende Segment-Konfiguration');
      return false;
    }
    
    if (saveInProgressRef.current) {
      console.log('[Tiles] Save bereits aktiv, überspringe...');
      return false;
    }
    
    saveInProgressRef.current = true;
    console.log('[Tiles] 🔄 SPEICHERE...', { 
      pageSlug,
      segmentKey,
      language,
      itemCount: localItemsRef.current.length, 
      columns: localColumnsRef.current
    });
    
    try {
      const { data: pageSegmentsData, error: loadError } = await supabase
        .from('page_content')
        .select('id, content_value')
        .eq('page_slug', pageSlug)
        .eq('section_key', 'page_segments')
        .eq('language', language)
        .maybeSingle();

      if (loadError || !pageSegmentsData) {
        console.error('[Tiles] Lade-Fehler:', loadError);
        return false;
      }

      let segments: any[] = [];
      try {
        segments = JSON.parse(pageSegmentsData.content_value || '[]');
      } catch (e) {
        console.error('[Tiles] Parse-Fehler:', e);
        return false;
      }

      // Debug: Zeige alle Segmente
      console.log('[Tiles] Geladene Segmente:', segments.map(s => ({
        id: s.id,
        segment_key: s.segment_key,
        type: s.type
      })));
      
      const segmentIndex = segments.findIndex((seg: any) => {
        // Prüfe alle möglichen ID-Felder
        const possibleIds = [
          String(seg.id || ''),
          String(seg.segmentId || ''),
          String(seg.segment_id || ''),
          String(seg.segment_key || '')
        ];
        const match = possibleIds.includes(segmentKey);
        if (match) {
          console.log('[Tiles] ✅ Segment gefunden:', { searchKey: segmentKey, matchedIn: possibleIds });
        }
        return match;
      });

      if (segmentIndex === -1) {
        console.error('[Tiles] ❌ Segment nicht gefunden!', { 
          gesucht: segmentKey, 
          verfuegbar: segments.map(s => ({ id: s.id, segment_key: s.segment_key, type: s.type }))
        });
        toast.error(`Segment ${segmentKey} nicht gefunden`);
        return false;
      }

      // Stelle sicher dass data existiert
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      
      // Speichere die aktuellen Ref-Werte
      segments[segmentIndex].data.items = localItemsRef.current;
      segments[segmentIndex].data.columns = localColumnsRef.current;

      // Debug: Zeige was gespeichert wird
      const dataToSave = segments[segmentIndex].data;
      console.log('[Tiles] 📝 Speichere Daten:', {
        segmentIndex,
        dataToSave: JSON.stringify(dataToSave).substring(0, 200) + '...',
        itemCount: localItemsRef.current.length,
        columns: localColumnsRef.current
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('[Tiles] ❌ Kein User eingeloggt!');
        toast.error('Nicht eingeloggt - bitte neu anmelden');
        return false;
      }
      
      const newContentValue = JSON.stringify(segments);
      console.log('[Tiles] Sende Update an Supabase...', {
        rowId: pageSegmentsData.id,
        contentLength: newContentValue.length,
        userId: user.id
      });
      
      const { error: updateError, data: updateData } = await supabase
        .from('page_content')
        .update({
          content_value: newContentValue,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', pageSegmentsData.id)
        .select();

      if (!updateError) {
        console.log('[Tiles] ✅ ERFOLGREICH GESPEICHERT!', { updateData });
        
        // SICHTBARE Erfolgsmeldung mit Details
        toast.success(`✅ Tiles gespeichert! (${localItemsRef.current.length} Kacheln)`, { 
          duration: 3000,
          description: `Segment ${segmentKey} auf ${pageSlug}`
        });
        
        // KRITISCH: Setze Flag um Props-Überschreibung zu verhindern
        justSavedRef.current = true;
        setTimeout(() => {
          justSavedRef.current = false;
        }, 3000); // 3 Sekunden Schutz
        
        hasChangesRef.current = false;
        setHasChanges(false);
        
        // Callback für Page-Refresh
        onContentUpdate?.();
        
        return true;
      } else {
        console.error('[Tiles] ❌ Update-Fehler:', updateError);
        toast.error(`Speichern fehlgeschlagen: ${updateError.message}`);
      }
      return false;
    } catch (e) {
      console.error('[Tiles] Speicher-Fehler:', e);
      return false;
    } finally {
      saveInProgressRef.current = false;
    }
  }, [pageSlug, language, segmentKey]);

  // ========= DEBOUNCED SAVE: Verhindert zu viele Saves bei schnellem Tippen =========
  const triggerDebouncedSave = useCallback(() => {
    // Lösche vorherigen Timeout
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }
    
    // Setze neuen Timeout - speichere nach 500ms Inaktivität
    saveDebounceRef.current = setTimeout(() => {
      if (hasChangesRef.current && !saveInProgressRef.current) {
        performAutoSave();
      }
    }, 500);
  }, [performAutoSave]);

  // ========= Handler-Funktionen mit debounced Speichern =========
  const handleColumnsChange = (newColumns: '2' | '3' | '4') => {
    setLocalColumns(newColumns);
    localColumnsRef.current = newColumns;
    hasChangesRef.current = true;
    setHasChanges(true);
    // Debounced speichern
    triggerDebouncedSave();
  };

  const handleItemChange = (index: number, field: keyof TileItem, newValue: any) => {
    const updatedItems = [...localItems];
    updatedItems[index] = { ...updatedItems[index], [field]: newValue };
    setLocalItems(updatedItems);
    localItemsRef.current = updatedItems;
    hasChangesRef.current = true;
    setHasChanges(true);
    // Debounced speichern (500ms nach letzter Änderung)
    triggerDebouncedSave();
  };

  const handleAddItem = async () => {
    console.log('[Tiles] === ADD TILE CLICKED ===');
    
    const newItems = [...localItems, { 
      title: '', 
      description: '', 
      icon: 'FileText',
      showButton: true,
      ctaText: '',
      ctaLink: '',
      ctaStyle: 'standard' as const
    }];
    setLocalItems(newItems);
    localItemsRef.current = newItems;
    hasChangesRef.current = true;
    setHasChanges(true);
    
    // SOFORT speichern und auf Ergebnis warten
    const saved = await performAutoSave();
    console.log('[Tiles] Add Tile - Save Result:', saved);
    
    if (!saved) {
      toast.error('Speichern fehlgeschlagen - siehe Konsole');
    }
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = localItems.filter((_, i) => i !== index);
    setLocalItems(updatedItems);
    localItemsRef.current = updatedItems;
    hasChangesRef.current = true;
    setHasChanges(true);
    // SOFORT speichern
    performAutoSave();
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

      // Update items and columns in segment data
      if (!segments[segmentIndex].data) {
        segments[segmentIndex].data = {};
      }
      segments[segmentIndex].data.items = localItems;
      segments[segmentIndex].data.columns = localColumns;

      // Save - include updated_by for proper tracking
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from('page_content')
        .update({
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
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
  }, [hasChanges, localItems, localColumns, pageSlug, language, segmentKey, onContentUpdate]);

  // Visibility change - Speichere wenn Tab versteckt wird (als Backup)
  useEffect(() => {
    if (!isEditing) return;

    const handleVisibilityChange = () => {
      if (document.hidden && hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[Tiles] Tab hidden - speichere als Backup...');
        performAutoSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEditing, performAutoSave]);

  // beforeunload - Speichere beim Schließen des Tabs
  useEffect(() => {
    if (!isEditing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[Tiles] beforeunload - speichere...');
        performAutoSave();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, performAutoSave]);

  // Unmount - Speichere beim Verlassen der Komponente
  useEffect(() => {
    return () => {
      if (hasChangesRef.current && !saveInProgressRef.current) {
        console.log('[Tiles] Unmount - speichere...');
        performAutoSave();
      }
    };
  }, [performAutoSave]);

  return (
    <section id={id} className="pt-8 pb-16 bg-gray-50">
      {/* DEBUG BOX - wird immer angezeigt wenn ?edit=true */}
      {urlHasEditParam && (
        <div className="container mx-auto px-6 mb-4">
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded text-sm">
            <strong>🔍 Tiles Debug:</strong> segmentKey={segmentKey}, isEditing={String(isEditing)}, 
            items={localItems.length}, urlEdit={String(urlHasEditParam)}, 
            editContext={String(!!editContext)}, segmentEdit={String(!!segmentEdit)}
          </div>
        </div>
      )}
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
                    {stripHtml(description)}
                  </p>
                )
              )
            )}
          </div>
        )}

        {/* Column Selector (Edit Mode Only) */}
        {isEditing && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
              <span className="text-xs text-gray-500 font-medium px-2">Columns:</span>
              <button
                type="button"
                onClick={() => handleColumnsChange('2')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  localColumns === '2' 
                    ? 'bg-[#f9dc24] text-black' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => handleColumnsChange('3')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  localColumns === '3' 
                    ? 'bg-[#f9dc24] text-black' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                3
              </button>
              <button
                type="button"
                onClick={() => handleColumnsChange('4')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  localColumns === '4' 
                    ? 'bg-[#f9dc24] text-black' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                4
              </button>
            </div>
          </div>
        )}

        {/* Tiles Grid */}
        <div className={`grid gap-8 ${getGridColumns()}`}>
          {localItems.map((tile, idx) => {
            const hasIcon = tile.icon && tile.icon !== 'none' && tile.icon !== '';
            const Icon = hasIcon ? (iconMap[tile.icon!] || null) : null;
            const hasImage = tile.imageUrl;

            return (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden relative group h-full flex flex-col">
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
                
                <CardContent className="p-0 flex flex-col h-full">
                  {isEditing ? (
                    // Edit mode: Editable image or icon with selector
                    hasImage ? (
                      <div className="w-full h-[200px] overflow-hidden flex-shrink-0">
                        <EditableImage
                          src={tile.imageUrl || ''}
                          alt={tile.metadata?.altText || tile.title}
                          sectionKey={`${segmentKey}-tile-${idx}-image`}
                          pageSlug={pageSlug}
                          language={language}
                          className="w-full h-[200px]"
                          imgClassName="w-full h-[200px] object-cover"
                          onUpdate={() => {
                            setHasChanges(true);
                            onContentUpdate?.();
                          }}
                        />
                      </div>
                    ) : hasIcon && Icon ? (
                      <div className="flex flex-col items-center pt-8 gap-2 flex-shrink-0">
                        <div className="p-4 bg-[#f9dc24]/10 rounded-full border-2 border-[#f9dc24]/20">
                          <Icon className="h-8 w-8 text-gray-900" />
                        </div>
                        {/* Icon Selector Dropdown */}
                        <div className="relative">
                          <select
                            value={tile.icon || ''}
                            onChange={(e) => handleItemChange(idx, 'icon', e.target.value === '' ? '' : e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm cursor-pointer hover:border-[#f9dc24] focus:border-[#f9dc24] focus:ring-1 focus:ring-[#f9dc24] outline-none"
                          >
                            <option value="">No Icon</option>
                            {iconOptions.map((iconName) => (
                              <option key={iconName} value={iconName}>
                                {iconName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    ) : (
                      // No icon and no image - show selector to add icon
                      <div className="flex flex-col items-center pt-8 gap-2 flex-shrink-0">
                        <div className="relative">
                          <select
                            value={tile.icon || ''}
                            onChange={(e) => handleItemChange(idx, 'icon', e.target.value === '' ? '' : e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm cursor-pointer hover:border-[#f9dc24] focus:border-[#f9dc24] focus:ring-1 focus:ring-[#f9dc24] outline-none"
                          >
                            <option value="">No Icon</option>
                            {iconOptions.map((iconName) => (
                              <option key={iconName} value={iconName}>
                                {iconName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    )
                  ) : (
                    // View mode
                    hasImage ? (
                      <div className="w-full h-[200px] overflow-hidden flex-shrink-0">
                        <img 
                          src={tile.imageUrl} 
                          alt={tile.metadata?.altText || tile.title}
                          className="w-full h-[200px] object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : hasIcon && Icon ? (
                      <div className="flex justify-center pt-8 flex-shrink-0">
                        <div className="p-4 bg-[#f9dc24]/10 rounded-full border-2 border-[#f9dc24]/20 hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-300">
                          <Icon className="h-8 w-8 text-gray-900" />
                        </div>
                      </div>
                    ) : null
                  )}
                  
                  {/* Content area - flex-grow to push button down */}
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="space-y-3 text-center flex-grow">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={tile.title}
                            onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                            className="text-2xl font-bold text-gray-900 w-full text-center bg-transparent border-b border-dashed border-gray-300 focus:border-[#f9dc24] outline-none py-1 hover:bg-[#f9dc24]/10 transition-colors"
                            placeholder="Tile title..."
                          />
                          {/* Plain Text Description Editor */}
                          <textarea
                            value={stripHtml(tile.description || '')}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Tile description..."
                            className="w-full min-h-[120px] text-gray-600 leading-relaxed text-center bg-transparent border border-dashed border-gray-300 focus:border-[#f9dc24] outline-none p-2 hover:bg-[#f9dc24]/10 transition-colors resize-none rounded"
                          />
                          
                          {/* Button Editor with Style Selector */}
                          <div className="pt-4 space-y-3 border-t border-gray-200 mt-4">
                            <p className="text-xs text-gray-500 font-medium">Button Settings</p>
                            
                            {/* Button Preview - Click to edit text inline */}
                            <div className="flex justify-center">
                              <div
                                className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                  tile.ctaStyle === 'technical'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-[#f9dc24] text-gray-900'
                                }`}
                              >
                                <input
                                  type="text"
                                  value={tile.ctaText || ''}
                                  onChange={(e) => handleItemChange(idx, 'ctaText', e.target.value)}
                                  className={`bg-transparent border-none outline-none text-center font-semibold w-full min-w-[80px] placeholder:opacity-60 ${
                                    tile.ctaStyle === 'technical'
                                      ? 'text-white placeholder:text-white/60'
                                      : 'text-gray-900 placeholder:text-gray-900/60'
                                  }`}
                                  placeholder="Button text..."
                                />
                              </div>
                            </div>
                            
                            {/* Button Link */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-10">Link:</span>
                              <input
                                type="text"
                                value={tile.ctaLink || ''}
                                onChange={(e) => handleItemChange(idx, 'ctaLink', e.target.value)}
                                className="flex-1 bg-gray-900 text-white text-sm px-3 py-2 rounded border border-gray-600 placeholder:text-gray-400"
                                placeholder="/page-url or https://..."
                              />
                            </div>
                            
                            {/* Button Style Selector */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 w-10">Style:</span>
                              <div className="flex gap-2 items-end">
                                <button
                                  type="button"
                                  onClick={() => handleItemChange(idx, 'ctaStyle', 'standard')}
                                  className={`rounded transition-all border border-gray-400 ${
                                    (tile.ctaStyle || 'standard') === 'standard' ? 'w-10 h-10' : 'w-7 h-7 hover:w-8 hover:h-8'
                                  }`}
                                  style={{ backgroundColor: '#f9dc24' }}
                                  title="Yellow (Standard)"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleItemChange(idx, 'ctaStyle', 'technical')}
                                  className={`rounded transition-all border border-gray-400 ${
                                    tile.ctaStyle === 'technical' ? 'w-10 h-10' : 'w-7 h-7 hover:w-8 hover:h-8'
                                  }`}
                                  style={{ backgroundColor: '#1f2937' }}
                                  title="Dark (Technical)"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold text-gray-900">{stripHtml(tile.title)}</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {stripHtml(tile.description || '')}
                          </p>
                        </>
                      )}
                    </div>
                    
                    {/* Button area - always at bottom due to flex-grow above */}
                    {!isEditing && tile.showButton !== false && tile.ctaText && tile.ctaLink && (
                      <div className="mt-6 flex justify-center flex-shrink-0">
                        {tile.ctaLink.startsWith('http://') || tile.ctaLink.startsWith('https://') ? (
                          <a
                            href={tile.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                              tile.ctaStyle === "technical"
                                ? "bg-gray-800 text-white hover:bg-gray-900"
                                : "bg-[#f9dc24] text-gray-900 hover:bg-yellow-400"
                            }`}
                          >
                            {tile.ctaText}
                          </a>
                        ) : (
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
                        )}
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
              className="bg-[#000000] text-white hover:bg-[#1a1a1a] hover:text-white border-[#000000]"
            >
              <Plus className="h-4 w-4 mr-2 text-white" />
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
              disabled={isSaving}
              className="bg-black text-[#f9dc24] hover:bg-gray-900 border-black"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
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