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
import { Pencil, Trash2, Plus, Eye, EyeOff, Rocket, Cpu, FileCheck, Lightbulb, Handshake, Calendar, FlaskConical, Newspaper, Upload, ImageIcon, Link2, Building2, CheckSquare, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsBlockEditor, { ContentBlock, blocksToHtml, htmlToBlocks } from "./NewsBlockEditor";
import { MediaSelector } from "./MediaSelector";
import NewsTranslationEditor from "./NewsTranslationEditor";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  teaser: string;
  content: string;
  image_url: string;
  date: string;
  author: string | null;
  category: string | null;
  published: boolean;
  visibility: 'public' | 'private';
  language: string;
  created_at: string;
  updated_at: string;
}

const NEWS_CATEGORIES = [
  { value: "Company", label: "Company", color: "bg-slate-600", icon: Building2 },
  { value: "Product Launch", label: "Product Launch", color: "bg-emerald-500", icon: Rocket },
  { value: "Technology", label: "Technology", color: "bg-blue-500", icon: Cpu },
  { value: "Standards", label: "Standards", color: "bg-purple-500", icon: FileCheck },
  { value: "Innovation", label: "Innovation", color: "bg-amber-500", icon: Lightbulb },
  { value: "Partnership", label: "Partnership", color: "bg-pink-500", icon: Handshake },
  { value: "Event", label: "Event", color: "bg-cyan-500", icon: Calendar },
  { value: "Research", label: "Research", color: "bg-indigo-500", icon: FlaskConical },
] as const;

const getCategoryInfo = (category: string | null) => {
  const cat = NEWS_CATEGORIES.find(c => c.value === category);
  return cat || { value: "Uncategorized", label: "Uncategorized", color: "bg-gray-400", icon: Newspaper };
};

const NewsEditor = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: "initial", type: "paragraph", content: "" }
  ]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    teaser: "",
    content: "",
    image_url: "",
    date: new Date().toISOString().split('T')[0],
    author: "",
    category: "",
    published: true,
    visibility: "public" as 'public' | 'private',
  });

  // Sync blocks to formData.content as JSON
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      content: JSON.stringify(contentBlocks)
    }));
  }, [contentBlocks]);

  const queryClient = useQueryClient();

  // Fetch all articles to determine translation status
  const { data: allArticles } = useQuery({
    queryKey: ["news-articles-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("slug, language");
      if (error) throw error;
      return data as { slug: string; language: string }[];
    },
  });

  // Helper to get available translations for an article
  const getTranslations = (slug: string): string[] => {
    if (!allArticles) return [];
    return allArticles
      .filter(a => a.slug === slug && a.language !== "en")
      .map(a => a.language);
  };

  const { data: articles, isLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      // Only fetch English articles for the main list (other languages are translations)
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("language", "en")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Always create new articles as English (translations are added via Translations tab)
      const { error } = await supabase.from("news_articles").insert([{ ...data, language: "en" }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-articles"] });
      toast.success("News article created successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create article: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("news_articles")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-articles"] });
      toast.success("News article saved successfully");
      // Don't close dialog - keep it open for further editing
    },
    onError: (error) => {
      toast.error("Failed to save article: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-articles"] });
      toast.success("News article deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete article: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      teaser: "",
      content: "",
      image_url: "",
      date: new Date().toISOString().split('T')[0],
      author: "",
      category: "",
      published: true,
      visibility: "public",
    });
    setContentBlocks([{ id: "initial", type: "paragraph", content: "" }]);
    setEditingArticle(null);
  };

  // Toggle article selection
  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Select/Deselect all articles
  const toggleSelectAll = () => {
    if (selectedArticles.size === articles?.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles?.map(a => a.id) || []));
    }
  };

  // Batch visibility update
  const handleBatchVisibility = async (newVisibility: 'public' | 'private') => {
    if (selectedArticles.size === 0) {
      toast.error("No articles selected");
      return;
    }

    setBatchProcessing(true);
    try {
      const articleIds = Array.from(selectedArticles);
      
      const { error } = await supabase
        .from("news_articles")
        .update({ visibility: newVisibility })
        .in("id", articleIds);

      if (error) throw error;

      toast.success(`${articleIds.length} article(s) set to ${newVisibility}`);
      setSelectedArticles(new Set());
      queryClient.invalidateQueries({ queryKey: ["news-articles"] });
    } catch (error: any) {
      console.error("Batch visibility error:", error);
      toast.error(`Batch visibility update failed: ${error.message}`);
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      teaser: article.teaser,
      content: article.content,
      image_url: article.image_url,
      date: article.date,
      author: article.author || "",
      category: article.category || "",
      published: article.published,
      visibility: article.visibility || "public",
    });
    // Parse content blocks from JSON or convert from HTML
    setContentBlocks(htmlToBlocks(article.content));
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Newspaper className="w-7 h-7" />
            News Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {articles?.length || 0} articles • {articles?.filter(a => a.published).length || 0} published
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Top Action Buttons */}
              {editingArticle && (
                <div className="flex gap-3 pb-4 border-b border-gray-700">
                  <Button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(`/en/news/${formData.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#f9dc24] text-black"
                  >
                    Save
                  </Button>
                </div>
              )}
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className={`grid w-full bg-[#2a2a2a] p-1 h-auto ${editingArticle ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <TabsTrigger value="basic" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">Basic Info</TabsTrigger>
                  <TabsTrigger value="content" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">Content Editor</TabsTrigger>
                  {editingArticle && (
                    <TabsTrigger value="translations" className="text-base font-semibold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=inactive]:bg-[#3a3a3a] text-gray-300 flex items-center gap-2">
                      <span>🌐</span> Translations
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-300">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" className="text-gray-300">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                      className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teaser" className="text-gray-300">Teaser</Label>
                    <Textarea
                      id="teaser"
                      value={formData.teaser}
                      onChange={(e) =>
                        setFormData({ ...formData, teaser: e.target.value })
                      }
                      required
                      rows={3}
                      className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  {/* Featured Image Upload Section */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-300">Featured Image (Titelbild)</Label>
                    
                    {formData.image_url ? (
                      <div className="space-y-3">
                        <div className="relative group rounded-lg overflow-hidden border border-gray-600">
                          <img
                            src={formData.image_url}
                            alt="Featured image preview"
                            className="w-full max-h-[300px] object-contain bg-[#2a2a2a]"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setFormData({ ...formData, image_url: "" })}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{formData.image_url}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Media Selector - Full Width */}
                        <MediaSelector
                          currentImageUrl=""
                          onFileSelect={async (file) => {
                            try {
                              const fileExt = file.name.split(".").pop();
                              const fileName = `featured-${Date.now()}.${fileExt}`;
                              const filePath = `news/${fileName}`;
                              
                              const { error: uploadError } = await supabase.storage
                                .from("page-images")
                                .upload(filePath, file);
                              
                              if (uploadError) throw uploadError;
                              
                              const { data: { publicUrl } } = supabase.storage
                                .from("page-images")
                                .getPublicUrl(filePath);
                              
                              setFormData({ ...formData, image_url: publicUrl });
                              toast.success("Image uploaded successfully");
                            } catch (error) {
                              console.error("Upload error:", error);
                              toast.error("Failed to upload image");
                            }
                          }}
                          onMediaSelect={(url) => setFormData({ ...formData, image_url: url })}
                          label="Select from Media"
                        />
                      </div>
                    )}
                  </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-gray-300">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                    className="bg-[#2a2a2a] border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="author" className="text-gray-300">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="bg-[#2a2a2a] border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-[#2a2a2a] border-gray-600 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a2a] border-gray-600 text-white z-50">
                    {NEWS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-[#3a3a3a]">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
                <Label htmlFor="published" className="text-gray-300">Published</Label>
              </div>
              
              {/* Visibility Setting */}
              <div className="p-4 bg-[#2a2a2a] rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {formData.visibility === 'private' ? (
                      <EyeOff className="h-4 w-4 text-red-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">Visibility</div>
                      <div className="text-xs text-gray-400">
                        {formData.visibility === 'private' 
                          ? 'Private - Not searchable' 
                          : 'Public - Can be found via search'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.visibility === 'public' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, visibility: 'public' })}
                      className={formData.visibility === 'public' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-white'
                      }
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Public
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={formData.visibility === 'private' ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, visibility: 'private' })}
                      className={formData.visibility === 'private' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gray-700 border-gray-600 text-gray-400 hover:text-white'
                      }
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Private
                    </Button>
                  </div>
                </div>
              </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-base font-semibold text-gray-300 mb-3 block">
                      Article Content (Block Editor)
                    </Label>
                    <p className="text-sm text-gray-400 mb-4">
                      Add and arrange content blocks: text paragraphs, headings, images, quotes, and lists.
                    </p>
                    <NewsBlockEditor
                      blocks={contentBlocks}
                      onChange={setContentBlocks}
                    />
                  </div>
                </TabsContent>
                
                {/* Translations Tab - Only for existing articles */}
                {editingArticle && (
                  <TabsContent value="translations" className="mt-4">
                    <NewsTranslationEditor
                      articleSlug={editingArticle.slug}
                      englishData={{
                        title: formData.title,
                        teaser: formData.teaser,
                        content: formData.content,
                        image_url: formData.image_url,
                        date: formData.date,
                        author: formData.author || null,
                        category: formData.category || null,
                        published: formData.published,
                      }}
                      onSave={() => {
                        // Refresh article list after translation save
                        queryClient.invalidateQueries({ queryKey: ["news-articles"] });
                      }}
                    />
                  </TabsContent>
                )}
              </Tabs>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
                <Button type="submit" className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 font-semibold py-3">
                  {editingArticle ? "Save Changes" : "Create Article"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-[#2a2a2a]"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pb-4">
        {NEWS_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const count = articles?.filter(a => a.category === cat.value).length || 0;
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
      </div>

      {/* Batch Operations Toolbar */}
      {articles && articles.length > 0 && (
        <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleSelectAll}
              className="bg-blue-900/30 border-blue-700 text-blue-300 hover:bg-blue-900/50"
            >
              {selectedArticles.size === articles.length ? (
                <CheckSquare className="h-4 w-4 mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              {selectedArticles.size === articles.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedArticles.size > 0 && (
              <span className="text-sm text-gray-400">
                {selectedArticles.size} article(s) selected
              </span>
            )}
          </div>
          {selectedArticles.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleBatchVisibility('public')}
                disabled={batchProcessing}
                className="bg-green-900/50 hover:bg-green-900 border-green-800 text-green-300"
              >
                <Eye className="h-4 w-4 mr-1" />
                Public
              </Button>
              <Button
                size="sm"
                onClick={() => handleBatchVisibility('private')}
                disabled={batchProcessing}
                className="bg-orange-900/50 hover:bg-orange-900 border-orange-800 text-orange-300"
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Private
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {articles?.map((article) => {
          const categoryInfo = getCategoryInfo(article.category);
          const CategoryIcon = categoryInfo.icon;
          const isSelected = selectedArticles.has(article.id);
          
          return (
            <Card 
              key={article.id} 
              className={`bg-[#1a1a1a] border-gray-700 overflow-hidden ${isSelected ? 'ring-2 ring-[#f9dc24]' : ''}`}
            >
              {/* Image Section */}
              <div className="aspect-video relative overflow-hidden">
                {/* Selection Checkbox */}
                <div 
                  className="absolute top-2 left-2 z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArticleSelection(article.id);
                  }}
                >
                  {isSelected ? (
                    <CheckSquare className="h-6 w-6 text-[#f9dc24] bg-gray-900/90 backdrop-blur-sm rounded border border-[#f9dc24]/30 p-0.5" />
                  ) : (
                    <Square className="h-6 w-6 text-gray-400 bg-gray-900/70 backdrop-blur-sm rounded border border-gray-600/30 p-0.5 hover:text-[#f9dc24] hover:border-[#f9dc24]/30" />
                  )}
                </div>

                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <Newspaper className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                
                {/* Category Badge - Left (shifted right to make room for checkbox) */}
                <div className="absolute top-2 left-10 flex flex-wrap gap-1">
                  <Badge className={`${categoryInfo.color} text-white text-xs`}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {categoryInfo.label}
                  </Badge>
                </div>
                
                {/* Status & Visibility Badges - Right */}
                <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                  {article.published ? (
                    <Badge className="bg-white/90 text-[#0f407b] text-xs font-medium">
                      Live
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-600 text-white text-xs">
                      Draft
                    </Badge>
                  )}
                </div>
                
                {/* Visibility Badge - Bottom Left */}
                <div 
                  className={`absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md border shadow-lg backdrop-blur-sm ${
                    article.visibility === 'private' 
                      ? 'bg-red-900/90 border-red-500/50' 
                      : 'bg-green-900/90 border-green-500/50'
                  }`}
                  title={article.visibility === 'private' ? 'Private - Not searchable' : 'Public - Searchable'}
                >
                  {article.visibility === 'private' ? (
                    <EyeOff className="h-3 w-3 text-red-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-green-400" />
                  )}
                  <span className={`text-[10px] font-semibold ${article.visibility === 'private' ? 'text-red-400' : 'text-green-400'}`}>
                    {article.visibility === 'private' ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-white line-clamp-2">{article.title}</h3>
                
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                    {article.author && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span>{article.author}</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2">{article.teaser}</p>

                {/* Slug */}
                <div className="text-sm text-gray-400 font-mono truncate">
                  /news/{article.slug}
                </div>
                
                {/* Translation Status */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm px-2 py-1 rounded bg-gray-700 text-gray-300 font-medium">🇬🇧 EN</span>
                  {getTranslations(article.slug).map(lang => {
                    const flags: Record<string, string> = { de: "🇩🇪 DE", ja: "🇯🇵 JA", ko: "🇰🇷 KO", zh: "🇨🇳 ZH" };
                    return (
                      <span key={lang} className="text-sm px-2 py-1 rounded bg-green-900/40 text-green-400 font-medium">
                        {flags[lang]}
                      </span>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-400 hover:bg-green-600/20"
                    onClick={() => window.open(`/en/news/${article.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-[#3a3a3a]"
                    onClick={() => handleEdit(article)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this article?")) {
                        deleteMutation.mutate(article.id);
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
      {articles?.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No articles yet</h3>
          <p className="text-gray-400 mb-4">Create your first news article to get started</p>
          <Button
            className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewsEditor;
