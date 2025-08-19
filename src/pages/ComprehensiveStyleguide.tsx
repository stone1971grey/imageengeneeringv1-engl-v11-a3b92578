import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  // Find your solution icons
  Search, Camera, TestTube, Monitor, ArrowRight, Target, BarChart3, Settings, Zap, 
  CheckCircle, Star, Play, Eye, Brain, Shield, Lightbulb, Puzzle, Cpu,
  
  // Industries icons
  Car, Stethoscope, Smartphone, Tv, Cog, ScanLine, FlaskConical, Building2, 
  Microscope, Package, Building,
  
  // Products icons
  Wrench, Download, FileText, ShoppingCart, FileCheck, ZoomIn, Plus, Minus, 
  Trash2, Send, Filter, Menu, X,
  
  // Resources icons
  BookOpen, Video, Link2, ScrollText, Calendar, ExternalLink, GraduationCap, 
  Globe, Clock, MapPin, Users,
  
  // About us icons
  Phone, Mail, Info, MessageCircle, Briefcase, Handshake, Award, BadgeCheck, 
  Sprout, Leaf, Recycle, ShieldCheck,
  
  // Additional commonly used icons
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check, Circle, Dot, 
  MoreHorizontal, PanelLeft, GripVertical, Database, Cloud, GitBranch
} from "lucide-react";

