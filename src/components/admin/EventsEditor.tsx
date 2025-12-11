import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Eye, Calendar, MapPin, Clock, Upload, Globe, Users, GraduationCap, Presentation, Video, Building2, List } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaSelector } from "./MediaSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import EventsTranslationEditor from "./EventsTranslationEditor";


interface Event {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  image_url: string;
  date: string;
  time_start: string;
  time_end: string | null;
  location_city: string;
  location_country: string;
  location_venue: string | null;
  category: string;
  language_code: string;
  is_online: boolean;
  max_participants: number | null;
  registration_deadline: string | null;
  external_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const EVENT_CATEGORIES = [
  { value: "Training", label: "Training", color: "bg-blue-500", icon: GraduationCap },
  { value: "Trade Fair", label: "Trade Fair", color: "bg-purple-500", icon: Building2 },
  { value: "Workshop", label: "Workshop", color: "bg-emerald-500", icon: Users },
] as const;

const EVENT_LANGUAGES = [
  { value: "EN", label: "English", flag: "🇬🇧" },
  { value: "DE", label: "German", flag: "🇩🇪" },
  { value: "JA", label: "Japanese", flag: "🇯🇵" },
  { value: "KO", label: "Korean", flag: "🇰🇷" },
  { value: "ZH", label: "Chinese", flag: "🇨🇳" },
] as const;

const getCategoryInfo = (category: string) => {
  const cat = EVENT_CATEGORIES.find(c => c.value === category);
  return cat || { value: "Workshop", label: "Workshop", color: "bg-gray-400", icon: Users };
};

const getLanguageInfo = (code: string) => {
  const lang = EVENT_LANGUAGES.find(l => l.value === code);
  return lang || { value: "EN", label: "English", flag: "🇬🇧" };
};

interface DescriptionSection {
  id: string;
  heading: string;
  content: string;
  isBulletList: boolean;
}

const parseDescriptionToSections = (description: string): DescriptionSection[] => {
  if (!description) return [{ id: '1', heading: '', content: '', isBulletList: false }];
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy format - convert to new format
    return [{ id: '1', heading: '', content: description, isBulletList: false }];
  }
  return [{ id: '1', heading: '', content: '', isBulletList: false }];
};

const sectionsToJson = (sections: DescriptionSection[]): string => {
  const filledSections = sections.filter(s => s.heading.trim() || s.content.trim());
  return filledSections.length > 0 ? JSON.stringify(filledSections) : '';
};

