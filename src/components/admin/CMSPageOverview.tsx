import { useState, useEffect, useRef } from "react";
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
import { Search, ExternalLink, FileText, Layers, Edit, Trash2, GripVertical, Microscope } from "lucide-react";
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
  cta_group?: string | null;
  cta_label?: string | null;
  cta_icon?: string | null;
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
        .select("page_id, page_slug, page_title, parent_slug, parent_id, position, created_at, cta_group, cta_label, cta_icon")
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
      const enrichedPages: CMSPage[] = (pagesData || []).map((page: any) => ({
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
        cta_group: page.cta_group,
        cta_label: page.cta_label,
        cta_icon: page.cta_icon,
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

  const getCtaBadge = (page: CMSPage) => {
    if (!page.cta_group || page.cta_group === 'none') return null;

    // Determine icon based on stored cta_icon with sensible fallback per group
    let IconComponent = Search;
    if (page.cta_icon === 'microscope') {
      IconComponent = Microscope;
    } else if (page.cta_icon === 'search' || !page.cta_icon) {
      IconComponent = Search;
    }

    // Color scheme: yellow for "Your Solution" CTA, black for "Products" CTA
    const isYourSolution = page.cta_group === 'your-solution';
    const badgeClasses = isYourSolution
      ? 'bg-[#f9dc24] text-black border-[#f9dc24]'
      : 'bg-black text-white border-gray-600';

    const label = isYourSolution ? 'CTA Your Solution' : 'CTA Products';

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 px-2 py-0.5 text-xs ${badgeClasses}`}
        title={label}
      >
        <IconComponent className="h-3 w-3" />
        <span>{label}</span>
      </Badge>
    );
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

  // Drag & Drop setup with stable, hysteresis-based hover detection
  const [dropMode, setDropMode] = useState<'sibling' | 'child' | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastDropModeRef = useRef<'sibling' | 'child' | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragCancel = () => {
    setIsDragging(false);
    setDropMode(null);
    setHoveredId(null);
    lastDropModeRef.current = null;
  };

  const handleDragMove = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      if (dropMode !== null || hoveredId !== null) {
        setDropMode(null);
        setHoveredId(null);
        lastDropModeRef.current = null;
      }
      return;
    }

    const newHoveredId = over.id as number;
    
    // Only update hovered ID if it changed
    if (hoveredId !== newHoveredId) {
      setHoveredId(newHoveredId);
      lastDropModeRef.current = null; // Reset mode when hovering new element
    }

    // Find dragged and target pages
    const draggedPage = filteredPages.find(p => p.page_id === active.id);
    const targetPage = filteredPages.find(p => p.page_id === over.id);

    if (!draggedPage || !targetPage) {
      return;
    }

    // INTELLIGENT MODE DETECTION: If dragged page is already a child of target page,
    // only allow sibling mode (no point making it a child again)
    const isAlreadyChild = draggedPage.parent_slug === targetPage.page_slug;

    if (isAlreadyChild) {
      // Force sibling mode when already a child
      if (dropMode !== 'sibling') {
        setDropMode('sibling');
        lastDropModeRef.current = 'sibling';
      }
      return;
    }

    // Calculate drop mode with hysteresis to prevent oscillation
    const overElement = document.querySelector(`[data-page-id="${over.id}"]`) as HTMLElement | null;
    const clientY = event.activatorEvent?.clientY as number | undefined;

    if (!overElement || clientY == null) {
      return;
    }

    const rect = overElement.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const relativePosition = relativeY / rect.height; // 0 to 1

    let newMode: 'sibling' | 'child';

    // Hysteresis logic: larger dead zones to prevent oscillation
    if (lastDropModeRef.current === null) {
      // Initial determination
      newMode = relativePosition < 0.5 ? 'sibling' : 'child';
    } else {
      // Use hysteresis: only switch if clearly in the other zone
      if (lastDropModeRef.current === 'sibling') {
        // Stay sibling unless clearly in child zone (> 60%)
        newMode = relativePosition > 0.6 ? 'child' : 'sibling';
      } else {
        // Stay child unless clearly in sibling zone (< 40%)
        newMode = relativePosition < 0.4 ? 'sibling' : 'child';
      }
    }

    // Only update if mode actually changed
    if (newMode !== dropMode) {
      setDropMode(newMode);
      lastDropModeRef.current = newMode;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (!over || active.id === over.id) {
      // Reset hover states and ref
      setDropMode(null);
      setHoveredId(null);
      lastDropModeRef.current = null;
      return;
    }

    const oldIndex = filteredPages.findIndex((p) => p.page_id === active.id);
    const newIndex = filteredPages.findIndex((p) => p.page_id === over.id);

    const movedPage = filteredPages[oldIndex];
    const targetPage = filteredPages[newIndex];

    // Intelligent: if moved page is already a direct child of target page,
    // force sibling mode even if the UI thought "child".
    let effectiveDropMode: 'sibling' | 'child' | null = dropMode;
    const isAlreadyDirectChild = movedPage?.parent_slug === targetPage?.page_slug;

    if (isAlreadyDirectChild && effectiveDropMode === 'child') {
      effectiveDropMode = 'sibling';
    }

    try {
      // Check if same parent (reordering within same level)
      if (movedPage.parent_slug === targetPage.parent_slug && effectiveDropMode === 'sibling') {
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
        // Moving to different hierarchy level OR making child
        
        // CRITICAL: Prevent moving a page under itself or its own children
        if (effectiveDropMode === 'child') {
          // Check if target page is the moved page itself or a descendant
          let currentCheck = targetPage;
          let isDescendant = false;
          
          while (currentCheck && !isDescendant) {
            if (currentCheck.page_id === movedPage.page_id) {
              isDescendant = true;
              break;
            }
            // Check if current page is a child of moved page
            if (currentCheck.parent_slug === movedPage.page_slug) {
              isDescendant = true;
              break;
            }
            // Move up the hierarchy
            currentCheck = pages.find(p => p.page_slug === currentCheck.parent_slug) || null;
          }
          
          if (isDescendant || targetPage.page_id === movedPage.page_id) {
            toast.error("Kann eine Seite nicht unter sich selbst oder ihre eigenen Kinder verschieben");
            // Reset hover states and ref
            setDropMode(null);
            setHoveredId(null);
            lastDropModeRef.current = null;
            return;
          }
        }
        
        let newParentSlug: string | null;
        let newParentId: number | null;
        let newPageSlug: string;
        
        if (effectiveDropMode === 'child') {
          // Make moved page a child of target page
          newParentSlug = targetPage.page_slug;
          newParentId = targetPage.page_id;
          const pageBaseName = movedPage.page_slug.split('/').pop()!;
          newPageSlug = `${targetPage.page_slug}/${pageBaseName}`;
          
          // SAFETY CHECK: Prevent slug from getting too deep (max 6 levels)
          const slugDepth = newPageSlug.split('/').length;
          if (slugDepth > 6) {
            toast.error("Maximale Verschachtelungstiefe erreicht (6 Ebenen)");
            setDropMode(null);
            setHoveredId(null);
            lastDropModeRef.current = null;
            return;
          }
          
          // SAFETY CHECK: Prevent duplicate slug segments (infinite nesting bug)
          const slugParts = newPageSlug.split('/');
          const lastPart = slugParts[slugParts.length - 1];
          const duplicateCount = slugParts.filter(p => p === lastPart).length;
          if (duplicateCount > 1) {
            toast.error("Ungültige Verschachtelung erkannt - Seite ist bereits unter diesem Pfad");
            setDropMode(null);
            setHoveredId(null);
            lastDropModeRef.current = null;
            return;
          }
          
          toast.success(`"${movedPage.page_title}" als Kind unter "${targetPage.page_title}" verschoben`);
        } else {
          // Make moved page a sibling of target page
          newParentSlug = targetPage.parent_slug;
          newParentId = targetPage.parent_id;
          const pageBaseName = movedPage.page_slug.split('/').pop()!;
          
          if (newParentSlug) {
            newPageSlug = `${newParentSlug}/${pageBaseName}`;
          } else {
            newPageSlug = pageBaseName;
          }
          
          toast.success(`"${movedPage.page_title}" als Geschwister von "${targetPage.page_title}" verschoben`);
        }

        const oldSlug = movedPage.page_slug;
        
        // Skip if nothing actually changes
        if (oldSlug === newPageSlug && movedPage.parent_slug === newParentSlug) {
          setDropMode(null);
          setHoveredId(null);
          lastDropModeRef.current = null;
          return;
        }
        
        // Calculate new position
        const newPosition = targetPage.position + 1;

        // Update the moved page's parent, slug, and position
        const { error: updateError } = await supabase
          .from('page_registry')
          .update({ 
            parent_slug: newParentSlug,
            parent_id: newParentId,
            page_slug: newPageSlug,
            position: newPosition
          })
          .eq('page_id', movedPage.page_id);

        if (updateError) throw updateError;

        // Update related tables in parallel for better performance
        await Promise.all([
          // Update segment_registry
          supabase
            .from('segment_registry')
            .update({ page_slug: newPageSlug })
            .eq('page_slug', oldSlug),
          
          // Update page_content
          supabase
            .from('page_content')
            .update({ page_slug: newPageSlug })
            .eq('page_slug', oldSlug),
          
          // Update navigation_links
          supabase
            .from('navigation_links')
            .update({ slug: newPageSlug })
            .eq('slug', oldSlug)
        ]);

        // Update child pages ONLY if slug changed (recursively update all descendants)
        if (oldSlug !== newPageSlug) {
          const updateDescendants = async (parentOldSlug: string, parentNewSlug: string) => {
            const { data: directChildren } = await supabase
              .from('page_registry')
              .select('*')
              .eq('parent_slug', parentOldSlug);

            if (!directChildren || directChildren.length === 0) return;

            for (const child of directChildren) {
              const childBaseName = child.page_slug.split('/').pop()!;
              const newChildSlug = `${parentNewSlug}/${childBaseName}`;
              
              // Update page_registry for child
              await supabase
                .from('page_registry')
                .update({ 
                  parent_slug: parentNewSlug,
                  page_slug: newChildSlug
                })
                .eq('page_id', child.page_id);

              // Update related tables for child
              await Promise.all([
                supabase
                  .from('segment_registry')
                  .update({ page_slug: newChildSlug })
                  .eq('page_slug', child.page_slug),
                
                supabase
                  .from('page_content')
                  .update({ page_slug: newChildSlug })
                  .eq('page_slug', child.page_slug),
                
                supabase
                  .from('navigation_links')
                  .update({ slug: newChildSlug })
                  .eq('slug', child.page_slug)
              ]);

              // Recursively update grandchildren
              await updateDescendants(child.page_slug, newChildSlug);
            }
          };

          await updateDescendants(oldSlug, newPageSlug);
        }

        // Shift positions of pages AFTER the update (avoid double-counting)
        const pagesToShift = pages.filter(p => 
          p.parent_slug === newParentSlug && 
          p.position >= newPosition && 
          p.page_id !== movedPage.page_id
        );

        if (pagesToShift.length > 0) {
          await Promise.all(
            pagesToShift.map(page =>
              supabase
                .from('page_registry')
                .update({ position: page.position + 1 })
                .eq('page_id', page.page_id)
            )
          );
        }
      }

      // Reload pages to refresh UI with correct hierarchy
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
    getCtaBadge: (page: CMSPage) => JSX.Element | null;
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
        className="border-gray-700 hover:bg-gray-800 relative"
        data-page-id={page.page_id}
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
        <TableCell>
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
              Edit
            </Button>
          </Link>
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
            {getCtaBadge(page)}
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
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-[#f9dc24] flex items-center gap-2">
            <Layers className="h-6 w-6" />
            CMS Hub
          </DialogTitle>
          
          {/* Fixed Drop Mode Indicator - only show during active drag */}
          {isDragging && dropMode && (
            <div className="absolute top-2 right-2 z-50">
              <Badge 
                className={`text-sm font-semibold px-3 py-1.5 ${
                  dropMode === 'sibling' 
                    ? 'bg-blue-600 text-white border-blue-400' 
                    : 'bg-purple-600 text-white border-purple-400'
                } border-2 shadow-lg`}
              >
                {dropMode === 'sibling' ? '↔️ Als Geschwister einfügen' : '↓ Als Kind einfügen'}
              </Badge>
            </div>
          )}
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Page ID, Title, or Slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
          />
        </div>
        
        {/* Drag & Drop Help */}
        <div className="mb-4 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-400 flex items-center gap-2">
          <GripVertical className="h-3 w-3 text-[#f9dc24]" />
          <span>
            <strong className="text-white">Drag & Drop:</strong> Obere Hälfte = Als Geschwister | Untere Hälfte = Als Kind
          </span>
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
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            onDragCancel={handleDragCancel}
          >
            <Table>
              <TableHeader className="sticky top-0 bg-gray-800 z-10">
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300 font-bold w-12"></TableHead>
                  <TableHead className="text-gray-300 font-bold">Page ID</TableHead>
                  <TableHead className="text-gray-300 font-bold">Edit</TableHead>
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
                      getCtaBadge={getCtaBadge}
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
