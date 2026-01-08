import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Target, Search, AlertCircle, Sparkles,
  CheckCircle2, ExternalLink, Filter, Plus, RefreshCw, X, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { SistrixIcon } from "@/components/icons/SistrixIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContentGapAnalysisProps {
  domain: string;
  country: string;
  competitors: { domain: string; visibilityIndex: number }[];
}

interface GapKeyword {
  keyword: string;
  competitorPosition: number;
  competitorUrl: string;
  traffic: number;
  searchVolume?: number;
  competition?: number;
  ourPosition: number | null;
  opportunity: 'high' | 'medium' | 'low';
}

interface OwnKeyword {
  focus_keyword: string | null;
  current_position: number | null;
  search_volume: number | null;
}

interface SistrixCompetitor {
  domain: string;
  visibility: number;
  competition: number;
}

interface SavedCompetitor {
  id: string;
  competitor_domain: string;
  analyzed_at: string | null;
  keywords: GapKeyword[];
}

export const ContentGapAnalysis = ({ domain, country, competitors }: ContentGapAnalysisProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [customCompetitor, setCustomCompetitor] = useState<string>('');
  const [sistrixCompetitors, setSistrixCompetitors] = useState<SistrixCompetitor[]>([]);
  const [savedCompetitors, setSavedCompetitors] = useState<SavedCompetitor[]>([]);
  const [activeTab, setActiveTab] = useState<string>('add-new');
  const [ownKeywords, setOwnKeywords] = useState<OwnKeyword[]>([]);
  const [filter, setFilter] = useState<'all' | 'pos1' | 'pos2to5' | 'pos6to10'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    const cached = localStorage.getItem('content-gap-page-size');
    return cached ? parseInt(cached) : 25;
  });
  
  // Get current competitor's keywords based on active tab
  const currentCompetitor = useMemo(() => {
    return savedCompetitors.find(c => c.id === activeTab);
  }, [savedCompetitors, activeTab]);
  
  const gapKeywords = useMemo(() => {
    return currentCompetitor?.keywords || [];
  }, [currentCompetitor]);
  
  // Load saved competitors from database
  const loadSavedCompetitors = async () => {
    if (!domain) return;
    
    setIsLoadingSaved(true);
    try {
      // First, get all saved competitors for this domain
      const { data: competitorData, error: competitorError } = await supabase
        .from('content_gap_competitors')
        .select('id, competitor_domain, analyzed_at')
        .eq('domain', domain)
        .eq('country', country)
        .order('created_at', { ascending: false });
      
      if (competitorError) throw competitorError;
      
      if (!competitorData || competitorData.length === 0) {
        setSavedCompetitors([]);
        return;
      }
      
      // Load keywords for each competitor
      const competitorsWithKeywords: SavedCompetitor[] = [];
      
      for (const comp of competitorData) {
        const { data: keywordData, error: keywordError } = await supabase
          .from('content_gap_keywords')
          .select('*')
          .eq('competitor_id', comp.id)
          .order('traffic', { ascending: false });
        
        if (keywordError) {
          console.error(`Error loading keywords for ${comp.competitor_domain}:`, keywordError);
          continue;
        }
        
        competitorsWithKeywords.push({
          id: comp.id,
          competitor_domain: comp.competitor_domain,
          analyzed_at: comp.analyzed_at,
          keywords: (keywordData || []).map(kw => ({
            keyword: kw.keyword,
            competitorPosition: kw.competitor_position || 0,
            competitorUrl: kw.competitor_url || '',
            traffic: kw.traffic || 0,
            searchVolume: kw.search_volume,
            competition: kw.competition ? parseFloat(String(kw.competition)) : undefined,
            ourPosition: kw.our_position,
            opportunity: (kw.opportunity as 'high' | 'medium' | 'low') || 'low'
          }))
        });
      }
      
      setSavedCompetitors(competitorsWithKeywords);
      
      // Set first tab if we have saved competitors
      if (competitorsWithKeywords.length > 0 && activeTab === 'add-new') {
        setActiveTab(competitorsWithKeywords[0].id);
      }
      
      console.log(`[Content Gap] Loaded ${competitorsWithKeywords.length} saved competitors`);
    } catch (e) {
      console.error('[Content Gap] Error loading saved competitors:', e);
    } finally {
      setIsLoadingSaved(false);
    }
  };
  
  // Load SISTRIX suggested competitors
  const loadSistrixCompetitors = async () => {
    if (!domain) return;
    
    setIsLoadingCompetitors(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { 
          action: 'competitors.seo',
          domain,
          country
        }
      });
      
      if (error) throw error;
      
      const answer = data?.answer || [];
      const competitorData = answer
        .slice(0, 15)
        .map((item: any) => ({
          domain: item.domain,
          visibility: parseFloat(item.visibility) || 0,
          competition: parseFloat(item.competition) || 0
        }))
        .filter((c: SistrixCompetitor) => c.domain && c.domain !== domain);
      
      setSistrixCompetitors(competitorData);
      console.log(`[Content Gap] Loaded ${competitorData.length} SISTRIX competitors`);
    } catch (e) {
      console.error('[Content Gap] Error loading SISTRIX competitors:', e);
      toast.error('Failed to load competitor suggestions');
    } finally {
      setIsLoadingCompetitors(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    if (domain) {
      loadSavedCompetitors();
      if (sistrixCompetitors.length === 0) {
        loadSistrixCompetitors();
      }
    }
  }, [domain]);
  
  // Combine SISTRIX suggestions with passed competitors (excluding already saved ones)
  const allCompetitors = useMemo(() => {
    const savedDomains = new Set(savedCompetitors.map(c => c.competitor_domain));
    const seen = new Set<string>();
    const result: { domain: string; visibilityIndex: number; source: 'sistrix' | 'passed' }[] = [];
    
    // Add SISTRIX suggestions (excluding saved)
    sistrixCompetitors.forEach(c => {
      if (!seen.has(c.domain) && !savedDomains.has(c.domain)) {
        seen.add(c.domain);
        result.push({ domain: c.domain, visibilityIndex: c.visibility, source: 'sistrix' });
      }
    });
    
    // Add passed competitors (excluding saved)
    competitors.forEach(c => {
      if (!seen.has(c.domain) && !savedDomains.has(c.domain)) {
        seen.add(c.domain);
        result.push({ domain: c.domain, visibilityIndex: c.visibilityIndex, source: 'passed' });
      }
    });
    
    return result;
  }, [sistrixCompetitors, competitors, savedCompetitors]);
  
  // Handle custom competitor add
  const handleAddCustomCompetitor = () => {
    if (!customCompetitor.trim()) return;
    
    let cleanDomain = customCompetitor.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '');
    
    if (!cleanDomain.includes('.')) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }
    
    // Check if already saved
    if (savedCompetitors.some(c => c.competitor_domain === cleanDomain)) {
      toast.error('This competitor is already saved');
      return;
    }
    
    setSelectedCompetitor(cleanDomain);
    setCustomCompetitor('');
  };
  
  // Load own keywords from relaunch_url_mappings
  const loadOwnKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from('relaunch_url_mappings')
        .select('focus_keyword, current_position, search_volume')
        .eq('domain', domain)
        .not('focus_keyword', 'is', null);
      
      if (error) throw error;
      setOwnKeywords(data || []);
      console.log(`[Content Gap] Loaded ${data?.length || 0} own keywords from database`);
    } catch (e) {
      console.error('[Content Gap] Error loading own keywords:', e);
    }
  };
  
  useEffect(() => {
    if (domain) {
      loadOwnKeywords();
    }
  }, [domain]);
  
  // Analyze and save content gap
  const analyzeGap = async () => {
    if (!selectedCompetitor) {
      toast.error('Please select a competitor first');
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch competitor keywords via SISTRIX
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { 
          action: 'content-gap',
          domain,
          competitorDomain: selectedCompetitor,
          country
        }
      });
      
      if (error) throw error;
      
      const competitorKeywords = data?.answer?.[0]?.keywords || [];
      console.log(`[Content Gap] Received ${competitorKeywords.length} competitor keywords`);
      
      // Create a set of our keywords for fast lookup
      const ownKeywordSet = new Set(
        ownKeywords.map(k => k.focus_keyword?.toLowerCase().trim()).filter(Boolean)
      );
      
      // Find gaps
      const gaps: GapKeyword[] = competitorKeywords
        .filter((ck: any) => {
          const kwLower = ck.keyword?.toLowerCase().trim();
          return kwLower && !ownKeywordSet.has(kwLower);
        })
        .map((ck: any) => {
          const ourMatch = ownKeywords.find(ok => 
            ok.focus_keyword?.toLowerCase().includes(ck.keyword?.toLowerCase()) ||
            ck.keyword?.toLowerCase().includes(ok.focus_keyword?.toLowerCase() || '')
          );
          
          let opportunity: 'high' | 'medium' | 'low' = 'low';
          if (ck.position <= 3 && ck.traffic >= 100) {
            opportunity = 'high';
          } else if (ck.position <= 10 && ck.traffic >= 50) {
            opportunity = 'medium';
          }
          
          return {
            keyword: ck.keyword,
            competitorPosition: ck.position,
            competitorUrl: ck.competitorUrl || ck.url || '',
            traffic: ck.traffic,
            searchVolume: ck.searchVolume,
            competition: ck.competition,
            ourPosition: ourMatch?.current_position || null,
            opportunity
          };
        })
        .sort((a: GapKeyword, b: GapKeyword) => {
          const opOrder = { high: 0, medium: 1, low: 2 };
          if (opOrder[a.opportunity] !== opOrder[b.opportunity]) {
            return opOrder[a.opportunity] - opOrder[b.opportunity];
          }
          return b.traffic - a.traffic;
        });
      
      // Save to database
      const { data: competitorRecord, error: insertError } = await supabase
        .from('content_gap_competitors')
        .upsert({
          domain,
          competitor_domain: selectedCompetitor,
          country,
          analyzed_at: new Date().toISOString()
        }, { onConflict: 'domain,competitor_domain,country' })
        .select('id')
        .single();
      
      if (insertError) throw insertError;
      
      const competitorId = competitorRecord.id;
      
      // Delete old keywords for this competitor
      await supabase
        .from('content_gap_keywords')
        .delete()
        .eq('competitor_id', competitorId);
      
      // Insert new keywords
      if (gaps.length > 0) {
        const keywordInserts = gaps.map(gap => ({
          competitor_id: competitorId,
          keyword: gap.keyword,
          competitor_position: gap.competitorPosition,
          competitor_url: gap.competitorUrl,
          traffic: gap.traffic,
          search_volume: gap.searchVolume,
          competition: gap.competition,
          our_position: gap.ourPosition,
          opportunity: gap.opportunity
        }));
        
        const { error: keywordError } = await supabase
          .from('content_gap_keywords')
          .insert(keywordInserts);
        
        if (keywordError) {
          console.error('[Content Gap] Error saving keywords:', keywordError);
        }
      }
      
      // Reload saved competitors and switch to new tab
      await loadSavedCompetitors();
      setActiveTab(competitorId);
      setSelectedCompetitor('');
      
      toast.success(`Saved ${gaps.length} keyword opportunities for ${selectedCompetitor}`);
      console.log(`[Content Gap] Analysis complete: ${gaps.length} gaps saved`);
    } catch (e) {
      console.error('[Content Gap] Analysis error:', e);
      toast.error('Failed to analyze content gap');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a saved competitor
  const handleDeleteCompetitor = async (competitorId: string) => {
    try {
      const { error } = await supabase
        .from('content_gap_competitors')
        .delete()
        .eq('id', competitorId);
      
      if (error) throw error;
      
      setSavedCompetitors(prev => prev.filter(c => c.id !== competitorId));
      
      // Switch to add-new or next competitor
      if (activeTab === competitorId) {
        const remaining = savedCompetitors.filter(c => c.id !== competitorId);
        setActiveTab(remaining.length > 0 ? remaining[0].id : 'add-new');
      }
      
      toast.success('Competitor removed');
    } catch (e) {
      console.error('[Content Gap] Delete error:', e);
      toast.error('Failed to remove competitor');
    }
  };
  
  // Re-analyze a saved competitor
  const handleReanalyze = async (competitorDomain: string) => {
    setSelectedCompetitor(competitorDomain);
    setActiveTab('add-new');
  };
  
  // Filter and search keywords
  const filteredKeywords = useMemo(() => {
    return gapKeywords.filter(kw => {
      // Position-based filter
      if (filter === 'pos1' && kw.competitorPosition !== 1) return false;
      if (filter === 'pos2to5' && (kw.competitorPosition < 2 || kw.competitorPosition > 5)) return false;
      if (filter === 'pos6to10' && (kw.competitorPosition < 6 || kw.competitorPosition > 10)) return false;
      
      if (searchQuery) {
        return kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
               kw.competitorUrl?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [gapKeywords, filter, searchQuery]);
  
  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, activeTab]);
  
  // Persist page size
  useEffect(() => {
    localStorage.setItem('content-gap-page-size', String(pageSize));
  }, [pageSize]);
  
  // Paginated keywords
  const paginatedKeywords = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredKeywords.slice(startIdx, startIdx + pageSize);
  }, [filteredKeywords, currentPage, pageSize]);
  
  const totalPages = Math.ceil(filteredKeywords.length / pageSize);
  
  // Statistics - Position distribution
  const stats = useMemo(() => {
    return {
      total: gapKeywords.length,
      pos1: gapKeywords.filter(k => k.competitorPosition === 1).length,
      pos2to5: gapKeywords.filter(k => k.competitorPosition >= 2 && k.competitorPosition <= 5).length,
      pos6to10: gapKeywords.filter(k => k.competitorPosition >= 6 && k.competitorPosition <= 10).length,
      totalTraffic: gapKeywords.reduce((sum, k) => sum + k.traffic, 0)
    };
  }, [gapKeywords]);
  
  const getOpportunityBadge = (opportunity: 'high' | 'medium' | 'low') => {
    switch (opportunity) {
      case 'high':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Low</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Find keyword opportunities from competitors
        </p>
        {savedCompetitors.length > 0 && (
          <Badge className="bg-[#00a1ff]/20 text-[#00a1ff] border-[#00a1ff]/30">
            {savedCompetitors.length} Competitor{savedCompetitors.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
            {/* Loading State */}
            {isLoadingSaved ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading saved competitors...</span>
              </div>
            ) : (
              /* Tabs for competitors */
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="justify-start h-auto gap-2 bg-transparent p-0 mb-4">
                  {savedCompetitors.map((comp) => (
                    <TabsTrigger 
                      key={comp.id} 
                      value={comp.id}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-muted/30 data-[state=active]:bg-[#00a1ff] data-[state=active]:text-white data-[state=active]:border-[#00a1ff] hover:bg-muted/50 transition-colors"
                    >
                      <span className="max-w-[180px] truncate">{comp.competitor_domain}</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-background/50">
                        {comp.keywords.length}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCompetitor(comp.id);
                        }}
                        className="ml-1 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </TabsTrigger>
                  ))}
                  <TabsTrigger 
                    value="add-new"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-muted/30 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:border-green-600 hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add New
                  </TabsTrigger>
                </TabsList>
                
                {/* Add New Tab */}
                <TabsContent value="add-new" className="mt-4">
                  <Card className="p-4 bg-muted/20 border-border">
                    <div className="space-y-4">
                      {/* SISTRIX Suggested Competitors */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <SistrixIcon className="h-4 w-4" />
                            SISTRIX Competitor Suggestions
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadSistrixCompetitors}
                            disabled={isLoadingCompetitors}
                            className="h-7 text-xs"
                          >
                            {isLoadingCompetitors ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            Refresh
                          </Button>
                        </div>
                        
                        {allCompetitors.length > 0 ? (
                          <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Choose a competitor..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allCompetitors.map((comp) => (
                                <SelectItem key={comp.domain} value={comp.domain}>
                                  <div className="flex items-center gap-2">
                                    <span>{comp.domain}</span>
                                    <Badge variant="outline" className="text-xs">
                                      VI: {comp.visibilityIndex.toFixed(2)}
                                    </Badge>
                                    {comp.source === 'sistrix' && (
                                      <Badge className="bg-[#00a1ff]/20 text-[#00a1ff] text-xs border-[#00a1ff]/30">
                                        SISTRIX
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : isLoadingCompetitors ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading competitor suggestions...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            {savedCompetitors.length > 0 
                              ? 'All suggested competitors are already saved. Use the custom URL field.'
                              : 'No competitors found. Use the custom URL field below.'}
                          </div>
                        )}
                      </div>
                      
                      {/* Custom Competitor Input */}
                      <div>
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Or enter competitor URL manually
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="competitor-domain.com"
                            value={customCompetitor}
                            onChange={(e) => setCustomCompetitor(e.target.value)}
                            className="flex-1 bg-background"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomCompetitor();
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={handleAddCustomCompetitor}
                            disabled={!customCompetitor.trim()}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Set
                          </Button>
                        </div>
                      </div>
                      
                      {/* Selected Competitor Display */}
                      {selectedCompetitor && (
                        <div className="flex items-center gap-2 p-2 bg-[#00a1ff]/10 rounded-md border border-[#00a1ff]/30">
                          <Target className="h-4 w-4 text-[#00a1ff]" />
                          <span className="text-sm font-medium">Selected:</span>
                          <Badge className="bg-[#00a1ff] text-white">{selectedCompetitor}</Badge>
                        </div>
                      )}
                      
                      {/* Analyze Button */}
                      <Button
                        onClick={analyzeGap}
                        disabled={!selectedCompetitor || isLoading}
                        className="w-full h-10 bg-[#00a1ff] hover:bg-[#0088dd] text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Analyze & Save Content Gap
                      </Button>
                    </div>
                    
                    {/* Own Keywords Info */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                      {ownKeywords.length} own keywords loaded from database (no API cost)
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Saved Competitor Tabs */}
                {savedCompetitors.map((comp) => (
                  <TabsContent key={comp.id} value={comp.id} className="mt-4 space-y-4">
                    {/* Header with competitor info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#00a1ff] text-white text-sm px-3 py-1">
                          {comp.competitor_domain}
                        </Badge>
                        {comp.analyzed_at && (
                          <span className="text-xs text-muted-foreground">
                            Analyzed: {new Date(comp.analyzed_at).toLocaleString('de-DE')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReanalyze(comp.competitor_domain)}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Re-analyze
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCompetitor(comp.id)}
                          className="text-xs text-red-400 hover:text-red-500 hover:border-red-400"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Statistics - Position Distribution */}
                    <div className="grid grid-cols-5 gap-3">
                      <Card className="p-3 bg-muted/20 text-center">
                        <div className="text-2xl font-bold text-[#00a1ff]">{stats.total}</div>
                        <div className="text-xs text-muted-foreground">Total Keywords</div>
                      </Card>
                      <Card className="p-3 bg-green-500/10 text-center">
                        <div className="text-2xl font-bold text-green-400">{stats.pos1}</div>
                        <div className="text-xs text-muted-foreground">Position 1</div>
                      </Card>
                      <Card className="p-3 bg-yellow-500/10 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{stats.pos2to5}</div>
                        <div className="text-xs text-muted-foreground">Position 2-5</div>
                      </Card>
                      <Card className="p-3 bg-orange-500/10 text-center">
                        <div className="text-2xl font-bold text-orange-400">{stats.pos6to10}</div>
                        <div className="text-xs text-muted-foreground">Position 6-10</div>
                      </Card>
                      <Card className="p-3 bg-muted/20 text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.totalTraffic.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Est. Traffic (Σ)</div>
                      </Card>
                    </div>
                    
                    {/* Filter & Search */}
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search keywords or URLs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                        <SelectTrigger className="w-[180px]">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All ({stats.total})</SelectItem>
                          <SelectItem value="pos1">Position 1 ({stats.pos1})</SelectItem>
                          <SelectItem value="pos2to5">Position 2-5 ({stats.pos2to5})</SelectItem>
                          <SelectItem value="pos6to10">Position 6-10 ({stats.pos6to10})</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Keyword List - Full height without scrolling */}
                    <div className="rounded-lg border border-border">
                      <div className="p-2 space-y-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-muted/30 rounded-t-md">
                          <div className="col-span-3">Keyword</div>
                          <div className="col-span-1 text-center">Pos.</div>
                          <div className="col-span-1 text-center">Traffic</div>
                          <div className="col-span-7">Competitor URL</div>
                        </div>
                        
                        {paginatedKeywords.map((kw, idx) => (
                          <div 
                            key={`${kw.keyword}-${idx}`}
                            className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                          >
                            {/* Keyword */}
                            <div className="col-span-3">
                              <span className="font-medium text-foreground text-sm">{kw.keyword}</span>
                              {kw.ourPosition && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">
                                    We rank #{kw.ourPosition}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            {/* Position */}
                            <div className="col-span-1 text-center">
                              <Badge variant="outline" className="text-xs">
                                #{kw.competitorPosition}
                              </Badge>
                            </div>
                            
                            {/* Traffic */}
                            <div className="col-span-1 text-center text-sm text-muted-foreground">
                              {kw.traffic.toLocaleString()}
                            </div>
                            
                            {/* URL - Full width, no truncation */}
                            <div className="col-span-7 flex items-center gap-2">
                              {kw.competitorUrl ? (
                                <>
                                  <span className="text-xs text-muted-foreground break-all flex-1">
                                    {kw.competitorUrl.replace(/^https?:\/\//, '')}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(kw.competitorUrl, '_blank')}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground/50 italic">No URL</span>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {paginatedKeywords.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No keywords match your filter</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Pagination */}
                      {filteredKeywords.length > pageSize && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Show</span>
                            <Select 
                              value={String(pageSize)} 
                              onValueChange={(v) => {
                                setPageSize(parseInt(v));
                                setCurrentPage(1);
                              }}
                            >
                              <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                            <span>of {filteredKeywords.length}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-3 text-sm">
                              {currentPage} / {totalPages}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
            
      {/* Empty State for no saved competitors */}
      {!isLoadingSaved && savedCompetitors.length === 0 && activeTab === 'add-new' && (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">Add your first competitor above to start analyzing content gaps</p>
        </div>
      )}
    </div>
  );
};

export default ContentGapAnalysis;
