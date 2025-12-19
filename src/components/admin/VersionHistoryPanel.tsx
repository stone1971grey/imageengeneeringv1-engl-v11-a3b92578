import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { History, RotateCcw, Eye, Calendar, User, Layers, Globe } from "lucide-react";
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

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  all: "Alle Sprachen"
};

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
        toast.error("Fehler beim Laden der Versionshistorie");
        return;
      }

      setBackups(data || []);

      // Extract unique segments for filter
      const segments = [...new Set((data || []).map(b => b.section_key))];
      setAvailableSegments(segments);

      // Load user emails for display
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

  const handleRestore = async () => {
    if (!restoreEntry) return;
    
    setRestoring(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        toast.error("Nicht authentifiziert");
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
        toast.error("Fehler beim Wiederherstellen");
        return;
      }

      toast.success(`"${formatSegmentName(restoreEntry.section_key)}" wiederhergestellt auf Stand vom ${format(parseISO(restoreEntry.backup_created_at), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr`);
      setRestoreEntry(null);
      onRestore?.();
    } catch (error) {
      console.error("Error restoring:", error);
      toast.error("Fehler beim Wiederherstellen");
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
        key = "Heute";
      } else if (isYesterday(date)) {
        key = "Gestern";
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
    // Check if it's a numeric segment ID
    if (/^\d+$/.test(key)) {
      return `Segment #${key}`;
    }
    return key
      .replace(/_/g, " ")
      .replace(/dynamic segment \d+/, match => `Segment ${match.split(" ")[2]}`)
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getContentSummary = (entry: BackupEntry) => {
    try {
      const parsed = JSON.parse(entry.content_value);
      
      // For Intro segments
      if (parsed.title && parsed.description) {
        return {
          type: "Intro",
          preview: parsed.title,
          detail: parsed.description?.slice(0, 80) + (parsed.description?.length > 80 ? "..." : "")
        };
      }
      
      // For page_segments
      if (Array.isArray(parsed)) {
        return {
          type: "Seitenstruktur",
          preview: `${parsed.length} Segmente`,
          detail: parsed.map((s: any) => s.type || "Unbekannt").slice(0, 3).join(", ") + (parsed.length > 3 ? "..." : "")
        };
      }
      
      // For other JSON with title/headline
      if (parsed.title) {
        return {
          type: "Inhalt",
          preview: parsed.title,
          detail: null
        };
      }
      if (parsed.headline) {
        return {
          type: "Inhalt",
          preview: parsed.headline,
          detail: null
        };
      }
      
      // Fallback
      return {
        type: "Inhalt",
        preview: JSON.stringify(parsed).slice(0, 60) + "...",
        detail: null
      };
    } catch {
      return {
        type: "Text",
        preview: entry.content_value.slice(0, 60) + "...",
        detail: null
      };
    }
  };

  const groupedBackups = groupBackupsByDate(backups);

  return (
    <Card className="border-gray-700 bg-gray-900">
      <CardHeader className="border-b border-gray-700 bg-gray-800">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#f9dc24] flex items-center justify-center">
            <History className="h-5 w-5 text-gray-900" />
          </div>
          Versionshistorie
        </CardTitle>
        <CardDescription className="text-gray-400">
          Frühere Versionen anzeigen und wiederherstellen
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-white" />
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Alle Segmente" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-700">Alle Segmente</SelectItem>
                {availableSegments.map(seg => (
                  <SelectItem key={seg} value={seg} className="text-white hover:bg-gray-700">
                    {formatSegmentName(seg)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-white" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[150px] bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Sprache" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white hover:bg-gray-700">Alle Sprachen</SelectItem>
                <SelectItem value="en" className="text-white hover:bg-gray-700">English</SelectItem>
                <SelectItem value="de" className="text-white hover:bg-gray-700">Deutsch</SelectItem>
                <SelectItem value="ja" className="text-white hover:bg-gray-700">日本語</SelectItem>
                <SelectItem value="ko" className="text-white hover:bg-gray-700">한국어</SelectItem>
                <SelectItem value="zh" className="text-white hover:bg-gray-700">中文</SelectItem>
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
            <div className="text-center py-12 text-gray-400">
              <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Keine Versionshistorie für diese Seite gefunden</p>
              <p className="text-sm mt-2">Änderungen werden nach dem nächsten Speichern protokolliert</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBackups).map(([dateGroup, entries]) => (
                <div key={dateGroup}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-white" />
                    <h3 className="text-sm font-semibold text-white">{dateGroup}</h3>
                  </div>
                  
                  <div className="space-y-2 ml-6 border-l-2 border-gray-600 pl-4">
                    {entries.map((entry) => {
                      const summary = getContentSummary(entry);
                      return (
                        <div 
                          key={entry.id}
                          className="flex items-start justify-between p-4 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors border border-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            {/* Time and badges */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm font-bold text-[#f9dc24]">
                                {format(parseISO(entry.backup_created_at), "HH:mm")} Uhr
                              </span>
                              <Badge className="bg-blue-600 text-white text-xs">
                                {formatSegmentName(entry.section_key)}
                              </Badge>
                              <Badge className="bg-gray-600 text-white text-xs uppercase">
                                {LANGUAGE_LABELS[entry.language] || entry.language}
                              </Badge>
                            </div>
                            
                            {/* Content type and preview */}
                            <div className="mb-2">
                              <span className="text-xs text-gray-400 uppercase tracking-wide">
                                {summary.type}:
                              </span>
                              <p className="text-sm text-white font-medium mt-1">
                                {summary.preview}
                              </p>
                              {summary.detail && (
                                <p className="text-xs text-gray-400 mt-1 truncate">
                                  {summary.detail}
                                </p>
                              )}
                            </div>
                            
                            {/* User info */}
                            {entry.original_updated_by && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <User className="h-3 w-3" />
                                <span>Bearbeitet von: {userEmails[entry.original_updated_by] || "Unbekannt"}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewEntry(entry)}
                              className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                              title="Vorschau anzeigen"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRestoreEntry(entry)}
                              className="h-8 px-3 border-[#f9dc24] text-[#f9dc24] hover:bg-[#f9dc24] hover:text-gray-900"
                              title={`Zurück zu Version vom ${format(parseISO(entry.backup_created_at), "dd.MM.yyyy, HH:mm")} Uhr`}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Zurücksetzen
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Preview Dialog */}
      <Dialog open={!!previewEntry} onOpenChange={() => setPreviewEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Eye className="h-5 w-5" />
              Vorschau: {previewEntry && formatSegmentName(previewEntry.section_key)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Stand vom {previewEntry && format(parseISO(previewEntry.backup_created_at), "dd.MM.yyyy, HH:mm:ss", { locale: de })} Uhr
              {" • "}{previewEntry && (LANGUAGE_LABELS[previewEntry.language] || previewEntry.language)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <pre className="p-4 bg-gray-800 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap text-gray-200 border border-gray-700">
              {previewEntry && JSON.stringify(JSON.parse(previewEntry.content_value), null, 2)}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewEntry(null)} className="border-gray-600 text-white hover:bg-gray-800">
              Schließen
            </Button>
            <Button 
              onClick={() => {
                setRestoreEntry(previewEntry);
                setPreviewEntry(null);
              }}
              className="bg-[#f9dc24] text-gray-900 hover:bg-[#e5c820]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Diese Version wiederherstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreEntry} onOpenChange={() => setRestoreEntry(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <RotateCcw className="h-5 w-5" />
              Wiederherstellung bestätigen
            </DialogTitle>
            <DialogDescription className="text-gray-300 space-y-3">
              <p>
                Der aktuelle Inhalt von <strong className="text-white">{restoreEntry && formatSegmentName(restoreEntry.section_key)}</strong> ({restoreEntry && (LANGUAGE_LABELS[restoreEntry.language] || restoreEntry.language)}) wird ersetzt durch:
              </p>
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Ziel-Version:</div>
                <div className="text-white font-medium">
                  {restoreEntry && format(parseISO(restoreEntry.backup_created_at), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr
                </div>
                {restoreEntry && (
                  <div className="text-sm text-gray-400 mt-2">
                    {getContentSummary(restoreEntry).preview}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400">
                💾 Der aktuelle Stand wird automatisch als Backup gespeichert.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreEntry(null)} disabled={restoring} className="border-gray-600 text-white hover:bg-gray-800">
              Abbrechen
            </Button>
            <Button 
              onClick={handleRestore} 
              disabled={restoring}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {restoring ? "Wird wiederhergestellt..." : "Ja, wiederherstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
