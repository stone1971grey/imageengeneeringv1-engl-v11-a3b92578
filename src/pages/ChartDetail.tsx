import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart, FileText, Download, ZoomIn, Star } from "lucide-react";
import { charts } from "@/data/charts";
import NotFound from "./NotFound";

const ChartDetail = () => {
  const { slug } = useParams();
  const chart = charts.find(c => c.slug === slug);
  
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  if (!chart) {
    return <NotFound />;
  }

  // Calculate price based on selected variants
  const calculatePrice = () => {
    if (chart.price_mode === 'rfq' || !chart.price_from) return null;
    
    let totalPrice = chart.price_from;
    
    chart.variants.forEach(variant => {
      const selectedOption = selectedVariants[variant.name];
      if (selectedOption && variant.prices) {
        const optionIndex = variant.options.indexOf(selectedOption);
        if (optionIndex !== -1 && variant.prices[optionIndex]) {
          totalPrice += variant.prices[optionIndex];
        }
      }
    });
    
    return totalPrice;
  };

  const currentPrice = calculatePrice();
  const relatedCharts = charts.filter(c => 
    c.id !== chart.id && 
    (c.categories.some(cat => chart.categories.includes(cat)) ||
     c.applications.some(app => chart.applications.includes(app)))
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Free shipping on orders over €500"
        ctaText="Learn more"
        ctaLink="#"
        icon="calendar"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6" itemScope itemType="https://schema.org/BreadcrumbList">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/" className="hover:text-foreground transition-colors" itemProp="item">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <span>/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/products/charts" className="hover:text-foreground transition-colors" itemProp="item">
                <span itemProp="name">Test Charts</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <span>/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-foreground" itemProp="name">{chart.title}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/products/charts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Charts
          </Link>
        </Button>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden group relative">
              <img
                src={chart.gallery[currentImageIndex] || chart.heroImage}
                alt={chart.title}
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => setShowZoom(true)}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowZoom(true)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            {chart.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {chart.gallery.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${chart.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{chart.title}</h1>
                <span className="text-sm text-muted-foreground font-mono">{chart.sku}</span>
              </div>
              <p className="text-xl text-muted-foreground">{chart.excerpt}</p>
            </div>

            {/* Badges */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium mb-2">Standards</h3>
                <div className="flex flex-wrap gap-2">
                  {chart.standards.map(standard => (
                    <Badge key={standard} variant="outline">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Compatibility</h3>
                <div className="flex flex-wrap gap-2">
                  {chart.compatibility.map(comp => (
                    <Badge key={comp} variant="secondary">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Variants */}
            {chart.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Optionen</h3>
                {chart.variants.map(variant => (
                  <div key={variant.name}>
                    <label className="text-sm font-medium mb-2 block">{variant.name}</label>
                    <Select
                      value={selectedVariants[variant.name] || ""}
                      onValueChange={(value) => 
                        setSelectedVariants(prev => ({ ...prev, [variant.name]: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`${variant.name} wählen`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variant.options.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="p-4 bg-muted/50 rounded-lg">
              {chart.price_mode === 'rfq' ? (
                <div>
                  <span className="text-2xl font-bold text-muted-foreground">Preis auf Anfrage</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kontaktieren Sie uns für ein individuelles Angebot
                  </p>
                </div>
              ) : currentPrice ? (
                <div>
                  <span className="text-2xl font-bold text-primary">
                    {currentPrice.toLocaleString('de-DE')}€
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preis inkl. MwSt., zzgl. Versand
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-bold text-primary">
                    ab {chart.price_from?.toLocaleString('de-DE')}€
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preis abhängig von Größe/Material
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  disabled={chart.variants.some(v => !selectedVariants[v.name])}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {chart.price_mode === 'rfq' ? 'Angebot anfragen' : 'In den Warenkorb'}
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Angebot anfragen
                </Button>
              </div>
              
              {chart.downloads.length > 0 && (
                <Button variant="ghost" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Datenblatt herunterladen
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Beschreibung</TabsTrigger>
            <TabsTrigger value="technical">Technische Daten</TabsTrigger>
            <TabsTrigger value="compatibility">Kompatibilität</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Produktbeschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {chart.description}
                </p>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Anwendungsbereiche</h4>
                    <ul className="space-y-1">
                      {chart.applications.map(app => (
                        <li key={app} className="text-sm text-muted-foreground flex items-center">
                          <Star className="w-3 h-3 mr-2 text-primary fill-current" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Verfügbare Materialien</h4>
                    <ul className="space-y-1">
                      {chart.materials.map(material => (
                        <li key={material} className="text-sm text-muted-foreground flex items-center">
                          <Star className="w-3 h-3 mr-2 text-primary fill-current" />
                          {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="technical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technische Spezifikationen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Verfügbare Größen</h4>
                    <ul className="space-y-2">
                      {chart.sizes.map(size => (
                        <li key={size} className="text-sm text-muted-foreground">
                          {size}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Standards</h4>
                    <ul className="space-y-2">
                      {chart.standards.map(standard => (
                        <li key={standard} className="text-sm text-muted-foreground">
                          {standard}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compatibility" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Software & System Kompatibilität</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chart.compatibility.map(comp => (
                    <div key={comp} className="p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{comp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="downloads" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Downloads & Dokumentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chart.downloads.map(download => (
                    <div key={download.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{download.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({download.type})</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Charts */}
        {relatedCharts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Similar Test Charts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCharts.map(relatedChart => (
                <Card key={relatedChart.id} className="hover:shadow-md transition-shadow">
                  <div className="aspect-[16/10] overflow-hidden rounded-t-lg">
                    <img
                      src={relatedChart.heroImage}
                      alt={relatedChart.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{relatedChart.title}</CardTitle>
                    <CardDescription>{relatedChart.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      {relatedChart.price_mode === 'rfq' ? (
                        <span className="font-semibold text-muted-foreground">On Request</span>
                      ) : (
                        <span className="font-semibold text-primary">
                          from ${relatedChart.price_from}
                        </span>
                      )}
                      <Button size="sm" asChild>
                        <Link to={`/products/charts/${relatedChart.slug}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ChartDetail;