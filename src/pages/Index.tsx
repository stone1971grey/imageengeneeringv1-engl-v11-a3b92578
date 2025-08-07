import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Hero from "@/components/Hero";
import IndustrySection from "@/components/IndustrySection";
import Industries from "@/components/Industries";
import Technology from "@/components/Technology";
import StandardsExpertise from "@/components/StandardsExpertise";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Besuchen Sie uns auf der IBC 2025"
        ctaText="Mehr erfahren"
        ctaLink="#"
        icon="calendar"
      />
      <Hero />
      <IndustrySection />
      <Industries />
      <Technology />
      <StandardsExpertise />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
