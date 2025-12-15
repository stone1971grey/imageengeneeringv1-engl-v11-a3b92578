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
import { ArrowLeft, Download, FileText, Loader2, Star } from "lucide-react";

interface ProductRow {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  image_url: string;
  gallery_images: unknown;
  documents: unknown;
  specifications: unknown;
  features: unknown;
  applications: unknown;
  sku: string | null;
  category: string;
  subcategory: string | null;
  availability: string | null;
  published: boolean | null;
  visibility: string;
  language_code: string;
}

type ProductDownload = {
  name: string;
  url: string;
  type: string;
};

const TestChartDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setSelectedImage(0);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Test Charts")
        .eq("published", true)
        .eq("slug", slug)
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
  }, [slug]);

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
        {/* Breadcrumb */}
        <section className="pt-28 pb-4 border-b border-gray-800">
          <div className="container mx-auto px-6">
            <nav aria-label="Breadcrumb">
              <button
                onClick={() => navigate(`/${language}/products/test-charts`)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#f9dc24] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Test Charts
              </button>
            </nav>
          </div>
        </section>

        {/* Product Hero */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden w-full max-w-[580px] mx-auto lg:mx-0">
                  <img
                    src={allImages[selectedImage] || product.image_url}
                    alt={`${product.title} main product image`}
                    className="w-full h-full object-contain p-4"
                    loading="eager"
                  />
                </div>

                {allImages.length > 1 && (
                  <div className="flex gap-2 justify-center lg:justify-start">
                    {allImages.map((img, idx) => (
                      <button
                        key={img}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                          selectedImage === idx ? "border-[#f9dc24]" : "border-gray-700 hover:border-gray-500"
                        }`}
                        aria-label={`View product image ${idx + 1}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain p-1 bg-black" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <article className="space-y-6">
                <header>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">{product.title}</h1>
                    {product.sku && <span className="text-gray-400 font-mono">{product.sku}</span>}
                  </div>
                  <p className="text-lg text-gray-300">{product.teaser}</p>
                </header>

                {/* Category/Subcategory */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-800 text-gray-200 border border-gray-700">{product.category}</Badge>
                  {product.subcategory && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {product.subcategory}
                    </Badge>
                  )}
                </div>

                {/* Action Section */}
                <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-4">
                  <Button size="lg" className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold">
                    <FileText className="w-5 h-5 mr-2" />
                    Request Quote
                  </Button>

                  {downloads.length > 0 && (
                    <a
                      href={downloads[0].url}
                      className="flex items-center gap-2 text-gray-400 hover:text-[#f9dc24] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Datasheet
                    </a>
                  )}
                </div>

                {/* Chart Attributes Section */}
                {specifications.length > 0 && (
                  <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
                    <div className="bg-[#222] px-6 py-4 border-b border-gray-800">
                      <h2 className="text-lg font-semibold text-white">Chart attributes</h2>
                    </div>
                    <div className="divide-y divide-gray-800">
                      {specifications.map((row) => (
                        <div key={row.label} className="flex px-6 py-4">
                          <div className="w-40 text-gray-400 font-medium">{row.label}</div>
                          <div className="flex-1 text-white whitespace-pre-line">{row.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </div>
          </div>
        </section>

        {/* Product Tabs */}
        <section className="py-12 bg-[#141414]">
          <div className="container mx-auto px-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-4 bg-[#1a1a1a] p-1 h-auto">
                <TabsTrigger
                  value="description"
                  className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="chartsizes"
                  className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  Chart Sizes
                </TabsTrigger>
                <TabsTrigger
                  value="technical"
                  className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  Technical Data
                </TabsTrigger>
                <TabsTrigger
                  value="downloads"
                  className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  Downloads
                </TabsTrigger>
              </TabsList>

              <div className="mt-8 max-w-4xl mx-auto">
                <TabsContent value="description" className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Product Description</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {product.description || ""}
                    </p>
                  </div>

                  {applicationAreas.length > 0 && (
                    <section className="pt-8">
                      <h3 className="text-lg font-semibold text-white mb-4">Application Areas</h3>
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
                    <h2 className="text-2xl font-bold text-white mb-4">Chart Sizes</h2>
                    <p className="text-gray-300 leading-relaxed">
                      The test charts are available in the sizes listed below. Please note that some charts cannot be manufactured in all sizes due to technical reasons. Please do not hesitate to ask for additional information.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      During production, specific regions of test charts are measured to qualify the production process or to create individual reference data accompanying a test chart additionally. Measured regions can be color or gray tones.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      The measurement devices are calibrated regularly and proven before use. You can find further information in our reference data accuracy sheet.
                    </p>
                    <a href="#" className="text-[#f9dc24] hover:underline font-medium">
                      Reference data accuracy of our test charts →
                    </a>
                  </div>

                  {/* Chart Size Diagram */}
                  <div className="bg-[#1a1a1a] rounded-lg p-6">
                    <img 
                      src="/images/chart-sizes-diagram.png" 
                      alt="Chart size vs picture size diagram" 
                      className="w-full max-w-md mx-auto"
                    />
                  </div>

                  {/* Reflective Charts Table */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Reflective</h3>
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
                        src="/images/chart-sizes-reflective.png" 
                        alt="Reflective chart sizes overview" 
                        className="w-full max-w-2xl mx-auto rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Transparent Charts Table */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Transparent</h3>
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
                        src="/images/chart-sizes-transparent.png" 
                        alt="Transparent chart sizes overview" 
                        className="w-full max-w-2xl mx-auto rounded-lg"
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

                <TabsContent value="technical" className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Technical Specifications</h2>
                  <div className="bg-[#1a1a1a] rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {product.sku && (
                          <tr className="border-b border-gray-800">
                            <td className="px-4 py-3 text-gray-400 font-medium">SKU</td>
                            <td className="px-4 py-3 text-white">{product.sku}</td>
                          </tr>
                        )}
                        {specifications.length > 0 ? (
                          specifications.map((row) => (
                            <tr key={row.label} className="border-b border-gray-800 last:border-b-0">
                              <td className="px-4 py-3 text-gray-400 font-medium">{row.label}</td>
                              <td className="px-4 py-3 text-white">{row.value}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-4 py-3 text-gray-400">No technical data available yet.</td>
                            <td className="px-4 py-3 text-white">&nbsp;</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="downloads" className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Downloads & Resources</h2>
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
                    <p className="text-gray-300">No downloads available yet.</p>
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
