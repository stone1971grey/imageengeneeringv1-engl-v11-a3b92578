import { useState } from "react";
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
import { Pencil, Trash2, Plus, Eye, Rocket, Cpu, FileCheck, Lightbulb, Handshake, Calendar, FlaskConical, Newspaper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "./RichTextEditor";

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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content Editor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="teaser">Teaser</Label>
                    <Textarea
                      id="teaser"
                      value={formData.teaser}
                      onChange={(e) =>
                        setFormData({ ...formData, teaser: e.target.value })
                      }
                      required
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Featured Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      required
                    />
                  </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {NEWS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
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
                <Label htmlFor="published">Published</Label>
              </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-4 mt-4">
                  <div>
                    <Label>Article Content (Rich Text)</Label>
                    <RichTextEditor
                      content={formData.content}
                      onChange={(content) =>
                        setFormData({ ...formData, content })
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
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
                    className="flex-1 text-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => window.open(`/news/${article.slug}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="flex-1 text-sm font-medium hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                    onClick={() => handleEdit(article)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200"
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
