import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
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
  CheckCircle2
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
      // Type assertion since we know the structure
      setMappings(data as unknown as MappingRow[]);
      updateStats(data as unknown as MappingRow[]);
    }
  }, [domain]);
  
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
  
  // Fetch rankings from SISTRIX and save to database
  const fetchRankings = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch top URLs from SISTRIX using domain.urls endpoint
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { 
          action: 'domain.urls', 
          domain, 
          country,
          limit: 500 // Get up to 500 URLs
        }
      });
      
      if (error) throw error;
      
      // domain.urls returns array of URLs with top10, top100, and visibilityShare
      const urlData = data?.answer?.[0]?.url || [];
      console.log('[Relaunch] Fetched URL data:', urlData.length);
      
      if (urlData.length === 0) {
        toast.warning('No ranking URLs found for this domain');
        setIsLoading(false);
        return;
      }
      
      // Transform and save to database
      const today = new Date().toISOString().split('T')[0];
      const mappingsToInsert = urlData.map((r: any) => ({
        domain,
        old_url: r.url || '',
        focus_keyword: null, // domain.urls doesn't provide individual keywords
        current_position: null, // We'll need to fetch this separately or use top10/top100 count
        search_volume: null,
        competition: null,
        cpc: null,
        traffic_estimate: parseInt(r.top10) || null, // Use top10 count as a traffic indicator
        new_url_suggestion: suggestNewUrl(r.url || '', ''),
        approval_status: 'pending',
        trend: 'stable',
        snapshot_date: today,
        notes: `Top10: ${r.top10 || 0}, Top100: ${r.top100 || 0}, Visibility: ${r.visibilityShare || 0}%`
      }));
      
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
      
      toast.success(`${urlData.length} URLs imported`);
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
  
  // Filter mappings
  const filteredMappings = mappings.filter(m => {
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
  
  // Trend icon
  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
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
            {filteredMappings.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 font-medium">Old URL</th>
                        <th className="text-left p-3 font-medium">Focus Keyword</th>
                        <th className="text-center p-3 font-medium w-16">Pos.</th>
                        <th className="text-center p-3 font-medium w-20">Volume</th>
                        <th className="text-center p-3 font-medium w-16">Trend</th>
                        <th className="text-left p-3 font-medium">New URL</th>
                        <th className="text-center p-3 font-medium w-24">Status</th>
                        <th className="text-center p-3 font-medium w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredMappings.map((mapping) => (
                        <tr key={mapping.id} className="hover:bg-muted/20">
                          <td className="p-3">
                            <a 
                              href={mapping.old_url.startsWith('http') ? mapping.old_url : `https://${domain}${mapping.old_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#00a1ff] hover:underline flex items-center gap-1 max-w-[200px] truncate"
                            >
                              {mapping.old_url}
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          </td>
                          <td className="p-3">
                            <span className="font-medium">{mapping.focus_keyword || '-'}</span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={
                              (mapping.current_position || 999) <= 3 ? 'border-green-500/50 text-green-400' :
                              (mapping.current_position || 999) <= 10 ? 'border-blue-500/50 text-blue-400' :
                              (mapping.current_position || 999) <= 20 ? 'border-amber-500/50 text-amber-400' :
                              'border-zinc-500/50 text-zinc-400'
                            }>
                              #{mapping.current_position || '-'}
                            </Badge>
                          </td>
                          <td className="p-3 text-center text-muted-foreground">
                            {mapping.search_volume?.toLocaleString() || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <TrendIcon trend={mapping.trend} />
                          </td>
                          <td className="p-3">
                            {mapping.approval_status === 'approved' ? (
                              <span className="text-green-400 flex items-center gap-1">
                                {mapping.new_url}
                                <Check className="h-3 w-3" />
                              </span>
                            ) : (
                              <Select
                                value={mapping.new_url || mapping.new_url_suggestion || ''}
                                onValueChange={(value) => updateMapping(mapping.id, { new_url: value })}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder={mapping.new_url_suggestion || 'Select new URL...'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {mapping.new_url_suggestion && (
                                    <SelectItem value={mapping.new_url_suggestion}>
                                      {mapping.new_url_suggestion} (suggested)
                                    </SelectItem>
                                  )}
                                  {pageRegistry.map(page => (
                                    <SelectItem key={page.page_slug} value={`/${page.page_slug}`}>
                                      /{page.page_slug}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <StatusBadge status={mapping.approval_status} />
                          </td>
                          <td className="p-3">
                            {mapping.approval_status === 'pending' && (
                              <div className="flex gap-1 justify-center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                  onClick={() => approveMapping(mapping)}
                                  disabled={isSaving}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => updateMapping(mapping.id, { approval_status: 'rejected' })}
                                  disabled={isSaving}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {mapping.approval_status === 'approved' && mapping.redirect_created && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                301 ✓
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
