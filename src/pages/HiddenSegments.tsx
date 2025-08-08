import Navigation from "@/components/Navigation";
import Services from "@/components/Services";
import ChartFinder from "@/components/ChartFinder";
import Footer from "@/components/Footer";

const HiddenSegments = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-center mb-8">Versteckte Segmente</h1>
          <p className="text-xl text-center text-muted-foreground mb-16">
            Diese Segmente wurden vorübergehend von der Startseite entfernt und hier zur späteren Verwendung gespeichert.
          </p>
        </div>
      </div>
      
      {/* Services Segment - "Präzisions-entwickelte Lösungen" */}
      <Services />
      
      {/* Chart Finder Segment */}
      <ChartFinder />
      <Footer />
    </div>
  );
};

export default HiddenSegments;