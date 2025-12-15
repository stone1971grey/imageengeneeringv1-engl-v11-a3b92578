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

  const downloads = useMemo<ProductDownload[]>(() => {
    if (!product) return [];

    const docs = Array.isArray(product.documents) ? (product.documents as unknown[]) : [];

    return docs
      .map((d) => {
        if (!d || typeof d !== "object") return null;
        const obj = d as Record<string, unknown>;
        const name = typeof obj.name === "string" ? obj.name : typeof obj.title === "string" ? obj.title : "Download";
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
                <div className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden max-w-md mx-auto lg:mx-0">
                  <img
                    src={allImages[selectedImage] || product.image_url}
                    alt={`${product.title} main product image`}
                    className="w-full h-full object-contain p-6"
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
                        <img src={img} alt="" className="w-full h-full object-contain p-1 bg-gray-900" loading="lazy" />
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
              </article>
            </div>
          </div>
        </section>

        {/* Product Tabs */}
        <section className="py-12 bg-[#141414]">
          <div className="container mx-auto px-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3 bg-[#1a1a1a] p-1 h-auto">
                <TabsTrigger
                  value="description"
                  className="py-3 data-[state=active]:bg-[#f9dc24] data-[state=active]:text-black text-gray-300"
                >
                  Description
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
