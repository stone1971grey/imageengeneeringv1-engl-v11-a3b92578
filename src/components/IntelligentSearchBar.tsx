import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { charts } from "@/data/charts";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'chart' | 'industry' | 'product' | 'solution' | 'page';
  url: string;
  badges?: string[];
  excerpt?: string;
}

interface SearchBarProps {
  variant?: 'desktop' | 'mobile';
}

const IntelligentSearchBar = ({ variant = 'desktop' }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Static search data for navigation items and pages
  const staticSearchData: SearchResult[] = [
    // Pages
    { id: 'home', title: 'Home', description: 'Image Engineering main page', category: 'page', url: '/' },
    { id: 'charts', title: 'Test Charts', description: 'All available test charts and calibration solutions', category: 'page', url: '/charts' },
    { id: 'downloads', title: 'Downloads', description: 'Data sheets, software and documentation', category: 'page', url: '/downloads' },
    { id: 'automotive', title: 'Automotive', description: 'ADAS Testing and Automotive Vision solutions', category: 'page', url: '/automotive' },
    { id: 'products', title: 'Products', description: 'Overview of all products and solutions', category: 'page', url: '/products' },
    { id: 'industries', title: 'Industries', description: 'Solutions for various industry sectors', category: 'page', url: '/industries' },
    { id: 'events', title: 'Events', description: 'Upcoming events and training sessions', category: 'page', url: '/events' },
    
    // Industries
    { id: 'industry-photography', title: 'Photography', description: 'Digital cameras for professional and amateur applications', category: 'industry', url: '/industries#photography' },
    { id: 'industry-mobile', title: 'Mobile Phones', description: 'Image quality testing according to VCX standards', category: 'industry', url: '/industries#mobile' },
    { id: 'industry-automotive', title: 'Automotive & ADAS', description: 'Camera systems in vehicles, driver assistance and autonomous driving', category: 'industry', url: '/automotive' },
    { id: 'industry-broadcast', title: 'Broadcast & HDTV', description: 'Video transmission, TV cameras, color-accurate reproduction', category: 'industry', url: '/industries#broadcast' },
    { id: 'industry-security', title: 'Security / Surveillance', description: 'CCTV systems, video surveillance', category: 'industry', url: '/industries#security' },
    { id: 'industry-machine-vision', title: 'Machine Vision', description: 'Camera systems for inspection, robotics, quality control', category: 'industry', url: '/industries#machine-vision' },
    { id: 'industry-medical', title: 'Medical / Endoscopy', description: 'Image quality in medical imaging and diagnostic systems', category: 'industry', url: '/industries#medical' },
    { id: 'industry-scanning', title: 'Scanning & Archiving', description: 'Quality assurance in digitization of documents, books, photos', category: 'industry', url: '/industries#scanning' },
    { id: 'industry-lab', title: 'iQ‑Lab Testing', description: 'Independent laboratory services for numerous industries', category: 'industry', url: '/inside-lab' },

    // Products
    { id: 'product-charts', title: 'Charts', description: 'High-precision test patterns and color charts', category: 'product', url: '/charts' },
    { id: 'product-equipment', title: 'Equipment', description: 'Professional testing equipment including LED lighting systems', category: 'product', url: '/products#equipment' },
    { id: 'product-software', title: 'Software', description: 'Advanced software solutions for image analysis', category: 'product', url: '/products#software' },
    { id: 'product-bundles', title: 'Product Bundles', description: 'Complete testing solutions with hardware, software and accessories', category: 'product', url: '/products#bundles' },
    { id: 'product-solutions', title: 'Solutions', description: 'Complete lighting and illumination solutions', category: 'product', url: '/products#solutions' },
    { id: 'product-accessories', title: 'Accessories', description: 'Professional accessories including chart cases, mounts', category: 'product', url: '/products#accessories' },
    { id: 'product-training', title: 'Training', description: 'Professional training on image quality testing', category: 'product', url: '/products#training' },

    // Solutions
    { id: 'solution-camera-validation', title: 'Camera Quality Validation', description: 'For camera manufacturers who need precise lighting systems', category: 'solution', url: '/products#camera-validation' },
    { id: 'solution-adas', title: 'In-Cabin Performance Testing', description: 'For developers of driver assistance systems', category: 'solution', url: '/automotive' },
    { id: 'solution-smartphones', title: 'Test Environments for Smartphones & Displays', description: 'For OEMs and research in color reproduction', category: 'solution', url: '/products#smartphones' },
    { id: 'solution-medical', title: 'Microscopy & Medical Imaging', description: 'For medical technology & life sciences', category: 'solution', url: '/products#medical' },
    { id: 'solution-iso', title: 'ISO and IEEE Compliant Test Setups', description: 'For companies that need standards-compliant environments', category: 'solution', url: '/products#iso' },
  ];

  // Search function
  const performSearch = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search in charts
    charts.forEach(chart => {
      const matchScore = calculateMatchScore(chart, query);
      if (matchScore > 0) {
        results.push({
          id: chart.id,
          title: chart.title,
          description: chart.excerpt || chart.description,
          category: 'chart',
          url: `/charts/${chart.slug}`,
          badges: chart.badges,
          excerpt: chart.excerpt
        });
      }
    });

    // Search in static data
    staticSearchData.forEach(item => {
      const matchScore = calculateStaticMatchScore(item, query);
      if (matchScore > 0) {
        results.push(item);
      }
    });

    // Sort by relevance and return top 8 results
    return results.slice(0, 8);
  };

  const calculateMatchScore = (chart: any, query: string): number => {
    let score = 0;
    
    // Title match (highest priority)
    if (chart.title.toLowerCase().includes(query)) score += 10;
    
    // SKU match
    if (chart.sku.toLowerCase().includes(query)) score += 8;
    
    // Description/excerpt match
    if (chart.excerpt?.toLowerCase().includes(query)) score += 6;
    if (chart.description?.toLowerCase().includes(query)) score += 4;
    
    // Applications match
    if (chart.applications?.some((app: string) => app.toLowerCase().includes(query))) score += 5;
    
    // Categories match
    if (chart.categories?.some((cat: string) => cat.toLowerCase().includes(query))) score += 4;
    
    // Standards match
    if (chart.standards?.some((std: string) => std.toLowerCase().includes(query))) score += 3;
    
    // Badges match
    if (chart.badges?.some((badge: string) => badge.toLowerCase().includes(query))) score += 3;

    return score;
  };

  const calculateStaticMatchScore = (item: SearchResult, query: string): number => {
    let score = 0;
    
    if (item.title.toLowerCase().includes(query)) score += 10;
    if (item.description.toLowerCase().includes(query)) score += 6;
    
    return score;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chart': return '📊';
      case 'industry': return '🏭';
      case 'product': return '📦';
      case 'solution': return '💡';
      case 'page': return '📄';
      default: return '🔍';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'chart': return 'Test Chart';
      case 'industry': return 'Industry';
      case 'product': return 'Product';
      case 'solution': return 'Solution';
      case 'page': return 'Page';
      default: return 'Result';
    }
  };

  // Handle search input changes
  useEffect(() => {
    const searchResults = performSearch(query);
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    navigate(result.url);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${variant === 'mobile' ? 'text-gray-500' : 'text-muted-foreground'}`} />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={variant === 'mobile' 
            ? "pl-10 pr-10 w-full bg-gray-100 border-gray-300 text-black placeholder:text-gray-500 focus:bg-white focus:border-gray-400"
            : "pl-10 pr-10 w-36 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white focus:text-black focus:placeholder:text-muted-foreground"
          }
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {getCategoryIcon(result.category)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {result.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(result.category)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                      {result.badges && result.badges.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {result.badges.slice(0, 3).map((badge, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelligentSearchBar;