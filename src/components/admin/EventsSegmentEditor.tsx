import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Calendar, Filter, Layout, Eye, SortAsc } from "lucide-react";

interface EventsSegmentEditorProps {
  segmentId: string;
  pageSlug: string;
  data?: {
    title?: string;
    description?: string;
    showFilters?: boolean;
    showPastEvents?: boolean;
    layout?: 'grid' | 'list';
    maxEvents?: number;
    sortOrder?: 'asc' | 'desc';
    categories?: string[];
  };
  onSave?: () => void;
  language?: string;
}

const EVENT_CATEGORIES = [
  { value: "Workshop", label: "Workshop" },
  { value: "Schulung", label: "Training" },
  { value: "Messe", label: "Trade Fair" },
  { value: "Webinar", label: "Webinar" },
  { value: "Conference", label: "Conference" },
];

const EventsSegmentEditorComponent = ({
  segmentId,
  pageSlug,
  data,
  onSave,
  language,
}: EventsSegmentEditorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [maxEvents, setMaxEvents] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const normalizedLang = (language || 'en')?.split('-')[0] || 'en';

  // Load content for the current language
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      // Reset state before loading
      setTitle("");
      setDescription("");
      
      try {
        const { data: contentData } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", segmentId)
          .eq("language", normalizedLang)
          .maybeSingle();

        if (contentData?.content_value) {
          try {
            const parsed = JSON.parse(contentData.content_value);
            setTitle(parsed.title || "");
            setDescription(parsed.description || "");
            setShowFilters(parsed.showFilters ?? true);
            setShowPastEvents(parsed.showPastEvents ?? false);
            setLayout(parsed.layout || 'grid');
            setMaxEvents(parsed.maxEvents || null);
            setSortOrder(parsed.sortOrder || 'asc');
            setSelectedCategories(parsed.categories || []);
          } catch (e) {
            console.error("Error parsing content:", e);
          }
        } else if (normalizedLang === 'en') {
          // Set and auto-save defaults for English if not exists
          const defaultTitle = data?.title || "Upcoming Events & Training";
          const defaultDescription = data?.description || "Join our expert-led workshops, training sessions, and industry events";
          setTitle(defaultTitle);
          setDescription(defaultDescription);
          setShowFilters(data?.showFilters ?? true);
          setShowPastEvents(data?.showPastEvents ?? false);
          setLayout(data?.layout || 'grid');
          setMaxEvents(data?.maxEvents || null);
          setSortOrder(data?.sortOrder || 'asc');
          setSelectedCategories(data?.categories || []);
          
          // Auto-save English defaults to database
          await supabase
            .from("page_content")
            .upsert({
              page_slug: pageSlug,
              section_key: segmentId,
              content_type: "events",
              content_value: JSON.stringify({ 
                title: defaultTitle, 
                description: defaultDescription,
                showFilters: true,
                showPastEvents: false,
                layout: 'grid',
                maxEvents: null,
                sortOrder: 'asc',
                categories: []
              }),
              language: "en",
              updated_at: new Date().toISOString(),
            }, { onConflict: "page_slug,section_key,language" });
        }
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [pageSlug, segmentId, normalizedLang]);

  // Listen for external translate events from Rainbow SplitScreen
  useEffect(() => {
    if (normalizedLang === 'en') return;

    const handleExternalTranslate = async () => {
      console.log(`[EventsSegmentEditor] Translate event received for ${normalizedLang}`);
      setIsTranslating(true);
      
      try {
        // Load English version
        const { data: englishData } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", segmentId)
          .eq("language", "en")
          .maybeSingle();

        if (!englishData?.content_value) {
          toast.error("No English content found to translate");
          setIsTranslating(false);
          return;
        }

        const englishParsed = JSON.parse(englishData.content_value);
        
        // Call translate API
        const { data: translationResult, error: translateError } = await supabase.functions
          .invoke('translate-content', {
            body: {
              texts: {
                title: englishParsed.title || '',
                description: englishParsed.description || '',
              },
              targetLanguage: normalizedLang
            }
          });

        if (translateError) throw translateError;

        // Update state with translated content
        setTitle(translationResult.translatedTexts?.title || englishParsed.title || "");
        setDescription(translationResult.translatedTexts?.description || englishParsed.description || "");
        
        // Copy settings from English
        setShowFilters(englishParsed.showFilters ?? true);
        setShowPastEvents(englishParsed.showPastEvents ?? false);
        setLayout(englishParsed.layout || 'grid');
        setMaxEvents(englishParsed.maxEvents || null);
        setSortOrder(englishParsed.sortOrder || 'asc');
        setSelectedCategories(englishParsed.categories || []);

        toast.success(`Translated to ${normalizedLang.toUpperCase()}`);
      } catch (error) {
        console.error("Translation error:", error);
        toast.error("Translation failed");
      } finally {
        setIsTranslating(false);
      }
    };

    window.addEventListener('events-translate', handleExternalTranslate);
    return () => window.removeEventListener('events-translate', handleExternalTranslate);
  }, [normalizedLang, pageSlug, segmentId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const contentValue = JSON.stringify({
        title,
        description,
        showFilters,
        showPastEvents,
        layout,
        maxEvents,
        sortOrder,
        categories: selectedCategories,
      });

      await supabase
        .from("page_content")
        .upsert({
          page_slug: pageSlug,
          section_key: segmentId,
          content_type: "events",
          content_value: contentValue,
          language: normalizedLang,
          updated_at: new Date().toISOString(),
        }, { onConflict: "page_slug,section_key,language" });

      toast.success(`Events segment saved (${normalizedLang.toUpperCase()})`);
      onSave?.();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {isTranslating && (
        <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-purple-300">
            <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full"></div>
            <span>Translating to {normalizedLang.toUpperCase()}...</span>
          </div>
        </div>
      )}

      {/* Section Title & Description */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white mb-2">
          <Calendar className="w-5 h-5 text-[#f9dc24]" />
          <h3 className="font-semibold">Section Header</h3>
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Section Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Upcoming Events & Training"
            className="bg-[#2a2a2a] border-gray-600 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-white">Section Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Join our expert-led workshops and training sessions..."
            className="bg-[#2a2a2a] border-gray-600 text-white min-h-[80px]"
          />
        </div>
      </div>

      {/* Display Settings */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-white mb-2">
          <Layout className="w-5 h-5 text-[#f9dc24]" />
          <h3 className="font-semibold">Display Settings</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Layout</Label>
            <Select value={layout} onValueChange={(v) => setLayout(v as 'grid' | 'list')}>
              <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Sort Order</Label>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
              <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Earliest First</SelectItem>
                <SelectItem value="desc">Latest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Max Events to Show (leave empty for all)</Label>
          <Input
            type="number"
            value={maxEvents || ''}
            onChange={(e) => setMaxEvents(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="All events"
            className="bg-[#2a2a2a] border-gray-600 text-white"
            min={1}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Label className="text-white">Show Category Filters</Label>
          </div>
          <Switch
            checked={showFilters}
            onCheckedChange={setShowFilters}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <Label className="text-white">Include Past Events</Label>
          </div>
          <Switch
            checked={showPastEvents}
            onCheckedChange={setShowPastEvents}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-white mb-2">
          <Filter className="w-5 h-5 text-[#f9dc24]" />
          <h3 className="font-semibold">Filter by Category (optional)</h3>
        </div>
        <p className="text-sm text-gray-400">
          Select specific categories to display, or leave empty to show all categories.
        </p>
        <div className="flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggleCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategories.includes(cat.value)
                  ? 'bg-[#f9dc24] text-black'
                  : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-700">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
        >
          {isSaving ? 'Saving...' : `Save Events Segment (${normalizedLang.toUpperCase()})`}
        </Button>
      </div>
    </div>
  );
};

export const EventsSegmentEditor = memo(EventsSegmentEditorComponent);
export default EventsSegmentEditor;
