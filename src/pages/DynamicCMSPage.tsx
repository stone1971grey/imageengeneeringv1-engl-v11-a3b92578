import { useState, useEffect, useCallback, useRef, Component, ErrorInfo, ReactNode } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, Lightbulb, Monitor, Settings, Hash } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MiniFooter from "@/components/MiniFooter";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import { Video } from "@/components/segments/Video";
import Specification from "@/components/segments/Specification";
import FullHero from "@/components/segments/FullHero";
import Intro from "@/components/segments/Intro";
import IndustriesSegment from "@/components/segments/IndustriesSegment";
import NewsSegment from "@/components/segments/NewsSegment";
import NewsListSegment from "@/components/segments/NewsListSegment";
import Debug from "@/components/segments/Debug";
import ActionHero from "@/components/segments/ActionHero";
import EventsSegment from "@/components/segments/EventsSegment";
import ProductListSegment from "@/components/segments/ProductListSegment";
import DownloadsSegment from "@/components/segments/DownloadsSegment";
import Tiles from "@/components/segments/Tiles";
import ImageTextSegment from "@/components/segments/ImageTextSegment";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { extractFilePathFromUrl } from "@/utils/updateSegmentMapping";

import { FrontendEditProvider } from "@/contexts/FrontendEditContext";
import { EditModeToggle, EditableSegment } from "@/components/frontend-edit";

// Error Boundary to catch React crashes and prevent black screens
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PageErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DynamicCMSPage] Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              An error occurred while rendering this page.
            </p>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-6 font-mono">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#f9dc24] text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const iconMap: Record<string, any> = {
  FileText,
  Download,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Car,
  Smartphone,
  Heart,
  CheckCircle,
  Lightbulb,
  Monitor,
};

const DynamicCMSPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});
  const [pageNotFound, setPageNotFound] = useState(false);
  const [fullHeroOverrides, setFullHeroOverrides] = useState<Record<string, any>>({});
  const [childPages, setChildPages] = useState<any[]>([]);
  const [isDraftPage, setIsDraftPage] = useState(false);
  const [pageId, setPageId] = useState<number | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | null>(null);
  // Refresh counter to force re-render after frontend editing save
  const [refreshCounter, setRefreshCounter] = useState(0);
  // Content metadata for frontend editing (content_status, import_stage per segment)
  const [segmentContentMeta, setSegmentContentMeta] = useState<Record<string, { 
    content_status: 'draft' | 'pending' | 'approved'; 
    import_stage: number;
  }>>({});
  // Current visible segment info for dynamic toolbar display
  const [currentVisibleSegment, setCurrentVisibleSegment] = useState<{ id: number; type: string } | null>(null);
  const segmentRefs = useRef<Map<number, { element: HTMLElement; type: string }>>(new Map());
  
  // Debug mode aktivieren mit ?debug=true in der URL
  const isDebugMode = new URLSearchParams(location.search).get('debug') === 'true';

  // Extract page_slug from full URL pathname (hierarchical)
  // Examples with language prefix:
  // /en/your-solution/photography -> your-solution/photography
  // /de/your-solution/scanners-archiving/iso-21550 -> your-solution/scanners-archiving/iso-21550
  const extractPageSlug = (pathname: string): string => {
    // Remove leading slash, split into parts
    const parts = pathname.replace(/^\/+/, "").split('/');
    
    // Check if first part is a language code
    const validLanguages = ['en', 'de', 'zh', 'ja', 'ko'];
    if (validLanguages.includes(parts[0])) {
      // Remove language prefix and rejoin
      const slug = parts.slice(1).join('/');
      // If empty (homepage), return 'index'
      return slug || 'index';
    }
    
    // No language prefix, return as is (or 'index' if empty)
    const slug = parts.join('/');
    return slug || 'index';
  };

  // Format segment type name for display (e.g., "product-hero-gallery" -> "Product Hero Gallery")
  const formatSegmentTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      'product-hero-gallery': 'Product Hero Gallery',
      'product-hero': 'Product Hero',
      'full-hero': 'Full Hero',
      'action-hero': 'Action Hero',
      'intro': 'Intro',
      'tiles': 'Tiles',
      'banner': 'Banner',
      
      'image-text': 'Image & Text',
      'video': 'Video',
      'feature-overview': 'Feature Overview',
      'table': 'Table',
      'faq': 'FAQ',
      'specification': 'Specification',
      'industries': 'Industries',
      'news': 'News',
      'news-list': 'News List',
      'events': 'Events',
      'product-list': 'Product List',
      'downloads': 'Downloads',
      'meta-navigation': 'Meta Navigation',
      'footer': 'Footer',
      'mini-footer': 'Mini Footer',
      'debug': 'Debug',
    };
    return typeMap[type] || type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const pageSlug = extractPageSlug(location.pathname);
  
  // Extract language from URL for dependency tracking
  const pathParts = location.pathname.replace(/^\/+/, "").split('/');
  const validLanguages = ['en', 'de', 'zh', 'ja', 'ko'];
  const currentUrlLanguage = validLanguages.includes(pathParts[0]) ? pathParts[0] : 'en';
  
  // Special handling for Hub pages (e.g., styleguide, styleguide/segments)
  const isHubPage = pageSlug === 'styleguide' || pageSlug === 'styleguide/segments';
  
  // Styleguide-Segmentseiten: spezielle Umrandung für alle Segmente anzeigen
  const isSegmentStyleguidePage = pageSlug.startsWith('styleguide/segments') || pageSlug.startsWith('styleguide/segmants');

  // Load child pages for hub pages
  useEffect(() => {
    if (isHubPage) {
      const loadChildPages = async () => {
        const { data } = await supabase
          .from("page_registry")
          .select("*")
          .eq("parent_slug", pageSlug)
          .order("position", { ascending: true });
        
        if (data) {
          setChildPages(data);
        }
      };
      loadChildPages();
    }
  }, [isHubPage, pageSlug]);

  // Scroll handler to track which segment is currently visible
  const updateVisibleSegment = useCallback(() => {
    const viewportTop = window.scrollY + 150; // Account for toolbar
    const viewportCenter = viewportTop + window.innerHeight / 3;
    
    let closestSegment: { id: number; type: string; distance: number } | null = null;
    
    segmentRefs.current.forEach((data, segmentId) => {
      const rect = data.element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementCenter = elementTop + rect.height / 2;
      const distance = Math.abs(viewportCenter - elementCenter);
      
      if (!closestSegment || distance < closestSegment.distance) {
        closestSegment = { id: segmentId, type: data.type, distance };
      }
    });
    
    if (closestSegment) {
      setCurrentVisibleSegment({ id: closestSegment.id, type: closestSegment.type });
    }
  }, []);

  // Set up scroll listener for segment tracking
  // Must depend on loading and pageSegments to ensure refs are registered after content loads
  useEffect(() => {
    if (currentUser && userRole && !loading && pageSegments.length > 0) {
      window.addEventListener('scroll', updateVisibleSegment, { passive: true });
      // Initial check after a short delay to ensure refs are registered
      const timeoutId = setTimeout(() => {
        updateVisibleSegment();
      }, 100);
      
      return () => {
        window.removeEventListener('scroll', updateVisibleSegment);
        clearTimeout(timeoutId);
      };
    }
  }, [currentUser, userRole, updateVisibleSegment, loading, pageSegments.length]);

  // SIMPLIFIED: Load auth state WITHOUT blocking content loading
  // Auth is only needed for draft access and edit mode
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      console.log('[DynamicCMSPage] Checking auth (non-blocking)...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          // Check roles in parallel
          const [adminResult, editorResult] = await Promise.all([
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "admin")
              .maybeSingle(),
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .eq("role", "editor")
              .maybeSingle()
          ]);
          
          if (!isMounted) return;
          
          if (adminResult.data) {
            setUserRole('admin');
          } else if (editorResult.data) {
            setUserRole('editor');
          }
        }
      } catch (error) {
        console.warn('[DynamicCMSPage] Auth check failed (non-critical):', error);
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };
    
    checkAuth();
    
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (isMounted) {
        setCurrentUser(session?.user ?? null);
        if (!session?.user) {
          setUserRole(null);
        }
      }
    });
    
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // CRITICAL FIX: Load content IMMEDIATELY without waiting for auth
  // Draft access is checked AFTER content is loaded
  useEffect(() => {
    if (pageSlug) {
      loadContent();
    }
  }, [pageSlug, currentUrlLanguage]);

  const loadContent = async () => {
    console.log('[DynamicCMSPage] loadContent started for:', pageSlug, 'language:', currentUrlLanguage);
    
    // CRITICAL: Use try-finally to ALWAYS set loading to false
    try {
      if (!pageSlug) {
        console.log('[DynamicCMSPage] No pageSlug, setting pageNotFound');
        setPageNotFound(true);
        return;
      }

      // Extract language from URL
      const pathParts = location.pathname.replace(/^\/+/, "").split('/');
      const validLanguages = ['en', 'de', 'zh', 'ja', 'ko'];
      const urlLanguage = validLanguages.includes(pathParts[0]) ? pathParts[0] : 'en';

      // Check if page exists in page_registry and if it's a shortcut
      const { data: pageData, error: pageError } = await supabase
        .from("page_registry")
        .select("page_slug, target_page_slug, status, page_id")
        .eq("page_slug", pageSlug)
        .maybeSingle();

      if (pageError) {
        console.error('[DynamicCMSPage] Error fetching page_registry:', pageError);
        return;
      }

      if (!pageData) {
        console.warn(`[DynamicCMSPage] page_registry entry not found for slug: ${pageSlug} – rendering as empty CMS page`);
        return;
      }

      // CRITICAL FIX: For draft pages, DON'T block content loading
      if (pageData.status === 'draft') {
        setIsDraftPage(true);
        console.log(`[DynamicCMSPage] Draft page ${pageSlug} detected - will check access after auth`);
      } else {
        setIsDraftPage(false);
        setAccessDenied(false);
      }
      
      // Store page_id for toolbar display
      if (pageData.page_id) {
        setPageId(pageData.page_id);
      }

      // If this page is a shortcut, redirect to the target page
      if (pageData.target_page_slug) {
        console.log(`[DynamicCMSPage] Page ${pageSlug} is a shortcut, redirecting to ${pageData.target_page_slug}`);
        navigate(`/${urlLanguage}/${pageData.target_page_slug}`, { replace: true });
        return; // Loading will be set to false in finally block
      }

      // Try to load content in requested language first
      let { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("language", urlLanguage);

    // Fallback to English if no content found in requested language
    if (!data || data.length === 0) {
      console.log(`[DynamicCMSPage] No content found for ${pageSlug} in ${urlLanguage}, falling back to English`);
      const fallback = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("language", 'en');
      
      data = fallback.data;
      error = fallback.error;
    }

    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("deleted", false);

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      let loadedSegments: any[] = [];
      let loadedTabOrder: string[] = [];
      const fullHeroOverridesLocal: Record<string, any> = {};
      const introLegacyMap: Record<string, { title?: string; description?: string }> = {};
      const industriesOverrideMap: Record<string, any> = {};
      
      const parseContentRows = (rows: any[] | null | undefined) => {
        let segments: any[] = [];
        let tabs: string[] = [];
        const localIntroLegacyMap: Record<string, { title?: string; description?: string }> = {};
        const localIndustriesOverrideMap: Record<string, any> = {};
        const segmentDataMap: Record<string, any> = {}; // Map segment_key -> data für alle Segmente
        // Track content status metadata for frontend editing
        const contentMetaMap: Record<string, { content_status: 'draft' | 'pending' | 'approved'; import_stage: number }> = {};

        (rows || []).forEach((item: any) => {
          // Extract content metadata for all rows
          const sectionKey = item.section_key;
          if (sectionKey && !['page_segments', 'tab_order', 'seo'].includes(sectionKey)) {
            contentMetaMap[sectionKey] = {
              content_status: (item.content_status as 'draft' | 'pending' | 'approved') || 'approved',
              import_stage: item.import_stage || 1
            };
          }
          
          if (item.section_key === "page_segments") {
            try {
              segments = JSON.parse(item.content_value || "[]");
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing page_segments:', e);
            }
          } else if (item.section_key === "tab_order") {
            try {
              tabs = JSON.parse(item.content_value || "[]");
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing tab_order:', e);
            }
          } else if (item.section_key === "seo") {
            try {
              setSeoData(JSON.parse(item.content_value || '{}'));
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing SEO data:', e);
            }
          } else if (item.section_key.startsWith('full_hero_')) {
            try {
              const heroData = JSON.parse(item.content_value || '{}');
              const segmentIdFromKey = item.section_key.split('full_hero_')[1];
              if (segmentIdFromKey) {
                fullHeroOverridesLocal[segmentIdFromKey] = heroData;
              }
            } catch (e) {
              console.error('[DynamicCMSPage] Error parsing full_hero override:', e);
            }
          } else {
            // Numerische section_keys für Segment-Daten
            const isNumericKey = /^\d+$/.test(item.section_key);
            // Keys im Format {type}-{id} wie 'downloads-507', 'events-123', 'product-list-456'
            const typedKeyMatch = item.section_key.match(/^([a-z-]+)-(\d+)$/);
            // Keys im Format {segmentId}_{fieldName} wie '497_title', '497_backgroundImage'
            const fieldKeyMatch = item.section_key.match(/^(\d+)_(\w+)$/);
            
            if (isNumericKey) {
              try {
                const parsed = JSON.parse(item.content_value || '{}');
                // Alle numerischen Keys als Segment-Daten speichern
                segmentDataMap[item.section_key] = parsed;
                
                // Legacy Intro: headingLevel-Feld vorhanden
                if (parsed && typeof parsed === 'object' && 'headingLevel' in parsed) {
                  localIntroLegacyMap[item.section_key] = {
                    title: parsed.title,
                    description: parsed.description,
                  };
                } else if (item.content_type === 'industries') {
                  // Industries-Overrides pro Sprache
                  localIndustriesOverrideMap[item.section_key] = parsed;
                }
              } catch (e) {
                console.error('[DynamicCMSPage] Error parsing numeric section content:', e);
              }
            } else if (typedKeyMatch) {
              // Keys wie 'downloads-507' -> speichere unter der numerischen ID UND dem vollen Key
              const segmentId = typedKeyMatch[2];
              try {
                const parsed = JSON.parse(item.content_value || '{}');
                segmentDataMap[segmentId] = parsed;
                segmentDataMap[item.section_key] = parsed;
              } catch (e) {
                console.error('[DynamicCMSPage] Error parsing typed section content:', e);
              }
            } else if (fieldKeyMatch) {
              // Keys wie '497_title', '497_backgroundImage' -> zusammenführen zu Segment-Daten
              const segmentId = fieldKeyMatch[1];
              const fieldName = fieldKeyMatch[2];
              
              if (!segmentDataMap[segmentId]) {
                segmentDataMap[segmentId] = {};
              }
              
              // Mapping: subtitle -> description für ActionHero Kompatibilität
              const mappedFieldName = fieldName === 'subtitle' ? 'description' : fieldName;
              segmentDataMap[segmentId][mappedFieldName] = item.content_value;
            }
          }
        });

        // Segment-Daten aus page_segments haben VORRANG
        // {id}_{field} Keys dienen nur als Fallback für fehlende Felder
        segments = segments.map((seg: any) => {
          const key = String(seg.id || seg.segment_key);
          
          // page_segments Daten haben Vorrang, {id}_{field} Keys nur als Fallback
          if (segmentDataMap[key]) {
            // Filtere leere Strings aus segmentDataMap heraus
            const fallbackData: Record<string, any> = {};
            Object.entries(segmentDataMap[key]).forEach(([k, v]) => {
              if (v !== '' && v !== null && v !== undefined) {
                fallbackData[k] = v;
              }
            });
            
            return {
              ...seg,
              data: {
                ...fallbackData, // Fallback-Daten aus {id}_{field} Keys
                ...(seg.data || {}), // page_segments Daten haben VORRANG
              },
            };
          }
          return seg;
        });

        return { segments, tabs, localIntroLegacyMap, localIndustriesOverrideMap, contentMetaMap };
      };

      // Zuerst versuchen, die Inhalte der gewünschten Sprache zu verwenden
      let { segments, tabs, localIntroLegacyMap, localIndustriesOverrideMap, contentMetaMap } = parseContentRows(data);
      
      // Store content metadata for frontend editing
      let mergedContentMeta = { ...contentMetaMap };

      // Wenn für die gewünschte Sprache keine gültigen Segmente gefunden wurden,
      // auf Englisch zurückfallen (wichtig für Fälle mit kaputtem JSON in der Zielsprache)
      // ABER: Sprachspezifische Inhalte aus section_keys der Zielsprache beibehalten
      let targetLanguageSegmentData: Record<string, any> = {};
      
      // Extrahiere sprachspezifische Segment-Daten aus den geladenen Rows
      (data || []).forEach((item: any) => {
        const isNumericKey = /^\d+$/.test(item.section_key);
        if (isNumericKey) {
          try {
            targetLanguageSegmentData[item.section_key] = JSON.parse(item.content_value || '{}');
          } catch (e) {
            console.error('[DynamicCMSPage] Error parsing segment data:', e);
          }
        }
      });
      
      if ((!segments || segments.length === 0) && urlLanguage !== 'en') {
        console.warn(`[DynamicCMSPage] No valid segments for ${pageSlug} in ${urlLanguage}, falling back to English segments`);
        const { data: fallbackRows, error: fallbackErr } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("language", 'en');

        if (!fallbackErr) {
          const fallbackParsed = parseContentRows(fallbackRows || []);
          segments = fallbackParsed.segments;
          tabs = fallbackParsed.tabs;
          localIntroLegacyMap = fallbackParsed.localIntroLegacyMap;
          localIndustriesOverrideMap = fallbackParsed.localIndustriesOverrideMap;
          // Merge content metadata from fallback
          mergedContentMeta = { ...mergedContentMeta, ...fallbackParsed.contentMetaMap };
          
          // WICHTIG: Sprachspezifische Inhalte auf englische Segment-Struktur anwenden
          segments = segments.map((seg: any) => {
            const key = String(seg.id || seg.segment_key);
            if (targetLanguageSegmentData[key]) {
              return {
                ...seg,
                data: {
                  ...(seg.data || {}),
                  ...targetLanguageSegmentData[key],
                },
              };
            }
            return seg;
          });
        }
      }

      loadedSegments = segments;
      loadedTabOrder = tabs;
      Object.assign(introLegacyMap, localIntroLegacyMap);
      Object.assign(industriesOverrideMap, localIndustriesOverrideMap);

      setFullHeroOverrides(fullHeroOverridesLocal);

      // Für Nicht-Englisch-Sprachen: Bild- und Layout-Fallback von EN für Banner-Segmente
      // und Verwendung der EN-Tab-Reihenfolge als Master für alle Sprachen
      let englishSegmentsForFallback: any[] = [];
      if (urlLanguage !== 'en') {
        const { data: enRows, error: enError } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("language", 'en');

        if (!enError && enRows) {
          const parsedEn = parseContentRows(enRows || []);
          englishSegmentsForFallback = parsedEn.segments || [];

          // Wichtig: Tab-Reihenfolge immer von EN übernehmen,
          // damit neue Segmente (z.B. Full Hero) in allen Sprachen sichtbar sind.
          if (parsedEn.tabs && parsedEn.tabs.length > 0) {
            loadedTabOrder = parsedEn.tabs;
          }
        }
      }

      // Intro-/Industries-Segmente mit Overrides anreichern (nur als Fallback, wenn page_segments keine Daten hat)
      // + Banner-Fallback anwenden
      const enhancedSegments = Array.isArray(loadedSegments)
        ? loadedSegments.map((seg: any) => {
            const type = String(seg.type || '').toLowerCase();
            const key = seg.id ?? seg.segment_key;
            const hasExistingData = seg.data && Object.keys(seg.data).length > 0;

            // Intro: Legacy-Daten nur als Fallback nutzen
            if (type === 'intro') {
              const legacy = key ? introLegacyMap[String(key)] : undefined;
              if (legacy && !hasExistingData) {
                return {
                  ...seg,
                  data: legacy,
                };
              }
            }

            // Industries: Override-Daten nur als Fallback nutzen
            if (type === 'industries') {
              const override = key ? industriesOverrideMap[String(key)] : undefined;
              if (override && !hasExistingData) {
                return {
                  ...seg,
                  data: override,
                };
              }
            }

            // Banner: Bilder & Layout aus EN übernehmen, wenn in Zielsprache leer
            if (type === 'banner' && urlLanguage !== 'en') {
              const enMatch = englishSegmentsForFallback.find((enSeg: any) => {
                const enKey = enSeg.id ?? enSeg.segment_key;
                return (
                  String(enSeg.type || '').toLowerCase() === type &&
                  String(enKey) === String(key)
                );
              });

              if (enMatch?.data) {
                const hasImages = Array.isArray(seg.data?.images) && seg.data.images.length > 0;
                const enHasImages = Array.isArray(enMatch.data.images) && enMatch.data.images.length > 0;

                if (!hasImages && enHasImages) {
                  return {
                    ...seg,
                    data: {
                      // Layout & Bilder aus EN, Texte aus Zielsprache
                      ...enMatch.data,
                      ...seg.data,
                      images: enMatch.data.images,
                    },
                  };
                }
              }
            }

            return seg;
          })
        : loadedSegments;
      // CRITICAL FIX: Ensure segments from tab_order exist in pageSegments
      // If a segment is in tab_order but not in enhancedSegments, create it from segment_registry
      let finalSegments = [...enhancedSegments];
      
      if (segmentData && loadedTabOrder.length > 0) {
        loadedTabOrder.forEach((tabId: string) => {
          // Check if this tab_order entry exists in enhancedSegments
          const exists = finalSegments.some(seg => 
            String(seg.id) === String(tabId) || 
            String(seg.segment_key) === String(tabId)
          );
          
          if (!exists) {
            // Find matching segment in segment_registry
            const registryEntry = segmentData.find((reg: any) => 
              reg.segment_key === tabId || 
              String(reg.segment_id) === String(tabId).replace(/^[a-z-]+-/i, '')
            );
            
            if (registryEntry) {
              // Create segment from registry
              const segmentDataForKey = data?.find((d: any) => d.section_key === tabId);
              let parsedData = {};
              if (segmentDataForKey) {
                try {
                  parsedData = JSON.parse(segmentDataForKey.content_value || '{}');
                } catch (e) {
                  console.warn('[DynamicCMSPage] Could not parse segment data for', tabId);
                }
              }
              
              console.log('[DynamicCMSPage] Creating missing segment from registry:', {
                tabId,
                registryEntry,
                parsedData
              });
              
              finalSegments.push({
                id: registryEntry.segment_key,
                segment_key: registryEntry.segment_key,
                type: registryEntry.segment_type,
                segmentId: registryEntry.segment_id,
                position: registryEntry.position,
                data: parsedData
              });
            }
          }
        });
      }

      // Enrich segments with alt texts from file_segment_mappings
      // This ensures alt texts updated in Media Management are reflected in segments
      const enrichSegmentsWithAltTexts = async (segments: any[], language: string): Promise<any[]> => {
        // Collect all image URLs from segments
        const imageUrls: string[] = [];
        const collectImageUrls = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (Array.isArray(obj)) {
            obj.forEach(item => collectImageUrls(item));
            return;
          }
          // Check for image URL fields
          if (obj.imageUrl && typeof obj.imageUrl === 'string') {
            imageUrls.push(obj.imageUrl);
          }
          if (obj.url && typeof obj.url === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.url)) {
            imageUrls.push(obj.url);
          }
          // Recursively check nested objects
          Object.values(obj).forEach(val => collectImageUrls(val));
        };
        
        segments.forEach(seg => collectImageUrls(seg.data));
        
        if (imageUrls.length === 0) return segments;
        
        // Extract file paths from URLs
        const filePaths = imageUrls
          .map(url => extractFilePathFromUrl(url))
          .filter((path): path is string => path !== null);
        
        if (filePaths.length === 0) return segments;
        
        // Load alt texts from database
        const { data: mappings } = await supabase
          .from('file_segment_mappings')
          .select('file_path, alt_text, alt_text_translations')
          .in('file_path', filePaths);
        
        if (!mappings || mappings.length === 0) return segments;
        
        // Build lookup map: file_path -> alt text for language
        const altTextMap = new Map<string, string>();
        const normalizedLang = language.split('-')[0];
        
        mappings.forEach(mapping => {
          const translations = mapping.alt_text_translations as Record<string, string> | null;
          let altText = '';
          if (translations) {
            altText = translations[normalizedLang] || translations['en'] || '';
          }
          if (!altText && mapping.alt_text) {
            altText = mapping.alt_text;
          }
          if (altText) {
            altTextMap.set(mapping.file_path, altText);
          }
        });
        
        // Update segments with alt texts
        const updateAltTexts = (obj: any): any => {
          if (!obj || typeof obj !== 'object') return obj;
          if (Array.isArray(obj)) {
            return obj.map(item => updateAltTexts(item));
          }
          
          const updated = { ...obj };
          
          // Update metadata.altText for imageUrl
          if (updated.imageUrl && typeof updated.imageUrl === 'string') {
            const filePath = extractFilePathFromUrl(updated.imageUrl);
            if (filePath && altTextMap.has(filePath)) {
              updated.metadata = {
                ...updated.metadata,
                altText: altTextMap.get(filePath)
              };
            }
          }
          
          // Update alt for url (banner images etc.)
          if (updated.url && typeof updated.url === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(updated.url)) {
            const filePath = extractFilePathFromUrl(updated.url);
            if (filePath && altTextMap.has(filePath)) {
              updated.alt = altTextMap.get(filePath);
            }
          }
          
          // Recursively update nested objects
          Object.keys(updated).forEach(key => {
            if (typeof updated[key] === 'object' && updated[key] !== null && key !== 'metadata') {
              updated[key] = updateAltTexts(updated[key]);
            }
          });
          
          return updated;
        };
        
        return segments.map(seg => ({
          ...seg,
          data: updateAltTexts(seg.data)
        }));
      };
      
      // Apply alt text enrichment
      const enrichedSegments = await enrichSegmentsWithAltTexts(finalSegments, urlLanguage);
      
      // CRITICAL: Auto-sync tab_order with page_segments to prevent missing segments
      // This ensures that all segments in page_segments are also in tab_order
      const segmentIds = enrichedSegments.map(seg => String(seg.id || seg.segment_key));
      const missingFromTabOrder = segmentIds.filter(id => !loadedTabOrder.includes(id));
      
      if (missingFromTabOrder.length > 0) {
        console.warn(`[DynamicCMSPage] CRITICAL: Found ${missingFromTabOrder.length} segments missing from tab_order:`, {
          pageSlug,
          missingIds: missingFromTabOrder,
          currentTabOrder: loadedTabOrder,
          segmentIds
        });
        
        // Auto-fix: Add missing segments at their correct position
        const fixedTabOrder = [...loadedTabOrder];
        missingFromTabOrder.forEach(missingId => {
          const segment = enrichedSegments.find(seg => String(seg.id || seg.segment_key) === missingId);
          if (segment) {
            const position = segment.position ?? enrichedSegments.indexOf(segment);
            // Insert at the correct position, clamped to valid range
            const insertIndex = Math.min(position, fixedTabOrder.length);
            fixedTabOrder.splice(insertIndex, 0, missingId);
          }
        });
        
        // Remove duplicates while preserving order
        const uniqueTabOrder = [...new Set(fixedTabOrder)];
        
        console.log(`[DynamicCMSPage] Auto-fixed tab_order:`, uniqueTabOrder);
        loadedTabOrder = uniqueTabOrder;
      }
      
      setPageSegments(enrichedSegments);
      setTabOrder(loadedTabOrder);
      setSegmentContentMeta(mergedContentMeta);

      console.log('[DynamicCMSPage] Loaded content', {
        pageSlug,
        urlLanguage,
        segmentsCount: enhancedSegments.length,
        tabOrderCount: loadedTabOrder.length,
        tabOrder: loadedTabOrder,
        segmentTypes: enhancedSegments.map(s => ({ id: s.id, key: s.segment_key, type: s.type })),
        rawSegments: enhancedSegments,
      });
      
      // Extra debug for company/news
      if (pageSlug === 'company/news') {
        console.log('[DynamicCMSPage] COMPANY/NEWS DEBUG:', {
          enhancedSegments,
          loadedTabOrder,
          hasNewsListSegment: enhancedSegments.some(s => s.type === 'news-list'),
        });
      }
    }
    } catch (error) {
      console.error('[DynamicCMSPage] Error loading content:', error);
    } finally {
      // CRITICAL: ALWAYS set loading to false, regardless of success or failure
      console.log('[DynamicCMSPage] loadContent finished, setting loading=false');
      setLoading(false);
    }
  };

  // Refresh page content after frontend editing save
  const refreshPageContent = async () => {
    console.log('[DynamicCMSPage] Refreshing page content after edit...');
    // Increment refresh counter to force re-render of segment components
    setRefreshCounter(prev => prev + 1);
    await loadContent();
  };

  // Check if page has Meta Navigation segment
  const hasMetaNavigation = pageSegments.some(seg => seg.type === "meta-navigation");

  const renderSegment = (segmentId: string) => {
    // Enhanced segment matching: try multiple strategies
    let segment = pageSegments.find((s) =>
      String(s.id) === String(segmentId) || String(s.segment_key) === String(segmentId)
    );
    
    // Fallback: if segmentId looks like "type-number", try to match by type and segmentId
    // Handle segment types with hyphens (e.g., "news-list-494" -> type="news-list", id=494)
    if (!segment && segmentId.includes('-')) {
      // Extract the last part as the numeric ID
      const lastDashIndex = segmentId.lastIndexOf('-');
      const potentialType = segmentId.substring(0, lastDashIndex);
      const potentialNum = segmentId.substring(lastDashIndex + 1);
      const numericId = parseInt(potentialNum, 10);
      
      if (!isNaN(numericId)) {
        // Try matching by type and segmentId
        segment = pageSegments.find((s) => 
          s.type === potentialType && s.segmentId === numericId
        );
        // Also try matching just by segmentId number
        if (!segment) {
          segment = pageSegments.find((s) => s.segmentId === numericId);
        }
        // Also try matching by id (string or number)
        if (!segment) {
          segment = pageSegments.find((s) => String(s.id) === String(numericId));
        }
      }
    }
    
    if (!segment) {
      console.warn(`[DynamicCMSPage] Segment not found for ID: ${segmentId}`, { pageSegments });
      return null;
    }

    // Skip segments with empty/invalid data for Full Hero
    if (segment.type === 'full-hero') {
      const hasValidData = segment.data?.titleLine1 || segment.data?.titleLine2 || segment.data?.imageUrl;
      if (!hasValidData) {
        console.warn(`[DynamicCMSPage] Skipping empty Full Hero segment: ${segmentId}`);
        return null;
      }
    }

    const segmentDbId = segmentIdMap[segment.segment_key || segment.id];

    switch (segment.type) {
      case "hero":
        // Fixed Navigation ist ~80px hoch + 10px top offset = 90px
        // Meta Navigation (falls vorhanden) ist ~60px hoch
        // Dazu kommt der gewünschte Abstand: small/medium/large/xlarge (50px weniger als zuvor)
        const heroTopSpacing = segment.data?.hero_top_spacing || 'medium';
        const topSpacingClass = hasMetaNavigation
          ? (
              heroTopSpacing === 'small' ? 'pt-[130px]' :      // 180 - 50 = 130px
              heroTopSpacing === 'large' ? 'pt-[190px]' :      // 240 - 50 = 190px
              heroTopSpacing === 'xlarge' ? 'pt-[220px]' :     // 270 - 50 = 220px
              'pt-[160px]'
            )                                                   // medium: 210 - 50 = 160px
          : (
              heroTopSpacing === 'small' ? 'pt-[70px]' :       // 120 - 50 = 70px
              heroTopSpacing === 'large' ? 'pt-[110px]' :      // 160 - 50 = 110px
              heroTopSpacing === 'xlarge' ? 'pt-[130px]' :     // 180 - 50 = 130px
              'pt-[90px]'
            );                                                  // medium: 140 - 50 = 90px
        
        return (
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className={`${topSpacingClass} pb-16`}
          >
            <div className="container mx-auto px-6">
              <div className={`grid gap-12 items-center ${
                segment.data?.hero_layout_ratio === '1-1' ? 'grid-cols-1 lg:grid-cols-2' :
                segment.data?.hero_layout_ratio === '2-3' ? 'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3' :
                'grid-cols-1 lg:grid-cols-5 [&>*:first-child]:lg:col-span-2 [&>*:last-child]:lg:col-span-3'
              }`}>
                <div className={segment.data?.hero_image_position === 'left' ? 'order-2 lg:order-2' : 'order-1 lg:order-1'}>
                  <h2 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-gray-900">
                    {segment.data?.hero_title || ''}
                    {segment.data?.hero_subtitle && (
                      <span className="font-medium block">{segment.data.hero_subtitle}</span>
                    )}
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed mb-8">
                    {segment.data?.hero_description || ''}
                  </p>
                  {segment.data?.hero_cta_text && (
                    <Link
                      to={segment.data.hero_cta_link || '#'}
                      className={`inline-flex items-center px-8 py-4 rounded-lg font-bold text-base transition-all duration-200 ${
                        segment.data.hero_cta_style === 'technical'
                          ? 'bg-gray-800 text-white hover:bg-gray-900'
                          : 'bg-[#f9dc24] text-gray-900 hover:bg-yellow-400'
                      }`}
                    >
                      {segment.data.hero_cta_text}
                    </Link>
                  )}
                </div>
                {segment.data?.hero_image_url && (
                  <div className={`${segment.data?.hero_image_position === 'left' ? 'order-1 lg:order-1' : 'order-2 lg:order-2'} ${
                    (segment.data.hero_image_max_width || segment.data.hero_image_max_height) 
                      ? (segment.data?.hero_image_position === 'left' ? 'flex justify-start' : 'flex justify-end')
                      : ''
                  }`}>
                    <img
                      src={segment.data.hero_image_url}
                      alt={segment.data.hero_image_metadata?.altText || segment.data.hero_title || 'Hero image'}
                      className={`h-auto object-contain ${(segment.data.hero_image_max_width || segment.data.hero_image_max_height) ? '' : 'w-full'}`}
                      style={{
                        ...(segment.data.hero_image_max_width ? { maxWidth: `${segment.data.hero_image_max_width}px` } : {}),
                        ...(segment.data.hero_image_max_height ? { maxHeight: `${segment.data.hero_image_max_height}px` } : {}),
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case "meta-navigation":
        return (
          <MetaNavigation
            key={segmentId}
            data={{
              // Support legacy and new data structures
              links: segment.data?.navigationItems || segment.data?.links || segment.navigationItems || []
            }}
            segmentIdMap={segmentIdMap}
          />
        );

      case "product-hero-gallery":
        return (
          <ProductHeroGallery
            key={`${segmentId}-${refreshCounter}`}
            id={segmentDbId?.toString()}
            hasMetaNavigation={hasMetaNavigation}
            data={{
              title: segment.data?.title || "",
              subtitle: segment.data?.subtitle || "",
              description: segment.data?.description || "",
              images: segment.data?.images || [],
              cta1Text: segment.data?.cta1Text || "",
              cta1Link: segment.data?.cta1Link || "",
              cta1Style: segment.data?.cta1Style || "standard",
              cta2Text: segment.data?.cta2Text || "",
              cta2Link: segment.data?.cta2Link || "",
              cta2Style: segment.data?.cta2Style || "standard",
              imagePosition: segment.data?.imagePosition || "right",
              layoutRatio: segment.data?.layoutRatio || "2-5",
              topSpacing: segment.data?.topSpacing || "medium",
              imageMaxWidth: segment.data?.imageMaxWidth || null,
              imageMaxHeight: segment.data?.imageMaxHeight || null,
            }}
            segmentKey={`${segment.type}-${segment.id}`}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "product-hero":
        // Single image product hero - use ProductHeroGallery with single image in array
        const singleImage = segment.data?.imageUrl ? [{
          imageUrl: segment.data.imageUrl,
          title: segment.data?.metadata?.altText || segment.data?.title || "",
          description: segment.data?.metadata?.altText || segment.data?.title || "",
          metadata: segment.data?.metadata || {}
        }] : [];
        return (
          <ProductHeroGallery
            key={`${segmentId}-${refreshCounter}`}
            id={segmentDbId?.toString()}
            hasMetaNavigation={hasMetaNavigation}
            data={{
              title: segment.data?.title || "",
              subtitle: segment.data?.subtitle || "",
              description: segment.data?.description || "",
              images: singleImage,
              cta1Text: segment.data?.cta1Text || "",
              cta1Link: segment.data?.cta1Link || "",
              cta1Style: segment.data?.cta1Style || "standard",
              cta2Text: segment.data?.cta2Text || "",
              cta2Link: segment.data?.cta2Link || "",
              cta2Style: segment.data?.cta2Style || "standard",
              imagePosition: segment.data?.imagePosition || "right",
              layoutRatio: segment.data?.layoutRatio || "2-5",
              topSpacing: segment.data?.topSpacing || "medium",
              imageMaxWidth: segment.data?.imageMaxWidth || null,
              imageMaxHeight: segment.data?.imageMaxHeight || null,
            }}
            segmentKey={`${segment.type}-${segment.id}`}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "feature-overview":
        return (
          <FeatureOverview
            key={segmentId}
            id={segmentDbId?.toString()}
            title={segment.data?.title || ""}
            subtext={segment.data?.subtext}
            layout={segment.data?.layout}
            rows={segment.data?.rows}
            items={segment.data?.items || []}
            segmentKey={String(segment.segment_key || segment.id)}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "table":
        return (
          <Table
            key={segmentId}
            id={segmentDbId?.toString() || ""}
            title={segment.data?.title || ""}
            subtext={segment.data?.description}
            headers={segment.data?.headers || []}
            columns={segment.data?.columns || []}
            rows={segment.data?.rows || []}
            segmentKey={String(segment.segment_key || segment.id)}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "faq":
        return (
          <FAQ
            key={segmentId}
            id={segmentDbId?.toString()}
            title={segment.data?.title || ""}
            subtext={segment.data?.subtext}
            items={segment.data?.items || []}
            segmentKey={String(segment.segment_key || segment.id)}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "specification":
        return (
          <Specification
            key={segmentId}
            id={segmentDbId?.toString() || ""}
            title={segment.data?.title || ""}
            rows={segment.data?.rows || []}
            description={segment.data?.description}
            segmentKey={String(segment.segment_key || segment.id)}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "video":
        return (
          <Video
            key={segmentId}
            id={segmentDbId?.toString()}
            data={{
              title: segment.data?.title || "",
              videoUrl: segment.data?.videoUrl || "",
              caption: segment.data?.caption
            }}
          />
        );

      case "full-hero": {
        // Full Hero data comes from page_segments which is already language-specific
        // No need for overrides anymore, use segment.data directly
        const heroData = segment.data || {};

        return (
          <FullHero
            key={`${segmentId}-${refreshCounter}`}
            id={segmentDbId?.toString()}
            hasMetaNavigation={hasMetaNavigation}
            titleLine1={heroData.titleLine1 || ""}
            titleLine2={heroData.titleLine2 || ""}
            subtitle={heroData.subtitle || ""}
            button1Text={heroData.button1Text}
            button1Link={heroData.button1Link}
            button1Color={heroData.button1Color || "yellow"}
            button2Text={heroData.button2Text}
            button2Link={heroData.button2Link}
            button2Color={heroData.button2Color || "black"}
            backgroundType={heroData.backgroundType || "image"}
            imageUrl={heroData.imageUrl}
            imageAlt={heroData.imageMetadata?.altText || heroData.titleLine1}
            imageMetadata={heroData.imageMetadata}
            videoUrl={heroData.videoUrl}
            imagePosition={heroData.imagePosition}
            layoutRatio={heroData.layoutRatio}
            topSpacing={heroData.topSpacing}
            kenBurnsEffect={heroData.kenBurnsEffect || "standard"}
            overlayOpacity={heroData.overlayOpacity ?? 15}
            useH1={heroData.useH1 ?? false}
            segmentKey={`${segment.type}-${segment.id}`}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );
      }


      case "intro":
        // Render Intro even with empty data (shows section structure)
        // Support both legacy field names (title/description) and new names (headline/introText)
        const introTitle = segment.data?.headline || segment.data?.title || "";
        const introDescription = segment.data?.introText || segment.data?.description || "";
        
        return (
          <Intro
            key={`${segmentId}-${refreshCounter}`}
            title={introTitle}
            description={introDescription}
            segmentKey={`${segment.type}-${segment.id}`}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "industries":
        return (
          <IndustriesSegment
            key={segmentId}
            title={segment.data?.title || ""}
            subtitle={segment.data?.subtitle || ""}
            columns={segment.data?.columns}
            items={segment.data?.items || []}
          />
        );

      case "news":
        return (
          <NewsSegment
            key={segmentId}
            id={segmentDbId?.toString()}
            pageSlug={pageSlug}
            sectionTitle={segment.data?.title || "Latest News"}
            sectionDescription={segment.data?.description}
            articleLimit={segment.data?.articleLimit}
            categories={segment.data?.categories}
          />
        );

      case "news-list":
        return (
          <NewsListSegment
            key={segmentId}
            id={segment.id}
            pageSlug={pageSlug}
            sectionTitle={segment.data?.title || "All News"}
            sectionDescription={segment.data?.description}
          />
        );

      case "events":
        return (
          <EventsSegment
            key={segmentId}
            id={segmentDbId?.toString()}
            pageSlug={pageSlug}
            sectionTitle={segment.data?.title || "Upcoming Events & Training"}
            sectionDescription={segment.data?.description}
            showFilters={segment.data?.showFilters ?? true}
            showPastEvents={segment.data?.showPastEvents ?? false}
            layout={segment.data?.layout || 'grid'}
            maxEvents={segment.data?.maxEvents}
            sortOrder={segment.data?.sortOrder || 'asc'}
            categories={segment.data?.categories || []}
          />
        );

      case "product-list":
        return (
          <ProductListSegment
            key={segmentId}
            segmentId={segmentDbId}
            pageSlug={pageSlug}
            config={{
              title: segment.data?.title,
              description: segment.data?.description,
              category: segment.data?.category,
              showFilters: segment.data?.showFilters,
              showSearch: segment.data?.showSearch,
              maxProducts: segment.data?.maxProducts,
              layout: segment.data?.layout
            }}
            language={currentUrlLanguage}
          />
        );

      case "downloads":
        return (
          <DownloadsSegment
            key={segmentId}
            segmentId={segmentDbId || parseInt(String(segment.id).replace(/\D/g, '')) || 0}
            pageSlug={pageSlug}
            config={{
              title: segment.data?.title,
              description: segment.data?.description,
              filterType: segment.data?.filterType || 'all',
              showForm: segment.data?.showForm !== false
            }}
          />
        );

      case "debug":
        return (
          <Debug
            key={segmentId}
            id={segmentDbId?.toString()}
            imageUrl={segment.data?.imageUrl}
            title={segment.data?.title}
          />
        );

      case "action-hero":
        return (
          <ActionHero
            key={segmentId}
            id={segmentDbId?.toString()}
            title={segment.data?.title || ""}
            description={segment.data?.description || ""}
            backgroundImage={segment.data?.backgroundImage || ""}
            flipImage={segment.data?.flipImage || false}
          />
        );

      case "tiles":
        // Normalize tile items to support both buttonText/buttonLink and ctaText/ctaLink field names
        const tilesItems = (segment.data?.items || []).map((item: any) => ({
          ...item,
          ctaText: item.ctaText || item.buttonText || '',
          ctaLink: item.ctaLink || item.buttonLink || '',
          ctaStyle: item.ctaStyle || item.buttonStyle || 'standard',
          showButton: item.showButton !== false
        }));
        return (
          <Tiles
            key={segmentId}
            id={segmentDbId?.toString()}
            title={segment.data?.title || ""}
            description={segment.data?.description || ""}
            columns={segment.data?.columns || "3"}
            items={tilesItems}
            segmentKey={String(segment.segment_key || segment.id)}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      case "banner":
        return (
          <section
            key={segmentId}
            id={segmentDbId?.toString()}
            data-segment-key={segment.segment_key || segment.id}
            data-segment-id={segmentDbId?.toString()}
            className="pt-[50px] pb-16 bg-gray-100"
          >
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto text-center">
                {segment.data?.title && (
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {segment.data.title}
                  </h2>
                )}

                {segment.data?.subtext && (
                  <p className="text-lg text-gray-700 mb-8 whitespace-pre-line">
                    {segment.data.subtext}
                  </p>
                )}

                {segment.data?.images && segment.data.images.length > 0 && (
                  <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                    {segment.data.images.map((image: any) => 
                      image.url ? (
                        <div key={image.id} className="bg-gray-200 rounded-lg p-6 w-48 h-32 flex items-center justify-center">
                          <img
                            src={image.url}
                            alt={image.alt || 'Banner image'}
                            className="max-h-20 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {segment.data?.buttonText && segment.data?.buttonLink && (() => {
                  const buttonClasses = 
                    segment.data.buttonStyle === 'technical'
                      ? 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-gray-800 text-white hover:bg-gray-900'
                      : segment.data.buttonStyle === 'outline-white'
                      ? 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-white text-black border border-gray-300 hover:bg-black hover:text-white'
                      : 'inline-block px-8 py-3 rounded-lg font-semibold transition-all bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90';

                  const buttonLink = segment.data.buttonLink || '#';
                  const isExternal = buttonLink.startsWith('http://') || buttonLink.startsWith('https://');

                  if (isExternal) {
                    return (
                      <a
                        href={buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClasses}
                      >
                        {segment.data.buttonText}
                      </a>
                    );
                  }

                  return (
                    <Link to={buttonLink} className={buttonClasses}>
                      {segment.data.buttonText}
                    </Link>
                  );
                })()}
              </div>
            </div>
          </section>
        );



      case "image-text":
      case "solutions":
        return (
          <ImageTextSegment
            key={`${segmentId}-${refreshCounter}`}
            id={segmentDbId?.toString()}
            title={segment.data?.title || ""}
            subtext={segment.data?.subtext || ""}
            layout={segment.data?.layout || "2-col"}
            heroImageUrl={segment.data?.heroImageUrl}
            heroImageMetadata={segment.data?.heroImageMetadata}
            items={segment.data?.items || []}
            segmentKey={String(segment.segment_key || segment.id)}
            pageSlug={pageSlug}
            language={currentUrlLanguage}
            onContentUpdate={refreshPageContent}
          />
        );

      default:
        return null;
    }
  };

  // Wrapper function to wrap rendered segments with EditableSegment
  const renderEditableSegment = (segmentId: string) => {
    const renderedContent = renderSegment(segmentId);
    if (!renderedContent) return null;
    
    // Find the segment to get its key
    const segment = pageSegments.find((s) =>
      String(s.id) === String(segmentId) || String(s.segment_key) === String(segmentId)
    );
    
    if (!segment) return renderedContent;
    
    const segmentKey = String(segment.segment_key || segment.id);
    const meta = segmentContentMeta[segmentKey] || { content_status: 'approved', import_stage: 1 };
    
    // Extract numeric ID for scroll tracking
    const numericId = parseInt(segmentKey.replace(/\D/g, ''), 10) || 0;
    
    // Get segment type for toolbar display
    const segmentType = segment.segment_type || segment.type || 'Unknown';
    
    return (
      <EditableSegment
        key={`editable-${segmentId}`}
        segmentKey={segmentKey}
        pageSlug={pageSlug}
        language={currentUrlLanguage}
        contentStatus={meta.content_status}
        importStage={meta.import_stage}
        onContentUpdate={() => {
          // Reload the page to show updated content
          loadContent();
        }}
        onRegisterRef={(id, element) => {
          if (element) {
            segmentRefs.current.set(id, { element, type: segmentType });
          } else {
            segmentRefs.current.delete(id);
          }
        }}
      >
        {renderedContent}
      </EditableSegment>
    );
  };

  // Timeout protection - if page takes too long to load, show error
  // Using a shorter initial timeout (8s) for better UX
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.error('[DynamicCMSPage] Loading timeout - page took too long to load');
        setLoadTimeout(true);
        setLoading(false);
      }, 8000); // 8 second timeout (reduced from 15s)
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // CRITICAL: All render paths are now wrapped in PageErrorBoundary
  // Loading state - rendered inside boundary to catch any errors
  if (loading) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f9dc24] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading page...</p>
          </div>
        </div>
      </PageErrorBoundary>
    );
  }
  
  if (loadTimeout) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Load Timeout</h1>
            <p className="text-gray-600 mb-6">
              The page took too long to load. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#f9dc24] text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </PageErrorBoundary>
    );
  }

  if (pageNotFound) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Navigation />
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Page not found</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-[#f9dc24] text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Back to Home
            </Link>
          </div>
          <Footer />
        </div>
      </PageErrorBoundary>
    );
  }

  // CRITICAL FIX: Dynamic access check for draft pages
  // Only deny access once auth check is complete AND user is not authorized
  const shouldDenyDraftAccess = isDraftPage && authChecked && !currentUser;
  
  if (shouldDenyDraftAccess) {
    return (
      <PageErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="h-10 w-10 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Draft Page</h1>
              <p className="text-lg text-gray-600 mb-6">
                This page is currently in draft mode and not yet published. 
                Only logged-in administrators and editors can preview draft pages.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#f9dc24] text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                >
                  Sign In to Preview
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </PageErrorBoundary>
    );
  }

  // Extract Meta Navigation segment (must render before all other segments)
  const metaNavSegment = pageSegments.find(seg => seg.type === 'meta-navigation');
  
  // Check if page is essentially empty (only footer or no content segments)
  const contentSegments = pageSegments.filter(seg => 
    seg.type !== 'footer' && seg.type !== 'meta-navigation'
  );
  const isEmpty = contentSegments.length === 0;
  
  // Debug logging for company/news
  if (pageSlug === 'company/news') {
    console.log('[DynamicCMSPage] company/news render check:', {
      pageSegments,
      contentSegments,
      isEmpty,
      tabOrder,
    });
  }

  console.log('[DynamicCMSPage] RENDER START - pageSlug:', pageSlug, 'loading:', loading, 'pageSegments:', pageSegments.length, 'tabOrder:', tabOrder.length);

  return (
    <PageErrorBoundary>
    <FrontendEditProvider pageSlug={pageSlug} language={currentUrlLanguage}>
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={seoData?.title || "Image Engineering"}
        description={seoData?.description || ""}
        canonical={seoData?.canonical}
        ogTitle={seoData?.ogTitle}
        ogDescription={seoData?.ogDescription}
        ogImage={seoData?.ogImage}
        robotsIndex={seoData?.robotsIndex ? 'index' : 'noindex'}
        robotsFollow={seoData?.robotsFollow ? 'follow' : 'nofollow'}
      />
      <Navigation />
      
      {/* Editor Toolbar - shown to logged-in admins/editors */}
      {/* Position below Navigation (70px) + UtilityNavigation (40px) = 110px */}
      {currentUser && userRole && (
        <div className="fixed top-[110px] left-6 z-40 py-2 flex items-center gap-2">
            {/* Edit Mode Toggle - always first */}
            <EditModeToggle />
            
            {/* Admin Dashboard - second, links directly to current page */}
            <a
              href={`/${currentUrlLanguage}/admin-dashboard?page=${encodeURIComponent(pageSlug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 inline-flex items-center gap-2 rounded font-semibold transition-colors bg-white text-black hover:bg-gray-100"
              style={{ border: '1px solid rgba(0,0,0,0.1)', fontSize: '16px' }}
            >
              <Settings className="h-5 w-5" />
              Admin Dashboard
            </a>
            
            {/* Draft Badge - red background */}
            {isDraftPage && (
              <div className="flex items-center bg-red-600 text-white px-3 py-2 rounded-lg font-semibold shadow-lg">
                <span className="text-base">Draft</span>
              </div>
            )}
            
            {/* Page ID Badge - yellow background with black text */}
            {pageId !== null && (
              <div className="flex items-center bg-[#f9dc24] text-black px-3 py-2 rounded-lg font-semibold shadow-lg">
                <span className="text-base">Page ID: {pageId}</span>
              </div>
            )}
            
            {/* Dynamic Segment Badge - shows segment type and ID */}
            {currentVisibleSegment !== null && (
              <div className="flex items-center gap-2 bg-black text-[#f9dc24] px-3 py-2 rounded-lg font-semibold shadow-lg">
                <Hash className="h-4 w-4" />
                <span className="text-base" style={{ letterSpacing: '0.02em' }}>
                  {formatSegmentTypeName(currentVisibleSegment.type)} ID: {currentVisibleSegment.id}
                </span>
              </div>
            )}
        </div>
      )}
      
      {/* Hub Page Display (e.g., Styleguide) */}
      {isHubPage && isEmpty && (
        <div className="pt-32 pb-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {pageSlug === 'styleguide' ? 'Styleguide' : 'Segments'}
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              {pageSlug === 'styleguide' 
                ? 'Design system documentation and component reference'
                : 'Segment templates and examples'}
            </p>
            
            {childPages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {childPages.map((child) => (
                  <Link
                    key={child.page_id}
                    to={`/${currentUrlLanguage}/${child.page_slug}`}
                    className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-[#f9dc24] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#f9dc24] rounded-lg flex items-center justify-center">
                        <span className="text-xl">📄</span>
                      </div>
                      <span className="text-sm text-gray-500">ID {child.page_id}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{child.page_title}</h3>
                    <p className="text-gray-500 text-sm">/{child.page_slug}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No sub-pages found</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Empty Page Indicator (non-hub pages) */}
      {!isHubPage && isEmpty && (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <div className="w-24 h-24 bg-[#f9dc24] rounded-full mx-auto flex items-center justify-center">
                <span className="text-5xl">📄</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Created Successfully</h1>
            <p className="text-xl text-gray-600 mb-6">
              This page has been created and is ready to be configured.
            </p>
            <p className="text-lg text-gray-500">
              Visit the Admin Dashboard to add content segments and customize this page.
            </p>
            <div className="mt-8">
              <Link
                to="/en/admin-dashboard"
                className="inline-flex items-center px-6 py-3 bg-[#f9dc24] text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* DEBUG PANEL - Nur sichtbar mit ?debug=true */}
      {isDebugMode && (
        <div className="bg-yellow-100 border-4 border-yellow-500 p-6 mx-4 my-4 rounded-lg">
          <h2 className="text-2xl font-bold text-black mb-4">🔍 DEBUG MODE - Image & Text Segments</h2>
          <div className="space-y-4">
            {pageSegments
              .filter(seg => seg.type === 'image-text')
              .map((seg, segIdx) => (
                <div key={seg.id} className="bg-white p-4 rounded border-2 border-gray-300">
                  <h3 className="font-bold text-lg mb-2">
                    Segment ID: {segmentIdMap[seg.id] || seg.id} | Type: {seg.type}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div><strong>Title:</strong> {seg.data?.title || '(keine)'}</div>
                    <div><strong>Items Count:</strong> {seg.data?.items?.length || 0}</div>
                    <div><strong>Layout:</strong> {seg.data?.layout || '2-col'}</div>
                  </div>
                  
                  {/* Section Hero Image Check */}
                  {seg.data?.heroImageUrl && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-300 mb-3">
                      <div className="font-semibold text-blue-800 mb-2">📸 Section Hero Image (vorhanden)</div>
                      <div className="text-xs break-all mb-2"><strong>URL:</strong> {seg.data.heroImageUrl}</div>
                      <img 
                        src={seg.data.heroImageUrl} 
                        alt="Section Hero"
                        className="w-32 h-32 object-cover border-2 border-blue-500"
                      />
                    </div>
                  )}
                  
                  {seg.data?.items?.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Items:</h4>
                      {seg.data.items.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <div className="font-semibold mb-2">Item {itemIdx + 1}</div>
                          <div className="grid gap-1 text-xs">
                            <div><strong>Title:</strong> {item.title || '(leer)'}</div>
                            <div><strong>Has imageUrl:</strong> {item.imageUrl ? '✅ JA' : '❌ NEIN'}</div>
                            {item.imageUrl && (
                              <>
                                <div className="break-all"><strong>Image URL:</strong> {item.imageUrl}</div>
                                <div className="mt-2">
                                  <strong>Image Test:</strong>
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.title}
                                    className="w-32 h-32 object-cover border-2 border-green-500 mt-1"
                                    onLoad={() => console.log(`✅ Debug Panel: Item ${itemIdx + 1} loaded`)}
                                    onError={(e) => console.error(`❌ Debug Panel: Item ${itemIdx + 1} failed`, e)}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">⚠️ Keine Items in diesem Segment!</div>
                  )}
                </div>
              ))}
            
            {pageSegments.filter(seg => seg.type === 'image-text').length === 0 && (
              <div className="bg-red-100 p-4 rounded border-2 border-red-500 text-red-800 font-semibold">
                ⚠️ Keine Image & Text Segmente auf dieser Seite gefunden!
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Meta Navigation - Always rendered directly under Navigation (mandatory position) */}
      {metaNavSegment && (
        <MetaNavigation
          key={`meta-nav-${metaNavSegment.segment_id}`}
          data={{
            // Support legacy and new data structures
            links: metaNavSegment.data?.navigationItems || metaNavSegment.data?.links || metaNavSegment.navigationItems || []
          }}
          segmentIdMap={segmentIdMap}
        />
      )}
      
      {/* Content wrapper - adds top padding if no hero segment is present */}
      {(() => {
        // Check if first content segment is a full-height hero type
        const firstContentSegmentId = tabOrder.find(segmentId => {
          const segment = pageSegments.find(
            s => String(s.id) === String(segmentId) || 
                 String(s.segment_key) === String(segmentId)
          );
          return segment?.type !== 'meta-navigation' && segment?.type !== 'footer' && segment?.type !== 'mini-footer';
        });
        
        const firstSegment = firstContentSegmentId ? pageSegments.find(
          s => String(s.id) === String(firstContentSegmentId) || 
               String(s.segment_key) === String(firstContentSegmentId)
        ) : null;
        
        // Hero segment types that don't need top padding (they handle their own spacing)
        const heroTypes = ['full-hero', 'action-hero', 'events', 'downloads', 'news-list'];
        const hasHeroFirst = firstSegment && heroTypes.includes(firstSegment.type);
        
        return (
          <div className={!hasHeroFirst && !isEmpty ? 'pt-24' : ''}>
            {/* Render all andere Segmente in Tab-Reihenfolge (ohne Meta Navigation und Footer) */}
            {tabOrder
              .filter(segmentId => {
                // Extract numeric ID from prefixed keys like "downloads-507" -> "507"
                const numericId = String(segmentId).replace(/^[a-z-]+-/i, '');
                const segment = pageSegments.find(
                  s => String(s.id) === String(segmentId) || 
                       String(s.segment_key) === String(segmentId) ||
                       String(s.id) === numericId
                );
                // Skip meta-navigation (rendered separately above), footer, and mini-footer (rendered separately below)
                return segment?.type !== 'meta-navigation' && segment?.type !== 'footer' && segment?.type !== 'mini-footer';
              })
              .map((segmentId) => {
                const content = renderEditableSegment(segmentId);
                return content || null;
              })
            }
          </div>
        );
      })()}
      {/* Conditionally render MiniFooter or regular Footer */}
      {pageSegments.some(seg => seg.type === 'mini-footer') ? (
        <MiniFooter />
      ) : (
        (() => {
          // Find footer segment ID for dynamic toolbar display
          const footerSegment = pageSegments.find(seg => seg.type === 'footer');
          
          // Try multiple sources for footer segment ID
          let footerSegmentId: number | undefined = undefined;
          
          if (footerSegment) {
            // Try segmentIdMap with different key formats
            footerSegmentId = segmentIdMap[footerSegment.segment_key] 
              || segmentIdMap[`footer-${footerSegment.id}`]
              || footerSegment.segment_id 
              || footerSegment.segmentId;
            
            // If still no ID, try to parse from segment_key (e.g., "footer-999" -> 999)
            if (!footerSegmentId && footerSegment.segment_key) {
              const match = String(footerSegment.segment_key).match(/footer-(\d+)/);
              if (match) {
                footerSegmentId = parseInt(match[1], 10);
              }
            }
            
            // Fallback to segment.id if it looks like a number
            if (!footerSegmentId && footerSegment.id) {
              const numId = parseInt(String(footerSegment.id), 10);
              if (!isNaN(numId)) {
                footerSegmentId = numId;
              }
            }
          }
          
          // If no footer in pageSegments, check segmentIdMap directly for "footer" key
          // This handles cases where footer is in segment_registry but not in page_segments JSON
          if (!footerSegmentId && segmentIdMap['footer']) {
            footerSegmentId = segmentIdMap['footer'];
          }
          
          // Use a consistent fallback ID for footers without explicit segment
          // This ensures the footer is always trackable in the toolbar
          if (!footerSegmentId) {
            footerSegmentId = 0; // Fallback ID for static footer
          }
          
          return (
            <Footer 
              segmentId={footerSegmentId}
              pageSlug={pageSlug}
              onRegisterRef={(id, element) => {
                if (element) {
                  segmentRefs.current.set(id, { element, type: 'footer' });
                } else {
                  segmentRefs.current.delete(id);
                }
              }}
              onContentUpdate={refreshPageContent}
            />
          );
        })()
      )}
    </div>
    </FrontendEditProvider>
    </PageErrorBoundary>
  );
};

export default DynamicCMSPage;
