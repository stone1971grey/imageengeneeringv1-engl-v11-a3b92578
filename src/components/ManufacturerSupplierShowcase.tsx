import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Cog, ArrowRight, CheckCircle, Search, FileCheck, Camera } from "lucide-react";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";

const ManufacturerSupplierShowcase = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            camPAS Testing Workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Spezialisierte Testlösungen für die automotive Supply Chain
          </p>
        </div>

        {/* Main Workflow Layout */}
        <div className="relative">
          {/* Central Workflow Area */}
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 z-10">
            {/* Connection Arrows */}
            <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-12">
              <ArrowRight className="w-8 h-8 text-blue-500" />
            </div>
            <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 translate-x-12">
              <ArrowRight className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-16 relative z-0">
            
            {/* Hersteller (OEM) Section */}
            <Card className="bg-gray-50 border-2 border-gray-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">OEM</Badge>
                    <h3 className="text-2xl font-bold text-gray-900">Hersteller</h3>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  OEMs profitieren von objektiven Tests durch neutrale Drittpartei für fundierte Sensorauswahl und maßgeschneiderte camPAS-Tests.
                </p>

                {/* Vorteile */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Vorteile
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Objektive Sensorauswahl aus breiter Palette</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Maßgeschneiderte camPAS-Tests</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Fundierte Entscheidungsgrundlagen</span>
                    </div>
                  </div>
                </div>

                {/* Prozess */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Prozess
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Spezifikationsanalyse</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Test-Design</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Objektive Bewertung</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Entscheidungsunterstützung</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-semibold group">
                  Mehr über Hersteller-Lösungen
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>

            {/* Zulieferer (Tier 1/2) Section */}
            <Card className="bg-gray-50 border-2 border-gray-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                    <Cog className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">Tier 1/2</Badge>
                    <h3 className="text-2xl font-bold text-gray-900">Zulieferer</h3>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Tier-1/2 Zulieferer validieren Komponenten vor Lieferung und optimieren Bildqualität proaktiv durch neutrale Drittpartei-Beratung.
                </p>

                {/* Vorteile */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Vorteile
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Validierung vor Lieferung</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Frühe Fehlererkennung</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Bildqualitätsverbesserungen</span>
                    </div>
                  </div>
                </div>

                {/* Prozess */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Prozess
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Pre-Delivery Validation</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Bug-Detection</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Quality Enhancement</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Supplier Confidence</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-semibold group">
                  Mehr über Zulieferer-Lösungen
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Sensor Validation - Third-Party, Neutral camPAS Testing
              </h4>
              <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto">
                Unsere neutralen Tests helfen beiden Seiten der Supply Chain dabei, fundierte Entscheidungen zu treffen 
                und die Bildqualität automotive Kamerasysteme zu optimieren.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerSupplierShowcase;