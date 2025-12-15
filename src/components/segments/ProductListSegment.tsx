import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, FilterX, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  display_badges: string[];
  availability: string;
}

// Filter options
const PRODUCT_TYPES = ["Custom", "Multi-Format"];
const MEASUREMENT_FOCUS = ["Low-Light", "Timing", "Multipurpose"];
const FORMAT_FOV = ["Ultra-Wide", "Standard", "Multi-Format"];
const APPLICATION_OPTIONS = ["Automotive", "Mobile Devices", "Industrial Imaging", "Video / Broadcast"];
const INTEGRATION_FEATURES = ["Integrated Illumination", "Timing Hardware", "ISO Compliant"];

interface ProductListSegmentProps {
  segmentId?: number;
  pageSlug?: string;
  config?: {
    title?: string;
    description?: string;
    category?: string;
    showFilters?: boolean;
    showSearch?: boolean;
    maxProducts?: number;
    layout?: 'grid' | 'list';
    visibleFilters?: Record<string, boolean>;
  };
  language?: string;
}

const ProductListSegment = ({ segmentId, pageSlug, config: propConfig, language: propLanguage }: ProductListSegmentProps) => {
  const navigate = useNavigate();
  const { language: contextLanguage } = useLanguage();
  const language = propLanguage || contextLanguage;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [config, setConfig] = useState(propConfig || {});
  const [showFilters, setShowFilters] = useState(config?.showFilters !== false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = config?.maxProducts || 0; // 0 = no limit
  
  // 5 Filter states
  const [selectedProductTypes, setSelectedProductTypes] = useState<Set<string>>(new Set());
  const [selectedMeasurementFocus, setSelectedMeasurementFocus] = useState<Set<string>>(new Set());
  const [selectedFormatFov, setSelectedFormatFov] = useState<Set<string>>(new Set());
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [selectedIntegrationFeatures, setSelectedIntegrationFeatures] = useState<Set<string>>(new Set());

  // Load config from database if segmentId is provided
  useEffect(() => {
    const loadConfig = async () => {
      if (!segmentId || !pageSlug) {
        // Use prop config directly if no segmentId
        if (propConfig) {
          setConfig(propConfig);
          setShowFilters(propConfig.showFilters !== false);
        }
        return;
      }
      
      try {
        const sectionKey = `product-list-${segmentId}`;
        
        const { data } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", sectionKey)
          .eq("language", language)
          .maybeSingle();

        if (data?.content_value) {
          const loadedConfig = JSON.parse(data.content_value);
          setConfig(loadedConfig);
          setShowFilters(loadedConfig.showFilters !== false);
        } else if (propConfig) {
          // Fallback to prop config (from page_segments)
          setConfig(propConfig);
          setShowFilters(propConfig.showFilters !== false);
        }
      } catch (error) {
        console.error("Error loading product list config:", error);
        if (propConfig) {
          setConfig(propConfig);
          setShowFilters(propConfig.showFilters !== false);
        }
      }
    };
    
    loadConfig();
  }, [segmentId, pageSlug, language, propConfig]);

  useEffect(() => {
    loadProducts();
  }, [config?.category]);

  const loadProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .order("position", { ascending: true });

      if (config?.category) {
        query = query.eq("category", config.category);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedProducts = (data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : [],
        applications: Array.isArray(p.applications) ? p.applications : [],
        product_types: Array.isArray((p as any).product_types) ? (p as any).product_types : [],
        measurement_focus: Array.isArray((p as any).measurement_focus) ? (p as any).measurement_focus : [],
        format_fov: Array.isArray((p as any).format_fov) ? (p as any).format_fov : [],
        integration_features: Array.isArray((p as any).integration_features) ? (p as any).integration_features : [],
        display_badges: Array.isArray((p as any).display_badges) ? (p as any).display_badges : [],
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
    return products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title.toLowerCase().includes(query) ||
          (product.sku?.toLowerCase().includes(query) || false) ||
          product.teaser.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 1. Product Type filter
      if (selectedProductTypes.size > 0) {
        const hasType = product.product_types.some(t => selectedProductTypes.has(t));
        if (!hasType) return false;
      }

      // 2. Measurement Focus filter
      if (selectedMeasurementFocus.size > 0) {
        const hasFocus = product.measurement_focus.some(f => selectedMeasurementFocus.has(f));
        if (!hasFocus) return false;
      }

      // 3. Format / FOV filter
      if (selectedFormatFov.size > 0) {
        const hasFormat = product.format_fov.some(f => selectedFormatFov.has(f));
        if (!hasFormat) return false;
      }

      // 4. Application filter
      if (selectedApplications.size > 0) {
        const hasApp = product.applications.some(a => selectedApplications.has(a));
        if (!hasApp) return false;
      }

      // 5. Integration Features filter
      if (selectedIntegrationFeatures.size > 0) {
        const hasFeature = product.integration_features.some(f => selectedIntegrationFeatures.has(f));
        if (!hasFeature) return false;
      }

      return true;
    });
  }, [searchQuery, selectedProductTypes, selectedMeasurementFocus, selectedFormatFov, selectedApplications, selectedIntegrationFeatures, products]);

  const handleViewDetails = (product: Product) => {
    // Determine the product category path
    const categoryPath = product.category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/${language}/products/${categoryPath}/${product.slug}`);
  };

  const hasActiveFilters = selectedProductTypes.size > 0 || selectedMeasurementFocus.size > 0 || selectedFormatFov.size > 0 || selectedApplications.size > 0 || selectedIntegrationFeatures.size > 0 || searchQuery !== "";

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#0f0f0f]">
      <div className="container mx-auto px-6">
        {/* Header */}
        {(config?.title || config?.description) && (
          <div className="mb-8">
            {config?.title && (
              <h2 className="text-3xl font-bold text-white mb-2">{config.title}</h2>
            )}
            {config?.description && (
              <p className="text-gray-400">{config.description}</p>
            )}
          </div>
        )}

        {/* Search and Filter Bar */}
        {config?.showSearch !== false && (
          <div className="mb-6 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
              />
            </div>
            {config?.showFilters !== false && (
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`${showFilters ? 'bg-primary text-primary-foreground' : 'bg-gray-800 text-white'} hover:bg-primary hover:text-primary-foreground`}
              >
                {showFilters ? <FilterX className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
                {showFilters ? 'Hide Filter' : 'Show Filter'}
              </Button>
            )}
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="ghost" className="text-gray-400 hover:text-white">
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Filters Panel - 5 Filter Categories (conditionally rendered based on visibleFilters) */}
        {showFilters && config?.showFilters !== false && (
          <div className="mb-8 p-6 bg-[#141414] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* 1. Product Type */}
              {(config?.visibleFilters?.productTypes !== false) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm">Product Type</h3>
                  <div className="space-y-2">
                    {PRODUCT_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                        <Checkbox
                          checked={selectedProductTypes.has(type)}
                          onCheckedChange={() => toggleFilter(selectedProductTypes, type, setSelectedProductTypes)}
                          className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Measurement Focus */}
              {(config?.visibleFilters?.measurementFocus !== false) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm">Measurement Focus</h3>
                  <div className="space-y-2">
                    {MEASUREMENT_FOCUS.map(focus => (
                      <label key={focus} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                        <Checkbox
                          checked={selectedMeasurementFocus.has(focus)}
                          onCheckedChange={() => toggleFilter(selectedMeasurementFocus, focus, setSelectedMeasurementFocus)}
                          className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                          {focus}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Format / FOV */}
              {(config?.visibleFilters?.formatFov !== false) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm">Format / FOV</h3>
                  <div className="space-y-2">
                    {FORMAT_FOV.map(format => (
                      <label key={format} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                        <Checkbox
                          checked={selectedFormatFov.has(format)}
                          onCheckedChange={() => toggleFilter(selectedFormatFov, format, setSelectedFormatFov)}
                          className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        {format}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Application */}
              {(config?.visibleFilters?.applications !== false) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm">Application</h3>
                  <div className="space-y-2">
                    {APPLICATION_OPTIONS.map(app => (
                      <label key={app} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                        <Checkbox
                          checked={selectedApplications.has(app)}
                          onCheckedChange={() => toggleFilter(selectedApplications, app, setSelectedApplications)}
                          className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        {app}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Integration Features */}
              {(config?.visibleFilters?.integrationFeatures !== false) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm">Integration Features</h3>
                  <div className="space-y-2">
                    {INTEGRATION_FEATURES.map(feature => (
                      <label key={feature} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                        <Checkbox
                          checked={selectedIntegrationFeatures.has(feature)}
                          onCheckedChange={() => toggleFilter(selectedIntegrationFeatures, feature, setSelectedIntegrationFeatures)}
                          className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        {feature}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          {productsPerPage > 0 && filteredProducts.length > productsPerPage && (
            <span className="ml-2">
              (Page {currentPage} of {Math.ceil(filteredProducts.length / productsPerPage)})
            </span>
          )}
        </div>

        {/* Products Grid with Pagination */}
        {(() => {
          // Apply pagination if maxProducts is set
          let displayProducts = filteredProducts;
          let totalPages = 1;
          
          if (productsPerPage > 0 && filteredProducts.length > productsPerPage) {
            totalPages = Math.ceil(filteredProducts.length / productsPerPage);
            const startIdx = (currentPage - 1) * productsPerPage;
            displayProducts = filteredProducts.slice(startIdx, startIdx + productsPerPage);
          }
          
          return (
            <>
              <div className={`grid gap-6 ${config?.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {displayProducts.map(product => (
                  <Card key={product.id} className="group bg-[#1a1a1a] border-gray-800 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-900">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-lg">{product.title}</h3>
                        {product.sku && (
                          <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
                        )}
                      </div>

                      <p className="text-sm text-gray-400 line-clamp-2">{product.teaser}</p>

                      {/* Display Badges - use display_badges from backend */}
                      {product.display_badges && product.display_badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {product.display_badges.slice(0, 4).map((badge, idx) => (
                            <Badge key={idx} className="text-xs px-2 py-0.5 bg-[#f9dc24]/15 text-[#f9dc24] border border-[#f9dc24]/30 hover:bg-[#f9dc24]/30">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-800">
                        <span className={`text-sm font-medium ${
                          product.availability === 'available' ? 'text-green-400' : 
                          product.availability === 'pre-order' ? 'text-primary' : 'text-gray-400'
                        }`}>
                          {product.availability === 'available' ? 'In Stock' : 
                           product.availability === 'pre-order' ? 'Pre-Order' :
                           product.availability === 'out-of-stock' ? 'Out of Stock' : 'Discontinued'}
                        </span>
                      </div>

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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page 
                          ? "bg-[hsl(var(--yellow))] text-black hover:bg-[hsl(var(--yellow))]/90"
                          : "border-gray-600 text-white hover:bg-gray-800"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          );
        })()}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">
              {products.length === 0 
                ? "No products available yet."
                : "No products match your criteria"
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductListSegment;
