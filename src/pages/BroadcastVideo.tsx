import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const BroadcastVideo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEOHead
        title="Broadcast & Video Camera Testing Solutions"
        description="Professional testing solutions for broadcast cameras and video production equipment including HDTV testing, spectral sensitivities, and ISP tuning."
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <main className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              Photo & Video / Broadcast
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl">
              Professional solutions for broadcast cameras and HDTV testing
            </p>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                This page is currently under construction. Please contact us for more information about our
                broadcast and video camera testing solutions.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default BroadcastVideo;
