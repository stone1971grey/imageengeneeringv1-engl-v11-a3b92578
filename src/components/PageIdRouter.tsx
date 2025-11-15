import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CMSPage from "@/pages/CMSPage";

// Import legacy CMS-enabled pages (for backwards compatibility)
import Photography from "@/pages/Photography";
import ScannersArchiving from "@/pages/ScannersArchiving";
import MedicalEndoscopy from "@/pages/MedicalEndoscopy";
import MachineVision from "@/pages/MachineVision";
import WebCamera from "@/pages/WebCamera";

// Legacy page ID to Component mapping (for backwards compatibility)
const legacyPageComponentMap: Record<number, React.ComponentType> = {
  1: Photography,
  2: ScannersArchiving,
  3: MedicalEndoscopy,
  4: MachineVision,
  5: WebCamera,
};

const PageIdRouter = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageData, setPageData] = useState<{ slug: string; parentSlug: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!pageId) {
        setLoading(false);
        return;
      }

      const numericPageId = parseInt(pageId, 10);

      if (isNaN(numericPageId)) {
        setLoading(false);
        return;
      }

      // Fetch page data from page_registry based on page_id
      const { data, error } = await supabase
        .from("page_registry")
        .select("page_slug, parent_slug")
        .eq("page_id", numericPageId)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching page:", error);
        setPageData(null);
      } else {
        setPageData({
          slug: data.page_slug,
          parentSlug: data.parent_slug
        });
      }

      setLoading(false);
    };

    fetchPageData();
  }, [pageId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!pageId || !pageData) {
    return <Navigate to="/not-found" replace />;
  }

  const numericPageId = parseInt(pageId, 10);
  
  // Check if this is a legacy page with a specific component
  const LegacyPageComponent = legacyPageComponentMap[numericPageId];
  
  if (LegacyPageComponent) {
    // Use legacy component for backwards compatibility
    return <LegacyPageComponent />;
  }

  // Use universal CMSPage component for all new CMS pages
  return <CMSPage />;
};

export default PageIdRouter;
