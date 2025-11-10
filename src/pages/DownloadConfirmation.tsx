import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, FileText, Download } from "lucide-react";
import downloadsHero from "@/assets/downloads-hero.jpg";

const DownloadConfirmation = () => {
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
        title="Thank You for Your Continued Interest"
        subtitle="Your download is being prepared"
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
                We're Processing Your Request
              </h2>
              <p className="text-lg text-muted-foreground">
                Thank you for your interest in our technical documentation and resources. We're preparing your download link and will send it to you via email within the next few minutes.
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
                  <p className="font-semibold text-foreground mb-2">Check Your Inbox</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    You'll receive an email shortly containing a direct download link to access your requested resource. If you don't see the email within a few minutes, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-2">What Happens Next?</p>
                  <ul className="text-sm text-foreground leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f9dc24] font-bold">•</span>
                      <span>You'll receive an email with your download link within minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f9dc24] font-bold">•</span>
                      <span>Access your resource with a single click</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f9dc24] font-bold">•</span>
                      <span>Stay informed about future updates and releases</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/downloads')}
                size="lg"
                className="min-w-[200px] bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
              >
                Explore More Resources
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadConfirmation;
