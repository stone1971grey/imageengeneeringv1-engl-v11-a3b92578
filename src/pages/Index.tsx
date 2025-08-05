import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Hero from "@/components/Hero";
import IndustrySection from "@/components/IndustrySection";
import Services from "@/components/Services";
import ChartFinder from "@/components/ChartFinder";
import Industries from "@/components/Industries";
import Technology from "@/components/Technology";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Visit us at IBC 2025"
        ctaText="Learn more"
        ctaLink="#"
        icon="calendar"
      />
      <Hero />
      <IndustrySection />
      <Services />
      <ChartFinder />
      <Industries />
      <Technology />
      <Contact />
    </div>
  );
};

export default Index;
