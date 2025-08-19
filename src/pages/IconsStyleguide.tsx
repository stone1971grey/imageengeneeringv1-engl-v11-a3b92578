import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Import all icons used in the project
import { 
  // Navigation & UI
  Menu, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, ArrowLeft, ArrowRight, ArrowUpDown,
  Search, Filter, Plus, Minus, Send, Play, Expand, ZoomIn, Star, 
  
  // Business & Industry
  Camera, Smartphone, Car, Tv, Shield, Stethoscope, ScanLine, FlaskConical, Microscope, Monitor, TestTube,
  Building, Building2, Cog, Package, Lightbulb, Puzzle, Cpu, Database, Cloud, GitBranch,
  
  // Communication & Contact  
  Phone, Mail, MessageCircle, MapPin, Calendar, Globe, Clock, ExternalLink, Link2, Video,
  
  // Features & Actions
  Download, Upload, FileText, BookOpen, ScrollText, Info, Wrench, Settings, Target, BarChart3,
  Eye, Brain, Zap, CheckCircle, Check, Circle, Dot, Award, Users, GraduationCap,
  
  // Shopping & E-commerce
  ShoppingCart, Trash2,
  
  // Company & Values
  Briefcase, Handshake, Leaf, Recycle, ShieldCheck, BadgeCheck, Sprout, PanelLeft, GripVertical
} from "lucide-react";

