import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const FullHeroMigration = () => {
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runMigration = async () => {
    setMigrating(true);
    setResults([]);
    const migrationResults: any[] = [];

    try {
      // 1. Alle full_hero_* Einträge aus page_content holen
      const { data: fullHeroEntries, error: fetchError } = await supabase
        .from("page_content")
        .select("*")
        .like("section_key", "full_hero_%");

      if (fetchError) throw fetchError;

      if (!fullHeroEntries || fullHeroEntries.length === 0) {
        toast.info("No full_hero_* entries found to migrate");
        setMigrating(false);
        return;
      }

      // 2. Für jeden full_hero_* Eintrag
      for (const heroEntry of fullHeroEntries) {
        const segmentId = heroEntry.section_key.split("full_hero_")[1];
        const pageSlug = heroEntry.page_slug;
        const heroData = JSON.parse(heroEntry.content_value);

        // 3. page_segments für diese Seite laden
        const { data: pageContentData, error: loadError } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("section_key", "page_segments")
          .single();

        if (loadError || !pageContentData) {
          migrationResults.push({
            page: pageSlug,
            segment: segmentId,
            status: "error",
            message: "page_segments not found"
          });
          continue;
        }

        try {
          const segments = JSON.parse(pageContentData.content_value);
          let updated = false;

          // 4. Full-Hero Segment finden und aktualisieren
          const updatedSegments = segments.map((seg: any) => {
            if (seg.type === "full-hero" && String(seg.id) === String(segmentId)) {
              updated = true;
              return {
                ...seg,
                data: {
                  ...seg.data,
                  ...heroData // Merge: heroData überschreibt leere Felder in seg.data
                }
              };
            }
            return seg;
          });

          if (!updated) {
            migrationResults.push({
              page: pageSlug,
              segment: segmentId,
              status: "skipped",
              message: "Full-Hero segment not found in page_segments"
            });
            continue;
          }

          // 5. Aktualisierte page_segments speichern
          const { error: updateError } = await supabase
            .from("page_content")
            .update({
              content_value: JSON.stringify(updatedSegments),
            })
            .eq("page_slug", pageSlug)
            .eq("section_key", "page_segments");

          if (updateError) {
            migrationResults.push({
              page: pageSlug,
              segment: segmentId,
              status: "error",
              message: updateError.message
            });
          } else {
            migrationResults.push({
              page: pageSlug,
              segment: segmentId,
              status: "success",
              message: "Migrated successfully"
            });
          }
        } catch (parseError: any) {
          migrationResults.push({
            page: pageSlug,
            segment: segmentId,
            status: "error",
            message: parseError.message
          });
        }
      }

      setResults(migrationResults);
      const successCount = migrationResults.filter(r => r.status === "success").length;
      toast.success(`Migration complete: ${successCount} Full-Hero segments updated`);
    } catch (error: any) {
      console.error("Migration error:", error);
      toast.error("Migration failed: " + error.message);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-6 py-24">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Full Hero Data Migration</CardTitle>
            <CardDescription>
              Migrate all Full-Hero data from full_hero_* entries to page_segments structure.
              This ensures all Full-Hero segments use a single data source.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runMigration} 
              disabled={migrating}
              size="lg"
              className="w-full"
            >
              {migrating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Migrating...
                </>
              ) : (
                "Run Migration"
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-lg">Migration Results:</h3>
                {results.map((result, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2 p-3 rounded-lg border ${
                      result.status === "success" 
                        ? "bg-green-50 border-green-200" 
                        : result.status === "error" 
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {result.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-grow">
                      <div className="font-medium">
                        {result.page} / Segment {result.segment}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default FullHeroMigration;