const ComprehensiveStyleguide = () => {
  const iconSections = [
    {
      title: "Find your solution",
      description: "Icons used in solution finding, product selection and guidance",
      icons: [
        { name: "Search", icon: Search, usage: "Search functionality" },
        { name: "Camera", icon: Camera, usage: "Camera/imaging related features" },
        { name: "TestTube", icon: TestTube, usage: "Laboratory testing" },
        { name: "Monitor", icon: Monitor, usage: "Display/screen testing" },
        { name: "ArrowRight", icon: ArrowRight, usage: "Navigation, CTAs" },
        { name: "Target", icon: Target, usage: "Precision/accuracy features" },
        { name: "BarChart3", icon: BarChart3, usage: "Analytics, measurements" },
        { name: "Settings", icon: Settings, usage: "Configuration options" },
        { name: "Zap", icon: Zap, usage: "Performance, speed features" },
        { name: "CheckCircle", icon: CheckCircle, usage: "Validation, success states" },
        { name: "Star", icon: Star, usage: "Ratings, premium features" },
        { name: "Play", icon: Play, usage: "Video content, demos" },
        { name: "Eye", icon: Eye, usage: "Vision, inspection features" },
        { name: "Brain", icon: Brain, usage: "AI, intelligent features" },
        { name: "Shield", icon: Shield, usage: "Security, protection" },
        { name: "Lightbulb", icon: Lightbulb, usage: "Innovation, ideas" },
        { name: "Puzzle", icon: Puzzle, usage: "Solution integration" },
        { name: "Cpu", icon: Cpu, usage: "Processing, computing" }
      ]
    },
    {
      title: "Industries",
      description: "Icons representing different industry sectors",
      icons: [
        { name: "Car", icon: Car, usage: "Automotive industry" },
        { name: "Stethoscope", icon: Stethoscope, usage: "Medical/healthcare" },
        { name: "Smartphone", icon: Smartphone, usage: "Mobile technology" },
        { name: "Tv", icon: Tv, usage: "Broadcasting, media" },
        { name: "Cog", icon: Cog, usage: "Manufacturing, machinery" },
        { name: "ScanLine", icon: ScanLine, usage: "Scanning technology" },
        { name: "FlaskConical", icon: FlaskConical, usage: "Laboratory, research" },
        { name: "Building2", icon: Building2, usage: "Industrial buildings" },
        { name: "Microscope", icon: Microscope, usage: "Scientific research" },
        { name: "Package", icon: Package, usage: "Packaging, logistics" },
        { name: "Building", icon: Building, usage: "Corporate, enterprise" }
      ]
    },
    {
      title: "Products",
      description: "Icons used in product pages, e-commerce, and catalogs",
      icons: [
        { name: "Wrench", icon: Wrench, usage: "Tools, maintenance" },
        { name: "Download", icon: Download, usage: "File downloads" },
        { name: "FileText", icon: FileText, usage: "Documentation, details" },
        { name: "ShoppingCart", icon: ShoppingCart, usage: "Add to cart, purchase" },
        { name: "FileCheck", icon: FileCheck, usage: "Verified documents" },
        { name: "ZoomIn", icon: ZoomIn, usage: "Image zoom, details" },
        { name: "Plus", icon: Plus, usage: "Add items, expand" },
        { name: "Minus", icon: Minus, usage: "Remove items, collapse" },
        { name: "Trash2", icon: Trash2, usage: "Delete, remove" },
        { name: "Send", icon: Send, usage: "Submit, send requests" },
        { name: "Filter", icon: Filter, usage: "Filter products" },
        { name: "Menu", icon: Menu, usage: "Navigation menu" },
        { name: "X", icon: X, usage: "Close, cancel" }
      ]
    },
    {
      title: "Resources",
      description: "Icons for documentation, support, and learning materials",
      icons: [
        { name: "BookOpen", icon: BookOpen, usage: "Documentation, guides" },
        { name: "Video", icon: Video, usage: "Video content" },
        { name: "Link2", icon: Link2, usage: "External links" },
        { name: "ScrollText", icon: ScrollText, usage: "Certificates, documents" },
        { name: "Calendar", icon: Calendar, usage: "Events, scheduling" },
        { name: "ExternalLink", icon: ExternalLink, usage: "External references" },
        { name: "GraduationCap", icon: GraduationCap, usage: "Education, training" },
        { name: "Globe", icon: Globe, usage: "Global, worldwide" },
        { name: "Clock", icon: Clock, usage: "Time, schedules" },
        { name: "MapPin", icon: MapPin, usage: "Location, address" },
        { name: "Users", icon: Users, usage: "Team, community" }
      ]
    },
    {
      title: "About us",
      description: "Icons for company information, contact, and corporate features",
      icons: [
        { name: "Phone", icon: Phone, usage: "Contact phone numbers" },
        { name: "Mail", icon: Mail, usage: "Email contact" },
        { name: "Info", icon: Info, usage: "Information, about" },
        { name: "MessageCircle", icon: MessageCircle, usage: "Chat, communication" },
        { name: "Briefcase", icon: Briefcase, usage: "Business, professional" },
        { name: "Handshake", icon: Handshake, usage: "Partnership, collaboration" },
        { name: "Award", icon: Award, usage: "Certifications, achievements" },
        { name: "BadgeCheck", icon: BadgeCheck, usage: "Verified, certified" },
        { name: "Sprout", icon: Sprout, usage: "Growth, sustainability" },
        { name: "Leaf", icon: Leaf, usage: "Environmental, eco-friendly" },
        { name: "Recycle", icon: Recycle, usage: "Recycling, circular economy" },
        { name: "ShieldCheck", icon: ShieldCheck, usage: "Security verification" }
      ]
    },
    {
      title: "Additional UI Icons",
      description: "Common UI elements and navigation icons",
      icons: [
        { name: "ChevronDown", icon: ChevronDown, usage: "Dropdown indicators" },
        { name: "ChevronUp", icon: ChevronUp, usage: "Collapse indicators" },
        { name: "ChevronLeft", icon: ChevronLeft, usage: "Previous, back navigation" },
        { name: "ChevronRight", icon: ChevronRight, usage: "Next, forward navigation" },
        { name: "Check", icon: Check, usage: "Checkboxes, confirmations" },
        { name: "Circle", icon: Circle, usage: "Radio buttons, status" },
        { name: "Dot", icon: Dot, usage: "Bullet points, indicators" },
        { name: "MoreHorizontal", icon: MoreHorizontal, usage: "More options menu" },
        { name: "PanelLeft", icon: PanelLeft, usage: "Sidebar toggle" },
        { name: "GripVertical", icon: GripVertical, usage: "Drag handles" },
        { name: "Database", icon: Database, usage: "Data storage" },
        { name: "Cloud", icon: Cloud, usage: "Cloud services" },
        { name: "GitBranch", icon: GitBranch, usage: "Version control" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Complete icon reference for developers and designers"
        ctaText="Learn more"
        ctaLink="#"
        icon="calendar"
      />

      {/* Header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Icon Styleguide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Complete reference of all Lucide icons used across our platform, organized by sections 
              and usage contexts. All icons shown in black on white background for clarity.
            </p>
          </div>

          {/* Usage Guidelines */}
          <Card className="mb-12 border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Usage Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Import Statement:</strong> All icons are imported from <code className="bg-gray-100 px-2 py-1 rounded">lucide-react</code>
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    import &#123; Camera, Search, Download &#125; from "lucide-react";
                  </code>
                </div>
                <p>
                  <strong>Standard Properties:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><code>size</code>: Default 24px, common sizes: 16, 20, 24, 28, 32</li>
                  <li><code>strokeWidth</code>: Default 2, range 1-3 for different weights</li>
                  <li><code>color</code>: Use semantic color classes or specific colors</li>
                  <li><code>className</code>: Apply Tailwind classes for styling</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Icon sections */}
          {iconSections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="mb-8">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-3">
                  {section.title}
                  <Badge variant="secondary" className="text-sm">
                    {section.icons.length} icons
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 mt-2">{section.description}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {section.icons.map((iconData, index) => {
                    const IconComponent = iconData.icon;
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="w-16 h-16 flex items-center justify-center mb-3 bg-white rounded-lg border">
                          <IconComponent 
                            size={32} 
                            className="text-black" 
                            strokeWidth={2}
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-center mb-1">
                          {iconData.name}
                        </h3>
                        <p className="text-sm text-gray-600 text-center leading-tight">
                          {iconData.usage}
                        </p>
                        <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                          &lt;{iconData.name} /&gt;
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Color Guidelines */}
          <Card className="mb-8">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-2xl text-gray-900">Color Usage Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mb-3 mx-auto bg-white rounded-lg border">
                    <Camera size={32} className="text-gray-900" strokeWidth={2} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Primary (Black)</h4>
                  <p className="text-sm text-gray-600">Main content, navigation</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">text-black</code>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mb-3 mx-auto bg-white rounded-lg border">
                    <Camera size={32} className="text-[#7a933b]" strokeWidth={2} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Brand Green</h4>
                  <p className="text-sm text-gray-600">Highlights, CTAs</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">text-[#7a933b]</code>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mb-3 mx-auto bg-white rounded-lg border">
                    <Camera size={32} className="text-gray-600" strokeWidth={2} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Secondary</h4>
                  <p className="text-sm text-gray-600">Supporting content</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">text-gray-600</code>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mb-3 mx-auto bg-white rounded-lg border">
                    <Camera size={32} className="text-gray-400" strokeWidth={2} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Disabled</h4>
                  <p className="text-sm text-gray-600">Inactive elements</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">text-gray-400</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size Guidelines */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-2xl text-gray-900">Size Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[
                  { size: 16, usage: "Small buttons, inline text" },
                  { size: 20, usage: "Form inputs, compact UI" },
                  { size: 24, usage: "Default size, standard buttons" },
                  { size: 28, usage: "Industry icons, featured elements" },
                  { size: 32, usage: "Large buttons, hero sections" },
                  { size: 48, usage: "Headers, prominent features" }
                ].map((sizeData) => (
                  <div key={sizeData.size} className="text-center">
                    <div className="flex items-center justify-center mb-3 bg-white rounded-lg border p-4">
                      <Camera size={sizeData.size} className="text-black" strokeWidth={2} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{sizeData.size}px</h4>
                    <p className="text-xs text-gray-600 leading-tight">{sizeData.usage}</p>
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded mt-1 inline-block">size={sizeData.size}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComprehensiveStyleguide;