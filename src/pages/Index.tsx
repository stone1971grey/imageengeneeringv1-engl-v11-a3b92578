import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
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
      <Industries />
      <StandardsExpertise />
      <Footer />
    </div>
  );
};

export default Index;
