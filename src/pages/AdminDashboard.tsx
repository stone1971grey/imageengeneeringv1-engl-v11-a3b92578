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
      } else {
        contentMap[item.section_key] = item.content_value;
      }
    });

    setContent(contentMap);
    setApplications(apps);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // Update text fields
      for (const [key, value] of Object.entries(content)) {
        const { error } = await supabase
          .from("page_content")
          .update({
            content_value: value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq("page_slug", "photography")
          .eq("section_key", key);

        if (error) throw error;
      }

      // Update applications
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

      toast.success("Content saved successfully!");
    } catch (error: any) {
      toast.error("Error saving content: " + error.message);
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
      
      <div className="container mx-auto px-6 py-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Edit Photography Page Content</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Edit the main hero section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero_title">Title</Label>
                <Input
                  id="hero_title"
                  value={content.hero_title || ""}
                  onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hero_subtitle">Subtitle</Label>
                <Input
                  id="hero_subtitle"
                  value={content.hero_subtitle || ""}
                  onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hero_description">Description</Label>
                <Textarea
                  id="hero_description"
                  value={content.hero_description || ""}
                  onChange={(e) => setContent({ ...content, hero_description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="hero_cta">CTA Button Text</Label>
                <Input
                  id="hero_cta"
                  value={content.hero_cta || ""}
                  onChange={(e) => setContent({ ...content, hero_cta: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Applications Section */}
          <Card>
            <CardHeader>
              <CardTitle>Main Applications Section</CardTitle>
              <CardDescription>Edit the applications section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="applications_title">Section Title</Label>
                <Input
                  id="applications_title"
                  value={content.applications_title || ""}
                  onChange={(e) => setContent({ ...content, applications_title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="applications_description">Section Description</Label>
                <Textarea
                  id="applications_description"
                  value={content.applications_description || ""}
                  onChange={(e) => setContent({ ...content, applications_description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Application Items */}
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Application Items</h3>
                {applications.map((app, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6 space-y-3">
                      <div>
                        <Label htmlFor={`app_title_${index}`}>Application {index + 1} Title</Label>
                        <Input
                          id={`app_title_${index}`}
                          value={app.title}
                          onChange={(e) => {
                            const newApps = [...applications];
                            newApps[index].title = e.target.value;
                            setApplications(newApps);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`app_desc_${index}`}>Application {index + 1} Description</Label>
                        <Textarea
                          id={`app_desc_${index}`}
                          value={app.description}
                          onChange={(e) => {
                            const newApps = [...applications];
                            newApps[index].description = e.target.value;
                            setApplications(newApps);
                          }}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2 px-8 py-6 text-lg"
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
