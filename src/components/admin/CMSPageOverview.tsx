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
import { Search, ExternalLink, FileText, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { EditSlugDialog } from "./EditSlugDialog";

interface CMSPage {
  page_id: number;
  page_slug: string;
  page_title: string;
  parent_slug: string | null;
  parent_id: number | null;
  created_at: string;
  segment_count: number;
}

export const CMSPageOverview = () => {
  const { language } = useLanguage();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<CMSPage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      // Load all pages from page_registry
      const { data: pagesData, error: pagesError } = await supabase
        .from("page_registry")
        .select("*")
        .order("page_id", { ascending: true });

      if (pagesError) throw pagesError;

      // Load segment counts for each page
      const { data: segmentsData, error: segmentsError } = await supabase
        .from("segment_registry")
        .select("page_slug")
        .eq("deleted", false);

      if (segmentsError) throw segmentsError;

      // Count segments per page_slug
      const segmentCounts = segmentsData.reduce((acc, seg) => {
        acc[seg.page_slug] = (acc[seg.page_slug] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Merge data
      const enrichedPages: CMSPage[] = (pagesData || []).map((page) => ({
        page_id: page.page_id,
        page_slug: page.page_slug,
        page_title: page.page_title,
        parent_slug: page.parent_slug,
        parent_id: page.parent_id,
        created_at: page.created_at || "",
        segment_count: segmentCounts[page.page_slug] || 0,
      }));

      setPages(enrichedPages);
      setFilteredPages(enrichedPages);
    } catch (error) {
      console.error("Error loading CMS pages:", error);
    } finally {
      setLoading(false);
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

  const getPageUrl = (pageId: number) => {
    // Use Page ID Router for reliable routing with language prefix
    return `/${language}/${pageId}`;
  };
  
  const getEditUrl = (slug: string) => {
    // Extract last part of slug for admin-dashboard navigation
    const lastPart = slug.split('/').filter(Boolean).slice(-1)[0] || slug;
    return `/${language}/admin-dashboard?page=${lastPart}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-[#f9dc24]"
        >
          <FileText className="h-4 w-4 mr-2" />
          CMS Pages Overview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#f9dc24] flex items-center gap-2">
            <Layers className="h-6 w-6" />
            CMS Pages Overview
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
          <Table>
            <TableHeader className="sticky top-0 bg-gray-800 z-10">
              <TableRow className="border-gray-700 hover:bg-gray-800">
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
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    Loading pages...
                  </TableCell>
                </TableRow>
              ) : filteredPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    {searchQuery ? "No pages found matching your search." : "No CMS pages found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow key={page.page_id} className="border-gray-700 hover:bg-gray-800">
                    <TableCell className="font-mono text-[#f9dc24] font-bold">
                      {page.page_id}
                    </TableCell>
                    <TableCell className="text-white font-medium">{page.page_title}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-400">
                      {page.page_slug}
                    </TableCell>
                    <TableCell>{getCategoryBadge(page.page_slug)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {page.parent_slug || <span className="text-gray-600 italic">none</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={page.segment_count > 0 ? "default" : "outline"}
                        className={
                          page.segment_count > 0
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-400"
                        }
                      >
                        {page.segment_count}
                      </Badge>
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
                            className="bg-gray-700 border-gray-600 text-white hover:bg-[#f9dc24] hover:text-black hover:border-[#f9dc24]"
                          >
                            Edit
                          </Button>
                        </Link>
                        <EditSlugDialog
                          pageId={page.page_id}
                          currentSlug={page.page_slug}
                          pageTitle={page.page_title}
                          onSlugUpdated={loadPages}
                        />
                        <a
                          href={getPageUrl(page.page_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
