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
  // Organize icons by category
  const iconCategories = [
    {
      title: "Navigation & UI",
      icons: [
        { name: "Menu", icon: Menu },
        { name: "X", icon: X },
        { name: "ChevronDown", icon: ChevronDown },
        { name: "ChevronUp", icon: ChevronUp },
        { name: "ChevronLeft", icon: ChevronLeft },
        { name: "ChevronRight", icon: ChevronRight },
        { name: "MoreHorizontal", icon: MoreHorizontal },
        { name: "ArrowLeft", icon: ArrowLeft },
        { name: "ArrowRight", icon: ArrowRight },
        { name: "ArrowUpDown", icon: ArrowUpDown },
      ]
    },
    {
      title: "Search & Actions",
      icons: [
        { name: "Search", icon: Search },
        { name: "Filter", icon: Filter },
        { name: "Plus", icon: Plus },
        { name: "Minus", icon: Minus },
        { name: "Send", icon: Send },
        { name: "Play", icon: Play },
        { name: "Expand", icon: Expand },
        { name: "ZoomIn", icon: ZoomIn },
        { name: "Star", icon: Star },
      ]
    },
    {
      title: "Industries & Applications",
      icons: [
        { name: "Camera", icon: Camera },
        { name: "Smartphone", icon: Smartphone },
        { name: "Car", icon: Car },
        { name: "Tv", icon: Tv },
        { name: "Shield", icon: Shield },
        { name: "Stethoscope", icon: Stethoscope },
        { name: "ScanLine", icon: ScanLine },
        { name: "FlaskConical", icon: FlaskConical },
        { name: "Microscope", icon: Microscope },
        { name: "Monitor", icon: Monitor },
        { name: "TestTube", icon: TestTube },
      ]
    },
    {
      title: "Business & Technology",
      icons: [
        { name: "Building", icon: Building },
        { name: "Building2", icon: Building2 },
        { name: "Cog", icon: Cog },
        { name: "Package", icon: Package },
        { name: "Lightbulb", icon: Lightbulb },
        { name: "Puzzle", icon: Puzzle },
        { name: "Cpu", icon: Cpu },
        { name: "Database", icon: Database },
        { name: "Cloud", icon: Cloud },
        { name: "GitBranch", icon: GitBranch },
      ]
    },
    {
      title: "Communication & Contact",
      icons: [
        { name: "Phone", icon: Phone },
        { name: "Mail", icon: Mail },
        { name: "MessageCircle", icon: MessageCircle },
        { name: "MapPin", icon: MapPin },
        { name: "Calendar", icon: Calendar },
        { name: "Globe", icon: Globe },
        { name: "Clock", icon: Clock },
        { name: "ExternalLink", icon: ExternalLink },
        { name: "Link2", icon: Link2 },
        { name: "Video", icon: Video },
      ]
    },
    {
      title: "Files & Documentation",
      icons: [
        { name: "Download", icon: Download },
        { name: "FileText", icon: FileText },
        { name: "BookOpen", icon: BookOpen },
        { name: "ScrollText", icon: ScrollText },
        { name: "Info", icon: Info },
        { name: "Wrench", icon: Wrench },
        { name: "Settings", icon: Settings },
      ]
    },
    {
      title: "Analytics & Features",
      icons: [
        { name: "Target", icon: Target },
        { name: "BarChart3", icon: BarChart3 },
        { name: "Eye", icon: Eye },
        { name: "Brain", icon: Brain },
        { name: "Zap", icon: Zap },
        { name: "CheckCircle", icon: CheckCircle },
        { name: "Check", icon: Check },
        { name: "Circle", icon: Circle },
        { name: "Dot", icon: Dot },
        { name: "Award", icon: Award },
      ]
    },
    {
      title: "People & Organization",
      icons: [
        { name: "Users", icon: Users },
        { name: "GraduationCap", icon: GraduationCap },
        { name: "Briefcase", icon: Briefcase },
        { name: "Handshake", icon: Handshake },
      ]
    },
    {
      title: "Shopping & E-commerce",
      icons: [
        { name: "ShoppingCart", icon: ShoppingCart },
        { name: "Trash2", icon: Trash2 },
      ]
    },
    {
      title: "Values & Sustainability",
      icons: [
        { name: "Leaf", icon: Leaf },
        { name: "Recycle", icon: Recycle },
        { name: "ShieldCheck", icon: ShieldCheck },
        { name: "BadgeCheck", icon: BadgeCheck },
        { name: "Sprout", icon: Sprout },
      ]
    },
    {
      title: "Layout & System",
      icons: [
        { name: "PanelLeft", icon: PanelLeft },
        { name: "GripVertical", icon: GripVertical },
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
              <section key={categoryIndex} className="bg-card rounded-xl border border-border p-8">
                <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  {category.title}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({category.icons.length} icons)
                  </span>
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {category.icons.map((iconItem, iconIndex) => {
                    const IconComponent = iconItem.icon;
                    return (
                      <div 
                        key={iconIndex}
                        className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-3 rounded-lg bg-background border border-border group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-200">
                          <IconComponent 
                            className="w-6 h-6 text-foreground group-hover:text-primary transition-colors duration-200" 
                          />
                        </div>
                        <span className="text-xs text-center text-muted-foreground font-medium break-all">
                          {iconItem.name}
                        </span>
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
                  <h3 className="text-lg font-medium text-foreground mb-2">Color Guidelines</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><code>text-foreground</code> - Primary text color</li>
                    <li><code>text-muted-foreground</code> - Secondary text color</li>
                    <li><code>text-primary</code> - Brand color for emphasis</li>
                    <li><code>text-destructive</code> - Error or danger states</li>
                  </ul>
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