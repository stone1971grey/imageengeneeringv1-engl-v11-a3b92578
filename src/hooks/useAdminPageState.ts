import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { ImageMetadata } from "@/types/imageMetadata";

export interface PageInfo {
  pageId: number;
  pageTitle: string;
  pageSlug: string;
  parentSlug?: string | null;
  designIcon?: string | null;
  flyoutImageUrl?: string | null;
  flyoutDescription?: string | null;
  ctaGroup?: string | null;
  ctaLabel?: string | null;
  ctaIcon?: string | null;
  targetPageSlug?: string | null;
}

export interface PageSegment {
  id: string;
  type: string;
  data?: any;
}

export const useAdminPageState = (user: User | null, isAdmin: boolean, isEditor: boolean) => {
  const location = useLocation();
  
  // Get selected page from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const selectedPage = searchParams.get('page') || '';
  
  const [resolvedPageSlug, setResolvedPageSlug] = useState<string>('');
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [pageSegments, setPageSegments] = useState<PageSegment[]>([]);
  const [segmentRegistry, setSegmentRegistry] = useState<Record<string, number>>({});
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [activeTab, setActiveTabState] = useState<string>("");
  const [nextSegmentId, setNextSegmentId] = useState<number>(5);
  const [content, setContent] = useState<Record<string, string>>({});
  const [editorLanguage, setEditorLanguage] = useState<'en' | 'de' | 'ja' | 'ko' | 'zh'>('en');
  const [availablePages, setAvailablePages] = useState<Array<{ page_slug: string; page_title: string }>>([]);
  
  // Hero state
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImageMetadata, setHeroImageMetadata] = useState<ImageMetadata | null>(null);
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  
  // Tiles/Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [tilesColumns, setTilesColumns] = useState<string>("3");
  
  // Banner state
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerSubtext, setBannerSubtext] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [bannerButtonText, setBannerButtonText] = useState<string>("");
  const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
  const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
  
  // Solutions state
  const [solutionsTitle, setSolutionsTitle] = useState<string>("");
  const [solutionsSubtext, setSolutionsSubtext] = useState<string>("");
  const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col");
  const [solutionsItems, setSolutionsItems] = useState<any[]>([]);
  
  // Footer state
  const [footerCtaTitle, setFooterCtaTitle] = useState<string>("");
  const [footerCtaDescription, setFooterCtaDescription] = useState<string>("");
  const [footerContactHeadline, setFooterContactHeadline] = useState<string>("");
  const [footerContactSubline, setFooterContactSubline] = useState<string>("");
  const [footerContactDescription, setFooterContactDescription] = useState<string>("");
  const [footerTeamImageUrl, setFooterTeamImageUrl] = useState<string>("");
  const [footerTeamImageMetadata, setFooterTeamImageMetadata] = useState<ImageMetadata | null>(null);
  const [footerTeamQuote, setFooterTeamQuote] = useState<string>("");
  const [footerTeamName, setFooterTeamName] = useState<string>("");
  const [footerTeamTitle, setFooterTeamTitle] = useState<string>("");
  const [footerButtonText, setFooterButtonText] = useState<string>("");
  
  // SEO state
  const [seoData, setSeoData] = useState<any>({
    title: '',
    metaDescription: '',
    slug: selectedPage,
    canonical: '',
    robotsIndex: 'index',
    robotsFollow: 'follow',
    focusKeyword: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image'
  });
  
  // Flyout state
  const [flyoutImageUrl, setFlyoutImageUrl] = useState<string | null>(null);
  const [flyoutDescriptionTranslations, setFlyoutDescriptionTranslations] = useState<Record<string, string>>({});
  
  // CTA state
  const [ctaGroup, setCtaGroup] = useState<string>('none');
  const [ctaLabel, setCtaLabel] = useState<string>('');
  const [ctaIcon, setCtaIcon] = useState<string>('auto');
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Wrapper to persist activeTab to sessionStorage
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const pageKey = selectedPage || 'index';
    if (tab) {
      sessionStorage.setItem(`admin-activeTab-${pageKey}`, tab);
      console.log("[useAdminPageState] Saved activeTab:", tab, "for page:", pageKey);
    }
  };
  
  // Restore activeTab from sessionStorage on page load
  useEffect(() => {
    const pageKey = selectedPage || 'index';
    if (tabOrder.length > 0) {
      const savedTab = sessionStorage.getItem(`admin-activeTab-${pageKey}`);
      console.log("[useAdminPageState] Restore check - pageKey:", pageKey, "savedTab:", savedTab, "currentActiveTab:", activeTab);
      if (savedTab && tabOrder.includes(savedTab)) {
        console.log("[useAdminPageState] Restoring tab from sessionStorage:", savedTab);
        setActiveTabState(savedTab);
      }
    }
  }, [selectedPage, tabOrder]);

  // Helper function to resolve non-hierarchical slug to full hierarchical slug
  const resolvePageSlug = async (slug: string): Promise<string> => {
    if (!slug) return slug;
    
    const { data: exactMatch } = await supabase
      .from('page_registry')
      .select('page_slug')
      .eq('page_slug', slug)
      .maybeSingle();
    
    if (exactMatch) {
      console.log(`🔍 Exact match for slug "${slug}"`);
      setResolvedPageSlug(exactMatch.page_slug);
      return exactMatch.page_slug;
    }
    
    const { data: hierarchicalMatches } = await supabase
      .from('page_registry')
      .select('page_slug')
      .ilike('page_slug', `%/${slug}`)
      .limit(1);
    
    const hierarchicalMatch = hierarchicalMatches?.[0] || null;
    
    if (hierarchicalMatch) {
      console.log(`🔍 Resolved slug "${slug}" to "${hierarchicalMatch.page_slug}"`);
      setResolvedPageSlug(hierarchicalMatch.page_slug);
      return hierarchicalMatch.page_slug;
    }
    
    console.log(`⚠️ No match found for slug "${slug}"`);
    setResolvedPageSlug(slug);
    return slug;
  };

  // Reset all state when changing pages
  const resetPageState = () => {
    setHeroImageUrl("");
    setHeroImageMetadata(null);
    setHeroImagePosition("right");
    setHeroLayout("2-5");
    setHeroTopPadding("medium");
    setHeroCtaLink("#applications-start");
    setHeroCtaStyle("standard");
    setBannerTitle("");
    setBannerSubtext("");
    setBannerImages([]);
    setBannerButtonText("");
    setBannerButtonLink("");
    setBannerButtonStyle("standard");
    setSolutionsTitle("");
    setSolutionsSubtext("");
    setSolutionsLayout("2-col");
    setSolutionsItems([]);
    setApplications([]);
    setTilesColumns("3");
    setPageSegments([]);
    setTabOrder([]);
    setSegmentRegistry({});
    setFooterCtaTitle("");
    setFooterCtaDescription("");
    setFooterContactHeadline("");
    setFooterContactSubline("");
    setFooterContactDescription("");
    setFooterTeamImageUrl("");
    setFooterTeamQuote("");
    setFooterTeamName("");
    setFooterTeamTitle("");
    setFooterButtonText("");
    setContent({});
    setSeoData({
      title: '',
      metaDescription: '',
      slug: selectedPage,
      canonical: '',
      robotsIndex: 'index',
      robotsFollow: 'follow',
      focusKeyword: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterCard: 'summary_large_image'
    });
  };

  return {
    // Page selection
    selectedPage,
    resolvedPageSlug,
    setResolvedPageSlug,
    pageInfo,
    setPageInfo,
    availablePages,
    setAvailablePages,
    
    // Segments
    pageSegments,
    setPageSegments,
    segmentRegistry,
    setSegmentRegistry,
    tabOrder,
    setTabOrder,
    activeTab,
    setActiveTab,
    nextSegmentId,
    setNextSegmentId,
    
    // Content
    content,
    setContent,
    editorLanguage,
    setEditorLanguage,
    
    // Hero
    heroImageUrl,
    setHeroImageUrl,
    heroImageMetadata,
    setHeroImageMetadata,
    heroImagePosition,
    setHeroImagePosition,
    heroLayout,
    setHeroLayout,
    heroTopPadding,
    setHeroTopPadding,
    heroCtaLink,
    setHeroCtaLink,
    heroCtaStyle,
    setHeroCtaStyle,
    
    // Tiles
    applications,
    setApplications,
    tilesColumns,
    setTilesColumns,
    
    // Banner
    bannerTitle,
    setBannerTitle,
    bannerSubtext,
    setBannerSubtext,
    bannerImages,
    setBannerImages,
    bannerButtonText,
    setBannerButtonText,
    bannerButtonLink,
    setBannerButtonLink,
    bannerButtonStyle,
    setBannerButtonStyle,
    
    // Solutions
    solutionsTitle,
    setSolutionsTitle,
    solutionsSubtext,
    setSolutionsSubtext,
    solutionsLayout,
    setSolutionsLayout,
    solutionsItems,
    setSolutionsItems,
    
    // Footer
    footerCtaTitle,
    setFooterCtaTitle,
    footerCtaDescription,
    setFooterCtaDescription,
    footerContactHeadline,
    setFooterContactHeadline,
    footerContactSubline,
    setFooterContactSubline,
    footerContactDescription,
    setFooterContactDescription,
    footerTeamImageUrl,
    setFooterTeamImageUrl,
    footerTeamImageMetadata,
    setFooterTeamImageMetadata,
    footerTeamQuote,
    setFooterTeamQuote,
    footerTeamName,
    setFooterTeamName,
    footerTeamTitle,
    setFooterTeamTitle,
    footerButtonText,
    setFooterButtonText,
    
    // SEO
    seoData,
    setSeoData,
    
    // Flyout
    flyoutImageUrl,
    setFlyoutImageUrl,
    flyoutDescriptionTranslations,
    setFlyoutDescriptionTranslations,
    
    // CTA
    ctaGroup,
    setCtaGroup,
    ctaLabel,
    setCtaLabel,
    ctaIcon,
    setCtaIcon,
    
    // UI
    saving,
    setSaving,
    uploading,
    setUploading,
    
    // Helpers
    resolvePageSlug,
    resetPageState
  };
};
