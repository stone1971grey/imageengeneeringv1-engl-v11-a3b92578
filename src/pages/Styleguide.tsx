import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Settings, Trash2, ExternalLink, Play, Palette, Car, TestTube, Monitor, Lightbulb, Building, Cog, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ManufacturerSupplierShowcase from "@/components/ManufacturerSupplierShowcase";

const Styleguide = () => {
  const applications = [
    {
      title: "Camera Testing for ADAS Systems",
      description: "Comprehensive validation of driver assistance cameras for safety compliance",
      icon: Car,
      iconType: "camera"
    },
    {
      title: "High-End Sensor Testing", 
      description: "Precision LED lighting for testing demanding sensor systems and components",
      icon: TestTube,
      iconType: "testing"
    },
    {
      title: "Software",
      description: "Advanced software solutions for image analysis, calibration and automated quality control",
      icon: Monitor,
      iconType: "performance"
    },
    {
      title: "Illumination Devices",
      description: "Professional LED lighting systems and uniform light sources for stable low-light testing environments",
      icon: Lightbulb,
      iconType: "camera"
    }
  ];
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
                 <a href="#buttons" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors">
                   Buttons
                 </a>
                 <a href="#tiles" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors">
                   Tiles
                 </a>
                 <a href="#colors" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors">
                   Colors
                 </a>
                 <a href="#background-colors" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors">
                   Background Colors
                 </a>
                 <a href="#typography" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors">
                   Typography
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
                         <p className="text-xs text-gray-400 font-mono">#22C3F7</p>
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
                         <p className="text-xs text-gray-400 font-mono">#74952a</p>
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
                         <p className="text-xs text-gray-400 font-mono">#3D7BA2</p>
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
                         <p className="text-xs text-gray-400 font-mono">#1f2937</p>
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
              
              {/* Tiles Section */}
              <section id="tiles" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">Tiles</h2>
                
                {/* 4-Tile Layout - Main Applications */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">4-Tile Layout (Main Applications)</h3>
                  <div className="bg-gray-50 p-8 rounded-lg">
                    <div className="container mx-auto">
                      <div className="text-center mb-16">
                        <h4 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          Main Applications
                        </h4>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                          Essential testing solutions for automotive camera systems
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {applications.map((app, index) => {
                          const IconComponent = app.icon;
                          const getIconColors = (iconType: string) => {
                            return { bg: 'bg-automotive-icon-bg', fg: 'text-automotive-icon-bg' };
                          };
                          const colors = getIconColors(app.iconType);
                          
                          return (
                            <div 
                              key={index}
                              className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col items-center text-center min-h-[320px]"
                            >
                              {/* Large Icon at top - 70x70px round */}
                              <div className={`w-[70px] h-[70px] rounded-full ${colors.bg} flex items-center justify-center mb-6`}>
                                <IconComponent className="w-8 h-8 text-black" />
                              </div>
                              
                              {/* Title */}
                              <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight flex-1">
                                {app.title}
                              </h3>
                              
                              {/* Description */}
                              <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                                {app.description}
                              </p>
                              
                              {/* CTA Button */}
                              <Button 
                                className="w-full text-white hover:opacity-90"
                                style={{ backgroundColor: 'hsl(77, 56%, 37%)' }}
                              >
                                Learn More
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Tile Layout - camPAS Testing Workflow */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">3-Tile Layout (camPAS Testing Workflow)</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <ManufacturerSupplierShowcase />
                  </div>
                </div>
              </section>

              {/* Colors Section */}
              <section id="colors" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">🎨 Company Colors</h2>
                <p className="text-lg text-gray-600 mb-8">Complete color palette from CSS variables for Image Engineering</p>
                
                {/* Company Colors */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Main Colors</h3>
                  
                  <div className="grid gap-6">
                    {/* iQ Lab - Türkisgrün */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">iQ Lab</p>
                        <p className="text-sm text-gray-500">Turquoise Green</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#049486' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#049486</p>
                          <p className="text-xs text-gray-500">Primary color for iQ Lab products</p>
                        </div>
                      </div>
                    </div>

                    {/* iQ Charts - Magenta */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">iQ Charts</p>
                        <p className="text-sm text-gray-500">Magenta</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#b4497d' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#b4497d</p>
                          <p className="text-xs text-gray-500">Primary color for iQ Charts products</p>
                        </div>
                      </div>
                    </div>

                    {/* iQ Equipment - Olivgrün */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">iQ Equipment</p>
                        <p className="text-sm text-gray-500">Olive Green</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#74952a' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#74952a</p>
                          <p className="text-xs text-gray-500">Primary color for iQ Equipment products</p>
                        </div>
                      </div>
                    </div>

                    {/* Software - Blau */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Software</p>
                        <p className="text-sm text-gray-500">Blue</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#577eb4' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#577eb4</p>
                          <p className="text-xs text-gray-500">Primary color for Software products</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Bundles - Grau */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Product Bundles</p>
                        <p className="text-sm text-gray-500">Gray</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#a3a3a3' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#a3a3a3</p>
                          <p className="text-xs text-gray-500">Primary color for Product Bundle category</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Background Colors */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Navigation Background Colors</h3>
                  
                  <div className="grid gap-6">
                    {/* Header & Footer */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Header & Footer</p>
                        <p className="text-sm text-gray-500">Navigation Background</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#3D7BA2' }}
                         ></div>
                         <div>
                           <p className="font-mono text-sm text-gray-900">#3D7BA2</p>
                           <p className="text-xs text-gray-500">Background color for header navigation and footer sections</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base Colors */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Base Colors</h3>
                  
                  <div className="grid gap-6">
                    {/* Weiß */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">White</p>
                        <p className="text-sm text-gray-500">Background</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border-2 border-gray-400 shadow-sm" 
                          style={{ backgroundColor: '#ffffff' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#ffffff</p>
                          <p className="text-xs text-gray-500">Primary background and text on dark surfaces</p>
                        </div>
                      </div>
                    </div>

                    {/* Dark Grey */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Dark Grey</p>
                        <p className="text-sm text-gray-500">Headlines</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#222222' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#222222</p>
                          <p className="text-xs text-gray-500">For H2/H3 headlines</p>
                        </div>
                      </div>
                    </div>

                    {/* Medium Grey */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Medium Grey</p>
                        <p className="text-sm text-gray-500">Body Text</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#555555' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#555555</p>
                          <p className="text-xs text-gray-500">Main font color for body text</p>
                        </div>
                      </div>
                    </div>

                    {/* Light Grey */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Light Grey</p>
                        <p className="text-sm text-gray-500">Footer Text</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#999999' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#999999</p>
                          <p className="text-xs text-gray-500">For footer text and secondary information</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
               </section>

              {/* Background Colors Section */}
              <section id="background-colors" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">🎨 Background Colors</h2>
                <p className="text-lg text-gray-600 mb-8">Background colors for navigation elements and layout sections</p>
                
                {/* Navigation Background Colors */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Navigation Elements</h3>
                  
                  <div className="grid gap-6">
                    {/* Header & Footer */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Header & Footer</p>
                        <p className="text-sm text-gray-500">Navigation Background</p>
                      </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#4B4A4A' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#4B4A4A</p>
                            <p className="text-xs text-gray-500">Background color for header navigation and footer sections</p>
                          </div>
                       </div>
                     </div>

                     {/* News Section Background */}
                     <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                       <div className="w-32">
                         <p className="font-medium text-gray-900">News Section</p>
                         <p className="text-sm text-gray-500">News Background</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#373737' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#373737</p>
                            <p className="text-xs text-gray-500">Background color for news section</p>
                          </div>
                       </div>
                     </div>

                     {/* Engineers/Testimonial Section Background */}
                     <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                       <div className="w-32">
                         <p className="font-medium text-gray-900">Engineers Section</p>
                         <p className="text-sm text-gray-500">Testimonial Background</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#242424' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#242424</p>
                            <p className="text-xs text-gray-500">Background color for "Speak with Our Engineers" section</p>
                          </div>
                       </div>
                     </div>

                     {/* Standards & Expertise Section Background */}
                     <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                       <div className="w-32">
                         <p className="font-medium text-gray-900">Standards Section</p>
                         <p className="text-sm text-gray-500">Standards & Expertise</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#E5E5E5' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#E5E5E5</p>
                            <p className="text-xs text-gray-500">Background color for "Standards & Expertise" section</p>
                          </div>
                       </div>
                     </div>

                     {/* Product Matrix Light Background */}
                     <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                       <div className="w-32">
                         <p className="font-medium text-gray-900">Product Matrix</p>
                         <p className="text-sm text-gray-500">Light Background</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#F7F9FB' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#F7F9FB</p>
                            <p className="text-xs text-gray-500">Background color for product matrix and light sections</p>
                          </div>
                       </div>
                     </div>

                     {/* Navigation Dropdown Background */}
                     <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                       <div className="w-32">
                         <p className="font-medium text-gray-900">Navigation Dropdown</p>
                         <p className="text-sm text-gray-500">Menu Background</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#f3f3f3' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#f3f3f3</p>
                            <p className="text-xs text-gray-500">Background color for navigation dropdown menus</p>
                          </div>
                       </div>
                     </div>

                     {/* ChartFinder & General Light Gray */}
                     <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                       <div className="w-32">
                         <p className="font-medium text-gray-900">Light Gray Sections</p>
                         <p className="text-sm text-gray-500">bg-gray-50</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#f9fafb' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#f9fafb</p>
                            <p className="text-xs text-gray-500">Tailwind bg-gray-50 for ChartFinder, ProductFAQ, etc.</p>
                          </div>
                       </div>
                     </div>

                     {/* Benefits/Features Background */}
                     <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                       <div className="w-32">
                         <p className="font-medium text-gray-900">Benefits Sections</p>
                         <p className="text-sm text-gray-500">bg-gray-100</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div 
                           className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                           style={{ backgroundColor: '#f3f4f6' }}
                          ></div>
                          <div>
                            <p className="font-mono text-sm text-gray-900">#f3f4f6</p>
                            <p className="text-xs text-gray-500">Tailwind bg-gray-100 for benefits and feature sections</p>
                          </div>
                       </div>
                     </div>
                  </div>
                </div>
              </section>

              {/* Typography Section */}
              <section id="typography" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">🎨 Typography Hierarchy</h2>
                <p className="text-lg text-gray-600 mb-8">Font hierarchy and typography settings for Image Engineering</p>
                
                {/* Typography Hierarchy Table */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Typography Hierarchy</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Area / Element</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Font-Family</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Weight</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Size</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Color</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                         <tr>
                           <td className="border border-gray-300 px-4 py-3">H1 Headlines (dark BG)</td>
                           <td className="border border-gray-300 px-4 py-3">Roboto Light</td>
                           <td className="border border-gray-300 px-4 py-3">300</td>
                           <td className="border border-gray-300 px-4 py-3">60px / 72px / 96px</td>
                           <td className="border border-gray-300 px-4 py-3">#ffffff</td>
                           <td className="border border-gray-300 px-4 py-3 bg-gray-800">
                             <span style={{ fontSize: '24px', fontWeight: 300, color: '#ffffff' }}>Test Charts</span>
                           </td>
                         </tr>
                         <tr>
                           <td className="border border-gray-300 px-4 py-3">H1 Headlines (light BG)</td>
                           <td className="border border-gray-300 px-4 py-3">Roboto Light</td>
                           <td className="border border-gray-300 px-4 py-3">300</td>
                           <td className="border border-gray-300 px-4 py-3">60px / 72px / 96px</td>
                           <td className="border border-gray-300 px-4 py-3">#222222</td>
                           <td className="border border-gray-300 px-4 py-3">
                             <span style={{ fontSize: '24px', fontWeight: 300, color: '#222222' }}>Test Charts</span>
                           </td>
                         </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">H2 Headlines</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Bold</td>
                          <td className="border border-gray-300 px-4 py-3">700</td>
                          <td className="border border-gray-300 px-4 py-3">~32px</td>
                          <td className="border border-gray-300 px-4 py-3">#222222</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '22px', fontWeight: 700, color: '#222222' }}>Main Headline</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">H3 Subheadings</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Regular</td>
                          <td className="border border-gray-300 px-4 py-3">400</td>
                          <td className="border border-gray-300 px-4 py-3">~24px</td>
                          <td className="border border-gray-300 px-4 py-3">#222222</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '18px', fontWeight: 400, color: '#222222' }}>Subheading</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Body Text / Paragraphs</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Regular</td>
                          <td className="border border-gray-300 px-4 py-3">400</td>
                          <td className="border border-gray-300 px-4 py-3">~16px</td>
                          <td className="border border-gray-300 px-4 py-3">#555555</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '16px', fontWeight: 400, color: '#555555' }}>Body text example</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Navigation / Menu</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Regular/Semibold</td>
                          <td className="border border-gray-300 px-4 py-3">400/600</td>
                          <td className="border border-gray-300 px-4 py-3">~14–16px</td>
                          <td className="border border-gray-300 px-4 py-3">#ffffff</td>
                          <td className="border border-gray-300 px-4 py-3 bg-gray-800">
                            <span style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>Navigation</span>
                          </td>
                        </tr>
                         <tr>
                           <td className="border border-gray-300 px-4 py-3">Buttons / CTA</td>
                           <td className="border border-gray-300 px-4 py-3">Roboto Medium</td>
                           <td className="border border-gray-300 px-4 py-3">500</td>
                           <td className="border border-gray-300 px-4 py-3">~14–16px</td>
                           <td className="border border-gray-300 px-4 py-3">#ffffff</td>
                           <td className="border border-gray-300 px-4 py-3">
                             <span 
                               style={{ 
                                 fontSize: '14px', 
                                 fontWeight: 500, 
                                 color: '#ffffff',
                                 backgroundColor: '#577eb4',
                                 padding: '8px 16px',
                                 borderRadius: '4px'
                               }}
                             >
                               Button Text
                             </span>
                           </td>
                         </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Categories / Tiles</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Regular</td>
                          <td className="border border-gray-300 px-4 py-3">400</td>
                          <td className="border border-gray-300 px-4 py-3">~14–16px</td>
                          <td className="border border-gray-300 px-4 py-3">#ffffff</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span 
                              style={{ 
                                fontSize: '14px', 
                                fontWeight: 400, 
                                color: '#ffffff',
                                backgroundColor: '#049486',
                                padding: '4px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              iQ Lab
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Footer Text</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Regular</td>
                          <td className="border border-gray-300 px-4 py-3">400</td>
                          <td className="border border-gray-300 px-4 py-3">~12–14px</td>
                          <td className="border border-gray-300 px-4 py-3">#999999</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '12px', fontWeight: 400, color: '#999999' }}>Footer Text</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Made by / Credits</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Bold</td>
                          <td className="border border-gray-300 px-4 py-3">700</td>
                          <td className="border border-gray-300 px-4 py-3">~12–14px</td>
                          <td className="border border-gray-300 px-4 py-3">#555555</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#555555' }}>Made by Image Engineering</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                </div>

                {/* Detailed Typography Examples */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Detailed Typography Examples</h3>
                  
                  {/* H1 Varianten */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">H1 Headlines</h4>
                    
                    {/* H1 auf dunklem Hintergrund */}
                    <div className="mb-8 p-8 bg-gray-900 rounded-lg">
                      <div className="mb-4">
                        <span className="text-sm text-gray-400 font-mono">H1 on dark background</span>
                      </div>
                      <h1 style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontWeight: 100, 
                        fontSize: '45px', 
                        color: '#ffffff',
                        lineHeight: '1.1',
                        margin: 0
                      }}>
                        Image Quality Test Lab
                      </h1>
                      <div className="mt-4 text-xs text-gray-400 font-mono">
                        font-family: Roboto Thin | font-weight: 100 | font-size: 45px | color: #ffffff
                      </div>
                    </div>

                    {/* H1 auf hellem Hintergrund */}
                    <div className="mb-8 p-8 bg-white border border-gray-200 rounded-lg">
                      <div className="mb-4">
                        <span className="text-sm text-gray-600 font-mono">H1 on light background</span>
                      </div>
                      <h1 style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontWeight: 100, 
                        fontSize: '45px', 
                        color: '#222222',
                        lineHeight: '1.1',
                        margin: 0
                      }}>
                        Advanced Computer Vision Solutions
                      </h1>
                      <div className="mt-4 text-xs text-gray-500 font-mono">
                        font-family: Roboto Thin | font-weight: 100 | font-size: 45px | color: #222222
                      </div>
                    </div>
                  </div>

                  {/* H2 Headlines */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">H2 Main Headlines</h4>
                    
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                      <h2 style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontWeight: 700, 
                        fontSize: '32px', 
                        color: '#222222',
                        lineHeight: '1.2',
                        margin: 0
                      }}>
                        Precise Image Analysis for Your Requirements
                      </h2>
                      <div className="mt-4 text-xs text-gray-500 font-mono">
                        font-family: Roboto Bold | font-weight: 700 | font-size: 32px | color: #222222
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Usage: Main sections, important content blocks, category headlines
                      </p>
                    </div>
                  </div>

                  {/* H3 Subheadings */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">H3 Subheadings</h4>
                    
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                      <h3 style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontWeight: 400, 
                        fontSize: '24px', 
                        color: '#222222',
                        lineHeight: '1.3',
                        margin: 0
                      }}>
                        Technical Specifications and Features
                      </h3>
                      <div className="mt-4 text-xs text-gray-500 font-mono">
                        font-family: Roboto Regular | font-weight: 400 | font-size: 24px | color: #222222
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Usage: Subsections, feature lists, product details
                      </p>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Body Text</h4>
                    
                    <div className="p-6 bg-white border border-gray-200 rounded-lg">
                      <p style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontWeight: 400, 
                        fontSize: '16px', 
                        color: '#555555',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        Our advanced computer vision solutions provide precise image analysis for industrial applications. 
                        With cutting-edge technology and years of expertise, we develop customized systems for your 
                        specific requirements in quality control and image processing.
                      </p>
                      <div className="mt-4 text-xs text-gray-500 font-mono">
                        font-family: Roboto Regular | font-weight: 400 | font-size: 16px | color: #555555
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Usage: Main text, descriptions, article content, longer text passages
                      </p>
                    </div>
                  </div>

                  {/* Navigation Text */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Navigation / Menü</h4>
                    
                    <div className="p-6 bg-gray-800 rounded-lg">
                      <div className="flex gap-8">
                        <span style={{ 
                          fontFamily: 'Roboto, sans-serif', 
                          fontWeight: 400, 
                          fontSize: '16px', 
                          color: '#ffffff'
                        }}>
                          Products
                        </span>
                        <span style={{ 
                          fontFamily: 'Roboto, sans-serif', 
                          fontWeight: 600, 
                          fontSize: '16px', 
                          color: '#ffffff'
                        }}>
                          Solutions
                        </span>
                        <span style={{ 
                          fontFamily: 'Roboto, sans-serif', 
                          fontWeight: 400, 
                          fontSize: '16px', 
                          color: '#ffffff'
                        }}>
                          Industries
                        </span>
                      </div>
                      <div className="mt-4 text-xs text-gray-400 font-mono">
                        font-family: Roboto Regular/Semibold | font-weight: 400/600 | font-size: 14-16px | color: #ffffff
                      </div>
                      <p className="text-sm text-gray-400 mt-3">
                        Usage: Main navigation, dropdown menus, footer links
                      </p>
                    </div>
                  </div>

                  {/* Button Text */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Button / CTA Text</h4>
                    
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                       <div className="flex gap-4 flex-wrap">
                         <span 
                           style={{ 
                             fontFamily: 'Roboto, sans-serif',
                             fontWeight: 500, 
                             fontSize: '16px', 
                             color: '#ffffff',
                             backgroundColor: '#577eb4',
                             padding: '12px 24px',
                             borderRadius: '6px',
                             display: 'inline-block'
                           }}
                         >
                           Discover Charts
                         </span>
                         <span 
                           style={{ 
                             fontFamily: 'Roboto, sans-serif',
                             fontWeight: 500, 
                             fontSize: '16px', 
                             color: '#ffffff',
                             backgroundColor: '#577eb4',
                             padding: '12px 24px',
                             borderRadius: '6px',
                             display: 'inline-block'
                           }}
                         >
                           Trusted Across All Industries
                         </span>
                         <span 
                           style={{ 
                             fontFamily: 'Roboto, sans-serif',
                             fontWeight: 500, 
                             fontSize: '14px', 
                             color: '#ffffff',
                             backgroundColor: '#577eb4',
                             padding: '10px 20px',
                             borderRadius: '6px',
                             display: 'inline-block'
                           }}
                         >
                           Download PDF
                         </span>
                       </div>
                       <div className="mt-4 text-xs text-gray-500 font-mono">
                         font-family: Roboto Medium | font-weight: 500 | font-size: 14-16px | color: #ffffff
                       </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Usage: Call-to-action buttons, primary and secondary actions
                      </p>
                    </div>
                  </div>

                  {/* Footer Text */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Footer Text</h4>
                    
                    <div className="p-6 bg-gray-100 border border-gray-200 rounded-lg">
                      <p style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontWeight: 400, 
                        fontSize: '12px', 
                        color: '#999999',
                        lineHeight: '1.4',
                        margin: 0
                      }}>
                        © 2024 Image Engineering. All rights reserved. | Privacy Policy | Terms of Service | Contact
                      </p>
                      <div className="mt-3 text-xs text-gray-500 font-mono">
                        font-family: Roboto Regular | font-weight: 400 | font-size: 12px | color: #999999
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Usage: Copyright notices, footer links, legal information, small additional information
                      </p>
                    </div>
                  </div>

                  {/* Made by / Credits Text */}
                  <div className="mb-12">
                    <h4 className="text-xl font-semibold text-gray-900 mb-6">Made by / Credits (Bold)</h4>
                    
                    <div className="p-6 bg-white border border-gray-200 rounded-lg">
                      <p style={{ 
                        fontFamily: 'Roboto, sans-serif', 
                        fontWeight: 700, 
                        fontSize: '14px', 
                        color: '#555555',
                        lineHeight: '1.4',
                        margin: 0
                      }}>
                        Made by Image Engineering
                      </p>
                      <div className="mt-3 text-xs text-gray-500 font-mono">
                        font-family: Roboto Bold | font-weight: 700 | font-size: 12-14px | color: #555555
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Usage: Bold credits, brand mentions, 'Powered by' texts, emphasized footer elements
                      </p>
                    </div>
                  </div>

                  {/* Hero Complete Example */}
                  <div className="mb-16">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-8">🎯 Hero Section Complete Example</h3>
                    <p className="text-gray-600 mb-6">Practical application of all typography elements from the homepage:</p>
                    
                     <div className="p-8 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg text-white">
                       {/* H1 Hero Überschrift */}
                       <div className="mb-6">
                         <h1 style={{ 
                           fontFamily: 'Roboto, sans-serif', 
                           fontWeight: 300, 
                           fontSize: '60px', 
                           color: '#ffffff',
                           lineHeight: '0.9',
                           letterSpacing: '-0.025em',
                           margin: 0,
                           marginBottom: '6px'
                         }}>
                           Test Charts
                           <br />
                           <span style={{ fontWeight: 500 }}>Made by Image Engineering</span>
                         </h1>
                       </div>

                       {/* Hero Beschreibungstext */}
                       <div className="mb-8">
                         <p style={{ 
                           fontFamily: 'Roboto, sans-serif', 
                           fontWeight: 300, 
                           fontSize: '20px', 
                           color: 'rgba(255, 255, 255, 0.9)',
                           lineHeight: '1.6',
                           margin: 0,
                           maxWidth: '512px'
                         }}>
                           We develop and manufacture high-precision test charts for professional image quality testing. 
                           Order directly from our shop now.
                         </p>
                       </div>

                       {/* Hero Buttons */}
                       <div className="mb-8 flex gap-4">
                         <span 
                           style={{ 
                             fontFamily: 'Roboto, sans-serif',
                             fontWeight: 500, 
                             fontSize: '18px', 
                             color: '#ffffff',
                             backgroundColor: '#577eb4',
                             padding: '16px 48px',
                             borderRadius: '6px',
                             display: 'inline-flex',
                             alignItems: 'center',
                             gap: '8px'
                           }}
                         >
                           Discover Charts
                           <span style={{ fontSize: '16px' }}>→</span>
                         </span>
                         <span 
                           style={{ 
                             fontFamily: 'Roboto, sans-serif',
                             fontWeight: 500, 
                             fontSize: '18px', 
                             color: '#ffffff',
                             backgroundColor: '#577eb4',
                             padding: '16px 48px',
                             borderRadius: '6px',
                             display: 'inline-block'
                           }}
                         >
                           Trusted Across All Industries
                         </span>
                       </div>

                       {/* Hero Statistiken */}
                       <div className="flex gap-12 pt-8">
                         <div>
                           <div style={{ 
                             fontFamily: 'Roboto, sans-serif', 
                             fontWeight: 500, 
                             fontSize: '24px', 
                             color: '#ffffff',
                             margin: 0
                           }}>
                             200+
                           </div>
                           <div style={{ 
                             fontFamily: 'Roboto, sans-serif', 
                             fontWeight: 300, 
                             fontSize: '14px', 
                             color: 'rgba(255, 255, 255, 0.8)',
                             margin: 0
                           }}>
                             Test Chart Variants
                           </div>
                         </div>
                         <div>
                           <div style={{ 
                             fontFamily: 'Roboto, sans-serif', 
                             fontWeight: 500, 
                             fontSize: '24px', 
                             color: '#ffffff',
                             margin: 0
                           }}>
                             0.01%
                           </div>
                           <div style={{ 
                             fontFamily: 'Roboto, sans-serif', 
                             fontWeight: 300, 
                             fontSize: '14px', 
                             color: 'rgba(255, 255, 255, 0.8)',
                             margin: 0
                           }}>
                             Measurement Tolerance
                           </div>
                         </div>
                         <div>
                           <div style={{ 
                             fontFamily: 'Roboto, sans-serif', 
                             fontWeight: 500, 
                             fontSize: '24px', 
                             color: '#ffffff',
                             margin: 0
                           }}>
                             15+
                           </div>
                           <div style={{ 
                             fontFamily: 'Roboto, sans-serif', 
                             fontWeight: 300, 
                             fontSize: '14px', 
                             color: 'rgba(255, 255, 255, 0.8)',
                             margin: 0
                           }}>
                             Years of Experience
                           </div>
                         </div>
                       </div>
                     </div>

                    {/* Technical specifications of the Hero example */}
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">🔧 Used typography elements:</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                         <div>
                           <p className="font-mono text-xs text-gray-600">H1 Hero Title:</p>
                           <p className="font-mono text-xs text-gray-800">Roboto Light | 300 | 60-96px | #ffffff</p>
                         </div>
                         <div>
                           <p className="font-mono text-xs text-gray-600">H1 "Made by" (Fett):</p>
                           <p className="font-mono text-xs text-gray-800">Roboto Medium | 500 | 60-96px | #ffffff</p>
                         </div>
                         <div>
                           <p className="font-mono text-xs text-gray-600">Hero Description:</p>
                           <p className="font-mono text-xs text-gray-800">Roboto Light | 300 | 20px | rgba(255,255,255,0.9)</p>
                         </div>
                        <div>
                          <p className="font-mono text-xs text-gray-600">Button Text:</p>
                          <p className="font-mono text-xs text-gray-800">Roboto Medium | 500 | 16px | #ffffff</p>
                        </div>
                         <div>
                           <p className="font-mono text-xs text-gray-600">Statistics Numbers:</p>
                           <p className="font-mono text-xs text-gray-800">Roboto Medium | 500 | 24px | #ffffff</p>
                         </div>
                         <div>
                           <p className="font-mono text-xs text-gray-600">Statistics Labels:</p>
                           <p className="font-mono text-xs text-gray-800">Roboto Light | 300 | 14px | rgba(255,255,255,0.8)</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Guidelines */}
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">📋 Usage Guidelines</h4>
                    <ul className="space-y-3 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Consistency:</strong> Always use defined font sizes and weights for a uniform appearance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Contrast:</strong> Ensure sufficient color contrast for best readability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Hierarchy:</strong> H1 → H2 → H3 → Body Text follows visual importance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span><strong>Line Height:</strong> Use appropriate line heights (1.1-1.6) for better readability</span>
                      </li>
                    </ul>
                  </div>
                </div>
                </div>

                {/* Fonts Section */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">🖋 Fonts</h3>
                  
                  <div className="grid gap-6">
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Primär: Roboto (Google Fonts)</h4>
                      
                      <div className="grid gap-4">
                        <div className="flex items-center gap-6">
                          <div className="w-32">
                            <p className="font-medium text-gray-900">Roboto Thin</p>
                            <p className="text-sm text-gray-500">Weight: 100</p>
                          </div>
                          <div className="flex-1">
                            <span style={{ fontFamily: 'Roboto', fontWeight: 100, fontSize: '24px' }}>Headlines</span>
                            <p className="text-xs text-gray-500 mt-1">For large headlines and hero areas</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="w-32">
                            <p className="font-medium text-gray-900">Roboto Regular</p>
                            <p className="text-sm text-gray-500">Weight: 400</p>
                          </div>
                          <div className="flex-1">
                            <span style={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px' }}>Body text</span>
                            <p className="text-xs text-gray-500 mt-1">For body text and general content</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="w-32">
                            <p className="font-medium text-gray-900">Roboto Bold</p>
                            <p className="text-sm text-gray-500">Weight: 700</p>
                          </div>
                          <div className="flex-1">
                            <span style={{ fontFamily: 'Roboto', fontWeight: 700, fontSize: '16px' }}>Highlights, Buttons</span>
                            <p className="text-xs text-gray-500 mt-1">For buttons, important texts and accents</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border border-gray-200 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Icons: Lucide React</h4>
                      <p className="text-sm text-gray-600">Icon-System für UI-Elemente und Navigation - moderne SVG-Icons aus der Lucide React Bibliothek</p>
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