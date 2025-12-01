import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const LogoTest = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    "https://github.com/stone1971grey/imageengeneeringv1-engl-v11/blob/main/Logo-test-iQ-IE_V7.png?raw=true"
  );
  const [base64Result, setBase64Result] = useState<string>("");
  const [dataUri, setDataUri] = useState<string>("");

  const testEdgeFunction = async () => {
    setLoading(true);
    setBase64Result("");
    setDataUri("");

    try {
      console.log("Calling get-logo-base64 edge function with URL:", imageUrl);

      const { data, error } = await supabase.functions.invoke("get-logo-base64", {
        body: { imageUrl },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error(`Error: ${error.message}`);
        return;
      }

      console.log("Edge function response:", data);

      if (data.success) {
        setBase64Result(data.base64.substring(0, 100) + "...");
        setDataUri(data.dataUri);
        toast.success(`✓ Base64 conversion successful (${data.length} chars)`);
      } else {
        toast.error("Edge function returned error");
      }
    } catch (err: any) {
      console.error("Test error:", err);
      toast.error(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 container mx-auto px-6 py-32">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Dynamic Image to Base64 Converter Test
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Test the get-logo-base64 Edge Function for dynamic email images
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter Supabase Storage URL"
                className="font-mono text-sm"
              />
            </div>

            {/* Test Button */}
            <Button
              onClick={testEdgeFunction}
              disabled={loading || !imageUrl}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Test Edge Function"
              )}
            </Button>

            {/* Results */}
            {dataUri && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Results:</h3>

                {/* Preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image Preview</label>
                  <div className="bg-slate-100 p-8 rounded-lg flex items-center justify-center">
                    <img
                      src={dataUri}
                      alt="Preview"
                      className="max-h-32 object-contain"
                    />
                  </div>
                </div>

                {/* Base64 String */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Base64 String (truncated)</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(base64Result, "Base64")}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs break-all">
                    {base64Result}
                  </div>
                </div>

                {/* Data URI */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Data URI for Email Template</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(dataUri, "Data URI")}
                    >
                      Copy Full Data URI
                    </Button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs break-all max-h-32 overflow-y-auto">
                    {dataUri.substring(0, 200)}...
                  </div>
                </div>

                {/* Usage Example */}
                <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-blue-900">
                    Usage in Email Template:
                  </label>
                  <pre className="font-mono text-xs bg-white p-3 rounded border overflow-x-auto">
{`<img src="${dataUri.substring(0, 80)}..." 
     alt="Image Engineering" 
     style="height: 64px;" />`}
                  </pre>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-yellow-900">How to use for Events:</h4>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Store event-specific images in Supabase Storage (evt_image_url)</li>
                <li>Call this Edge Function with the event image URL</li>
                <li>Get back the Base64 Data URI</li>
                <li>Use the Data URI directly in the Mautic email template</li>
                <li>Each event gets its own custom image dynamically</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default LogoTest;
