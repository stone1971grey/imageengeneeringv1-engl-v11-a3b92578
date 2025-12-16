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
import { Pencil, Trash2, Plus, Eye, FileText, Video, Upload, Globe, Lock, Unlock, CheckSquare, Square, Calendar, BookOpen, Presentation } from "lucide-react";
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

const DownloadsEditor = () => {
  const { language: currentLanguage } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<Download | null>(null);
  const [selectedDownloads, setSelectedDownloads] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");
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
  };

  const handleEdit = (download: Download) => {
    setEditingDownload(download);
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

    if (editingDownload) {
      updateMutation.mutate({ ...formData, id: editingDownload.id });
    } else {
      createMutation.mutate(formData);
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingDownload ? "Edit Download" : "Create New Download"}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2a]">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
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

              <TabsContent value="content" className="space-y-4 mt-4">
                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-white">Full Description (HTML)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="<h3>Overview</h3><p>Content here...</p>"
                    className="bg-[#2a2a2a] border-gray-600 text-white min-h-[300px] font-mono text-sm"
                  />
                </div>

                {/* Download URL */}
                <div className="space-y-2">
                  <Label className="text-white">Download URL</Label>
                  <Input
                    value={formData.download_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, download_url: e.target.value }))}
                    placeholder="/downloads/file.pdf or https://..."
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                {/* Image */}
                <div className="space-y-2">
                  <Label className="text-white">Cover Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="Image URL"
                      className="bg-[#2a2a2a] border-gray-600 text-white flex-1"
                    />
                    <MediaSelector
                      onFileSelect={() => {}}
                      onMediaSelect={handleImageSelect}
                      buttonOnly
                      buttonLabel="Select Image"
                    />
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="h-32 object-cover rounded border border-gray-700"
                      />
                    </div>
                  )}
                </div>

                {/* Published */}
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label className="text-white">Published</Label>
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
                {editingDownload ? "Update Download" : "Create Download"}
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
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className={`${typeInfo.color} text-white`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        {download.category && (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {download.category}
                          </Badge>
                        )}
                        <Badge variant={download.visibility === 'public' ? 'default' : 'destructive'} 
                               className={download.visibility === 'public' ? 'bg-green-600' : 'bg-red-600'}>
                          {download.visibility === 'public' ? 'Public' : 'Private'}
                        </Badge>
                        {!download.published && (
                          <Badge variant="secondary" className="bg-orange-600">Draft</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-white truncate">{download.title}</h3>
                      <p className="text-sm text-gray-400 truncate">{download.teaser}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        {download.pages && <span>{download.pages} pages</span>}
                        {download.duration && <span>{download.duration}</span>}
                        <span>{new Date(download.publish_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(download)}
                        className="border-gray-600 text-gray-300 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this download?")) {
                            deleteMutation.mutate(download.id);
                          }
                        }}
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
