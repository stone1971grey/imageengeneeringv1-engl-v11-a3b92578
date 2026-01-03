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
  previous_position: number | null;
  previous_snapshot_date: string | null;
  search_volume: number | null;
  clicks: number | null;
  competition: number | null;
  intent: string | null;
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
  has_ai_overview: boolean | null;
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
  const [sortField, setSortField] = useState<'keyword' | 'position' | 'searchVolume' | 'traffic' | 'redirect' | 'aio' | 'clicks' | 'competition' | 'intent' | 'trend' | 'oldUrl' | null>(null);
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
  
  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Import option: include search volume (costs 5 credits per keyword)
  const [includeSearchVolume, setIncludeSearchVolume] = useState(true);
  
  // Credits state
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  
  // Progress bar state for import
  interface ImportProgress {
    step: 'idle' | 'fetching' | 'metrics' | 'aio' | 'saving';
    currentItem: number;
    totalItems: number;
    stepLabel: string;
    startTime: number | null;
  }
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    step: 'idle',
    currentItem: 0,
    totalItems: 0,
    stepLabel: '',
    startTime: null
  });
  
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
  
  // Persist country selection
  useEffect(() => {
    localStorage.setItem('sistrix-country', country);
  }, [country]);
  
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

  // Load existing mappings from database with previous snapshot data for trend display
  const loadMappings = useCallback(async () => {
    if (!domain) return;
    
    // Get the latest snapshot date first for the selected country
    const { data: latestData, error: latestError } = await supabase
      .from('relaunch_url_mappings')
      .select('snapshot_date')
      .eq('domain', domain)
      .eq('country', country)
      .order('snapshot_date', { ascending: false })
      .limit(1);
    
    if (latestError || !latestData || latestData.length === 0) {
      console.log('[Relaunch] No snapshots found for country:', country);
      setMappings([]);
      updateStats([]);
      return;
    }
    
    const latestSnapshotDate = latestData[0].snapshot_date;
    
    // Get current snapshot data for the selected country
    const { data, error } = await supabase
      .from('relaunch_url_mappings')
      .select('*')
      .eq('domain', domain)
      .eq('country', country)
      .eq('snapshot_date', latestSnapshotDate)
      .order('current_position', { ascending: true, nullsFirst: false });
      
    if (error) {
      console.error('[Relaunch] Error loading mappings:', error);
      return;
    }
    
    // Get previous snapshot data for trend comparison display
    const { data: previousSnapshots } = await supabase
      .from('relaunch_url_mappings')
      .select('old_url, focus_keyword, current_position, snapshot_date')
      .eq('domain', domain)
      .eq('country', country)
      .lt('snapshot_date', latestSnapshotDate)
      .order('snapshot_date', { ascending: false });
    
    // Build previous data map
    const previousDataMap = new Map<string, { position: number; date: string }>();
    if (previousSnapshots) {
      for (const snap of previousSnapshots) {
        const key = `${snap.old_url}|${snap.focus_keyword}`;
        if (!previousDataMap.has(key) && snap.current_position) {
          previousDataMap.set(key, { 
            position: snap.current_position, 
            date: snap.snapshot_date 
          });
        }
      }
    }
    
    if (data) {
      // Enrich with previous position data
      const enrichedData = data.map((m: any) => {
        const key = `${m.old_url}|${m.focus_keyword}`;
        const prevData = previousDataMap.get(key);
        return {
          ...m,
          previous_position: prevData?.position || null,
          previous_snapshot_date: prevData?.date || null
        } as MappingRow;
      });
      
      // Sync with redirects table
      const syncedData = await syncRedirectStatus(enrichedData);
      setMappings(syncedData);
      updateStats(syncedData);
    }
  }, [domain, country, syncRedirectStatus]);
  
  useEffect(() => {
    if (domain) {
      loadMappings();
    }
  }, [domain, country, loadMappings]);
  
  const updateStats = (data: MappingRow[]) => {
    setStats({
      total: data.length,
      pending: data.filter(m => m.approval_status === 'pending').length,
      approved: data.filter(m => m.approval_status === 'approved').length,
      rejected: data.filter(m => m.approval_status === 'rejected').length,
      redirectsCreated: data.filter(m => m.redirect_created).length
    });
  };
  
  // Keyword metrics type for enhanced data
  interface KeywordMetrics {
    searchVolume: number;
    clicks: number;
    competition: number;
    intent: string;
  }
  
  // Fetch keyword metrics (search volume, clicks, competition, intent) for keywords
  const fetchKeywordMetrics = async (keywords: string[]): Promise<Map<string, KeywordMetrics>> => {
    const metricsMap = new Map<string, KeywordMetrics>();
    
    if (keywords.length === 0) return metricsMap;
    
    // SISTRIX costs 5 credits per keyword for metrics, so batch in chunks of 50
    const BATCH_SIZE = 50;
    const batches: string[][] = [];
    
    for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
      batches.push(keywords.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`[Relaunch] Fetching metrics for ${keywords.length} keywords in ${batches.length} batches`);
    
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
        
        // keyword.seo.metrics returns: kw, competition, cpc, traffic (=search volume), clicks, intent
        const metricsData = data?.answer?.[0]?.result || data?.answer || [];
        console.log('[Relaunch] Metrics batch result:', metricsData.length, 'Sample:', metricsData[0]);
        
        for (const item of metricsData) {
          if (item.kw) {
            metricsMap.set(item.kw.toLowerCase(), {
              searchVolume: parseInt(item.traffic) || 0,
              clicks: parseInt(item.clicks) || 0,
              competition: parseFloat(item.competition) || 0,
              intent: item.intent || null
            });
          }
        }
      } catch (e) {
        console.error('[Relaunch] Batch metrics error:', e);
      }
    }
    
    return metricsMap;
  };

  // Fetch rankings from SISTRIX and save to database
  const fetchRankings = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoading(true);
    const startTime = Date.now();
    
    // Initialize progress
    setImportProgress({
      step: 'fetching',
      currentItem: 0,
      totalItems: 0,
      stepLabel: 'Fetching keyword rankings from SISTRIX...',
      startTime
    });
    
    try {
      // Step 0: Fetch previous snapshot for trend comparison
      const today = new Date().toISOString().split('T')[0];
      const { data: previousSnapshots } = await supabase
        .from('relaunch_url_mappings')
        .select('old_url, focus_keyword, current_position, snapshot_date')
        .eq('domain', domain)
        .eq('country', country)
        .lt('snapshot_date', today)
        .order('snapshot_date', { ascending: false });
      
      // Build a map of old_url -> { position, date } from the most recent previous snapshot
      const previousDataMap = new Map<string, { position: number; date: string }>();
      if (previousSnapshots && previousSnapshots.length > 0) {
        // Group by old_url and take the most recent
        for (const snap of previousSnapshots) {
          const key = `${snap.old_url}|${snap.focus_keyword}`;
          if (!previousDataMap.has(key) && snap.current_position) {
            previousDataMap.set(key, { 
              position: snap.current_position, 
              date: snap.snapshot_date 
            });
          }
        }
        console.log('[Relaunch] Found previous data for', previousDataMap.size, 'URL/keyword combinations');
      }
      
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
        setImportProgress({ step: 'idle', currentItem: 0, totalItems: 0, stepLabel: '', startTime: null });
        return;
      }
      
      const uniqueKeywords = [...new Set(keywordData.map((r: any) => r.kw || r.keyword).filter(Boolean))] as string[];
      
      // Step 2: Optionally fetch keyword metrics (costs 5 credits per keyword)
      let metricsMap = new Map<string, { searchVolume: number; clicks: number; competition: number; intent: string }>();
      
      if (includeSearchVolume) {
        setImportProgress({
          step: 'metrics',
          currentItem: 0,
          totalItems: uniqueKeywords.length,
          stepLabel: `Fetching search metrics for ${uniqueKeywords.length} keywords...`,
          startTime
        });
        
        metricsMap = await fetchKeywordMetrics(uniqueKeywords);
        console.log('[Relaunch] Metrics data retrieved for', metricsMap.size, 'keywords');
      } else {
        console.log('[Relaunch] Skipping metrics fetch (user opted out)');
      }
      
      // Step 2b: Fetch SERP features to detect AI Overviews (1 credit per keyword)
      let aioMap = new Map<string, boolean>();
      if (includeSearchVolume) {
        setImportProgress({
          step: 'aio',
          currentItem: 0,
          totalItems: uniqueKeywords.length,
          stepLabel: `Checking AI Overviews (0/${uniqueKeywords.length})...`,
          startTime
        });
        
        // Process in batches of 10 to avoid timeout
        const batchSize = 10;
        let processedCount = 0;
        
        for (let i = 0; i < uniqueKeywords.length; i += batchSize) {
          const batch = uniqueKeywords.slice(i, i + batchSize);
          try {
            const { data: serpData, error: serpError } = await supabase.functions.invoke('sistrix-api', {
              body: { 
                action: 'keyword.seo.serpfeatures', 
                keywords: batch,
                country
              }
            });
            
            if (!serpError && serpData?.answer?.[0]?.serpfeatures) {
              for (const item of serpData.answer[0].serpfeatures) {
                if (item.keyword) {
                  aioMap.set(item.keyword.toLowerCase(), item.hasAIO === true);
                }
              }
            }
          } catch (e) {
            console.error('[Relaunch] SERP features batch error:', e);
          }
          
          processedCount = Math.min(i + batchSize, uniqueKeywords.length);
          setImportProgress(prev => ({
            ...prev,
            currentItem: processedCount,
            stepLabel: `Checking AI Overviews (${processedCount}/${uniqueKeywords.length})...`
          }));
        }
        console.log('[Relaunch] AIO data retrieved for', aioMap.size, 'keywords, with AIO:', [...aioMap.values()].filter(v => v).length);
      }
      
      // Step 3: Transform and calculate trends
      setImportProgress({
        step: 'saving',
        currentItem: 0,
        totalItems: 1,
        stepLabel: 'Saving data to database...',
        startTime
      });
      
      const allMappings = keywordData.map((r: any) => {
        const keyword = r.kw || r.keyword || '';
        const url = r.url || '';
        const currentPosition = parseInt(r.position) || null;
        
        // Look up previous position for trend calculation
        const key = `${url}|${keyword}`;
        const previousData = previousDataMap.get(key);
        
        let trend: 'up' | 'stable' | 'down' = 'stable';
        if (previousData && currentPosition) {
          if (currentPosition < previousData.position) {
            trend = 'up'; // Lower position number = better ranking
          } else if (currentPosition > previousData.position) {
            trend = 'down';
          }
        }
        
        // Get enriched metrics data
        const metrics = metricsMap.get(keyword.toLowerCase());
        const hasAIO = aioMap.get(keyword.toLowerCase()) || null;
        
        return {
          domain,
          country, // Include country for multi-country support
          old_url: url,
          focus_keyword: keyword || null,
          current_position: currentPosition,
          search_volume: metrics?.searchVolume || null,
          clicks: metrics?.clicks || null,
          competition: metrics?.competition || parseFloat(r.competition) || null,
          intent: metrics?.intent || null,
          cpc: null,
          traffic_estimate: parseInt(r.traffic) || null,
          new_url_suggestion: suggestNewUrl(url, keyword),
          approval_status: 'pending',
          trend,
          snapshot_date: today,
          has_ai_overview: hasAIO
        };
      });
      
      // CRITICAL FIX: Deduplicate by domain+old_url+snapshot_date to avoid PostgreSQL 
      // "ON CONFLICT DO UPDATE command cannot affect row a second time" error.
      // Keep the entry with highest traffic for each unique URL.
      const dedupeMap = new Map<string, typeof allMappings[0]>();
      for (const mapping of allMappings) {
        const dedupeKey = `${mapping.domain}|${mapping.old_url}|${mapping.snapshot_date}`;
        const existing = dedupeMap.get(dedupeKey);
        if (!existing || (mapping.traffic_estimate || 0) > (existing.traffic_estimate || 0)) {
          dedupeMap.set(dedupeKey, mapping);
        }
      }
      const mappingsToInsert = Array.from(dedupeMap.values());
      console.log(`[Relaunch] Deduplicated ${allMappings.length} entries to ${mappingsToInsert.length} unique URLs`);
      
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
      const withTrend = mappingsToInsert.filter((m: any) => m.trend !== 'stable').length;
      const withAIO = mappingsToInsert.filter((m: any) => m.has_ai_overview === true).length;
      toast.success(`${mappingsToInsert.length} URLs imported (${withVolume} with SV, ${withAIO} with AI Overview)`);
      await loadMappings();
      
    } catch (e) {
      console.error('[Relaunch] Error:', e);
      toast.error('Failed to fetch SISTRIX rankings');
    } finally {
      setIsLoading(false);
      setImportProgress({ step: 'idle', currentItem: 0, totalItems: 0, stepLabel: '', startTime: null });
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
  
  // Toggle selection for a single row
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  // Toggle all visible rows
  const toggleSelectAll = () => {
    const visibleIds = paginatedMappings.map(m => m.id);
    const allSelected = visibleIds.every(id => selectedIds.has(id));
    
    if (allSelected) {
      // Deselect all visible
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        visibleIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all visible
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        visibleIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  };
  
  // Get approvable items (selected or all pending with suggestions)
  const getApprovableItems = () => {
    if (selectedIds.size > 0) {
      // Only approve selected items that are pending and have a URL
      return mappings.filter(
        m => selectedIds.has(m.id) && 
             m.approval_status === 'pending' && 
             (m.new_url || m.new_url_suggestion)
      );
    }
    // Fallback: all pending with suggestions
    return mappings.filter(
      m => m.approval_status === 'pending' && (m.new_url || m.new_url_suggestion)
    );
  };

  // Bulk approve selected or all pending with suggestions
  const bulkApprove = async () => {
    const toApprove = getApprovableItems();
    
    if (toApprove.length === 0) {
      toast.warning(selectedIds.size > 0 
        ? 'Keine der ausgewählten URLs kann genehmigt werden (keine neue URL oder bereits approved)'
        : 'Keine pending Mappings mit URL-Vorschlägen');
      return;
    }
    
    setIsSaving(true);
    let successCount = 0;
    
    for (const mapping of toApprove) {
      try {
        await approveMapping(mapping);
        successCount++;
      } catch (e) {
        console.error('[Relaunch] Bulk approve error:', e);
      }
    }
    
    setIsSaving(false);
    setSelectedIds(new Set()); // Clear selection after bulk action
    toast.success(`${successCount} Redirects erstellt`);
    await loadMappings();
  };
  
  // Check SISTRIX credits
  const checkCredits = async () => {
    setIsLoadingCredits(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { action: 'credits' }
      });
      
      if (error) {
        console.error('[Relaunch] Error checking credits:', error);
        toast.error('Fehler beim Abrufen der Credits');
        return;
      }
      
      console.log('[Relaunch] Credits API response:', JSON.stringify(data));
      
      // SISTRIX API returns credits in multiple possible locations
      // Try: data.answer[0].credits, data.credits, or data.answer[0]['credits']
      let creditsValue: number | null = null;
      
      if (data?.answer?.[0]?.credits !== undefined) {
        creditsValue = parseInt(data.answer[0].credits);
      } else if (data?.credits !== undefined) {
        creditsValue = parseInt(data.credits);
      } else if (Array.isArray(data?.answer) && data.answer.length > 0) {
        // Check first answer item for any credits property
        const firstAnswer = data.answer[0];
        for (const key of Object.keys(firstAnswer)) {
          if (key.toLowerCase().includes('credit')) {
            creditsValue = parseInt(firstAnswer[key]);
            break;
          }
        }
      }
      
      if (creditsValue !== null && !isNaN(creditsValue)) {
        setCredits(creditsValue);
        toast.success(`Verfügbare Credits: ${creditsValue.toLocaleString('de-DE')}`);
      } else {
        console.error('[Relaunch] Could not parse credits from response:', data);
        toast.error('Credits konnten nicht abgerufen werden');
      }
    } catch (error) {
      console.error('[Relaunch] Credits check error:', error);
      toast.error('Fehler beim Abrufen der Credits');
    } finally {
      setIsLoadingCredits(false);
    }
  };
  // Toggle sort
  const toggleSort = (field: 'keyword' | 'position' | 'searchVolume' | 'traffic' | 'redirect' | 'aio' | 'clicks' | 'competition' | 'intent' | 'trend' | 'oldUrl') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection((field === 'keyword' || field === 'oldUrl') ? 'asc' : 'desc'); // A-Z default for text fields, high-to-low for others
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
        if (sortField === 'oldUrl') {
          const aVal = (a.old_url || '').toLowerCase();
          const bVal = (b.old_url || '').toLowerCase();
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal, 'de') 
            : bVal.localeCompare(aVal, 'de');
        } else if (sortField === 'keyword') {
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
        } else if (sortField === 'aio') {
          // Sort by AI Overview: true first (desc) or false first (asc)
          const aVal = a.has_ai_overview === true ? 1 : 0;
          const bVal = b.has_ai_overview === true ? 1 : 0;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else if (sortField === 'clicks') {
          const aVal = a.clicks ?? 0;
          const bVal = b.clicks ?? 0;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else if (sortField === 'competition') {
          const aVal = a.competition ?? 0;
          const bVal = b.competition ?? 0;
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        } else if (sortField === 'intent') {
          const aVal = (a.intent || '').toLowerCase();
          const bVal = (b.intent || '').toLowerCase();
          if (!aVal && !bVal) return 0;
          if (!aVal) return 1;
          if (!bVal) return -1;
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        } else if (sortField === 'trend') {
          // Sort order: up > stable > down
          const trendOrder = { up: 3, stable: 2, down: 1 };
          const aVal = trendOrder[a.trend] ?? 2;
          const bVal = trendOrder[b.trend] ?? 2;
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
  
  // Trend icon with tooltip showing position change and comparison date
  const TrendIcon = ({ mapping }: { mapping: MappingRow }) => {
    const { trend, current_position, previous_position, previous_snapshot_date } = mapping;
    
    const getTrendInfo = () => {
      const posChange = previous_position && current_position 
        ? previous_position - current_position 
        : 0;
      const dateStr = previous_snapshot_date 
        ? new Date(previous_snapshot_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;
      
      switch (trend) {
        case 'up': 
          return { 
            icon: <TrendingUp className="h-4 w-4 text-green-500" />, 
            label: `↑ ${Math.abs(posChange)} Positionen verbessert${dateStr ? ` (vs. ${dateStr})` : ''}` 
          };
        case 'down': 
          return { 
            icon: <TrendingDown className="h-4 w-4 text-red-500" />, 
            label: `↓ ${Math.abs(posChange)} Positionen verschlechtert${dateStr ? ` (vs. ${dateStr})` : ''}` 
          };
        default: 
          return { 
            icon: <Minus className="h-4 w-4 text-muted-foreground" />, 
            label: previous_position ? `Keine Änderung${dateStr ? ` (vs. ${dateStr})` : ''}` : 'Erster Import (kein Vergleich)'
          };
      }
    };
    const info = getTrendInfo();
    return (
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-1">
          {info.icon}
          {previous_position && current_position && trend !== 'stable' && (
            <span className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? '+' : ''}{previous_position - current_position}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>{info.label}</div>
          {previous_position && (
            <div className="text-xs text-muted-foreground mt-1">
              Vorher: Pos. {previous_position} → Jetzt: Pos. {current_position}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };
  
  // Sort icon component
  const SortIcon = ({ field }: { field: 'keyword' | 'position' | 'searchVolume' | 'traffic' | 'redirect' | 'aio' | 'clicks' | 'competition' | 'intent' | 'trend' | 'oldUrl' }) => {
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
              <p className="text-xs text-muted-foreground">
                URL migration & redirect planning with SISTRIX data
                {mappings.length > 0 && (
                  <span className="ml-2 text-[#00a1ff]">
                    • Showing data for: {country.toUpperCase()}
                  </span>
                )}
              </p>
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
                <div className="w-40">
                  <Label htmlFor="relaunch-country" className="text-sm font-medium mb-2 block">
                    Country <span className="text-muted-foreground">(for SISTRIX query)</span>
                  </Label>
                  <select
                    id="relaunch-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="de">🇩🇪 Germany</option>
                    <option value="us">🇺🇸 USA</option>
                    <option value="uk">🇬🇧 UK</option>
                    <option value="cn">🇨🇳 China</option>
                    <option value="jp">🇯🇵 Japan</option>
                    <option value="kr">🇰🇷 Korea</option>
                    <option value="fr">🇫🇷 France</option>
                    <option value="es">🇪🇸 Spain</option>
                    <option value="it">🇮🇹 Italy</option>
                    <option value="at">🇦🇹 Austria</option>
                    <option value="ch">🇨🇭 Switzerland</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="include-search-volume"
                    checked={includeSearchVolume}
                    onChange={(e) => setIncludeSearchVolume(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-[#00a1ff] focus:ring-[#00a1ff]"
                  />
                  <Label htmlFor="include-search-volume" className="text-sm cursor-pointer whitespace-nowrap">
                    Mit Suchvolumen <span className="text-muted-foreground">(+5 Credits/Keyword)</span>
                  </Label>
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
                <Button
                  onClick={checkCredits}
                  variant="outline"
                  className="h-10 border-[#00a1ff]/30 text-[#00a1ff] hover:bg-[#00a1ff]/10"
                  disabled={isLoadingCredits}
                >
                  {isLoadingCredits ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <SistrixIcon className="h-4 w-4 mr-2" />
                  )}
                  {credits !== null ? `${credits.toLocaleString('de-DE')} Credits` : 'Check Credits'}
                </Button>
              </div>
            </Card>
            
            {/* Import Progress Bar */}
            {importProgress.step !== 'idle' && (
              <Card className="p-4 bg-[#f9dc24]/10 border-[#f9dc24]/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-[#f9dc24]" />
                      <div>
                        <div className="font-medium text-foreground">SISTRIX Import</div>
                        <div className="text-sm text-muted-foreground">{importProgress.stepLabel}</div>
                      </div>
                    </div>
                    {importProgress.totalItems > 0 && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#f9dc24]">
                          {Math.round((importProgress.currentItem / importProgress.totalItems) * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {importProgress.currentItem} / {importProgress.totalItems}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#f9dc24] transition-all duration-300 ease-out rounded-full"
                      style={{ 
                        width: importProgress.totalItems > 0 
                          ? `${(importProgress.currentItem / importProgress.totalItems) * 100}%` 
                          : importProgress.step === 'fetching' ? '15%' 
                          : importProgress.step === 'saving' ? '95%' 
                          : '0%'
                      }}
                    />
                  </div>
                  
                  {/* Step indicators */}
                  <div className="flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1 ${importProgress.step === 'fetching' ? 'text-[#f9dc24] font-medium' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${importProgress.step === 'fetching' ? 'bg-[#f9dc24]' : ['metrics', 'aio', 'saving'].includes(importProgress.step) ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      Fetching
                    </div>
                    <div className={`flex items-center gap-1 ${importProgress.step === 'metrics' ? 'text-[#f9dc24] font-medium' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${importProgress.step === 'metrics' ? 'bg-[#f9dc24]' : ['aio', 'saving'].includes(importProgress.step) ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      Metrics
                    </div>
                    <div className={`flex items-center gap-1 ${importProgress.step === 'aio' ? 'text-[#f9dc24] font-medium' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${importProgress.step === 'aio' ? 'bg-[#f9dc24]' : importProgress.step === 'saving' ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      AI Overviews
                    </div>
                    <div className={`flex items-center gap-1 ${importProgress.step === 'saving' ? 'text-[#f9dc24] font-medium' : 'text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${importProgress.step === 'saving' ? 'bg-[#f9dc24]' : 'bg-zinc-600'}`} />
                      Saving
                    </div>
                  </div>
                  
                  {/* Estimated time remaining */}
                  {importProgress.startTime && importProgress.currentItem > 0 && importProgress.totalItems > 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                      {(() => {
                        const elapsed = (Date.now() - importProgress.startTime) / 1000;
                        const rate = importProgress.currentItem / elapsed;
                        const remaining = Math.round((importProgress.totalItems - importProgress.currentItem) / rate);
                        if (remaining > 60) {
                          return `Geschätzte Restzeit: ~${Math.ceil(remaining / 60)} Minuten`;
                        }
                        return `Geschätzte Restzeit: ~${remaining} Sekunden`;
                      })()}
                    </div>
                  )}
                </div>
              </Card>
            )}
            
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
                {selectedIds.size > 0 && (
                  <Badge variant="outline" className="border-[#00a1ff]/50 text-[#00a1ff]">
                    {selectedIds.size} ausgewählt
                  </Badge>
                )}
                <Button
                  onClick={bulkApprove}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  {selectedIds.size > 0 
                    ? `Ausgewählte genehmigen (${getApprovableItems().length})`
                    : `Bulk Approve (${mappings.filter(m => m.approval_status === 'pending' && (m.new_url || m.new_url_suggestion)).length})`
                  }
                </Button>
                {selectedIds.size > 0 && (
                  <Button
                    onClick={() => setSelectedIds(new Set())}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Auswahl aufheben
                  </Button>
                )}
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
                        <th className="text-center p-3 w-10 bg-muted/50">
                          <input
                            type="checkbox"
                            checked={paginatedMappings.length > 0 && paginatedMappings.every(m => selectedIds.has(m.id))}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 rounded border-border text-[#00a1ff] focus:ring-[#00a1ff]"
                            title="Alle auf dieser Seite auswählen"
                          />
                        </th>
                        <th 
                          className="text-left p-3 font-medium min-w-[300px] bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('oldUrl')}
                        >
                          <span className="flex items-center">
                            Old URL
                            <SortIcon field="oldUrl" />
                          </span>
                        </th>
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
                          className="text-center p-3 font-medium w-20 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('clicks')}
                        >
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center justify-center">
                              <span className="underline decoration-dotted">Klicks</span>
                              <SortIcon field="clicks" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Geschätzte monatliche Klicks für dieses Keyword (aus SISTRIX Metrics). Klicken zum Sortieren.
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
                              Geschätzter monatlicher Traffic für diese URL basierend auf SISTRIX-Daten
                            </TooltipContent>
                          </Tooltip>
                        </th>
                        <th 
                          className="text-center p-3 font-medium w-16 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('competition')}
                        >
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center justify-center">
                              <span className="underline decoration-dotted">Wettb.</span>
                              <SortIcon field="competition" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Wettbewerbsintensität (0-100%). Höher = mehr Konkurrenz. Klicken zum Sortieren.
                            </TooltipContent>
                          </Tooltip>
                        </th>
                        <th 
                          className="text-center p-3 font-medium w-20 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('intent')}
                        >
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center justify-center">
                              <span className="underline decoration-dotted">Intent</span>
                              <SortIcon field="intent" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Suchintention: Informational, Navigational, Commercial, Transactional. Klicken zum Sortieren.
                            </TooltipContent>
                          </Tooltip>
                        </th>
                        <th 
                          className="text-center p-3 font-medium w-16 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('aio')}
                        >
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center justify-center">
                              <span className="underline decoration-dotted">AIO</span>
                              <SortIcon field="aio" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              AI Overview: Zeigt an, ob Google für dieses Keyword eine KI-generierte Zusammenfassung anzeigt. Klicken zum Sortieren.
                            </TooltipContent>
                          </Tooltip>
                        </th>
                        <th 
                          className="text-center p-3 font-medium w-20 bg-muted/50 cursor-pointer hover:bg-muted/70 select-none"
                          onClick={() => toggleSort('trend')}
                        >
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center justify-center">
                              <span className="underline decoration-dotted">Trend</span>
                              <SortIcon field="trend" />
                            </TooltipTrigger>
                            <TooltipContent>Positionsänderung vs. letzter Snapshot. Klicken zum Sortieren.</TooltipContent>
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
                        <tr 
                          key={mapping.id} 
                          className={`hover:bg-muted/20 ${selectedIds.has(mapping.id) ? 'bg-[#00a1ff]/10' : ''}`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(mapping.id)}
                              onChange={() => toggleSelection(mapping.id)}
                              className="h-4 w-4 rounded border-border text-[#00a1ff] focus:ring-[#00a1ff]"
                            />
                          </td>
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
                            {mapping.clicks ? (
                              <span className="font-medium text-muted-foreground">{mapping.clicks.toLocaleString()}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {mapping.traffic_estimate ? (
                              <span className="font-medium">{mapping.traffic_estimate.toLocaleString()}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {mapping.competition ? (
                              <Badge variant="outline" className={`text-xs ${
                                mapping.competition >= 70 ? 'border-red-500/50 text-red-400' :
                                mapping.competition >= 40 ? 'border-amber-500/50 text-amber-400' :
                                'border-green-500/50 text-green-400'
                              }`}>
                                {Math.round(mapping.competition)}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {mapping.intent ? (
                              <Badge variant="outline" className={`text-xs ${
                                mapping.intent.toLowerCase().includes('trans') ? 'border-purple-500/50 text-purple-400' :
                                mapping.intent.toLowerCase().includes('comm') ? 'border-orange-500/50 text-orange-400' :
                                mapping.intent.toLowerCase().includes('nav') ? 'border-blue-500/50 text-blue-400' :
                                'border-zinc-500/50 text-zinc-400'
                              }`}>
                                {mapping.intent.substring(0, 4)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {mapping.has_ai_overview === true ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs font-bold px-2 py-0.5 animate-pulse">
                                    AIO
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  Google zeigt für dieses Keyword eine AI Overview an. CTR kann um ~50% niedriger sein.
                                </TooltipContent>
                              </Tooltip>
                            ) : mapping.has_ai_overview === false ? (
                              <span className="text-muted-foreground text-xs">–</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">?</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <TrendIcon mapping={mapping} />
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
