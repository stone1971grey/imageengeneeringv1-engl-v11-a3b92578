import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
            Specialized testing solutions for the automotive supply chain
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
                    <h3 className="text-2xl font-bold text-gray-900">Manufacturer</h3>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  OEMs benefit from objective testing through neutral third parties for informed sensor selection and customized camPAS tests.
                </p>

                {/* Benefits */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Benefits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Objective sensor selection from wide range</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Customized camPAS tests</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Well-founded decision basis</span>
                    </div>
                  </div>
                </div>

                {/* Process */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Process
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Specification Analysis</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Test Design</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Objective Evaluation</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <span className="text-sm text-gray-600">Decision Support</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  variant="decision"
                  size="lg"
                  className="w-full group"
                >
                  Learn More About Manufacturer Solutions
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
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
                    <h3 className="text-2xl font-bold text-gray-900">Supplier</h3>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Tier-1/2 suppliers validate components before delivery and optimize image quality proactively through neutral third-party consulting.
                </p>

                {/* Benefits */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Benefits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Pre-delivery validation</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Early error detection</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Image quality improvements</span>
                    </div>
                  </div>
                </div>

                {/* Process */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Process
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
                <Button 
                  variant="decision"
                  size="lg"
                  className="w-full group"
                >
                  Learn More About Supplier Solutions
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
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
                Our neutral tests help both sides of the supply chain make informed decisions 
                and optimize the image quality of automotive camera systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerSupplierShowcase;