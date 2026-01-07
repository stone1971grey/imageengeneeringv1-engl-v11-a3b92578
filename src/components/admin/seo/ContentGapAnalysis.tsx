import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, Loader2, Target, TrendingUp, Search, AlertCircle, 
  CheckCircle2, ExternalLink, Filter, ArrowUpRight, Sparkles, Plus, RefreshCw
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

export const ContentGapAnalysis = ({ domain, country, competitors }: ContentGapAnalysisProps) => {
  const [isOpen, setIsOpen] = useState(() => {
    const cached = localStorage.getItem('seo-content-gap-open');
    return cached !== null ? cached === 'true' : false;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('');
  const [customCompetitor, setCustomCompetitor] = useState<string>('');
  const [sistrixCompetitors, setSistrixCompetitors] = useState<SistrixCompetitor[]>([]);
  const [gapKeywords, setGapKeywords] = useState<GapKeyword[]>([]);
  const [ownKeywords, setOwnKeywords] = useState<OwnKeyword[]>([]);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);
  
  // Persist open state
  useEffect(() => {
    localStorage.setItem('seo-content-gap-open', String(isOpen));
  }, [isOpen]);
  
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
        .slice(0, 15) // Top 15 competitors
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
  
  // Load competitors on open
  useEffect(() => {
    if (isOpen && domain && sistrixCompetitors.length === 0) {
      loadSistrixCompetitors();
    }
  }, [isOpen, domain]);
  
  // Combine SISTRIX suggestions with passed competitors (deduplicated)
  const allCompetitors = useMemo(() => {
    const seen = new Set<string>();
    const result: { domain: string; visibilityIndex: number; source: 'sistrix' | 'passed' }[] = [];
    
    // Add SISTRIX suggestions first
    sistrixCompetitors.forEach(c => {
      if (!seen.has(c.domain)) {
        seen.add(c.domain);
        result.push({ domain: c.domain, visibilityIndex: c.visibility, source: 'sistrix' });
      }
    });
    
    // Add passed competitors
    competitors.forEach(c => {
      if (!seen.has(c.domain)) {
        seen.add(c.domain);
        result.push({ domain: c.domain, visibilityIndex: c.visibilityIndex, source: 'passed' });
      }
    });
    
    return result;
  }, [sistrixCompetitors, competitors]);
  
  // Handle custom competitor add
  const handleAddCustomCompetitor = () => {
    if (!customCompetitor.trim()) return;
    
    // Clean up domain
    let cleanDomain = customCompetitor.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '');
    
    if (!cleanDomain.includes('.')) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }
    
    setSelectedCompetitor(cleanDomain);
    setCustomCompetitor('');
    toast.success(`Custom competitor set: ${cleanDomain}`);
  };
  
  // Load own keywords from relaunch_url_mappings (no API cost)
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
  
  // Load own keywords on mount
  useEffect(() => {
    if (domain) {
      loadOwnKeywords();
    }
  }, [domain]);
  
  // Analyze content gap
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
      
      // Find gaps: Keywords competitor ranks for but we don't have
      const gaps: GapKeyword[] = competitorKeywords
        .filter((ck: any) => {
          const kwLower = ck.keyword?.toLowerCase().trim();
          return kwLower && !ownKeywordSet.has(kwLower);
        })
        .map((ck: any) => {
          // Check if we have a similar keyword (partial match)
          const ourMatch = ownKeywords.find(ok => 
            ok.focus_keyword?.toLowerCase().includes(ck.keyword?.toLowerCase()) ||
            ck.keyword?.toLowerCase().includes(ok.focus_keyword?.toLowerCase() || '')
          );
          
          // Calculate opportunity based on competitor position and traffic
          let opportunity: 'high' | 'medium' | 'low' = 'low';
          if (ck.position <= 3 && ck.traffic >= 100) {
            opportunity = 'high';
          } else if (ck.position <= 10 && ck.traffic >= 50) {
            opportunity = 'medium';
          }
          
          return {
            keyword: ck.keyword,
            competitorPosition: ck.position,
            competitorUrl: ck.competitorUrl,
            traffic: ck.traffic,
            ourPosition: ourMatch?.current_position || null,
            opportunity
          };
        })
        .sort((a: GapKeyword, b: GapKeyword) => {
          // Sort by opportunity, then by traffic
          const opOrder = { high: 0, medium: 1, low: 2 };
          if (opOrder[a.opportunity] !== opOrder[b.opportunity]) {
            return opOrder[a.opportunity] - opOrder[b.opportunity];
          }
          return b.traffic - a.traffic;
        });
      
      setGapKeywords(gaps);
      setLastAnalyzedAt(new Date().toISOString());
      
      toast.success(`Found ${gaps.length} keyword opportunities`);
      console.log(`[Content Gap] Analysis complete: ${gaps.length} gaps found`);
    } catch (e) {
      console.error('[Content Gap] Analysis error:', e);
      toast.error('Failed to analyze content gap');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter and search keywords
  const filteredKeywords = useMemo(() => {
    return gapKeywords.filter(kw => {
      // Filter by opportunity level
      if (filter !== 'all' && kw.opportunity !== filter) return false;
      
      // Filter by search query
      if (searchQuery) {
        return kw.keyword.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
  }, [gapKeywords, filter, searchQuery]);
  
  // Statistics
  const stats = useMemo(() => {
    return {
      total: gapKeywords.length,
      high: gapKeywords.filter(k => k.opportunity === 'high').length,
      medium: gapKeywords.filter(k => k.opportunity === 'medium').length,
      low: gapKeywords.filter(k => k.opportunity === 'low').length,
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-[#00a1ff]/30 rounded-lg overflow-hidden bg-gradient-to-br from-[#00a1ff]/5 to-transparent">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00a1ff] rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground">Content Gap Analysis</span>
              <p className="text-xs text-muted-foreground">Find keyword opportunities from competitors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {gapKeywords.length > 0 && (
              <Badge className="bg-[#00a1ff]/20 text-[#00a1ff] border-[#00a1ff]/30">
                {gapKeywords.length} Opportunities
              </Badge>
            )}
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
            {/* Competitor Selection */}
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
                      No competitors found. Use the custom URL field below.
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
                      Add
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
                  Analyze Content Gap
                </Button>
              </div>
              
              {/* Own Keywords Info */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-green-400" />
                {ownKeywords.length} own keywords loaded from database (no API cost)
              </div>
            </Card>
            
            {/* Results */}
            {gapKeywords.length > 0 && (
              <>
                {/* Statistics */}
                <div className="grid grid-cols-5 gap-3">
                  <Card className="p-3 bg-muted/20 text-center">
                    <div className="text-2xl font-bold text-[#00a1ff]">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total Gaps</div>
                  </Card>
                  <Card className="p-3 bg-green-500/10 text-center cursor-pointer hover:bg-green-500/20 transition-colors" onClick={() => setFilter('high')}>
                    <div className="text-2xl font-bold text-green-400">{stats.high}</div>
                    <div className="text-xs text-muted-foreground">High Priority</div>
                  </Card>
                  <Card className="p-3 bg-yellow-500/10 text-center cursor-pointer hover:bg-yellow-500/20 transition-colors" onClick={() => setFilter('medium')}>
                    <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
                    <div className="text-xs text-muted-foreground">Medium</div>
                  </Card>
                  <Card className="p-3 bg-muted/20 text-center cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setFilter('low')}>
                    <div className="text-2xl font-bold text-gray-400">{stats.low}</div>
                    <div className="text-xs text-muted-foreground">Low</div>
                  </Card>
                  <Card className="p-3 bg-muted/20 text-center">
                    <div className="text-2xl font-bold text-foreground">{stats.totalTraffic.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Est. Traffic</div>
                  </Card>
                </div>
                
                {/* Filter & Search */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ({stats.total})</SelectItem>
                      <SelectItem value="high">High ({stats.high})</SelectItem>
                      <SelectItem value="medium">Medium ({stats.medium})</SelectItem>
                      <SelectItem value="low">Low ({stats.low})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Keyword List */}
                <ScrollArea className="h-[400px] rounded-lg border border-border">
                  <div className="p-2 space-y-2">
                    {filteredKeywords.map((kw, idx) => (
                      <div 
                        key={`${kw.keyword}-${idx}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground truncate">{kw.keyword}</span>
                            {getOpportunityBadge(kw.opportunity)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Pos #{kw.competitorPosition}
                            </span>
                            <span>Traffic: {kw.traffic}</span>
                            {kw.ourPosition && (
                              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                We rank #{kw.ourPosition}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {kw.competitorUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(kw.competitorUrl, '_blank')}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {filteredKeywords.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No keywords match your filter</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Last Analyzed */}
                {lastAnalyzedAt && (
                  <div className="text-xs text-muted-foreground text-center">
                    Last analyzed: {new Date(lastAnalyzedAt).toLocaleString('de-DE')}
                  </div>
                )}
              </>
            )}
            
            {/* Empty State */}
            {gapKeywords.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No content gaps analyzed yet</p>
                <p className="text-sm mt-2">Select a competitor and click "Analyze Gap" to find opportunities</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ContentGapAnalysis;
