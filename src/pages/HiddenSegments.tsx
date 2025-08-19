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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-center mb-8">Hidden Segments</h1>
          <p className="text-xl text-center text-muted-foreground mb-16">
            These segments were temporarily removed from the homepage and saved here for later use.
          </p>
        </div>
        </div>
      </div>
      
      {/* Services Segment - "Precision-Engineered Solutions" */}
      <Services />
      
      {/* Chart Finder Segment */}
      <ChartFinder />
      <Footer />
    </div>
  );
};

export default HiddenSegments;