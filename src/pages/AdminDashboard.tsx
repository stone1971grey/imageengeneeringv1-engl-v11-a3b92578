import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { LogOut, Save, Plus, Trash2, MoveUp, MoveDown, FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ContentItem {
  id: string;
  section_key: string;
  content_type: string;
  content_value: string;
}

interface PageSegment {
  id: string;
  type: 'hero' | 'tiles' | 'banner' | 'image-text';
  position: number;
  data: any;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<PageSegment[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      loadSegments();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (error || !data) {
      toast.error("You don't have admin access");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const loadSegments = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "photography")
      .eq("section_key", "page_segments");

    if (!error && data && data.length > 0) {
      const loadedSegments = JSON.parse(data[0].content_value);
      setSegments(loadedSegments);
    }
  };

  const addSegment = (type: 'hero' | 'tiles' | 'banner' | 'image-text') => {
    const newSegment: PageSegment = {
      id: `segment-${Date.now()}`,
      type,
      position: segments.length,
      data: getDefaultData(type)
    };
    
    setSegments([...segments, newSegment]);
    setShowTemplateSelector(false);
    toast.success(`${getTemplateName(type)} added`);
  };

  const getDefaultData = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          title: "New Hero Title",
          subtitle: "",
          ctaText: "Learn More",
          ctaLink: "#",
          ctaStyle: "standard",
          imageUrl: "",
          imagePosition: "right",
          layout: "2-5",
          topPadding: "medium"
        };
      case 'tiles':
        return {
          title: "New Tiles Section",
          subtitle: "",
          items: []
        };
      case 'banner':
        return {
          title: "New Banner Title",
          subtext: "",
          images: [],
          buttonText: "",
          buttonLink: "",
          buttonStyle: "standard"
        };
      case 'image-text':
        return {
          title: "New Image & Text Section",
          subtext: "",
          layout: "2-col",
          items: []
        };
      default:
        return {};
    }
  };

  const getTemplateName = (type: string) => {
    switch (type) {
      case 'hero': return 'Hero Template';
      case 'tiles': return 'Tiles Template';
      case 'banner': return 'Banner Template';
      case 'image-text': return 'Image & Text Template';
      default: return 'Template';
    }
  };

  const deleteSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id).map((s, idx) => ({
      ...s,
      position: idx
    })));
    toast.success("Segment deleted");
  };

  const moveSegment = (id: string, direction: 'up' | 'down') => {
    const index = segments.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === segments.length - 1)
    ) return;

    const newSegments = [...segments];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSegments[index], newSegments[targetIndex]] = [newSegments[targetIndex], newSegments[index]];
    
    newSegments.forEach((seg, idx) => {
      seg.position = idx;
    });
    
    setSegments(newSegments);
  };

  const updateSegmentData = (id: string, newData: any) => {
    setSegments(segments.map(s => 
      s.id === id ? { ...s, data: newData } : s
    ));
  };

  const saveAllSegments = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: "photography",
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(segments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: "page_slug,section_key"
        });

      if (error) throw error;
      
      toast.success("All segments saved successfully!");
    } catch (error) {
      console.error("Error saving segments:", error);
      toast.error("Failed to save segments");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, segmentId: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${segmentId}-${field}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      const segment = segments.find(s => s.id === segmentId);
      if (segment) {
        updateSegmentData(segmentId, {
          ...segment.data,
          [field]: publicUrl
        });
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage page content and segments</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Photography Page - Segments</CardTitle>
            <CardDescription>Build your page by adding and arranging content segments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Segment Button */}
            <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Segment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Select Template Type</DialogTitle>
                  <DialogDescription>Choose which template you want to add to your page</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addSegment('hero')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Hero Template</CardTitle>
                      <CardDescription>Image with title, subtitle and CTA button</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addSegment('tiles')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Tiles Template</CardTitle>
                      <CardDescription>Grid of cards with icons and text</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addSegment('banner')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Banner Template</CardTitle>
                      <CardDescription>Logo banner with title and button</CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addSegment('image-text')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Image & Text</CardTitle>
                      <CardDescription>Flexible column layout with images</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>

            {/* Segment List */}
            <div className="space-y-4">
              {segments.sort((a, b) => a.position - b.position).map((segment, index) => (
                <SegmentEditor
                  key={segment.id}
                  segment={segment}
                  index={index}
                  total={segments.length}
                  onUpdate={(newData) => updateSegmentData(segment.id, newData)}
                  onDelete={() => deleteSegment(segment.id)}
                  onMove={(direction) => moveSegment(segment.id, direction)}
                  onImageUpload={(e, field) => handleImageUpload(e, segment.id, field)}
                  uploading={uploading}
                />
              ))}
            </div>

            {/* Save All Button */}
            {segments.length > 0 && (
              <Button 
                onClick={saveAllSegments} 
                disabled={saving}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                {saving ? "Saving..." : "Save All Segments"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

// Segment Editor Component
const SegmentEditor = ({ 
  segment, 
  index, 
  total, 
  onUpdate, 
  onDelete, 
  onMove, 
  onImageUpload,
  uploading 
}: {
  segment: PageSegment;
  index: number;
  total: number;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  uploading: boolean;
}) => {
  const getTemplateName = (type: string) => {
    switch (type) {
      case 'hero': return 'Hero Template';
      case 'tiles': return 'Tiles Template';
      case 'banner': return 'Banner Template';
      case 'image-text': return 'Image & Text Template';
      default: return 'Template';
    }
  };

  const getTemplateColor = (type: string) => {
    switch (type) {
      case 'hero': return 'bg-blue-500';
      case 'tiles': return 'bg-green-500';
      case 'banner': return 'bg-purple-500';
      case 'image-text': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={getTemplateColor(segment.type)}>
              {getTemplateName(segment.type)}
            </Badge>
            <span className="text-sm text-muted-foreground">Position {index + 1}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onMove('up')}
              disabled={index === 0}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onMove('down')}
              disabled={index === total - 1}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Segment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this segment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {segment.type === 'hero' && (
          <HeroSegmentEditor data={segment.data} onUpdate={onUpdate} onImageUpload={onImageUpload} uploading={uploading} />
        )}
        {segment.type === 'tiles' && (
          <TilesSegmentEditor data={segment.data} onUpdate={onUpdate} onImageUpload={onImageUpload} uploading={uploading} />
        )}
        {segment.type === 'banner' && (
          <BannerSegmentEditor data={segment.data} onUpdate={onUpdate} onImageUpload={onImageUpload} uploading={uploading} />
        )}
        {segment.type === 'image-text' && (
          <ImageTextSegmentEditor data={segment.data} onUpdate={onUpdate} onImageUpload={onImageUpload} uploading={uploading} />
        )}
      </CardContent>
    </Card>
  );
};

// Hero Segment Editor
const HeroSegmentEditor = ({ data, onUpdate, onImageUpload, uploading }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ ...data, title: e.target.value })}
        />
      </div>
      
      <div>
        <Label>Subtitle (Optional)</Label>
        <Textarea
          value={data.subtitle}
          onChange={(e) => onUpdate({ ...data, subtitle: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label>Hero Image</Label>
        {data.imageUrl && (
          <div className="mb-3">
            <img 
              src={data.imageUrl} 
              alt="Hero" 
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-600"
            />
          </div>
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => onImageUpload(e, 'imageUrl')}
          disabled={uploading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Image Position</Label>
          <Select value={data.imagePosition} onValueChange={(val) => onUpdate({ ...data, imagePosition: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Layout Ratio</Label>
          <Select value={data.layout} onValueChange={(val) => onUpdate({ ...data, layout: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-1">50:50</SelectItem>
              <SelectItem value="2-3">2/3 Text : 1/3 Image</SelectItem>
              <SelectItem value="2-5">2/5 Text : 3/5 Image</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Top Padding</Label>
        <Select value={data.topPadding} onValueChange={(val) => onUpdate({ ...data, topPadding: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (PT-16)</SelectItem>
            <SelectItem value="medium">Medium (PT-24)</SelectItem>
            <SelectItem value="large">Large (PT-32)</SelectItem>
            <SelectItem value="xlarge">Extra Large (PT-40)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>CTA Button Text</Label>
        <Input
          value={data.ctaText}
          onChange={(e) => onUpdate({ ...data, ctaText: e.target.value })}
        />
      </div>

      <div>
        <Label>CTA Button Link</Label>
        <Input
          value={data.ctaLink}
          onChange={(e) => onUpdate({ ...data, ctaLink: e.target.value })}
          placeholder="/path or https://external.com"
        />
      </div>

      <div>
        <Label>CTA Button Style</Label>
        <Select value={data.ctaStyle} onValueChange={(val) => onUpdate({ ...data, ctaStyle: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard (Yellow #f9dc24)</SelectItem>
            <SelectItem value="technical">Technical (Dark Gray #1f2937)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Tiles Segment Editor
const TilesSegmentEditor = ({ data, onUpdate, onImageUpload, uploading }: any) => {
  const iconOptions = [
    { value: "FileText", label: "File Text", icon: FileText },
    { value: "Download", label: "Download", icon: Download },
    { value: "BarChart3", label: "Bar Chart", icon: BarChart3 },
    { value: "Zap", label: "Zap", icon: Zap },
    { value: "Shield", label: "Shield", icon: Shield },
    { value: "Eye", label: "Eye", icon: Eye },
    { value: "Car", label: "Car", icon: Car },
    { value: "Smartphone", label: "Smartphone", icon: Smartphone },
    { value: "Heart", label: "Heart", icon: Heart },
    { value: "CheckCircle", label: "Check Circle", icon: CheckCircle },
    { value: "Lightbulb", label: "Lightbulb", icon: Lightbulb },
    { value: "Monitor", label: "Monitor", icon: Monitor },
  ];

  const addTile = () => {
    const newItems = [...(data.items || []), {
      id: Date.now().toString(),
      title: "New Tile",
      description: "Description",
      ctaLink: "",
      ctaStyle: "standard",
      ctaText: "Learn More",
      imageUrl: "",
      icon: "FileText"
    }];
    onUpdate({ ...data, items: newItems });
  };

  const updateTile = (index: number, updates: any) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], ...updates };
    onUpdate({ ...data, items: newItems });
  };

  const deleteTile = (index: number) => {
    const newItems = data.items.filter((_: any, i: number) => i !== index);
    onUpdate({ ...data, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ ...data, title: e.target.value })}
        />
      </div>

      <div>
        <Label>Subtitle (Optional)</Label>
        <Textarea
          value={data.subtitle || ''}
          onChange={(e) => onUpdate({ ...data, subtitle: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Tiles</Label>
          <Button onClick={addTile} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Tile
          </Button>
        </div>

        {data.items && data.items.map((tile: any, index: number) => (
          <Card key={tile.id} className="bg-background/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Tile {index + 1}</CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Tile?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteTile(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Image (Optional)</Label>
                {tile.imageUrl && (
                  <div className="mb-2">
                    <img 
                      src={tile.imageUrl} 
                      alt={`Tile ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Handle tile-specific image upload
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateTile(index, { imageUrl: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  disabled={uploading}
                />
              </div>

              <div>
                <Label>Icon</Label>
                <Select 
                  value={tile.icon} 
                  onValueChange={(val) => updateTile(index, { icon: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={tile.title}
                  onChange={(e) => updateTile(index, { title: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={tile.description}
                  onChange={(e) => updateTile(index, { description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label>Button Text</Label>
                <Input
                  value={tile.ctaText}
                  onChange={(e) => updateTile(index, { ctaText: e.target.value })}
                />
              </div>

              <div>
                <Label>Button Link (Optional)</Label>
                <Input
                  value={tile.ctaLink}
                  onChange={(e) => updateTile(index, { ctaLink: e.target.value })}
                  placeholder="/path or https://external.com"
                />
              </div>

              <div>
                <Label>Button Style</Label>
                <Select 
                  value={tile.ctaStyle} 
                  onValueChange={(val) => updateTile(index, { ctaStyle: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Yellow)</SelectItem>
                    <SelectItem value="technical">Technical (Dark Gray)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Banner Segment Editor
const BannerSegmentEditor = ({ data, onUpdate, onImageUpload, uploading }: any) => {
  const addBannerImage = () => {
    const newImages = [...(data.images || []), {
      id: Date.now().toString(),
      url: "",
      alt: "Logo"
    }];
    onUpdate({ ...data, images: newImages });
  };

  const updateBannerImage = (index: number, updates: any) => {
    const newImages = [...data.images];
    newImages[index] = { ...newImages[index], ...updates };
    onUpdate({ ...data, images: newImages });
  };

  const deleteBannerImage = (index: number) => {
    const newImages = data.images.filter((_: any, i: number) => i !== index);
    onUpdate({ ...data, images: newImages });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Banner Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ ...data, title: e.target.value })}
        />
      </div>

      <div>
        <Label>Subtext (Optional)</Label>
        <Textarea
          value={data.subtext || ''}
          onChange={(e) => onUpdate({ ...data, subtext: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Banner Images</Label>
          <Button onClick={addBannerImage} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </div>

        {data.images && data.images.map((img: any, index: number) => (
          <Card key={img.id} className="bg-background/50">
            <CardContent className="pt-6 space-y-3">
              {img.url && (
                <div className="mb-2">
                  <img 
                    src={img.url} 
                    alt={img.alt} 
                    className="w-full h-24 object-contain rounded-lg bg-white p-2"
                  />
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Image {index + 1}</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateBannerImage(index, { url: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    disabled={uploading}
                  />
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteBannerImage(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Label>Button Text</Label>
        <Input
          value={data.buttonText}
          onChange={(e) => onUpdate({ ...data, buttonText: e.target.value })}
        />
      </div>

      <div>
        <Label>Button Link</Label>
        <Input
          value={data.buttonLink}
          onChange={(e) => onUpdate({ ...data, buttonLink: e.target.value })}
          placeholder="/path or https://external.com"
        />
      </div>

      <div>
        <Label>Button Style</Label>
        <Select value={data.buttonStyle} onValueChange={(val) => onUpdate({ ...data, buttonStyle: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard (Yellow)</SelectItem>
            <SelectItem value="technical">Technical (Dark Gray)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Image & Text Segment Editor
const ImageTextSegmentEditor = ({ data, onUpdate, onImageUpload, uploading }: any) => {
  const addItem = () => {
    const newItems = [...(data.items || []), {
      id: Date.now().toString(),
      title: "New Item",
      description: "Description",
      imageUrl: ""
    }];
    onUpdate({ ...data, items: newItems });
  };

  const updateItem = (index: number, updates: any) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], ...updates };
    onUpdate({ ...data, items: newItems });
  };

  const deleteItem = (index: number) => {
    const newItems = data.items.filter((_: any, i: number) => i !== index);
    onUpdate({ ...data, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ ...data, title: e.target.value })}
        />
      </div>

      <div>
        <Label>Subtext (Optional)</Label>
        <Textarea
          value={data.subtext || ''}
          onChange={(e) => onUpdate({ ...data, subtext: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label>Column Layout</Label>
        <Select value={data.layout} onValueChange={(val) => onUpdate({ ...data, layout: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-col">1 Column (Full Width)</SelectItem>
            <SelectItem value="2-col">2 Columns</SelectItem>
            <SelectItem value="3-col">3 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Items</Label>
          <Button onClick={addItem} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {data.items && data.items.map((item: any, index: number) => (
          <Card key={item.id} className="bg-background/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Item {index + 1}</CardTitle>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteItem(index)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Image (Optional)</Label>
                {item.imageUrl && (
                  <div className="mb-2">
                    <img 
                      src={item.imageUrl} 
                      alt={`Item ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateItem(index, { imageUrl: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  disabled={uploading}
                />
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
