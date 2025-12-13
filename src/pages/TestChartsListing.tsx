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
  availability: string;
  published: boolean;
}

const TestChartsListing = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());

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

  // Extract unique filter values from products
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
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title.toLowerCase().includes(query) ||
          (product.sku?.toLowerCase().includes(query) || false) ||
          product.teaser.toLowerCase().includes(query) ||
          product.features.some(f => f.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Subcategory filter
      if (selectedSubcategories.size > 0) {
        if (!product.subcategory || !selectedSubcategories.has(product.subcategory)) {
          return false;
        }
      }

      // Application filter
      if (selectedApplications.size > 0) {
        const hasApplication = product.applications.some(app => selectedApplications.has(app));
        if (!hasApplication) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSubcategories, selectedApplications, products]);

  const handleViewDetails = (product: Product) => {
    navigate(`/${language}/products/test-charts/${product.slug}`);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    return (
      <Card className="group bg-[#1a1a1a] border-gray-800 hover:border-primary/50 transition-all duration-300 overflow-hidden">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-900">
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
              <span className="text-xs text-gray-400 font-mono">{product.sku}</span>
            )}
          </div>

          {/* Teaser */}
          <p className="text-sm text-gray-400 line-clamp-2">{product.teaser}</p>

          {/* Features as Badges */}
          {product.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.features.slice(0, 3).map((feature, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-xs border-gray-600 text-gray-300 bg-gray-800/50"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          {/* Availability */}
          <div className="pt-2 border-t border-gray-800">
            <span className={`text-sm font-medium ${
              product.availability === 'available' 
                ? 'text-green-400' 
                : product.availability === 'pre-order'
                  ? 'text-primary'
                  : 'text-gray-400'
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
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
    <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-gray-300 text-sm">
      <Checkbox 
        checked={checked} 
        onCheckedChange={onChange}
        className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground"
      />
      {label}
    </label>
  );

  const hasActiveFilters = selectedSubcategories.size > 0 || selectedApplications.size > 0 || searchQuery !== "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navigation />

      {/* Header Section */}
      <section className="pt-32 pb-8 border-b border-gray-800">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Find and Sort Your Perfect Test Charts
          </h1>
          <p className="text-gray-400">
            Use our filters and search function for precise search results
          </p>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="py-6 border-b border-gray-800 sticky top-20 bg-[#0f0f0f]/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by title, SKU or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500 focus:border-primary"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-primary text-primary-foreground' : 'bg-gray-800 text-white'} hover:bg-primary hover:text-primary-foreground transition-colors`}
            >
              {showFilters ? <FilterX className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
              {showFilters ? 'Hide Filter' : 'Show Filter'}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Filters Panel */}
      {showFilters && (subcategories.length > 0 || applications.length > 0) && (
        <section className="py-6 border-b border-gray-800 bg-[#141414]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Subcategory Filter */}
              {subcategories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Type</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {subcategories.map(sub => (
                      <FilterCheckbox
                        key={sub}
                        label={sub}
                        checked={selectedSubcategories.has(sub)}
                        onChange={() => toggleFilter(selectedSubcategories, sub, setSelectedSubcategories)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Application Filter */}
              {applications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-white">Application</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {applications.map(app => (
                      <FilterCheckbox
                        key={app}
                        label={app}
                        checked={selectedApplications.has(app)}
                        onChange={() => toggleFilter(selectedApplications, app, setSelectedApplications)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="mb-6 text-gray-400">
            {filteredProducts.length} test chart{filteredProducts.length !== 1 ? 's' : ''} found
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">
                {products.length === 0 
                  ? "No test charts available yet. Add products in the Admin Dashboard."
                  : "No test charts match your criteria"
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

      {/* CTA Section */}
      <section className="py-16 bg-[#141414]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Test Chart Consultation?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Need help selecting the right test chart for your application? Our experts are here to help.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Contact Our Experts
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestChartsListing;
