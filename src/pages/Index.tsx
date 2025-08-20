import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import NewsSection from "@/components/NewsSection";
import EngineersSlider from "@/components/EngineersSlider";
import StandardsExpertise from "@/components/StandardsExpertise";
import Footer from "@/components/Footer";
import LoginOverlay from "@/components/LoginOverlay";

const Index = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const unlocked = localStorage.getItem('ie_startpage_unlocked') === 'true';
    setIsUnlocked(unlocked);
  }, []);

  const handleLoginSuccess = () => {
    setIsUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isUnlocked && <LoginOverlay onSuccess={handleLoginSuccess} />}
      <Navigation />
      <AnnouncementBanner 
        message="Visit us at IBC 2025"
        ctaText="Learn more"
        ctaLink="#"
        icon="calendar"
      />
      <Hero />
      <Industries />
      <NewsSection />
      <EngineersSlider />
      <StandardsExpertise />
      <Footer />
    </div>
  );
};

export default Index;
