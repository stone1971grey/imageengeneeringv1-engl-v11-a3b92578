import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

// Import lab images
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";
import arcturusSetupVega from "@/assets/arcturus-setup-vega.jpg";
import arcturusLabInstallation from "@/assets/arcturus-automotive-lab-installation.jpg";

const ArcturusInAction = () => {
  return (
    <div className="min-h-screen bg-white font-inter">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 pt-20 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Startseite</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inside-lab">Inside the Lab</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Arcturus HDR Testpaket im Einsatz</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero Section */}
      <div className="bg-scandi-white py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6">
              Arcturus HDR Testpaket 
              <br />
              <span className="text-soft-blue">im Einsatz</span>
            </h1>
            <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-3xl mx-auto">
              Erleben Sie das Arcturus HDR Test Bundle in realen Testumgebungen. Von der Fahrzeugprüfung bis zur präzisen Lichtsteuerung – die Kombination aus Arcturus LED, Vega Software Suite und hochwertigen Testcharts liefert präzise, reproduzierbare Ergebnisse für anspruchsvolle Bildqualitätstests.
            </p>
          </div>
        </div>
      </div>

      {/* Image Sections */}
      <div className="container mx-auto px-6 py-16">
        <div className="space-y-16">
          
          {/* First Image Section */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={arcturusRealisticLab}
                alt="HDR Szenario-Test mit Vega & Arcturus"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
            <p className="text-center text-gray-600 text-lg mt-4 font-light">
              HDR Szenario-Test mit Vega & Arcturus
            </p>
          </div>

          {/* Second Image Section */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={arcturusSetupVega}
                alt="Präzisionsaufbau für MMP-Messung nach IEEE P2020"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
            <p className="text-center text-gray-600 text-lg mt-4 font-light">
              Präzisionsaufbau für MMP-Messung nach IEEE P2020
            </p>
          </div>

          {/* Third Image Section */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={arcturusLabInstallation}
                alt="Automotive Kamera-Testumgebung mit Arcturus Bundle"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
            <p className="text-center text-gray-600 text-lg mt-4 font-light">
              Automotive Kamera-Testumgebung mit Arcturus Bundle
            </p>
          </div>

        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-scandi-light-grey py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Möchten Sie Ihr eigenes Testlabor einrichten?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
            Unsere Experten unterstützen Sie bei der Planung und Implementierung 
            Ihrer individuellen Arcturus HDR Testlösung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium">
              <Link to="/contact">
                Jetzt Beratungstermin vereinbaren
              </Link>
            </Button>
            <Button variant="outline" className="border-scandi-grey text-scandi-grey px-8 py-3 text-lg font-medium hover:bg-scandi-light-grey">
              <Link to="/solution/arcturus-bundle">
                Zum Arcturus HDR Bundle
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcturusInAction;