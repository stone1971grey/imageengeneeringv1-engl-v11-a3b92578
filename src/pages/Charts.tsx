import { useState, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Search, Filter, ShoppingCart, FileText, X, Menu, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { charts, categories, applications, standards, materials, formats } from "@/data/charts";
import precisionTestingHero from "@/assets/arcturus-realistic-lab.jpg";

const Charts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("5000");
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updatePriceFromInputs = () => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || 5000;
    setPriceRange([Math.min(min, max), Math.max(min, max)]);
  };

  const handlePriceSliderChange = (values: number[]) => {
    setPriceRange(values);
    setMinPrice(values[0].toString());
    setMaxPrice(values[1].toString());
  };

  const getAllActiveFilters = () => {
    const filters: Array<{type: string, value: string, remove: () => void}> = [];
    
    selectedCategories.forEach(cat => filters.push({
      type: 'Category',
      value: cat,
      remove: () => setSelectedCategories(prev => prev.filter(c => c !== cat))
    }));
    
    selectedApplications.forEach(app => filters.push({
      type: 'Application', 
      value: app,
      remove: () => setSelectedApplications(prev => prev.filter(a => a !== app))
    }));
    
    selectedFormats.forEach(fmt => filters.push({
      type: 'Format',
      value: fmt,
      remove: () => setSelectedFormats(prev => prev.filter(f => f !== fmt))
    }));
    
    return filters;
  };

  const filteredCharts = useMemo(() => {
    let filtered = charts.filter(chart => {
      // Search filter
      const searchMatch = searchQuery === "" || 
        chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const categoryMatch = selectedCategories.length === 0 || 
        chart.categories.some(cat => selectedCategories.includes(cat));

      // Application filter
      const applicationMatch = selectedApplications.length === 0 || 
        chart.applications.some(app => selectedApplications.includes(app));

      // Formats filter
      const formatMatch = selectedFormats.length === 0 || 
        chart.sizes.some(size => selectedFormats.includes(size));

      // Price filter
      const priceMatch = chart.price_mode === 'rfq' || 
        !chart.price_from || 
        (chart.price_from >= priceRange[0] && chart.price_from <= priceRange[1]);

      return searchMatch && categoryMatch && applicationMatch && formatMatch && priceMatch;
    });

    return filtered;
  }, [searchQuery, selectedCategories, selectedApplications, selectedFormats, priceRange]);

  const activeFilters = getAllActiveFilters();
  const activeFiltersCount = activeFilters.length;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedApplications([]);
    setSelectedFormats([]);
    setPriceRange([0, 5000]);
    setMinPrice("0");
    setMaxPrice("5000");
    setSearchQuery("");
  };

  const scrollToCharts = () => {
    const element = document.getElementById('charts-grid');
    if (element) {
      const yOffset = -120; // Offset für sticky navigation
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToFooterExpert = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      const yOffset = -80; // Offset für bessere Positionierung
      const y = footer.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const FilterContent = () => (
    <Accordion type="multiple" className="w-full space-y-1">
      {/* Category Filter */}
      <AccordionItem value="categories" className="border border-gray-200 rounded-lg" style={{backgroundColor: '#F8F8F8'}}>
        <AccordionTrigger className="text-[#000000] font-medium hover:no-underline px-4 py-2">
          Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3">
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2 text-base text-[#000000] cursor-pointer py-0.5">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, category]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(c => c !== category));
                    }
                  }}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Application Filter */}
      <AccordionItem value="applications" className="border border-gray-200 rounded-lg" style={{backgroundColor: '#F8F8F8'}}>
        <AccordionTrigger className="text-[#000000] font-medium hover:no-underline px-4 py-2">
          Application {selectedApplications.length > 0 && `(${selectedApplications.length})`}
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3">
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {applications.map(application => (
              <label key={application} className="flex items-center space-x-2 text-base text-[#000000] cursor-pointer py-0.5">
                <Checkbox
                  checked={selectedApplications.includes(application)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedApplications([...selectedApplications, application]);
                    } else {
                      setSelectedApplications(selectedApplications.filter(a => a !== application));
                    }
                  }}
                />
                <span>{application}</span>
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Formats Filter */}
      <AccordionItem value="formats" className="border border-gray-200 rounded-lg" style={{backgroundColor: '#F8F8F8'}}>
        <AccordionTrigger className="text-[#000000] font-medium hover:no-underline px-4 py-2">
          Format/Size {selectedFormats.length > 0 && `(${selectedFormats.length})`}
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3">
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {formats.map(format => (
              <label key={format} className="flex items-center space-x-2 text-base text-[#000000] cursor-pointer py-0.5">
                <Checkbox
                  checked={selectedFormats.includes(format)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFormats([...selectedFormats, format]);
                    } else {
                      setSelectedFormats(selectedFormats.filter(f => f !== format));
                    }
                  }}
                />
                <span>{format}</span>
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Price Filter */}
      <AccordionItem value="price" className="border border-gray-200 rounded-lg" style={{backgroundColor: '#F8F8F8'}}>
        <AccordionTrigger className="text-[#000000] font-medium hover:no-underline px-4 py-2">
          Price Range (EUR)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-3">
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={handlePriceSliderChange}
              max={5000}
              step={50}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-[#000000] mb-3 bg-white px-2 py-1 rounded">
              <span>{priceRange[0]}€</span>
              <span>{priceRange[1]}€</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[#000000] mb-1">Min (€)</label>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={updatePriceFromInputs}
                  className="text-[#000000] text-sm h-8 bg-white"
                  min="0"
                  max="5000"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[#000000] mb-1">Max (€)</label>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={updatePriceFromInputs}
                  className="text-[#000000] text-sm h-8 bg-white"
                  min="0"
                  max="5000"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Free shipping on orders over €500"
        ctaText="Learn more"
        ctaLink="#"
        icon="calendar"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden -mt-[47px]">
        {/* Hero Background Image with Ken Burns Effect */}
        <div className="absolute inset-0 animate-fade-in">
          <img 
            src={precisionTestingHero}
            alt="Test Charts für präzise Bildqualitätsmessungen"
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-black/15"></div>
          {/* Left fade overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
        </div>
        
        {/* Navigation Spacer */}
        <div className="h-16"></div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
          <div className="flex items-center justify-start min-h-[80vh]">
            
            {/* Left-aligned Content */}
            <div className="text-left space-y-8 max-w-4xl w-full pr-4 md:pr-0">
              <div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[0.9] tracking-tight mb-6 pt-20 md:pt-0">
                  Test Charts
                  <br />
                  <span className="font-medium">for Every<br className="md:hidden" /> Application</span>
                </h1>
                
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
                  Our comprehensive selection of test charts for all camera and image quality testing – from low-light to ultra-HD.
                </p>
              </div>
              
              <div className="pt-4 flex flex-col md:flex-row gap-4">
                <Button 
                  size="lg"
                  variant="explore"
                  className="border-0 px-12 py-4 group w-full md:w-auto"
                  onClick={scrollToCharts}
                >
                  Explore All Charts
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  size="lg"
                  variant="decision"
                  className="border-0 px-12 py-4 w-full md:w-auto"
                  style={{ backgroundColor: '#d9c409', color: 'black' }}
                  onClick={scrollToFooterExpert}
                >
                  Request Consultation
                </Button>
              </div>

              {/* Minimal stats */}
              <div className="flex flex-wrap items-center justify-start gap-6 md:space-x-12 md:gap-0 pt-8">
                <div>
                  <div className="text-2xl font-medium text-white">200+</div>
                  <div className="text-sm text-white/80 font-light">Test Chart Variants</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-white">0.01%</div>
                  <div className="text-sm text-white/80 font-light">Measurement Tolerance</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-white">15+</div>
                  <div className="text-sm text-white/80 font-light">Years of Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-1">
          {/* Header */}
          <div className="mb-2 mt-2">
            <h2 className="text-xl md:text-2xl font-semibold text-[#000000] mb-1">Find and Sort Your Perfect Test Charts</h2>
            <p className="text-gray-600 text-xs md:text-sm">Use our filters and search function for precise search results</p>
          </div>
          
          {/* Search Bar and Filter Button - Same Row */}
          <div className="flex flex-col md:flex-row gap-3 items-start mb-2">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  placeholder="Search by title, SKU or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-2 text-base bg-white text-[#000000] border-gray-300 focus:border-[#3464e3] focus:ring-[#3464e3] h-10"
                />
              </div>
            </div>
            
            {/* Filter Toggle Button - Aligned with search */}
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 bg-[#103e7c] border-[#103e7c] text-white hover:bg-[#0d3369] hover:text-white h-10 px-4 w-full md:w-auto hidden md:flex"
            >
              <Filter className="w-4 h-4" />
              {filtersOpen ? 'Hide Filter' : 'Show Filter'}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-[#103e7c] text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-3">
            <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  style={{ backgroundColor: '#3464e3', color: 'white', borderColor: '#3464e3' }}
                >
                  <Menu className="w-4 h-4" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-white text-[#3464e3]">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[80vh] bg-white z-50">
                <DrawerHeader className="bg-white border-b">
                  <DrawerTitle className="text-[#000000]">Filter</DrawerTitle>
                  <DrawerClose className="absolute right-4 top-4 text-[#000000]" />
                </DrawerHeader>
                <div className="px-4 pb-6 overflow-y-auto bg-white">
                  <div className="text-[#000000]">
                    <FilterContent />
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full text-white"
                      style={{ backgroundColor: '#3464e3' }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Desktop Filters - Collapsible */}
          {filtersOpen && (
            <div className="hidden lg:grid lg:grid-cols-4 gap-3 mb-3 animate-in slide-in-from-top-2 duration-200">
              {/* Category Filter */}
              <div className="border border-gray-200 rounded-lg p-2" style={{backgroundColor: '#F8F8F8'}}>
                <h3 className="text-[#000000] font-medium mb-1 text-sm">
                  Category {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                </h3>
                <div className="space-y-0.5 max-h-28 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category} className="flex items-center space-x-2 text-sm text-[#000000] cursor-pointer">
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Application Filter */}
              <div className="border border-gray-200 rounded-lg p-2" style={{backgroundColor: '#F8F8F8'}}>
                <h3 className="text-[#000000] font-medium mb-1 text-sm">
                  Application {selectedApplications.length > 0 && `(${selectedApplications.length})`}
                </h3>
                <div className="space-y-0.5 max-h-28 overflow-y-auto">
                  {applications.map(application => (
                    <label key={application} className="flex items-center space-x-2 text-sm text-[#000000] cursor-pointer">
                      <Checkbox
                        checked={selectedApplications.includes(application)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedApplications([...selectedApplications, application]);
                          } else {
                            setSelectedApplications(selectedApplications.filter(a => a !== application));
                          }
                        }}
                      />
                      <span>{application}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Formats Filter */}
              <div className="border border-gray-200 rounded-lg p-2" style={{backgroundColor: '#F8F8F8'}}>
                <h3 className="text-[#000000] font-medium mb-1 text-sm">
                  Format/Size {selectedFormats.length > 0 && `(${selectedFormats.length})`}
                </h3>
                <div className="space-y-0.5 max-h-28 overflow-y-auto">
                  {formats.map(format => (
                    <label key={format} className="flex items-center space-x-2 text-sm text-[#000000] cursor-pointer">
                      <Checkbox
                        checked={selectedFormats.includes(format)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFormats([...selectedFormats, format]);
                          } else {
                            setSelectedFormats(selectedFormats.filter(f => f !== format));
                          }
                        }}
                      />
                      <span>{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="border border-gray-200 rounded-lg p-2" style={{backgroundColor: '#F8F8F8'}}>
                <h3 className="text-[#000000] font-medium mb-1 text-sm">Price Range (EUR)</h3>
                <div className="space-y-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceSliderChange}
                    max={5000}
                    step={50}
                    className="mb-1"
                  />
                  <div className="flex justify-between text-xs text-[#000000] mb-1 bg-white px-2 py-1 rounded">
                    <span>{priceRange[0]}€</span>
                    <span>{priceRange[1]}€</span>
                  </div>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={updatePriceFromInputs}
                      className="text-[#000000] text-xs h-6 p-1 bg-white"
                      min="0"
                      max="5000"
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={updatePriceFromInputs}
                      className="text-[#000000] text-xs h-6 p-1 bg-white"
                      min="0"
                      max="5000"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[#3464e3] border-[#3464e3]">
                {activeFiltersCount} active
              </Badge>
            </div>
          )}

          {/* Active Filter Badges */}
          {activeFilters.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[#000000] font-medium">Active Filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-[#3464e3] text-white hover:bg-[#2852d1]">
                    {filter.type}: {filter.value}
                    <button
                      onClick={filter.remove}
                      className="ml-2 hover:text-red-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Charts Grid */}
      <section id="charts-grid" className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCharts.map((chart) => (
              <Card key={chart.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="aspect-[16/10] overflow-hidden rounded-t-lg">
                  <img
                    src={chart.heroImage}
                    alt={chart.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg transition-colors group-hover:text-[#d9c409]">
                      {chart.title}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground font-mono">{chart.sku}</span>
                  </div>
                  <CardDescription className="text-sm">
                    {chart.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {chart.standards.slice(0, 2).map(standard => (
                      <Badge key={standard} variant="outline" className="text-xs">
                        {standard}
                      </Badge>
                    ))}
                    {chart.badges.slice(0, 1).map(badge => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    {chart.price_mode === 'rfq' ? (
                      <span className="text-lg font-semibold text-white transition-colors group-hover:text-[#d9c409]">On Request</span>
                    ) : chart.price_from ? (
                    <span className="text-lg font-semibold text-white transition-colors group-hover:text-[#d9c409]">
                      from {chart.price_from}€
                    </span>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" style={{ backgroundColor: '#103e7c', color: 'white' }}>
                      <Link to={`/products/charts/${chart.slug}`}>
                        <FileText className="w-4 h-4 mr-2" />
                        Details
                      </Link>
                    </Button>
                    <Button 
                      variant={chart.price_mode === 'rfq' ? 'outline' : 'secondary'}
                      className="flex-1"
                      style={chart.price_mode !== 'rfq' ? { backgroundColor: '#d9c409', color: 'black' } : { backgroundColor: '#d9c409', color: 'black', border: '1px solid #d9c409' }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {chart.price_mode === 'rfq' ? 'Request Quote' : 'Add to Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCharts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2 text-[#000000]">No Charts Found</h3>
              <p className="text-gray-600 mb-4">
                Try different search terms or filters.
              </p>
              <Button 
                onClick={clearAllFilters} 
                variant="outline" 
                className="border-[#3464e3] text-[#3464e3] hover:bg-[#3464e3] hover:text-white"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Charts;