const EventsEditor = () => {
  const { language: currentLanguage } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [descriptionSections, setDescriptionSections] = useState<DescriptionSection[]>([
    { id: '1', heading: '', content: '', isBulletList: false }
  ]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    teaser: "",
    description: "",
    image_url: "",
    date: new Date().toISOString().split('T')[0],
    time_start: "09:00",
    time_end: "17:00",
    location_city: "",
    location_country: "",
    location_venue: "",
    category: "Workshop",
    language_code: "EN",
    is_online: false,
    max_participants: null as number | null,
    registration_deadline: "",
    external_url: "",
    published: true,
  });

  const queryClient = useQueryClient();

  // Fetch all events to determine translation status
  const { data: allEvents } = useQuery({
    queryKey: ["events-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("slug, language_code");
      if (error) throw error;
      return data as { slug: string; language_code: string }[];
    },
  });

  // Helper to get available translations for an event
  const getTranslations = (slug: string): string[] => {
    if (!allEvents) return [];
    return allEvents
      .filter(e => e.slug === slug && e.language_code !== "EN")
      .map(e => e.language_code);
  };

  // Only fetch English (master) events - translations are managed via TranslationEditor
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("language_code", "EN")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("events").insert([{
        ...data,
        max_participants: data.max_participants || null,
        registration_deadline: data.registration_deadline || null,
        external_url: data.external_url || null,
        time_end: data.time_end || null,
        location_venue: data.location_venue || null,
        description: data.description || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create event: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("events")
        .update({
          ...data,
          max_participants: data.max_participants || null,
          registration_deadline: data.registration_deadline || null,
          external_url: data.external_url || null,
          time_end: data.time_end || null,
          location_venue: data.location_venue || null,
          description: data.description || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save event: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete event: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      teaser: "",
      description: "",
      image_url: "",
      date: new Date().toISOString().split('T')[0],
      time_start: "09:00",
      time_end: "17:00",
      location_city: "",
      location_country: "",
      location_venue: "",
      category: "Workshop",
      language_code: "EN",
      is_online: false,
      max_participants: null,
      registration_deadline: "",
      external_url: "",
      published: true,
    });
    setDescriptionSections([{ id: '1', heading: '', content: '', isBulletList: false }]);
    setEditingEvent(null);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    const sections = parseDescriptionToSections(event.description || '');
    setDescriptionSections(sections);
    setFormData({
      title: event.title,
      slug: event.slug,
      teaser: event.teaser,
      description: event.description || "",
      image_url: event.image_url,
      date: event.date,
      time_start: event.time_start,
      time_end: event.time_end || "",
      location_city: event.location_city,
      location_country: event.location_country,
      location_venue: event.location_venue || "",
      category: event.category,
      language_code: event.language_code,
      is_online: event.is_online,
      max_participants: event.max_participants,
      registration_deadline: event.registration_deadline || "",
      external_url: event.external_url || "",
      published: event.published,
    });
    setIsDialogOpen(true);
  };

  const updateSection = (id: string, field: keyof DescriptionSection, value: string | boolean) => {
    setDescriptionSections(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, [field]: value } : s);
      setFormData(f => ({ ...f, description: sectionsToJson(updated) }));
      return updated;
    });
  };

  const addSection = () => {
    const newId = String(Date.now());
    setDescriptionSections(prev => [...prev, { id: newId, heading: '', content: '', isBulletList: false }]);
  };

  const removeSection = (id: string) => {
    setDescriptionSections(prev => {
      const updated = prev.filter(s => s.id !== id);
      const result = updated.length > 0 ? updated : [{ id: '1', heading: '', content: '', isBulletList: false }];
      setFormData(f => ({ ...f, description: sectionsToJson(result) }));
      return result;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const isPastEvent = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  if (isLoading) {
    return <div className="text-white">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Events</h2>
          <p className="text-gray-400 text-sm mt-1">
            {events?.length || 0} events total • {events?.filter(e => e.published).length || 0} published
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className={`grid w-full bg-[#2a2a2a] p-1 h-auto ${editingEvent ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <TabsTrigger value="details" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">
                  Event Details
                </TabsTrigger>
                <TabsTrigger value="description" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">
                  Description
                </TabsTrigger>
                {editingEvent && (
                  <TabsTrigger value="translations" className="text-base font-semibold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=inactive]:bg-[#3a3a3a] text-gray-300 flex items-center gap-2">
                    <span>🌐</span> Translations
                  </TabsTrigger>
                )}
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <TabsContent value="details" className="space-y-6">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            title,
                            slug: prev.slug || generateSlug(title)
                          }));
                        }}
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                        placeholder="Event title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Slug *</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                        placeholder="event-slug"
                        required
                      />
                    </div>
                  </div>

                  {/* Teaser */}
                  <div className="space-y-2">
                    <Label className="text-white">Teaser *</Label>
                    <Textarea
                      value={formData.teaser}
                      onChange={(e) => setFormData(prev => ({ ...prev, teaser: e.target.value }))}
                      className="bg-[#2a2a2a] border-gray-600 text-white min-h-[80px]"
                      placeholder="Short description for event cards"
                      required
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Date *</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Start Time *</Label>
                      <Input
                        type="time"
                        value={formData.time_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, time_start: e.target.value }))}
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">End Time</Label>
                      <Input
                        type="time"
                        value={formData.time_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, time_end: e.target.value }))}
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label className="text-white">Online Event</Label>
                      <Switch
                        checked={formData.is_online}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_online: checked }))}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">{formData.is_online ? "Platform" : "City"} *</Label>
                        <Input
                          value={formData.location_city}
                          onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                          className="bg-[#2a2a2a] border-gray-600 text-white"
                          placeholder={formData.is_online ? "Online Webinar" : "City name"}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">{formData.is_online ? "Access" : "Country"} *</Label>
                        <Input
                          value={formData.location_country}
                          onChange={(e) => setFormData(prev => ({ ...prev, location_country: e.target.value }))}
                          className="bg-[#2a2a2a] border-gray-600 text-white"
                          placeholder={formData.is_online ? "Worldwide" : "Country"}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Venue</Label>
                        <Input
                          value={formData.location_venue}
                          onChange={(e) => setFormData(prev => ({ ...prev, location_venue: e.target.value }))}
                          className="bg-[#2a2a2a] border-gray-600 text-white"
                          placeholder="Venue name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category & Language */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2a2a] border-gray-600">
                          {EVENT_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            return (
                              <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-[#3a3a3a]">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {cat.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Event Language *</Label>
                      <Select
                        value={formData.language_code}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, language_code: value }))}
                      >
                        <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2a2a] border-gray-600">
                          {EVENT_LANGUAGES.map(lang => (
                            <SelectItem key={lang.value} value={lang.value} className="text-white hover:bg-[#3a3a3a]">
                              <div className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                {lang.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="space-y-2">
                    <MediaSelector
                      onFileSelect={() => {}}
                      onMediaSelect={handleImageSelect}
                      label="Event Image *"
                      currentImageUrl={formData.image_url}
                      previewSize="large"
                    />
                  </div>

                  {/* Additional Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Max Participants</Label>
                      <Input
                        type="number"
                        value={formData.max_participants || ""}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          max_participants: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Registration Deadline</Label>
                      <Input
                        type="date"
                        value={formData.registration_deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  {/* External URL */}
                  <div className="space-y-2">
                    <Label className="text-white">External Registration URL</Label>
                    <Input
                      value={formData.external_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, external_url: e.target.value }))}
                      className="bg-[#2a2a2a] border-gray-600 text-white"
                      placeholder="https://external-registration.com"
                    />
                    <p className="text-gray-500 text-xs">If set, users will be redirected to this URL for registration</p>
                  </div>

                  {/* Published Toggle */}
                  <div className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg">
                    <Switch
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                    />
                    <div>
                      <Label className="text-white">Published</Label>
                      <p className="text-gray-500 text-xs">When enabled, event is visible on the website</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="description" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Structured Section Editor */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Content Sections</h3>
                        <p className="text-gray-400 text-sm mb-4">
                          Add sections with headings and content. Toggle bullet list mode for list items.
                        </p>
                      </div>
                      
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {descriptionSections.map((section, index) => (
                          <div key={section.id} className="bg-[#2a2a2a] rounded-lg p-4 space-y-3 border border-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-medium">Section {index + 1}</span>
                              {descriptionSections.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSection(section.id)}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-white text-sm">Heading (H3)</Label>
                              <Input
                                value={section.heading}
                                onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
                                className="bg-[#1a1a1a] border-gray-600 text-white"
                                placeholder="Enter section heading..."
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-white text-sm">Content</Label>
                                <button
                                  type="button"
                                  onClick={() => updateSection(section.id, 'isBulletList', !section.isBulletList)}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                                    section.isBulletList 
                                      ? 'bg-[#f9dc24] text-black' 
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                >
                                  <List className="h-3 w-3" />
                                  Bullet List
                                </button>
                              </div>
                              <Textarea
                                value={section.content}
                                onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                                className="bg-[#1a1a1a] border-gray-600 text-white min-h-[100px]"
                                placeholder={section.isBulletList 
                                  ? "Enter each item on a new line...\nItem 1\nItem 2\nItem 3" 
                                  : "Enter paragraph text..."}
                              />
                              {section.isBulletList && (
                                <p className="text-xs text-gray-500">Each line becomes a bullet point</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSection}
                        className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                      </Button>
                    </div>
                    
                    {/* Live Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#f9dc24]" />
                        <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                      </div>
                      <div className="bg-white rounded-lg p-6 border border-gray-600 min-h-[500px]">
                        {descriptionSections.some(s => s.heading || s.content) ? (
                          <div className="space-y-4">
                            {descriptionSections.map((section) => {
                              if (!section.heading && !section.content) return null;
                              return (
                                <div key={section.id}>
                                  {section.heading && (
                                    <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{section.heading}</h3>
                                  )}
                                  {section.content && (
                                    section.isBulletList ? (
                                      <ul className="my-3 ml-6 list-disc space-y-1">
                                        {section.content.split('\n').filter(line => line.trim()).map((line, i) => (
                                          <li key={i} className="pl-1 text-gray-700">{line.trim()}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="mb-3 leading-relaxed text-gray-700">{section.content}</p>
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">Add content to see the preview...</p>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">This is exactly how the description will appear on the events page.</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Translations Tab */}
                {editingEvent && (
                  <TabsContent value="translations" className="mt-6">
                    <EventsTranslationEditor
                      eventSlug={editingEvent.slug}
                      englishData={{
                        title: formData.title,
                        teaser: formData.teaser,
                        description: formData.description,
                        image_url: formData.image_url,
                        date: formData.date,
                        time_start: formData.time_start,
                        time_end: formData.time_end || null,
                        location_city: formData.location_city,
                        location_country: formData.location_country,
                        location_venue: formData.location_venue || null,
                        category: formData.category,
                        is_online: formData.is_online,
                        max_participants: formData.max_participants,
                        registration_deadline: formData.registration_deadline || null,
                        external_url: formData.external_url || null,
                        published: formData.published,
                      }}
                      onSave={() => {
                        queryClient.invalidateQueries({ queryKey: ["events"] });
                      }}
                    />
                  </TabsContent>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-700">
                  <Button
                    type="submit"
                    className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingEvent ? "Save Changes" : "Create Event"}
                  </Button>
                  {editingEvent && (
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.open(`/${currentLanguage}/training-events/events/${editingEvent.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  )}
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pb-4">
        {EVENT_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const count = events?.filter(e => e.category === cat.value).length || 0;
          return (
            <div
              key={cat.value}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${cat.color}`}
            >
              <IconComponent className="w-3 h-3" />
              {cat.label}
              <span className="ml-1 bg-white/25 px-1.5 py-0.5 rounded-full text-xs font-bold">{count}</span>
            </div>
          );
        })}
        {/* Online special category */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-cyan-600">
          <Globe className="w-3 h-3" />
          Online
          <span className="ml-1 bg-white/25 px-1.5 py-0.5 rounded-full text-xs font-bold">
            {events?.filter(e => e.is_online).length || 0}
          </span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.map((event) => {
          const categoryInfo = getCategoryInfo(event.category);
          const languageInfo = getLanguageInfo(event.language_code);
          const CategoryIcon = categoryInfo.icon;
          const isPast = isPastEvent(event.date);

          return (
            <Card
              key={event.id}
              className={`bg-[#1a1a1a] border-gray-700 overflow-hidden ${isPast ? 'opacity-60' : ''}`}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  <Badge className={`${categoryInfo.color} text-white text-xs`}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {categoryInfo.label}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                  {event.published ? (
                    <Badge className="bg-white/90 text-[#0f407b] text-xs font-medium">
                      Live
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-600 text-white text-xs">
                      Draft
                    </Badge>
                  )}
                  {isPast && (
                    <Badge className="bg-red-600 text-white text-xs">
                      Past
                    </Badge>
                  )}
                  {event.is_online && (
                    <Badge className="bg-cyan-600 text-white text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-white line-clamp-2">{event.title}</h3>
                
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.time_start}{event.time_end ? ` - ${event.time_end}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location_city}, {event.location_country}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2">{event.teaser}</p>

                {/* Slug */}
                <div className="text-sm text-gray-400 font-mono truncate">
                  /events/{event.slug}
                </div>
                
                {/* Translation Status */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm px-2 py-1 rounded bg-gray-700 text-gray-300 font-medium">🇬🇧 EN</span>
                  {getTranslations(event.slug).map(lang => {
                    const flags: Record<string, string> = { DE: "🇩🇪 DE", JA: "🇯🇵 JA", KO: "🇰🇷 KO", ZH: "🇨🇳 ZH" };
                    return (
                      <span key={lang} className="text-sm px-2 py-1 rounded bg-green-900/40 text-green-400 font-medium">
                        {flags[lang] || lang}
                      </span>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-400 hover:bg-green-600/20"
                    onClick={() => window.open(`/en/training-events/events/${event.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-[#3a3a3a]"
                    onClick={() => handleEdit(event)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this event?")) {
                        deleteMutation.mutate(event.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {events?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
          <p className="text-gray-400 mb-4">Create your first event to get started</p>
          <Button
            className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsEditor;
