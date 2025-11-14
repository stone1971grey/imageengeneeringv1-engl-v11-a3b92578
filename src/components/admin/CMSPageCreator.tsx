import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HierarchicalPageSelect } from "./HierarchicalPageSelect";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CMSPageCreatorProps {
  user: any;
  availablePages: any[];
}

export const CMSPageCreator = ({ user, availablePages }: CMSPageCreatorProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPageForCMS, setSelectedPageForCMS] = useState("");
  const [isCreatingCMS, setIsCreatingCMS] = useState(false);

  const createNewCMSPage = async () => {
    if (!selectedPageForCMS || !user) {
      toast.error("Please select a page");
      return;
    }

    setIsCreatingCMS(true);
    
    try {
      // 1. Get page info from page_registry
      const { data: pageInfo, error: pageError } = await supabase
        .from("page_registry")
        .select("page_id, page_title")
        .eq("page_slug", selectedPageForCMS)
        .single();

      if (pageError || !pageInfo) {
        toast.error("Page not found in registry");
        setIsCreatingCMS(false);
        return;
      }

      // 2. Find highest segment_id
      const { data: maxSegment } = await supabase
        .from("segment_registry")
        .select("segment_id")
        .order("segment_id", { ascending: false })
        .limit(1)
        .single();

      const baseId = (maxSegment?.segment_id || 0) + 1;

      // 3. Create segment_registry entries
      const segmentEntries = [
        { page_slug: selectedPageForCMS, segment_key: 'hero', segment_id: baseId, segment_type: 'hero', is_static: true, deleted: false },
        { page_slug: selectedPageForCMS, segment_key: 'tiles', segment_id: baseId + 1, segment_type: 'tiles', is_static: true, deleted: false },
        { page_slug: selectedPageForCMS, segment_key: 'banner', segment_id: baseId + 2, segment_type: 'banner', is_static: true, deleted: false },
        { page_slug: selectedPageForCMS, segment_key: 'solutions', segment_id: baseId + 3, segment_type: 'solutions', is_static: true, deleted: false },
        { page_slug: selectedPageForCMS, segment_key: 'footer', segment_id: baseId + 4, segment_type: 'footer', is_static: true, deleted: false },
      ];

      const { error: segmentError } = await supabase
        .from("segment_registry")
        .insert(segmentEntries);

      if (segmentError) throw segmentError;

      // 4. Create page_content entries
      const contentEntries = [
        { page_slug: selectedPageForCMS, section_key: 'tab_order', content_type: 'json', content_value: '["tiles", "banner", "solutions"]' },
        { page_slug: selectedPageForCMS, section_key: 'page_segments', content_type: 'json', content_value: '[]' },
        { page_slug: selectedPageForCMS, section_key: 'hero_title', content_type: 'text', content_value: pageInfo.page_title },
        { page_slug: selectedPageForCMS, section_key: 'hero_subtitle', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'hero_description', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'hero_cta', content_type: 'text', content_value: 'Learn More' },
        { page_slug: selectedPageForCMS, section_key: 'hero_cta_link', content_type: 'text', content_value: '#applications-start' },
        { page_slug: selectedPageForCMS, section_key: 'hero_cta_style', content_type: 'text', content_value: 'standard' },
        { page_slug: selectedPageForCMS, section_key: 'hero_image_url', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'hero_image_position', content_type: 'text', content_value: 'right' },
        { page_slug: selectedPageForCMS, section_key: 'hero_layout', content_type: 'text', content_value: '2-5' },
        { page_slug: selectedPageForCMS, section_key: 'hero_top_padding', content_type: 'text', content_value: 'medium' },
        { page_slug: selectedPageForCMS, section_key: 'applications_title', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'applications_description', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'applications_items', content_type: 'json', content_value: '[]' },
        { page_slug: selectedPageForCMS, section_key: 'tiles_columns', content_type: 'text', content_value: '3' },
        { page_slug: selectedPageForCMS, section_key: 'banner_title', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'banner_subtext', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'banner_images', content_type: 'json', content_value: '[]' },
        { page_slug: selectedPageForCMS, section_key: 'banner_button_text', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'banner_button_link', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'banner_button_style', content_type: 'text', content_value: 'standard' },
        { page_slug: selectedPageForCMS, section_key: 'solutions_title', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'solutions_subtext', content_type: 'text', content_value: '' },
        { page_slug: selectedPageForCMS, section_key: 'solutions_items', content_type: 'json', content_value: '[]' },
        { page_slug: selectedPageForCMS, section_key: 'solutions_layout', content_type: 'text', content_value: '2-col' },
        { page_slug: selectedPageForCMS, section_key: 'seo_settings', content_type: 'json', content_value: JSON.stringify({
          title: `${pageInfo.page_title} | Image Engineering`,
          description: '',
          canonical: `https://www.image-engineering.de/products/${selectedPageForCMS}`,
          robotsIndex: true,
          robotsFollow: true
        }) },
      ];

      const { error: contentError } = await supabase
        .from("page_content")
        .insert(contentEntries);

      if (contentError) throw contentError;

      toast.success(`✅ Database setup complete for "${pageInfo.page_title}"!`);
      
      const componentName = selectedPageForCMS
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      setIsDialogOpen(false);
      setSelectedPageForCMS("");
      navigate(`/admin-dashboard?page=${selectedPageForCMS}`);
      
      setTimeout(() => {
        toast.success(`✅ CMS setup complete!\n\nManual steps:\n1. Copy MachineVision.tsx → ${componentName}.tsx\n2. Replace "machine-vision" with "${selectedPageForCMS}"\n3. Replace "MachineVision" with "${componentName}"\n4. Add to App.tsx: import ${componentName} from "./pages/${componentName}"\n5. Add route: <Route path="/your-solution/.../${selectedPageForCMS}" element={<${componentName} />} />`, {
          duration: 10000
        });
      }, 1000);
      
    } catch (error: any) {
      console.error("Error creating CMS page:", error);
      toast.error(`Failed to create CMS page: ${error.message}`);
    } finally {
      setIsCreatingCMS(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create New CMS Page
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New CMS Page</DialogTitle>
          <DialogDescription>
            Initialize a new CMS-managed page with database structure
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <HierarchicalPageSelect
            value={selectedPageForCMS}
            onValueChange={setSelectedPageForCMS}
          />

          {selectedPageForCMS && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What will be created automatically:</h4>
              <ul className="space-y-1 text-sm text-blue-800 mb-4">
                <li>✓ 5 entries in segment_registry (hero, tiles, banner, solutions, footer)</li>
                <li>✓ 27 entries in page_content (all required fields)</li>
                <li>✓ SEO settings initialized</li>
              </ul>
              <h4 className="font-semibold text-blue-900 mb-2">Manual steps after creation:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>1️⃣ Copy src/pages/MachineVision.tsx to src/pages/{selectedPageForCMS.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}.tsx</li>
                <li>2️⃣ Update page_slug in the new file (2 places)</li>
                <li>3️⃣ <strong>App.tsx</strong>: Add import: <code className="text-xs bg-white px-1 rounded">import {selectedPageForCMS.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')} from "./pages/{selectedPageForCMS.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}"</code></li>
                <li>4️⃣ <strong>App.tsx</strong>: Add route: <code className="text-xs bg-white px-1 rounded">&lt;Route path="/your-solution/.../{ selectedPageForCMS}" element=&#123;&lt;{selectedPageForCMS.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')} /&gt;&#125; /&gt;</code></li>
                <li>5️⃣ <strong>PageIdRouter.tsx</strong>: Add to pageComponentMap if using page_id routing</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDialogOpen(false);
              setSelectedPageForCMS("");
            }}
            disabled={isCreatingCMS}
          >
            Cancel
          </Button>
          <Button
            onClick={createNewCMSPage}
            disabled={!selectedPageForCMS || isCreatingCMS}
            className="bg-[#f9dc24] hover:bg-yellow-400 text-gray-900 font-bold"
          >
            {isCreatingCMS ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create CMS Page
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
