import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isEditor: boolean;
  allowedPages: string[];
  loading: boolean;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear local storage first to prevent stale session issues
      localStorage.removeItem('sb-afrcagkprhtvvucukubf-auth-token');
      sessionStorage.removeItem('admin_selected_page');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always navigate to auth, even if signOut fails
      navigate('/auth');
    }
  };

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
      // Get editor's allowed pages (content editors like 'news', 'products')
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
      console.log('[AdminDashboard] Editor allowedPages loaded:', pages);
      
      setIsEditor(true);
      setIsAdmin(false);
      setAllowedPages(pages);
      
      // For editors: don't redirect - let them see the Welcome page
      // The Welcome page shows them which content editors (news, products, etc.) they can access
      // Special page_slugs like '__global__', '__all__', 'news', 'products' are NOT CMS pages to navigate to
      
      setLoading(false);
      return;
    }

    // No valid role found
    toast.error("You don't have admin or editor access");
    navigate("/");
  };

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

  // Function to add a page to allowedPages (e.g., when editor creates a new page)
  const addAllowedPage = (pageSlug: string) => {
    setAllowedPages(prev => {
      if (prev.includes(pageSlug)) return prev;
      return [...prev, pageSlug];
    });
  };

  return {
    user,
    session,
    isAdmin,
    isEditor,
    allowedPages,
    loading,
    handleLogout,
    addAllowedPage
  };
};
