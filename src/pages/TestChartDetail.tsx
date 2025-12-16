import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Download, FileText, Loader2, Star, ZoomIn, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProductRow {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  image_url: string;
  video_url: string | null;
  gallery_images: unknown;
  documents: unknown;
  specifications: unknown;
  applications: string[];
  chart_sizes: unknown;
  sku: string | null;
  category: string;
  subcategory: string | null;
  availability: string | null;
  published: boolean | null;
  visibility: string;
  language_code: string;
  measurement_focus: string[];
  format_fov: string[];
  display_badges: string[];
}

type ProductDownload = {
  name: string;
  url: string;
  type: string;
};

// UI translations for product detail page
const UI_LABELS: Record<string, Record<string, string>> = {
  en: {
    backToTestCharts: "Back to Test Charts",
    requestQuote: "Request Quote",
    downloadDatasheet: "Download Datasheet",
    chartAttributes: "Chart Attributes",
    tabDescription: "Description",
    tabChartSizes: "Chart Sizes",
    tabProductVideo: "Product Video",
    tabDownloads: "Downloads",
    productDescription: "Product Description",
    applicationAreas: "Application Areas",
    chartSizesTitle: "Chart Sizes",
    chartSizesIntroDefault: "The test charts are available in the sizes listed below. Please note that some charts cannot be manufactured in all sizes due to technical reasons. Please do not hesitate to ask for additional information.",
    chartSizesIntroDefault2: "During production, specific regions of test charts are measured to qualify the production process or to create individual reference data accompanying a test chart additionally. Measured regions can be color or gray tones.",
    chartSizesIntroDefault3: "The measurement devices are calibrated regularly and proven before use. You can find further information in our reference data accuracy sheet.",
    referenceDataLink: "Reference data accuracy of our test charts",
    reflectiveTitle: "Reflective Test Charts",
    transparentTitle: "Transparent Test Charts",
    availableDownloads: "Available Downloads",
    noDownloads: "No downloads available for this product.",
    productNotFound: "Product Not Found",
    productNotFoundMessage: "The requested product could not be found.",
  },
  de: {
    backToTestCharts: "Zurück zu Test Charts",
    requestQuote: "Angebot anfordern",
    downloadDatasheet: "Datenblatt herunterladen",
    chartAttributes: "Chart-Eigenschaften",
    tabDescription: "Beschreibung",
    tabChartSizes: "Chartgrößen",
    tabProductVideo: "Produktvideo",
    tabDownloads: "Downloads",
    productDescription: "Produktbeschreibung",
    applicationAreas: "Anwendungsbereiche",
    chartSizesTitle: "Chartgrößen",
    chartSizesIntroDefault: "Die Test-Charts sind in den unten aufgeführten Größen erhältlich. Bitte beachten Sie, dass einige Charts aus technischen Gründen nicht in allen Größen hergestellt werden können. Für weitere Informationen stehen wir Ihnen gerne zur Verfügung.",
    chartSizesIntroDefault2: "Während der Produktion werden bestimmte Bereiche der Test-Charts gemessen, um den Produktionsprozess zu qualifizieren oder individuelle Referenzdaten zu erstellen. Gemessene Bereiche können Farb- oder Grautöne sein.",
    chartSizesIntroDefault3: "Die Messgeräte werden regelmäßig kalibriert und vor dem Einsatz geprüft. Weitere Informationen finden Sie in unserem Referenzdaten-Genauigkeitsblatt.",
    referenceDataLink: "Referenzdaten-Genauigkeit unserer Test-Charts",
    reflectiveTitle: "Reflektierende Test-Charts",
    transparentTitle: "Transparente Test-Charts",
    availableDownloads: "Verfügbare Downloads",
    noDownloads: "Keine Downloads für dieses Produkt verfügbar.",
    productNotFound: "Produkt nicht gefunden",
    productNotFoundMessage: "Das angeforderte Produkt konnte nicht gefunden werden.",
  },
  ja: {
    backToTestCharts: "テストチャートに戻る",
    requestQuote: "見積もりを依頼",
    downloadDatasheet: "データシートをダウンロード",
    chartAttributes: "チャート属性",
    tabDescription: "説明",
    tabChartSizes: "チャートサイズ",
    tabProductVideo: "製品ビデオ",
    tabDownloads: "ダウンロード",
    productDescription: "製品説明",
    applicationAreas: "応用分野",
    chartSizesTitle: "チャートサイズ",
    chartSizesIntroDefault: "テストチャートは以下のサイズでご利用いただけます。技術的な理由により、一部のチャートはすべてのサイズで製造できない場合があります。詳細についてはお気軽にお問い合わせください。",
    chartSizesIntroDefault2: "製造中、テストチャートの特定の領域を測定して製造プロセスを検証したり、個別の参照データを作成したりします。測定される領域は、カラーまたはグレートーンです。",
    chartSizesIntroDefault3: "測定機器は定期的に校正され、使用前に検証されます。詳細については、参照データ精度シートをご覧ください。",
    referenceDataLink: "テストチャートの参照データ精度",
    reflectiveTitle: "反射型テストチャート",
    transparentTitle: "透過型テストチャート",
    availableDownloads: "利用可能なダウンロード",
    noDownloads: "この製品にはダウンロードがありません。",
    productNotFound: "製品が見つかりません",
    productNotFoundMessage: "リクエストされた製品が見つかりませんでした。",
  },
  ko: {
    backToTestCharts: "테스트 차트로 돌아가기",
    requestQuote: "견적 요청",
    downloadDatasheet: "데이터시트 다운로드",
    chartAttributes: "차트 속성",
    tabDescription: "설명",
    tabChartSizes: "차트 크기",
    tabProductVideo: "제품 비디오",
    tabDownloads: "다운로드",
    productDescription: "제품 설명",
    applicationAreas: "응용 분야",
    chartSizesTitle: "차트 크기",
    chartSizesIntroDefault: "테스트 차트는 아래 나열된 크기로 제공됩니다. 기술적인 이유로 일부 차트는 모든 크기로 제조할 수 없습니다. 추가 정보가 필요하시면 문의해 주세요.",
    chartSizesIntroDefault2: "생산 중 테스트 차트의 특정 영역을 측정하여 생산 공정을 검증하거나 개별 참조 데이터를 생성합니다. 측정되는 영역은 색상 또는 그레이 톤입니다.",
    chartSizesIntroDefault3: "측정 장치는 정기적으로 교정되고 사용 전에 검증됩니다. 자세한 내용은 참조 데이터 정확도 시트를 참조하세요.",
    referenceDataLink: "테스트 차트 참조 데이터 정확도",
    reflectiveTitle: "반사형 테스트 차트",
    transparentTitle: "투과형 테스트 차트",
    availableDownloads: "다운로드 가능",
    noDownloads: "이 제품에 대한 다운로드가 없습니다.",
    productNotFound: "제품을 찾을 수 없음",
    productNotFoundMessage: "요청한 제품을 찾을 수 없습니다.",
  },
  zh: {
    backToTestCharts: "返回测试图",
    requestQuote: "请求报价",
    downloadDatasheet: "下载数据表",
    chartAttributes: "图表属性",
    tabDescription: "描述",
    tabChartSizes: "图表尺寸",
    tabProductVideo: "产品视频",
    tabDownloads: "下载",
    productDescription: "产品描述",
    applicationAreas: "应用领域",
    chartSizesTitle: "图表尺寸",
    chartSizesIntroDefault: "测试图提供以下尺寸。请注意，由于技术原因，某些图表无法制造所有尺寸。如需更多信息，请随时联系我们。",
    chartSizesIntroDefault2: "在生产过程中，测量测试图的特定区域以验证生产过程或创建随测试图附带的个别参考数据。测量区域可以是彩色或灰色调。",
    chartSizesIntroDefault3: "测量设备定期校准并在使用前进行验证。您可以在我们的参考数据准确性表中找到更多信息。",
    referenceDataLink: "测试图参考数据准确性",
    reflectiveTitle: "反射式测试图",
    transparentTitle: "透射式测试图",
    availableDownloads: "可用下载",
    noDownloads: "此产品没有可用下载。",
    productNotFound: "未找到产品",
    productNotFoundMessage: "找不到请求的产品。",
  },
};

const TestChartDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const labels = UI_LABELS[language] || UI_LABELS.en;

  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSelectedImage(0);

      // Map language code to database format (uppercase)
      const languageCode = language.toUpperCase();
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Test Charts")
        .eq("published", true)
        .eq("slug", slug)
        .eq("language_code", languageCode)
        .maybeSingle();

      if (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } else {
        setProduct((data as ProductRow) || null);
      }

      setLoading(false);
    };

    void load();
  }, [slug, language]);

  const allImages = useMemo(() => {
    if (!product) return [];

    const gallery = Array.isArray(product.gallery_images)
      ? (product.gallery_images as unknown[]).filter((x): x is string => typeof x === "string" && x.length > 0)
      : [];

    const base = typeof product.image_url === "string" && product.image_url.length > 0 ? [product.image_url] : [];

    // Ensure the main image is always first, and avoid duplicates.
    const merged = [...base, ...gallery].filter((v, idx, arr) => arr.indexOf(v) === idx);
    return merged;
  }, [product]);

  type ChartSizesSection = {
    id?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
  };

  type ChartSizesContent = {
    introImageUrl?: string;
    introText?: string;
    sections?: ChartSizesSection[];
  };

  const chartSizes = useMemo<ChartSizesContent | null>(() => {
    if (!product?.chart_sizes || typeof product.chart_sizes !== "object" || Array.isArray(product.chart_sizes)) return null;

    const cs = product.chart_sizes as Record<string, unknown>;
    const sections = Array.isArray(cs.sections)
      ? (cs.sections as unknown[]).filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
      : [];

    return {
      introImageUrl: typeof cs.introImageUrl === "string" ? cs.introImageUrl : undefined,
      introText: typeof cs.introText === "string" ? cs.introText : undefined,
      sections: sections.map((s) => ({
        id: typeof s.id === "string" ? s.id : undefined,
        title: typeof s.title === "string" ? s.title : undefined,
        description: typeof s.description === "string" ? s.description : undefined,
        imageUrl: typeof s.imageUrl === "string" ? s.imageUrl : undefined,
      })),
    };
  }, [product]);

  const reflectiveChartSizesImageUrl = useMemo(() => {
    return chartSizes?.sections?.find((s) => s.id === "reflective")?.imageUrl;
  }, [chartSizes]);

  const transparentChartSizesImageUrl = useMemo(() => {
    return chartSizes?.sections?.find((s) => s.id === "transparent")?.imageUrl;
  }, [chartSizes]);

  // Helper to strip Lovable timestamp prefixes (e.g., "1765793426348-filename.pdf" -> "filename.pdf")
  const stripTimestampPrefix = (name: string): string => {
    return name.replace(/^\d{10,}-/, '');
  };

  const downloads = useMemo<ProductDownload[]>(() => {
    if (!product) return [];

    const docs = Array.isArray(product.documents) ? (product.documents as unknown[]) : [];

    return docs
      .map((d) => {
        if (!d || typeof d !== "object") return null;
        const obj = d as Record<string, unknown>;
        const rawName = typeof obj.name === "string" ? obj.name : typeof obj.title === "string" ? obj.title : "Download";
        // Strip timestamp prefix for display
        const name = stripTimestampPrefix(rawName);
        const url = typeof obj.url === "string" ? obj.url : typeof obj.path === "string" ? obj.path : "";
        const type = typeof obj.type === "string" ? obj.type : "file";
        if (!url) return null;
        return { name, url, type };
      })
      .filter((x): x is ProductDownload => Boolean(x));
  }, [product]);

  const applicationAreas = useMemo(() => {
    if (!product) return [] as string[];
    return Array.isArray(product.applications)
      ? (product.applications as unknown[]).filter((x): x is string => typeof x === "string")
      : [];
  }, [product]);

  const specifications = useMemo(() => {
    if (!product) return [] as Array<{ label: string; value: string }>;

    // Backward compatible: if specs is an object, render its key/value pairs.
    if (product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications)) {
      return Object.entries(product.specifications as Record<string, unknown>)
        .map(([k, v]) => ({
          label: k,
          value: typeof v === "string" ? v : v == null ? "" : JSON.stringify(v),
        }))
        .filter((row) => row.label && row.value);
    }

    return [];
  }, [product]);

  const pageTitle = product?.title ? `${product.title} Test Chart` : "Test Chart";
  const metaDescription = product?.teaser
    ? product.teaser.slice(0, 155)
    : "Explore detailed specifications and downloads for Image Engineering test charts.";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navigation />
        <div className="container mx-auto px-6 py-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#f9dc24]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <SEOHead
          title="Test Chart Not Found"
          description="The requested test chart could not be found."
          canonical={`/${language}/products/test-charts/${slug ?? ""}`}
        />
        <Navigation />
        <div className="container mx-auto px-6 py-32 text-center">
          <header>
            <h1 className="text-3xl font-bold text-white mb-4">Chart Not Found</h1>
          </header>
          <p className="text-gray-400 mb-8">The requested test chart could not be found.</p>
          <Button
            onClick={() => navigate(`/${language}/products/test-charts`)}
            className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Test Charts
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <SEOHead title={pageTitle} description={metaDescription} canonical={`/${language}/products/test-charts/${product.slug}`} />

      <Navigation />

      <main>
        {/* Product Hero - 3 Column Layout */}
        <section className="pt-36 pb-8">
          <div className="container mx-auto px-6">
            {/* Breadcrumb - Backend style */}
            <div className="mb-8">
              <Button
                onClick={() => navigate(`/${language}/products/test-charts`)}
                variant="outline"
                className="flex items-center gap-2 border-gray-600 text-white hover:bg-[#2a2a2a]"
              >
                <ArrowLeft className="h-4 w-4" />
                {labels.backToTestCharts}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: Title, Description, Badges, Buttons */}
              <article className="lg:col-span-4 space-y-5 pt-2">
                <header>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{product.title}</h1>
                    {product.sku && <span className="text-gray-500 font-mono text-sm whitespace-nowrap">{product.sku}</span>}
                  </div>
                  <p className="text-base text-gray-300 leading-relaxed">{product.teaser}</p>
                </header>

                {/* Badges from display_badges */}
                {(product.display_badges && product.display_badges.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {product.display_badges.map((badge: string, idx: number) => (
                      <Badge
                        key={idx}
                        className="text-sm px-3 py-1 bg-[hsl(var(--yellow))]/15 text-[hsl(var(--yellow))] border border-[hsl(var(--yellow))]/30"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-3">
                  <Button size="lg" className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold text-base">
                    <FileText className="w-5 h-5 mr-2" />
                    {labels.requestQuote}
                  </Button>

                  {downloads.length > 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 text-base"
                      asChild
                    >
                      <a href={downloads[0].url}>
                        <Download className="w-5 h-5 mr-2" />
                        {labels.downloadDatasheet}
                      </a>
                    </Button>
                  )}
                </div>
              </article>

              {/* CENTER: Image Gallery */}
              <div className="lg:col-span-4 space-y-3">
                <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                  <DialogTrigger asChild>
                    <button className="relative group cursor-zoom-in w-full">
                      <img
                        src={allImages[selectedImage] || product.image_url}
                        alt={`${product.title} main product image`}
                        className="w-full h-auto object-contain"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black border-gray-700 mt-16">
                    <img
                      src={allImages[selectedImage] || product.image_url}
                      alt={`${product.title} full size`}
                      className="w-full h-full object-contain max-h-[85vh]"
                    />
                  </DialogContent>
                </Dialog>

                {allImages.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {allImages.map((img, idx) => (
                      <button
                        key={img}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === idx ? "border-[#f9dc24]" : "border-gray-700 hover:border-gray-500"
                        }`}
                        aria-label={`View product image ${idx + 1}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain p-1 bg-gray-900" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Chart Attributes */}
              <div className="lg:col-span-4">
                {specifications.length > 0 && (
                  <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-700 h-fit">
                    <div className="bg-[#222] px-5 py-3 border-b border-gray-700">
                      <h2 className="text-base font-semibold text-white">{labels.chartAttributes}</h2>
                    </div>
                    <div className="divide-y divide-gray-800">
                      {specifications.map((row) => (
                        <div key={row.label} className="flex px-5 py-3">
                          <div className="w-32 text-gray-400 font-medium text-sm">{row.label}</div>
                          <div className="flex-1 text-white text-sm whitespace-pre-line">{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Product Tabs */}
        <section className="py-6 bg-[#141414]">
          <div className="container mx-auto px-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className={`w-full max-w-3xl mx-auto grid bg-[#1a1a1a] p-1 h-auto ${product.video_url ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger
                  value="description"
                  className="py-2.5 text-sm data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  {labels.tabDescription}
                </TabsTrigger>
                <TabsTrigger
                  value="chartsizes"
                  className="py-2.5 text-sm data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  {labels.tabChartSizes}
                </TabsTrigger>
                {product.video_url && (
                  <TabsTrigger
                    value="video"
                    className="py-2.5 text-sm data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                  >
                    {labels.tabProductVideo}
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="downloads"
                  className="py-2.5 text-sm data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  {labels.tabDownloads}
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 max-w-4xl mx-auto">
                <TabsContent value="description" className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">{labels.productDescription}</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {product.description || ""}
                    </p>
                  </div>

                  {applicationAreas.length > 0 && (
                    <section className="pt-8">
                      <h3 className="text-lg font-semibold text-white mb-4">{labels.applicationAreas}</h3>
                      <ul className="space-y-2">
                        {applicationAreas.map((app) => (
                          <li key={app} className="flex items-center gap-2 text-gray-300">
                            <Star className="w-4 h-4 text-[#f9dc24]" />
                            {app}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </TabsContent>

                <TabsContent value="chartsizes" className="space-y-8">
                  <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-white mb-4">{labels.chartSizesTitle}</h2>
                    {(chartSizes?.introText ? chartSizes.introText.split(/\n\n+/) : [
                      labels.chartSizesIntroDefault,
                      labels.chartSizesIntroDefault2,
                      labels.chartSizesIntroDefault3,
                    ]).map((paragraph, idx) => (
                      <p key={idx} className="text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                    <a 
                      href="https://afrcagkprhtvvucukubf.supabase.co/storage/v1/object/public/page-images/products/test-charts/IE_reference_data_accuracy.pdf" 
                      download="IE_Reference_Data_Accuracy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 text-[#f9dc24] hover:underline font-medium inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {labels.referenceDataLink}
                    </a>
                  </div>

                  {/* Chart Size Diagram */}
                  <div className="bg-[#1a1a1a] rounded-lg p-6">
                    <img
                      src={chartSizes?.introImageUrl || "/images/chart-sizes-diagram.png"}
                      alt="Test chart size overview diagram"
                      className="w-full max-w-md mx-auto"
                      loading="lazy"
                    />
                  </div>

                  {/* Reflective Charts Table */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">{labels.reflectiveTitle}</h3>
                    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#222]">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-300 font-medium">Chart size</th>
                            <th className="px-4 py-3 text-center text-gray-300 font-medium" colSpan={2}>Picture size w × h [mm]</th>
                            <th className="px-4 py-3 text-left text-gray-300 font-medium">Chart size w × h × d [mm]</th>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <th className="px-4 py-2"></th>
                            <th className="px-4 py-2 text-center text-gray-400 text-xs">4:3</th>
                            <th className="px-4 py-2 text-center text-gray-400 text-xs">16:9</th>
                            <th className="px-4 py-2 text-gray-400 text-xs">(+/- 2 mm)*</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          <tr><td className="px-4 py-2 text-white">A1066</td><td className="px-4 py-2 text-center text-gray-300">800 × 600</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-gray-300">1245 × 835 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">A1066 (TE42*)</td><td className="px-4 py-2 text-center text-gray-300">900 × 675</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-gray-300">1245 × 835 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">A1066</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-center text-gray-300">1066 × 600</td><td className="px-4 py-2 text-gray-300">1400 × 835 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">A1066 (TE42*)</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-center text-gray-300">1200 × 675</td><td className="px-4 py-2 text-gray-300">1400 × 835 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">A540</td><td className="px-4 py-2 text-center text-gray-300">540 × 405</td><td className="px-4 py-2 text-center text-gray-300">540 × 303.75</td><td className="px-4 py-2 text-gray-300">600 × 500 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">A460</td><td className="px-4 py-2 text-center text-gray-300">460 × 345</td><td className="px-4 py-2 text-center text-gray-300">460 × 258.75</td><td className="px-4 py-2 text-gray-300">600 × 500 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">A444</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-center text-gray-300">444.4 × 250</td><td className="px-4 py-2 text-gray-300">600 × 500 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">A360</td><td className="px-4 py-2 text-center text-gray-300">360 × 270</td><td className="px-4 py-2 text-center text-gray-300">360 × 202.5</td><td className="px-4 py-2 text-gray-300">500 × 400 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">K360</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-center text-gray-300">360 × 202.5</td><td className="px-4 py-2 text-gray-300">390 × 271 × 2.1</td></tr>
                          <tr><td className="px-4 py-2 text-white">A280</td><td className="px-4 py-2 text-center text-gray-300">280 × 210</td><td className="px-4 py-2 text-center text-gray-300">280 × 157.5</td><td className="px-4 py-2 text-gray-300">365 × 305 × 3.2</td></tr>
                          <tr><td className="px-4 py-2 text-white">K280</td><td className="px-4 py-2 text-center text-gray-300">280 × 210</td><td className="px-4 py-2 text-center text-gray-300">280 × 157.5</td><td className="px-4 py-2 text-gray-300">334 × 271 × 2.1</td></tr>
                          <tr><td className="px-4 py-2 text-white">P280</td><td className="px-4 py-2 text-center text-gray-300" colSpan={2}>May vary in size with the chart layout</td><td className="px-4 py-2 text-gray-300">334 × 271 × 2.1</td></tr>
                          <tr><td className="px-4 py-2 text-white">K180</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-center text-gray-300">180 × 101</td><td className="px-4 py-2 text-gray-300">204 × 164 × 2.1</td></tr>
                          <tr><td className="px-4 py-2 text-white">K160</td><td className="px-4 py-2 text-center text-gray-300">160 × 120</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-gray-300">204 × 164 × 2.1</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                      <li>A charts (size 280/360/460) are mounted on aluminium plates.</li>
                      <li>A charts (size 1066) are mounted on aluminum composite panels (aluminum dibond).</li>
                      <li>K charts mounted on black polystyrene plates are only available in combination with the test chart folders.</li>
                      <li>P charts are mounted on black polystyrene plates.</li>
                      <li className="text-gray-500">*Sizes are for all variations of the TE42 chart series, including TE42 V2, TE42-LL, TE42-LL Timing</li>
                    </ul>
                    <div className="mt-4">
                      <img
                        src={reflectiveChartSizesImageUrl || "/images/chart-sizes-reflective.png"}
                        alt={`${product.title} reflective chart sizes overview`}
                        className="w-full max-w-2xl mx-auto rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Transparent Charts Table */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">{labels.transparentTitle}</h3>
                    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#222]">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-300 font-medium">Chart size</th>
                            <th className="px-4 py-3 text-center text-gray-300 font-medium" colSpan={2}>Picture size w × h [mm]</th>
                            <th className="px-4 py-3 text-left text-gray-300 font-medium">Chart size w × h × d [mm]</th>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <th className="px-4 py-2"></th>
                            <th className="px-4 py-2 text-center text-gray-400 text-xs">4:3</th>
                            <th className="px-4 py-2 text-center text-gray-400 text-xs">16:9</th>
                            <th className="px-4 py-2 text-gray-400 text-xs">(+/- 2 mm)*</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          <tr><td className="px-4 py-2 text-white">D280</td><td className="px-4 py-2 text-center text-gray-300">280 × 210</td><td className="px-4 py-2 text-center text-gray-300">280 × 157.5</td><td className="px-4 py-2 text-gray-300">360 × 280 × 4.6</td></tr>
                          <tr><td className="px-4 py-2 text-white">D240</td><td className="px-4 py-2 text-center text-gray-300">240 × 180</td><td className="px-4 py-2 text-center text-gray-300">240 × 135</td><td className="px-4 py-2 text-gray-300">320 × 290 × 4.6</td></tr>
                          <tr><td className="px-4 py-2 text-white">D240S</td><td className="px-4 py-2 text-center text-gray-300">240 × 180</td><td className="px-4 py-2 text-center text-gray-300">240 × 135</td><td className="px-4 py-2 text-gray-300">360 × 280 × 4.6</td></tr>
                          <tr><td className="px-4 py-2 text-white">D205</td><td className="px-4 py-2 text-center text-gray-300">205 × 153</td><td className="px-4 py-2 text-center text-gray-300">205 × 115.3</td><td className="px-4 py-2 text-gray-300">253 × 202 × 3.5</td></tr>
                          <tr><td className="px-4 py-2 text-white">D120</td><td className="px-4 py-2 text-center text-gray-300">120 × 90</td><td className="px-4 py-2 text-center text-gray-300">120 × 67.5</td><td className="px-4 py-2 text-gray-300">155 × 135 × 4.0</td></tr>
                          <tr><td className="px-4 py-2 text-white">D60</td><td className="px-4 py-2 text-center text-gray-300">60 × 60</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-gray-300">100 × 100 × 4.5</td></tr>
                          <tr><td className="px-4 py-2 text-white">D35</td><td className="px-4 py-2 text-center text-gray-300">32 × 24</td><td className="px-4 py-2 text-center text-gray-400">-</td><td className="px-4 py-2 text-gray-300">50 × 50 × 3-4</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                      <li>D60 charts are intended to be used with the Vega light source and are constructed with aluminum, PLA plates, and a magnet mount.</li>
                      <li>D35 charts are either between glass plates or mounted in slide frames (glassless).</li>
                      <li className="text-gray-500">There are exceptions regarding mounting and size for special charts.</li>
                    </ul>
                    <div className="mt-4">
                      <img
                        src={transparentChartSizesImageUrl || "/images/chart-sizes-transparent.png"}
                        alt={`${product.title} transparent chart sizes overview`}
                        className="w-full max-w-2xl mx-auto rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Illuminator Compatibility Table */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Suitable transparent charts for the following illuminators</h3>
                    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#222]">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-300 font-medium"></th>
                            <th className="px-4 py-3 text-center text-gray-300 font-medium">D280 / D240S</th>
                            <th className="px-4 py-3 text-center text-gray-300 font-medium">D240</th>
                            <th className="px-4 py-3 text-center text-gray-300 font-medium">D205</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          <tr>
                            <td className="px-4 py-3 text-gray-300">Compatible illuminators</td>
                            <td className="px-4 py-3 text-center text-gray-300 text-xs">
                              Spherical transparency illuminator LE6/LE7<br/>
                              Lightbox illuminator LG3<br/>
                              Sony Pattern Box
                            </td>
                            <td className="px-4 py-3 text-center text-gray-300 text-xs">DNP standard viewer</td>
                            <td className="px-4 py-3 text-center text-gray-300 text-xs">
                              Porta Pattern spherical transparency illuminator
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-gray-300">With adapter</td>
                            <td className="px-4 py-3 text-center text-gray-400">-</td>
                            <td className="px-4 py-3 text-center text-gray-400">-</td>
                            <td className="px-4 py-3 text-center text-gray-300 text-xs">
                              Spherical transparency illuminator LE6/LE7<br/>
                              Lightbox illuminator LG3
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-gray-500">*Chart sizes may vary by +/- 2 mm as they are handmade in house.</p>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">{labels.tabProductVideo}</h2>
                  {product.video_url ? (
                    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden p-4">
                      <div className="relative bg-black rounded-lg overflow-hidden max-w-4xl mx-auto" style={{ aspectRatio: '16/9' }}>
                        <video
                          id="product-video"
                          src={product.video_url}
                          controls
                          controlsList="nodownload"
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                          style={{ minHeight: '300px' }}
                          onPlay={(e) => {
                            const overlay = document.getElementById('video-play-overlay');
                            if (overlay) overlay.style.display = 'none';
                          }}
                          onPause={(e) => {
                            const overlay = document.getElementById('video-play-overlay');
                            if (overlay) overlay.style.display = 'flex';
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                        {/* Central Play Button Overlay */}
                        <button
                          id="video-play-overlay"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            const video = document.getElementById('product-video') as HTMLVideoElement;
                            if (video) {
                              video.play();
                            }
                          }}
                          aria-label="Play video"
                        >
                          <div className="w-20 h-20 bg-[hsl(var(--yellow))] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1a1a1a] rounded-lg p-12 text-center">
                      <p className="text-gray-400">No product video available yet.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="downloads" className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">{labels.availableDownloads}</h2>
                  {downloads.length > 0 ? (
                    <div className="space-y-3">
                      {downloads.map((d) => (
                        <a
                          key={d.url}
                          href={d.url}
                          className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#222] transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-[#f9dc24]" />
                            <span className="text-white">{d.name}</span>
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {(d.type || "File").toUpperCase()}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-300">{labels.noDownloads}</p>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TestChartDetail;
