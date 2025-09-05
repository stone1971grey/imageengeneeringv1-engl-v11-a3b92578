import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Cog, ArrowRight, CheckCircle, Search, FileCheck, Camera, GraduationCap } from "lucide-react";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";

const ManufacturerSupplierShowcase = () => {
  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            camPAS Testing Workflow
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Specialized testing solutions for the automotive supply chain
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Manufacturer Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col items-center text-center min-h-[320px]">
            {/* Icon Background */}
            <div className="w-[70px] h-[70px] rounded-full bg-automotive-icon-bg flex items-center justify-center mb-6">
              <Building className="w-8 h-8 text-black" />
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight flex-1">
              Manufacturer
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
              OEMs benefit from objective testing through neutral third parties for informed sensor selection and customized camPAS tests.
            </p>
            
            {/* CTA Button */}
            <Button 
              className="w-full text-white hover:opacity-90"
              style={{ backgroundColor: 'hsl(77, 56%, 37%)' }}
            >
              Learn More
            </Button>
          </div>

          {/* Supplier Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col items-center text-center min-h-[320px]">
            {/* Icon Background */}
            <div className="w-[70px] h-[70px] rounded-full bg-automotive-icon-bg flex items-center justify-center mb-6">
              <Cog className="w-8 h-8 text-black" />
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight flex-1">
              Tier 1/2 Supplier
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
              Tier-1/2 suppliers validate components before delivery and optimize image quality proactively through neutral third-party consulting.
            </p>
            
            {/* CTA Button */}
            <Button 
              className="w-full text-white hover:opacity-90"
              style={{ backgroundColor: 'hsl(77, 56%, 37%)' }}
            >
              Learn More
            </Button>
          </div>

          {/* Training Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col items-center text-center min-h-[320px]">
            {/* Icon Background */}
            <div className="w-[70px] h-[70px] rounded-full bg-training-bg flex items-center justify-center mb-6">
              <GraduationCap className="w-8 h-8 text-black" />
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight flex-1">
              Professional Training
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
              Comprehensive training programs and professional consultation services for automotive camera testing expertise and best practices.
            </p>
            
            {/* CTA Button */}
            <Button 
              className="w-full text-white hover:opacity-90"
              style={{ backgroundColor: 'hsl(45, 85%, 35%)' }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManufacturerSupplierShowcase;