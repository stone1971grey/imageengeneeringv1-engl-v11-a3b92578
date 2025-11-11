import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { LogOut, Save } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContentItem {
  id: string;
  section_key: string;
  content_type: string;
  content_value: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
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
      loadContent();
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

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "photography");

    if (error) {
      toast.error("Error loading content");
      return;
    }

    const contentMap: Record<string, string> = {};
    let apps: any[] = [];

    data?.forEach((item: ContentItem) => {
      if (item.section_key === "applications_items") {
        apps = JSON.parse(item.content_value);
      } else if (item.section_key === "hero_image_url") {
        setHeroImageUrl(item.content_value);
      } else if (item.section_key === "hero_image_position") {
        setHeroImagePosition(item.content_value || "right");
      } else if (item.section_key === "hero_layout") {
        setHeroLayout(item.content_value || "2-5");
      } else if (item.section_key === "hero_top_padding") {
        setHeroTopPadding(item.content_value || "medium");
      } else if (item.section_key === "hero_cta_link") {
        setHeroCtaLink(item.content_value || "#applications-start");
      } else if (item.section_key === "hero_cta_style") {
        setHeroCtaStyle(item.content_value || "standard");
      } else {
        contentMap[item.section_key] = item.content_value;
      }
    });

    setContent(contentMap);
    setApplications(apps);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `photography-hero-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      setHeroImageUrl(publicUrl);
      
      // Save to database
      const { error: dbError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: "photography",
          section_key: "hero_image_url",
          content_type: "image_url",
          content_value: publicUrl,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (dbError) throw dbError;

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tileIndex: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `tile-${tileIndex}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      // Update applications array
      const newApps = [...applications];
      newApps[tileIndex].imageUrl = publicUrl;
      setApplications(newApps);

      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleSaveHero = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // Update hero fields
      const heroFields = ['hero_title', 'hero_subtitle', 'hero_description', 'hero_cta'];
      
      for (const key of heroFields) {
        if (content[key] !== undefined) {
          const { error } = await supabase
            .from("page_content")
            .update({
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            })
            .eq("page_slug", "photography")
            .eq("section_key", key);

          if (error) throw error;
        }
      }

      // Update hero image position
      await supabase
        .from("page_content")
        .upsert({
          page_slug: "photography",
          section_key: "hero_image_position",
          content_type: "text",
          content_value: heroImagePosition,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero layout
      await supabase
        .from("page_content")
        .upsert({
          page_slug: "photography",
          section_key: "hero_layout",
          content_type: "text",
          content_value: heroLayout,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero top padding
      await supabase
        .from("page_content")
        .upsert({
          page_slug: "photography",
          section_key: "hero_top_padding",
          content_type: "text",
          content_value: heroTopPadding,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero CTA link
      await supabase
        .from("page_content")
        .upsert({
          page_slug: "photography",
          section_key: "hero_cta_link",
          content_type: "text",
          content_value: heroCtaLink,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      // Update hero CTA style
      await supabase
        .from("page_content")
        .upsert({
          page_slug: "photography",
          section_key: "hero_cta_style",
          content_type: "text",
          content_value: heroCtaStyle,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      toast.success("Hero section saved successfully!");
    } catch (error: any) {
      toast.error("Error saving hero section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApplications = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // Update applications title and description
      const appFields = ['applications_title', 'applications_description'];
      
      for (const key of appFields) {
        if (content[key] !== undefined) {
          const { error } = await supabase
            .from("page_content")
            .update({
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            })
            .eq("page_slug", "photography")
            .eq("section_key", key);

          if (error) throw error;
        }
      }

      // Update applications items
      const { error: appsError } = await supabase
        .from("page_content")
        .update({
          content_value: JSON.stringify(applications),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq("page_slug", "photography")
        .eq("section_key", "applications_items");

      if (appsError) throw appsError;

      toast.success("Applications section saved successfully!");
    } catch (error: any) {
      toast.error("Error saving applications section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-32">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Edit Photography Page Content</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 mt-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Hero Section</CardTitle>
                  <CardDescription className="text-gray-300">Edit the main hero section content</CardDescription>
                </div>
                <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                  Produkt-Hero Template
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hero Image Upload */}
              <div>
                <Label htmlFor="hero_image" className="text-white">Hero Image</Label>
                <p className="text-sm text-white mb-2">
                  {heroImageUrl ? "Current hero image - click 'Replace Image' to upload a new one" : "Upload a custom hero image (replaces the interactive hotspot image)"}
                </p>
                {heroImageUrl && (
                  <div className="mb-4">
                    <img 
                      src={heroImageUrl} 
                      alt="Current hero" 
                      className="w-full max-w-md rounded-lg border-2 border-gray-600"
                    />
                  </div>
                )}
                
                {heroImageUrl ? (
                  <Button
                    type="button"
                    onClick={() => document.getElementById('hero_image')?.click()}
                    disabled={uploading}
                    className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                  >
                    {uploading ? "Uploading..." : "Replace Image"}
                  </Button>
                ) : null}
                
                <Input
                  id="hero_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className={`border-2 border-gray-600 ${heroImageUrl ? "hidden" : ""}`}
                />
                {uploading && <p className="text-sm text-white mt-2">Uploading...</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero_image_position" className="text-white">Image Position</Label>
                  <select
                    id="hero_image_position"
                    value={heroImagePosition}
                    onChange={(e) => setHeroImagePosition(e.target.value)}
                    className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="hero_layout" className="text-white">Layout Ratio</Label>
                  <select
                    id="hero_layout"
                    value={heroLayout}
                    onChange={(e) => setHeroLayout(e.target.value)}
                    className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                  >
                    <option value="50-50">50:50 (Equal)</option>
                    <option value="2-3">2:3 (Text:Image)</option>
                    <option value="1-2">1:2 (Text:Image)</option>
                    <option value="2-5">2:5 (Text:Image)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="hero_top_padding" className="text-white">Top Spacing</Label>
                <select
                  id="hero_top_padding"
                  value={heroTopPadding}
                  onChange={(e) => setHeroTopPadding(e.target.value)}
                  className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                >
                  <option value="small">Small (PT-16)</option>
                  <option value="medium">Medium (PT-24)</option>
                  <option value="large">Large (PT-32)</option>
                  <option value="xlarge">Extra Large (PT-40)</option>
                </select>
                <p className="text-sm text-white mt-1">Controls the spacing from the top of the hero section</p>
              </div>

              <div>
                <Label htmlFor="hero_title" className="text-white">Title</Label>
                <Input
                  id="hero_title"
                  value={content.hero_title || ""}
                  onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                  className="border-2 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="hero_subtitle" className="text-white">Subtitle</Label>
                <Input
                  id="hero_subtitle"
                  value={content.hero_subtitle || ""}
                  onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                  className="border-2 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="hero_description" className="text-white">Description</Label>
                <Textarea
                  id="hero_description"
                  value={content.hero_description || ""}
                  onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
                  rows={3}
                  className="border-2 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="hero_cta" className="text-white">CTA Button Text</Label>
                <Input
                  id="hero_cta"
                  value={content.hero_cta || ""}
                  onChange={(e) => setContent({ ...content, hero_cta: e.target.value })}
                  className="border-2 border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="hero_cta_link" className="text-white">CTA Button Link</Label>
                <Input
                  id="hero_cta_link"
                  value={heroCtaLink}
                  onChange={(e) => setHeroCtaLink(e.target.value)}
                  placeholder="#applications-start, /page-url, or https://example.com"
                  className="border-2 border-gray-600"
                />
                <p className="text-sm text-white mt-1">
                  Use '#section-id' for same page links, '/path' for internal pages, or 'https://...' for external URLs (opens in new tab)
                </p>
              </div>

              <div>
                <Label htmlFor="hero_cta_style" className="text-white">CTA Button Style</Label>
                <select
                  id="hero_cta_style"
                  value={heroCtaStyle}
                  onChange={(e) => setHeroCtaStyle(e.target.value)}
                  className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                >
                  <option value="standard">Standard (Yellow with Black Text)</option>
                  <option value="technical">Technical (Dark Gray with White Text)</option>
                </select>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveHero}
                  disabled={saving}
                  className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Tiles Template</CardTitle>
                  <CardDescription className="text-gray-300">Edit the tiles section content</CardDescription>
                </div>
                <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                  Tiles Template
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="applications_title" className="text-white">Section Title</Label>
                <Input
                  id="applications_title"
                  value={content.applications_title || ""}
                  onChange={(e) => setContent({ ...content, applications_title: e.target.value })}
                  className="border-2 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="applications_description" className="text-white">Section Description</Label>
                <Textarea
                  id="applications_description"
                  value={content.applications_description || ""}
                  onChange={(e) => setContent({ ...content, applications_description: e.target.value })}
                  rows={3}
                  className="border-2 border-gray-600"
                />
              </div>

              {/* Application Items */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-white">Application Items</h3>
                {applications.map((app, index) => (
                  <Card key={index} className={`border-2 ${index % 2 === 0 ? 'bg-gray-600 border-gray-500' : 'bg-gray-800 border-gray-700'}`}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`px-4 py-2 ${index % 2 === 0 ? 'bg-[#f9dc24]' : 'bg-orange-400'} text-black text-base font-bold rounded-md shadow-lg`}>
                          Tile {index + 1}
                        </div>
                      </div>
                      {/* Image Upload */}
                      <div>
                        <Label htmlFor={`app_image_${index}`} className="text-white">Tile Image (Optional)</Label>
                        <p className="text-sm text-white mb-2">
                          {app.imageUrl ? "Current image - click 'Replace' to upload a new one" : "Upload an image for this tile (appears above the title)"}
                        </p>
                        {app.imageUrl && (
                          <div className="mb-3">
                            <img 
                              src={app.imageUrl} 
                              alt={`Tile ${index + 1}`} 
                              className="w-full h-[200px] object-cover rounded-lg border-2 border-gray-600"
                            />
                          </div>
                        )}
                        
                        {app.imageUrl ? (
                          <Button
                            type="button"
                            onClick={() => document.getElementById(`app_image_${index}`)?.click()}
                            disabled={uploading}
                            className="mb-2 bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 border-2 border-black"
                          >
                            {uploading ? "Uploading..." : "Replace Image"}
                          </Button>
                        ) : null}
                        
                        <Input
                          id={`app_image_${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTileImageUpload(e, index)}
                          disabled={uploading}
                          className={`border-2 border-gray-600 ${app.imageUrl ? "hidden" : ""}`}
                        />
                      </div>
                      
                      {/* Icon Selection */}
                      <div>
                        <Label htmlFor={`app_icon_${index}`} className="text-white">Icon (Optional)</Label>
                        <Select
                          value={app.icon || "none"}
                          onValueChange={(value) => {
                            const newApps = [...applications];
                            newApps[index].icon = value === "none" ? "" : value;
                            setApplications(newApps);
                          }}
                        >
                          <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                            <SelectValue placeholder="Select an icon" className="text-black" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="none" className="text-black">No Icon</SelectItem>
                            <SelectItem value="FileText" className="text-black">Document (FileText)</SelectItem>
                            <SelectItem value="Download" className="text-black">Download</SelectItem>
                            <SelectItem value="BarChart3" className="text-black">Bar Chart</SelectItem>
                            <SelectItem value="Zap" className="text-black">Lightning (Zap)</SelectItem>
                            <SelectItem value="Shield" className="text-black">Shield</SelectItem>
                            <SelectItem value="Eye" className="text-black">Eye</SelectItem>
                            <SelectItem value="Car" className="text-black">Car</SelectItem>
                            <SelectItem value="Smartphone" className="text-black">Smartphone</SelectItem>
                            <SelectItem value="Heart" className="text-black">Heart</SelectItem>
                            <SelectItem value="CheckCircle" className="text-black">Check Circle</SelectItem>
                            <SelectItem value="Lightbulb" className="text-black">Lightbulb</SelectItem>
                            <SelectItem value="Monitor" className="text-black">Monitor</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-white mt-1">
                          Icon appears in a yellow circle above the title
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor={`app_title_${index}`} className="text-white">Application {index + 1} Title</Label>
                        <Input
                          id={`app_title_${index}`}
                          value={app.title}
                          onChange={(e) => {
                            const newApps = [...applications];
                            newApps[index].title = e.target.value;
                            setApplications(newApps);
                          }}
                          className="border-2 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`app_desc_${index}`} className="text-white">Application {index + 1} Description</Label>
                        <Textarea
                          id={`app_desc_${index}`}
                          value={app.description}
                          onChange={(e) => {
                            const newApps = [...applications];
                            newApps[index].description = e.target.value;
                            setApplications(newApps);
                          }}
                          rows={3}
                          className="border-2 border-gray-600"
                        />
                      </div>
                      
                      {/* Button Settings */}
                      <div className="pt-3 border-t border-gray-600">
                        <h4 className="text-sm font-semibold text-white mb-3">Button Settings</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`app_cta_link_${index}`} className="text-white">Button Link</Label>
                            <Input
                              id={`app_cta_link_${index}`}
                              value={app.ctaLink || ""}
                              onChange={(e) => {
                                const newApps = [...applications];
                                newApps[index].ctaLink = e.target.value;
                                setApplications(newApps);
                              }}
                              placeholder="/page-url or https://example.com"
                              className="border-2 border-gray-600"
                            />
                            <p className="text-sm text-white mt-1">
                              Use '/path' for internal pages or 'https://...' for external URLs
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor={`app_cta_text_${index}`} className="text-white">Button Text</Label>
                            <Input
                              id={`app_cta_text_${index}`}
                              value={app.ctaText || ""}
                              onChange={(e) => {
                                const newApps = [...applications];
                                newApps[index].ctaText = e.target.value;
                                setApplications(newApps);
                              }}
                              placeholder="Learn More"
                              className="border-2 border-gray-600"
                            />
                            <p className="text-sm text-white mt-1">
                              Text displayed on the button (default: "Learn More")
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor={`app_cta_style_${index}`} className="text-white">Button Style</Label>
                            <select
                              id={`app_cta_style_${index}`}
                              value={app.ctaStyle || "standard"}
                              onChange={(e) => {
                                const newApps = [...applications];
                                newApps[index].ctaStyle = e.target.value;
                                setApplications(newApps);
                              }}
                              className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                            >
                              <option value="standard">Standard (Yellow with Black Text)</option>
                              <option value="technical">Technical (Dark Gray with White Text)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveApplications}
                  disabled={saving}
                  className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
