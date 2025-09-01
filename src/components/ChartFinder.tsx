import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Camera, TestTube, Monitor } from "lucide-react";

const ChartFinder = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [selectedKPI, setSelectedKPI] = useState<string>("all");

  const industries = [
    { value: "all", label: "Alle Branchen" },
    { value: "automotive", label: "Automotive" },
    { value: "medical", label: "Medizin" },
    { value: "consumer", label: "Konsumerelektronik" },
    { value: "industrial", label: "Industrie" },
    { value: "aerospace", label: "Luft- und Raumfahrt" }
  ];

  const standards = [
    { value: "all", label: "Alle Standards" },
    { value: "ieee-p2020", label: "IEEE-P2020" },
    { value: "iso-12233", label: "ISO 12233" },
    { value: "iso-15739", label: "ISO 15739" },
    { value: "iec-62676", label: "IEC 62676" },
    { value: "smpte-2036", label: "SMPTE-2036" }
  ];

  const kpis = [
    { value: "all", label: "Alle KPIs" },
    { value: "cta", label: "CTA (Farbtextur-Genauigkeit)" },
    { value: "snr", label: "SNR (Signal-Rausch-Verhältnis)" },
    { value: "resolution", label: "Auflösung" },
    { value: "low-light", label: "Schwachlicht-Leistung" },
    { value: "dynamic-range", label: "Dynamikbereich" },
    { value: "color-accuracy", label: "Farbgenauigkeit" }
  ];

  const charts = [
    {
      id: 1,
      title: "TE42-LL",
      description: "Low-light test chart for automotive camera validation under challenging conditions",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      industry: "automotive",
      standard: "iso-12233",
      kpi: "low-light"
    },
    {
      id: 2,
      title: "CTA-2036",
      description: "Color texture accuracy measurement chart for high-precision imaging systems",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      industry: "consumer",
      standard: "ieee-p2020",
      kpi: "cta"
    },
    {
      id: 3,
      title: "SNR-Pro",
      description: "Signal-to-noise ratio analysis chart for industrial camera calibration",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop",
      industry: "industrial",
      standard: "iso-15739",
      kpi: "snr"
    },
    {
      id: 4,
      title: "MED-RES",
      description: "Medical imaging resolution test chart for diagnostic equipment certification",
      image: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=400&h=300&fit=crop",
      industry: "medical",
      standard: "iec-62676",
      kpi: "resolution"
    },
    {
      id: 5,
      title: "DR-Elite",
      description: "Dynamic range measurement chart for aerospace vision systems",
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=400&h=300&fit=crop",
      industry: "aerospace",
      standard: "smpte-2036",
      kpi: "dynamic-range"
    },
    {
      id: 6,
      title: "COLOR-X1",
      description: "Professional color accuracy validation chart for broadcast applications",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=400&h=300&fit=crop",
      industry: "consumer",
      standard: "ieee-p2020",
      kpi: "color-accuracy"
    }
  ];

  const filteredCharts = charts.filter(chart => {
    const industryMatch = selectedIndustry === "all" || chart.industry === selectedIndustry;
    const standardMatch = selectedStandard === "all" || chart.standard === selectedStandard;
    const kpiMatch = selectedKPI === "all" || chart.kpi === selectedKPI;
    
    return industryMatch && standardMatch && kpiMatch;
  });

  return (
    <section className="py-24 bg-white font-roboto">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Chart
            <span className="font-medium text-blue-600"> Finder</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Finden Sie das perfekte Testchart für Ihre spezifische Anwendung. 
            Filtern Sie nach Branche, Standard und Leistungskennzahlen.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Industry Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Branche</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900 h-12">
                  <SelectValue placeholder="Branche auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {industries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value} className="text-gray-900">
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Standard Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Standard</label>
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900 h-12">
                  <SelectValue placeholder="Select Standard" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {standards.map((standard) => (
                    <SelectItem key={standard.value} value={standard.value} className="text-gray-900">
                      {standard.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* KPI Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">KPI</label>
              <Select value={selectedKPI} onValueChange={setSelectedKPI}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900 h-12">
                  <SelectValue placeholder="Select KPI" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 z-50">
                  {kpis.map((kpi) => (
                    <SelectItem key={kpi.value} value={kpi.value} className="text-gray-900">
                      {kpi.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-lg text-gray-600">
              {filteredCharts.length} {filteredCharts.length === 1 ? 'Chart' : 'Charts'} gefunden
            </span>
          </div>
        </div>

        {/* Results Grid */}
        {filteredCharts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharts.map((chart) => (
              <Card 
                key={chart.id}
                className="bg-white border-gray-100 hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                      src={chart.image}
                      alt={chart.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {chart.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {chart.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                        {industries.find(i => i.value === chart.industry)?.label}
                      </span>
                      <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md font-medium">
                        {standards.find(s => s.value === chart.standard)?.label}
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                    >
                      Produkt ansehen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TestTube className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Charts gefunden</h3>
            <p className="text-gray-600">Versuchen Sie, Ihre Filter anzupassen, um mehr Ergebnisse zu sehen.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChartFinder;