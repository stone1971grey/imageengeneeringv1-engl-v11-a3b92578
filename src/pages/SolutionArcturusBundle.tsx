import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const SolutionArcturusBundle = () => {
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
                <Link to="/products">Produkte</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <span className="cursor-pointer">Equipment</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Arcturus LED Produkt</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Meta Navigation */}
      <div className="container mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-6 justify-center border-b border-gray-200">
          <button className="text-blue-600 border-b-2 border-blue-600 pb-2 px-1 font-medium">
            Übersicht
          </button>
          <button className="text-gray-600 hover:text-blue-600 pb-2 px-1 font-medium transition-colors">
            Vorteile
          </button>
          <button className="text-gray-600 hover:text-blue-600 pb-2 px-1 font-medium transition-colors">
            Spezifikationen
          </button>
          <button className="text-gray-600 hover:text-blue-600 pb-2 px-1 font-medium transition-colors">
            Anwendungen
          </button>
          <button className="text-gray-600 hover:text-blue-600 pb-2 px-1 font-medium transition-colors">
            Galerie
          </button>
          <button className="text-gray-600 hover:text-blue-600 pb-2 px-1 font-medium transition-colors">
            Downloads
          </button>
        </div>
      </div>

      {/* Simple Content */}
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Arcturus HDR Test Bundle
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Die ultimative Kombination aus Arcturus LED-Beleuchtungssystem, Vega Software Suite und 
          präzisions-entwickelten Test Charts für professionelle Bildqualitätsanalyse.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Mehr erfahren
        </Button>
      </div>
    </div>
  );
};

export default SolutionArcturusBundle;