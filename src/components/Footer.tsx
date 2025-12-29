import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Clock, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useFrontendEditOptional } from "@/contexts/FrontendEditContext";
import { EditableText } from "@/components/frontend-edit/EditableText";
import { EditableImage } from "@/components/frontend-edit/EditableImage";
import { toast } from "sonner";
import teamLaura from "@/assets/team-laura-color.jpg";
import teamMarkus from "@/assets/team-markus-color.jpg";
import teamStefan from "@/assets/team-stefan-color.jpg";
import teamAnna from "@/assets/team-anna-automotive.jpg";
import teamThomas from "@/assets/team-thomas-lighting.jpg";
import trainingInstructor from "@/assets/training-instructor.jpg";

interface FooterProps {
  segmentId?: number;
  pageSlug?: string;
  onRegisterRef?: (segmentId: number, element: HTMLElement | null) => void;
  onContentUpdate?: () => void;
}

const Footer = ({ segmentId, pageSlug: propPageSlug, onRegisterRef, onContentUpdate }: FooterProps) => {
  const location = useLocation();
  const { t, language } = useTranslation();
  const editContext = useFrontendEditOptional();
  const isEditing = editContext?.isEditMode || false;
  
  const [footerContent, setFooterContent] = useState<Record<string, string>>({});
  const [hasCMSContent, setHasCMSContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const getNormalizedPath = (pathname: string) => {
    const parts = pathname.split('/').filter(Boolean);
    const langCodes = ['en', 'de', 'zh', 'ja', 'ko'];
    if (parts.length > 0 && langCodes.includes(parts[0])) {
      return '/' + parts.slice(1).join('/');
    }
    return pathname;
  };
  
  const normalizedPath = getNormalizedPath(location.pathname);
  const isChartsPage = normalizedPath === '/products/charts' || normalizedPath.startsWith('/products/charts/');
  const isSolutionBundlePage = normalizedPath.startsWith('/solution/');
  const isAutomotivePage = normalizedPath === '/automotive';
  const isArcturusPage = normalizedPath === '/product/arcturus';
  const isEventsPage = normalizedPath === '/events';
  
  const getPageType = () => {
    if (isChartsPage) return 'charts';
    if (isSolutionBundlePage) return 'solution';
    if (isAutomotivePage) return 'automotive';
    if (isArcturusPage) return 'arcturus';
    if (isEventsPage) return 'events';
    return 'default';
  };
  
  const pageType = getPageType();
  
  // Calculate pageSlug from props or URL
  const extractPageSlug = (pathname: string): string => {
    const parts = pathname.replace(/^\/+/g, "").split("/").filter(Boolean);
    const langCodes = ['en', 'de', 'zh', 'ja', 'ko'];
    if (parts.length > 0 && langCodes.includes(parts[0])) {
      const remaining = parts.slice(1).join("/");
      return remaining || "index";
    }
    return parts.join("/") || "index";
  };
  
  const pageSlug = propPageSlug || extractPageSlug(location.pathname);

  // Register ref for scroll tracking
  useEffect(() => {
    if (onRegisterRef && segmentId) {
      const footerElement = document.getElementById('footer');
      onRegisterRef(segmentId, footerElement);
      return () => {
        onRegisterRef(segmentId, null);
      };
    }
  }, [onRegisterRef, segmentId]);

  useEffect(() => {
    loadFooterContent();
  }, [location.pathname, language]);

  const loadFooterContent = async () => {
    try {
      console.log("[Footer] Loading content for pageSlug:", pageSlug, "language:", language);

      const sectionKeys = [
        "footer_cta_title",
        "footer_cta_description",
        "footer_contact_headline",
        "footer_contact_subline",
        "footer_contact_description",
        "footer_team_image_url",
        "footer_team_image_metadata",
        "footer_team_quote",
        "footer_team_name",
        "footer_team_title",
        "footer_button_text",
        "footer_button_url",
      ];

      let rows: any[] = [];

      // 1) Try language-specific content first
      const { data: langData, error: langError } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("language", language)
        .in("section_key", sectionKeys);

      if (!langError && langData && langData.length > 0) {
        rows = langData;
      } else {
        // 2) Fallback to English content for non-English languages
        if (language !== "en") {
          const { data: enData } = await supabase
            .from("page_content")
            .select("*")
            .eq("page_slug", pageSlug)
            .eq("language", "en")
            .in("section_key", sectionKeys);

          if (enData && enData.length > 0) {
            rows = enData;
          }
        }

        // 3) Legacy fallback: rows without explicit language (treated as English)
        if (rows.length === 0) {
          const { data: legacyData } = await supabase
            .from("page_content")
            .select("*")
            .eq("page_slug", pageSlug)
            .is("language", null as any)
            .in("section_key", sectionKeys);

          if (legacyData && legacyData.length > 0) {
            rows = legacyData;
          }
        }
      }

      if (rows.length > 0) {
        const contentMap: Record<string, string> = {};
        rows.forEach((item: any) => {
          contentMap[item.section_key] = item.content_value;
        });
        console.log("[Footer] Loaded CMS content:", Object.keys(contentMap), "hasCMSContent: true");
        setFooterContent(contentMap);
        setHasCMSContent(true);
      } else {
        console.log("[Footer] No CMS content found for pageSlug, using fallback");
        setFooterContent({});
        setHasCMSContent(false);
      }
    } catch (error) {
      console.error("[Footer] Error loading footer content:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract alt text from metadata if available
  const getTeamImageAlt = (): string => {
    if (footerContent.footer_team_image_metadata) {
      try {
        const metadata = JSON.parse(footerContent.footer_team_image_metadata);
        if (metadata.altText) return metadata.altText;
      } catch (e) {
        // Ignore parse errors
      }
    }
    // Fallback to team name if no alt text
    if (hasCMSContent && footerContent.footer_team_name) {
      return footerContent.footer_team_name;
    }
    // Default fallbacks
    return isChartsPage ? "Markus Weber, Technical Chart Specialist" 
      : isSolutionBundlePage ? "Dr. Stefan Mueller, Test Solutions Expert"
      : isAutomotivePage ? "Dr. Anna Hoffmann, Automotive Vision Expert"
      : isArcturusPage ? "Dr. Thomas Lichtner, LED Lighting Technology Specialist"
      : isEventsPage ? "Training Specialist, Professional Instructor"
      : "Laura Neumann, Head of Optical Systems";
  };

  const getDefaultTeamImage = () => {
    return isChartsPage ? teamMarkus 
      : isSolutionBundlePage ? teamStefan 
      : isAutomotivePage ? teamAnna 
      : isArcturusPage ? teamThomas 
      : isEventsPage ? trainingInstructor 
      : teamLaura;
  };

  const handleContentChange = () => {
    setHasChanges(true);
  };

  const handleCancel = () => {
    loadFooterContent();
    setHasChanges(false);
  };

  const handleSave = useCallback(async () => {
    // Save is handled by EditableText components individually
    // This just refreshes the content
    setHasChanges(false);
    onContentUpdate?.();
    toast.success('Footer saved!');
  }, [onContentUpdate]);

  // Segment ID badge for toolbar
  const segmentLabel = segmentId ? `Footer ID: ${segmentId}` : 'Footer';

  return (
    <footer 
      id="footer" 
      className="bg-[#4B4A4A] relative"
      data-segment-id={segmentId}
      data-segment-type="footer"
    >

      {/* Vision CTA Section */}
      <div className={`container mx-auto px-6 py-16 text-center ${isEditing && segmentId ? 'pt-20' : ''}`}>
        {isEditing ? (
          <EditableText
            value={hasCMSContent && footerContent.footer_cta_title 
              ? footerContent.footer_cta_title 
              : t.footer.cta[pageType]}
            sectionKey="footer_cta_title"
            pageSlug={pageSlug}
            language={language}
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
            as="h2"
            onUpdate={() => { handleContentChange(); loadFooterContent(); }}
            fieldLabel="CTA Title"
          />
        ) : (
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {hasCMSContent && footerContent.footer_cta_title 
              ? footerContent.footer_cta_title 
              : t.footer.cta[pageType]}
          </h2>
        )}
        
        {isEditing ? (
          <EditableText
            value={hasCMSContent && footerContent.footer_cta_description 
              ? footerContent.footer_cta_description 
              : t.footer.ctaDesc[pageType]}
            sectionKey="footer_cta_description"
            pageSlug={pageSlug}
            language={language}
            className="text-xl text-white max-w-4xl mx-auto leading-relaxed [&_a]:text-[#f9dc24] [&_a]:underline [&_a]:hover:text-white"
            as="p"
            multiline
            onUpdate={() => { handleContentChange(); loadFooterContent(); }}
            fieldLabel="CTA Description"
          />
        ) : (
          hasCMSContent && footerContent.footer_cta_description ? (
            <p 
              className="text-xl text-white max-w-4xl mx-auto leading-relaxed [&_a]:text-[#f9dc24] [&_a]:underline [&_a]:hover:text-white"
              dangerouslySetInnerHTML={{ __html: footerContent.footer_cta_description }}
            />
          ) : (
            <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed">
              {t.footer.ctaDesc[pageType]}
            </p>
          )
        )}
      </div>

      {/* Contact & Team Quote Section */}
      <div className="bg-[#4B4A4A]">
        <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Contact */}
          <div className="space-y-8">
            <div>
              {isEditing ? (
                <EditableText
                  value={hasCMSContent && footerContent.footer_contact_headline 
                    ? footerContent.footer_contact_headline 
                    : t.footer.contactHeadline[pageType]}
                  sectionKey="footer_contact_headline"
                  pageSlug={pageSlug}
                  language={language}
                  className="text-2xl md:text-3xl font-bold text-white"
                  as="h2"
                  onUpdate={() => { handleContentChange(); loadFooterContent(); }}
                  fieldLabel="Contact Headline"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold">
                  {hasCMSContent && footerContent.footer_contact_headline 
                    ? footerContent.footer_contact_headline 
                    : t.footer.contactHeadline[pageType]}
                </h2>
              )}
              
              {isEditing ? (
                <EditableText
                  value={hasCMSContent && footerContent.footer_contact_subline 
                    ? footerContent.footer_contact_subline 
                    : t.footer.contactSubline[pageType]}
                  sectionKey="footer_contact_subline"
                  pageSlug={pageSlug}
                  language={language}
                  className="text-lg md:text-xl font-semibold mb-4 mt-2 text-white"
                  as="p"
                  onUpdate={() => { handleContentChange(); loadFooterContent(); }}
                  fieldLabel="Contact Subline"
                />
              ) : (
                <p className="text-lg md:text-xl font-semibold mb-4 mt-2">
                  {hasCMSContent && footerContent.footer_contact_subline 
                    ? footerContent.footer_contact_subline 
                    : t.footer.contactSubline[pageType]}
                </p>
              )}
              
              {isEditing ? (
                <EditableText
                  value={hasCMSContent && footerContent.footer_contact_description 
                    ? footerContent.footer_contact_description 
                    : t.footer.contactDesc[pageType]}
                  sectionKey="footer_contact_description"
                  pageSlug={pageSlug}
                  language={language}
                  className="text-white leading-relaxed [&_a]:text-[#f9dc24] [&_a]:underline [&_a]:hover:text-white"
                  as="p"
                  multiline
                  onUpdate={() => { handleContentChange(); loadFooterContent(); }}
                  fieldLabel="Contact Description"
                />
              ) : (
                hasCMSContent && footerContent.footer_contact_description ? (
                  <p 
                    className="text-white leading-relaxed [&_a]:text-[#f9dc24] [&_a]:underline [&_a]:hover:text-white"
                    dangerouslySetInnerHTML={{ __html: footerContent.footer_contact_description }}
                  />
                ) : (
                  <p className="text-white leading-relaxed">
                    {t.footer.contactDesc[pageType]}
                  </p>
                )
              )}
            </div>

            <div className="space-y-4">              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#f9dc24' }} />
                  <span className="text-foreground">{t.footer.phoneDE}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#f9dc24' }} />
                  <span className="text-foreground">{t.footer.phoneUSA}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#f9dc24' }} />
                  <span className="text-foreground">{t.footer.phoneChina}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3" style={{ color: '#f9dc24' }} />
                <span className="text-foreground">{t.footer.officeHours}</span>
              </div>

              {/* Button */}
              <div className="pt-1">
                {hasCMSContent && footerContent.footer_button_text ? (
                  <a href={footerContent.footer_button_url || "/contact"}>
                    <Button 
                      className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {footerContent.footer_button_text}
                    </Button>
                  </a>
                ) : (
                  <a href="/contact">
                    <Button className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      {t.footer.button[pageType]}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Team Quote */}
          <div className="bg-[#4B4A4A] rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                {isEditing ? (
                  <EditableImage
                    src={hasCMSContent && footerContent.footer_team_image_url 
                      ? footerContent.footer_team_image_url
                      : getDefaultTeamImage()}
                    alt={getTeamImageAlt()}
                    sectionKey="footer_team_image_url"
                    pageSlug={pageSlug}
                    language={language}
                    className="w-[150px] h-[150px] rounded-lg object-cover"
                    onUpdate={() => { handleContentChange(); loadFooterContent(); }}
                  />
                ) : (
                  <img 
                    src={
                      hasCMSContent && footerContent.footer_team_image_url 
                        ? footerContent.footer_team_image_url
                        : getDefaultTeamImage()
                    }
                    alt={getTeamImageAlt()}
                    className="w-[150px] h-[150px] rounded-lg object-cover"
                  />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <EditableText
                    value={hasCMSContent && footerContent.footer_team_quote 
                      ? footerContent.footer_team_quote 
                      : t.footer.teamQuote[pageType]}
                    sectionKey="footer_team_quote"
                    pageSlug={pageSlug}
                    language={language}
                    className="text-lg text-white leading-relaxed mb-4 [&_a]:text-[#f9dc24] [&_a]:underline [&_a]:hover:text-white"
                    as="p"
                    multiline
                    onUpdate={() => { handleContentChange(); loadFooterContent(); }}
                    fieldLabel="Team Quote"
                  />
                ) : (
                  hasCMSContent && footerContent.footer_team_quote ? (
                    <blockquote 
                      className="text-lg text-white leading-relaxed mb-4 [&_a]:text-[#f9dc24] [&_a]:underline [&_a]:hover:text-white"
                      dangerouslySetInnerHTML={{ __html: `"${footerContent.footer_team_quote}"` }}
                    />
                  ) : (
                    <blockquote className="text-lg text-white leading-relaxed mb-4">
                      "{t.footer.teamQuote[pageType]}"
                    </blockquote>
                  )
                )}
                
                <cite className="text-white not-italic">
                  {isEditing ? (
                    <>
                      <EditableText
                        value={hasCMSContent && footerContent.footer_team_name 
                          ? footerContent.footer_team_name 
                          : t.footer.teamName[pageType]}
                        sectionKey="footer_team_name"
                        pageSlug={pageSlug}
                        language={language}
                        className="font-semibold text-white block"
                        as="div"
                        onUpdate={() => { handleContentChange(); loadFooterContent(); }}
                        fieldLabel="Team Name"
                      />
                      <EditableText
                        value={hasCMSContent && footerContent.footer_team_title 
                          ? footerContent.footer_team_title 
                          : t.footer.teamTitle[pageType]}
                        sectionKey="footer_team_title"
                        pageSlug={pageSlug}
                        language={language}
                        className="text-sm text-white block"
                        as="div"
                        onUpdate={() => { handleContentChange(); loadFooterContent(); }}
                        fieldLabel="Team Title"
                      />
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-white">
                        {hasCMSContent && footerContent.footer_team_name 
                          ? footerContent.footer_team_name 
                          : t.footer.teamName[pageType]}
                      </div>
                      <div className="text-sm">
                        {hasCMSContent && footerContent.footer_team_title 
                          ? footerContent.footer_team_title 
                          : t.footer.teamTitle[pageType]}
                      </div>
                    </>
                  )}
                </cite>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Save/Cancel buttons in edit mode */}
      {isEditing && (
        <div className="container mx-auto px-6 pb-8 flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
            className="bg-[#000000] text-white hover:bg-[#1a1a1a] border-[#000000]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#f9dc24] text-[#000000] hover:bg-[#f9dc24]/90"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Save
          </Button>
        </div>
      )}

      {/* Bottom Section - Footer Menu */}
      <div className="bg-[#4B4A4A]">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-white">
              © {new Date().getFullYear()} {t.footer.copyright}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href={`/${language}/terms-of-service`} className="text-white hover:text-white transition-colors">
                {t.footer.terms}
              </a>
              <span className="text-white">•</span>
              <a href={`/${language}/impressum`} className="text-white hover:text-white transition-colors">
                {t.footer.imprint}
              </a>
              <span className="text-white">•</span>
              <a href={`/${language}/privacy-policy`} className="text-white hover:text-white transition-colors">
                {t.footer.privacy}
              </a>
              <span className="text-white">•</span>
              <a href={`/${language}/compliance`} className="text-white hover:text-white transition-colors">
                {t.footer.compliance}
              </a>
              <span className="text-white">•</span>
              <a href={`/${language}/carbon-footprint`} className="text-white hover:text-white transition-colors">
                {t.footer.carbon}
              </a>
              <span className="text-white">•</span>
              <a href={`/${language}/esg`} className="text-white hover:text-white transition-colors">
                {t.footer.esg}
              </a>
              <span className="text-white">•</span>
              <a href={`/${language}/disposal`} className="text-white hover:text-white transition-colors">
                {t.footer.disposal}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;