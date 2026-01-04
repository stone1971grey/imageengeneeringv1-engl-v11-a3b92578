import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Send, Loader2 } from 'lucide-react';

interface PagePublishControlProps {
  pageSlug: string;
  pageId: number;
  currentStatus: 'draft' | 'published';
  onStatusChange: (newStatus: 'draft' | 'published') => void;
  isAdmin: boolean;
  canPublish?: boolean; // Editor permission to publish
  canDraft?: boolean; // Editor permission to work with drafts
}

export const PagePublishControl = ({
  pageSlug,
  pageId,
  currentStatus,
  onStatusChange,
  isAdmin,
  canPublish = false,
  canDraft = false,
}: PagePublishControlProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  
  // User can publish if they are admin OR have canPublish permission
  const hasPublishPermission = isAdmin || canPublish;

  const handlePublish = async () => {
    if (!hasPublishPermission) {
      toast.error('You do not have permission to publish pages');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('page_registry')
        .update({ status: 'published' })
        .eq('page_id', pageId);

      if (error) throw error;

      toast.success(`Page "${pageSlug}" is now published and visible to all visitors.`);
      onStatusChange('published');
      setShowPublishDialog(false);
    } catch (error: any) {
      console.error('Error publishing page:', error);
      toast.error('Failed to publish page');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnpublish = async () => {
    if (!hasPublishPermission) {
      toast.error('You do not have permission to unpublish pages');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('page_registry')
        .update({ status: 'draft' })
        .eq('page_id', pageId);

      if (error) throw error;

      toast.success(`Page "${pageSlug}" is now a draft and only visible to admins/editors.`);
      onStatusChange('draft');
      setShowUnpublishDialog(false);
    } catch (error: any) {
      console.error('Error unpublishing page:', error);
      toast.error('Failed to unpublish page');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!hasPublishPermission) {
    // Users without publish permission can see status but not change it
    return (
      <Badge variant={currentStatus === 'published' ? 'default' : 'secondary'} className={currentStatus === 'draft' ? 'gap-1 bg-red-600 text-white border-red-600' : 'gap-1'}>
        {currentStatus === 'published' ? (
          <>
            <Eye className="h-3 w-3" />
            Published
          </>
        ) : (
          <>
            Draft
          </>
        )}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus === 'draft' ? (
        <>
          <Badge variant="secondary" className="bg-red-600 text-white border-red-600">
            Draft
          </Badge>
          
          <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="gap-1 h-7 bg-green-600 text-white border-0 hover:bg-green-700">
                <Send className="h-3 w-3 text-white" />
                Publish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Publish Page?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make <strong>/{pageSlug}</strong> publicly visible to all website visitors.
                  <br /><br />
                  Are you sure the page is ready to go live?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlePublish}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Yes, Publish
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <>
          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
            <Eye className="h-3 w-3" />
            Published
          </Badge>
          
          <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="gap-1 h-7 bg-amber-500 text-white border-0 hover:bg-amber-600">
                <EyeOff className="h-3 w-3" />
                Unpublish
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unpublish Page?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will make <strong>/{pageSlug}</strong> a draft again. It will only be visible to logged-in admins and editors.
                  <br /><br />
                  Public visitors will see a 404 page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnpublish}
                  disabled={isUpdating}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Unpublishing...
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Yes, Unpublish
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};
