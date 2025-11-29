import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, FileText, Layers, Edit, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { EditSlugDialog } from "./EditSlugDialog";
import { NAVIGATION_DATA_FILES, generateNavigationDataWithoutSlug } from "@/utils/updateNavigationSlug";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CMSPage {
  page_id: number;
  page_slug: string;
  page_title: string;
  parent_slug: string | null;
  parent_id: number | null;
  position: number;
  created_at: string;
  segment_count: number;
  segment_languages: string[];
}

export const CMSPageOverview = () => {
  const { language } = useLanguage();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<CMSPage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<CMSPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);

  // Load saved search query from localStorage on mount
  useEffect(() => {
    const savedSearch = localStorage.getItem('cmsHubSearch');
    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
  }, []);

  // Save search query to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cmsHubSearch', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      loadPages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPages(pages);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = pages.filter(
      (page) =>
        page.page_id.toString().includes(query) ||
        page.page_title.toLowerCase().includes(query) ||
        page.page_slug.toLowerCase().includes(query) ||
        page.parent_slug?.toLowerCase().includes(query)
    );
    setFilteredPages(filtered);
  }, [searchQuery, pages]);

  const loadPages = async () => {
    setLoading(true);
    try {
      // Load all pages from page_registry, sorted by position
      const { data: pagesData, error: pagesError } = await supabase
        .from("page_registry")
        .select("*")
        .order("position", { ascending: true });

      if (pagesError) throw pagesError;

      // Load segments per page (grouped by segment_type + segment_key, language-agnostic)
      const { data: segmentsData, error: segmentsError } = await supabase
        .from("segment_registry")
        .select("page_slug, segment_type, segment_key")
        .eq("deleted", false);

      if (segmentsError) throw segmentsError;

      // Load languages per page from page_content
      const { data: contentData, error: contentError } = await supabase
        .from("page_content")
        .select("page_slug, language");

      if (contentError) throw contentError;

      // Count UNIQUE segments per page_slug (one Full Hero with 5 languages = 1 segment)
      const segmentCounts = (segmentsData || []).reduce((acc, seg) => {
        const key = `${seg.segment_type}:${seg.segment_key}`;
        if (!acc[seg.page_slug]) {
          acc[seg.page_slug] = new Set<string>();
        }
        acc[seg.page_slug].add(key);
        return acc;
      }, {} as Record<string, Set<string>>);

      // Get unique languages per page_slug
      const pageLanguages = (contentData || []).reduce((acc, content) => {
        if (!acc[content.page_slug]) {
          acc[content.page_slug] = new Set<string>();
        }
        acc[content.page_slug].add(content.language);
        return acc;
      }, {} as Record<string, Set<string>>);

      // Merge data
      const enrichedPages: CMSPage[] = (pagesData || []).map((page) => ({
        page_id: page.page_id,
        page_slug: page.page_slug,
        page_title: page.page_title,
        parent_slug: page.parent_slug,
        parent_id: page.parent_id,
        position: page.position || page.page_id,
        created_at: page.created_at || "",
        segment_count: segmentCounts[page.page_slug]
          ? segmentCounts[page.page_slug].size
          : 0,
        segment_languages: pageLanguages[page.page_slug]
          ? Array.from(pageLanguages[page.page_slug]).sort()
          : [],
      }));

      setPages(enrichedPages);
      setFilteredPages(enrichedPages);
    } catch (error) {
      console.error("Error loading CMS pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (page: CMSPage) => {
    // Check if page has children
    const { data: children } = await supabase
      .from('page_registry')
      .select('page_id')
      .eq('parent_slug', page.page_slug);
    
    setHasChildren((children?.length || 0) > 0);
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;

    setIsDeleting(true);
    try {
      // Step 1: Delete from segment_registry
      const { error: segmentError } = await supabase
        .from('segment_registry')
        .delete()
        .eq('page_slug', pageToDelete.page_slug);

      if (segmentError) throw segmentError;

      // Step 2: Delete from page_content
      const { error: contentError } = await supabase
        .from('page_content')
        .delete()
        .eq('page_slug', pageToDelete.page_slug);

      if (contentError) throw contentError;

      // Step 3: Delete from navigation_links
      const { error: navError } = await supabase
        .from('navigation_links')
        .delete()
        .eq('slug', pageToDelete.page_slug);

      if (navError) {
        console.warn('Navigation links delete failed (might be empty):', navError);
      }

      // Step 4: Update child pages (set parent_slug to null)
      const { error: childError } = await supabase
        .from('page_registry')
        .update({ parent_slug: null, parent_id: null })
        .eq('parent_slug', pageToDelete.page_slug);

      if (childError) throw childError;

      // Step 5: Delete from page_registry
      const { error: pageError } = await supabase
        .from('page_registry')
        .delete()
        .eq('page_id', pageToDelete.page_id);

      if (pageError) throw pageError;

      // Step 6: Update all navigationData.ts files to remove the deleted page
      for (const filePath of NAVIGATION_DATA_FILES) {
        try {
          const { data: fileData } = await supabase.functions.invoke('read-file', {
            body: { path: filePath }
          });
          
          if (fileData?.content) {
            const updatedContent = generateNavigationDataWithoutSlug(fileData.content, pageToDelete.page_slug);
            
            await supabase.functions.invoke('write-file', {
              body: { 
                path: filePath,
                content: updatedContent
              }
            });
          }
        } catch (fileError) {
          console.warn(`Failed to update ${filePath}:`, fileError);
        }
      }

      toast.success(`Page "${pageToDelete.page_title}" (ID ${pageToDelete.page_id}) permanently deleted`, {
        description: "All segments, content, navigation links, and navigationData entries have been removed"
      });

      setDeleteDialogOpen(false);
      setPageToDelete(null);
      await loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryBadge = (slug: string) => {
    if (slug.startsWith("styleguide")) {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Styleguide</Badge>;
    }
    if (slug.startsWith("your-solution")) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Your Solution</Badge>;
    }
    if (slug.startsWith("products")) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Products</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Other</Badge>;
  };

  const getLanguageLabel = (langCode: string) => {
    const labels: Record<string, string> = {
      en: "EN",
      de: "DE",
      ja: "JA",
      ko: "KO",
      zh: "ZH"
    };
    return labels[langCode] || langCode.toUpperCase();
  };

  const getPageUrl = (pageId: number) => {
    // Use Page ID Router for reliable routing with language prefix
    return `/${language}/${pageId}`;
  };
  
  const getEditUrl = (slug: string) => {
    // Extract last part of slug for admin-dashboard navigation
    const lastPart = slug.split('/').filter(Boolean).slice(-1)[0] || slug;
    return `/${language}/admin-dashboard?page=${lastPart}`;
  };

  // Drag & Drop setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredPages.findIndex((p) => p.page_id === active.id);
    const newIndex = filteredPages.findIndex((p) => p.page_id === over.id);

    const movedPage = filteredPages[oldIndex];
    const targetPage = filteredPages[newIndex];

    try {
      // Check if same parent (reordering within same level)
      if (movedPage.parent_slug === targetPage.parent_slug) {
        // Reorder in UI immediately
        const reordered = arrayMove(filteredPages, oldIndex, newIndex);
        setFilteredPages(reordered);

        // Get all siblings (same parent_slug)
        const siblings = pages.filter(p => p.parent_slug === movedPage.parent_slug);
        const reorderedSiblings = arrayMove(
          siblings,
          siblings.findIndex(p => p.page_id === movedPage.page_id),
          siblings.findIndex(p => p.page_id === targetPage.page_id)
        );

        // Update positions in database
        const updates = reorderedSiblings.map((page, index) => ({
          page_id: page.page_id,
          position: siblings[0].position + index
        }));

        for (const update of updates) {
          const { error } = await supabase
            .from('page_registry')
            .update({ position: update.position })
            .eq('page_id', update.page_id);

          if (error) throw error;
        }

        toast.success("Page order updated successfully");
      } else {
        // Moving to different hierarchy level
        let newParentSlug: string | null;
        let newParentId: number | null;
        
        // If target page is on level 1, make moved page a child of target (level 2)
        // Otherwise, make moved page a sibling of target (same parent)
        if (targetPage.parent_id === null) {
          // Target is level 1 → moved page becomes its child (level 2)
          newParentSlug = targetPage.page_slug;
          newParentId = targetPage.page_id;
        } else {
          // Target is level 2+ → moved page becomes sibling (same parent)
          newParentSlug = targetPage.parent_slug;
          newParentId = targetPage.parent_id;
        }

        // Get new siblings (pages that will share the same parent after move)
        const newSiblings = pages.filter(p => p.parent_slug === newParentSlug);
        
        // Calculate new position (insert after target page or as last child)
        const newPosition = targetPage.position + 1;

        // Update the moved page's parent and position
        const { error: updateError } = await supabase
          .from('page_registry')
          .update({ 
            parent_slug: newParentSlug,
            parent_id: newParentId,
            position: newPosition
          })
          .eq('page_id', movedPage.page_id);

        if (updateError) throw updateError;

        // Shift positions of pages that come after the insertion point
        const pagesToShift = pages.filter(p => 
          p.parent_slug === newParentSlug && 
          p.position >= newPosition && 
          p.page_id !== movedPage.page_id
        );

        for (const page of pagesToShift) {
          const { error } = await supabase
            .from('page_registry')
            .update({ position: page.position + 1 })
            .eq('page_id', page.page_id);

          if (error) throw error;
        }

        // Update segment_registry to reflect new page_slug if needed
        // (Only if the page slug itself changes, which it shouldn't in hierarchical moves)

        // Regenerate navigationData for all languages
        for (const lang of ['en', 'de', 'ja', 'ko', 'zh']) {
          try {
            const { data: allPages } = await supabase
              .from('page_registry')
              .select('*')
              .order('position');

            const { data: navLinks } = await supabase
              .from('navigation_links')
              .select('*')
              .eq('language', lang);

            if (allPages && navLinks) {
              const updatedNavData = NAVIGATION_DATA_FILES[lang as keyof typeof NAVIGATION_DATA_FILES];
              // Navigation data will be regenerated on next navigation load
            }
          } catch (navError) {
            console.error(`Error updating navigation for ${lang}:`, navError);
          }
        }

        toast.success("Page moved to new hierarchy level", {
          description: "Navigation structure has been updated"
        });
      }

      await loadPages();
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update page");
      await loadPages(); // Reload to restore correct order
    }
  };

  const getIndentLevel = (page: CMSPage): number => {
    const slugParts = page.page_slug.split('/');
    return Math.max(0, slugParts.length - 1);
  };

  // Sortable Row Component
  interface SortablePageRowProps {
    page: CMSPage;
    indentLevel: number;
    getCategoryBadge: (slug: string) => JSX.Element;
    getLanguageLabel: (langCode: string) => string;
    getEditUrl: (slug: string) => string;
    getPageUrl: (pageId: number) => string;
    handleDeleteClick: (page: CMSPage) => void;
    setIsOpen: (open: boolean) => void;
  }

  const SortablePageRow = ({
    page,
    indentLevel,
    getCategoryBadge,
    getLanguageLabel,
    getEditUrl,
    getPageUrl,
    handleDeleteClick,
    setIsOpen,
  }: SortablePageRowProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: page.page_id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        className="border-gray-700 hover:bg-gray-800"
      >
        <TableCell className="w-12">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-[#f9dc24] transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>
        </TableCell>
        <TableCell className="font-mono text-[#f9dc24] font-bold">
          {page.page_id}
        </TableCell>
        <TableCell 
          className="text-white font-medium"
          style={{ paddingLeft: `${indentLevel * 24 + 16}px` }}
        >
          {indentLevel > 0 && <span className="text-gray-600 mr-2">↳</span>}
          {page.page_title}
        </TableCell>
        <TableCell className="font-mono text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span>{page.page_slug}</span>
            <EditSlugDialog
              pageId={page.page_id}
              currentSlug={page.page_slug}
              pageTitle={page.page_title}
              onSlugUpdated={loadPages}
            />
          </div>
        </TableCell>
        <TableCell>{getCategoryBadge(page.page_slug)}</TableCell>
        <TableCell className="text-gray-400 text-sm">
          {page.parent_slug || <span className="text-gray-600 italic">none</span>}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex flex-col items-center gap-2">
            <Badge
              variant={page.segment_count > 0 ? "default" : "outline"}
              className={
                page.segment_count > 0
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-400"
              }
            >
              {page.segment_count} {page.segment_count === 1 ? "Segment" : "Segments"}
            </Badge>
            {page.segment_languages.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center">
                {page.segment_languages.map((lang) => (
                  <Badge
                    key={lang}
                    variant="outline"
                    className="text-xs bg-blue-900/30 border-blue-600 text-blue-200"
                  >
                    {getLanguageLabel(lang)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-center gap-2">
            <Link
              to={getEditUrl(page.page_slug)}
              onClick={() => setIsOpen(false)}
            >
              <Button
                size="sm"
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-[#f9dc24] hover:text-black hover:border-[#f9dc24] flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit Page
              </Button>
            </Link>
            <a
              href={getPageUrl(page.page_id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
                title="Preview Page"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteClick(page)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              title="Delete Page"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-[#f9dc24]"
        >
          <FileText className="h-4 w-4 mr-2" />
          CMS Hub
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#f9dc24] flex items-center gap-2">
            <Layers className="h-6 w-6" />
            CMS Hub
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Page ID, Title, or Slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400">Total Pages</div>
            <div className="text-2xl font-bold text-[#f9dc24]">{pages.length}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400">CMS Ready</div>
            <div className="text-2xl font-bold text-green-400">
              {pages.filter((p) => p.segment_count > 0).length}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400">Found</div>
            <div className="text-2xl font-bold text-blue-400">{filteredPages.length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border border-gray-700 rounded-lg">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader className="sticky top-0 bg-gray-800 z-10">
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300 font-bold w-12"></TableHead>
                  <TableHead className="text-gray-300 font-bold">Page ID</TableHead>
                <TableHead className="text-gray-300 font-bold">Title</TableHead>
                <TableHead className="text-gray-300 font-bold">Slug</TableHead>
                <TableHead className="text-gray-300 font-bold">Category</TableHead>
                <TableHead className="text-gray-300 font-bold">Parent</TableHead>
                <TableHead className="text-gray-300 font-bold text-center">Segments</TableHead>
                <TableHead className="text-gray-300 font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    Loading pages...
                  </TableCell>
                </TableRow>
              ) : filteredPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                    {searchQuery ? "No pages found matching your search." : "No CMS pages found."}
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={filteredPages.map(p => p.page_id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredPages.map((page) => (
                    <SortablePageRow
                      key={page.page_id}
                      page={page}
                      indentLevel={getIndentLevel(page)}
                      getCategoryBadge={getCategoryBadge}
                      getLanguageLabel={getLanguageLabel}
                      getEditUrl={getEditUrl}
                      getPageUrl={getPageUrl}
                      handleDeleteClick={handleDeleteClick}
                      setIsOpen={setIsOpen}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete Page Permanently?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              You are about to permanently delete:
              <div className="mt-3 p-3 bg-gray-800 rounded border border-gray-700">
                <div className="font-bold text-white">"{pageToDelete?.page_title}"</div>
                <div className="text-sm text-gray-400">Page ID: {pageToDelete?.page_id}</div>
                <div className="text-sm text-gray-400">Slug: {pageToDelete?.page_slug}</div>
              </div>
              {hasChildren ? (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-600 rounded">
                  <div className="text-red-300 font-semibold mb-2">
                    ⛔ Cannot delete this page!
                  </div>
                  <div className="text-red-200 text-sm">
                    This page has child pages (sub-pages) that reference it as their parent.
                    You must delete all child pages first before you can delete this page.
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-3 text-yellow-300">
                    ⚠️ This will permanently remove:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>The page entry from page_registry</li>
                      <li>All {pageToDelete?.segment_count || 0} segment(s) from segment_registry</li>
                      <li>All content from page_content (all languages)</li>
                      <li>All navigation links</li>
                    </ul>
                  </div>
                  <div className="mt-2 text-red-300 font-semibold">
                    This action cannot be undone!
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              {hasChildren ? "Close" : "Cancel"}
            </AlertDialogCancel>
            {!hasChildren && (
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
