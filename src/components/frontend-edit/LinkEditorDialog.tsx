import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hash, FileText, Globe, Link as LinkIcon, Trash2 } from 'lucide-react';

interface LinkEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUrl: string;
  onSubmit: (url: string) => void;
  onRemove: () => void;
}

type LinkType = 'anchor' | 'internal' | 'external';

const detectLinkType = (url: string): LinkType => {
  if (!url) return 'external';
  if (url.startsWith('#')) return 'anchor';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('www.')) return 'external';
  return 'internal';
};

const formatExternalUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('www.')) return `https://${url}`;
  return url;
};

export const LinkEditorDialog = ({
  open,
  onOpenChange,
  currentUrl,
  onSubmit,
  onRemove
}: LinkEditorDialogProps) => {
  const [linkType, setLinkType] = useState<LinkType>('external');
  const [anchorId, setAnchorId] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // Parse current URL when dialog opens
  useEffect(() => {
    if (open && currentUrl) {
      const type = detectLinkType(currentUrl);
      setLinkType(type);
      
      if (type === 'anchor') {
        setAnchorId(currentUrl.replace('#', ''));
      } else if (type === 'internal') {
        setPageSlug(currentUrl.startsWith('/') ? currentUrl.slice(1) : currentUrl);
      } else {
        setExternalUrl(currentUrl);
      }
    } else if (open && !currentUrl) {
      // Reset fields when opening without a URL
      setLinkType('external');
      setAnchorId('');
      setPageSlug('');
      setExternalUrl('');
    }
  }, [open, currentUrl]);

  const handleSubmit = () => {
    let finalUrl = '';
    
    switch (linkType) {
      case 'anchor':
        if (anchorId) {
          finalUrl = `#${anchorId.replace(/^#/, '')}`;
        }
        break;
      case 'internal':
        if (pageSlug) {
          finalUrl = pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`;
        }
        break;
      case 'external':
        if (externalUrl) {
          finalUrl = formatExternalUrl(externalUrl);
        }
        break;
    }
    
    onSubmit(finalUrl);
    onOpenChange(false);
  };

  const handleRemove = () => {
    onRemove();
    onOpenChange(false);
  };

  const hasExistingLink = !!currentUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <LinkIcon className="h-5 w-5 text-[#f9dc24]" />
            Link einfügen
          </DialogTitle>
        </DialogHeader>

        <Tabs value={linkType} onValueChange={(v) => setLinkType(v as LinkType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="anchor" 
              className="flex items-center gap-1.5 text-sm data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black rounded-md"
            >
              <Hash className="h-4 w-4" />
              Anker
            </TabsTrigger>
            <TabsTrigger 
              value="internal"
              className="flex items-center gap-1.5 text-sm data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black rounded-md"
            >
              <FileText className="h-4 w-4" />
              Intern
            </TabsTrigger>
            <TabsTrigger 
              value="external"
              className="flex items-center gap-1.5 text-sm data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black rounded-md"
            >
              <Globe className="h-4 w-4" />
              Extern
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="anchor" className="mt-0 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="anchor-id" className="text-sm font-medium text-gray-700">
                  Anker-ID (ohne #)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">#</span>
                  <Input
                    id="anchor-id"
                    value={anchorId}
                    onChange={(e) => setAnchorId(e.target.value)}
                    placeholder="section-id"
                    className="pl-7 border-2 border-gray-300 focus:border-[#f9dc24] focus:ring-[#f9dc24] rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Springt zu einem Element mit dieser ID auf der aktuellen Seite
                </p>
              </div>
            </TabsContent>

            <TabsContent value="internal" className="mt-0 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="page-slug" className="text-sm font-medium text-gray-700">
                  Seiten-Slug
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">/</span>
                  <Input
                    id="page-slug"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    placeholder="de/products/overview"
                    className="pl-7 border-2 border-gray-300 focus:border-[#f9dc24] focus:ring-[#f9dc24] rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Interne Verlinkung zu einer anderen Seite im CMS
                </p>
              </div>
            </TabsContent>

            <TabsContent value="external" className="mt-0 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="external-url" className="text-sm font-medium text-gray-700">
                  Externe URL
                </Label>
                <Input
                  id="external-url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://www.example.com"
                  className="border-2 border-gray-300 focus:border-[#f9dc24] focus:ring-[#f9dc24] rounded-lg"
                />
                <p className="text-xs text-gray-500">
                  Link zu einer externen Website (öffnet in neuem Tab)
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex gap-2 mt-4">
          {hasExistingLink && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Entfernen
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-300 hover:bg-gray-100"
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-[#f9dc24] text-black hover:bg-[#e5c820] font-medium"
          >
            Link setzen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkEditorDialog;
