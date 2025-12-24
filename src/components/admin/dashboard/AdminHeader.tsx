import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LogOut, Shield, Plus, Eye, Newspaper, Calendar, Target, Download, Book, Layers, Palette, Zap, Copy, User, ChevronDown, Search, Settings, FileText, Database } from "lucide-react";
import { GeminiIcon } from "@/components/GeminiIcon";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CMSPageOverview } from '@/components/admin/CMSPageOverview';
import { DataHubDialog } from '@/components/admin/DataHubDialog';
import { UserManagement } from '@/components/admin/UserManagement';
import { ShortcutEditor, ShortcutBadge } from '@/components/admin/ShortcutEditor';
import { PageInfo } from '@/components/admin/dashboard/pageRegistryUtils';
import { DESIGN_ICON_OPTIONS } from '@/components/admin/dashboard/AdminConstants';
import { LucideIcon } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Collapsible Section Component for grouped buttons
interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  colorClass?: string;
}

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, colorClass = "bg-gray-800" }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <button
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${colorClass} text-white font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{title}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 pb-1 px-2">
        <div className="flex flex-wrap gap-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface AdminHeaderProps {
  isAdmin: boolean;
  isEditor: boolean;
  allowedPages: string[];
  showUserManagement: boolean;
  setShowUserManagement: (show: boolean) => void;
  handleLogout: () => void;
  selectedPage: string;
  pageInfo: PageInfo | null;
  hasDesignButtons: boolean;
  onAddSegmentClick: () => void;
  onDesignElementClick: () => void;
  onCtaClick: () => void;
  onFlyoutClick: () => void;
  onCreatePageClick: () => void;
  onCopyPageClick: () => void;
  isSEOEditorOpen: boolean;
  setIsSEOEditorOpen: (open: boolean) => void;
  isGlossaryOpen: boolean;
  setIsGlossaryOpen: (open: boolean) => void;
  isContentAutomationOpen?: boolean;
  setIsContentAutomationOpen?: (open: boolean) => void;
  loadPageInfo: () => void;
  currentUser?: SupabaseUser | null;
}

