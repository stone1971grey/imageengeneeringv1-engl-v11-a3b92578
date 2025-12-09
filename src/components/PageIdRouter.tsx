import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * PageIdRouter - Routes numeric page IDs to their hierarchical URLs with language prefix
 * Example: /en/3 -> /en/your-solution/photography
 * 
 * Now simplified for Universal Dynamic Page System - no component mapping needed
 */
const PageIdRouter = () => {
  const { pageId, lang } = useParams<{ pageId: string; lang: string }>();
  const { language } = useLanguage();
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

      console.log(`[PageIdRouter] Looking up page_id: ${numericPageId}`);
      
      // Fetch page_slug and parent_slug from page_registry based on page_id
      const { data, error } = await supabase
        .from("page_registry")
        .select("page_slug, parent_slug")
        .eq("page_id", numericPageId)
        .maybeSingle();

      console.log(`[PageIdRouter] Database response:`, { data, error });

      if (error || !data) {
        console.error("[PageIdRouter] Error fetching page or page not found:", error);
        
        // Hard fallback for legacy VCX WebCam Service page (Page ID 287)
        if (numericPageId === 287) {
          const legacyUrl = `/${lang || language}/your-solution/web-camera/vcx-webcam-service`;
          console.warn("[PageIdRouter] Falling back to hardcoded URL for Page ID 287:", legacyUrl);
          setRedirectUrl(legacyUrl);
        } else {
          setRedirectUrl(null);
        }
      } else {
        // Build hierarchical URL with language prefix
        let constructedUrl = '';
        const langPrefix = `/${lang || language}`;
        
        // If page_slug already contains slashes, it's already hierarchical - use it directly
        if (data.page_slug.includes('/')) {
          constructedUrl = `${langPrefix}/${data.page_slug}`;
          console.log(`[PageIdRouter] Using hierarchical page_slug directly:`, constructedUrl);
        } else if (data.parent_slug && data.parent_slug !== 'index') {
          // Legacy handling for flat slugs with parent_slug (skip 'index' as it's the root)
          if (data.parent_slug === "your-solution") {
            constructedUrl = `${langPrefix}/your-solution/${data.page_slug}`;
          } else if (data.parent_slug === "automotive") {
            constructedUrl = `${langPrefix}/your-solution/automotive/${data.page_slug}`;
          } else if (data.parent_slug === "scanners-archiving") {
            constructedUrl = `${langPrefix}/your-solution/scanners-archiving/${data.page_slug}`;
          } else if (data.parent_slug === "web-camera") {
            constructedUrl = `${langPrefix}/your-solution/web-camera/${data.page_slug}`;
          } else if (data.parent_slug === "machine-vision") {
            constructedUrl = `${langPrefix}/your-solution/machine-vision/${data.page_slug}`;
          } else if (data.parent_slug === "mobile-phone") {
            constructedUrl = `${langPrefix}/your-solution/mobile-phone/${data.page_slug}`;
          } else if (data.parent_slug === "medical-endoscopy") {
            constructedUrl = `${langPrefix}/your-solution/medical-endoscopy/${data.page_slug}`;
          } else {
            // For products or other hierarchies
            constructedUrl = `${langPrefix}/${data.parent_slug}/${data.page_slug}`;
          }
        } else {
          // No parent or parent is 'index' - top-level page
          constructedUrl = `${langPrefix}/${data.page_slug}`;
        }
        
        console.log(`[PageIdRouter] Redirecting to: ${constructedUrl}`);
        setRedirectUrl(constructedUrl);
      }

      setLoading(false);
    };

    fetchPageData();
  }, [pageId, lang, language]);

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
