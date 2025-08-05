import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Camera, TestTube, Monitor, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import automotiveLab from "@/assets/automotive-lab.jpg";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";

// Automotive landing page component
const Automotive = () => {
  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'applications', label: 'Use Cases' },
    { id: 'products', label: 'Products' },
    { id: 'contact', label: 'Contact' }
  ];

  const applications = [
    {
      title: "Kamera-Tests für ADAS-Systeme",
      description: "Umfassende Validierung von Fahrerassistenz-Kameras für Sicherheitskonformität",
      icon: Camera
    },
    {
      title: "High-End Sensor-Tests",
      description: "Präzisions-LED-Beleuchtung für Tests anspruchsvoller Sensorsysteme und Komponenten",
      icon: TestTube
    },
    {
      title: "HDR-Szenen-Erstellung",
      description: "Erweiterte Beleuchtungssteuerung für die Erstellung von High Dynamic Range Testszenarien",
      icon: Monitor
    },
    {
      title: "Schwachlicht-Leistungstests",
      description: "Kritische Validierung für Nachtfahrten und herausfordernde Beleuchtungsbedingungen",
      icon: Camera
    }
  ];

  const products = [
    {
      title: "Arcturus",
      description: "Hochleistungs-LED-Beleuchtung für automotive Tests, HDR-Szenen & High-End-Sensoren",
      image: "/src/assets/arcturus-main-product.png",
      link: "/product/arcturus"
    },
    {
      title: "TE42-LL",
      description: "Schwachlicht-Testtafel für automotive Kameravalidierung",
      image: "/placeholder.svg"
    },
    {
      title: "camSPECS XL",
      description: "Spektrale Empfindlichkeitsmesssystem",
      image: "/placeholder.svg"
    },
    {
      title: "iQ-Analyzer-X",
      description: "Bildqualitätsbewertungs-Softwaresuite",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />
        <AnnouncementBanner 
        message="Automotive Vision Excellence"
        ctaText="Mehr erfahren"
        ctaLink="#"
        icon="calendar"
      />

      {/* Hero Section - starts immediately after navigation */}
      <section id="introduction" className="min-h-screen bg-scandi-white font-inter">
        {/* Navigation Spacer */}
        <div className="h-16"></div>
        
        {/* Hero Content */}
        <div id="hero-start" className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            
            {/* Left Content */}
            <div className="space-y-8 lg:pr-8">
              <div>
                <h1 id="automotive-hero" className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6 -mt-64 pt-64">
                  Bildqualität
                  <br />
                  <span className="font-medium text-soft-blue">für die Straße</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                  Präzisions-entwickelte Kamera-Testlösungen 
                  für Fahrzeugsicherheit und Innovation.
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  size="lg"
                  className="bg-soft-blue hover:bg-soft-blue/90 text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                >
                  Jetzt Automotive-Lösungen entdecken
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Minimal stats */}
              <div className="flex items-center space-x-12 pt-8">
                <div>
                  <div className="text-2xl font-medium text-light-foreground">99.9%</div>
                  <div className="text-sm text-scandi-grey font-light">Genauigkeit</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">50ms</div>
                  <div className="text-sm text-scandi-grey font-light">Reaktion</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">100+</div>
                  <div className="text-sm text-scandi-grey font-light">Projekte</div>
                </div>
              </div>
            </div>

            {/* Right Content - Video/Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg shadow-soft">
                <img 
                  src={automotiveLab}
                  alt="Automotive camera testing laboratory"
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
                
                {/* Video overlay simulation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                
                {/* Play button overlay for video feeling */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey">
                <div className="text-sm text-scandi-grey font-light mb-1">Live-Verarbeitung</div>
                <div className="text-2xl font-medium text-light-foreground">Aktiv</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Overview */}
      <section id="applications" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hauptanwendungen
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Wesentliche Testlösungen für automotive Kamerasysteme
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {applications.map((app, index) => {
              const IconComponent = app.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                    {app.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* camPAS Testing Section */}
        <div className="container mx-auto px-6 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  camPAS - Camera Performance für Automotive-Systeme
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                  Der camPAS (Camera Performance for Automotive Systems) Test ist ein einzigartig entwickelter Bildqualitäts-Leistungstest für Kamerabilqualität und Sensorsysteme in der Automobilindustrie. Wir bieten camPAS für Kunden an, die unabhängige und objektive Testergebnisse von einer neutralen dritten Partei benötigen, um ihre Entwicklungsentscheidungen zu unterstützen.
                </p>
              </div>

              <div className="mb-12">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Aktuelle Arbeitsgruppen, z.B. <a href="https://sagroups.ieee.org/2020/" className="text-blue-600 hover:underline">IEEE-P2020</a>, arbeiten an einem international anerkannten Bildqualitätstest-Standard für automotive Kamerasysteme. Die Veröffentlichung von IEEE-P2020 wird für Ende 2024 erwartet. Derzeit gibt es keine branchenweiten Teststandards. Die Entwicklung des camPAS-Tests entstand durch die Unterstützung unserer Kunden bei der Suche nach und Erstellung von Testmethoden, die unvoreingenommene Ergebnisse liefern. Als aktives Mitglied von IEEE-P2020 können wir die neuesten automotive Kameratest-Methoden und -Verfahren aus dem Standard direkt implementieren, um camPAS relevant und aktuell zu halten.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 mb-12">
                {/* Manufacturers Section */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="mb-6">
                    <img 
                      src={manufacturersImage}
                      alt="Manufacturers workflow diagram"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Hersteller</h4>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Der Hersteller in dieser Situation profitiert von der Expertise und maßgeschneiderten Tests, die Image Engineering als dritte Partei anbietet. Die objektiven Tests können dem Hersteller dabei helfen, den am besten geeigneten Sensor (aus einer breiten Palette verfügbarer Sensoren) für ihre Anforderungen zu finden.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Wir arbeiten mit ihnen zusammen, um einen maßgeschneiderten camPAS-Test basierend auf ihren Spezifikationen zu erstellen und durchzuführen. Unsere Ingenieure liefern dann objektive Ergebnisse, damit der Hersteller eine fundierte Entscheidung treffen kann.
                  </p>
                </div>

                {/* Suppliers Section */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="mb-6">
                    <img 
                      src={suppliersImage}
                      alt="Suppliers workflow diagram"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-6">Zulieferer</h4>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Der Zulieferer in diesem Szenario kann ebenfalls davon profitieren, Image Engineering als neutrale Drittpartei-Beratung zu nutzen. Bevor der Zulieferer seine Geräte an den Endverbraucher-Hersteller liefert, kann er sie zur Validierung mittels camPAS-Test an Image Engineering senden.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Nach Abschluss eines camPAS-Tests weisen unsere Ingenieure auf potenzielle Bildqualitätsverbesserungen hin. Wir können oft auch Bugs, Fehler und andere Probleme erkennen, die der Zulieferer verbessern kann, bevor er seine Geräte an den Hersteller liefert.
                  </p>
                </div>
              </div>

              {/* What tests are included */}
              <div className="bg-blue-50 rounded-2xl p-8">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Welche Tests sind in camPAS enthalten?</h4>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Der Unterschied zwischen einem camPAS-Test und einer Standardtestmethode ist die Möglichkeit, den camPAS-Test vollständig an die Kundenspezifikationen anzupassen. Wir bewerten Kamerasysteme anhand verschiedener Bildqualitäts-KPIs oder nutzen Tests zur Analyse der Glätte oder Fehleranfälligkeit des Sensors.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Einige der häufigsten Bildqualitäts-KPIs, die wir testen, umfassen Kontrastübertragungsgenauigkeit (CTA), modulierte Lichtminderungswahrscheinlichkeit (Flimmern), hoher Dynamikbereich (HDR), visuelle Bewertung der Schwachlichtleistung etc. Diese Tests werden mit den neuesten Techniken (wie sie in IEEE-P2020 beschrieben sind) und Geräten durchgeführt, um höchste Ergebnisse zu gewährleisten.
                </p>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Es ist wichtig zu beachten, dass diese KPIs nur Beispiele sind und wir eine umfangreiche Palette von KPIs für Kamera- und Sensorsysteme testen. camPAS-Tests sind keine vorgefertigten Tests und erfordern stattdessen eine Beratung mit unserem Testlabor, um sicherzustellen, dass wir einen Test entwerfen, der den Kundenanforderungen entspricht.
                </p>
                
                <div className="text-center">
                  <Button 
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    iQ-Lab für camPAS-Beratung kontaktieren
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* IEEE-P2020 Product Bundle Section */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">IEEE-P2020 Produktpaket</h4>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  <a href="https://sagroups.ieee.org/2020/" className="text-blue-600 hover:underline">IEEE-P2020</a> etabliert einen international anerkannten Standard für automotive und ADAS-Anwendungen. Dieser Standard behandelt die grundlegenden KPIs, die zur Bildqualität automotive Kamerasysteme beitragen. Im Gegensatz zu den meisten Kameraindustrien sind automotive und ADAS-Anwendungen einzigartig, da sie direkt die Verbrauchersicherheit betreffen.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Während der Entwicklung des Standards wurde klar, dass neue Metriken etabliert werden müssen, um den einzigartigen Umgebungen Rechnung zu tragen, in denen autonome Fahrsysteme operieren müssen. Direktes Sonnenlicht, dichter Nebel, schwaches Licht, flackernde Lichter und starker Fußgängerverkehr sind nur einige der Umgebungen, in denen ADAS-Systeme operieren. Die neuen KPIs zur Bewältigung dieser Testherausforderungen umfassen Kontrastübertragungsgenauigkeit (CTA), modulierte Lichtminderungswahrscheinlichkeit (MMP - Flimmern), Kontrast-Signal-Rausch-Verhältnis (CSNR) und hoher Dynamikbereich (HDR), unter anderem.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Diese KPIs erfordern neue Testmethoden und Geräte. Wir haben viele unserer neueren Kameratestgeräte basierend auf den im Standard beschriebenen Testverfahren entwickelt und bieten ein Produktpaket für diejenigen an, die heute mit IEEE-P2020-Messungen beginnen möchten.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Vega Light Source */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">Vega Hochintensive Lichtquelle</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Eine hochintensive Lichtquelle basierend auf DC-Technologie mit extrem hoher Stabilität für die Messung von Kameras mit sehr kurzen Belichtungszeiten.
                    </p>
                  </div>

                  {/* TE294 Test Chart */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">Vega Testtafel (TE294)</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Eine einzigartige Graustufen-Testtafel mit 36 Feldern und 10:1 Kontrast für Hochpräzisionsmessungen von automotive Kamerasystemen.
                    </p>
                  </div>

                  {/* VLS Software */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">VLS Software</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Evaluierungssoftware, die CTA-, MMP- und CSNR-Messungen und -Bewertungen für vielseitige Lichtsystemtests unterstützt.
                    </p>
                  </div>

                  {/* Vega API */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">Vega API</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Flexible Workflows mit C++-basierter API, die C-Schnittstellen und Python-Beispielskripte für vollständige Integrationsflexibilität bietet.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <p className="text-sm text-gray-700 mb-4">
                    <strong>Wichtiger Hinweis:</strong> Dieses Paket enthält ein Vega-Gerät, eine Steuerung und eine Testtafel. Zusätzliche Vega-Geräte und Tafeln können separat erworben werden (eine Steuerung kann bis zu sieben Vega-Geräte steuern).
                  </p>
                  <div className="text-center">
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                      Vertrieb für IEEE-P2020 Paket kontaktieren
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Empfohlene Produkte
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Branchenführende Tools für automotive Kameratests
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {products.map((product, index) => (
              <Card 
                key={index}
                className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img 
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {product.description}
                    </p>
                    {product.link ? (
                      <Link to={product.link}>
                        <Button 
                          variant="outline" 
                          className="w-full border-gray-200 hover:border-blue-600 hover:text-blue-600"
                        >
                          Mehr erfahren
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-200 hover:border-blue-600 hover:text-blue-600"
                      >
                        Mehr erfahren
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote/Testimonial Block */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-light text-gray-900 italic mb-8 leading-relaxed">
              "Vertraut von OEMs und Tier-1-Zulieferern weltweit"
            </blockquote>
            <div className="flex items-center justify-center space-x-8 text-gray-600">
              <span className="font-medium">BMW</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="font-medium">Bosch</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="font-medium">Continental</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="font-medium">Aptiv</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Bereit, Ihre automotive Vision-Systeme zu verbessern?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Verbinden Sie sich mit unseren Automotive-Experten und entdecken Sie, wie unsere 
              Testlösungen Ihren Entwicklungsprozess beschleunigen können.
            </p>
            
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg group"
            >
              Mit unserem Automotive-Experten sprechen
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-gray-500 mt-6">
              Kostenlose Beratung • Expertenführung • Keine Verpflichtungen
            </p>
          </div>
        </div>
        </section>
    </div>
  );
};

export default Automotive;