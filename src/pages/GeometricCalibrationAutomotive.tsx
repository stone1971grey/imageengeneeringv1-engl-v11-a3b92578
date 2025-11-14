import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain, FileText, Download, BarChart3, Smartphone, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MetaNavigation from "@/components/segments/MetaNavigation";
import ProductHeroGallery from "@/components/segments/ProductHeroGallery";
import FeatureOverview from "@/components/segments/FeatureOverview";
import Table from "@/components/segments/Table";
import FAQ from "@/components/segments/FAQ";
import Specification from "@/components/segments/Specification";
import { Video } from "@/components/segments/Video";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

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

interface Application {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
}

const GeometricCalibrationAutomotive = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [tilesColumns, setTilesColumns] = useState<string>("3");
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerSubtext, setBannerSubtext] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [bannerButtonText, setBannerButtonText] = useState<string>("");
  const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
  const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
  const [solutionsTitle, setSolutionsTitle] = useState<string>("");
  const [solutionsSubtext, setSolutionsSubtext] = useState<string>("");
  const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col");
  const [solutionsItems, setSolutionsItems] = useState<any[]>([]);
  const [pageSegments, setPageSegments] = useState<any[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>(['tiles', 'banner', 'solutions']);
  const [hasHeroContent, setHasHeroContent] = useState(false);
  const [segmentIdMap, setSegmentIdMap] = useState<Record<string, number>>({});
  const [seoData, setSeoData] = useState<any>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "geometric-calibration-automotive");

    // Load segment registry for ID mapping
    const { data: segmentData } = await supabase
      .from("segment_registry")
      .select("*")
      .eq("page_slug", "geometric-calibration-automotive");

    if (segmentData) {
      const idMap: Record<string, number> = {};
      segmentData.forEach((seg: any) => {
        idMap[seg.segment_key] = seg.segment_id;
      });
      setSegmentIdMap(idMap);
    }

    if (!error && data) {
      const contentMap: Record<string, string> = {};
      let apps: any[] = [];
      let heroExists = false;

      data.forEach((item: any) => {
        if (item.section_key === "page_segments") {
          const segments = JSON.parse(item.content_value);
          setPageSegments(segments);
        }
        else if (item.section_key === "tab_order") {
          setTabOrder(JSON.parse(item.content_value));
        }
        else if (item.content_type === "text") {
          contentMap[item.section_key] = item.content_value;

          if (item.section_key.startsWith("hero_") && item.content_value) {
            heroExists = true;
          }
          if (item.section_key === "hero_image_url") setHeroImageUrl(item.content_value);
          if (item.section_key === "hero_image_position") setHeroImagePosition(item.content_value || "right");
          if (item.section_key === "hero_layout") setHeroLayout(item.content_value || "2-5");
          if (item.section_key === "hero_top_padding") setHeroTopPadding(item.content_value || "medium");
          if (item.section_key === "hero_cta_link") setHeroCtaLink(item.content_value || "#applications-start");
          if (item.section_key === "hero_cta_style") setHeroCtaStyle(item.content_value || "standard");
          if (item.section_key === "banner_title") setBannerTitle(item.content_value);
          if (item.section_key === "banner_subtext") setBannerSubtext(item.content_value);
          if (item.section_key === "banner_button_text") setBannerButtonText(item.content_value);
          if (item.section_key === "banner_button_link") setBannerButtonLink(item.content_value);
          if (item.section_key === "banner_button_style") setBannerButtonStyle(item.content_value || "standard");
          if (item.section_key === "solutions_title") setSolutionsTitle(item.content_value);
          if (item.section_key === "solutions_subtext") setSolutionsSubtext(item.content_value);
          if (item.section_key === "solutions_layout") setSolutionsLayout(item.content_value || "2-col");
          if (item.section_key === "tiles_columns") setTilesColumns(item.content_value || "3");
        } else if (item.content_type === "json") {
          try {
            const parsed = JSON.parse(item.content_value);
            if (item.section_key === "applications_items") apps = parsed;
            if (item.section_key === "banner_images") setBannerImages(parsed || []);
            if (item.section_key === "solutions_items") setSolutionsItems(parsed || []);
            if (item.section_key === "seo_settings") setSeoData(parsed || {});
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        }
      });

      setContent(contentMap);
      setApplications(apps);
      setHasHeroContent(heroExists);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={seoData.title || "Geometric Calibration for Automotive | Image Engineering"}
        description={seoData.metaDescription || ""}
        canonical={seoData.canonical}
        ogTitle={seoData.ogTitle}
        ogDescription={seoData.ogDescription}
        ogImage={seoData.ogImage}
        twitterCard={seoData.twitterCard}
        robotsIndex={seoData.robotsIndex}
        robotsFollow={seoData.robotsFollow}
      />
      
      <Navigation />

      {/* Content wird im Admin-Dashboard befüllt */}
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Geometric Calibration for Automotive</h1>
          <p className="text-xl text-gray-600 mb-6">Diese Seite wird im CMS-Backend befüllt</p>
          <Link to="/admin-dashboard?page=geometric-calibration-automotive">
            <Button className="bg-[#f9dc24] text-black hover:bg-yellow-400">
              Zum Admin-Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GeometricCalibrationAutomotive;
