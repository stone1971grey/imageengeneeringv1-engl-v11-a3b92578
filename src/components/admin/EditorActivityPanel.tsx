import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  History, RotateCcw, Eye, Calendar, User, Layers, Globe, 
  FileText, Search, Download, Filter, Clock, ChevronDown,
  ChevronRight, ArrowUpDown, TrendingUp, AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format, isToday, isYesterday, parseISO, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { createContentBackup } from "@/utils/createContentBackup";

interface BackupEntry {
  id: string;
  page_slug: string;
  section_key: string;
  language: string;
  content_type: string;
  content_value: string;
  backup_created_at: string;
  original_updated_at: string | null;
  original_updated_by: string | null;
}

interface EditorProfile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
}

interface EditorActivityPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "EN",
  de: "DE",
  ja: "JP",
  ko: "KO",
  zh: "ZH",
};

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

export const EditorActivityPanel = ({ open, onOpenChange }: EditorActivityPanelProps) => {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editors, setEditors] = useState<EditorProfile[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  
  // Filters
  const [selectedEditor, setSelectedEditor] = useState<string>("all");
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("week");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Preview/Restore
  const [previewEntry, setPreviewEntry] = useState<BackupEntry | null>(null);
  const [restoreEntry, setRestoreEntry] = useState<BackupEntry | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  
  // Expanded sections
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadEditors();
      loadPages();
      loadBackups();
    }
  }, [open]);

  // Reload backups when filters change
  useEffect(() => {
    if (open) {
      loadBackups();
    }
  }, [selectedEditor, selectedPage, selectedLanguage, dateRange]);

  const loadEditors = async () => {
    try {
      const { data: backupUsers } = await supabase
        .from("page_content_backups")
        .select("original_updated_by")
        .not("original_updated_by", "is", null);
      
      const uniqueUserIds = [...new Set((backupUsers || []).map(b => b.original_updated_by))];
      
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, username, full_name")
          .in("id", uniqueUserIds);
        
        setEditors(profiles || []);
      }
    } catch (error) {
      console.error("Error loading editors:", error);
    }
  };

  const loadPages = async () => {
    try {
      const { data } = await supabase
        .from("page_content_backups")
        .select("page_slug");
      
      const uniquePages = [...new Set((data || []).map(b => b.page_slug))].sort();
      setPages(uniquePages);
    } catch (error) {
      console.error("Error loading pages:", error);
    }
  };

  const loadBackups = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("page_content_backups")
        .select("*")
        .order("backup_created_at", { ascending: false })
        .limit(500);

      if (selectedEditor !== "all") {
        query = query.eq("original_updated_by", selectedEditor);
      }
      if (selectedPage !== "all") {
        query = query.eq("page_slug", selectedPage);
      }
      if (selectedLanguage !== "all") {
        query = query.eq("language", selectedLanguage);
      }

      // Date filtering
      if (dateRange !== "all") {
        const now = new Date();
        let startDate: Date;
        
        switch (dateRange) {
          case "today":
            startDate = startOfDay(now);
            break;
          case "yesterday":
            startDate = startOfDay(subDays(now, 1));
            break;
          case "week":
            startDate = subDays(now, 7);
            break;
          case "month":
            startDate = subDays(now, 30);
            break;
          default:
            startDate = subDays(now, 7);
        }
        query = query.gte("backup_created_at", startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading backups:", error);
        toast.error("Failed to load activity history");
        return;
      }

      setBackups(data || []);
      
      // Auto-expand first date group
      if (data && data.length > 0) {
        const firstDate = getDateGroupKey(parseISO(data[0].backup_created_at));
        setExpandedDates({ [firstDate]: true });
      }
    } catch (error) {
      console.error("Error loading backups:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEditorName = (userId: string | null) => {
    if (!userId) return "System";
    const editor = editors.find(e => e.id === userId);
    if (!editor) return "Unknown";
    return editor.full_name || editor.username || editor.email.split("@")[0];
  };

  const getEditorEmail = (userId: string | null) => {
    if (!userId) return null;
    const editor = editors.find(e => e.id === userId);
    return editor?.email || null;
  };

  const getDateGroupKey = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM dd, yyyy");
  };

  const groupBackupsByDate = (entries: BackupEntry[]) => {
    const groups: Record<string, BackupEntry[]> = {};
    
    entries.forEach(entry => {
      const date = parseISO(entry.backup_created_at);
      const key = getDateGroupKey(date);
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });
    
    return groups;
  };

  const formatSegmentName = (key: string) => {
    if (/^\d+$/.test(key)) return `Segment #${key}`;
    if (key === "page_segments") return "Page Structure";
    if (key === "seo") return "SEO Settings";
    if (key === "tab_order") return "Tab Order";
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getChangeType = (entry: BackupEntry): { type: string; color: string } => {
    const key = entry.section_key.toLowerCase();
    
    if (key === "page_segments") return { type: "Structure", color: "bg-purple-600" };
    if (key === "seo") return { type: "SEO", color: "bg-blue-600" };
    if (key.includes("hero")) return { type: "Hero", color: "bg-orange-600" };
    if (key.includes("intro")) return { type: "Intro", color: "bg-green-600" };
    if (key.includes("image") || key.includes("banner")) return { type: "Media", color: "bg-pink-600" };
    if (key.includes("text")) return { type: "Text", color: "bg-cyan-600" };
    if (/^\d+$/.test(key)) return { type: "Segment", color: "bg-gray-600" };
    
    return { type: "Content", color: "bg-gray-600" };
  };

  const getChangeImpact = (entry: BackupEntry): { level: "minor" | "moderate" | "major"; label: string } => {
    try {
      const content = JSON.parse(entry.content_value);
      const contentStr = JSON.stringify(content);
      
      // Major: page structure, SEO changes
      if (entry.section_key === "page_segments" || entry.section_key === "seo") {
        return { level: "major", label: "Major" };
      }
      
      // Estimate based on content size
      if (contentStr.length > 5000) return { level: "major", label: "Major" };
      if (contentStr.length > 1000) return { level: "moderate", label: "Moderate" };
      return { level: "minor", label: "Minor" };
    } catch {
      return { level: "minor", label: "Minor" };
    }
  };

  const getContentSummary = (entry: BackupEntry): string => {
    try {
      const parsed = JSON.parse(entry.content_value);
      
      if (parsed.title) return parsed.title;
      if (parsed.headline) return parsed.headline;
      if (Array.isArray(parsed)) return `${parsed.length} items`;
      
      return "Content updated";
    } catch {
      return entry.content_value.slice(0, 50) + "...";
    }
  };

  // Filter by search query
  const filteredBackups = useMemo(() => {
    if (!searchQuery.trim()) return backups;
    
    const query = searchQuery.toLowerCase();
    return backups.filter(entry => {
      const editorName = getEditorName(entry.original_updated_by).toLowerCase();
      const pageName = entry.page_slug.toLowerCase();
      const segmentName = formatSegmentName(entry.section_key).toLowerCase();
      const content = entry.content_value.toLowerCase();
      
      return editorName.includes(query) || 
             pageName.includes(query) || 
             segmentName.includes(query) ||
             content.includes(query);
    });
  }, [backups, searchQuery, editors]);

  const groupedBackups = groupBackupsByDate(filteredBackups);

  // Statistics
  const stats = useMemo(() => {
    const editorCounts: Record<string, number> = {};
    const pageCounts: Record<string, number> = {};
    
    filteredBackups.forEach(entry => {
      const editorId = entry.original_updated_by || "system";
      editorCounts[editorId] = (editorCounts[editorId] || 0) + 1;
      pageCounts[entry.page_slug] = (pageCounts[entry.page_slug] || 0) + 1;
    });
    
    const topEditor = Object.entries(editorCounts).sort((a, b) => b[1] - a[1])[0];
    const topPage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalChanges: filteredBackups.length,
      uniqueEditors: Object.keys(editorCounts).length,
      uniquePages: Object.keys(pageCounts).length,
      topEditor: topEditor ? { id: topEditor[0], count: topEditor[1] } : null,
      topPage: topPage ? { slug: topPage[0], count: topPage[1] } : null,
    };
  }, [filteredBackups]);

  const handleRestore = async () => {
    if (!restoreEntry) return;
    
    setRestoring(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        toast.error("Not authenticated");
        return;
      }

      // Create backup before restoring
      await createContentBackup(restoreEntry.page_slug, restoreEntry.section_key, restoreEntry.language);

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
        toast.error("Failed to restore version");
        return;
      }

      toast.success(`Restored "${formatSegmentName(restoreEntry.section_key)}" on ${restoreEntry.page_slug}`);
      setRestoreEntry(null);
      loadBackups();
    } catch (error) {
      console.error("Error restoring:", error);
      toast.error("Failed to restore version");
    } finally {
      setRestoring(false);
    }
  };

  const loadCurrentContent = async (entry: BackupEntry) => {
    setLoadingCurrent(true);
    try {
      const { data } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", entry.page_slug)
        .eq("section_key", entry.section_key)
        .eq("language", entry.language)
        .maybeSingle();

      setCurrentContent(data?.content_value || null);
    } catch (error) {
      console.error("Error loading current content:", error);
    } finally {
      setLoadingCurrent(false);
    }
  };

  const handlePreviewOpen = (entry: BackupEntry) => {
    setPreviewEntry(entry);
    setCurrentContent(null);
    loadCurrentContent(entry);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Time", "Editor", "Email", "Page", "Segment", "Language", "Change Type", "Impact"];
    const rows = filteredBackups.map(entry => {
      const date = parseISO(entry.backup_created_at);
      const changeType = getChangeType(entry);
      const impact = getChangeImpact(entry);
      
      return [
        format(date, "yyyy-MM-dd"),
        format(date, "HH:mm:ss"),
        getEditorName(entry.original_updated_by),
        getEditorEmail(entry.original_updated_by) || "",
        entry.page_slug,
        formatSegmentName(entry.section_key),
        entry.language,
        changeType.type,
        impact.label
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `editor-activity-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Exported activity log to CSV");
  };

  const renderDiff = (backupJson: string, currentJson: string) => {
    try {
      const backup = JSON.parse(backupJson);
      const current = JSON.parse(currentJson);
      
      const backupFormatted = JSON.stringify(backup, null, 2).split('\n');
      const currentFormatted = JSON.stringify(current, null, 2).split('\n');
      
      const maxLines = Math.max(backupFormatted.length, currentFormatted.length);
      const diffLines: { backup: string; current: string; changed: boolean }[] = [];
      
      for (let i = 0; i < maxLines; i++) {
        diffLines.push({
          backup: backupFormatted[i] || '',
          current: currentFormatted[i] || '',
          changed: backupFormatted[i] !== currentFormatted[i]
        });
      }
      
      return diffLines;
    } catch {
      return [{ backup: backupJson, current: currentJson, changed: backupJson !== currentJson }];
    }
  };

  const toggleDateExpanded = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-[1400px] h-[80vh] !top-[120px] flex flex-col bg-gray-900 border-gray-700 text-white p-0">
          <DialogHeader className="px-6 py-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#f9dc24] flex items-center justify-center">
                  <History className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">Editor Activity</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Track and review all content changes across the CMS
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Stats Bar */}
            <div className="px-6 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#f9dc24]" />
                <span className="text-sm text-gray-400">Total Changes:</span>
                <span className="text-lg font-bold text-white">{stats.totalChanges}</span>
              </div>
              <div className="h-6 w-px bg-gray-600" />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-400">Editors:</span>
                <span className="text-lg font-bold text-white">{stats.uniqueEditors}</span>
              </div>
              <div className="h-6 w-px bg-gray-600" />
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-400">Pages:</span>
                <span className="text-lg font-bold text-white">{stats.uniquePages}</span>
              </div>
              {stats.topEditor && (
                <>
                  <div className="h-6 w-px bg-gray-600" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Top Editor:</span>
                    <Badge className="bg-blue-600 text-white">
                      {getEditorName(stats.topEditor.id)} ({stats.topEditor.count})
                    </Badge>
                  </div>
                </>
              )}
            </div>
            
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/30">
              <div className="flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search editor, page, content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  />
                </div>
                
                {/* Editor Filter */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="All Editors" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">All Editors</SelectItem>
                      {editors.map(editor => (
                        <SelectItem key={editor.id} value={editor.id} className="text-white hover:bg-gray-700">
                          {editor.full_name || editor.username || editor.email.split("@")[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Page Filter */}
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="All Pages" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 max-h-[300px]">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">All Pages</SelectItem>
                      {pages.map(page => (
                        <SelectItem key={page} value={page} className="text-white hover:bg-gray-700">
                          {page}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Language Filter */}
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[120px] bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">All</SelectItem>
                      <SelectItem value="en" className="text-white hover:bg-gray-700">English</SelectItem>
                      <SelectItem value="de" className="text-white hover:bg-gray-700">Deutsch</SelectItem>
                      <SelectItem value="ja" className="text-white hover:bg-gray-700">日本語</SelectItem>
                      <SelectItem value="ko" className="text-white hover:bg-gray-700">한국어</SelectItem>
                      <SelectItem value="zh" className="text-white hover:bg-gray-700">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[150px] bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {DATE_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value} className="text-white hover:bg-gray-700">
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Activity Timeline */}
            <ScrollArea className="flex-1 px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin h-8 w-8 border-4 border-[#f9dc24] border-t-transparent rounded-full" />
                </div>
              ) : Object.keys(groupedBackups).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No activity found</p>
                  <p className="text-sm mt-2">Try adjusting your filters or date range</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedBackups).map(([dateGroup, entries]) => (
                    <Collapsible
                      key={dateGroup}
                      open={expandedDates[dateGroup] ?? false}
                      onOpenChange={() => toggleDateExpanded(dateGroup)}
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors border border-gray-700">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-[#f9dc24]" />
                            <span className="text-lg font-semibold text-white">{dateGroup}</span>
                            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                              {entries.length} {entries.length === 1 ? "change" : "changes"}
                            </Badge>
                          </div>
                          {expandedDates[dateGroup] ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2 ml-4 border-l-2 border-gray-700 pl-4 space-y-2">
                        {entries.map((entry) => {
                          const changeType = getChangeType(entry);
                          const impact = getChangeImpact(entry);
                          
                          return (
                            <div 
                              key={entry.id}
                              className="flex items-start justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700/50"
                            >
                              <div className="flex-1 min-w-0">
                                {/* Time and Type Badges */}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Clock className="h-3.5 w-3.5 text-gray-500" />
                                  <span className="text-sm font-bold text-[#f9dc24]">
                                    {format(parseISO(entry.backup_created_at), "HH:mm")}
                                  </span>
                                  <Badge className={`${changeType.color} text-white text-xs`}>
                                    {changeType.type}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      impact.level === "major" 
                                        ? "border-red-500 text-red-400" 
                                        : impact.level === "moderate" 
                                        ? "border-yellow-500 text-yellow-400"
                                        : "border-gray-500 text-gray-400"
                                    }`}
                                  >
                                    {impact.label}
                                  </Badge>
                                  <Badge className="bg-gray-600 text-white text-xs">
                                    {LANGUAGE_LABELS[entry.language] || entry.language}
                                  </Badge>
                                </div>
                                
                                {/* Page & Segment */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-blue-400">
                                    {entry.page_slug}
                                  </span>
                                  <span className="text-gray-500">→</span>
                                  <span className="text-sm text-white">
                                    {formatSegmentName(entry.section_key)}
                                  </span>
                                </div>
                                
                                {/* Content Summary */}
                                <p className="text-sm text-gray-400 truncate max-w-[500px]">
                                  {getContentSummary(entry)}
                                </p>
                                
                                {/* Editor Info */}
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <User className="h-3 w-3" />
                                  <span>{getEditorName(entry.original_updated_by)}</span>
                                  {getEditorEmail(entry.original_updated_by) && (
                                    <span className="text-gray-600">
                                      ({getEditorEmail(entry.original_updated_by)})
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreviewOpen(entry)}
                                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRestoreEntry(entry)}
                                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/30"
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Restore
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={!!previewEntry} onOpenChange={() => setPreviewEntry(null)}>
        <DialogContent className="max-w-[900px] max-h-[80vh] overflow-hidden bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Preview
              {previewEntry && (
                <span className="text-gray-400 font-normal text-sm ml-2">
                  {previewEntry.page_slug} → {formatSegmentName(previewEntry.section_key)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {previewEntry && (
            <Tabs defaultValue="backup" className="flex-1">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="backup" className="data-[state=active]:bg-[#f9dc24] data-[state=active]:text-gray-900">
                  Backup Version
                </TabsTrigger>
                <TabsTrigger value="current" className="data-[state=active]:bg-[#f9dc24] data-[state=active]:text-gray-900">
                  Current Version
                </TabsTrigger>
                <TabsTrigger value="diff" className="data-[state=active]:bg-[#f9dc24] data-[state=active]:text-gray-900">
                  Compare
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-[400px] mt-4">
                <TabsContent value="backup" className="m-0">
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                    {JSON.stringify(JSON.parse(previewEntry.content_value), null, 2)}
                  </pre>
                </TabsContent>
                
                <TabsContent value="current" className="m-0">
                  {loadingCurrent ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin h-6 w-6 border-3 border-[#f9dc24] border-t-transparent rounded-full" />
                    </div>
                  ) : currentContent ? (
                    <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(currentContent), null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No current content found</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="diff" className="m-0">
                  {loadingCurrent ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin h-6 w-6 border-3 border-[#f9dc24] border-t-transparent rounded-full" />
                    </div>
                  ) : currentContent ? (
                    <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-green-400 mb-2">Backup (restore to this)</h4>
                          <div className="space-y-0.5">
                            {renderDiff(previewEntry.content_value, currentContent).map((line, i) => (
                              <div 
                                key={i} 
                                className={`font-mono text-xs px-2 py-0.5 ${
                                  line.changed ? 'bg-green-900/40 text-green-300' : 'text-gray-400'
                                }`}
                              >
                                {line.backup || '\u00A0'}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-red-400 mb-2">Current</h4>
                          <div className="space-y-0.5">
                            {renderDiff(previewEntry.content_value, currentContent).map((line, i) => (
                              <div 
                                key={i} 
                                className={`font-mono text-xs px-2 py-0.5 ${
                                  line.changed ? 'bg-red-900/40 text-red-300' : 'text-gray-400'
                                }`}
                              >
                                {line.current || '\u00A0'}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Cannot compare - no current content</p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPreviewEntry(null)} className="bg-gray-700 border-gray-600 text-white">
              Close
            </Button>
            <Button 
              onClick={() => {
                if (previewEntry) {
                  setRestoreEntry(previewEntry);
                  setPreviewEntry(null);
                }
              }}
              className="bg-[#f9dc24] text-gray-900 hover:bg-[#f9dc24]/90"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreEntry} onOpenChange={() => setRestoreEntry(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-400" />
              Confirm Restore
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to restore this version?
            </DialogDescription>
          </DialogHeader>
          
          {restoreEntry && (
            <div className="py-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Page:</span>
                <span className="text-white font-medium">{restoreEntry.page_slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Segment:</span>
                <span className="text-white font-medium">{formatSegmentName(restoreEntry.section_key)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Language:</span>
                <span className="text-white font-medium">{restoreEntry.language.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">From:</span>
                <span className="text-white font-medium">
                  {format(parseISO(restoreEntry.backup_created_at), "MMM dd, yyyy 'at' HH:mm")}
                </span>
              </div>
              
              <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700 rounded-lg">
                <p className="text-sm text-orange-300">
                  The current content will be backed up before restoring.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreEntry(null)} className="bg-gray-700 border-gray-600 text-white">
              Cancel
            </Button>
            <Button 
              onClick={handleRestore}
              disabled={restoring}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {restoring ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Version
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
