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
import { Pencil, Trash2, Plus, Eye, Rocket, Cpu, FileCheck, Lightbulb, Handshake, Calendar, FlaskConical, Newspaper, Upload, ImageIcon, Link2 } from "lucide-react";
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
  created_at: string;
  updated_at: string;
}

const NEWS_CATEGORIES = [
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
  });

  // Sync blocks to formData.content as JSON
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      content: JSON.stringify(contentBlocks)
    }));
  }, [contentBlocks]);

  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("news_articles").insert([data]);
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
      toast.success("News article updated successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update article: " + error.message);
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
    });
    setContentBlocks([{ id: "initial", type: "paragraph", content: "" }]);
    setEditingArticle(null);
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
      <div className="flex justify-between items-center bg-gradient-to-r from-[#0f407b] to-[#1a5ba8] rounded-xl p-6 text-white">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Newspaper className="w-7 h-7" />
            News Management
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {articles?.length || 0} articles • {articles?.filter(a => a.published).length || 0} published
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-white text-[#0f407b] hover:bg-blue-50 font-semibold shadow-md">
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
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] p-1 h-auto">
                  <TabsTrigger value="basic" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">Basic Info</TabsTrigger>
                  <TabsTrigger value="content" className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black data-[state=inactive]:bg-[#3a3a3a] text-gray-300">Content Editor</TabsTrigger>
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
              </Tabs>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-[#2a2a2a]"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                  {editingArticle ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-3 pb-5 border-b">
        {NEWS_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const count = articles?.filter(a => a.category === cat.value).length || 0;
          return (
            <div
              key={cat.value}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white ${cat.color} opacity-85 hover:opacity-100 transition-opacity cursor-default shadow-sm`}
            >
              <IconComponent className="w-4 h-4" />
              {cat.label}
              <span className="ml-1 bg-white/25 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {articles?.map((article) => {
          const categoryInfo = getCategoryInfo(article.category);
          const CategoryIcon = categoryInfo.icon;
          
          return (
            <Card 
              key={article.id} 
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50"
            >
              {/* Image Section */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Newspaper className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Category Badge Overlay */}
                <div className={`absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-white ${categoryInfo.color} shadow-md`}>
                  <CategoryIcon className="w-4 h-4" />
                  {categoryInfo.label}
                </div>
                
                {/* Status Badge */}
                {!article.published && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-semibold bg-yellow-500 text-white shadow-md">
                    Draft
                  </div>
                )}
                {article.published && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-500 text-white shadow-md">
                    Live
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {article.author && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>{article.author}</span>
                    </>
                  )}
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-3 group-hover:text-[#0f407b] transition-colors">
                  {article.title}
                </h3>
                
                {/* Teaser */}
                <p className="text-base text-muted-foreground line-clamp-2 mb-4">
                  {article.teaser}
                </p>
                
                {/* Slug */}
                <div className="text-sm text-gray-400 font-mono mb-4 truncate">
                  /news/{article.slug}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="default"
                    className="flex-1 text-sm font-medium bg-green-500 text-white border-green-500"
                    onClick={() => window.open(`/en/news/${article.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="flex-1 text-sm font-medium bg-[#f9dc24] text-black border-[#f9dc24]"
                    onClick={() => handleEdit(article)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="text-sm font-medium bg-red-500 text-white border-red-500"
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
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No articles yet</h3>
          <p className="text-sm text-gray-400 mb-4">Create your first news article to get started</p>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewsEditor;
