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
import { Search, Filter, ShoppingCart, FileText, X, ArrowUpDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { charts, categories, applications, standards, materials, formats } from "@/data/charts";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";

const Charts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("5000");
  const [sortBy, setSortBy] = useState("relevance");
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
      type: 'Kategorie',
      value: cat,
      remove: () => setSelectedCategories(prev => prev.filter(c => c !== cat))
    }));
    
    selectedApplications.forEach(app => filters.push({
      type: 'Anwendung', 
      value: app,
      remove: () => setSelectedApplications(prev => prev.filter(a => a !== app))
    }));
    
    selectedStandards.forEach(std => filters.push({
      type: 'Standard',
      value: std, 
      remove: () => setSelectedStandards(prev => prev.filter(s => s !== std))
    }));
    
    selectedMaterials.forEach(mat => filters.push({
      type: 'Material',
      value: mat,
      remove: () => setSelectedMaterials(prev => prev.filter(m => m !== mat))
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

      // Standards filter
      const standardMatch = selectedStandards.length === 0 || 
        chart.standards.some(std => selectedStandards.includes(std));

      // Materials filter
      const materialMatch = selectedMaterials.length === 0 || 
        chart.materials.some(mat => selectedMaterials.includes(mat));

      // Formats filter
      const formatMatch = selectedFormats.length === 0 || 
        chart.sizes.some(size => selectedFormats.includes(size));

      // Price filter
      const priceMatch = chart.price_mode === 'rfq' || 
        !chart.price_from || 
        (chart.price_from >= priceRange[0] && chart.price_from <= priceRange[1]);

      return searchMatch && categoryMatch && applicationMatch && standardMatch && materialMatch && formatMatch && priceMatch;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => (a.price_from || 0) - (b.price_from || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => (b.price_from || 0) - (a.price_from || 0));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Relevance - keep original order
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, selectedApplications, selectedStandards, selectedMaterials, selectedFormats, priceRange, sortBy]);

  const activeFilters = getAllActiveFilters();
  const activeFiltersCount = activeFilters.length;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedApplications([]);
    setSelectedStandards([]);
    setSelectedMaterials([]);
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
    <Accordion type="multiple" className="w-full">
      {/* Category Filter */}
      <AccordionItem value="categories" className="border-b border-gray-200">
        <AccordionTrigger className="text-[#111111] font-medium hover:no-underline">
          Kategorie {selectedCategories.length > 0 && `(${selectedCategories.length})`}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-3 text-sm text-[#111111] cursor-pointer">
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
      <AccordionItem value="applications" className="border-b border-gray-200">
        <AccordionTrigger className="text-[#111111] font-medium hover:no-underline">
          Anwendung {selectedApplications.length > 0 && `(${selectedApplications.length})`}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {applications.map(application => (
              <label key={application} className="flex items-center space-x-3 text-sm text-[#111111] cursor-pointer">
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

      {/* Standards Filter */}
      <AccordionItem value="standards" className="border-b border-gray-200">
        <AccordionTrigger className="text-[#111111] font-medium hover:no-underline">
          Standard {selectedStandards.length > 0 && `(${selectedStandards.length})`}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {standards.map(standard => (
              <label key={standard} className="flex items-center space-x-3 text-sm text-[#111111] cursor-pointer">
                <Checkbox
                  checked={selectedStandards.includes(standard)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedStandards([...selectedStandards, standard]);
                    } else {
                      setSelectedStandards(selectedStandards.filter(s => s !== standard));
                    }
                  }}
                />
                <span>{standard}</span>
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Materials Filter */}
      <AccordionItem value="materials" className="border-b border-gray-200">
        <AccordionTrigger className="text-[#111111] font-medium hover:no-underline">
          Material {selectedMaterials.length > 0 && `(${selectedMaterials.length})`}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {materials.map(material => (
              <label key={material} className="flex items-center space-x-3 text-sm text-[#111111] cursor-pointer">
                <Checkbox
                  checked={selectedMaterials.includes(material)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMaterials([...selectedMaterials, material]);
                    } else {
                      setSelectedMaterials(selectedMaterials.filter(m => m !== material));
                    }
                  }}
                />
                <span>{material}</span>
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Formats Filter */}
      <AccordionItem value="formats" className="border-b border-gray-200">
        <AccordionTrigger className="text-[#111111] font-medium hover:no-underline">
          Format/Größe {selectedFormats.length > 0 && `(${selectedFormats.length})`}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {formats.map(format => (
              <label key={format} className="flex items-center space-x-3 text-sm text-[#111111] cursor-pointer">
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
      <AccordionItem value="price" className="border-b border-gray-200">
        <AccordionTrigger className="text-[#111111] font-medium hover:no-underline">
          Preisbereich (EUR)
        </AccordionTrigger>
        <AccordionContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <Slider
                value={priceRange}
                onValueChange={handlePriceSliderChange}
                max={5000}
                step={50}
                className="mb-4"
              />
              <div className="flex justify-between text-xs text-gray-600 mb-4">
                <span>{priceRange[0]}€</span>
                <span>{priceRange[1]}€</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[#111111] mb-1">Min (€)</label>
                <Input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={updatePriceFromInputs}
                  className="text-[#111111] text-sm"
                  min="0"
                  max="5000"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[#111111] mb-1">Max (€)</label>
                <Input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={updatePriceFromInputs}
                  className="text-[#111111] text-sm"
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
        message="Kostenloser Versand ab 500€ Bestellwert"
        ctaText="Mehr erfahren"
        ctaLink="#"
        icon="calendar"
      />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 animate-fade-in">
          <img 
            src={precisionTestingHero} 
            alt="Testcharts für präzise Bildqualitätsmessungen" 
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-black/15"></div>
        </div>

        <div className="h-16"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="mb-8" itemScope itemType="https://schema.org/BreadcrumbList">
              <ol className="flex items-center space-x-2 text-sm text-white/80">
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <Link to="/" className="hover:text-white transition-colors" itemProp="item">
                    <span itemProp="name">Home</span>
                  </Link>
                  <meta itemProp="position" content="1" />
                </li>
                <span className="text-white/60">/</span>
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <span className="text-white" itemProp="name">Testcharts</span>
                  <meta itemProp="position" content="2" />
                </li>
              </ol>
            </nav>

            <div className="mb-8">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[0.9] tracking-tight mb-6 -mt-32 pt-32">
                Test Charts – Präzision
                <br />
                <span className="font-medium" style={{ color: '#1f6ae8' }}>für jede Anwendung</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl">
                Unsere umfassende Auswahl an Testcharts für alle Kamera- und Bildqualitätstests – von Low-Light bis Ultra-HD.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={scrollToCharts}
                className="text-white px-8"
                style={{ backgroundColor: '#1f6ae8' }}
              >
                Alle Charts entdecken
              </Button>
              <Button 
                size="lg" 
                onClick={scrollToFooterExpert}
                className="text-white px-8"
                style={{ backgroundColor: '#7a933b' }}
              >
                Beratung anfragen
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#7a933b]/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#7a933b]/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#111111] mb-2">Finden und Sortieren Sie Ihre perfekten Testcharts</h2>
            <p className="text-gray-600">Nutzen Sie unsere Filter und Suchfunktion für präzise Suchergebnisse</p>
          </div>
          
          {/* Search Bar - Full Width */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Suche nach Titel, SKU oder Tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg bg-white text-[#111111] border-gray-300 focus:border-[#3464e3] focus:ring-[#3464e3]"
              />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            {/* Mobile Filter Button - Left */}
            <div className="lg:hidden">
              <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-[#111111] border-gray-300"
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
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle className="text-[#111111]">Filter & Sortierung</DrawerTitle>
                    <DrawerClose className="absolute right-4 top-4" />
                  </DrawerHeader>
                  <div className="px-4 pb-6 overflow-y-auto">
                    <FilterContent />
                    <div className="mt-6 pt-4 border-t">
                      <Button 
                        onClick={() => setMobileFiltersOpen(false)}
                        className="w-full"
                        style={{ backgroundColor: '#3464e3' }}
                      >
                        Filter anwenden
                      </Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-[#111111] font-medium">Filter:</span>
              {activeFiltersCount > 0 && (
                <Badge variant="outline" className="text-[#3464e3] border-[#3464e3]">
                  {activeFiltersCount} aktiv
                </Badge>
              )}
            </div>

            {/* Sort & Results Count */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white text-[#111111] border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#3464e3] focus:ring-[#3464e3]"
                >
                  <option value="relevance">Relevanz</option>
                  <option value="price-asc">Preis ↑</option>
                  <option value="price-desc">Preis ↓</option>
                  <option value="title">Titel A-Z</option>
                </select>
              </div>

              <div className="text-[#111111] font-semibold bg-gray-100 px-3 py-2 rounded-md">
                {filteredCharts.length} Charts gefunden
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilters.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[#111111] font-medium">Aktive Filter:</span>
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
                  Alle löschen
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Filters - Accordion */}
          <div className="hidden lg:block">
            <FilterContent />
          </div>
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
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
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
                      <span className="text-lg font-semibold text-muted-foreground">Auf Anfrage</span>
                    ) : chart.price_from ? (
                      <span className="text-lg font-semibold text-primary">
                        ab {chart.price_from}€
                      </span>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" style={{ backgroundColor: '#3464e3' }}>
                      <Link to={`/products/charts/${chart.slug}`}>
                        <FileText className="w-4 h-4 mr-2" />
                        Details
                      </Link>
                    </Button>
                    <Button 
                      variant={chart.price_mode === 'rfq' ? 'outline' : 'secondary'}
                      className="flex-1"
                      style={chart.price_mode !== 'rfq' ? { backgroundColor: '#3464e3', color: 'white' } : {}}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {chart.price_mode === 'rfq' ? 'Anfragen' : 'In den Warenkorb'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCharts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2 text-[#111111]">Keine Charts gefunden</h3>
              <p className="text-gray-600 mb-4">
                Versuchen Sie es mit anderen Suchbegriffen oder Filtern.
              </p>
              <Button 
                onClick={clearAllFilters} 
                variant="outline" 
                className="border-[#3464e3] text-[#3464e3] hover:bg-[#3464e3] hover:text-white"
              >
                Alle Filter zurücksetzen
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
