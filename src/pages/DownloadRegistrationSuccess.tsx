import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, FileText } from "lucide-react";
import downloadsHero from "@/assets/downloads-hero.jpg";

const DownloadRegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { downloadTitle, downloadType } = location.state || {};

  const getTypeLabel = () => {
    switch(downloadType) {
      case "whitepaper":
        return "White Paper";
      case "conference":
        return "Conference Paper";
      case "video":
        return "Video";
      default:
        return "Resource";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <ActionHero
        title="Thank You for Your Interest"
        subtitle="Your download request has been received"
        backgroundImage={downloadsHero}
        flipImage={false}
      />

      <main className="flex-grow container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Registration Successful
              </h2>
              <p className="text-lg text-muted-foreground">
                We have received your download request and will send you an email shortly with further details.
              </p>
            </div>

            {downloadTitle && (
              <div className="bg-muted/50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Requested Resource</h3>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">{getTypeLabel()}</p>
                    <p className="font-medium text-foreground">{downloadTitle}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#f9dc24]/10 border border-[#f9dc24]/20 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-2">Important: Confirm Your Email</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    To complete your registration and receive access to our resources, please check your email inbox and confirm your subscription by clicking the confirmation link. The download link will be sent to you immediately after confirmation.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/downloads')}
                size="lg"
                className="min-w-[200px] bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
              >
                Browse More Resources
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadRegistrationSuccess;
