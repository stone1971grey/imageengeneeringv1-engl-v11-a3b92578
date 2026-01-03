import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Download, 
  RefreshCw, 
  Check, 
  X, 
  ExternalLink,
  Search,
  ArrowRight,
  FileDown,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { SistrixIcon } from "@/components/icons/SistrixIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RelaunchDashboardProps {
  editorLanguage?: string;
}

interface RankingData {
  keyword: string;
  position: number;
  url: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  traffic: number;
}

interface MappingRow {
  id: string;
  domain: string;
  old_url: string;
  focus_keyword: string | null;
  current_position: number | null;
  search_volume: number | null;
  competition: number | null;
  cpc: number | null;
  traffic_estimate: number | null;
  new_url: string | null;
  new_url_suggestion: string | null;
  approval_status: 'pending' | 'approved' | 'rejected' | 'skipped';
  trend: 'up' | 'stable' | 'down';
  redirect_created: boolean;
  notes: string | null;
  snapshot_date: string;
  approved_at?: string | null;
}

interface PageRegistryItem {
  page_slug: string;
  page_title: string;
}

// Fixed domain for this project
const FIXED_DOMAIN = 'image-engineering.de';

// Items per page options
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 'all'] as const;

export const RelaunchDashboard = ({ editorLanguage = 'en' }: RelaunchDashboardProps) => {
  // Domain is fixed for this project
  const domain = FIXED_DOMAIN;
  const [country, setCountry] = useState<string>(() => {
    return localStorage.getItem('sistrix-country') || 'de';
  });
  
  // States
  const [isOpen, setIsOpen] = useState(() => {
    const cached = localStorage.getItem('seo-relaunch-dashboard-open');
    return cached !== null ? cached === 'true' : true;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mappings, setMappings] = useState<MappingRow[]>([]);
  const [pageRegistry, setPageRegistry] = useState<PageRegistryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting states
  const [sortField, setSortField] = useState<'keyword' | 'position' | 'searchVolume' | 'traffic' | 'redirect' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'all'>(() => {
    const cached = localStorage.getItem('relaunch-page-size');
    if (cached === 'all') return 'all';
    return cached ? parseInt(cached) : 25;
  });
  
  // Editing state for new URL input
  const [editingNewUrl, setEditingNewUrl] = useState<Record<string, string>>({});
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    redirectsCreated: 0
  });
  
  // Persist collapsible state
  useEffect(() => {
    localStorage.setItem('seo-relaunch-dashboard-open', String(isOpen));
  }, [isOpen]);
  
  // Load page registry for suggestions
  useEffect(() => {
    const loadPageRegistry = async () => {
      const { data, error } = await supabase
        .from('page_registry')
        .select('page_slug, page_title')
        .eq('status', 'published')
        .order('page_title');
        
      if (!error && data) {
        setPageRegistry(data);
      }
    };
    loadPageRegistry();
  }, []);
  
  // Sync redirect status with redirects table
  const syncRedirectStatus = useCallback(async (mappingsData: MappingRow[]) => {
    // Get all existing redirects
    const { data: redirects, error: redirectError } = await supabase
      .from('redirects')
      .select('source_url, target_url, is_active')
      .eq('is_active', true);
      
    if (redirectError || !redirects) {
      console.error('[Relaunch] Error loading redirects:', redirectError);
      return mappingsData;
    }
    
    // Create a map of source URLs to target URLs
    const redirectMap = new Map<string, string>();
    for (const r of redirects) {
      // Normalize source URL (remove domain if present)
      const normalizedSource = r.source_url.replace(/^https?:\/\/[^/]+/, '');
      redirectMap.set(normalizedSource, r.target_url);
    }
    
    // Check each mapping for existing redirects
    const updatedMappings: MappingRow[] = [];
    
    for (const mapping of mappingsData) {
      // Extract path from old_url
      const oldPath = mapping.old_url.replace(/^https?:\/\/[^/]+/, '');
      const existingTarget = redirectMap.get(oldPath);
      
      if (existingTarget && !mapping.redirect_created) {
        // Redirect exists but not marked - update it
        console.log('[Relaunch] Syncing redirect for:', oldPath, '->', existingTarget);
        // Fire and forget update
        supabase
          .from('relaunch_url_mappings')
          .update({ 
            redirect_created: true, 
            approval_status: 'approved',
            new_url: existingTarget 
          })
          .eq('id', mapping.id)
          .then(() => console.log('[Relaunch] Synced:', mapping.id));
          
        updatedMappings.push({
          ...mapping,
          redirect_created: true,
          approval_status: 'approved' as const,
          new_url: existingTarget
        });
      } else {
        updatedMappings.push(mapping);
      }
    }
    
    return updatedMappings;
  }, []);

  // Load existing mappings from database
  const loadMappings = useCallback(async () => {
    if (!domain) return;
    
    const { data, error } = await supabase
      .from('relaunch_url_mappings')
      .select('*')
      .eq('domain', domain)
      .order('current_position', { ascending: true, nullsFirst: false });
      
    if (error) {
      console.error('[Relaunch] Error loading mappings:', error);
      return;
    }
    
    if (data) {
      // Sync with redirects table
      const syncedData = await syncRedirectStatus(data as unknown as MappingRow[]);
      setMappings(syncedData);
      updateStats(syncedData);
    }
  }, [domain, syncRedirectStatus]);
  
  useEffect(() => {
    if (domain) {
      loadMappings();
    }
  }, [domain, loadMappings]);
  
  const updateStats = (data: MappingRow[]) => {
    setStats({
      total: data.length,
      pending: data.filter(m => m.approval_status === 'pending').length,
      approved: data.filter(m => m.approval_status === 'approved').length,
      rejected: data.filter(m => m.approval_status === 'rejected').length,
      redirectsCreated: data.filter(m => m.redirect_created).length
    });
  };
  
  // Fetch search volume metrics for keywords
  const fetchSearchVolumeForKeywords = async (keywords: string[]): Promise<Map<string, number>> => {
    const searchVolumeMap = new Map<string, number>();
    
    if (keywords.length === 0) return searchVolumeMap;
    
    // SISTRIX costs 5 credits per keyword for metrics, so batch in chunks of 50
    const BATCH_SIZE = 50;
    const batches: string[][] = [];
    
    for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
      batches.push(keywords.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`[Relaunch] Fetching search volume for ${keywords.length} keywords in ${batches.length} batches`);
    
    for (const batch of batches) {
      try {
        const { data, error } = await supabase.functions.invoke('sistrix-api', {
          body: { 
            action: 'keyword.seo.metrics', 
            keywords: batch,
            country
          }
        });
        
        if (error) {
          console.error('[Relaunch] Error fetching metrics batch:', error);
          continue;
        }
        
        // keyword.seo.metrics returns: kw, competition, cpc, traffic (=search volume), clicks
        const metricsData = data?.answer?.[0]?.result || data?.answer || [];
        console.log('[Relaunch] Metrics batch result:', metricsData.length);
        
        for (const item of metricsData) {
          if (item.kw && item.traffic) {
            searchVolumeMap.set(item.kw.toLowerCase(), parseInt(item.traffic) || 0);
          }
        }
      } catch (e) {
        console.error('[Relaunch] Batch metrics error:', e);
      }
    }
    
    return searchVolumeMap;
  };

  // Fetch rankings from SISTRIX and save to database
  const fetchRankings = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoading(true);
    try {
      // Step 1: Fetch keyword rankings from SISTRIX using keyword.domain.seo endpoint
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { 
          action: 'keyword.domain.seo', 
          domain, 
          country,
          limit: 500 // Get up to 500 keywords
        }
      });
      
      if (error) throw error;
      
      // keyword.domain.seo returns data in answer[0].result array with: kw, position, competition, traffic, url
      const keywordData = data?.answer?.[0]?.result || data?.answer?.[0]?.['keyword.domain.seo'] || [];
      console.log('[Relaunch] Fetched keyword data:', keywordData.length, 'Raw structure:', JSON.stringify(Object.keys(data || {})));
      
      if (keywordData.length === 0) {
        console.error('[Relaunch] No keyword data found. Full response:', JSON.stringify(data));
        toast.warning('No ranking keywords found for this domain');
        setIsLoading(false);
        return;
      }
      
      // Step 2: Extract unique keywords for search volume lookup
      const uniqueKeywords = [...new Set(keywordData.map((r: any) => r.kw || r.keyword).filter(Boolean))] as string[];
      toast.info(`Fetching search volume for ${uniqueKeywords.length} keywords...`);
      
      // Step 3: Fetch search volume metrics
      const searchVolumeMap = await fetchSearchVolumeForKeywords(uniqueKeywords);
      console.log('[Relaunch] Search volume data retrieved for', searchVolumeMap.size, 'keywords');
      
      // Transform and save to database with search volume
      const today = new Date().toISOString().split('T')[0];
      const mappingsToInsert = keywordData.map((r: any) => {
        const keyword = r.kw || r.keyword || '';
        return {
          domain,
          old_url: r.url || '',
          focus_keyword: keyword || null,
          current_position: parseInt(r.position) || null,
          search_volume: searchVolumeMap.get(keyword.toLowerCase()) || null,
          competition: parseFloat(r.competition) || null,
          cpc: null,
          traffic_estimate: parseInt(r.traffic) || null,
          new_url_suggestion: suggestNewUrl(r.url || '', keyword),
          approval_status: 'pending',
          trend: 'stable',
          snapshot_date: today
        };
      });
      
      // Upsert to database (update if exists for same domain/url/date)
      const { error: insertError } = await supabase
        .from('relaunch_url_mappings')
        .upsert(mappingsToInsert, {
          onConflict: 'domain,old_url,snapshot_date',
          ignoreDuplicates: false
        });
        
      if (insertError) {
        console.error('[Relaunch] Insert error:', insertError);
        throw insertError;
      }
      
      const withVolume = mappingsToInsert.filter((m: any) => m.search_volume).length;
      toast.success(`${keywordData.length} keywords imported (${withVolume} with search volume)`);
      await loadMappings();
      
    } catch (e) {
      console.error('[Relaunch] Error:', e);
      toast.error('Failed to fetch SISTRIX rankings');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Suggest new URL based on keyword matching
  const suggestNewUrl = (oldUrl: string, keyword: string): string | null => {
    if (!keyword || pageRegistry.length === 0) return null;
    
    const keywordLower = keyword.toLowerCase();
    const urlPath = oldUrl.replace(/https?:\/\/[^/]+/, '').toLowerCase();
    
    // Try to find a matching page
    for (const page of pageRegistry) {
      const slugLower = page.page_slug.toLowerCase();
      const titleLower = page.page_title.toLowerCase();
      
      // Exact slug match
      if (urlPath.includes(slugLower) || slugLower.includes(urlPath.replace(/\//g, ''))) {
        return `/${page.page_slug}`;
      }
      
      // Keyword in title or slug
      if (titleLower.includes(keywordLower) || slugLower.includes(keywordLower.replace(/\s+/g, '-'))) {
        return `/${page.page_slug}`;
      }
    }
    
    return null;
  };
  
  // Update mapping
  const updateMapping = async (id: string, updates: Partial<MappingRow>) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('relaunch_url_mappings')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setMappings(prev => prev.map(m => 
        m.id === id ? { ...m, ...updates } : m
      ));
      
      // Recalculate stats
      const updated = mappings.map(m => m.id === id ? { ...m, ...updates } : m);
      updateStats(updated);
      
    } catch (e) {
      console.error('[Relaunch] Update error:', e);
      toast.error('Failed to update mapping');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Approve mapping and create redirect
  const approveMapping = async (mapping: MappingRow) => {
    if (!mapping.new_url && !mapping.new_url_suggestion) {
      toast.error('Please set a new URL first');
      return;
    }
    
    const targetUrl = mapping.new_url || mapping.new_url_suggestion || '';
    
    try {
      // Create redirect
      const { error: redirectError } = await supabase
        .from('redirects')
        .insert({
          source_url: mapping.old_url,
          target_url: targetUrl,
          redirect_type: 301,
          is_active: true,
          notes: `Relaunch Dashboard: ${mapping.focus_keyword || 'No keyword'} (Pos. ${mapping.current_position})`
        });
        
      if (redirectError) {
        // Check if redirect already exists
        if (redirectError.code === '23505') {
          toast.warning('Redirect already exists');
        } else {
          throw redirectError;
        }
      }
      
      // Update mapping
      await updateMapping(mapping.id, {
        approval_status: 'approved',
        new_url: targetUrl,
        redirect_created: true,
        approved_at: new Date().toISOString()
      });
      
      toast.success('Redirect created');
      
    } catch (e) {
      console.error('[Relaunch] Approve error:', e);
      toast.error('Failed to create redirect');
    }
  };
  
  // Bulk approve all pending with suggestions
  const bulkApprove = async () => {
    const pendingWithSuggestions = mappings.filter(
      m => m.approval_status === 'pending' && (m.new_url || m.new_url_suggestion)
    );
    
    if (pendingWithSuggestions.length === 0) {
      toast.warning('No pending mappings with URL suggestions');
      return;
    }
    
    setIsSaving(true);
    let successCount = 0;
    
    for (const mapping of pendingWithSuggestions) {
      try {
        await approveMapping(mapping);
        successCount++;
      } catch (e) {
        console.error('[Relaunch] Bulk approve error:', e);
      }
    }
    
    setIsSaving(false);
    toast.success(`${successCount} redirects created`);
    await loadMappings();
  };
  
  // Toggle sort
  const toggleSort = (field: 'keyword' | 'position' | 'searchVolume' | 'traffic' | 'redirect') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'keyword' ? 'asc' : 'desc'); // A-Z default for keyword, high-to-low for others
    }
  };
  
  // Filter and sort mappings
  const filteredAndSortedMappings = (() => {
    let result = mappings.filter(m => {
      if (filterStatus !== 'all' && m.approval_status !== filterStatus) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          m.old_url?.toLowerCase().includes(search) ||
          m.focus_keyword?.toLowerCase().includes(search) ||
          m.new_url?.toLowerCase().includes(search)
        );
      }
      return true;
    });
    
    // Apply sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        if (sortField === 'keyword') {
          const aVal = (a.focus_keyword || '').toLowerCase();
          const bVal = (b.focus_keyword || '').toLowerCase();
          if (!aVal && !bVal) return 0;
          if (!aVal) return 1;
          if (!bVal) return -1;
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal, 'de') 
            : bVal.localeCompare(aVal, 'de');
        } else if (sortField === 'position') {
          const aVal = a.current_position ?? 999;
          const bVal = b.current_position ?? 999;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else if (sortField === 'searchVolume') {
          const aVal = a.search_volume ?? 0;
          const bVal = b.search_volume ?? 0;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else if (sortField === 'traffic') {
          const aVal = a.traffic_estimate ?? 0;
          const bVal = b.traffic_estimate ?? 0;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else if (sortField === 'redirect') {
          const aVal = a.redirect_created ? 1 : 0;
          const bVal = b.redirect_created ? 1 : 0;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    
    return result;
  })();
  
  // Pagination logic
  const totalItems = filteredAndSortedMappings.length;
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(totalItems / pageSize);
  const paginatedMappings = pageSize === 'all' 
    ? filteredAndSortedMappings 
    : filteredAndSortedMappings.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, pageSize, sortField, sortDirection]);
  
  // Persist page size
  useEffect(() => {
    localStorage.setItem('relaunch-page-size', String(pageSize));
  }, [pageSize]);
  
  // Handle new URL input change
  const handleNewUrlChange = (id: string, value: string) => {
    setEditingNewUrl(prev => ({ ...prev, [id]: value }));
  };
  
  // Apply suggestion to input
  const applySuggestion = (id: string, suggestion: string) => {
    setEditingNewUrl(prev => ({ ...prev, [id]: suggestion }));
  };
  
  // Save new URL from input
  const saveNewUrl = async (id: string) => {
    const newUrl = editingNewUrl[id];
    if (newUrl) {
      await updateMapping(id, { new_url: newUrl });
      toast.success('New URL saved');
    }
  };
  
  // Trend icon with tooltip
  const TrendIcon = ({ trend }: { trend: string }) => {
    const getTrendInfo = () => {
      switch (trend) {
        case 'up': return { icon: <TrendingUp className="h-4 w-4 text-green-500" />, label: 'Position improved' };
        case 'down': return { icon: <TrendingDown className="h-4 w-4 text-red-500" />, label: 'Position dropped' };
        default: return { icon: <Minus className="h-4 w-4 text-muted-foreground" />, label: 'No change' };
      }
    };
    const info = getTrendInfo();
    return (
      <Tooltip>
        <TooltipTrigger>{info.icon}</TooltipTrigger>
        <TooltipContent>{info.label}</TooltipContent>
      </Tooltip>
    );
  };
  
  // Sort icon component
  const SortIcon = ({ field }: { field: 'keyword' | 'position' | 'searchVolume' | 'traffic' | 'redirect' }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };
  
  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      case 'skipped':
        return <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">Skipped</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
    }
  };
  
  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1 && pageSize !== 'all') return null;
    
    const startItem = pageSize === 'all' ? 1 : (currentPage - 1) * pageSize + 1;
    const endItem = pageSize === 'all' ? totalItems : Math.min(currentPage * pageSize, totalItems);
    
    return (
      <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing {startItem}-{endItem} of {totalItems}</span>
          <Select 
            value={String(pageSize)} 
            onValueChange={(v) => setPageSize(v === 'all' ? 'all' : parseInt(v))}
          >
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={String(size)}>
                  {size === 'all' ? 'All' : `${size} / page`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {pageSize !== 'all' && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-[#00a1ff]/30 rounded-lg overflow-hidden bg-gradient-to-r from-[#00a1ff]/10 to-[#0066cc]/10">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#00a1ff]/20 hover:bg-[#00a1ff]/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00a1ff] rounded-lg flex items-center justify-center">
              <SistrixIcon className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-foreground">SEO Relaunch Dashboard</h3>
              <p className="text-xs text-muted-foreground">URL migration & redirect planning with SISTRIX data</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats.total > 0 && (
              <div className="flex gap-2 text-xs">
                <Badge variant="outline" className="border-amber-500/50 text-amber-400">{stats.pending} pending</Badge>
                <Badge variant="outline" className="border-green-500/50 text-green-400">{stats.approved} approved</Badge>
              </div>
            )}
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {/* Domain Display & Controls */}
            <Card className="p-4 bg-muted/20 border-border">
              <div className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-2 block">
                    Domain
                  </Label>
                  <div className="h-10 px-3 rounded-md border border-[#00a1ff]/50 bg-[#00a1ff]/10 flex items-center text-sm font-medium text-foreground">
                    {domain}
                  </div>
                </div>
                <div className="w-32">
                  <Label htmlFor="relaunch-country" className="text-sm font-medium mb-2 block">
                    Country
                  </Label>
                  <select
                    id="relaunch-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="de">Germany</option>
                    <option value="us">USA</option>
                    <option value="uk">UK</option>
                    <option value="fr">France</option>
                    <option value="es">Spain</option>
                    <option value="it">Italy</option>
                    <option value="at">Austria</option>
                    <option value="ch">Switzerland</option>
                  </select>
                </div>
                <Button
                  onClick={fetchRankings}
                  className="h-10 bg-[#00a1ff] hover:bg-[#0088dd] text-white"
                  disabled={!domain || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Import Rankings
                </Button>
                <Button
                  onClick={loadMappings}
                  variant="outline"
                  className="h-10"
                  disabled={!domain || isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </Card>
            
            {/* Stats Overview */}
            {stats.total > 0 && (
              <div className="grid grid-cols-5 gap-3">
                <Card className="p-3 bg-muted/20 text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total URLs</div>
                </Card>
                <Card className="p-3 bg-amber-500/10 border-amber-500/30 text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </Card>
                <Card className="p-3 bg-green-500/10 border-green-500/30 text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                  <div className="text-xs text-muted-foreground">Approved</div>
                </Card>
                <Card className="p-3 bg-red-500/10 border-red-500/30 text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                  <div className="text-xs text-muted-foreground">Rejected</div>
                </Card>
                <Card className="p-3 bg-blue-500/10 border-blue-500/30 text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.redirectsCreated}</div>
                  <div className="text-xs text-muted-foreground">Redirects</div>
                </Card>
              </div>
            )}
            
            {/* Filters & Bulk Actions */}
            {mappings.length > 0 && (
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search URLs or keywords..."
                    className="bg-background"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={bulkApprove}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Bulk Approve ({mappings.filter(m => m.approval_status === 'pending' && (m.new_url || m.new_url_suggestion)).length})
                </Button>
              </div>
            )}
            
            {/* Mappings Table */}
            <TooltipProvider>
            {paginatedMappings.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="text-left p-3 font-medium min-w-[300px] bg-muted/50">Old URL</th>
                        <th 
                          className="text-left p-3 font-medium min-w-[150px] bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('keyword')}
                        >
                          <span className="flex items-center">
                            Focus Keyword
                            <SortIcon field="keyword" />
                          </span>
                        </th>
                        <th 
                          className="text-center p-3 font-medium w-16 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('position')}
                        >
                          <span className="flex items-center justify-center">
                            Pos.
                            <SortIcon field="position" />
                          </span>
                        </th>
                        <th 
                          className="text-center p-3 font-medium w-24 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('searchVolume')}
                        >
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center justify-center">
                              <span className="underline decoration-dotted">SV</span>
                              <SortIcon field="searchVolume" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Monatliches Suchvolumen für dieses Keyword. Klicken zum Sortieren.
                            </TooltipContent>
                          </Tooltip>
                        </th>
                        <th 
                          className="text-center p-3 font-medium w-24 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('traffic')}
                        >
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center justify-center">
                              <span className="underline decoration-dotted">Traffic</span>
                              <SortIcon field="traffic" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Geschätzter monatlicher Traffic für diese URL basierend auf SISTRIX-Daten. Klicken zum Sortieren.
                            </TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="text-center p-3 font-medium w-20 bg-muted/50">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help underline decoration-dotted">Trend</TooltipTrigger>
                            <TooltipContent>Position trend vs. previous snapshot</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="text-left p-3 font-medium min-w-[280px] bg-muted/50">New URL</th>
                        <th className="text-center p-3 font-medium w-24 bg-muted/50">Status</th>
                        <th 
                          className="text-center p-3 font-medium w-24 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('redirect')}
                        >
                          <span className="flex items-center justify-center">
                            Redirect
                            <SortIcon field="redirect" />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedMappings.map((mapping) => (
                        <tr key={mapping.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            <a 
                              href={mapping.old_url.startsWith('http') ? mapping.old_url : `https://${domain}${mapping.old_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00a1ff] hover:underline flex items-center gap-1 break-all"
                            >
                              <span className="text-sm">{mapping.old_url}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-xs">{mapping.focus_keyword || '-'}</span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={`text-base font-semibold px-3 py-1 ${
                              (mapping.current_position || 999) <= 3 ? 'border-green-500/50 text-green-400' :
                              (mapping.current_position || 999) <= 10 ? 'border-blue-500/50 text-blue-400' :
                              (mapping.current_position || 999) <= 20 ? 'border-amber-500/50 text-amber-400' :
                              'border-zinc-500/50 text-zinc-400'
                            }`}>
                              {mapping.current_position || '-'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {mapping.search_volume ? (
                              <span className="font-medium text-muted-foreground">{mapping.search_volume.toLocaleString()}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {mapping.traffic_estimate ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <span className="font-medium">{mapping.traffic_estimate.toLocaleString()}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Geschätzter monatlicher Traffic basierend auf Position & Keyword-Daten
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <TrendIcon trend={mapping.trend} />
                          </td>
                          <td className="p-3">
                            {mapping.approval_status === 'approved' ? (
                              <span className="text-green-400 flex items-center gap-1 text-xs">
                                {mapping.new_url}
                                <Check className="h-3 w-3" />
                              </span>
                            ) : (
                              <div className="flex gap-1 items-center">
                                <Input
                                  value={editingNewUrl[mapping.id] ?? mapping.new_url ?? mapping.new_url_suggestion ?? ''}
                                  onChange={(e) => handleNewUrlChange(mapping.id, e.target.value)}
                                  onBlur={() => {
                                    const val = editingNewUrl[mapping.id];
                                    if (val !== undefined && val !== mapping.new_url) {
                                      saveNewUrl(mapping.id);
                                    }
                                  }}
                                  placeholder="Enter new URL path..."
                                  className="h-8 text-xs flex-1 min-w-[150px]"
                                />
                                {mapping.new_url_suggestion && !editingNewUrl[mapping.id] && !mapping.new_url && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-[#00a1ff] hover:text-[#00a1ff] hover:bg-[#00a1ff]/10"
                                        onClick={() => applySuggestion(mapping.id, mapping.new_url_suggestion!)}
                                      >
                                        <Sparkles className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Apply suggested URL: {mapping.new_url_suggestion}</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <StatusBadge status={mapping.approval_status} />
                          </td>
                          <td className="p-3 text-center">
                            {mapping.redirect_created ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                </TooltipTrigger>
                                <TooltipContent>301 Redirect aktiv → {mapping.new_url}</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-green-400 hover:bg-green-500/10"
                                    onClick={() => approveMapping(mapping)}
                                    disabled={isSaving || !mapping.new_url && !mapping.new_url_suggestion}
                                  >
                                    <X className="h-5 w-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {mapping.new_url || mapping.new_url_suggestion 
                                    ? 'Klicken um 301 Redirect zu erstellen' 
                                    : 'Erst New URL eingeben'}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination />
              </div>
            ) : mappings.length === 0 ? (
              <Card className="p-8 bg-muted/10 border-dashed text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold text-foreground mb-1">No URL Mappings Yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter a domain and click "Import Rankings" to fetch SISTRIX data
                </p>
              </Card>
            ) : (
              <Card className="p-6 bg-muted/10 text-center">
                <p className="text-muted-foreground">No results match your filter</p>
              </Card>
            )}
            </TooltipProvider>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
