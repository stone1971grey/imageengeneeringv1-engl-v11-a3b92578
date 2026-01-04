import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Eye, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SistrixIcon } from '@/components/icons/SistrixIcon';

interface VisibilityData {
  recorded_at: string;
  visibility_index: string | number;
}

interface VisibilityIndexWidgetProps {
  domain?: string;
  country?: string;
}

const VisibilityIndexWidget: React.FC<VisibilityIndexWidgetProps> = ({
  domain = 'image-engineering.de',
  country = 'de'
}) => {
  const [history, setHistory] = useState<VisibilityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30');
  const [trend, setTrend] = useState<number>(0);
  const [trendPercent, setTrendPercent] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<number | null>(null);

  // Load history on mount and when timeRange changes
  useEffect(() => {
    loadHistory();
  }, [domain, country, timeRange]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('sistrix-visibility', {
        body: { 
          action: 'history', 
          domain, 
          country, 
          days: parseInt(timeRange) 
        }
      });
      
      if (invokeError) throw invokeError;
      
      if (data.success) {
        setHistory(data.history || []);
        setTrend(data.trend || 0);
        setTrendPercent(data.trendPercent || 0);
        
        // Set current value from last entry
        if (data.history && data.history.length > 0) {
          const lastEntry = data.history[data.history.length - 1];
          setCurrentValue(parseFloat(lastEntry.visibility_index));
        }
      } else {
        throw new Error(data.error || 'Failed to load history');
      }
    } catch (err: any) {
      console.error('[SI Widget] Load error:', err);
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentVisibility = async () => {
    setIsFetching(true);
    
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('sistrix-visibility', {
        body: { action: 'fetch', domain, country }
      });
      
      if (invokeError) throw invokeError;
      
      if (data.success) {
        toast.success(`SI aktualisiert: ${data.visibilityIndex.toFixed(4)}`);
        setCurrentValue(data.visibilityIndex);
        // Reload history to include new data point
        await loadHistory();
      } else {
        throw new Error(data.error || 'Failed to fetch');
      }
    } catch (err: any) {
      console.error('[SI Widget] Fetch error:', err);
      toast.error('Fehler beim Abrufen: ' + (err.message || 'Unbekannter Fehler'));
    } finally {
      setIsFetching(false);
    }
  };

  // Format data for chart
  const chartData = history.map(item => ({
    date: item.recorded_at,
    value: parseFloat(String(item.visibility_index)),
    displayDate: new Date(item.recorded_at).toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }));

  // Calculate min/max for Y axis with padding
  const values = chartData.map(d => d.value);
  const minValue = values.length > 0 ? Math.max(0, Math.min(...values) * 0.9) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) * 1.1 : 1;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-zinc-400';

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00a1ff]/10">
              <SistrixIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                Sichtbarkeitsindex
                <Badge variant="outline" className="text-xs font-normal">
                  {domain}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                SISTRIX Visibility Index · {country.toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24 h-8 text-xs bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Tage</SelectItem>
                <SelectItem value="30">30 Tage</SelectItem>
                <SelectItem value="90">90 Tage</SelectItem>
                <SelectItem value="365">1 Jahr</SelectItem>
              </SelectContent>
            </Select>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                  onClick={fetchCurrentVisibility}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aktuellen SI von SISTRIX abrufen (1 Credit)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center gap-2 py-8 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Lade Daten...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">Noch keine Daten vorhanden</p>
            <Button
              size="sm"
              onClick={fetchCurrentVisibility}
              disabled={isFetching}
              className="bg-[#00a1ff] hover:bg-[#00a1ff]/90 text-white"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Lädt...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Jetzt abrufen
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Current Value & Trend */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-zinc-800/50">
              <div>
                <div className="text-3xl font-bold text-[#00a1ff]">
                  {currentValue?.toFixed(4) || '–'}
                </div>
                <div className="text-xs text-muted-foreground">Aktueller Wert</div>
              </div>
              
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="h-5 w-5" />
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {trendPercent >= 0 ? '+' : ''}{trendPercent.toFixed(1)}%
                  </div>
                  <div className="text-xs opacity-70">
                    {trend >= 0 ? '+' : ''}{trend.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorSI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a1ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00a1ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={{ stroke: '#374151' }}
                    tickLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    domain={[minValue, maxValue]}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={{ stroke: '#374151' }}
                    tickLine={{ stroke: '#374151' }}
                    tickFormatter={(value) => value.toFixed(2)}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#9ca3af', fontSize: 11 }}
                    formatter={(value: number) => [value.toFixed(4), 'SI']}
                    labelFormatter={(label) => `Datum: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00a1ff"
                    strokeWidth={2}
                    fill="url(#colorSI)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#00a1ff', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Info Footer */}
            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-muted-foreground">
              <span>{history.length} Datenpunkte</span>
              <span>
                Letztes Update: {history.length > 0 
                  ? new Date(history[history.length - 1].recorded_at).toLocaleDateString('de-DE')
                  : '–'
                }
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VisibilityIndexWidget;