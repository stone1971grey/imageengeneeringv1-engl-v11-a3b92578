import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActionHero from "@/components/ActionHero";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import contactHero from "@/assets/confirm-contact-hero.jpg";

declare global {
  interface Window {
    mt?: (...args: any[]) => void;
  }
}

const ConfirmContact = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add Mautic tracking script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
        w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
        m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://m.sptools.de/mtc.js','mt');
      mt('send', 'pageview');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleConfirm = () => {
    // Track confirmation event
    if (window.mt) {
      window.mt('send', 'event', 'DOI', 'confirmed');
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <ActionHero
        title="Confirm Your Contact"
        subtitle="Please confirm your email address to complete your registration"
        backgroundImage={contactHero}
      />

      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Almost There!
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              We've sent a confirmation email to your inbox. Please click the confirmation link 
              in the email to verify your address and complete your registration. This helps us 
              ensure the security of your account and that you receive all important updates.
            </p>
            <p className="text-base text-white/60">
              Didn't receive the email? Please check your spam folder or contact our support team.
            </p>
            <div className="pt-6">
              <Button 
                onClick={handleConfirm}
                size="lg"
                className="text-lg px-12"
              >
                Confirm & Continue
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConfirmContact;
