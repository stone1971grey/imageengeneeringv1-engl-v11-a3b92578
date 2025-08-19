import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Settings, Trash2, ExternalLink, Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Styleguide = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-6">
        <div className="pt-60 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Style Guide</h1>
          <p className="text-xl text-gray-600 mb-12">All button variants and sizes used in the application</p>
          
          {/* Button Variants */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Button Variants</h2>
            
            <div className="grid gap-8">
              {/* Default Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Default</p>
                  <p className="text-sm text-gray-500">Primary action</p>
                </div>
                <Button variant="default">
                  Primary Button
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Decision Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Decision</p>
                  <p className="text-sm text-gray-500">Main CTA buttons</p>
                </div>
                <Button variant="decision">
                  Discover Charts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Contact Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Contact</p>
                  <p className="text-sm text-gray-500">Contact actions</p>
                </div>
                <Button variant="contact">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              {/* Technical Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Technical</p>
                  <p className="text-sm text-gray-500">Technical actions</p>
                </div>
                <Button variant="technical">
                  Download Specs
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Secondary Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Secondary</p>
                  <p className="text-sm text-gray-500">Secondary technical actions</p>
                </div>
                <Button variant="secondary">
                  Secondary Button
                </Button>
              </div>
              
              {/* Outline Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Outline</p>
                  <p className="text-sm text-gray-500">Alternative actions</p>
                </div>
                <Button variant="outline">
                  Outline Button
                </Button>
              </div>
              
              {/* Ghost Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Ghost</p>
                  <p className="text-sm text-gray-500">Subtle actions</p>
                </div>
                <Button variant="ghost">
                  Ghost Button
                </Button>
              </div>
              
              {/* Link Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Link</p>
                  <p className="text-sm text-gray-500">Text links</p>
                </div>
                <Button variant="link">
                  Link Button
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {/* Destructive Variant */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Destructive</p>
                  <p className="text-sm text-gray-500">Delete actions</p>
                </div>
                <Button variant="destructive">
                  Delete Item
                  <Trash2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
          
          {/* Button Sizes */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Button Sizes</h2>
            
            <div className="grid gap-8">
              {/* Small Size */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Small</p>
                  <p className="text-sm text-gray-500">Compact buttons</p>
                </div>
                <Button size="sm" variant="decision">Small Button</Button>
              </div>
              
              {/* Default Size */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Default</p>
                  <p className="text-sm text-gray-500">Standard size</p>
                </div>
                <Button size="default" variant="decision">Default Button</Button>
              </div>
              
              {/* Large Size */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Large</p>
                  <p className="text-sm text-gray-500">Hero buttons</p>
                </div>
                <Button size="lg" variant="decision">Large Button</Button>
              </div>
              
              {/* Icon Size */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Icon</p>
                  <p className="text-sm text-gray-500">Icon only</p>
                </div>
                <Button size="icon" variant="decision">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
          
          {/* Button States */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Button States</h2>
            
            <div className="grid gap-8">
              {/* Normal State */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Normal</p>
                  <p className="text-sm text-gray-500">Default state</p>
                </div>
                <Button variant="decision">Normal State</Button>
              </div>
              
              {/* Disabled State */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Disabled</p>
                  <p className="text-sm text-gray-500">Inactive state</p>
                </div>
                <Button variant="decision" disabled>Disabled State</Button>
              </div>
            </div>
          </section>
          
          {/* Usage Examples */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Common Usage Examples</h2>
            
            <div className="grid gap-8">
              {/* Hero Section Buttons */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Hero Section</p>
                  <p className="text-sm text-gray-500">Main landing actions</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="decision" size="lg">
                    Discover Charts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Watch Demo
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Form Actions</p>
                  <p className="text-sm text-gray-500">Submit & cancel</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="contact">Submit Request</Button>
                  <Button variant="ghost">Cancel</Button>
                </div>
              </div>
              
              {/* Navigation Actions */}
              <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                <div className="w-32">
                  <p className="font-medium text-gray-900">Navigation</p>
                  <p className="text-sm text-gray-500">Page links</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="link">Learn More</Button>
                  <Button variant="ghost">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Styleguide;