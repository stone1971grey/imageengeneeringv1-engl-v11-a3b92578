import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Loader2, TrendingUp, TrendingDown, BarChart3, Target, Users, ArrowUpRight, RefreshCw, Zap, Trophy, Search } from "lucide-react";
import { SistrixIcon } from "@/components/icons/SistrixIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RelaunchDashboard } from "./RelaunchDashboard";

interface SistrixEnterpriseTabProps {
  pageSlug: string;
  editorLanguage?: string;
}

interface VisibilityData {
  date: string;
  value: number;
}

interface CompetitorData {
  domain: string;
  visibilityIndex: number;
  competition: number;
}

interface RankingDistribution {
  top3: number;
  top10: number;
  top20: number;
  top100: number;
}

export const SistrixEnterpriseTab = ({ pageSlug, editorLanguage = 'en' }: SistrixEnterpriseTabProps) => {
  // Domain input state
  const [domain, setDomain] = useState<string>('');
  const [country, setCountry] = useState<string>('de');
  
  // Loading states
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [isLoadingVisibility, setIsLoadingVisibility] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [isLoadingDistribution, setIsLoadingDistribution] = useState(false);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
  
  // Data states
  const [credits, setCredits] = useState<number | null>(null);
  const [visibilityIndex, setVisibilityIndex] = useState<number | null>(null);
  const [visibilityHistory, setVisibilityHistory] = useState<VisibilityData[]>([]);
  const [keywordCount, setKeywordCount] = useState<{ total: number; top10: number } | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [rankingDistribution, setRankingDistribution] = useState<RankingDistribution | null>(null);
  const [trafficEstimate, setTrafficEstimate] = useState<number | null>(null);
  
  // Collapsible states with localStorage persistence
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(() => {
    const cached = localStorage.getItem('seo-sistrix-visibility-open');
    return cached !== null ? cached === 'true' : true;
  });
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(() => {
    const cached = localStorage.getItem('seo-sistrix-keywords-open');
    return cached !== null ? cached === 'true' : true;
  });
  const [isCompetitorsOpen, setIsCompetitorsOpen] = useState(() => {
    const cached = localStorage.getItem('seo-sistrix-competitors-open');
    return cached !== null ? cached === 'true' : false;
  });
  const [isDistributionOpen, setIsDistributionOpen] = useState(() => {
    const cached = localStorage.getItem('seo-sistrix-distribution-open');
    return cached !== null ? cached === 'true' : false;
  });
  
  // Persist collapsible states
  useEffect(() => {
    localStorage.setItem('seo-sistrix-visibility-open', String(isVisibilityOpen));
  }, [isVisibilityOpen]);
  
  useEffect(() => {
    localStorage.setItem('seo-sistrix-keywords-open', String(isKeywordsOpen));
  }, [isKeywordsOpen]);
  
  useEffect(() => {
    localStorage.setItem('seo-sistrix-competitors-open', String(isCompetitorsOpen));
  }, [isCompetitorsOpen]);
  
  useEffect(() => {
    localStorage.setItem('seo-sistrix-distribution-open', String(isDistributionOpen));
  }, [isDistributionOpen]);
  
  // Load saved domain from localStorage
  useEffect(() => {
    const savedDomain = localStorage.getItem('sistrix-domain');
    if (savedDomain) {
      setDomain(savedDomain);
    }
    const savedCountry = localStorage.getItem('sistrix-country');
    if (savedCountry) {
      setCountry(savedCountry);
    }
  }, []);
  
  // Save domain to localStorage when changed
  useEffect(() => {
    if (domain) {
      localStorage.setItem('sistrix-domain', domain);
    }
  }, [domain]);
  
  useEffect(() => {
    if (country) {
      localStorage.setItem('sistrix-country', country);
    }
  }, [country]);

  // Check API credits
  const checkCredits = async () => {
    setIsLoadingCredits(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { action: 'credits' }
      });
      
      if (error) throw error;
      
      // SISTRIX API returns credits in response.answer.credits
      const creditsValue = data?.answer?.[0]?.credits ?? data?.credits ?? null;
      setCredits(creditsValue);
      console.log('[SISTRIX] Credits:', creditsValue);
    } catch (e) {
      console.error('[SISTRIX] Credits error:', e);
      toast.error('Failed to check SISTRIX credits');
    } finally {
      setIsLoadingCredits(false);
    }
  };
  
  // Fetch Visibility Index
  const fetchVisibility = async (withHistory = false) => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoadingVisibility(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { 
          action: 'visibilityindex', 
          domain, 
          country,
          history: withHistory
        }
      });
      
      if (error) throw error;
      
      // Parse response - SISTRIX returns data in answer array
      const answer = data?.answer || [];
      if (withHistory && answer.length > 0) {
        const historyData = answer.map((item: any) => ({
          date: item.date,
          value: parseFloat(item.value) || 0
        }));
        setVisibilityHistory(historyData);
        if (historyData.length > 0) {
          setVisibilityIndex(historyData[0].value);
        }
      } else if (answer.length > 0) {
        setVisibilityIndex(parseFloat(answer[0].value) || 0);
      }
      
      toast.success('Visibility data loaded');
      console.log('[SISTRIX] Visibility:', data);
    } catch (e) {
      console.error('[SISTRIX] Visibility error:', e);
      toast.error('Failed to fetch visibility data');
    } finally {
      setIsLoadingVisibility(false);
    }
  };
  
  // Fetch Keyword Count
  const fetchKeywords = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoadingKeywords(true);
    try {
      // Fetch both total and top10 in parallel
      const [totalResult, top10Result] = await Promise.all([
        supabase.functions.invoke('sistrix-api', {
          body: { action: 'kwcount.seo', domain, country }
        }),
        supabase.functions.invoke('sistrix-api', {
          body: { action: 'kwcount.seo.top10', domain, country }
        })
      ]);
      
      const totalCount = totalResult.data?.answer?.[0]?.value ?? 0;
      const top10Count = top10Result.data?.answer?.[0]?.value ?? 0;
      
      setKeywordCount({
        total: parseInt(totalCount) || 0,
        top10: parseInt(top10Count) || 0
      });
      
      toast.success('Keyword data loaded');
      console.log('[SISTRIX] Keywords:', { total: totalCount, top10: top10Count });
    } catch (e) {
      console.error('[SISTRIX] Keywords error:', e);
      toast.error('Failed to fetch keyword data');
    } finally {
      setIsLoadingKeywords(false);
    }
  };
  
  // Fetch Competitors
  const fetchCompetitors = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoadingCompetitors(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { action: 'competitors.seo', domain, country }
      });
      
      if (error) throw error;
      
      const answer = data?.answer || [];
      const competitorData = answer.slice(0, 10).map((item: any) => ({
        domain: item.domain,
        visibilityIndex: parseFloat(item.visibility) || 0,
        competition: parseFloat(item.competition) || 0
      }));
      
      setCompetitors(competitorData);
      toast.success(`${competitorData.length} competitors found`);
      console.log('[SISTRIX] Competitors:', competitorData);
    } catch (e) {
      console.error('[SISTRIX] Competitors error:', e);
      toast.error('Failed to fetch competitor data');
    } finally {
      setIsLoadingCompetitors(false);
    }
  };
  
  // Fetch Ranking Distribution
  const fetchDistribution = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoadingDistribution(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { action: 'ranking.distribution', domain, country }
      });
      
      if (error) throw error;
      
      const answer = data?.answer?.[0] || {};
      setRankingDistribution({
        top3: parseInt(answer['pos1-3']) || 0,
        top10: parseInt(answer['pos4-10']) || 0,
        top20: parseInt(answer['pos11-20']) || 0,
        top100: parseInt(answer['pos21-100']) || 0
      });
      
      toast.success('Ranking distribution loaded');
      console.log('[SISTRIX] Distribution:', answer);
    } catch (e) {
      console.error('[SISTRIX] Distribution error:', e);
      toast.error('Failed to fetch ranking distribution');
    } finally {
      setIsLoadingDistribution(false);
    }
  };
  
  // Fetch Traffic Estimate
  const fetchTraffic = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    setIsLoadingTraffic(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { action: 'traffic.estimation', domain, country }
      });
      
      if (error) throw error;
      
      const traffic = data?.answer?.[0]?.traffic ?? 0;
      setTrafficEstimate(parseInt(traffic) || 0);
      
      toast.success('Traffic estimate loaded');
      console.log('[SISTRIX] Traffic:', traffic);
    } catch (e) {
      console.error('[SISTRIX] Traffic error:', e);
      toast.error('Failed to fetch traffic estimate');
    } finally {
      setIsLoadingTraffic(false);
    }
  };
  
  // Load all data at once
  const loadAllData = async () => {
    if (!domain) {
      toast.error('Please enter a domain first');
      return;
    }
    
    await Promise.all([
      fetchVisibility(true),
      fetchKeywords(),
      fetchCompetitors(),
      fetchDistribution(),
      fetchTraffic()
    ]);
    
    toast.success('All SISTRIX data loaded');
  };

  return (
    <div className="space-y-6">
      {/* Relaunch Dashboard - Primary Feature */}
      <RelaunchDashboard editorLanguage={editorLanguage} />
      
      {/* Header with SISTRIX Branding */}
      <div className="p-4 bg-gradient-to-r from-[#00a1ff]/20 to-[#0066cc]/20 border border-[#00a1ff]/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00a1ff] rounded-lg flex items-center justify-center">
              <SistrixIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">SISTRIX Enterprise SEO</h3>
              <p className="text-sm text-muted-foreground">Live SEO data powered by SISTRIX API</p>
            </div>
          </div>
          
          {/* Credits Display */}
          <div className="flex items-center gap-3">
            {credits !== null && (
              <Badge className="bg-[#00a1ff]/20 text-[#00a1ff] border-[#00a1ff]/30 text-sm px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                {credits.toLocaleString()} Credits
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={checkCredits}
              disabled={isLoadingCredits}
              className="border-[#00a1ff]/30 text-[#00a1ff] hover:bg-[#00a1ff]/10"
            >
              {isLoadingCredits ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Domain Input */}
      <Card className="p-4 bg-muted/20 border-border">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="sistrix-domain" className="text-sm font-medium text-foreground mb-2 block">
              Domain to Analyze
            </Label>
            <Input
              id="sistrix-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="bg-background"
            />
          </div>
          <div className="w-32">
            <Label htmlFor="sistrix-country" className="text-sm font-medium text-foreground mb-2 block">
              Country
            </Label>
            <select
              id="sistrix-country"
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
              <option value="nl">Netherlands</option>
              <option value="pl">Poland</option>
            </select>
          </div>
          <Button
            onClick={loadAllData}
            className="h-10 bg-[#00a1ff] hover:bg-[#0088dd] text-white px-6"
            disabled={!domain || isLoadingVisibility || isLoadingKeywords}
          >
            {(isLoadingVisibility || isLoadingKeywords) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Analyze
          </Button>
        </div>
      </Card>
      
      {/* Visibility Index Section */}
      <Collapsible open={isVisibilityOpen} onOpenChange={setIsVisibilityOpen}>
        <div className="border border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00a1ff]" />
              <span className="font-semibold text-foreground">Visibility Index</span>
            </div>
            <div className="flex items-center gap-3">
              {visibilityIndex !== null && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-3">
                  {visibilityIndex.toFixed(2)}
                </Badge>
              )}
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isVisibilityOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 space-y-4">
              {visibilityIndex !== null ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-muted/20">
                      <div className="text-sm text-muted-foreground mb-1">Current Visibility</div>
                      <div className="text-3xl font-bold text-[#00a1ff]">{visibilityIndex.toFixed(2)}</div>
                    </Card>
                    {trafficEstimate !== null && (
                      <Card className="p-4 bg-muted/20">
                        <div className="text-sm text-muted-foreground mb-1">Est. Monthly Traffic</div>
                        <div className="text-3xl font-bold text-green-400">{trafficEstimate.toLocaleString()}</div>
                      </Card>
                    )}
                  </div>
                  
                  {visibilityHistory.length > 0 && (
                    <div className="p-4 bg-muted/10 rounded-lg">
                      <div className="text-sm font-medium text-foreground mb-3">Visibility History (Last {Math.min(visibilityHistory.length, 12)} months)</div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {visibilityHistory.slice(0, 12).map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center min-w-[60px]">
                            <div className="text-xs text-muted-foreground">{item.date?.substring(5, 10)}</div>
                            <div className="w-full h-16 bg-muted/30 rounded relative overflow-hidden mt-1">
                              <div 
                                className="absolute bottom-0 w-full bg-[#00a1ff]/70 rounded-t"
                                style={{ 
                                  height: `${Math.min((item.value / (visibilityHistory[0]?.value || 1)) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="text-xs font-medium mt-1">{item.value.toFixed(1)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a domain and click "Analyze" to load visibility data</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      {/* Keyword Rankings Section */}
      <Collapsible open={isKeywordsOpen} onOpenChange={setIsKeywordsOpen}>
        <div className="border border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span className="font-semibold text-foreground">Keyword Rankings</span>
            </div>
            <div className="flex items-center gap-3">
              {keywordCount && (
                <div className="flex gap-2">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {keywordCount.top10.toLocaleString()} Top 10
                  </Badge>
                  <Badge className="bg-muted/50 text-muted-foreground border-border">
                    {keywordCount.total.toLocaleString()} Total
                  </Badge>
                </div>
              )}
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isKeywordsOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 space-y-4">
              {keywordCount ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">Top 10 Keywords</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">{keywordCount.top10.toLocaleString()}</div>
                  </Card>
                  <Card className="p-4 bg-muted/20">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Keywords</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">{keywordCount.total.toLocaleString()}</div>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Keyword data will appear after analysis</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      {/* Ranking Distribution Section */}
      <Collapsible open={isDistributionOpen} onOpenChange={setIsDistributionOpen}>
        <div className="border border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-400" />
              <span className="font-semibold text-foreground">Ranking Distribution</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isDistributionOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 space-y-4">
              {rankingDistribution ? (
                <div className="grid grid-cols-4 gap-3">
                  <Card className="p-3 bg-green-500/10 border-green-500/30">
                    <div className="text-xs text-green-400 mb-1">Position 1-3</div>
                    <div className="text-2xl font-bold text-green-400">{rankingDistribution.top3.toLocaleString()}</div>
                  </Card>
                  <Card className="p-3 bg-blue-500/10 border-blue-500/30">
                    <div className="text-xs text-blue-400 mb-1">Position 4-10</div>
                    <div className="text-2xl font-bold text-blue-400">{rankingDistribution.top10.toLocaleString()}</div>
                  </Card>
                  <Card className="p-3 bg-yellow-500/10 border-yellow-500/30">
                    <div className="text-xs text-yellow-400 mb-1">Position 11-20</div>
                    <div className="text-2xl font-bold text-yellow-400">{rankingDistribution.top20.toLocaleString()}</div>
                  </Card>
                  <Card className="p-3 bg-muted/30 border-border">
                    <div className="text-xs text-muted-foreground mb-1">Position 21-100</div>
                    <div className="text-2xl font-bold text-muted-foreground">{rankingDistribution.top100.toLocaleString()}</div>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Distribution data will appear after analysis</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      {/* Competitors Section */}
      <Collapsible open={isCompetitorsOpen} onOpenChange={setIsCompetitorsOpen}>
        <div className="border border-border rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-400" />
              <span className="font-semibold text-foreground">SEO Competitors</span>
            </div>
            <div className="flex items-center gap-3">
              {competitors.length > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  {competitors.length} Competitors
                </Badge>
              )}
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isCompetitorsOpen ? 'rotate-180' : ''}`} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4 space-y-3">
              {competitors.length > 0 ? (
                competitors.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-7 h-7 rounded-full flex items-center justify-center text-xs">
                        {idx + 1}
                      </Badge>
                      <span className="font-medium">{comp.domain}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Visibility</div>
                        <div className="font-semibold text-[#00a1ff]">{comp.visibilityIndex.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Competition</div>
                        <div className="font-semibold">{(comp.competition * 100).toFixed(0)}%</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://${comp.domain}`, '_blank')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Competitor data will appear after analysis</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      {/* API Info Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        Data provided by SISTRIX API • Updates reflect current Google rankings
      </div>
    </div>
  );
};
