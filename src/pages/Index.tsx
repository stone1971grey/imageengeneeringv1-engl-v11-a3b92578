import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Hero from "@/components/Hero";
import PartnerSection from "@/components/PartnerSection";
import Industries from "@/components/Industries";
import NewsSection from "@/components/NewsSection";
import InternationalStandards from "@/components/InternationalStandards";
import StandardsExpertise from "@/components/StandardsExpertise";
import Footer from "@/components/Footer";

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
      <PartnerSection />
      <Industries />
      <NewsSection />
      <InternationalStandards />
      <StandardsExpertise />
      <Footer />
    </div>
  );
};

export default Index;
