import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Settings, Trash2, ExternalLink, Play, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Styleguide = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Main content wrapper with top margin to clear fixed navigation */}
      <div className="pt-[140px]">
        {/* Quick Navigation */}
        <nav className="sticky top-[195px] z-30 bg-[#F7F9FB] py-4 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap gap-6 justify-center text-lg">
                <a href="#buttons" className="text-gray-700 hover:text-[#7a933b] transition-colors duration-200 font-medium">
                  Buttons
                </a>
                <a href="#colors" className="text-gray-700 hover:text-[#7a933b] transition-colors duration-200 font-medium">
                  Colors
                </a>
              </div>
            </div>
          </div>
        </nav>
      
        <div className="container mx-auto px-6">
          <div className="py-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Style Guide</h1>
              <p className="text-xl text-gray-600 mb-8">Design system components and color palette</p>
              
              {/* Quick Navigation */}
              <div className="flex gap-4 mb-12">
                <Link to="/icons-styleguide">
                  <Button variant="outline" className="group">
                    <Palette className="w-4 h-4 mr-2" />
                    View Icons Styleguide
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            
              {/* Buttons Section */}
              <section id="buttons" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">Buttons</h2>
                
                {/* Button Variants */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Button Variants</h3>
                  
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
                      <Button variant="secondary" className="group">
                        Secondary Button
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                </div>
                
                {/* Button Sizes */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Button Sizes</h3>
                  
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
                </div>
                
                {/* Button States */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Button States</h3>
                  
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
                </div>
                
                {/* Usage Examples */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Common Usage Examples</h3>
                  
                  <div className="grid gap-8">
                    {/* Hero Section Buttons */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Hero Section</p>
                        <p className="text-sm text-gray-500">Main landing actions</p>
                      </div>
                      <div className="flex gap-4">
                        <Button variant="decision" size="lg" className="group">
                          Discover Charts
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button variant="technical" size="lg" className="group">
                          Watch Demo
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                </div>
              </section>

              {/* Colors Section */}
              <section id="colors" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">Colors</h2>
                <p className="text-lg text-gray-600 mb-8">Color palette used throughout the design system</p>
                
                {/* Color Swatches */}
                <div className="grid gap-8">
                  {/* Magenta Color */}
                  <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                    <div className="w-32">
                      <p className="font-medium text-gray-900">Magenta</p>
                      <p className="text-sm text-gray-500">Accent color</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                        style={{ backgroundColor: '#b4497d' }}
                      ></div>
                      <div>
                        <p className="font-mono text-sm text-gray-900">#b4497d</p>
                        <p className="text-xs text-gray-500">Strong magenta/pink tone</p>
                      </div>
                    </div>
                  </div>

                  {/* Olive Green Color */}
                  <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                    <div className="w-32">
                      <p className="font-medium text-gray-900">Olive Green</p>
                      <p className="text-sm text-gray-500">Natural color</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                        style={{ backgroundColor: '#91a956' }}
                      ></div>
                      <div>
                        <p className="font-mono text-sm text-gray-900">#91a956</p>
                        <p className="text-xs text-gray-500">Muted olive/green tone</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Styleguide;