export const AdminHeader = ({
  isAdmin,
  isEditor,
  allowedPages,
  showUserManagement,
  setShowUserManagement,
  handleLogout,
  selectedPage,
  pageInfo,
  hasDesignButtons,
  onAddSegmentClick,
  onDesignElementClick,
  onCtaClick,
  onFlyoutClick,
  onCreatePageClick,
  onCopyPageClick,
  isSEOEditorOpen,
  setIsSEOEditorOpen,
  isGlossaryOpen,
  setIsGlossaryOpen,
  isContentAutomationOpen,
  setIsContentAutomationOpen,
  loadPageInfo,
  currentUser,
}: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const selectedDesignIconOption = pageInfo
    ? DESIGN_ICON_OPTIONS.find((opt) => opt.key === pageInfo.designIcon)
    : undefined;
  const SelectedDesignIcon = selectedDesignIconOption?.Icon;

  const handlePreview = async () => {
    if (!selectedPage) {
      toast.error('Please select a page first');
      return;
    }

    const { data: pageData } = await supabase
      .from('page_registry')
      .select('page_id, page_slug, parent_slug, parent_id')
      .or(`page_slug.eq.${selectedPage},page_slug.ilike.%/${selectedPage}`)
      .order('page_id', { ascending: false })
      .limit(1)
      .maybeSingle();

    let previewUrl = `/${language}/`;
    
    if (pageData?.page_id) {
      previewUrl = `/${language}/${pageData.page_id}`;
    } else {
      const urlMap: Record<string, string> = {
        'photography': `/${language}/your-solution/photography`,
        'scanners-archiving': `/${language}/your-solution/scanners-archiving`,
        'medical-endoscopy': `/${language}/your-solution/medical-endoscopy`,
        'web-camera': `/${language}/your-solution/web-camera`,
        'machine-vision': `/${language}/your-solution/machine-vision`,
        'mobile-phone': `/${language}/your-solution/mobile-phone`,
        'automotive': `/${language}/your-solution/automotive`,
        'in-cabin-testing': `/${language}/your-solution/automotive/in-cabin-testing`,
      };
      previewUrl = urlMap[selectedPage] || `/${language}/your-solution/${selectedPage}`;
    }

    window.open(previewUrl, '_blank');
  };

  return (
    <div className="flex flex-wrap items-start gap-4 mb-8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* Current User Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
              <User className="h-4 w-4 text-gray-600" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 leading-tight">
                  {currentUser?.email || 'Unknown User'}
                </span>
                <span className={`text-xs font-semibold leading-tight ${
                  isAdmin ? 'text-red-600' : isEditor ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {isAdmin ? 'Admin' : isEditor ? 'Editor' : 'User'}
                </span>
              </div>
            </div>
            
            {isAdmin && (
              <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700"
                  >
                    <Shield className="h-4 w-4" />
                    User Management
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[1200px] max-h-[85vh] overflow-y-auto mt-16 bg-white [&>button]:hidden">
                  <DialogHeader className="relative">
                    <button
                      onClick={() => setShowUserManagement(false)}
                      className="absolute -top-2 -right-2 text-gray-500 hover:text-gray-900 transition-colors text-3xl font-light leading-none focus:outline-none"
                      title="Schließen"
                    >
                      ×
                    </button>
                    <DialogTitle className="flex items-center gap-2 text-xl text-gray-900">
                      <Shield className="h-6 w-6 text-red-600" />
                      User Management - Roles & Permissions
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-700">
                      Manage user roles and permissions for the Admin Dashboard
                    </DialogDescription>
                  </DialogHeader>
                  <UserManagement />
                </DialogContent>
              </Dialog>
            )}
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <CMSPageOverview />
          <DataHubDialog />
          
          <Button
            onClick={() => navigate(`/${language}/admin-dashboard`)}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            title="Go to Admin Welcome Page"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Button>
        </div>

        {/* Page Info Display */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg px-5 py-3 flex items-center gap-4 shadow-sm hover:shadow-md mt-4 w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <div className="flex items-center justify-between gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-3 min-w-0 flex-wrap">
              {selectedPage && pageInfo ? (
                <>
                  <span className="font-bold text-base text-gray-900 whitespace-nowrap">
                    {pageInfo.pageTitle}
                  </span>
                  <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-sm font-semibold whitespace-nowrap flex-shrink-0">
                    ID {pageInfo.pageId}
                  </span>
                  <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                  <span className="text-base text-gray-700 font-mono whitespace-nowrap">
                    {pageInfo.pageSlug}
                  </span>
                  {pageInfo.targetPageSlug && (
                    <>
                      <span className="text-gray-400 text-lg whitespace-nowrap flex-shrink-0">|</span>
                      <ShortcutBadge targetSlug={pageInfo.targetPageSlug} />
                    </>
                  )}
                  {pageInfo.ctaGroup && pageInfo.ctaGroup !== 'none' && (
                    <>
                      <span className="text-gray-400 text-lg whitespace-nowrap flex-shrink-0">|</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold flex-shrink-0 ${
                          ['your-solution', 'info-hub', 'training-events', 'test-lab', 'products'].includes(pageInfo.ctaGroup)
                            ? 'bg-[#f9dc24] text-black border-[#f9dc24]'
                            : 'bg-black text-white border-gray-600'
                        }`}
                        title="Navigation CTA active for this page"
                      >
                        CTA
                      </span>
                    </>
                  )}
                  {selectedDesignIconOption && SelectedDesignIcon && hasDesignButtons && (
                    <>
                      <span className="text-gray-400 text-lg whitespace-nowrap flex-shrink-0">|</span>
                      <button
                        type="button"
                        onClick={onFlyoutClick}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold whitespace-nowrap hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 flex-shrink-0"
                        title="Click to edit flyout image and description for this navigation item"
                      >
                        <SelectedDesignIcon className="h-4 w-4" />
                        <span>{selectedDesignIconOption.label}</span>
                      </button>
                    </>
                  )}
                </>
              ) : selectedPage && !pageInfo ? (
                <>
                  <span className="font-bold text-base text-amber-700 whitespace-nowrap">No registry entry</span>
                  <span className="text-gray-400 text-lg whitespace-nowrap">|</span>
                  <span className="text-base text-gray-700 font-mono whitespace-nowrap">{selectedPage}</span>
                </>
              ) : (
                <span className="text-base text-gray-500 italic whitespace-nowrap">No page selected</span>
              )}
            </div>

          </div>
        </div>

        {/* Collapsible Sections for organized button groups */}
        <div className="mt-6 space-y-3">
          {/* 1. Content Management */}
          <CollapsibleSection 
            title="Content Management" 
            icon={Database} 
            colorClass="bg-gradient-to-r from-emerald-600 to-teal-600"
            defaultOpen={false}
          >
            {(isAdmin || allowedPages.includes('news') || allowedPages.includes('__all__')) && (
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 shadow-soft hover:shadow-lg"
                onClick={() => navigate(`/${language}/admin-dashboard/news`)}
              >
                <Newspaper className="h-4 w-4" />
                News
              </Button>
            )}
            {(isAdmin || allowedPages.includes('events') || allowedPages.includes('__all__')) && (
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--events-button))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--events-button))]/90 shadow-soft hover:shadow-lg"
                onClick={() => navigate(`/${language}/admin-dashboard/events`)}
              >
                <Calendar className="h-4 w-4" />
                Events
              </Button>
            )}
            {(isAdmin || allowedPages.includes('products') || allowedPages.includes('__all__')) && (
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--accent-blue))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--accent-blue))]/90 shadow-soft hover:shadow-lg"
                onClick={() => navigate(`/${language}/admin-dashboard/products`)}
              >
                <Target className="h-4 w-4" />
                Products
              </Button>
            )}
            {(isAdmin || allowedPages.includes('downloads') || allowedPages.includes('__all__')) && (
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(180_60%_45%)] text-white hover:bg-[hsl(180_60%_40%)] shadow-soft hover:shadow-lg"
                onClick={() => navigate(`/${language}/admin-dashboard/downloads`)}
              >
                <Download className="h-4 w-4" />
                Downloads
              </Button>
            )}
          </CollapsibleSection>

          {/* 2. Settings */}
          <CollapsibleSection 
            title="Settings" 
            icon={Settings} 
            colorClass="bg-gradient-to-r from-slate-600 to-gray-700"
            defaultOpen={false}
          >
            {isAdmin && (
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700 shadow-soft hover:shadow-lg"
                onClick={() => setIsSEOEditorOpen(!isSEOEditorOpen)}
              >
                <Eye className="h-4 w-4" />
                SEO Settings
              </Button>
            )}
            {(isAdmin || allowedPages.includes('glossary')) && (
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-orange-700 text-white hover:bg-orange-800 shadow-soft hover:shadow-lg"
                onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
              >
                <Book className="h-4 w-4" />
                Glossary
              </Button>
            )}
            {isAdmin && selectedPage && setIsContentAutomationOpen && (
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-soft hover:shadow-lg"
                onClick={() => setIsContentAutomationOpen(!isContentAutomationOpen)}
              >
                <GeminiIcon className="h-4 w-4" />
                Content Automation
              </Button>
            )}
          </CollapsibleSection>

          {/* 3. Page Actions */}
          {selectedPage && pageInfo && (
            <CollapsibleSection 
              title="Page Actions" 
              icon={Layers} 
              colorClass="bg-sky-500"
              defaultOpen={false}
            >
              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--admin-control-1))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--admin-control-1))]/90 shadow-soft hover:shadow-lg"
                onClick={onAddSegmentClick}
              >
                <Layers className="h-4 w-4" />
                Add Segment
              </Button>

              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--admin-control-2))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--admin-control-2))]/90 shadow-soft hover:shadow-lg"
                disabled={!hasDesignButtons}
                title={!hasDesignButtons ? 'Design elements are only available for second and third-level navigation pages' : undefined}
                onClick={onDesignElementClick}
              >
                <Palette className="h-4 w-4" />
                Navigation Design
              </Button>

              <Button
                variant="decision"
                className="flex items-center gap-2 bg-[hsl(var(--admin-control-3))] text-[hsl(var(--orange-foreground))] hover:bg-[hsl(var(--admin-control-3))]/90 shadow-soft hover:shadow-lg"
                disabled={!hasDesignButtons}
                title={!hasDesignButtons ? 'Navigation CTAs are only available for second and third-level navigation pages' : undefined}
                onClick={onCtaClick}
              >
                <Zap className="h-4 w-4" />
                Navigation CTA
              </Button>

              <ShortcutEditor
                pageId={pageInfo.pageId}
                pageSlug={pageInfo.pageSlug}
                pageTitle={pageInfo.pageTitle}
                currentTargetSlug={pageInfo.targetPageSlug || null}
                onShortcutUpdated={loadPageInfo}
              />
            </CollapsibleSection>
          )}

          {/* 4. Page Tools */}
          <CollapsibleSection 
            title="Page Tools" 
            icon={FileText} 
            colorClass="bg-blue-700"
            defaultOpen={false}
          >
            <Button
              variant="default"
              onClick={handlePreview}
              className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 shadow-soft hover:shadow-lg"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            
            <Button
              onClick={onCreatePageClick}
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-soft hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Page
            </Button>
            
            {selectedPage && pageInfo && (
              <Button
                onClick={onCopyPageClick}
                className="bg-rose-600 text-white hover:bg-rose-700 font-semibold shadow-soft hover:shadow-lg flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Page
              </Button>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
