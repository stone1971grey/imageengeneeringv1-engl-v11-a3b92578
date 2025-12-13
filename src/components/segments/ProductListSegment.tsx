import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  availability: string;
}

interface ProductListSegmentProps {
  segmentId?: number;
  config?: {
    title?: string;
    description?: string;
    category?: string;
    showFilters?: boolean;
    showSearch?: boolean;
    maxProducts?: number;
    layout?: 'grid' | 'list';
  };
  language?: string;
}

const ProductListSegment = ({ segmentId, config, language: propLanguage }: ProductListSegmentProps) => {
  const navigate = useNavigate();
  const { language: contextLanguage } = useLanguage();
  const language = propLanguage || contextLanguage;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(config?.showFilters !== false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());

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

      if (config?.maxProducts) {
        query = query.limit(config.maxProducts);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedProducts = (data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : [],
        applications: Array.isArray(p.applications) ? p.applications : []
      }));
      
      setProducts(transformedProducts as Product[]);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique filter values
  const subcategories = useMemo(() => {
    const values = new Set<string>();
    products.forEach(p => {
      if (p.subcategory) values.add(p.subcategory);
    });
    return Array.from(values).sort();
  }, [products]);

  const applications = useMemo(() => {
    const values = new Set<string>();
    products.forEach(p => {
      p.applications.forEach(a => values.add(a));
    });
    return Array.from(values).sort();
  }, [products]);

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
    setSelectedSubcategories(new Set());
    setSelectedApplications(new Set());
    setSearchQuery("");
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title.toLowerCase().includes(query) ||
          (product.sku?.toLowerCase().includes(query) || false) ||
          product.teaser.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (selectedSubcategories.size > 0) {
        if (!product.subcategory || !selectedSubcategories.has(product.subcategory)) {
          return false;
        }
      }

      if (selectedApplications.size > 0) {
        const hasApplication = product.applications.some(app => selectedApplications.has(app));
        if (!hasApplication) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSubcategories, selectedApplications, products]);

  const handleViewDetails = (product: Product) => {
    // Determine the product category path
    const categoryPath = product.category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/${language}/products/${categoryPath}/${product.slug}`);
  };

  const hasActiveFilters = selectedSubcategories.size > 0 || selectedApplications.size > 0 || searchQuery !== "";

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
            {config?.showFilters !== false && (subcategories.length > 0 || applications.length > 0) && (
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

        {/* Filters Panel */}
        {showFilters && config?.showFilters !== false && (subcategories.length > 0 || applications.length > 0) && (
          <div className="mb-8 p-6 bg-[#141414] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Type</h3>
                  <div className="space-y-2">
                    {subcategories.map(sub => (
                      <label key={sub} className="flex items-center gap-2 cursor-pointer text-gray-300 text-sm hover:text-white">
                        <Checkbox
                          checked={selectedSubcategories.has(sub)}
                          onCheckedChange={() => toggleFilter(selectedSubcategories, sub, setSelectedSubcategories)}
                          className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        {sub}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {applications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Application</h3>
                  <div className="space-y-2">
                    {applications.slice(0, 8).map(app => (
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
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${config?.layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredProducts.map(product => (
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

                {product.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-gray-600 text-gray-300 bg-gray-800/50">
                        {feature}
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
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Request Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
