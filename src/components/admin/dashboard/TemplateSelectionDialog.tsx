import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, Navigation2, Images, Sparkles, Zap, Type, LayoutGrid, 
  PlayCircle, FileText, HelpCircle, Building2, List, PanelBottom,
  SplitSquareVertical, Newspaper, Calendar, Target, Download, Table2, ListChecks, Image as ImageIcon
} from "lucide-react";

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (templateType: string) => void;
  pageSegments: any[];
}

interface TemplateCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
  disabled?: boolean;
  disabledLabel?: string;
  warningText?: string;
}

const TemplateCard = ({ onClick, icon, title, description, gradient, borderColor, disabled, disabledLabel, warningText }: TemplateCardProps) => (
  <div 
    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-white hover:shadow-xl ${
      disabled 
        ? 'border-red-300 opacity-60 cursor-not-allowed' 
        : `border-gray-200 hover:${borderColor} cursor-pointer`
    }`}
    onClick={disabled ? undefined : onClick}
  >
    {disabledLabel && (
      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
        {disabledLabel}
      </div>
    )}
    <div className="p-6 space-y-4">
      <div className={`h-14 w-14 rounded-xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        {warningText && (
          <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ {warningText}</p>
        )}
      </div>
    </div>
    <div className={`absolute inset-x-0 bottom-0 h-1 ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
  </div>
);

export function TemplateSelectionDialog({ 
  open, 
  onOpenChange, 
  onSelectTemplate, 
  pageSegments 
}: TemplateSelectionDialogProps) {
  const hasFullHero = pageSegments.some(seg => seg.type === 'full-hero');
  const hasMetaNav = pageSegments.some(seg => seg.type === 'meta-navigation');
  const hasMiniFooter = pageSegments.some(seg => seg.type === 'mini-footer');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Add New Segment
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Choose a segment template to add to this page. Segments can be reordered after creation.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="page-heroes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="page-heroes">Page Hero Segments</TabsTrigger>
            <TabsTrigger value="content">Content Segments</TabsTrigger>
            <TabsTrigger value="special">Special Segments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="page-heroes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              <TemplateCard
                onClick={() => onSelectTemplate('hero')}
                icon={<Eye className="h-7 w-7 text-gray-900" />}
                title="Product Hero - F"
                description="Main page hero with image, title, description and CTA button"
                gradient="bg-gradient-to-br from-[#f9dc24] to-yellow-300"
                borderColor="border-[#f9dc24]"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('meta-navigation')}
                icon={<Navigation2 className="h-7 w-7 text-white" />}
                title="Meta Navigation - E"
                description="Anchor links for page sections"
                gradient="bg-gradient-to-br from-orange-500 to-orange-400"
                borderColor="border-orange-400"
                disabled={hasFullHero}
                disabledLabel={hasFullHero ? "Blocked by Full Hero" : undefined}
                warningText={hasFullHero ? "Cannot be used with Full Hero" : undefined}
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('product-hero-gallery')}
                icon={<Images className="h-7 w-7 text-white" />}
                title="Product Gallery - G"
                description="Product hero with image carousel"
                gradient="bg-gradient-to-br from-pink-500 to-pink-400"
                borderColor="border-pink-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('full-hero')}
                icon={<Sparkles className="h-7 w-7 text-white" />}
                title="Full Hero - A"
                description="Full-width image hero"
                gradient="bg-gradient-to-br from-rose-500 to-rose-400"
                borderColor="border-rose-400"
                disabled={hasMetaNav}
                disabledLabel={hasMetaNav ? "Blocked by Meta Nav" : undefined}
                warningText={hasMetaNav ? "Cannot be used with Meta Navigation" : undefined}
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('action-hero')}
                icon={<Zap className="h-7 w-7 text-white" />}
                title="Action Hero - Q"
                description="Slim hero with action focus"
                gradient="bg-gradient-to-br from-violet-500 to-violet-400"
                borderColor="border-violet-400"
              />
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              <TemplateCard
                onClick={() => onSelectTemplate('intro')}
                icon={<Type className="h-7 w-7 text-white" />}
                title="Intro - B"
                description="Title & description section"
                gradient="bg-gradient-to-br from-teal-500 to-teal-400"
                borderColor="border-teal-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('tiles')}
                icon={<LayoutGrid className="h-7 w-7 text-white" />}
                title="Tiles - H"
                description="Feature cards grid"
                gradient="bg-gradient-to-br from-blue-500 to-blue-400"
                borderColor="border-blue-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('banner')}
                icon={<ImageIcon className="h-7 w-7 text-white" />}
                title="Banner - J"
                description="Promo with images"
                gradient="bg-gradient-to-br from-purple-500 to-purple-400"
                borderColor="border-purple-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('image-text')}
                icon={<SplitSquareVertical className="h-7 w-7 text-white" />}
                title="Image & Text - I"
                description="Split layout"
                gradient="bg-gradient-to-br from-lime-500 to-lime-400"
                borderColor="border-lime-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('video')}
                icon={<PlayCircle className="h-7 w-7 text-white" />}
                title="Video - M"
                description="Embedded player"
                gradient="bg-gradient-to-br from-cyan-500 to-cyan-400"
                borderColor="border-cyan-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('feature-overview')}
                icon={<ListChecks className="h-7 w-7 text-white" />}
                title="Feature Overview - K"
                description="Icon features list"
                gradient="bg-gradient-to-br from-indigo-500 to-indigo-400"
                borderColor="border-indigo-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('table')}
                icon={<Table2 className="h-7 w-7 text-white" />}
                title="Table - L"
                description="Data tables"
                gradient="bg-gradient-to-br from-emerald-500 to-emerald-400"
                borderColor="border-emerald-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('faq')}
                icon={<HelpCircle className="h-7 w-7 text-white" />}
                title="FAQ - O"
                description="Q&A accordion"
                gradient="bg-gradient-to-br from-red-500 to-red-400"
                borderColor="border-red-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('specification')}
                icon={<FileText className="h-7 w-7 text-white" />}
                title="Specification - N"
                description="Tech specs"
                gradient="bg-gradient-to-br from-amber-500 to-amber-400"
                borderColor="border-amber-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('industries')}
                icon={<Building2 className="h-7 w-7 text-white" />}
                title="Industries - C"
                description="Industry showcase"
                gradient="bg-gradient-to-br from-slate-600 to-slate-500"
                borderColor="border-slate-400"
              />
            </div>
          </TabsContent>

          <TabsContent value="special">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              <TemplateCard
                onClick={() => onSelectTemplate('news')}
                icon={<Newspaper className="h-7 w-7 text-white" />}
                title="Latest News - D"
                description="News feed block"
                gradient="bg-gradient-to-br from-sky-500 to-sky-400"
                borderColor="border-sky-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('news-list')}
                icon={<List className="h-7 w-7 text-white" />}
                title="News List - P"
                description="Filterable news"
                gradient="bg-gradient-to-br from-fuchsia-500 to-fuchsia-400"
                borderColor="border-fuchsia-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('events')}
                icon={<Calendar className="h-7 w-7 text-white" />}
                title="Events - R"
                description="Event listings"
                gradient="bg-gradient-to-br from-green-500 to-green-400"
                borderColor="border-green-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('product-list')}
                icon={<Target className="h-7 w-7 text-white" />}
                title="Product List - S"
                description="Product catalog"
                gradient="bg-gradient-to-br from-cyan-500 to-cyan-400"
                borderColor="border-cyan-400"
              />
              
              <TemplateCard
                onClick={() => onSelectTemplate('downloads')}
                icon={<Download className="h-7 w-7 text-white" />}
                title="Downloads - T"
                description="Download center with forms"
                gradient="bg-gradient-to-br from-purple-600 to-purple-400"
                borderColor="border-purple-400"
              />
              
              <TemplateCard
                onClick={() => !hasMiniFooter && onSelectTemplate('mini-footer')}
                icon={<PanelBottom className="h-7 w-7 text-white" />}
                title="Mini Footer - U"
                description="Minimal footer (replaces full footer)"
                gradient="bg-gradient-to-br from-gray-600 to-gray-400"
                borderColor="border-gray-500"
                disabled={hasMiniFooter}
                disabledLabel={hasMiniFooter ? "Already active" : undefined}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}