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
  onCopySuccess?: (targetPageSlug: string) => void;
}

export const CopySegmentDialog = ({
  open,
  onOpenChange,
  currentPageSlug,
  segmentId,
  segmentType,
  segmentData,
  availablePages = [],
  onCopySuccess
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
      // ALWAYS create new segment with next sequential ID - NEVER reuse deleted IDs
      const { data: maxSegment } = await supabase
        .from('segment_registry')
        .select('segment_id')
        .order('segment_id', { ascending: false })
        .limit(1)
        .single();

      const newSegmentId = (maxSegment?.segment_id || 0) + 1;
      const newSegmentKey = `${segmentType}-${newSegmentId}`;

      // Create new segment_registry entry (always dynamic, never static)
      const { error: registryError } = await supabase
        .from('segment_registry')
        .insert({
          segment_id: newSegmentId,
          page_slug: targetPage,
          segment_type: segmentType,
          segment_key: newSegmentKey,
          is_static: false,
          deleted: false
        });

      if (registryError) throw registryError;

      // Copy page_content entry
      const { error: contentError } = await supabase
        .from('page_content')
        .insert({
          page_slug: targetPage,
          section_key: newSegmentKey,
          content_type: 'json',
          content_value: JSON.stringify(segmentData)
        });

      if (contentError) throw contentError;

      // CRITICAL: Copy segment to ALL language versions, not just one
      const languages = ['en', 'de', 'ja', 'ko', 'zh'];
      
      for (const lang of languages) {
        // Add segment to page_segments array for this language
        const { data: pageSegmentsData } = await supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', targetPage)
          .eq('section_key', 'page_segments')
          .eq('language', lang)
          .maybeSingle();

        let pageSegments: any[] = [];
        if (pageSegmentsData?.content_value) {
          try {
            pageSegments = JSON.parse(pageSegmentsData.content_value);
          } catch (e) {
            console.error('Error parsing page_segments:', e);
          }
        }

        // Add new segment to page_segments
        const newSegment = {
          id: newSegmentId.toString(),
          type: segmentType,
          data: segmentData
        };

        if (position === 'start') {
          pageSegments.unshift(newSegment);
        } else {
          pageSegments.push(newSegment);
        }

        const { error: segmentsError } = await supabase
          .from('page_content')
          .upsert({
            page_slug: targetPage,
            section_key: 'page_segments',
            content_type: 'json',
            content_value: JSON.stringify(pageSegments),
            language: lang
          }, {
            onConflict: 'page_slug,section_key,language'
          });

        if (segmentsError) throw segmentsError;

        // Update tab_order of target page for this language
        const { data: tabOrderData } = await supabase
          .from('page_content')
          .select('content_value')
          .eq('page_slug', targetPage)
          .eq('section_key', 'tab_order')
          .eq('language', lang)
          .maybeSingle();

        let currentTabOrder: string[] = [];
        if (tabOrderData?.content_value) {
          try {
            currentTabOrder = JSON.parse(tabOrderData.content_value);
          } catch (e) {
            currentTabOrder = [];
          }
        }

        const newTabOrder = position === 'start' 
          ? [newSegmentId.toString(), ...currentTabOrder]
          : [...currentTabOrder, newSegmentId.toString()];

        const { error: tabOrderError } = await supabase
          .from('page_content')
          .upsert({
            page_slug: targetPage,
            section_key: 'tab_order',
            content_type: 'json',
            content_value: JSON.stringify(newTabOrder),
            language: lang
          }, {
            onConflict: 'page_slug,section_key,language'
          });

        if (tabOrderError) throw tabOrderError;
      }

      // Success!
      const targetPageTitle = pages.find(p => p.page_slug === targetPage)?.page_title || targetPage;
      
      onOpenChange(false);
      setTargetPage('');
      setPosition('end');
      
      console.log('Segment copied successfully:', {
        newSegmentId,
        targetPage,
        newSegmentKey,
        position
      });

      toast({
        title: "Segment copied successfully",
        description: `Segment copied to ${targetPageTitle} (ID: ${newSegmentId}). Switching to ${targetPageTitle}...`,
      });

      // Call success callback to trigger page switch
      if (onCopySuccess) {
        setTimeout(() => {
          onCopySuccess(targetPage);
        }, 500);
      }

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
