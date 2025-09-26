import NavigationMinimal from "@/components/NavigationBackup";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import NewsSection from "@/components/NewsSection";
import StandardsExpertise from "@/components/StandardsExpertise";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationMinimal />
      <AnnouncementBanner 
        message="Visit us at IBC 2025"
        ctaText="Learn more"
        ctaLink="#"
        icon="calendar"
      />
      <Hero />
      <Industries />
      <NewsSection />
      <StandardsExpertise />
      <Footer />
    </div>
  );
};

export default Index;
