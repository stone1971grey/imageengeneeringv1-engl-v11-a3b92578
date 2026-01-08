import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Layers, Eye, Languages, Book, Sparkles, FolderOpen,
  Newspaper, Calendar, Target, Download, Settings,
  GripVertical, Shield, Type, LayoutGrid, PlayCircle,
  ListChecks, Table2, HelpCircle, FileText, Building2,
  Navigation2, Images, Monitor, Zap, Image as ImageIcon,
  SplitSquareVertical, List, PanelBottom, History as HistoryIcon,
  Search, FileCheck, Wand2, Clock, Copy, Database,
  ChevronDown, Flame, PenLine, Rocket, Package, Sliders,
  HardDrive, GitBranch, Puzzle, BarChart3, CheckCircle2, Circle
} from "lucide-react";
import { SistrixIcon } from "@/components/icons/SistrixIcon";
import spadeCmsLogo from "@/assets/spade-cms-logo.png";
import { 
  ROADMAP_VERSIONS, 
  getReleasedVersions, 
  getRoadmapVersions,
  type RoadmapVersion,
  type RoadmapFeature
} from "./roadmapConfig";

interface WelcomeTabProps {
  version: string;
  isAdmin?: boolean;
}

export const WelcomeTab = ({ version, isAdmin = false }: WelcomeTabProps) => {
  const [openVersions, setOpenVersions] = useState<Record<string, boolean>>({
    "v1.0": true // Only v1.0 open by default
  });

  const toggleVersion = (key: string) => {
    setOpenVersions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const releasedVersions = getReleasedVersions();
  const roadmapVersions = getRoadmapVersions();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden relative">
        {/* Version Badge - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <span className="px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-brand-primary via-brand-primary-hover to-brand-primary text-brand-primary-foreground rounded-lg shadow-lg shadow-brand-primary/30 border border-brand-primary/50">
            Version {version}
          </span>
        </div>
        <CardContent className="p-12">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-6">
              <div className="bg-white rounded-xl px-5 py-3 shadow-lg">
                <img 
                  src={spadeCmsLogo} 
                  alt="SpadeCMS" 
                  className="h-14 w-auto"
                />
              </div>
            </div>

            {/* Version History - Collapsible */}
            <div className="space-y-2">
              {/* Released Versions */}
              {releasedVersions.map((v) => (
                <VersionSection 
                  key={v.key}
                  versionKey={v.key}
                  label={v.label}
                  isOpen={openVersions[v.key] || false}
                  onToggle={() => toggleVersion(v.key)}
                  isCurrent={v.status === 'current'}
                >
                  {v.features.map((feature, idx) => (
                    <FeatureItem 
                      key={idx}
                      icon={feature.status === 'done' ? CheckCircle2 : Circle} 
                      label={feature.label} 
                      isDone={feature.status === 'done'}
                      isPlanned={feature.status === 'planned'}
                    />
                  ))}
                </VersionSection>
              ))}

              {/* Roadmap - Admin Only */}
              {isAdmin && roadmapVersions.length > 0 && (
                <div className="pt-4 border-t border-gray-700/50 mt-4">
                  <p className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Roadmap</p>
                  
                  {roadmapVersions.map((v) => (
                    <VersionSection 
                      key={v.key}
                      versionKey={v.key}
                      label={v.label}
                      isOpen={openVersions[v.key] || false}
                      onToggle={() => toggleVersion(v.key)}
                      isPlanned={v.status === 'planned'}
                      isComplete={v.status === 'complete'}
                    >
                      {v.features.map((feature, idx) => (
                        <FeatureItem 
                          key={idx}
                          icon={feature.status === 'done' ? CheckCircle2 : Circle} 
                          label={feature.label} 
                          isDone={feature.status === 'done'}
                          isPlanned={feature.status === 'planned'}
                        />
                      ))}
                    </VersionSection>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Content Segments - Tabbed Overview */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#f9dc24] flex items-center justify-center">
              <Layers className="h-6 w-6 text-gray-900" />
            </div>
            Available Content Segments
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2">
            Build your pages using these powerful content segments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="page-heroes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="page-heroes" className="text-sm font-semibold">Page Hero Segments</TabsTrigger>
              <TabsTrigger value="content-segments" className="text-sm font-semibold">Content Segments</TabsTrigger>
              <TabsTrigger value="special-templates" className="text-sm font-semibold">Special Segments</TabsTrigger>
            </TabsList>

            {/* Tab 1: Page Heroes */}
            <TabsContent value="page-heroes" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <SegmentCard code="F" color="yellow" icon={Eye} name="Product Hero" description="Hero with image & CTA" />
                <SegmentCard code="E" color="orange" icon={Navigation2} name="Meta Navigation" description="Anchor links" />
                <SegmentCard code="G" color="pink" icon={Images} name="Product Gallery" description="Image carousel" />
                <SegmentCard code="A" color="rose" icon={Monitor} name="Full Hero" description="Fullscreen Ken Burns" />
                <SegmentCard code="Q" color="violet" icon={Zap} name="Action Hero" description="Hero with action focus" />
              </div>
            </TabsContent>

            {/* Tab 2: Content Segments */}
            <TabsContent value="content-segments" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <SegmentCard code="B" color="teal" icon={Type} name="Intro" description="Title & description" />
                <SegmentCard code="H" color="blue" icon={LayoutGrid} name="Tiles" description="Feature cards grid" />
                <SegmentCard code="J" color="purple" icon={ImageIcon} name="Banner" description="Promo with images" />
                <SegmentCard code="I" color="lime" icon={SplitSquareVertical} name="Image & Text" description="Split layout" />
                <SegmentCard code="M" color="cyan" icon={PlayCircle} name="Video" description="Embedded player" />
                <SegmentCard code="K" color="indigo" icon={ListChecks} name="Feature Overview" description="Icon features list" />
                <SegmentCard code="L" color="emerald" icon={Table2} name="Table" description="Data tables" />
                <SegmentCard code="O" color="red" icon={HelpCircle} name="FAQ" description="Q&A accordion" />
                <SegmentCard code="N" color="amber" icon={FileText} name="Specification" description="Tech specs" />
                <SegmentCard code="C" color="slate" icon={Building2} name="Industries" description="Industry showcase" />
              </div>
            </TabsContent>

            {/* Tab 3: Special Segments */}
            <TabsContent value="special-templates" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <SegmentCard code="D" color="sky" icon={Newspaper} name="Latest News" description="News feed block" />
                <SegmentCard code="P" color="fuchsia" icon={List} name="News List" description="Filterable news" />
                <SegmentCard code="R" color="green" icon={Calendar} name="Events" description="Event listings" />
                <SegmentCard code="S" color="cyan" icon={Target} name="Product List" description="Product catalog" />
                <SegmentCard code="T" color="purple" icon={Download} name="Downloads" description="Download center" />
                <SegmentCard code="U" color="gray" icon={PanelBottom} name="Mini Footer" description="Minimal footer" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Version Section Component with Collapsible
interface VersionSectionProps {
  versionKey: string;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  isCurrent?: boolean;
  isPlanned?: boolean;
  isComplete?: boolean;
  children: React.ReactNode;
}

const VersionSection = ({ label, isOpen, onToggle, isCurrent, isPlanned, isComplete, children }: VersionSectionProps) => (
  <Collapsible open={isOpen} onOpenChange={onToggle}>
    <CollapsibleTrigger className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
      isCurrent 
        ? 'bg-[#f9dc24]/20 hover:bg-[#f9dc24]/30' 
        : isComplete
          ? 'bg-green-900/30 hover:bg-green-900/50'
          : isPlanned 
            ? 'bg-gray-700/30 hover:bg-gray-700/50' 
            : 'bg-gray-800/50 hover:bg-gray-800/70'
    }`}>
      <span className={`text-xs font-semibold uppercase tracking-wider ${
        isCurrent ? 'text-[#f9dc24]' : isComplete ? 'text-green-400' : 'text-white'
      }`}>
        {label}
        {isPlanned && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-600 text-gray-300 rounded">Planned</span>}
        {isComplete && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-green-700 text-green-200 rounded">Complete</span>}
      </span>
      <ChevronDown className={`h-4 w-4 ${isCurrent ? 'text-[#f9dc24]' : isComplete ? 'text-green-400' : 'text-gray-500'} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-2 pb-1">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-2">
        {children}
      </div>
    </CollapsibleContent>
  </Collapsible>
);

// Helper component for feature items
const FeatureItem = ({ icon: Icon, label, isPlanned, isDone }: { icon: any; label: string; isPlanned?: boolean; isDone?: boolean }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg ${
    isDone ? 'bg-green-900/30' : isPlanned ? 'bg-gray-700/30' : 'bg-gray-800/50'
  }`}>
    <Icon className={`h-5 w-5 ${
      isDone ? 'text-green-400' : isPlanned ? 'text-gray-500' : 'text-[#f9dc24]'
    }`} />
    <span className={`text-sm font-medium ${
      isDone ? 'text-green-300' : isPlanned ? 'text-gray-400' : 'text-white'
    }`}>{label}</span>
  </div>
);

// Helper component for segment cards
interface SegmentCardProps {
  code: string;
  color: string;
  icon: any;
  name: string;
  description: string;
}

const colorMap: Record<string, { badge: string; gradient: string; border: string }> = {
  yellow: { badge: 'bg-[#f9dc24] text-gray-900', gradient: 'from-[#f9dc24] to-yellow-300', border: 'hover:border-[#f9dc24]' },
  orange: { badge: 'bg-orange-500 text-white', gradient: 'from-orange-500 to-orange-400', border: 'hover:border-orange-400' },
  pink: { badge: 'bg-pink-500 text-white', gradient: 'from-pink-500 to-pink-400', border: 'hover:border-pink-400' },
  rose: { badge: 'bg-rose-500 text-white', gradient: 'from-rose-500 to-rose-400', border: 'hover:border-rose-400' },
  violet: { badge: 'bg-violet-500 text-white', gradient: 'from-violet-500 to-violet-400', border: 'hover:border-violet-400' },
  teal: { badge: 'bg-teal-500 text-white', gradient: 'from-teal-500 to-teal-400', border: 'hover:border-teal-400' },
  blue: { badge: 'bg-blue-500 text-white', gradient: 'from-blue-500 to-blue-400', border: 'hover:border-blue-400' },
  purple: { badge: 'bg-purple-500 text-white', gradient: 'from-purple-500 to-purple-400', border: 'hover:border-purple-400' },
  lime: { badge: 'bg-lime-500 text-white', gradient: 'from-lime-500 to-lime-400', border: 'hover:border-lime-400' },
  cyan: { badge: 'bg-cyan-500 text-white', gradient: 'from-cyan-500 to-cyan-400', border: 'hover:border-cyan-400' },
  indigo: { badge: 'bg-indigo-500 text-white', gradient: 'from-indigo-500 to-indigo-400', border: 'hover:border-indigo-400' },
  emerald: { badge: 'bg-emerald-500 text-white', gradient: 'from-emerald-500 to-emerald-400', border: 'hover:border-emerald-400' },
  red: { badge: 'bg-red-500 text-white', gradient: 'from-red-500 to-red-400', border: 'hover:border-red-400' },
  amber: { badge: 'bg-amber-500 text-white', gradient: 'from-amber-500 to-amber-400', border: 'hover:border-amber-400' },
  slate: { badge: 'bg-slate-600 text-white', gradient: 'from-slate-600 to-slate-500', border: 'hover:border-slate-400' },
  sky: { badge: 'bg-sky-500 text-white', gradient: 'from-sky-500 to-sky-400', border: 'hover:border-sky-400' },
  fuchsia: { badge: 'bg-fuchsia-500 text-white', gradient: 'from-fuchsia-500 to-fuchsia-400', border: 'hover:border-fuchsia-400' },
  green: { badge: 'bg-green-500 text-white', gradient: 'from-green-500 to-green-400', border: 'hover:border-green-400' },
  gray: { badge: 'bg-gray-600 text-white', gradient: 'from-gray-600 to-gray-500', border: 'hover:border-gray-400' },
};

const SegmentCard = ({ code, color, icon: Icon, name, description }: SegmentCardProps) => {
  const colors = colorMap[color] || colorMap.gray;
  
  return (
    <div className={`group relative overflow-hidden rounded-xl border-2 border-gray-200 ${colors.border} transition-all duration-300 bg-white hover:shadow-xl`}>
      <div className={`absolute top-2 right-2 px-2 py-0.5 ${colors.badge} text-xs font-black rounded`}>{code}</div>
      <div className="p-4 space-y-2">
        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow`}>
          <Icon className={`h-5 w-5 ${color === 'yellow' ? 'text-gray-900' : 'text-white'}`} />
        </div>
        <h4 className="text-sm font-bold text-gray-900">{name}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default WelcomeTab;