const IconsStyleguide = () => {
  // Organize icons by category with their actual usage colors
  const iconCategories = [
    {
      title: "Navigation & UI",
      description: "Primary navigation and user interface icons",
      icons: [
        { name: "Menu", icon: Menu, color: "text-foreground", usage: "Mobile menu toggle" },
        { name: "X", icon: X, color: "text-foreground", usage: "Close buttons, modal dismiss" },
        { name: "ChevronDown", icon: ChevronDown, color: "text-muted-foreground", usage: "Dropdown indicators, accordions" },
        { name: "ChevronUp", icon: ChevronUp, color: "text-muted-foreground", usage: "Collapse indicators" },
        { name: "ChevronLeft", icon: ChevronLeft, color: "text-foreground", usage: "Back navigation, carousels" },
        { name: "ChevronRight", icon: ChevronRight, color: "text-foreground", usage: "Forward navigation, carousels" },
        { name: "MoreHorizontal", icon: MoreHorizontal, color: "text-muted-foreground", usage: "Menu overflow, pagination" },
        { name: "ArrowLeft", icon: ArrowLeft, color: "text-foreground", usage: "Back buttons, breadcrumbs" },
        { name: "ArrowRight", icon: ArrowRight, color: "text-foreground", usage: "CTAs, next actions" },
        { name: "ArrowUpDown", icon: ArrowUpDown, color: "text-muted-foreground", usage: "Sorting controls" },
      ]
    },
    {
      title: "Search & Actions",
      description: "Interactive elements and action triggers",
      icons: [
        { name: "Search", icon: Search, color: "text-primary", usage: "Search inputs, find functions" },
        { name: "Filter", icon: Filter, color: "text-muted-foreground", usage: "Content filtering" },
        { name: "Plus", icon: Plus, color: "text-foreground", usage: "Add items, expand" },
        { name: "Minus", icon: Minus, color: "text-foreground", usage: "Remove items, collapse" },
        { name: "Send", icon: Send, color: "text-primary", usage: "Form submissions, messaging" },
        { name: "Play", icon: Play, color: "text-foreground", usage: "Video players, media controls" },
        { name: "Expand", icon: Expand, color: "text-muted-foreground", usage: "Full-screen, zoom" },
        { name: "ZoomIn", icon: ZoomIn, color: "text-muted-foreground", usage: "Image zoom, magnify" },
        { name: "Star", icon: Star, color: "text-foreground", usage: "Ratings, favorites" },
      ]
    },
    {
      title: "Industries & Applications",
      description: "Industry-specific and application icons",
      icons: [
        { name: "Camera", icon: Camera, color: "text-primary", usage: "Photography, imaging" },
        { name: "Smartphone", icon: Smartphone, color: "text-primary", usage: "Mobile industry" },
        { name: "Car", icon: Car, color: "text-primary", usage: "Automotive, ADAS" },
        { name: "Tv", icon: Tv, color: "text-primary", usage: "Broadcast, HDTV" },
        { name: "Shield", icon: Shield, color: "text-primary", usage: "Security, surveillance" },
        { name: "Stethoscope", icon: Stethoscope, color: "text-primary", usage: "Medical, endoscopy" },
        { name: "ScanLine", icon: ScanLine, color: "text-primary", usage: "Scanning, archiving" },
        { name: "FlaskConical", icon: FlaskConical, color: "text-primary", usage: "Lab testing, research" },
        { name: "Microscope", icon: Microscope, color: "text-primary", usage: "Scientific instruments" },
        { name: "Monitor", icon: Monitor, color: "text-primary", usage: "Display technology" },
        { name: "TestTube", icon: TestTube, color: "text-primary", usage: "Laboratory equipment" },
      ]
    },
    {
      title: "Business & Technology",
      description: "Corporate and technical system icons",
      icons: [
        { name: "Building", icon: Building, color: "text-muted-foreground", usage: "Company, manufacturers" },
        { name: "Building2", icon: Building2, color: "text-muted-foreground", usage: "Organizations, facilities" },
        { name: "Cog", icon: Cog, color: "text-muted-foreground", usage: "Settings, machine vision" },
        { name: "Package", icon: Package, color: "text-primary", usage: "Products, bundles" },
        { name: "Lightbulb", icon: Lightbulb, color: "text-primary", usage: "Solutions, ideas" },
        { name: "Puzzle", icon: Puzzle, color: "text-muted-foreground", usage: "Accessories, components" },
        { name: "Cpu", icon: Cpu, color: "text-primary", usage: "Technology, processing" },
        { name: "Database", icon: Database, color: "text-muted-foreground", usage: "Data storage" },
        { name: "Cloud", icon: Cloud, color: "text-muted-foreground", usage: "Cloud services" },
        { name: "GitBranch", icon: GitBranch, color: "text-muted-foreground", usage: "Version control" },
      ]
    },
    {
      title: "Communication & Contact",
      description: "Contact methods and communication channels",
      icons: [
        { name: "Phone", icon: Phone, color: "text-primary", usage: "Contact numbers" },
        { name: "Mail", icon: Mail, color: "text-primary", usage: "Email addresses" },
        { name: "MessageCircle", icon: MessageCircle, color: "text-muted-foreground", usage: "Chat, messaging" },
        { name: "MapPin", icon: MapPin, color: "text-primary", usage: "Locations, addresses" },
        { name: "Calendar", icon: Calendar, color: "text-primary", usage: "Events, scheduling" },
        { name: "Globe", icon: Globe, color: "text-muted-foreground", usage: "Website, global" },
        { name: "Clock", icon: Clock, color: "text-primary", usage: "Business hours, time" },
        { name: "ExternalLink", icon: ExternalLink, color: "text-muted-foreground", usage: "External resources" },
        { name: "Link2", icon: Link2, color: "text-muted-foreground", usage: "API links" },
        { name: "Video", icon: Video, color: "text-muted-foreground", usage: "Video content" },
      ]
    },
    {
      title: "Files & Documentation",
      description: "Document types and file operations",
      icons: [
        { name: "Download", icon: Download, color: "text-primary", usage: "File downloads" },
        { name: "FileText", icon: FileText, color: "text-primary", usage: "Documents, PDFs" },
        { name: "BookOpen", icon: BookOpen, color: "text-muted-foreground", usage: "Documentation, guides" },
        { name: "ScrollText", icon: ScrollText, color: "text-muted-foreground", usage: "Release notes, logs" },
        { name: "Info", icon: Info, color: "text-muted-foreground", usage: "Information, help" },
        { name: "Wrench", icon: Wrench, color: "text-muted-foreground", usage: "Technical support, tools" },
        { name: "Settings", icon: Settings, color: "text-muted-foreground", usage: "Configuration, preferences" },
      ]
    },
    {
      title: "Analytics & Features",
      description: "Data visualization and key features",
      icons: [
        { name: "Target", icon: Target, color: "text-primary", usage: "Targeting, precision" },
        { name: "BarChart3", icon: BarChart3, color: "text-primary", usage: "Analytics, metrics" },
        { name: "Eye", icon: Eye, color: "text-primary", usage: "Vision, monitoring" },
        { name: "Brain", icon: Brain, color: "text-primary", usage: "AI, intelligence" },
        { name: "Zap", icon: Zap, color: "text-primary", usage: "High performance, energy" },
        { name: "CheckCircle", icon: CheckCircle, color: "text-primary", usage: "Success, validation" },
        { name: "Check", icon: Check, color: "text-primary", usage: "Confirmation, selection" },
        { name: "Circle", icon: Circle, color: "text-muted-foreground", usage: "Options, radio buttons" },
        { name: "Dot", icon: Dot, color: "text-muted-foreground", usage: "Indicators, separators" },
        { name: "Award", icon: Award, color: "text-primary", usage: "Recognition, standards" },
      ]
    },
    {
      title: "People & Organization",
      description: "Human resources and organizational elements",
      icons: [
        { name: "Users", icon: Users, color: "text-primary", usage: "Teams, community" },
        { name: "GraduationCap", icon: GraduationCap, color: "text-primary", usage: "Education, training" },
        { name: "Briefcase", icon: Briefcase, color: "text-muted-foreground", usage: "Business, careers" },
        { name: "Handshake", icon: Handshake, color: "text-muted-foreground", usage: "Partnerships, agreements" },
      ]
    },
    {
      title: "E-commerce",
      description: "Shopping and transaction related icons",
      icons: [
        { name: "ShoppingCart", icon: ShoppingCart, color: "text-primary", usage: "Cart, purchasing" },
        { name: "Trash2", icon: Trash2, color: "text-destructive", usage: "Delete, remove items" },
      ]
    },
    {
      title: "Values & Sustainability",
      description: "Company values and environmental icons",
      icons: [
        { name: "Leaf", icon: Leaf, color: "text-primary", usage: "Environmental, green" },
        { name: "Recycle", icon: Recycle, color: "text-muted-foreground", usage: "Recycling, disposal" },
        { name: "ShieldCheck", icon: ShieldCheck, color: "text-primary", usage: "Security, compliance" },
        { name: "BadgeCheck", icon: BadgeCheck, color: "text-primary", usage: "Quality, verification" },
        { name: "Sprout", icon: Sprout, color: "text-primary", usage: "Sustainability, growth" },
      ]
    },
    {
      title: "System & Layout",
      description: "UI layout and system interface icons",
      icons: [
        { name: "PanelLeft", icon: PanelLeft, color: "text-muted-foreground", usage: "Sidebar controls" },
        { name: "GripVertical", icon: GripVertical, color: "text-muted-foreground", usage: "Drag handles, resize" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-[200px] pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Link 
                to="/styleguide" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Main Styleguide
              </Link>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Icons Styleguide</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Complete overview of all Lucide React icons used throughout the Image Engineering application. 
              Each icon is organized by category for easy reference and consistent usage.
            </p>
          </div>

          {/* Icon Categories */}
          <div className="max-w-7xl mx-auto space-y-16">
            {iconCategories.map((category, categoryIndex) => (
              <section key={categoryIndex} className="bg-white rounded-xl border border-border p-8 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full"></div>
                    {category.title}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({category.icons.length} icons)
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.icons.map((iconItem, iconIndex) => {
                    const IconComponent = iconItem.icon;
                    return (
                      <div 
                        key={iconIndex}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group bg-white"
                      >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-border group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-200`}>
                          <IconComponent 
                            className={`w-5 h-5 ${iconItem.color} group-hover:text-primary transition-colors duration-200`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground mb-1 break-all">
                            {iconItem.name}
                          </div>
                          <div className="text-xs text-muted-foreground leading-tight">
                            {iconItem.usage}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Usage Guidelines */}
          <div className="max-w-4xl mx-auto mt-20">
            <div className="bg-card rounded-xl border border-border p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                Usage Guidelines
              </h2>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Import Icons</h3>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <code>import &#123; Camera, Search, Download &#125; from "lucide-react";</code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Standard Usage</h3>
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                    <code>&lt;Camera className="w-6 h-6 text-foreground" /&gt;</code>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Size Guidelines</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><code>w-4 h-4</code> - Small icons (16px) for inline text</li>
                    <li><code>w-5 h-5</code> - Medium icons (20px) for buttons and navigation</li>
                    <li><code>w-6 h-6</code> - Standard icons (24px) for general use</li>
                    <li><code>w-8 h-8</code> - Large icons (32px) for headers and emphasis</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Color Usage</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <div className="w-4 h-4 rounded bg-primary"></div>
                      <code className="text-sm">text-primary</code>
                      <span className="text-sm text-muted-foreground">- Main brand color for key features and actions</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <div className="w-4 h-4 rounded bg-foreground"></div>
                      <code className="text-sm">text-foreground</code>
                      <span className="text-sm text-muted-foreground">- Primary text color for main elements</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <div className="w-4 h-4 rounded bg-muted-foreground"></div>
                      <code className="text-sm">text-muted-foreground</code>
                      <span className="text-sm text-muted-foreground">- Secondary elements and supporting content</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <div className="w-4 h-4 rounded bg-destructive"></div>
                      <code className="text-sm">text-destructive</code>
                      <span className="text-sm text-muted-foreground">- Error states and destructive actions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center mt-16">
            <Link to="/styleguide">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Main Styleguide
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default IconsStyleguide;