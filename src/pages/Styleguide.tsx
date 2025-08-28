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
                 <a href="#buttons" className="text-gray-700 hover:text-[#74952a] transition-colors duration-200 font-medium">
                   Buttons
                 </a>
                 <a href="#colors" className="text-gray-700 hover:text-[#74952a] transition-colors duration-200 font-medium">
                   Colors
                 </a>
                 <a href="#typography" className="text-gray-700 hover:text-[#74952a] transition-colors duration-200 font-medium">
                   Schrift
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
                         <p className="text-xs text-gray-400 font-mono">#577eb4</p>
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

              {/* Colors Section */}
              <section id="colors" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">🎨 Company Colors</h2>
                <p className="text-lg text-gray-600 mb-8">Vollständige Farbpalette aus den CSS-Variablen für Image Engineering</p>
                
                {/* Company Colors */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Hauptfarben</h3>
                  
                  <div className="grid gap-6">
                    {/* iQ Lab - Türkisgrün */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">iQ Lab</p>
                        <p className="text-sm text-gray-500">Türkisgrün</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#049486' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#049486</p>
                          <p className="text-xs text-gray-500">Primärfarbe für iQ Lab Produkte</p>
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
                          <p className="text-xs text-gray-500">Primärfarbe für iQ Charts Produkte</p>
                        </div>
                      </div>
                    </div>

                    {/* iQ Equipment - Olivgrün */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">iQ Equipment</p>
                        <p className="text-sm text-gray-500">Olivgrün</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#74952a' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#74952a</p>
                          <p className="text-xs text-gray-500">Primärfarbe für iQ Equipment Produkte</p>
                        </div>
                      </div>
                    </div>

                    {/* Software - Blau */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Software</p>
                        <p className="text-sm text-gray-500">Blau</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#577eb4' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#577eb4</p>
                          <p className="text-xs text-gray-500">Primärfarbe für Software Produkte</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Bundles - Grau */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Product Bundles</p>
                        <p className="text-sm text-gray-500">Grau</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#a3a3a3' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#a3a3a3</p>
                          <p className="text-xs text-gray-500">Primärfarbe für Product Bundle Kategorie</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base Colors */}
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Basisfarben</h3>
                  
                  <div className="grid gap-6">
                    {/* Weiß */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Weiß</p>
                        <p className="text-sm text-gray-500">Hintergrund</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border-2 border-gray-400 shadow-sm" 
                          style={{ backgroundColor: '#ffffff' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#ffffff</p>
                          <p className="text-xs text-gray-500">Primärer Hintergrund und Text auf dunklen Flächen</p>
                        </div>
                      </div>
                    </div>

                    {/* Dark Grey */}
                    <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-lg">
                      <div className="w-32">
                        <p className="font-medium text-gray-900">Dark Grey</p>
                        <p className="text-sm text-gray-500">Überschriften</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg border border-gray-300 shadow-sm" 
                          style={{ backgroundColor: '#222222' }}
                        ></div>
                        <div>
                          <p className="font-mono text-sm text-gray-900">#222222</p>
                          <p className="text-xs text-gray-500">Für H2/H3 Überschriften</p>
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
                          <p className="text-xs text-gray-500">Hauptschriftfarbe für Fließtext</p>
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
                          <p className="text-xs text-gray-500">Für Footer-Text und sekundäre Informationen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Typography Section */}
              <section id="typography" className="mb-16 scroll-mt-[320px]">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">🎨 Typografie-Hierarchie</h2>
                <p className="text-lg text-gray-600 mb-8">Schrift-Hierarchie und Typografie-Einstellungen für Image Engineering</p>
                
                {/* Typography Hierarchy Table */}
                <div className="mb-16">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-8">Typografie-Hierarchie</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 rounded-lg">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Bereich / Element</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Font-Family</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Gewicht</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Größe</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Farbe</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Beispiel</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">H1 Headlines (dunkler BG)</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Thin</td>
                          <td className="border border-gray-300 px-4 py-3">100</td>
                          <td className="border border-gray-300 px-4 py-3">~45px</td>
                          <td className="border border-gray-300 px-4 py-3">#ffffff</td>
                          <td className="border border-gray-300 px-4 py-3 bg-gray-800">
                            <span style={{ fontSize: '24px', fontWeight: 100, color: '#ffffff' }}>Image Quality Test Lab</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">H1 Headlines (heller BG)</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Thin</td>
                          <td className="border border-gray-300 px-4 py-3">100</td>
                          <td className="border border-gray-300 px-4 py-3">~45px</td>
                          <td className="border border-gray-300 px-4 py-3">#222222</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '24px', fontWeight: 100, color: '#222222' }}>Image Quality Test Lab</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">H2 Überschriften</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Bold</td>
                          <td className="border border-gray-300 px-4 py-3">700</td>
                          <td className="border border-gray-300 px-4 py-3">~32px</td>
                          <td className="border border-gray-300 px-4 py-3">#222222</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '22px', fontWeight: 700, color: '#222222' }}>Hauptüberschrift</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">H3 Unterüberschriften</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Regular</td>
                          <td className="border border-gray-300 px-4 py-3">400</td>
                          <td className="border border-gray-300 px-4 py-3">~24px</td>
                          <td className="border border-gray-300 px-4 py-3">#222222</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '18px', fontWeight: 400, color: '#222222' }}>Unterüberschrift</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Body Text / Paragraphen</td>
                          <td className="border border-gray-300 px-4 py-3">Roboto Regular</td>
                          <td className="border border-gray-300 px-4 py-3">400</td>
                          <td className="border border-gray-300 px-4 py-3">~16px</td>
                          <td className="border border-gray-300 px-4 py-3">#555555</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span style={{ fontSize: '16px', fontWeight: 400, color: '#555555' }}>Fließtext Beispiel</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Navigation / Menü</td>
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
                          <td className="border border-gray-300 px-4 py-3">Roboto Bold</td>
                          <td className="border border-gray-300 px-4 py-3">700</td>
                          <td className="border border-gray-300 px-4 py-3">~14–16px</td>
                          <td className="border border-gray-300 px-4 py-3">#ffffff</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span 
                              style={{ 
                                fontSize: '14px', 
                                fontWeight: 700, 
                                color: '#ffffff',
                                backgroundColor: '#74952a',
                                padding: '8px 16px',
                                borderRadius: '4px'
                              }}
                            >
                              Button Text
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-3">Kategorien / Kacheln</td>
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
                      </tbody>
                    </table>
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
                            <p className="text-xs text-gray-500 mt-1">Für große Überschriften und Hero-Bereiche</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="w-32">
                            <p className="font-medium text-gray-900">Roboto Regular</p>
                            <p className="text-sm text-gray-500">Weight: 400</p>
                          </div>
                          <div className="flex-1">
                            <span style={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '16px' }}>Fließtext</span>
                            <p className="text-xs text-gray-500 mt-1">Für Body-Text und allgemeine Inhalte</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="w-32">
                            <p className="font-medium text-gray-900">Roboto Bold</p>
                            <p className="text-sm text-gray-500">Weight: 700</p>
                          </div>
                          <div className="flex-1">
                            <span style={{ fontFamily: 'Roboto', fontWeight: 700, fontSize: '16px' }}>Hervorhebungen, Buttons</span>
                            <p className="text-xs text-gray-500 mt-1">Für Buttons, wichtige Texte und Akzente</p>
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