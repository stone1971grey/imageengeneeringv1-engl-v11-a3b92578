import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { LogOut, Save, Plus, Trash2, X, GripVertical, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MetaNavigationEditor from '@/components/admin/MetaNavigationEditor';
import ProductHeroGalleryEditor from '@/components/admin/ProductHeroGalleryEditor';
import FeatureOverviewEditor from '@/components/admin/FeatureOverviewEditor';

interface ContentItem {
  id: string;
  section_key: string;
  content_type: string;
  content_value: string;
}

interface SortableTabProps {
  id: string;
  value: string;
  children: React.ReactNode;
  isDraggable?: boolean;
}

const SortableTab = ({ id, value, children, isDraggable = true }: SortableTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDraggable ? 'grab' : 'default',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <TabsTrigger 
        value={value}
        className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black flex-1"
      >
        <div className="flex items-center gap-2">
          {isDraggable && (
            <div {...attributes} {...listeners}>
              <GripVertical className="h-4 w-4 text-gray-500" />
            </div>
          )}
          {children}
        </div>
      </TabsTrigger>
    </div>
  );
};

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const location = useLocation();
  
  // Static segment IDs - these are fixed and never change
  const STATIC_SEGMENT_IDS = {
    hero: 1,
    tiles: 2, 
    banner: 3,
    solutions: 4
  };
  
  // Get selected page from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const selectedPage = searchParams.get('page') || 'photography';
  const [applications, setApplications] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerSubtext, setBannerSubtext] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [bannerButtonText, setBannerButtonText] = useState<string>("");
  const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
  const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
  const [solutionsTitle, setSolutionsTitle] = useState<string>("");
  const [solutionsSubtext, setSolutionsSubtext] = useState<string>("");
  const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col");
  const [solutionsItems, setSolutionsItems] = useState<any[]>([]);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [tabOrder, setTabOrder] = useState<string[]>(['tiles', 'banner', 'solutions']);
  const [nextSegmentId, setNextSegmentId] = useState<number>(5); // Start from 5 after static segments (1-4)
  const [footerCtaTitle, setFooterCtaTitle] = useState<string>("");
  const [footerCtaDescription, setFooterCtaDescription] = useState<string>("");
  const [footerContactHeadline, setFooterContactHeadline] = useState<string>("");
  const [footerContactSubline, setFooterContactSubline] = useState<string>("");
  const [footerContactDescription, setFooterContactDescription] = useState<string>("");
  const [footerTeamImageUrl, setFooterTeamImageUrl] = useState<string>("");
  const [footerTeamQuote, setFooterTeamQuote] = useState<string>("");
  const [footerTeamName, setFooterTeamName] = useState<string>("");
  const [footerTeamTitle, setFooterTeamTitle] = useState<string>("");
  const [footerButtonText, setFooterButtonText] = useState<string>("");
  const [segmentRegistry, setSegmentRegistry] = useState<Record<string, number>>({});

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
      checkUserAccess();
    }
  }, [user]);

  useEffect(() => {
    if (user && (isAdmin || isEditor)) {
      // Reset all state when changing pages
      setHeroImageUrl("");
      setHeroImagePosition("right");
      setHeroLayout("2-5");
      setHeroTopPadding("medium");
      setHeroCtaLink("#applications-start");
      setHeroCtaStyle("standard");
      setBannerTitle("");
      setBannerSubtext("");
      setBannerImages([]);
      setBannerButtonText("");
      setBannerButtonLink("");
      setBannerButtonStyle("standard");
      setSolutionsTitle("");
      setSolutionsSubtext("");
      setSolutionsLayout("2-col");
      setSolutionsItems([]);
      setApplications([]);
      setPageSegments([]);
      setTabOrder(['tiles', 'banner', 'solutions']);
      setFooterCtaTitle("");
      setFooterCtaDescription("");
      setFooterContactHeadline("");
      setFooterContactSubline("");
      setFooterContactDescription("");
      setFooterTeamImageUrl("");
      setFooterTeamQuote("");
      setFooterTeamName("");
      setFooterTeamTitle("");
      setFooterButtonText("");
      setContent({});
      
      // First, load segment registry to get all segment IDs
      loadSegmentRegistry().then(() => {
        // Then calculate global max segment ID across all pages
        calculateGlobalMaxSegmentId().then(() => {
          // Finally load content for current page
          loadContent();
        });
      });
    }
  }, [user, selectedPage, isAdmin, isEditor]);

  // Sync tabOrder with pageSegments - ensure all segment IDs are in tabOrder
  useEffect(() => {
    if (!user || !selectedPage) return;
    
    const staticTabs = ['tiles', 'banner', 'solutions'];
    const segmentIds = pageSegments.map(seg => seg.id || `segment-${seg.position}`);
    
    // Build complete list of all tabs that should exist
    const allTabs = [...staticTabs, ...segmentIds];
    
    // Filter current order to only include valid tabs
    const validOrder = tabOrder.filter(id => allTabs.includes(id));
    
    // Find missing tabs
    const missingTabs = allTabs.filter(id => !validOrder.includes(id));
    
    if (missingTabs.length > 0) {
      const newOrder = [...validOrder, ...missingTabs];
      setTabOrder(newOrder);
      
      // Save to database
      supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(newOrder),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });
    }
  }, [pageSegments, user, selectedPage]);

  const checkUserAccess = async () => {
    if (!user) return;
    
    // Check if user is admin
    const { data: adminData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminData) {
      setIsAdmin(true);
      setIsEditor(false);
      setAllowedPages([]); // Admins have access to all pages
      setLoading(false);
      return;
    }

    // Check if user is editor
    const { data: editorData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "editor")
      .maybeSingle();

    if (editorData) {
      // Get editor's allowed pages
      const { data: pageAccessData, error: pageAccessError } = await supabase
        .from("editor_page_access")
        .select("page_slug")
        .eq("user_id", user.id);

      if (pageAccessError || !pageAccessData || pageAccessData.length === 0) {
        toast.error("You don't have access to any pages");
        navigate("/");
        return;
      }

      const pages = pageAccessData.map(p => p.page_slug);
      
      setIsEditor(true);
      setIsAdmin(false);
      setAllowedPages(pages);
      
      // Redirect to first allowed page if current page is not in allowed pages
      if (pages.length > 0 && !pages.includes(selectedPage)) {
        navigate(`/admin-dashboard?page=${pages[0]}`);
      }
      
      setLoading(false);
      return;
    }

    // No valid role found
    toast.error("You don't have admin or editor access");
    navigate("/");
  };

  // Load segment registry to get all segment IDs
  // IMPORTANT: Only load non-deleted segments (deleted=false or deleted IS NULL)
  // to prevent showing deleted segments, but keep their IDs in registry forever
  const loadSegmentRegistry = async () => {
    try {
      const { data, error } = await supabase
        .from("segment_registry")
        .select("*")
        .eq("page_slug", selectedPage)
        .or("deleted.is.null,deleted.eq.false"); // Only load active segments

      if (error) {
        console.error("Error loading segment registry:", error);
        return;
      }

      // Create a map of segment_key to segment_id
      const registry: Record<string, number> = {};
      data?.forEach((item: any) => {
        registry[item.segment_key] = item.segment_id;
      });

      setSegmentRegistry(registry);
      console.log("✅ Loaded segment registry for", selectedPage, ":", registry);
    } catch (error) {
      console.error("Error loading segment registry:", error);
    }
  };

  // Calculate the maximum segment ID across ALL pages to ensure global uniqueness
  const calculateGlobalMaxSegmentId = async () => {
    try {
      // Query segment_registry to get the highest segment_id
      const { data, error } = await supabase
        .from("segment_registry")
        .select("segment_id")
        .order("segment_id", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error fetching global max segment ID:", error);
        setNextSegmentId(18); // Default to 18 (after initial 17 segments)
        return;
      }

      const globalMaxId = data?.segment_id || 17;
      const nextId = globalMaxId + 1;
      setNextSegmentId(nextId);
      console.log("✅ Global max segment ID:", globalMaxId, "| Next available ID:", nextId);
    } catch (error) {
      console.error("Error calculating global max segment ID:", error);
      setNextSegmentId(18); // Default to 18 if error
    }
  };

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", selectedPage);

    if (error) {
      toast.error("Error loading content");
      return;
    }

    const contentMap: Record<string, string> = {};
    let apps: any[] = [];

    data?.forEach((item: ContentItem) => {
      if (item.section_key === "applications_items") {
        apps = JSON.parse(item.content_value);
      } else if (item.section_key === "solutions_title") {
        setSolutionsTitle(item.content_value);
      } else if (item.section_key === "solutions_subtext") {
        setSolutionsSubtext(item.content_value);
      } else if (item.section_key === "solutions_layout") {
        setSolutionsLayout(item.content_value || "2-col");
      } else if (item.section_key === "solutions_items") {
        setSolutionsItems(JSON.parse(item.content_value));
      } else if (item.section_key === "banner_images") {
        setBannerImages(JSON.parse(item.content_value));
      } else if (item.section_key === "banner_title") {
        setBannerTitle(item.content_value);
      } else if (item.section_key === "banner_subtext") {
        setBannerSubtext(item.content_value);
      } else if (item.section_key === "banner_button_text") {
        setBannerButtonText(item.content_value);
      } else if (item.section_key === "banner_button_link") {
        setBannerButtonLink(item.content_value);
      } else if (item.section_key === "banner_button_style") {
        setBannerButtonStyle(item.content_value || "standard");
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
      } else if (item.section_key === "page_segments") {
        try {
          const segments = JSON.parse(item.content_value);
          // Ensure all segments have numeric IDs
          let needsUpdate = false;
          const segmentsWithIds = (segments || []).map((seg: any, idx: number) => {
            if (!seg.id || typeof seg.id !== 'number' && !seg.id.match(/^\d+$/)) {
              needsUpdate = true;
              // Assign sequential IDs starting after static segments (1-4)
              return {
                ...seg,
                id: String(5 + idx), // Start from 5 for dynamic segments
                position: idx
              };
            }
            return {
              ...seg,
              position: idx
            };
          });
          
          setPageSegments(segmentsWithIds);
          
          // If we added IDs, save back to database immediately
          if (needsUpdate && user) {
            console.log("Updating segments with numeric IDs:", segmentsWithIds);
            supabase
              .from("page_content")
              .upsert({
                page_slug: selectedPage,
                section_key: "page_segments",
                content_type: "json",
                content_value: JSON.stringify(segmentsWithIds),
                updated_at: new Date().toISOString(),
                updated_by: user.id
              }, {
                onConflict: 'page_slug,section_key'
              })
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating segment IDs:", error);
                } else {
                  console.log("Segment IDs updated successfully");
                }
              });
          }
          
          // Note: Global max ID is already calculated in calculateGlobalMaxSegmentId()
        } catch {
          setPageSegments([]);
        }
      } else if (item.section_key === "tab_order") {
        try {
          const order = JSON.parse(item.content_value);
          // Convert old segment-X format to new IDs if needed
          const updatedOrder = (order || ['tiles', 'banner', 'solutions']).map((tabId: string) => {
            if (tabId.startsWith('segment-')) {
              // This will be fixed by the useEffect sync after segments load
              return tabId;
            }
            return tabId;
          });
          setTabOrder(updatedOrder);
        } catch {
          setTabOrder(['tiles', 'banner', 'solutions']);
        }
      } else if (item.section_key === "footer_cta_title") {
        setFooterCtaTitle(item.content_value);
      } else if (item.section_key === "footer_cta_description") {
        setFooterCtaDescription(item.content_value);
      } else if (item.section_key === "footer_contact_headline") {
        setFooterContactHeadline(item.content_value);
      } else if (item.section_key === "footer_contact_subline") {
        setFooterContactSubline(item.content_value);
      } else if (item.section_key === "footer_contact_description") {
        setFooterContactDescription(item.content_value);
      } else if (item.section_key === "footer_team_image_url") {
        setFooterTeamImageUrl(item.content_value);
      } else if (item.section_key === "footer_team_quote") {
        setFooterTeamQuote(item.content_value);
      } else if (item.section_key === "footer_team_name") {
        setFooterTeamName(item.content_value);
      } else if (item.section_key === "footer_team_title") {
        setFooterTeamTitle(item.content_value);
      } else if (item.section_key === "footer_button_text") {
        setFooterButtonText(item.content_value);
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
      const fileName = `${selectedPage}-hero-${Date.now()}.${fileExt}`;
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
          page_slug: selectedPage,
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

  const handleDeleteStaticSegment = async (segmentType: 'hero' | 'tiles' | 'banner' | 'solutions') => {
    if (!user) return;
    
    setSaving(true);
    try {
      let sectionKeys: string[] = [];
      
      switch (segmentType) {
        case 'hero':
          sectionKeys = ['hero_title', 'hero_subtitle', 'hero_description', 'hero_cta', 'hero_image_url', 'hero_image_position', 'hero_layout', 'hero_top_padding', 'hero_cta_link', 'hero_cta_style'];
          break;
        case 'tiles':
          sectionKeys = ['applications_title', 'applications_description', 'applications_items'];
          break;
        case 'banner':
          sectionKeys = ['banner_title', 'banner_subtext', 'banner_images', 'banner_button_text', 'banner_button_link', 'banner_button_style'];
          break;
        case 'solutions':
          sectionKeys = ['solutions_title', 'solutions_subtext', 'solutions_layout', 'solutions_items'];
          break;
      }

      // CRITICAL: Mark segment as deleted in registry instead of removing it
      // This ensures the segment_id is NEVER reused, even after deletion
      const { error: registryError } = await supabase
        .from("segment_registry")
        .update({ deleted: true })
        .eq("segment_key", segmentType)
        .eq("page_slug", selectedPage);

      if (registryError) {
        console.error("Error marking segment as deleted in registry:", registryError);
        throw registryError;
      }

      const { error } = await supabase
        .from("page_content")
        .delete()
        .eq("page_slug", selectedPage)
        .in("section_key", sectionKeys);

      if (error) throw error;

      // Remove from tab order
      const updatedTabOrder = tabOrder.filter(id => id !== segmentType);
      
      // Save updated tab order
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      setTabOrder(updatedTabOrder);
      toast.success("Segment deleted successfully! (ID will never be reused)");
      
      // Reload content
      await loadContent();
      
      // Switch to first available tab
      setActiveTab("hero");
    } catch (error: any) {
      toast.error("Error deleting segment: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tabOrder.indexOf(active.id as string);
    const newIndex = tabOrder.indexOf(over.id as string);

    const newOrder = arrayMove(tabOrder, oldIndex, newIndex);
    setTabOrder(newOrder);

    // Save new order to database
    try {
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(newOrder),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key'
        });
    } catch (error: any) {
      toast.error("Error saving tab order: " + error.message);
    }
  };

  const handleSaveHero = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // Update hero fields using upsert to handle both new and existing entries
      const heroFields = ['hero_title', 'hero_subtitle', 'hero_description', 'hero_cta'];
      
      for (const key of heroFields) {
        if (content[key] !== undefined) {
          const { error } = await supabase
            .from("page_content")
            .upsert({
              page_slug: selectedPage,
              section_key: key,
              content_type: "text",
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key'
            });

          if (error) throw error;
        }
      }

      // Update hero image position
      await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
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
          page_slug: selectedPage,
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
          page_slug: selectedPage,
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
          page_slug: selectedPage,
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
          page_slug: selectedPage,
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

  const handleAddTile = () => {
    const newTile = {
      title: "New Application",
      description: "Add description here...",
      ctaLink: "",
      ctaStyle: "standard",
      ctaText: "Learn More",
      imageUrl: "",
      icon: ""
    };
    setApplications([...applications, newTile]);
    toast.success("New tile added! Don't forget to save changes.");
  };

  const handleDeleteTile = (index: number) => {
    const newApps = applications.filter((_, i) => i !== index);
    setApplications(newApps);
    toast.success("Tile deleted! Don't forget to save changes.");
  };

  const handleAddSolutionItem = () => {
    const newItem = {
      title: "New Solution",
      description: "Add description here...",
      imageUrl: ""
    };
    setSolutionsItems([...solutionsItems, newItem]);
    toast.success("New solution item added! Don't forget to save changes.");
  };

  const handleDeleteSolutionItem = (index: number) => {
    const newItems = solutionsItems.filter((_, i) => i !== index);
    setSolutionsItems(newItems);
    toast.success("Solution item deleted! Don't forget to save changes.");
  };

  const handleSolutionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `solution-${index}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      const newItems = [...solutionsItems];
      newItems[index].imageUrl = publicUrl;
      setSolutionsItems(newItems);

      toast.success("Solution image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageTextHeroImageUpload = async (segmentIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `image-text-hero-${segmentIndex}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      const newSegments = [...pageSegments];
      newSegments[segmentIndex].data.heroImageUrl = publicUrl;
      setPageSegments(newSegments);

      toast.success("Hero image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageTextItemImageUpload = async (segmentIndex: number, itemIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `image-text-item-${segmentIndex}-${itemIndex}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      const newSegments = [...pageSegments];
      newSegments[segmentIndex].data.items[itemIndex].imageUrl = publicUrl;
      setPageSegments(newSegments);

      toast.success("Item image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFooterTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `footer-team-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      setFooterTeamImageUrl(publicUrl);
      
      // Save to database
      const { error: dbError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "footer_team_image_url",
          content_type: "image_url",
          content_value: publicUrl,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (dbError) throw dbError;

      toast.success("Team image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddBannerImage = () => {
    const newImage = {
      url: "",
      alt: `Banner image ${bannerImages.length + 1}`
    };
    setBannerImages([...bannerImages, newImage]);
    toast.success("New banner image slot added! Upload an image.");
  };

  const handleDeleteBannerImage = (index: number) => {
    const newImages = bannerImages.filter((_, i) => i !== index);
    setBannerImages(newImages);
    toast.success("Banner image deleted! Don't forget to save changes.");
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-image-${index}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('page-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('page-images')
        .getPublicUrl(filePath);

      const newImages = [...bannerImages];
      newImages[index].url = publicUrl;
      setBannerImages(newImages);

      toast.success("Banner image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getDefaultSegmentData = (templateType: string) => {
    switch (templateType) {
      case 'hero':
        return {
          title: 'New Hero Section',
          subtitle: '',
          description: '',
          cta: 'Learn More',
          imageUrl: '',
          imagePosition: 'right',
          layout: '2-5',
          topPadding: 'medium',
          ctaLink: '',
          ctaStyle: 'standard'
        };
      case 'meta-navigation':
        return {
          links: [
            { label: 'Overview', anchor: 'overview' },
            { label: 'Key Benefits', anchor: 'benefits' },
            { label: 'Use Cases', anchor: 'use-cases' }
          ]
        };
      case 'product-hero-gallery':
        return {
          title: 'Product Name',
          subtitle: 'Product Variants',
          description: 'Product description',
          cta1Text: 'Contact Sales',
          cta1Link: '#contact',
          cta1Style: 'standard',
          cta2Text: 'Learn More',
          cta2Link: '',
          cta2Style: 'outline-white',
          images: [{
            imageUrl: '',
            title: '',
            description: ''
          }]
        };
      case 'tiles':
        return {
          title: 'New Tiles Section',
          description: 'Section description text',
          items: [
            {
              title: 'New Application',
              description: 'Add description here...',
              ctaLink: '',
              ctaStyle: 'standard',
              ctaText: 'Learn More',
              imageUrl: '',
              icon: ''
            }
          ]
        };
      case 'banner':
        return {
          title: 'New Banner Section',
          subtext: '',
          images: [],
          buttonText: '',
          buttonLink: '',
          buttonStyle: 'standard'
        };
      case 'image-text':
        return {
          title: 'New Image & Text Section',
          subtext: '',
          layout: '2-col',
          items: [
            {
              title: 'New Item',
              description: 'Add description here...',
              imageUrl: ''
            }
          ]
        };
      case 'feature-overview':
        return {
          title: 'Key Benefits',
          subtext: '',
          layout: '3',
          items: [
            {
              title: 'Feature Title',
              description: 'Feature description text goes here...'
            }
          ]
        };
      default:
        return {};
    }
  };

  const handleAddSegment = async (templateType: string) => {
    if (!user) return;

    // Generate a unique numeric ID for this segment (globally unique across all pages)
    const segmentId = nextSegmentId;
    console.log("Creating new segment with global ID:", segmentId);
    setNextSegmentId(nextSegmentId + 1);
    
    const newSegment = {
      id: String(segmentId),
      type: templateType,
      position: templateType === 'meta-navigation' ? 1 : pageSegments.length,
      data: getDefaultSegmentData(templateType)
    };

    const updatedSegments = [...pageSegments, newSegment];
    
    // Update tab order to include new segment
    let updatedTabOrder: string[];
    if (templateType === 'meta-navigation') {
      // Insert meta-navigation right after hero
      const heroIndex = tabOrder.findIndex(id => id === 'hero');
      if (heroIndex !== -1) {
        updatedTabOrder = [
          ...tabOrder.slice(0, heroIndex + 1),
          String(segmentId),
          ...tabOrder.slice(heroIndex + 1)
        ];
      } else {
        updatedTabOrder = [String(segmentId), ...tabOrder];
      }
    } else {
      updatedTabOrder = [...tabOrder, String(segmentId)];
    }

    try {
      // CRITICAL: Register segment in segment_registry with global unique ID
      const { error: registryError } = await supabase
        .from("segment_registry")
        .insert({
          segment_id: segmentId,
          page_slug: selectedPage,
          segment_type: templateType,
          segment_key: String(segmentId),
          is_static: false,
          deleted: false
        });

      if (registryError) {
        console.error("Error registering segment in registry:", registryError);
        throw registryError;
      }

      // Save segments
      const { error: segmentsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (segmentsError) throw segmentsError;

      // Save tab order
      const { error: orderError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (orderError) throw orderError;

      setPageSegments(updatedSegments);
      setTabOrder(updatedTabOrder);
      setIsTemplateDialogOpen(false);
      
      // Switch to the newly added segment tab
      setActiveTab(String(segmentId));
      
      toast.success(`New segment added successfully with ID ${segmentId}!`);
    } catch (error: any) {
      toast.error("Error adding segment: " + error.message);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    if (!user) return;

    // Remove the segment with this ID
    const updatedSegments = pageSegments
      .filter(seg => seg.id !== segmentId)
      .map((seg, idx) => ({
        ...seg,
        position: idx  // Renumber positions sequentially
      }));
    
    // Remove from tab order (IDs stay the same, just remove this one)
    const updatedTabOrder = tabOrder.filter(id => id !== segmentId);

    try {
      // CRITICAL: Mark segment as deleted in registry instead of removing it
      // This ensures the segment_id is NEVER reused, even after deletion
      const { error: registryError } = await supabase
        .from("segment_registry")
        .update({ deleted: true })
        .eq("segment_key", segmentId)
        .eq("page_slug", selectedPage);

      if (registryError) {
        console.error("Error marking segment as deleted in registry:", registryError);
        throw registryError;
      }

      const { error: segmentsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(updatedSegments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (segmentsError) throw segmentsError;

      const { error: orderError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "tab_order",
          content_type: "json",
          content_value: JSON.stringify(updatedTabOrder),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (orderError) throw orderError;

      setPageSegments(updatedSegments);
      setTabOrder(updatedTabOrder);
      
      // Switch to first available tab
      const firstTab = updatedTabOrder[0] || 'tiles';
      setActiveTab(firstTab);
      
      toast.success("Segment deleted successfully! (ID will never be reused)");
    } catch (error: any) {
      toast.error("Error deleting segment: " + error.message);
    }
  };

  const handleSaveSegments = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
          content_type: "json",
          content_value: JSON.stringify(pageSegments),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (error) throw error;
      toast.success("Segment saved successfully!");
    } catch (error: any) {
      toast.error("Error saving segment: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApplications = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      // Update applications title and description using upsert
      const appFields = ['applications_title', 'applications_description'];
      
      for (const key of appFields) {
        if (content[key] !== undefined) {
          const { error } = await supabase
            .from("page_content")
            .upsert({
              page_slug: selectedPage,
              section_key: key,
              content_type: "text",
              content_value: content[key],
              updated_at: new Date().toISOString(),
              updated_by: user.id
            }, {
              onConflict: 'page_slug,section_key'
            });

          if (error) throw error;
        }
      }

      // Update applications items using upsert
      const { error: appsError } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "applications_items",
          content_type: "json",
          content_value: JSON.stringify(applications),
          updated_at: new Date().toISOString(),
          updated_by: user.id
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (appsError) throw appsError;

      toast.success("Applications section saved successfully!");
    } catch (error: any) {
      toast.error("Error saving applications section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async () => {
    if (!user) return;
    
    setSaving(true);

    try {
      const footerFields = {
        'footer_cta_title': footerCtaTitle,
        'footer_cta_description': footerCtaDescription,
        'footer_contact_headline': footerContactHeadline,
        'footer_contact_subline': footerContactSubline,
        'footer_contact_description': footerContactDescription,
        'footer_team_quote': footerTeamQuote,
        'footer_team_name': footerTeamName,
        'footer_team_title': footerTeamTitle,
        'footer_button_text': footerButtonText
      };

      for (const [key, value] of Object.entries(footerFields)) {
        await supabase
          .from("page_content")
          .upsert({
            page_slug: selectedPage,
            section_key: key,
            content_type: "text",
            content_value: value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          }, {
            onConflict: 'page_slug,section_key'
          });
      }

      toast.success("Footer section saved successfully!");
    } catch (error: any) {
      toast.error("Error saving footer section: " + error.message);
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

  if (!isAdmin && !isEditor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-32">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Editing: <span className="font-semibold">
                {selectedPage === 'photography' ? 'Photo & Video' : 
                 selectedPage === 'scanners-archiving' ? 'Scanners & Archiving' :
                 selectedPage === 'your-solution' ? 'Your Solution' : selectedPage}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Segment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Choose a Template</DialogTitle>
                  <DialogDescription>
                    Select a template to add a new segment to the page
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddSegment('meta-navigation')}>
                    <CardHeader>
                      <CardTitle>Meta Navigation</CardTitle>
                      <CardDescription>Sticky navigation with anchor links</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        Add Meta Navigation
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddSegment('product-hero-gallery')}>
                    <CardHeader>
                      <CardTitle>Product Hero Gallery</CardTitle>
                      <CardDescription>Hero with image gallery & dual CTAs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        Add Product Gallery
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddSegment('hero')}>
                    <CardHeader>
                      <CardTitle>Produkt-Hero</CardTitle>
                      <CardDescription>Hero section with image and text</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        Add Hero Section
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddSegment('tiles')}>
                    <CardHeader>
                      <CardTitle>Tiles</CardTitle>
                      <CardDescription>Grid of application tiles with icons</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        Add Tiles Section
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddSegment('banner')}>
                    <CardHeader>
                      <CardTitle>Banner</CardTitle>
                      <CardDescription>Banner with images and CTA button</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        Add Banner Section
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddSegment('image-text')}>
                    <CardHeader>
                      <CardTitle>Image & Text</CardTitle>
                      <CardDescription>Flexible image and text layout</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        Add Image & Text Section
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddSegment('feature-overview')}>
                    <CardHeader>
                      <CardTitle>Feature Overview</CardTitle>
                      <CardDescription>Grid layout with features/benefits</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90">
                        Add Feature Overview
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              onClick={() => {
                const urlMap: Record<string, string> = {
                  'index': '/',
                  'your-solution': '/your-solution',
                  'products': '/products',
                  'downloads': '/downloads',
                  'events': '/events',
                  'news': '/news',
                  'inside-lab': '/inside-lab',
                  'contact': '/contact',
                  'automotive': '/your-solution/automotive',
                  'in-cabin-testing': '/your-solution/automotive/in-cabin-testing',
                  'photography': '/your-solution/photography',
                  'scanners-archiving': '/your-solution/scanners-archiving',
                  'medical-endoscopy': '/your-solution/medical-endoscopy',
                  'web-camera': '/your-solution/web-camera',
                  'machine-vision': '/your-solution/machine-vision',
                  'test-charts': '/products/test-charts',
                  'illumination-devices': '/products/illumination-devices',
                  'le7': '/products/test-charts/le7',
                  'arcturus': '/products/illumination-devices/arcturus'
                };
                const previewUrl = urlMap[selectedPage] || '/';
                window.open(previewUrl, '_blank');
              }}
              className="flex items-center gap-2 border-[#f9dc24] text-[#f9dc24] hover:bg-[#f9dc24]/10 hover:text-gray-600"
            >
              <Eye className="h-4 w-4" />
              Preview Frontend
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <TabsList className="flex w-full mb-6 h-auto p-2 bg-gray-200">
              {/* MANDATORY: Meta Navigation - ALWAYS FIRST/LEFTMOST (Nothing before it!) */}
              {pageSegments
                .filter(segment => segment.type === 'meta-navigation')
                .map((segment) => {
                  const segmentIndex = pageSegments.indexOf(segment);
                  const sameTypeBefore = pageSegments.slice(0, segmentIndex).filter(s => s.type === 'meta-navigation').length;
                  const displayNumber = sameTypeBefore + 1;
                  const segmentId = segmentRegistry[segment.id] || segment.id;
                  
                  return (
                    <TabsTrigger 
                      key={segment.id}
                      value={segment.id}
                      className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                    >
                      ID {segmentId}: Meta Nav {displayNumber}
                    </TabsTrigger>
                  );
                })}

              {/* Hero Tab - Fixed Second Position (After Meta Nav) */}
              {segmentRegistry['hero'] && (
                <TabsTrigger 
                  value="hero" 
                  className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                >
                  ID {segmentRegistry['hero']}: Produkt-Hero
                </TabsTrigger>
              )}

              {/* Draggable Middle Tabs - ALL segments EXCEPT Meta Navigation, Hero, and Footer */}
              <SortableContext
                items={tabOrder.filter(tabId => {
                  const segment = pageSegments.find(s => s.id === tabId);
                  // Exclude meta-navigation from draggable section
                  return !segment || segment.type !== 'meta-navigation';
                })}
                strategy={horizontalListSortingStrategy}
              >
                {tabOrder
                  .filter(tabId => {
                    const segment = pageSegments.find(s => s.id === tabId);
                    return !segment || segment.type !== 'meta-navigation'; // Exclude meta-navigation from draggable section
                  })
                  .map((tabId) => {
                  // Static tabs - only show if not deleted (in segmentRegistry)
                  if (tabId === 'tiles' && segmentRegistry['tiles']) {
                    return (
                      <SortableTab key="tiles" id="tiles" value="tiles">
                        ID {segmentRegistry['tiles']}: Tiles
                      </SortableTab>
                    );
                  }
                  if (tabId === 'banner' && segmentRegistry['banner']) {
                    return (
                      <SortableTab key="banner" id="banner" value="banner">
                        ID {segmentRegistry['banner']}: Banner
                      </SortableTab>
                    );
                  }
                  if (tabId === 'solutions' && segmentRegistry['solutions']) {
                    return (
                      <SortableTab key="solutions" id="solutions" value="solutions">
                        ID {segmentRegistry['solutions']}: Image & Text
                      </SortableTab>
                    );
                  }
                  
                  // Dynamic segment tabs (excluding meta-navigation which is already shown)
                  const segment = pageSegments.find(s => s.id === tabId);
                  if (segment) {
                    const segmentIndex = pageSegments.indexOf(segment);
                    const sameTypeBefore = pageSegments.slice(0, segmentIndex).filter(s => s.type === segment.type).length;
                    const displayNumber = sameTypeBefore + 1;
                    
                    let label = '';
                    if (segment.type === 'hero') label = `Hero ${displayNumber}`;
                    if (segment.type === 'product-hero-gallery') label = `Product Gallery ${displayNumber}`;
                    if (segment.type === 'tiles') label = `Tiles ${displayNumber}`;
                    if (segment.type === 'banner') label = `Banner ${displayNumber}`;
                    if (segment.type === 'image-text') label = `Image & Text ${displayNumber}`;
                    if (segment.type === 'feature-overview') label = `Features ${displayNumber}`;
                    
                    const segmentId = segmentRegistry[tabId] || tabId;
                    
                    return (
                      <SortableTab key={tabId} id={tabId} value={tabId}>
                        ID {segmentId}: {label}
                      </SortableTab>
                    );
                  }
                  return null;
                })}
              </SortableContext>

              {/* Footer Tab - Fixed Right (only if not deleted) */}
              {segmentRegistry['footer'] && (
                <TabsTrigger 
                  value="footer"
                  className="text-base font-semibold py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black"
                >
                  ID {segmentRegistry['footer']}: Footer
                </TabsTrigger>
              )}
            </TabsList>
          </DndContext>

          {/* Hero Section Tab */}
          <TabsContent value="hero">
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">Hero Section</CardTitle>
                  <CardDescription className="text-gray-300">Edit the main hero section content</CardDescription>
                  <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                    ID: {segmentRegistry['hero'] || 1}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                    Produkt-Hero Template
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Segment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Hero Segment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the entire Hero section and all its content. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStaticSegment('hero')}
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
          </TabsContent>

          {/* Applications Section Tab */}
          <TabsContent value="tiles">
            <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white">Tiles Template</CardTitle>
                  <CardDescription className="text-gray-300">Edit the tiles section content</CardDescription>
                  <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                    ID: {segmentRegistry['tiles'] || 2}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                    Tiles Template
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Segment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tiles Segment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the entire Tiles section and all its tiles. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStaticSegment('tiles')}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Application Items</h3>
                  <Button
                    onClick={handleAddTile}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Tile
                  </Button>
                </div>
                {applications.map((app, index) => (
                  <Card key={index} className={`border-2 ${index % 2 === 0 ? 'bg-gray-600 border-gray-500' : 'bg-gray-800 border-gray-700'}`}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-4 py-2 ${index % 2 === 0 ? 'bg-[#f9dc24]' : 'bg-orange-400'} text-black text-base font-bold rounded-md shadow-lg`}>
                          Tile {index + 1}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "Tile {index + 1}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTile(index)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                            <Select
                              value={app.ctaStyle || "standard"}
                              onValueChange={(value) => {
                                const newApps = [...applications];
                                newApps[index].ctaStyle = value;
                                setApplications(newApps);
                              }}
                            >
                              <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                                <SelectValue placeholder="Select button style" className="text-black" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="standard" className="text-black">Standard (Yellow with Black Text)</SelectItem>
                                <SelectItem value="technical" className="text-black">Technical (Dark Gray with White Text)</SelectItem>
                              </SelectContent>
                            </Select>
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
          </TabsContent>

          {/* Banner Template Tab */}
          <TabsContent value="banner">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">Banner Template Section</CardTitle>
                    <CardDescription className="text-gray-300">Edit the banner section with title, subtext, images, and button</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['banner'] || 3}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                      Banner Template
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Segment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Banner Segment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the entire Banner section and all its content. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteStaticSegment('banner')}
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
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="banner_title" className="text-white">Section Title</Label>
                  <Input
                    id="banner_title"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g., Automotive International Standards"
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Subtext */}
                <div>
                  <Label htmlFor="banner_subtext" className="text-white">Subtext (Optional)</Label>
                  <Textarea
                    id="banner_subtext"
                    value={bannerSubtext}
                    onChange={(e) => setBannerSubtext(e.target.value)}
                    placeholder="Optional description text (max width 600px, centered)"
                    rows={3}
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Banner Images */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-lg font-semibold">Banner Images</Label>
                    <Button
                      onClick={handleAddBannerImage}
                      className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Image
                    </Button>
                  </div>

                  {bannerImages.map((image, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between mb-4">
                          <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md">
                            Image {index + 1}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "Image {index + 1}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBannerImage(index)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {image.url && (
                          <div className="mb-3">
                            <img 
                              src={image.url} 
                              alt={`Banner ${index + 1}`} 
                              className="w-40 h-24 object-contain rounded-lg border-2 border-gray-600 bg-white p-2"
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor={`banner_image_${index}`} className="text-white">Image File</Label>
                          <Input
                            id={`banner_image_${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBannerImageUpload(e, index)}
                            disabled={uploading}
                            className="border-2 border-gray-600"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`banner_image_alt_${index}`} className="text-white">Alt Text</Label>
                          <Input
                            id={`banner_image_alt_${index}`}
                            value={image.alt}
                            onChange={(e) => {
                              const newImages = [...bannerImages];
                              newImages[index].alt = e.target.value;
                              setBannerImages(newImages);
                            }}
                            placeholder="Image description for accessibility"
                            className="border-2 border-gray-600"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Button Settings */}
                <div className="pt-4 border-t border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Button Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="banner_button_text" className="text-white">Button Text</Label>
                      <Input
                        id="banner_button_text"
                        value={bannerButtonText}
                        onChange={(e) => setBannerButtonText(e.target.value)}
                        placeholder="e.g., View Standards"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="banner_button_link" className="text-white">Button Link</Label>
                      <Input
                        id="banner_button_link"
                        value={bannerButtonLink}
                        onChange={(e) => setBannerButtonLink(e.target.value)}
                        placeholder="/page-url or https://example.com"
                        className="border-2 border-gray-600"
                      />
                      <p className="text-sm text-white mt-1">
                        Use '/path' for internal pages or 'https://...' for external URLs
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="banner_button_style" className="text-white">Button Style</Label>
                      <Select
                        value={bannerButtonStyle}
                        onValueChange={(value) => setBannerButtonStyle(value)}
                      >
                        <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                          <SelectValue placeholder="Select button style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="standard" className="text-black">Standard (Yellow with Black Text)</SelectItem>
                          <SelectItem value="technical" className="text-black">Technical (Dark Gray with White Text)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-600">
                  <Button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const updates = [
                          {
                            page_slug: selectedPage,
                            section_key: "banner_title",
                            content_type: "heading",
                            content_value: bannerTitle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_subtext",
                            content_type: "text",
                            content_value: bannerSubtext,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_images",
                            content_type: "json",
                            content_value: JSON.stringify(bannerImages),
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_button_text",
                            content_type: "text",
                            content_value: bannerButtonText,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_button_link",
                            content_type: "text",
                            content_value: bannerButtonLink,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "banner_button_style",
                            content_type: "text",
                            content_value: bannerButtonStyle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          }
                        ];

                        const { error } = await supabase
                          .from("page_content")
                          .upsert(updates, {
                            onConflict: 'page_slug,section_key'
                          });

                        if (error) throw error;

                        toast.success("Banner content saved successfully!");
                      } catch (error: any) {
                        toast.error("Error saving banner content: " + error.message);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image & Text Template Tab */}
          <TabsContent value="solutions">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">Image & Text Template</CardTitle>
                    <CardDescription className="text-gray-300">Edit image & text section with flexible column layout (1/2/3 columns)</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['solutions'] || 4}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                      Image & Text Template
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Segment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Image & Text Segment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the entire Image & Text section and all its content. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteStaticSegment('solutions')}
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
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="solutions_title" className="text-white">Section Title</Label>
                  <Input
                    id="solutions_title"
                    value={solutionsTitle}
                    onChange={(e) => setSolutionsTitle(e.target.value)}
                    placeholder="e.g., Automotive Camera Test Solutions"
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Subtext */}
                <div>
                  <Label htmlFor="solutions_subtext" className="text-white">Subtext (Optional)</Label>
                  <Textarea
                    id="solutions_subtext"
                    value={solutionsSubtext}
                    onChange={(e) => setSolutionsSubtext(e.target.value)}
                    placeholder="Optional description text below the title"
                    rows={3}
                    className="border-2 border-gray-600"
                  />
                </div>

                {/* Layout Selection */}
                <div>
                  <Label htmlFor="solutions_layout" className="text-white">Column Layout</Label>
                  <Select
                    value={solutionsLayout}
                    onValueChange={(value) => setSolutionsLayout(value)}
                  >
                    <SelectTrigger className="border-2 border-gray-600 bg-white text-black">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1-col" className="text-black">1 Column (Full Width)</SelectItem>
                      <SelectItem value="2-col" className="text-black">2 Columns</SelectItem>
                      <SelectItem value="3-col" className="text-black">3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Solution Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-lg font-semibold">Solution Items</Label>
                    <Button
                      onClick={handleAddSolutionItem}
                      className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {solutionsItems.map((item, index) => (
                    <Card key={index} className="bg-gray-700 border-gray-600">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between mb-4">
                          <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md">
                            Item {index + 1}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "Item {index + 1}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSolutionItem(index)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <Label htmlFor={`solution_image_${index}`} className="text-white">Image (Optional - Full Width)</Label>
                          {item.imageUrl && (
                            <div className="mb-3">
                              <img 
                                src={item.imageUrl} 
                                alt={`Solution ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-600"
                              />
                            </div>
                          )}
                          <Input
                            id={`solution_image_${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSolutionImageUpload(e, index)}
                            disabled={uploading}
                            className="border-2 border-gray-600"
                          />
                        </div>

                        {/* Title */}
                        <div>
                          <Label htmlFor={`solution_title_${index}`} className="text-white">Title</Label>
                          <Input
                            id={`solution_title_${index}`}
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...solutionsItems];
                              newItems[index].title = e.target.value;
                              setSolutionsItems(newItems);
                            }}
                            placeholder="e.g., In-Cabin Testing"
                            className="border-2 border-gray-600"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <Label htmlFor={`solution_desc_${index}`} className="text-white">Description</Label>
                          <Textarea
                            id={`solution_desc_${index}`}
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...solutionsItems];
                              newItems[index].description = e.target.value;
                              setSolutionsItems(newItems);
                            }}
                            rows={6}
                            placeholder="Detailed description..."
                            className="border-2 border-gray-600"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-600">
                  <Button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const updates = [
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_title",
                            content_type: "heading",
                            content_value: solutionsTitle,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_subtext",
                            content_type: "text",
                            content_value: solutionsSubtext,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_layout",
                            content_type: "text",
                            content_value: solutionsLayout,
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          },
                          {
                            page_slug: selectedPage,
                            section_key: "solutions_items",
                            content_type: "json",
                            content_value: JSON.stringify(solutionsItems),
                            updated_at: new Date().toISOString(),
                            updated_by: user?.id
                          }
                        ];

                        const { error } = await supabase
                          .from("page_content")
                          .upsert(updates, {
                            onConflict: 'page_slug,section_key'
                          });

                        if (error) throw error;

                        toast.success("Image & Text content saved successfully!");
                      } catch (error: any) {
                        toast.error("Error saving image & text content: " + error.message);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">Footer Section</CardTitle>
                    <CardDescription className="text-gray-300">Edit footer content for the {selectedPage} page</CardDescription>
                    <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                      ID: {segmentRegistry['footer'] || 7}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vision CTA Section */}
                <div className="border-b border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">1. Vision CTA Section</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="footer_cta_title" className="text-white">CTA Title</Label>
                      <Input
                        id="footer_cta_title"
                        value={footerCtaTitle}
                        onChange={(e) => setFooterCtaTitle(e.target.value)}
                        placeholder="e.g., Charts that help you win"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_cta_description" className="text-white">CTA Description</Label>
                      <Textarea
                        id="footer_cta_description"
                        value={footerCtaDescription}
                        onChange={(e) => setFooterCtaDescription(e.target.value)}
                        rows={3}
                        placeholder="Describe your vision..."
                        className="border-2 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="border-b border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">2. Contact Section</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="footer_contact_headline" className="text-white">Contact Headline (Line 1)</Label>
                      <Input
                        id="footer_contact_headline"
                        value={footerContactHeadline}
                        onChange={(e) => setFooterContactHeadline(e.target.value)}
                        placeholder="e.g., Need help choosing"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_contact_subline" className="text-white">Contact Headline (Line 2)</Label>
                      <Input
                        id="footer_contact_subline"
                        value={footerContactSubline}
                        onChange={(e) => setFooterContactSubline(e.target.value)}
                        placeholder="e.g., the right test chart?"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_contact_description" className="text-white">Contact Description</Label>
                      <Textarea
                        id="footer_contact_description"
                        value={footerContactDescription}
                        onChange={(e) => setFooterContactDescription(e.target.value)}
                        rows={3}
                        placeholder="Contact description..."
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_button_text" className="text-white">Button Text</Label>
                      <Input
                        id="footer_button_text"
                        value={footerButtonText}
                        onChange={(e) => setFooterButtonText(e.target.value)}
                        placeholder="e.g., Get in Touch"
                        className="border-2 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Team Quote Section */}
                <div className="pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">3. Team Quote Section</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Team Member Photo</Label>
                      <div className="flex gap-2 items-start">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFooterTeamImageUpload}
                          disabled={uploading}
                          className="border-2 border-gray-600"
                        />
                      </div>
                      {footerTeamImageUrl && (
                        <div className="mt-2 relative inline-block">
                          <img 
                            src={footerTeamImageUrl} 
                            alt="Team member" 
                            className="w-32 h-32 object-cover rounded border"
                          />
                          <button
                            onClick={() => setFooterTeamImageUrl('')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="footer_team_quote" className="text-white">Team Quote</Label>
                      <Textarea
                        id="footer_team_quote"
                        value={footerTeamQuote}
                        onChange={(e) => setFooterTeamQuote(e.target.value)}
                        rows={3}
                        placeholder="Team member's quote..."
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_team_name" className="text-white">Team Member Name</Label>
                      <Input
                        id="footer_team_name"
                        value={footerTeamName}
                        onChange={(e) => setFooterTeamName(e.target.value)}
                        placeholder="e.g., Laura Neumann"
                        className="border-2 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer_team_title" className="text-white">Team Member Title</Label>
                      <Input
                        id="footer_team_title"
                        value={footerTeamTitle}
                        onChange={(e) => setFooterTeamTitle(e.target.value)}
                        placeholder="e.g., Head of Optical Systems"
                        className="border-2 border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-600">
                  <Button
                    onClick={handleSaveFooter}
                    disabled={saving}
                    className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Footer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dynamic Segment Tabs */}
          {pageSegments.map((segment, index) => (
            <TabsContent key={`segment-content-${segment.id}`} value={segment.id}>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">
                        {segment.type === 'hero' && `Hero Section ${segment.position + 1}`}
                        {segment.type === 'meta-navigation' && `Meta Navigation ${segment.position + 1}`}
                        {segment.type === 'product-hero-gallery' && `Product Hero Gallery ${segment.position + 1}`}
                        {segment.type === 'tiles' && `Tiles Section ${segment.position + 1}`}
                        {segment.type === 'banner' && `Banner Section ${segment.position + 1}`}
                        {segment.type === 'image-text' && `Image & Text Section ${segment.position + 1}`}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Edit this {segment.type} segment
                      </CardDescription>
                      <div className="mt-3 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm font-mono text-yellow-400 inline-block">
                        ID: {segmentRegistry[segment.id] || segment.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-[#f9dc24] text-black text-sm font-medium rounded-md">
                        {segment.type === 'hero' && 'Produkt-Hero Template'}
                        {segment.type === 'meta-navigation' && 'Meta Navigation'}
                        {segment.type === 'product-hero-gallery' && 'Product Hero Gallery'}
                        {segment.type === 'tiles' && 'Tiles Template'}
                        {segment.type === 'banner' && 'Banner Template'}
                        {segment.type === 'image-text' && 'Image & Text Template'}
                        {segment.type === 'feature-overview' && 'Feature Overview Template'}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Segment
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this segment. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSegment(segment.id)}
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
                  {segment.type === 'meta-navigation' && (() => {
                    // Build available segments list with their titles
                    const availableSegments = [];
                    
                    // Hero segment
                    if (segmentRegistry['hero']) {
                      availableSegments.push({
                        id: 'hero',
                        title: content.hero_title || 'Hero Section'
                      });
                    }
                    
                    // Tiles segment
                    if (segmentRegistry['tiles']) {
                      availableSegments.push({
                        id: 'tiles',
                        title: content.applications_title || 'Tiles Section'
                      });
                    }
                    
                    // Banner segment
                    if (segmentRegistry['banner']) {
                      availableSegments.push({
                        id: 'banner',
                        title: bannerTitle || 'Banner Section'
                      });
                    }
                    
                    // Solutions/Image & Text segment
                    if (segmentRegistry['solutions']) {
                      availableSegments.push({
                        id: 'solutions',
                        title: solutionsTitle || 'Image & Text Section'
                      });
                    }
                    
                    // Dynamic segments
                    pageSegments.forEach((seg) => {
                      if (seg.type !== 'meta-navigation' && seg.data?.title) {
                        availableSegments.push({
                          id: seg.id,
                          title: seg.data.title
                        });
                      }
                    });
                    
                    // Footer segment
                    if (segmentRegistry['footer']) {
                      availableSegments.push({
                        id: 'footer',
                        title: 'Footer'
                      });
                    }
                    
                    return (
                      <MetaNavigationEditor
                        data={segment.data}
                        availableSegments={availableSegments}
                        onChange={(newData) => {
                          const newSegments = [...pageSegments];
                          newSegments[index].data = newData;
                          setPageSegments(newSegments);
                        }}
                        onSave={() => handleSaveSegments()}
                      />
                    );
                  })()}
                  {segment.type === 'product-hero-gallery' && (
                    <ProductHeroGalleryEditor
                      data={segment.data}
                      onChange={(newData) => {
                        const newSegments = [...pageSegments];
                        newSegments[index].data = newData;
                        setPageSegments(newSegments);
                      }}
                      onSave={() => handleSaveSegments()}
                      pageSlug={selectedPage}
                      segmentId={parseInt(segment.id)}
                    />
                  )}
                  {segment.type === 'tiles' && (() => {
                    // Initialize data if missing
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('tiles');
                    }
                    if (!segment.data.items) {
                      segment.data.items = [];
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`segment_${index}_title`} className="text-white">Section Title</Label>
                          <Input
                            id={`segment_${index}_title`}
                            value={segment.data.title || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.title = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            className="border-2 border-gray-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`segment_${index}_description`} className="text-white">Section Description</Label>
                          <Textarea
                            id={`segment_${index}_description`}
                            value={segment.data.description || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.description = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            rows={3}
                            className="border-2 border-gray-600"
                          />
                        </div>

                        {/* Tiles */}
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Tiles</h3>
                            <Button
                              onClick={() => {
                                const newSegments = [...pageSegments];
                                if (!newSegments[index].data.items) {
                                  newSegments[index].data.items = [];
                                }
                                newSegments[index].data.items.push({
                                  title: 'New Application',
                                  description: 'Add description here...',
                                  ctaLink: '',
                                  ctaStyle: 'standard',
                                  ctaText: 'Learn More',
                                  imageUrl: '',
                                  icon: ''
                                });
                                setPageSegments(newSegments);
                                toast.success("New tile added! Don't forget to save changes.");
                              }}
                              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add New Tile
                            </Button>
                          </div>
                          {segment.data.items.map((tile: any, tileIndex: number) => (
                          <Card key={tileIndex} className={`border-2 ${tileIndex % 2 === 0 ? 'bg-gray-600 border-gray-500' : 'bg-gray-800 border-gray-700'}`}>
                            <CardContent className="pt-6 space-y-3">
                              <div className="flex items-center justify-between mb-4">
                                <div className={`px-4 py-2 ${tileIndex % 2 === 0 ? 'bg-[#f9dc24]' : 'bg-orange-400'} text-black text-base font-bold rounded-md shadow-lg`}>
                                  Tile {tileIndex + 1}
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="flex items-center gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete "Tile {tileIndex + 1}". This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          const newSegments = [...pageSegments];
                                          newSegments[index].data.items = newSegments[index].data.items.filter((_: any, i: number) => i !== tileIndex);
                                          setPageSegments(newSegments);
                                          toast.success("Tile deleted! Don't forget to save changes.");
                                        }}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              
                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_title`} className="text-white">Title</Label>
                                <Input
                                  id={`tile_${index}_${tileIndex}_title`}
                                  value={tile.title}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].title = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  className="border-2 border-gray-600"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_description`} className="text-white">Description</Label>
                                <Textarea
                                  id={`tile_${index}_${tileIndex}_description`}
                                  value={tile.description}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].description = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  rows={3}
                                  className="border-2 border-gray-600"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_cta_text`} className="text-white">Button Text</Label>
                                <Input
                                  id={`tile_${index}_${tileIndex}_cta_text`}
                                  value={tile.ctaText || 'Learn More'}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].ctaText = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  className="border-2 border-gray-600"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_cta_link`} className="text-white">Button Link</Label>
                                <Input
                                  id={`tile_${index}_${tileIndex}_cta_link`}
                                  value={tile.ctaLink || ''}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].ctaLink = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  placeholder="/page, #section, or https://..."
                                  className="border-2 border-gray-600"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`tile_${index}_${tileIndex}_cta_style`} className="text-white">Button Style</Label>
                                <select
                                  id={`tile_${index}_${tileIndex}_cta_style`}
                                  value={tile.ctaStyle || 'standard'}
                                  onChange={(e) => {
                                    const newSegments = [...pageSegments];
                                    newSegments[index].data.items[tileIndex].ctaStyle = e.target.value;
                                    setPageSegments(newSegments);
                                  }}
                                  className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f9dc24] focus:border-[#f9dc24] cursor-pointer"
                                >
                                  <option value="standard">Standard (Yellow with Black Text)</option>
                                  <option value="technical">Technical (Dark Gray with White Text)</option>
                                </select>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-600">
                        <Button
                          onClick={async () => {
                            setSaving(true);
    try {
      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: selectedPage,
          section_key: "page_segments",
                                  content_type: "json",
                                  content_value: JSON.stringify(pageSegments),
                                  updated_at: new Date().toISOString(),
                                  updated_by: user?.id
                                }, {
                                  onConflict: 'page_slug,section_key'
                                });

                              if (error) throw error;
                              toast.success("Tiles segment saved successfully!");
                            } catch (error: any) {
                              toast.error("Error saving segment: " + error.message);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                          className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  );
                  })()}

                  {segment.type === 'image-text' && (() => {
                    if (!segment.data) {
                      segment.data = getDefaultSegmentData('image-text');
                    }
                    if (!segment.data.items) {
                      segment.data.items = [];
                    }
                    
                    return (
                      <div className="space-y-4">
                        {/* Hero Image Upload */}
                        <div>
                          <Label className="text-white">Hero Image (optional)</Label>
                          <div className="flex gap-2 items-start">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageTextHeroImageUpload(index, e)}
                              disabled={uploading}
                              className="border-2 border-gray-600"
                            />
                          </div>
                          {segment.data.heroImageUrl && (
                            <div className="mt-2 relative inline-block">
                              <img 
                                src={segment.data.heroImageUrl} 
                                alt="Hero" 
                                className="w-32 h-32 object-cover rounded border"
                              />
                              <button
                                onClick={() => {
                                  const newSegments = [...pageSegments];
                                  newSegments[index].data.heroImageUrl = '';
                                  setPageSegments(newSegments);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`segment_${index}_title`} className="text-white">Section Title</Label>
                          <Input
                            id={`segment_${index}_title`}
                            value={segment.data.title || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.title = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            className="border-2 border-gray-600"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`segment_${index}_subtext`} className="text-white">Section Subtext (optional)</Label>
                          <Textarea
                            id={`segment_${index}_subtext`}
                            value={segment.data.subtext || ''}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.subtext = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            rows={2}
                            className="border-2 border-gray-600"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`segment_${index}_layout`} className="text-white">Layout</Label>
                          <select
                            id={`segment_${index}_layout`}
                            value={segment.data.layout || '2-col'}
                            onChange={(e) => {
                              const newSegments = [...pageSegments];
                              newSegments[index].data.layout = e.target.value;
                              setPageSegments(newSegments);
                            }}
                            className="w-full pl-3 pr-12 py-2 bg-white text-black border-2 border-gray-600 rounded-md"
                          >
                            <option value="1-col">1 Column (Full Width)</option>
                            <option value="2-col">2 Columns</option>
                            <option value="3-col">3 Columns</option>
                          </select>
                        </div>

                        {/* Items */}
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Items</h3>
                            <Button
                              onClick={() => {
                                const newSegments = [...pageSegments];
                                if (!newSegments[index].data.items) {
                                  newSegments[index].data.items = [];
                                }
                                newSegments[index].data.items.push({
                                  title: 'New Item',
                                  description: 'Add description here...',
                                  imageUrl: ''
                                });
                                setPageSegments(newSegments);
                                toast.success("New item added! Don't forget to save changes.");
                              }}
                              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add Item
                            </Button>
                          </div>
                          {segment.data.items.map((item: any, itemIndex: number) => (
                            <Card key={itemIndex} className="border-2 bg-gray-600 border-gray-500">
                              <CardContent className="pt-6 space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="px-4 py-2 bg-[#f9dc24] text-black text-base font-bold rounded-md shadow-lg">
                                    Item {itemIndex + 1}
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data.items.splice(itemIndex, 1);
                                      setPageSegments(newSegments);
                                      toast.success("Item deleted! Don't forget to save changes.");
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>

                                <div>
                                  <Label className="text-white">Title</Label>
                                  <Input
                                    value={item.title || ''}
                                    onChange={(e) => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data.items[itemIndex].title = e.target.value;
                                      setPageSegments(newSegments);
                                    }}
                                    className="border-2 border-gray-600"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white">Description</Label>
                                  <Textarea
                                    value={item.description || ''}
                                    onChange={(e) => {
                                      const newSegments = [...pageSegments];
                                      newSegments[index].data.items[itemIndex].description = e.target.value;
                                      setPageSegments(newSegments);
                                    }}
                                    rows={4}
                                    className="border-2 border-gray-600"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white">Item Image (optional)</Label>
                                  <div className="flex gap-2 items-start">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageTextItemImageUpload(index, itemIndex, e)}
                                      disabled={uploading}
                                      className="border-2 border-gray-600"
                                    />
                                  </div>
                                   {item.imageUrl && (
                                    <div className="mt-2">
                                      <img 
                                        src={item.imageUrl} 
                                        alt={item.title} 
                                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-600"
                                      />
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-600">
                          <Button
                            onClick={async () => {
                              setSaving(true);
                              try {
                                const { error } = await supabase
                                  .from("page_content")
                                  .upsert({
                                    page_slug: selectedPage,
                                    section_key: "page_segments",
                                    content_type: "json",
                                    content_value: JSON.stringify(pageSegments),
                                    updated_at: new Date().toISOString(),
                                    updated_by: user?.id
                                  }, {
                                    onConflict: 'page_slug,section_key'
                                  });

                                if (error) throw error;
                                toast.success("Image & Text segment saved successfully!");
                              } catch (error: any) {
                                toast.error("Error saving segment: " + error.message);
                              } finally {
                                setSaving(false);
                              }
                            }}
                            disabled={saving}
                            className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  {segment.type === 'feature-overview' && (
                    <FeatureOverviewEditor
                      segmentId={parseInt(segment.id)}
                      pageSlug={selectedPage}
                    />
                  )}

                  {segment.type !== 'tiles' && segment.type !== 'image-text' && segment.type !== 'feature-overview' && (
                    <div className="p-8 bg-gray-700 rounded-lg border border-gray-600">
                      <p className="text-white text-center">
                        Segment editor for {segment.type} coming soon. This segment has been saved.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
