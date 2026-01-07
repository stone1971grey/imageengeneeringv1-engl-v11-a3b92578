import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Loader2, RefreshCw, Zap, Eye } from "lucide-react";
import { SistrixIcon } from "@/components/icons/SistrixIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RelaunchDashboard } from "./RelaunchDashboard";
import VisibilityIndexWidget from "./VisibilityIndexWidget";
import { ContentGapAnalysis } from "./ContentGapAnalysis";

interface SistrixEnterpriseTabProps {
  pageSlug: string;
  editorLanguage?: string;
}

export const SistrixEnterpriseTab = ({ pageSlug, editorLanguage = 'en' }: SistrixEnterpriseTabProps) => {
  // Fixed domain for now
  const domain = 'image-engineering.de';
  const country = 'de';
  
  // Loading states
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  
  // Data states
  const [credits, setCredits] = useState<number | null>(null);
  
  // Collapsible states with localStorage persistence
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(() => {
    const cached = localStorage.getItem('seo-sistrix-visibility-widget-open');
    return cached !== null ? cached === 'true' : true;
  });
  
  const [isRelaunchOpen, setIsRelaunchOpen] = useState(() => {
    const cached = localStorage.getItem('seo-sistrix-relaunch-open');
    return cached !== null ? cached === 'true' : true;
  });
  
  const [isContentGapOpen, setIsContentGapOpen] = useState(() => {
    const cached = localStorage.getItem('seo-sistrix-contentgap-open');
    return cached !== null ? cached === 'true' : false;
  });
  
  // Persist collapsible states
  useEffect(() => {
    localStorage.setItem('seo-sistrix-visibility-widget-open', String(isVisibilityOpen));
  }, [isVisibilityOpen]);
  
  useEffect(() => {
    localStorage.setItem('seo-sistrix-relaunch-open', String(isRelaunchOpen));
  }, [isRelaunchOpen]);
  
  useEffect(() => {
    localStorage.setItem('seo-sistrix-contentgap-open', String(isContentGapOpen));
  }, [isContentGapOpen]);

  // Check API credits
  const checkCredits = async () => {
    setIsLoadingCredits(true);
    try {
      const { data, error } = await supabase.functions.invoke('sistrix-api', {
        body: { action: 'credits' }
      });
      
      if (error) throw error;
      
      // SISTRIX API returns credits in: data.answer[0].credits[0].value
      const creditsArray = data?.answer?.[0]?.credits;
      const creditsValue = Array.isArray(creditsArray) && creditsArray[0]?.value 
        ? creditsArray[0].value 
        : null;
      const creditsNumber = typeof creditsValue === 'number' ? creditsValue : parseInt(String(creditsValue)) || null;
      setCredits(creditsNumber);
      console.log('[SISTRIX] Credits raw:', data?.answer?.[0]?.credits);
      console.log('[SISTRIX] Credits parsed:', creditsNumber);
      toast.success(`SISTRIX Credits: ${creditsNumber?.toLocaleString() || 'Unknown'}`);
    } catch (e) {
      console.error('[SISTRIX] Credits error:', e);
      toast.error('Failed to check SISTRIX credits');
    } finally {
      setIsLoadingCredits(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credits Check - Top Priority */}
      <div className="p-3 bg-gradient-to-r from-[#00a1ff]/20 to-[#0066cc]/20 border border-[#00a1ff]/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00a1ff] rounded-lg flex items-center justify-center">
              <SistrixIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">SISTRIX API Credits</h3>
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
              <span className="ml-2">Check Credits</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Visibility Index Widget - Collapsible */}
      <Collapsible open={isVisibilityOpen} onOpenChange={setIsVisibilityOpen}>
        <div className="border border-[#00a1ff]/30 rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#00a1ff]/10 hover:bg-[#00a1ff]/20 transition-colors">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#00a1ff]" />
              <span className="font-semibold text-foreground">Sichtbarkeitsindex</span>
              <Badge variant="outline" className="text-xs ml-2">{domain}</Badge>
            </div>
            <ChevronDown className={`h-5 w-5 text-[#00a1ff] transition-transform ${isVisibilityOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4">
              <VisibilityIndexWidget domain={domain} country={country} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      {/* Relaunch Dashboard - Collapsible */}
      <Collapsible open={isRelaunchOpen} onOpenChange={setIsRelaunchOpen}>
        <div className="border border-[#00a1ff]/30 rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#00a1ff]/10 hover:bg-[#00a1ff]/20 transition-colors">
            <div className="flex items-center gap-2">
              <SistrixIcon className="h-5 w-5" />
              <span className="font-semibold text-foreground">Relaunch Dashboard</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-[#00a1ff] transition-transform ${isRelaunchOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4">
              <RelaunchDashboard editorLanguage={editorLanguage} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      {/* Content Gap Analysis - Collapsible */}
      <Collapsible open={isContentGapOpen} onOpenChange={setIsContentGapOpen}>
        <div className="border border-[#00a1ff]/30 rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#00a1ff]/10 hover:bg-[#00a1ff]/20 transition-colors">
            <div className="flex items-center gap-2">
              <SistrixIcon className="h-5 w-5" />
              <span className="font-semibold text-foreground">Content Gap Analysis</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-[#00a1ff] transition-transform ${isContentGapOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-4">
              <ContentGapAnalysis 
                domain={domain} 
                country={country} 
                competitors={[]}
              />
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
