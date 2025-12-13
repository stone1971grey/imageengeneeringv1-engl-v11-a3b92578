import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, FilterX, ShoppingCart, FileText } from "lucide-react";
import { charts, Chart } from "@/data/charts";
import { useLanguage } from "@/contexts/LanguageContext";

// Extract unique filter values from charts data
const getUniqueValues = (key: keyof Chart) => {
  const values = new Set<string>();
  charts.forEach(chart => {
    const value = chart[key];
    if (Array.isArray(value)) {
      value.forEach(v => values.add(v));
    }
  });
  return Array.from(values).sort();
};

const CATEGORIES = getUniqueValues('categories');
const APPLICATIONS = getUniqueValues('applications');
const SIZES = getUniqueValues('sizes');

const TestChartsListing = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

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
    setSelectedCategories(new Set());
    setSelectedApplications(new Set());
    setSelectedSizes(new Set());
    setPriceRange([0, 5000]);
    setSearchQuery("");
  };

  const filteredCharts = useMemo(() => {
    return charts.filter(chart => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          chart.title.toLowerCase().includes(query) ||
          chart.sku.toLowerCase().includes(query) ||
          chart.excerpt.toLowerCase().includes(query) ||
          chart.badges.some(b => b.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategories.size > 0) {
        const hasCategory = chart.categories.some(cat => selectedCategories.has(cat));
        if (!hasCategory) return false;
      }

      // Application filter
      if (selectedApplications.size > 0) {
        const hasApplication = chart.applications.some(app => selectedApplications.has(app));
        if (!hasApplication) return false;
      }

      // Size filter
      if (selectedSizes.size > 0) {
        const hasSize = chart.sizes.some(size => selectedSizes.has(size));
        if (!hasSize) return false;
      }

      // Price filter
      if (chart.price_from !== undefined) {
        if (chart.price_from < priceRange[0] || chart.price_from > priceRange[1]) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategories, selectedApplications, selectedSizes, priceRange]);

  const handleViewDetails = (chart: Chart) => {
    navigate(`/${language}/products/test-charts/${chart.slug}`);
  };

  const ChartCard = ({ chart }: { chart: Chart }) => {
    const priceDisplay = chart.price_mode === 'rfq' 
      ? 'On Request' 
      : chart.price_mode === 'from' 
        ? `from ${chart.price_from?.toLocaleString()}€`
        : `${chart.price_from?.toLocaleString()}€`;

    return (
      <Card className="group bg-[#1a1a1a] border-gray-800 hover:border-[#f9dc24]/50 transition-all duration-300 overflow-hidden">
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-900">
          <img
            src={chart.heroImage}
            alt={chart.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4 space-y-3">
          {/* Title and SKU */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-lg">{chart.title}</h3>
            <span className="text-xs text-gray-400 font-mono">{chart.sku}</span>
          </div>

          {/* Excerpt */}
          <p className="text-sm text-gray-400 line-clamp-2">{chart.excerpt}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {chart.badges.slice(0, 3).map((badge, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs border-gray-600 text-gray-300 bg-gray-800/50"
              >
                {badge}
              </Badge>
            ))}
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-gray-800">
            <span className={`font-bold ${chart.price_mode === 'rfq' ? 'text-gray-300' : 'text-[#f9dc24]'}`}>
              {priceDisplay}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => handleViewDetails(chart)}
              className="flex-1 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              Details
            </Button>
            {chart.price_mode !== 'rfq' && (
              <Button 
                variant="outline"
                className="border-[#f9dc24] text-[#f9dc24] hover:bg-[#f9dc24] hover:text-black"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            )}
            {chart.price_mode === 'rfq' && (
              <Button 
                variant="outline"
                className="flex-1 border-[#f9dc24] text-[#f9dc24] hover:bg-[#f9dc24] hover:text-black"
              >
                Request Quote
              </Button>
            )}
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
        className="border-gray-600 data-[state=checked]:bg-[#f9dc24] data-[state=checked]:border-[#f9dc24] data-[state=checked]:text-black"
      />
      {label}
    </label>
  );

  const hasActiveFilters = selectedCategories.size > 0 || selectedApplications.size > 0 || selectedSizes.size > 0 || searchQuery !== "";

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
                placeholder="Search by title, SKU or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#f9dc24]"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`${showFilters ? 'bg-[#f9dc24] text-black' : 'bg-gray-800 text-white'} hover:bg-[#f9dc24] hover:text-black transition-colors`}
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
      {showFilters && (
        <section className="py-6 border-b border-gray-800 bg-[#141414]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Category</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {CATEGORIES.slice(0, 8).map(category => (
                    <FilterCheckbox
                      key={category}
                      label={category}
                      checked={selectedCategories.has(category)}
                      onChange={() => toggleFilter(selectedCategories, category, setSelectedCategories)}
                    />
                  ))}
                </div>
              </div>

              {/* Application Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Application</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {APPLICATIONS.slice(0, 8).map(app => (
                    <FilterCheckbox
                      key={app}
                      label={app}
                      checked={selectedApplications.has(app)}
                      onChange={() => toggleFilter(selectedApplications, app, setSelectedApplications)}
                    />
                  ))}
                </div>
              </div>

              {/* Format/Size Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Format/Size</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {SIZES.slice(0, 8).map(size => (
                    <FilterCheckbox
                      key={size}
                      label={size}
                      checked={selectedSizes.has(size)}
                      onChange={() => toggleFilter(selectedSizes, size, setSelectedSizes)}
                    />
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Price Range (EUR)</h3>
                <div className="pt-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={5000}
                    min={0}
                    step={100}
                    className="w-full [&_[role=slider]]:bg-[#f9dc24] [&_[role=slider]]:border-[#f9dc24] [&_.bg-primary]:bg-[#f9dc24]"
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-400">
                    <span>{priceRange[0]}€</span>
                    <span>{priceRange[1]}€</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="bg-[#1a1a1a] border-gray-700 text-white text-sm"
                    />
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="bg-[#1a1a1a] border-gray-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="mb-6 text-gray-400">
            {filteredCharts.length} test chart{filteredCharts.length !== 1 ? 's' : ''} found
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharts.map(chart => (
              <ChartCard key={chart.id} chart={chart} />
            ))}
          </div>

          {filteredCharts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">No test charts match your criteria</p>
              <Button onClick={clearAllFilters} className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black">
                Clear All Filters
              </Button>
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
          <Button size="lg" className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold">
            Contact Our Experts
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestChartsListing;