import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const SegmentDebugView = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [segmentData, setSegmentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadSegmentData(selectedPage);
    }
  }, [selectedPage]);

  const loadPages = async () => {
    const { data } = await supabase
      .from("page_registry")
      .select("page_slug, page_title")
      .order("page_slug");

    if (data) {
      setPages(data);
    }
  };

  const loadSegmentData = async (pageSlug: string) => {
    setLoading(true);
    try {
      // Load page_segments
      const { data: pageSegments } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", "page_segments")
        .single();

      // Load all full_hero_* entries for this page
      const { data: fullHeroEntries } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .like("section_key", "full_hero_%");

      const segments = pageSegments ? JSON.parse(pageSegments.content_value) : [];
      const heroes: Record<string, any> = {};
      
      fullHeroEntries?.forEach((entry) => {
        const segId = entry.section_key.split("full_hero_")[1];
        heroes[segId] = JSON.parse(entry.content_value);
      });

      setSegmentData({ segments, fullHeroEntries: heroes });
    } catch (error) {
      console.error("Error loading segment data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-6 py-24">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Segment Data Inspector</CardTitle>
            <CardDescription>
              View raw segment data for any page to debug Full-Hero and other segments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Page</label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a page..." />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.page_slug} value={page.page_slug}>
                      {page.page_title} ({page.page_slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!loading && segmentData && (
              <div className="space-y-6">
                {/* page_segments Display */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">page_segments Array:</h3>
                  <div className="space-y-3">
                    {segmentData.segments.map((seg: any, idx: number) => (
                      <Card key={idx} className={seg.type === "full-hero" ? "border-yellow-400 border-2" : ""}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              ID: {seg.id || seg.segment_key}
                            </span>
                            <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">
                              Type: {seg.type}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {seg.type === "full-hero" && (
                            <div className="space-y-2 bg-yellow-50 p-3 rounded">
                              <div className="font-medium text-sm text-yellow-900">Full Hero Data:</div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">titleLine1:</span>{" "}
                                  {seg.data?.titleLine1 || <span className="text-red-500">(empty)</span>}
                                </div>
                                <div>
                                  <span className="font-medium">titleLine2:</span>{" "}
                                  {seg.data?.titleLine2 || <span className="text-red-500">(empty)</span>}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">subtitle:</span>{" "}
                                  {seg.data?.subtitle || <span className="text-red-500">(empty)</span>}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">imageUrl:</span>{" "}
                                  {seg.data?.imageUrl ? (
                                    <a 
                                      href={seg.data.imageUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline break-all"
                                    >
                                      {seg.data.imageUrl}
                                    </a>
                                  ) : (
                                    <span className="text-red-500 font-bold">(EMPTY - NO IMAGE!)</span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-medium">backgroundType:</span>{" "}
                                  {seg.data?.backgroundType || "image"}
                                </div>
                                <div>
                                  <span className="font-medium">button1Text:</span>{" "}
                                  {seg.data?.button1Text || <span className="text-red-500">(empty)</span>}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {seg.type !== "full-hero" && (
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(seg.data, null, 2)}
                            </pre>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* full_hero_* Entries Display */}
                {Object.keys(segmentData.fullHeroEntries).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Separate full_hero_* Entries (Legacy):</h3>
                    <div className="space-y-3">
                      {Object.entries(segmentData.fullHeroEntries).map(([segId, data]: [string, any]) => (
                        <Card key={segId} className="border-orange-400 border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">
                              <span className="font-mono text-sm bg-orange-100 px-2 py-1 rounded">
                                full_hero_{segId}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 bg-orange-50 p-3 rounded text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-medium">titleLine1:</span> {data.titleLine1}
                                </div>
                                <div>
                                  <span className="font-medium">titleLine2:</span> {data.titleLine2}
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">imageUrl:</span>{" "}
                                  {data.imageUrl ? (
                                    <a 
                                      href={data.imageUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline break-all"
                                    >
                                      {data.imageUrl}
                                    </a>
                                  ) : (
                                    <span className="text-red-500">(empty)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SegmentDebugView;
