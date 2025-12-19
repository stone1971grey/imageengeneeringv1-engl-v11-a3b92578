import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { History, RotateCcw, Eye, Calendar, User, Filter, Layers } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { de } from "date-fns/locale";

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

interface VersionHistoryPanelProps {
  pageSlug: string;
  currentLanguage: string;
  onRestore?: () => void;
}

export const VersionHistoryPanel = ({ pageSlug, currentLanguage, onRestore }: VersionHistoryPanelProps) => {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [previewEntry, setPreviewEntry] = useState<BackupEntry | null>(null);
  const [restoreEntry, setRestoreEntry] = useState<BackupEntry | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pageSlug) {
      loadBackups();
    }
  }, [pageSlug, selectedSegment, selectedLanguage]);

  const loadBackups = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("page_content_backups")
        .select("*")
        .eq("page_slug", pageSlug)
        .order("backup_created_at", { ascending: false })
        .limit(100);

      if (selectedSegment !== "all") {
        query = query.eq("section_key", selectedSegment);
      }
      if (selectedLanguage !== "all") {
        query = query.eq("language", selectedLanguage);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading backups:", error);
        toast.error("Failed to load version history");
        return;
      }

      setBackups(data || []);

      // Extract unique segments for filter
      const segments = [...new Set((data || []).map(b => b.section_key))];
      setAvailableSegments(segments);

      // Load user emails for display
      const userIds = [...new Set((data || []).filter(b => b.original_updated_by).map(b => b.original_updated_by!))] ;
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

  const handleRestore = async () => {
    if (!restoreEntry) return;
    
    setRestoring(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        toast.error("Not authenticated");
        return;
      }

      // Restore the content
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

      toast.success(`Restored "${restoreEntry.section_key}" to version from ${format(parseISO(restoreEntry.backup_created_at), "dd.MM.yyyy HH:mm")}`);
      setRestoreEntry(null);
      onRestore?.();
    } catch (error) {
      console.error("Error restoring:", error);
      toast.error("Failed to restore version");
    } finally {
      setRestoring(false);
    }
  };

  const groupBackupsByDate = (entries: BackupEntry[]) => {
    const groups: Record<string, BackupEntry[]> = {};
    
    entries.forEach(entry => {
      const date = parseISO(entry.backup_created_at);
      let key: string;
      
      if (isToday(date)) {
        key = "Today";
      } else if (isYesterday(date)) {
        key = "Yesterday";
      } else {
        key = format(date, "dd. MMMM yyyy", { locale: de });
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });
    
    return groups;
  };

  const formatSegmentName = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/dynamic segment \d+/, match => `Segment ${match.split(" ")[2]}`)
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPreviewContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "string") return parsed.slice(0, 200);
      if (parsed.title) return parsed.title;
      if (parsed.headline) return parsed.headline;
      if (Array.isArray(parsed)) return `${parsed.length} items`;
      return JSON.stringify(parsed).slice(0, 200);
    } catch {
      return content.slice(0, 200);
    }
  };

  const groupedBackups = groupBackupsByDate(backups);

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#f9dc24] flex items-center justify-center">
            <History className="h-5 w-5 text-gray-900" />
          </div>
          Version History
        </CardTitle>
        <CardDescription className="text-gray-600">
          View and restore previous versions of your content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-500" />
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                {availableSegments.map(seg => (
                  <SelectItem key={seg} value={seg}>{formatSegmentName(seg)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-[#f9dc24] border-t-transparent rounded-full" />
            </div>
          ) : Object.keys(groupedBackups).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No version history found for this page</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBackups).map(([dateGroup, entries]) => (
                <div key={dateGroup}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700">{dateGroup}</h3>
                  </div>
                  
                  <div className="space-y-2 ml-6 border-l-2 border-gray-200 pl-4">
                    {entries.map((entry) => (
                      <div 
                        key={entry.id}
                        className="flex items-start justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {format(parseISO(entry.backup_created_at), "HH:mm")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formatSegmentName(entry.section_key)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs uppercase">
                              {entry.language}
                            </Badge>
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
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewEntry(entry)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRestoreEntry(entry)}
                            className="h-8 px-3"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={!!previewEntry} onOpenChange={() => setPreviewEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {previewEntry && formatSegmentName(previewEntry.section_key)}
            </DialogTitle>
            <DialogDescription>
              {previewEntry && format(parseISO(previewEntry.backup_created_at), "dd.MM.yyyy HH:mm:ss")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <pre className="p-4 bg-gray-100 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
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
              Restore this version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreEntry} onOpenChange={() => setRestoreEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="h-5 w-5" />
              Confirm Restore
            </DialogTitle>
            <DialogDescription>
              This will replace the current content of <strong>{restoreEntry && formatSegmentName(restoreEntry.section_key)}</strong> with the version from{" "}
              <strong>{restoreEntry && format(parseISO(restoreEntry.backup_created_at), "dd.MM.yyyy HH:mm")}</strong>.
              <br /><br />
              A backup of the current content will be created automatically.
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
              {restoring ? "Restoring..." : "Yes, restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
