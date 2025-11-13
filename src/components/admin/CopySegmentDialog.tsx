import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Copy, Loader2 } from 'lucide-react';

interface CopySegmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPageSlug: string;
  segmentId: string;
  segmentType: string;
  segmentData: any;
  availablePages?: Array<{ page_slug: string; page_title: string }>;
}

export const CopySegmentDialog = ({
  open,
  onOpenChange,
  currentPageSlug,
  segmentId,
  segmentType,
  segmentData,
  availablePages = []
}: CopySegmentDialogProps) => {
  const [targetPage, setTargetPage] = useState<string>('');
  const [position, setPosition] = useState<'start' | 'end'>('end');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Use pre-loaded pages filtered for current page
  const pages = availablePages.filter(page => page.page_slug !== currentPageSlug);
  
  // Debug logging
  console.log('CopySegmentDialog rendered:', {
    open,
    currentPageSlug,
    availablePages,
    filteredPages: pages
  });

  const handleCopy = async () => {
    if (!targetPage) {
      toast({
        title: "Target page required",
        description: "Please select a target page",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if target page has a deleted static segment of the same type
      const { data: existingSegment } = await supabase
        .from('segment_registry')
        .select('segment_id, segment_key, deleted, is_static')
        .eq('page_slug', targetPage)
        .eq('segment_type', segmentType)
        .eq('is_static', true)
        .maybeSingle();

      let targetSegmentId: number;
      let targetSegmentKey: string;
      
      if (existingSegment && existingSegment.deleted) {
        // Reactivate deleted static segment
        targetSegmentId = existingSegment.segment_id;
        targetSegmentKey = existingSegment.segment_key;
        
        const { error: reactivateError } = await supabase
          .from('segment_registry')
          .update({ deleted: false })
          .eq('segment_id', targetSegmentId);
          
        if (reactivateError) throw reactivateError;
        
        console.log('Reactivated static segment:', targetSegmentId);
      } else {
        // Create new dynamic segment
        const { data: maxSegment } = await supabase
          .from('segment_registry')
          .select('segment_id')
          .order('segment_id', { ascending: false })
          .limit(1)
          .single();

        targetSegmentId = (maxSegment?.segment_id || 0) + 1;
        targetSegmentKey = `${segmentType}-${targetSegmentId}`;

        const { error: registryError } = await supabase
          .from('segment_registry')
          .insert({
            segment_id: targetSegmentId,
            page_slug: targetPage,
            segment_type: segmentType,
            segment_key: targetSegmentKey,
            is_static: false,
            deleted: false
          });

        if (registryError) throw registryError;
        
        console.log('Created new dynamic segment:', targetSegmentId);
      }

      // Update or create page_content entry
      const { error: contentError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: targetPage,
          section_key: targetSegmentKey,
          content_type: 'json',
          content_value: JSON.stringify(segmentData)
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (contentError) throw contentError;

      // Update tab_order of target page
      const { data: tabOrderData } = await supabase
        .from('page_content')
        .select('content_value')
        .eq('page_slug', targetPage)
        .eq('section_key', 'tab_order')
        .maybeSingle();

      let currentTabOrder: string[] = [];
      if (tabOrderData?.content_value) {
        try {
          currentTabOrder = JSON.parse(tabOrderData.content_value);
        } catch (e) {
          currentTabOrder = [];
        }
      }

      // Remove the segment from tab_order if it exists (in case of reactivation)
      currentTabOrder = currentTabOrder.filter(id => id !== targetSegmentKey && id !== targetSegmentId.toString());

      const newTabOrder = position === 'start' 
        ? [targetSegmentId.toString(), ...currentTabOrder]
        : [...currentTabOrder, targetSegmentId.toString()];

      const { error: tabOrderError } = await supabase
        .from('page_content')
        .upsert({
          page_slug: targetPage,
          section_key: 'tab_order',
          content_type: 'json',
          content_value: JSON.stringify(newTabOrder)
        }, {
          onConflict: 'page_slug,section_key'
        });

      if (tabOrderError) throw tabOrderError;

      // Success!
      const targetPageTitle = pages.find(p => p.page_slug === targetPage)?.page_title || targetPage;
      toast({
        title: "Segment copied successfully",
        description: `Segment copied to ${targetPageTitle} (ID: ${targetSegmentId}). Reload the target page to see changes.`,
      });

      onOpenChange(false);
      setTargetPage('');
      setPosition('end');
      
      console.log('Segment copied successfully:', {
        targetSegmentId,
        targetPage,
        targetSegmentKey,
        position,
        wasReactivated: existingSegment?.deleted || false
      });

    } catch (error) {
      console.error('Error copying segment:', error);
      toast({
        title: "Copy failed",
        description: error instanceof Error ? error.message : "Failed to copy segment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Copy Segment to Another Page</DialogTitle>
          <DialogDescription>
            Select the target page and position where you want to copy this segment.
            A new segment ID will be automatically assigned.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="target-page">Target Page</Label>
            <Select value={targetPage} onValueChange={setTargetPage}>
              <SelectTrigger id="target-page" className="bg-white border-2 border-gray-300 text-black">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white z-[9999] shadow-xl border-2 border-gray-300 min-w-[200px]"
                position="popper"
                sideOffset={5}
              >
                {pages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Loading pages...
                  </div>
                ) : (
                  pages.map(page => (
                    <SelectItem 
                      key={page.page_slug} 
                      value={page.page_slug}
                      className="cursor-pointer hover:bg-gray-100 text-black py-2 px-3"
                    >
                      {page.page_title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={position} onValueChange={(val) => setPosition(val as 'start' | 'end')}>
              <SelectTrigger id="position" className="bg-white border-2 border-gray-300 text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent 
                className="bg-white z-[9999] shadow-xl border-2 border-gray-300 min-w-[200px]"
                position="popper"
                sideOffset={5}
              >
                <SelectItem value="start" className="cursor-pointer hover:bg-gray-100 text-black py-2 px-3">
                  At the beginning (first segment)
                </SelectItem>
                <SelectItem value="end" className="cursor-pointer hover:bg-gray-100 text-black py-2 px-3">
                  At the end (last segment)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCopy}
            disabled={loading || !targetPage}
            style={{ backgroundColor: '#f9dc24', color: 'black' }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Copying...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Segment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
