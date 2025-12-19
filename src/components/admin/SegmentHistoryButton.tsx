import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { History, RotateCcw, Eye, User } from "lucide-react";
import { format, parseISO } from "date-fns";

interface BackupEntry {
  id: string;
  page_slug: string;
  section_key: string;
  language: string;
  content_type: string;
  content_value: string;
  backup_created_at: string;
  original_updated_by: string | null;
}

interface SegmentHistoryButtonProps {
  pageSlug: string;
  sectionKey: string;
  language: string;
  onRestore?: () => void;
}

export const SegmentHistoryButton = ({ pageSlug, sectionKey, language, onRestore }: SegmentHistoryButtonProps) => {
  const [open, setOpen] = useState(false);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<BackupEntry | null>(null);
  const [restoreEntry, setRestoreEntry] = useState<BackupEntry | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [hasHistory, setHasHistory] = useState(false);

  // Check if history exists on mount
  useEffect(() => {
    const checkHistory = async () => {
      const { count } = await supabase
        .from("page_content_backups")
        .select("*", { count: "exact", head: true })
        .eq("page_slug", pageSlug)
        .eq("section_key", sectionKey)
        .eq("language", language);
      
      setHasHistory((count || 0) > 0);
    };
    checkHistory();
  }, [pageSlug, sectionKey, language]);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("page_content_backups")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("section_key", sectionKey)
        .eq("language", language)
        .order("backup_created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error loading segment backups:", error);
        toast.error("Failed to load history");
        return;
      }

      setBackups(data || []);

      // Load user emails
      const userIds = [...new Set((data || []).filter(b => b.original_updated_by).map(b => b.original_updated_by!))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, username")
          .in("id", userIds);
        
        if (profiles) {
          const emailMap: Record<string, string> = {};
          profiles.forEach(p => {
            emailMap[p.id] = p.username || p.email.split("@")[0];
          });
          setUserEmails(emailMap);
        }
      }
    } catch (error) {
      console.error("Error loading backups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadBackups();
    }
  };

  const handleRestore = async () => {
    if (!restoreEntry) return;
    
    setRestoring(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from("page_content")
        .upsert({
          page_slug: restoreEntry.page_slug,
          section_key: restoreEntry.section_key,
          language: restoreEntry.language,
          content_type: restoreEntry.content_type,
          content_value: restoreEntry.content_value,
          updated_at: new Date().toISOString(),
          updated_by: currentUser.id
        }, { onConflict: "page_slug,section_key,language" });

      if (error) {
        console.error("Error restoring content:", error);
        toast.error("Failed to restore version");
        return;
      }

      toast.success(`Restored to version from ${format(parseISO(restoreEntry.backup_created_at), "dd.MM.yyyy HH:mm")}`);
      setRestoreEntry(null);
      setOpen(false);
      onRestore?.();
    } catch (error) {
      console.error("Error restoring:", error);
      toast.error("Failed to restore version");
    } finally {
      setRestoring(false);
    }
  };

  const getPreviewContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "string") return parsed.slice(0, 150);
      if (parsed.title) return parsed.title;
      if (parsed.headline) return parsed.headline;
      if (Array.isArray(parsed)) return `${parsed.length} items`;
      return JSON.stringify(parsed).slice(0, 150);
    } catch {
      return content.slice(0, 150);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Dialog open={open} onOpenChange={handleOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${hasHistory ? "text-gray-600 hover:text-[#f9dc24]" : "text-gray-300"}`}
                  disabled={!hasHistory}
                >
                  <History className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-[#f9dc24]" />
                    Version History
                  </DialogTitle>
                  <DialogDescription>
                    Recent versions of this segment ({language.toUpperCase()})
                  </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[400px] pr-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin h-6 w-6 border-4 border-[#f9dc24] border-t-transparent rounded-full" />
                    </div>
                  ) : backups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No history available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {backups.map((entry) => (
                        <div 
                          key={entry.id}
                          className="flex items-start justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {format(parseISO(entry.backup_created_at), "dd.MM.yyyy HH:mm")}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-500 truncate">
                              {getPreviewContent(entry.content_value)}
                            </p>
                            
                            {entry.original_updated_by && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                <User className="h-3 w-3" />
                                {userEmails[entry.original_updated_by] || "Unknown"}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 ml-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewEntry(entry)}
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRestoreEntry(entry)}
                              className="h-7 px-2 text-xs"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasHistory ? "View version history" : "No history available"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Preview Dialog */}
      <Dialog open={!!previewEntry} onOpenChange={() => setPreviewEntry(null)}>
        <DialogContent className="max-w-xl max-h-[70vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </DialogTitle>
            <DialogDescription>
              {previewEntry && format(parseISO(previewEntry.backup_created_at), "dd.MM.yyyy HH:mm:ss")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[40vh]">
            <pre className="p-3 bg-gray-100 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
              {previewEntry && JSON.stringify(JSON.parse(previewEntry.content_value), null, 2)}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewEntry(null)}>
              Close
            </Button>
            <Button onClick={() => {
              setRestoreEntry(previewEntry);
              setPreviewEntry(null);
            }}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation */}
      <Dialog open={!!restoreEntry} onOpenChange={() => setRestoreEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="h-5 w-5" />
              Confirm Restore
            </DialogTitle>
            <DialogDescription>
              Restore to version from{" "}
              <strong>{restoreEntry && format(parseISO(restoreEntry.backup_created_at), "dd.MM.yyyy HH:mm")}</strong>?
              <br /><br />
              Current content will be backed up automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreEntry(null)} disabled={restoring}>
              Cancel
            </Button>
            <Button 
              onClick={handleRestore} 
              disabled={restoring}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {restoring ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
