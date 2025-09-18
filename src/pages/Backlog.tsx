import Navigation from "@/components/Navigation";
import EngineersSlider from "@/components/EngineersSlider";
import Footer from "@/components/Footer";

const Backlog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-center mb-8">Backlog</h1>
            <p className="text-xl text-center text-muted-foreground mb-16">
              Components and segments saved for future use.
            </p>
          </div>
        </div>
      </div>
      
      {/* Engineers Slider Segment - "Speak with Our Engineers" */}
      <EngineersSlider />
      
      <Footer />
    </div>
  );
};

export default Backlog;