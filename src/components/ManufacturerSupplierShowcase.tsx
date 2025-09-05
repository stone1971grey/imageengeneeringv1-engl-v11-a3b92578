import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Cog, ArrowRight, CheckCircle, Search, FileCheck, Camera } from "lucide-react";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";

const ManufacturerSupplierShowcase = () => {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            camPAS Testing Workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized testing solutions for the automotive supply chain
          </p>
        </div>

        {/* Simple Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Manufacturer Section */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Manufacturer</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              OEMs benefit from objective testing through neutral third parties for informed sensor selection and customized camPAS tests.
            </p>
            <Button 
              variant="decision"
              size="lg"
              className="w-full group"
            >
              Learn More About Manufacturer Solutions
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Supplier Section */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Tier 1/2 Supplier</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Tier-1/2 suppliers validate components before delivery and optimize image quality proactively through neutral third-party consulting.
            </p>
            <Button 
              variant="decision"
              size="lg"
              className="w-full group"
            >
              Learn More About Supplier Solutions
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerSupplierShowcase;