import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Download, Lock, FileText, Image, Video, FileCode, File } from "lucide-react";
import { Link } from "react-router-dom";
import RegularNavigation from "@/components/RegularNavigation";

const Downloads = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  const documentTypes = [
    { id: "pdf", label: "PDF-Dokumente" },
    { id: "video", label: "Video-Tutorials" },
    { id: "code", label: "Code-Beispiele" },
    { id: "image", label: "Technische Diagramme" }
  ];

  const products = [
    { value: "all", label: "Alle Produkte" },
    { value: "adas", label: "ADAS Test Suite" },
    { value: "analytics", label: "Bildanalytik" },
    { value: "calibration", label: "Kalibrierungs-Tools" }
  ];

  const languages = [
    { value: "all", label: "Alle Sprachen" },
    { value: "en", label: "Englisch" },
    { value: "de", label: "Deutsch" },
    { value: "fr", label: "Französisch" }
  ];

  const files = [
    {
      id: 1,
      title: "ADAS Testing Methodology Whitepaper",
      type: "pdf",
      product: "adas",
      language: "en",
      size: "2.4 MB",
      restricted: false,
      icon: FileText
    },
    {
      id: 2,
      title: "Camera Calibration Quick Start Guide",
      type: "pdf", 
      product: "calibration",
      language: "en",
      size: "1.8 MB",
      restricted: false,
      icon: FileText
    },
    {
      id: 3,
      title: "Advanced Analytics Tutorial Video",
      type: "video",
      product: "analytics", 
      language: "en",
      size: "45.2 MB",
      restricted: true,
      icon: Video
    },
    {
      id: 4,
      title: "Python SDK Documentation",
      type: "code",
      product: "adas",
      language: "en", 
      size: "892 KB",
      restricted: false,
      icon: FileCode
    },
    {
      id: 5,
      title: "System Architecture Diagram",
      type: "image",
      product: "analytics",
      language: "all",
      size: "3.1 MB", 
      restricted: false,
      icon: Image
    },
    {
      id: 6,
      title: "Technische Spezifikation (German)",
      type: "pdf",
      product: "calibration",
      language: "de",
      size: "1.5 MB",
      restricted: true,
      icon: FileText
    }
  ];

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, typeId]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== typeId));
    }
  };

  const filteredFiles = files.filter(file => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(file.type);
    const productMatch = selectedProduct === "all" || file.product === selectedProduct;
    const languageMatch = selectedLanguage === "all" || file.language === selectedLanguage || file.language === "all";
    
    return typeMatch && productMatch && languageMatch;
  });

  return (
    <div className="min-h-screen bg-downloads-bg font-inter">
      {/* Regular Navigation */}
      <RegularNavigation />
      
      {/* BREADCRUMB UNTER DER NAVIGATION */}
      <div style={{
        position: 'fixed',
        top: '160px',
        left: '0',
        right: '0',
        backgroundColor: '#f8f9fa',
        color: '#333',
        padding: '12px 0',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999',
        borderBottom: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 24px'}}>
          <Link to="/" style={{color: '#0066cc', textDecoration: 'underline', marginRight: '8px'}}>
            Home
          </Link>
          <span style={{color: '#6c757d', margin: '0 8px'}}>/</span>
          <span style={{color: '#495057', fontWeight: '600'}}>Downloads</span>
        </div>
      </div>
      
      {/* Extra Spacer für fixed breadcrumb */}
      <div style={{height: '180px'}}></div>

      {/* Header */}
      <div className="bg-scandi-white border-b border-downloads-border">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-downloads-text leading-[0.9] tracking-tight mb-6">
              Downloads &
              <br />
              <span className="font-medium">Ressourcen</span>
            </h1>
            <p className="text-lg text-scandi-grey font-light">
              Zugriff auf technische Dokumentationen, Tutorials und Entwicklungsressourcen für unsere Bildverarbeitungslösungen.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-16 bg-scandi-white border-b border-downloads-border z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            
            {/* Document Types */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-downloads-text mb-3">Dokumenttyp</label>
              <div className="flex flex-wrap gap-4">
                {documentTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={(checked) => handleTypeChange(type.id, checked as boolean)}
                      className="border-downloads-border data-[state=checked]:bg-soft-blue data-[state=checked]:border-soft-blue"
                    />
                    <label htmlFor={type.id} className="text-sm text-downloads-text cursor-pointer">
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-downloads-text mb-3">Produkt</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="bg-scandi-white border-downloads-border text-downloads-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-scandi-white border-downloads-border z-50">
                  {products.map((product) => (
                    <SelectItem key={product.value} value={product.value} className="text-downloads-text">
                      {product.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-downloads-text mb-3">Sprache</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="bg-scandi-white border-downloads-border text-downloads-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-scandi-white border-downloads-border z-50">
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value} className="text-downloads-text">
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-6">
          <p className="text-sm text-scandi-grey">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'Datei' : 'Dateien'} gefunden
          </p>
        </div>

        <div className="grid gap-4">
          {filteredFiles.map((file) => {
            const IconComponent = file.icon;
            
            return (
              <div
                key={file.id}
                className="bg-scandi-white border border-downloads-border hover:bg-downloads-hover transition-colors duration-200 group"
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-downloads-bg rounded border border-downloads-border group-hover:bg-scandi-white transition-colors">
                      <IconComponent className="h-5 w-5 text-scandi-grey" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-medium text-downloads-text truncate">
                          {file.title}
                        </h3>
                        {file.restricted && (
                          <Lock className="h-4 w-4 text-soft-blue flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-scandi-grey">
                        {file.size} • {products.find(p => p.value === file.product)?.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {file.restricted ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-soft-blue text-soft-blue hover:bg-soft-blue hover:text-white"
                      >
                        Zugriff anfordern
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-soft-blue hover:bg-soft-blue/90 text-white group/btn"
                      >
                        <Download className="h-4 w-4 mr-2 group-hover/btn:translate-y-0.5 transition-transform" />
                        Herunterladen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <File className="h-12 w-12 text-scandi-grey mx-auto mb-4" />
            <h3 className="text-lg font-medium text-downloads-text mb-2">Keine Dateien gefunden</h3>
            <p className="text-scandi-grey">Versuchen Sie, Ihre Filter anzupassen, um mehr Ergebnisse zu sehen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;