import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const YourSolution = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Your Solution - Image Engineering"
        description="Discover our comprehensive solutions for camera and image quality testing"
      />
      <Navigation />
      <main className="container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Solution
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Select a solution category from the navigation to explore our offerings.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default YourSolution;
