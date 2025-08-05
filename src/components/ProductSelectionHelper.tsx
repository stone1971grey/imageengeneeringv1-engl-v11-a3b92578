import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Monitor, Camera, CheckCircle, Star } from "lucide-react";

const ProductSelectionHelper = () => {
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<string>("");
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  
  const applications = [
    { value: "automotive", label: "Automotive Testing" },
    { value: "mobile", label: "Mobile Camera Testing" },
    { value: "industrial", label: "Industrial Vision" },
    { value: "research", label: "Forschung & Entwicklung" },
    { value: "medical", label: "Medizintechnik" }
  ];

  const budgetRanges = [
    { value: "entry", label: "Einstieg (< 10k €)" },
    { value: "mid", label: "Mittelklasse (10k - 50k €)" },
    { value: "high", label: "Premium (> 50k €)" }
  ];

  const requirements = [
    { id: "ieee", label: "IEEE P2020 Konformität" },
    { id: "hdr", label: "HDR Unterstützung" },
    { id: "flicker", label: "Flimmerfrei" },
    { id: "highintensity", label: "Hohe Intensität" },
    { id: "compact", label: "Kompakte Bauweise" },
    { id: "api", label: "API Integration" }
  ];

  const toggleRequirement = (reqId: string) => {
    setSelectedRequirements(prev => 
      prev.includes(reqId) 
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    );
  };

  const getRecommendations = () => {
    if (!selectedApplication || !selectedBudget) return [];
    
    const recommendations = [];
    
    // Arcturus empfehlen für Automotive und Premium Budget
    if (selectedApplication === "automotive" && selectedBudget === "high") {
      recommendations.push({
        name: "Arcturus LED System",
        score: 95,
        reasons: ["IEEE P2020 konform", "Maximale Intensität", "Automotive-optimiert"],
        price: "Premium",
        link: "/product/arcturus"
      });
    }
    
    // Vega für mittlere Anforderungen
    if (selectedBudget === "mid") {
      recommendations.push({
        name: "Vega Light Source",
        score: 85,
        reasons: ["Vielseitig einsetzbar", "Gutes Preis-Leistungs-Verhältnis", "Bewährt"],
        price: "Mittelklasse",
        link: "#"
      });
    }

    // Standard LED für Einstieg
    if (selectedBudget === "entry") {
      recommendations.push({
        name: "Standard LED Series",
        score: 70,
        reasons: ["Kosteneffizient", "Einfache Bedienung", "Grundfunktionen"],
        price: "Einstieg",
        link: "#"
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Star className="w-6 h-6 text-blue-600" />
            Produktauswahlhilfe
          </CardTitle>
          <p className="text-gray-600">
            Finden Sie die optimale Lösung für Ihre Anforderungen
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Application Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Anwendungsbereich</label>
            <Select value={selectedApplication} onValueChange={setSelectedApplication}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wählen Sie Ihren Anwendungsbereich" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.value} value={app.value}>
                    {app.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Budget</label>
            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wählen Sie Ihr Budget" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((budget) => (
                  <SelectItem key={budget.value} value={budget.value}>
                    {budget.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Zusätzliche Anforderungen</label>
            <div className="flex flex-wrap gap-2">
              {requirements.map((req) => (
                <Badge
                  key={req.id}
                  variant={selectedRequirements.includes(req.id) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedRequirements.includes(req.id)
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => toggleRequirement(req.id)}
                >
                  {req.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Empfohlene Produkte:</h4>
              <div className="space-y-3">
                {recommendations.map((product, index) => (
                  <Card key={index} className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">{product.name}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {product.score}% Match
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-600">{product.price}</span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Warum diese Empfehlung:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.reasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.location.href = product.link}
                      >
                        Mehr erfahren
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedApplication && selectedBudget && recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Keine spezifischen Empfehlungen verfügbar.</p>
              <p className="text-sm">Kontaktieren Sie uns für eine individuelle Beratung.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSelectionHelper;