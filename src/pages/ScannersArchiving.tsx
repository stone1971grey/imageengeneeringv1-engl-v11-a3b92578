import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ScannersArchiving = () => {
  useEffect(() => {
    // Empty page - no content to load
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <Footer />
    </div>
  );
};

export default ScannersArchiving;
