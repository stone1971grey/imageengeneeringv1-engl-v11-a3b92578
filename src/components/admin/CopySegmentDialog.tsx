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
}

export const CopySegmentDialog = ({
  open,
  onOpenChange,
  currentPageSlug,
  segmentId,
  segmentType,
  segmentData
}: CopySegmentDialogProps) => {
  const [targetPage, setTargetPage] = useState<string>('');
  const [position, setPosition] = useState<'start' | 'end'>('end');
  const [pages, setPages] = useState<Array<{ page_slug: string; page_title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load pages when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen) {
      const { data, error } = await supabase
        .from('page_registry')
        .select('page_slug, page_title')
        .neq('page_slug', currentPageSlug)
        .order('page_title');

      if (!error && data) {
        setPages(data);
      }
    }
  };

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
      // 1. Get highest segment_id to create new one
      const { data: maxSegment } = await supabase
        .from('segment_registry')
        .select('segment_id')
        .order('segment_id', { ascending: false })
        .limit(1)
        .single();

      const newSegmentId = (maxSegment?.segment_id || 0) + 1;
      const newSegmentKey = `${segmentType}-${newSegmentId}`;

      // 2. Create new segment_registry entry
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

      // 3. Copy page_content entry
      const { error: contentError } = await supabase
        .from('page_content')
        .insert({
          page_slug: targetPage,
          section_key: newSegmentKey,
          content_type: 'json',
          content_value: JSON.stringify(segmentData)
        });

      if (contentError) throw contentError;

      // 4. Update tab_order of target page
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

      const newTabOrder = position === 'start' 
        ? [newSegmentId.toString(), ...currentTabOrder]
        : [...currentTabOrder, newSegmentId.toString()];

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
        description: `Segment copied to ${targetPageTitle} (ID: ${newSegmentId})`,
      });

      onOpenChange(false);
      setTargetPage('');
      setPosition('end');

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              <SelectTrigger id="target-page">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map(page => (
                  <SelectItem key={page.page_slug} value={page.page_slug}>
                    {page.page_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={position} onValueChange={(val) => setPosition(val as 'start' | 'end')}>
              <SelectTrigger id="position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">At the beginning (first segment)</SelectItem>
                <SelectItem value="end">At the end (last segment)</SelectItem>
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
