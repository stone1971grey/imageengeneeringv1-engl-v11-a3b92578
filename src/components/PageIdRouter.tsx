import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * PageIdRouter - Routes numeric page IDs to their hierarchical URLs
 * Example: /3 -> /your-solution/photography
 * 
 * Now simplified for Universal Dynamic Page System - no component mapping needed
 */
const PageIdRouter = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
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

      // Fetch page_slug and parent_slug from page_registry based on page_id
      const { data, error } = await supabase
        .from("page_registry")
        .select("page_slug, parent_slug")
        .eq("page_id", numericPageId)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching page:", error);
        setRedirectUrl(null);
      } else {
        // Build hierarchical URL based on parent structure
        if (data.parent_slug) {
          if (data.parent_slug === "your-solution") {
            setRedirectUrl(`/your-solution/${data.page_slug}`);
          } else if (data.parent_slug === "automotive") {
            setRedirectUrl(`/your-solution/automotive/${data.page_slug}`);
          } else if (data.parent_slug === "scanners-archiving") {
            setRedirectUrl(`/your-solution/scanners-archiving/${data.page_slug}`);
          } else if (data.parent_slug === "web-camera") {
            setRedirectUrl(`/your-solution/web-camera/${data.page_slug}`);
          } else if (data.parent_slug === "machine-vision") {
            setRedirectUrl(`/your-solution/machine-vision/${data.page_slug}`);
          } else if (data.parent_slug === "mobile-phone") {
            setRedirectUrl(`/your-solution/mobile-phone/${data.page_slug}`);
          } else if (data.parent_slug === "medical-endoscopy") {
            setRedirectUrl(`/your-solution/medical-endoscopy/${data.page_slug}`);
          } else {
            // For products or other hierarchies
            setRedirectUrl(`/${data.parent_slug}/${data.page_slug}`);
          }
        } else {
          // No parent - top-level page
          setRedirectUrl(`/${data.page_slug}`);
        }
      }

      setLoading(false);
    };

    fetchPageData();
  }, [pageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f9dc24] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!redirectUrl) {
    return <Navigate to="/not-found" replace />;
  }

  return <Navigate to={redirectUrl} replace />;
};

export default PageIdRouter;
