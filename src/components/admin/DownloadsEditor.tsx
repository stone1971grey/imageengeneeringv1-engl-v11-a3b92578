import { useState, useEffect, useId } from "react";
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
import { Pencil, Trash2, Plus, Eye, FileText, Video, Upload, Globe, Lock, Unlock, CheckSquare, Square, Calendar, BookOpen, Presentation, List, File, FolderOpen, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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

interface Download {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  download_type: "whitepaper" | "conference" | "video";
  category: string | null;
  pages: number | null;
  duration: string | null;
  publish_date: string;
  download_url: string | null;
  image_url: string | null;
  language_code: string;
  published: boolean;
  visibility: "public" | "private";
  position: number;
  created_at: string;
  updated_at: string;
}

interface DescriptionSection {
  id: string;
  heading: string;
  content: string;
  isBulletList: boolean;
}

const DOWNLOAD_TYPES = [
  { value: "whitepaper", label: "White Paper", color: "bg-blue-500", icon: BookOpen },
  { value: "conference", label: "Conference Paper", color: "bg-purple-500", icon: Presentation },
  { value: "video", label: "Video", color: "bg-emerald-500", icon: Video },
] as const;

const DOWNLOAD_CATEGORIES = [
  "Standards & Compliance",
  "Testing Methodology",
  "Image Quality",
  "Product Documentation",
  "Technical Guides",
] as const;

const DOWNLOAD_LANGUAGES = [
  { value: "EN", label: "English", flag: "🇬🇧" },
  { value: "DE", label: "German", flag: "🇩🇪" },
  { value: "JA", label: "Japanese", flag: "🇯🇵" },
  { value: "KO", label: "Korean", flag: "🇰🇷" },
  { value: "ZH", label: "Chinese", flag: "🇨🇳" },
] as const;

const getTypeInfo = (type: string) => {
  const t = DOWNLOAD_TYPES.find(d => d.value === type);
  return t || { value: "whitepaper", label: "White Paper", color: "bg-gray-400", icon: BookOpen };
};

const getLanguageInfo = (code: string) => {
  const lang = DOWNLOAD_LANGUAGES.find(l => l.value === code);
  return lang || { value: "EN", label: "English", flag: "🇬🇧" };
};

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

const DownloadsEditor = () => {
  const { language: currentLanguage } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<Download | null>(null);
  const [selectedDownloads, setSelectedDownloads] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>(() => {
    // Restore filter from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('downloads-filter-type') || 'all';
    }
    return 'all';
  });
  const [descriptionSections, setDescriptionSections] = useState<DescriptionSection[]>([
    { id: '1', heading: '', content: '', isBulletList: false }
  ]);

  // Persist filter type to localStorage
  useEffect(() => {
    localStorage.setItem('downloads-filter-type', filterType);
  }, [filterType]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    teaser: "",
    description: "",
    download_type: "whitepaper" as "whitepaper" | "conference" | "video",
    category: "",
    pages: null as number | null,
    duration: "",
    publish_date: new Date().toISOString().split('T')[0],
    download_url: "",
    image_url: "",
    language_code: "EN",
    published: true,
    visibility: "public" as "public" | "private",
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputId = useId();

  const queryClient = useQueryClient();
  
  // Batch selection handlers
  const toggleDownloadSelection = (downloadId: string) => {
    setSelectedDownloads(prev => {
      const next = new Set(prev);
      if (next.has(downloadId)) {
        next.delete(downloadId);
      } else {
        next.add(downloadId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!downloads) return;
    if (selectedDownloads.size === filteredDownloads.length) {
      setSelectedDownloads(new Set());
    } else {
      setSelectedDownloads(new Set(filteredDownloads.map(d => d.id)));
    }
  };

  const handleBatchVisibility = async (visibility: 'public' | 'private') => {
    if (selectedDownloads.size === 0) return;
    
    try {
      const { error } = await supabase
        .from("downloads")
        .update({ visibility })
        .in("id", Array.from(selectedDownloads));
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      toast.success(`${selectedDownloads.size} download(s) set to ${visibility}`);
      setSelectedDownloads(new Set());
    } catch (error: any) {
      toast.error("Failed to update visibility: " + error.message);
    }
  };

  // Only fetch English (master) downloads
  const { data: downloads, isLoading } = useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .eq("language_code", "EN")
        .order("position", { ascending: true })
        .order("publish_date", { ascending: false });
      if (error) throw error;
      return data as Download[];
    },
  });

  const filteredDownloads = downloads?.filter(d => 
    filterType === "all" || d.download_type === filterType
  ) || [];

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("downloads").insert({
        slug: data.slug,
        title: data.title,
        teaser: data.teaser,
        description: data.description || null,
        download_type: data.download_type,
        category: data.category || null,
        pages: data.pages,
        duration: data.duration || null,
        publish_date: data.publish_date,
        download_url: data.download_url || null,
        image_url: data.image_url || null,
        language_code: data.language_code,
        published: data.published,
        visibility: data.visibility,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      toast.success("Download created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to create download: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from("downloads")
        .update({
          slug: data.slug,
          title: data.title,
          teaser: data.teaser,
          description: data.description || null,
          download_type: data.download_type,
          category: data.category || null,
          pages: data.pages,
          duration: data.duration || null,
          publish_date: data.publish_date,
          download_url: data.download_url || null,
          image_url: data.image_url || null,
          language_code: data.language_code,
          published: data.published,
          visibility: data.visibility,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      toast.success("Download updated successfully");
      setIsDialogOpen(false);
      setEditingDownload(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error("Failed to update download: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("downloads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      toast.success("Download deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete download: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      teaser: "",
      description: "",
      download_type: "whitepaper",
      category: "",
      pages: null,
      duration: "",
      publish_date: new Date().toISOString().split('T')[0],
      download_url: "",
      image_url: "",
      language_code: "EN",
      published: true,
      visibility: "public",
    });
    setDescriptionSections([{ id: '1', heading: '', content: '', isBulletList: false }]);
  };

  const handleEdit = (download: Download) => {
    setEditingDownload(download);
    const sections = parseDescriptionToSections(download.description || '');
    setDescriptionSections(sections);
    setFormData({
      title: download.title,
      slug: download.slug,
      teaser: download.teaser,
      description: download.description || "",
      download_type: download.download_type,
      category: download.category || "",
      pages: download.pages,
      duration: download.duration || "",
      publish_date: download.publish_date,
      download_url: download.download_url || "",
      image_url: download.image_url || "",
      language_code: download.language_code,
      published: download.published,
      visibility: download.visibility,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug || !formData.teaser) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Ensure description is computed from current descriptionSections state
    const finalFormData = {
      ...formData,
      description: sectionsToJson(descriptionSections)
    };

    if (editingDownload) {
      updateMutation.mutate({ ...finalFormData, id: editingDownload.id });
    } else {
      createMutation.mutate(finalFormData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageSelect = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleFileSelect = (url: string) => {
    setFormData(prev => ({ ...prev, download_url: url }));
  };

  // Direct file upload handler with automatic folder creation
  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|mp4|webm|mov)$/i)) {
      toast.error("Please upload a PDF or video file");
      return;
    }

    // Need slug for folder path
    if (!formData.slug) {
      toast.error("Please enter a title first to generate the folder path");
      return;
    }

    setIsUploading(true);

    try {
      // Create folder path: downloads/{type}/{slug}/filename
      const typeFolder = formData.download_type === 'whitepaper' ? 'whitepapers' 
        : formData.download_type === 'conference' ? 'conference-papers'
        : 'videos';
      const folderPath = `downloads/${typeFolder}/${formData.slug}`;
      const filePath = `${folderPath}/${file.name}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, download_url: urlData.publicUrl }));
      toast.success(`File uploaded to ${folderPath}/`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Section editor functions
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

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading downloads...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-[#2a2a2a] border-gray-600 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DOWNLOAD_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedDownloads.size > 0 && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleBatchVisibility('public')}
                className="border-green-600 text-green-400 hover:bg-green-600/20"
              >
                <Unlock className="h-4 w-4 mr-1" />
                Set Public ({selectedDownloads.size})
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleBatchVisibility('private')}
                className="border-red-600 text-red-400 hover:bg-red-600/20"
              >
                <Lock className="h-4 w-4 mr-1" />
                Set Private ({selectedDownloads.size})
              </Button>
            </div>
          )}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingDownload(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Add Download
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingDownload ? "Edit Download" : "Create New Download"}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2a] p-1 h-auto">
                <TabsTrigger value="basic" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="content" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">
                  Content
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">
                  Media & Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-white">Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        title: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value)
                      }));
                    }}
                    placeholder="Enter download title"
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label className="text-white">Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>

                {/* Type & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Type *</Label>
                    <Select
                      value={formData.download_type}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        download_type: value as "whitepaper" | "conference" | "video",
                        pages: value === "video" ? null : prev.pages,
                        duration: value !== "video" ? "" : prev.duration
                      }))}
                    >
                      <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOWNLOAD_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOWNLOAD_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pages/Duration & Publish Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.download_type === "video" ? (
                    <div className="space-y-2">
                      <Label className="text-white">Duration</Label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 12:34"
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-white">Pages</Label>
                      <Input
                        type="number"
                        value={formData.pages ?? ""}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          pages: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        placeholder="Number of pages"
                        className="bg-[#2a2a2a] border-gray-600 text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-white">Publish Date</Label>
                    <Input
                      type="date"
                      value={formData.publish_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value }))}
                      className="bg-[#2a2a2a] border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Visibility</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as "public" | "private" }))}
                    >
                      <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Public
                          </span>
                        </SelectItem>
                        <SelectItem value="private">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            Private
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Teaser */}
                <div className="space-y-2">
                  <Label className="text-white">Teaser *</Label>
                  <Textarea
                    value={formData.teaser}
                    onChange={(e) => setFormData(prev => ({ ...prev, teaser: e.target.value }))}
                    placeholder="Short description for the card"
                    className="bg-[#2a2a2a] border-gray-600 text-white min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6 mt-4">

                {/* Structured Description Editor with Preview */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Structured Section Editor */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Full Description</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Add sections with headings and content. Toggle bullet list mode for list items.
                      </p>
                    </div>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                    <div className="bg-white rounded-lg p-6 border border-gray-600 min-h-[400px] overflow-y-auto">
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
                                    <div className="my-3 ml-4 space-y-1.5">
                                      {section.content.split('\n').filter(line => line.trim()).map((line, i) => (
                                        <div key={i} className="flex items-start gap-2 text-gray-700">
                                          <span className="text-[#f9dc24] mt-0.5">•</span>
                                          <span>{line.trim()}</span>
                                        </div>
                                      ))}
                                    </div>
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
                    <p className="text-gray-500 text-xs">This is exactly how the description will appear on the download page.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                {/* Download File Upload */}
                <div className="space-y-3 p-4 bg-[#2a2a2a] rounded-lg border border-gray-600">
                  <Label className="text-white flex items-center gap-2">
                    <File className="h-4 w-4 text-[#f9dc24]" />
                    {formData.download_type === 'whitepaper' ? 'PDF File' : 
                     formData.download_type === 'conference' ? 'Conference Paper (PDF)' : 
                     'Video File'}
                  </Label>
                  
                  {/* Upload Buttons - 50/50 split */}
                  <div className="flex gap-2">
                    {/* Direct Upload from Computer */}
                    <input
                      type="file"
                      accept={formData.download_type === 'video' ? '.mp4,.webm,.mov' : '.pdf'}
                      onChange={handleDirectFileUpload}
                      className="hidden"
                      id={fileInputId}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      className="flex-1 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
                      onClick={() => document.getElementById(fileInputId)?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload from Computer
                        </>
                      )}
                    </Button>
                    
                    {/* Select from Media */}
                    <div className="flex-1">
                      <MediaSelector
                        onFileSelect={() => {}}
                        onMediaSelect={handleFileSelect}
                        buttonOnly
                        buttonLabel="Select from Media"
                        acceptedFileTypes={formData.download_type === 'video' ? '.mp4,.webm,.mov' : '.pdf'}
                        fullWidth
                      />
                    </div>
                  </div>
                  
                  {/* Info about folder structure */}
                  <p className="text-xs text-gray-500">
                    Files will be uploaded to: <code className="bg-[#1a1a1a] px-1 rounded">downloads/{formData.download_type === 'whitepaper' ? 'whitepapers' : formData.download_type === 'conference' ? 'conference-papers' : 'videos'}/{formData.slug || '[slug]'}/</code>
                  </p>
                  
                  {/* Current file indicator */}
                  {formData.download_url && (
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 px-3 py-2 rounded">
                      <FileText className="h-4 w-4" />
                      <span className="truncate flex-1">{formData.download_url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, download_url: '' }))}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label className="text-white">Cover Image</Label>
                  <MediaSelector
                    onFileSelect={() => {}}
                    onMediaSelect={handleImageSelect}
                    currentImageUrl={formData.image_url}
                    previewSize="large"
                  />
                </div>

                {/* Published */}
                <div className="flex items-center gap-4 p-4 bg-[#2a2a2a] rounded-lg">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <div>
                    <Label className="text-white">Published</Label>
                    <p className="text-gray-500 text-xs">When enabled, download is visible on the website</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingDownload(null);
                  resetForm();
                }}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Downloads List */}
      <div className="space-y-3">
        {/* Select All */}
        {filteredDownloads.length > 0 && (
          <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
            <Checkbox
              checked={selectedDownloads.size === filteredDownloads.length && filteredDownloads.length > 0}
              onCheckedChange={toggleSelectAll}
              className="border-gray-500"
            />
            <span className="text-sm text-gray-400">Select All ({filteredDownloads.length})</span>
          </div>
        )}

        {filteredDownloads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No downloads found. Create your first download!
          </div>
        ) : (
          filteredDownloads.map((download) => {
            const typeInfo = getTypeInfo(download.download_type);
            const TypeIcon = typeInfo.icon;
            
            return (
              <Card key={download.id} className="bg-[#2a2a2a] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedDownloads.has(download.id)}
                        onCheckedChange={() => toggleDownloadSelection(download.id)}
                        className="border-gray-500"
                      />
                    </div>

                    {/* Image */}
                    {download.image_url && (
                      <img
                        src={download.image_url}
                        alt={download.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-white truncate">{download.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2">{download.teaser}</p>
                        </div>
                        <div className="flex gap-1">
                          {/* Preview - Green */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/en/info-hub/downloads/${download.slug}`, '_blank')}
                            className="h-8 w-8 p-0 border-green-600 text-green-400 hover:bg-green-600/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Edit - Yellow */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(download)}
                            className="h-8 w-8 p-0 border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* Delete - Red */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this download?")) {
                                deleteMutation.mutate(download.id);
                              }
                            }}
                            className="h-8 w-8 p-0 border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={`${typeInfo.color} text-white`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        {download.category && (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {download.category}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={download.visibility === 'public' 
                            ? 'border-green-600 text-green-400' 
                            : 'border-red-600 text-red-400'
                          }
                        >
                          {download.visibility === 'public' ? (
                            <><Unlock className="h-3 w-3 mr-1" /> Public</>
                          ) : (
                            <><Lock className="h-3 w-3 mr-1" /> Private</>
                          )}
                        </Badge>
                        {!download.published && (
                          <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                            Draft
                          </Badge>
                        )}
                        {download.download_url && (
                          <Badge variant="outline" className="border-blue-600 text-blue-400">
                            <FileText className="h-3 w-3 mr-1" />
                            File attached
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DownloadsEditor;
