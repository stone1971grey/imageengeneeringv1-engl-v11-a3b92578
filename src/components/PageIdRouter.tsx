import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DynamicCMSPage from "@/components/DynamicCMSPage";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/NotFound";

const PageIdRouter = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const [pageSlug, setPageSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!pageId) {
        setError(true);
        setLoading(false);
        return;
      }

      const numericPageId = parseInt(pageId, 10);

      if (isNaN(numericPageId)) {
        setError(true);
        setLoading(false);
        return;
      }

      // Fetch page_slug from page_registry based on page_id
      const { data, error: fetchError } = await supabase
        .from("page_registry")
        .select("page_slug")
        .eq("page_id", numericPageId)
        .maybeSingle();

      if (fetchError || !data) {
        console.error("Error fetching page:", fetchError);
        setError(true);
      } else {
        setPageSlug(data.page_slug);
      }

      setLoading(false);
    };

    fetchPageData();
  }, [pageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !pageSlug) {
    return <NotFound />;
  }

  return <DynamicCMSPage pageSlug={pageSlug} />;
};

export default PageIdRouter;
