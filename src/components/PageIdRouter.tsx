import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Import all CMS-enabled pages
import Photography from "@/pages/Photography";
import ScannersArchiving from "@/pages/ScannersArchiving";
import MedicalEndoscopy from "@/pages/MedicalEndoscopy";
import MachineVision from "@/pages/MachineVision";
import WebCamera from "@/pages/WebCamera";
import UniversalTestTarget from "@/pages/UniversalTestTarget";
import ProductIQLED from "@/pages/ProductIQLED";
import ProductIEEEP2020 from "@/pages/ProductIEEEP2020";

// Page ID to Component mapping (must match page_registry table)
const pageComponentMap: Record<number, React.ComponentType> = {
  9: Photography,           // photography
  10: ScannersArchiving,    // scanners-archiving
  11: MedicalEndoscopy,     // medical-endoscopy
  12: WebCamera,            // web-camera
  13: MachineVision,        // machine-vision
  21: ProductIQLED,         // iq-led
  220: ProductIEEEP2020,    // ieee-p2020
  261: UniversalTestTarget, // universal-test-target
};

const PageIdRouter = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageSlug, setPageSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageSlug = async () => {
      if (!pageId) {
        setLoading(false);
        return;
      }

      const numericPageId = parseInt(pageId, 10);

      if (isNaN(numericPageId)) {
        setLoading(false);
        return;
      }

      // Fetch page_slug from page_registry based on page_id
      const { data, error } = await supabase
        .from("page_registry")
        .select("page_slug")
        .eq("page_id", numericPageId)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching page:", error);
        setPageSlug(null);
      } else {
        setPageSlug(data.page_slug);
      }

      setLoading(false);
    };

    fetchPageSlug();
  }, [pageId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!pageId || !pageSlug) {
    return <Navigate to="/not-found" replace />;
  }

  const numericPageId = parseInt(pageId, 10);
  const PageComponent = pageComponentMap[numericPageId];

  if (!PageComponent) {
    return <Navigate to="/not-found" replace />;
  }

  return <PageComponent />;
};

export default PageIdRouter;
