import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, FilterX, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  image_url: string;
  category: string;
  subcategory: string | null;
  sku: string | null;
  features: string[];
  applications: string[];
  product_types: string[];
  measurement_focus: string[];
  format_fov: string[];
  integration_features: string[];
  availability: string;
  published: boolean;
}

// Filter options (5 filters)
const PRODUCT_TYPES = ["Custom", "Multi-Format"];
const MEASUREMENT_FOCUS = ["Low-Light", "Timing", "Multipurpose"];
const FORMAT_FOV = ["Ultra-Wide", "Standard", "Multi-Format"];
const APPLICATION_OPTIONS = ["Automotive", "Mobile Devices", "Industrial Imaging", "Video / Broadcast"];
const INTEGRATION_FEATURES = ["Integrated Illumination", "Timing Hardware", "ISO Compliant"];

const TestChartsListing = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // 5 Filter states
  const [selectedProductTypes, setSelectedProductTypes] = useState<Set<string>>(new Set());
  const [selectedMeasurementFocus, setSelectedMeasurementFocus] = useState<Set<string>>(new Set());
  const [selectedFormatFov, setSelectedFormatFov] = useState<Set<string>>(new Set());
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [selectedIntegrationFeatures, setSelectedIntegrationFeatures] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Test Charts")
        .eq("published", true)
        .order("position", { ascending: true });

      if (error) throw error;

      const transformedProducts = (data || []).map((p) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : [],
        applications: Array.isArray(p.applications) ? p.applications : [],
        product_types: Array.isArray((p as any).product_types) ? (p as any).product_types : [],
        measurement_focus: Array.isArray((p as any).measurement_focus) ? (p as any).measurement_focus : [],
        format_fov: Array.isArray((p as any).format_fov) ? (p as any).format_fov : [],
        integration_features: Array.isArray((p as any).integration_features) ? (p as any).integration_features : [],
      }));

      setProducts(transformedProducts as Product[]);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (set: Set<string>, value: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(set);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setter(newSet);
  };

  const clearAllFilters = () => {
    setSelectedProductTypes(new Set());
    setSelectedMeasurementFocus(new Set());
    setSelectedFormatFov(new Set());
    setSelectedApplications(new Set());
    setSelectedIntegrationFeatures(new Set());
    setSearchQuery("");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.title.toLowerCase().includes(query) ||
          (product.sku?.toLowerCase().includes(query) || false) ||
          product.teaser.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 1. Product Type
      if (selectedProductTypes.size > 0) {
        const hasType = product.product_types.some((t) => selectedProductTypes.has(t));
        if (!hasType) return false;
      }

      // 2. Measurement Focus
      if (selectedMeasurementFocus.size > 0) {
        const hasFocus = product.measurement_focus.some((f) => selectedMeasurementFocus.has(f));
        if (!hasFocus) return false;
      }

      // 3. Format / FOV
      if (selectedFormatFov.size > 0) {
        const hasFormat = product.format_fov.some((f) => selectedFormatFov.has(f));
        if (!hasFormat) return false;
      }

      // 4. Application
      if (selectedApplications.size > 0) {
        const hasApp = product.applications.some((a) => selectedApplications.has(a));
        if (!hasApp) return false;
      }

      // 5. Integration / Special Features
      if (selectedIntegrationFeatures.size > 0) {
        const hasFeature = product.integration_features.some((f) => selectedIntegrationFeatures.has(f));
        if (!hasFeature) return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedProductTypes,
    selectedMeasurementFocus,
    selectedFormatFov,
    selectedApplications,
    selectedIntegrationFeatures,
    products,
  ]);

  const handleViewDetails = (product: Product) => {
    navigate(`/${language}/products/test-charts/${product.slug}`);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-black text-white border-0">
        <div className="aspect-[4/3] relative overflow-hidden bg-black">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4 space-y-3">
          {/* Title and SKU */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-lg">{product.title}</h3>
            {product.sku && (
              <span className="text-xs text-zinc-400 font-mono">{product.sku}</span>
            )}
          </div>

          {/* Teaser */}
          <p className="text-sm text-zinc-400 line-clamp-2">{product.teaser}</p>

          {/* Visible Filter Badges - from measurement_focus, format_fov, applications */}
          {(() => {
            const preferredApplication = product.applications.includes("Automotive")
              ? "Automotive"
              : product.applications[0];

            const visibleBadges = [
              ...product.measurement_focus.slice(0, 2),
              ...product.format_fov.filter((f) => f !== "Standard").slice(0, 1),
              ...(preferredApplication ? [preferredApplication] : []),
            ].slice(0, 4);

            return visibleBadges.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {visibleBadges.map((badge, idx) => (
                  <Badge
                    key={idx}
                    className="text-xs bg-[hsl(var(--yellow))]/15 text-[hsl(var(--yellow))] border border-[hsl(var(--yellow))]/30"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            ) : null;
          })()}

          {/* Availability */}
          <div className="pt-2 border-t border-zinc-700">
            <span className={`text-sm font-medium ${
              product.availability === 'available' 
                ? 'text-green-400' 
                : product.availability === 'pre-order'
                  ? 'text-primary'
                  : 'text-zinc-500'
            }`}>
              {product.availability === 'available' ? 'In Stock' : 
               product.availability === 'pre-order' ? 'Pre-Order' :
               product.availability === 'out-of-stock' ? 'Out of Stock' : 'Discontinued'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => handleViewDetails(product)}
              className="flex-1 bg-black hover:bg-black/80 text-white font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button 
              className="flex-1 bg-[hsl(var(--yellow))] hover:bg-[hsl(var(--yellow))]/90 text-black font-medium"
            >
              Request Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterCheckbox = ({ 
    label, 
    checked, 
    onChange 
  }: { 
    label: string; 
    checked: boolean; 
    onChange: () => void;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-white text-sm">
      <Checkbox 
        checked={checked} 
        onCheckedChange={onChange}
      />
      {label}
    </label>
  );

  const hasActiveFilters =
    selectedProductTypes.size > 0 ||
    selectedMeasurementFocus.size > 0 ||
    selectedFormatFov.size > 0 ||
    selectedApplications.size > 0 ||
    selectedIntegrationFeatures.size > 0 ||
    searchQuery !== "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f2f2f] text-white">
      <Navigation />

      {/* Header Section */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Test Charts</h1>
          <p className="text-white/70 max-w-2xl">
            Use our filters and search function to find the perfect test chart for your application.
          </p>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="py-6 border-b border-gray-600 sticky top-20 bg-[#2f2f2f]/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80" />
              <Input
                type="text"
                placeholder="Search by title or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/40 text-white placeholder:text-white/60 border-gray-700 focus-visible:ring-[hsl(var(--yellow))] focus-visible:border-[hsl(var(--yellow))]"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-colors"
            >
              {showFilters ? <FilterX className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
              {showFilters ? "Hide Filter" : "Show Filter"}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-colors"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filters Panel - 5 Filter Categories */}
      {showFilters && (
        <section className="py-6 border-b border-gray-600 bg-[#1f1f1f]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Product Type</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {PRODUCT_TYPES.map((type) => (
                    <FilterCheckbox
                      key={type}
                      label={type}
                      checked={selectedProductTypes.has(type)}
                      onChange={() => toggleFilter(selectedProductTypes, type, setSelectedProductTypes)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">Measurement Focus</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {MEASUREMENT_FOCUS.map((focus) => (
                    <FilterCheckbox
                      key={focus}
                      label={focus}
                      checked={selectedMeasurementFocus.has(focus)}
                      onChange={() => toggleFilter(selectedMeasurementFocus, focus, setSelectedMeasurementFocus)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">Format / Field of View</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {FORMAT_FOV.map((format) => (
                    <FilterCheckbox
                      key={format}
                      label={format}
                      checked={selectedFormatFov.has(format)}
                      onChange={() => toggleFilter(selectedFormatFov, format, setSelectedFormatFov)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">Application</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {APPLICATION_OPTIONS.map((app) => (
                    <FilterCheckbox
                      key={app}
                      label={app}
                      checked={selectedApplications.has(app)}
                      onChange={() => toggleFilter(selectedApplications, app, setSelectedApplications)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-white">Integration / Special Features</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {INTEGRATION_FEATURES.map((feature) => (
                    <FilterCheckbox
                      key={feature}
                      label={feature}
                      checked={selectedIntegrationFeatures.has(feature)}
                      onChange={() => toggleFilter(selectedIntegrationFeatures, feature, setSelectedIntegrationFeatures)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="mb-6 text-white/70">
            {filteredProducts.length} test chart{filteredProducts.length !== 1 ? 's' : ''} found
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                {products.length === 0 
                  ? "No test charts available yet. Add products in the Admin Dashboard."
                  : "No test charts match your criteria"
                }
              </p>
              {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-colors"
              >
                Clear All Filters
              </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestChartsListing;
