import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionHero from "@/components/ActionHero";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import confirmDoneHero from "@/assets/confirm-done-hero.jpg";
import { getMauticEmail } from "@/lib/mauticTracking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    mt?: (...args: any[]) => void;
  }
}

const ConfirmDone = () => {
  const navigate = useNavigate();
  const [optinConfirmed, setOptinConfirmed] = useState(false);

  useEffect(() => {
    const email = getMauticEmail();
    
    // Confirm marketing opt-in in Mautic via Edge Function
    const confirmOptIn = async () => {
      if (!email) {
        console.log("No email found in localStorage for opt-in confirmation");
        return;
      }

      try {
        console.log("Confirming marketing opt-in for:", email);
        const { data, error } = await supabase.functions.invoke('confirm-mautic-optin', {
          body: { email },
        });

        if (error) {
          console.error("Failed to confirm opt-in:", error);
          return;
        }

        if (data?.success) {
          console.log("✅ Marketing opt-in confirmed:", data);
          setOptinConfirmed(true);
          toast.success("Email confirmation successful!");
        } else {
          console.error("Opt-in confirmation failed:", data?.error);
        }
      } catch (err) {
        console.error("Error confirming opt-in:", err);
      }
    };

    confirmOptIn();
    
    // Add Mautic tracking script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
        w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
        m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://m2.sptools.de/mtc.js','mt');
      ${email ? `mt('send', 'email', '${email}');` : ''}
      mt('send', 'pageview');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleContinue = () => {
    // Track completion event
    if (window.mt) {
      window.mt('send', 'event', 'DOI', 'completed');
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <ActionHero
        title="Successfully Confirmed!"
        subtitle="Thank you for confirming your email address"
        backgroundImage={confirmDoneHero}
        flipImage={false}
      />

      <section className="py-20 bg-gradient-to-b from-[#000000] via-[#1a1a1a] to-[#404040]">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              All Set!
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Your email address has been successfully confirmed. You will now receive all important 
              updates and information from Image Engineering. We are delighted to welcome you as part 
              of our community.
            </p>
            <p className="text-base text-white/60">
              Discover our innovative solutions for image quality testing and 
              professional test charts.
            </p>
            <div className="pt-6">
              <Button 
                onClick={handleContinue}
                variant="default"
                size="lg"
                className="text-lg px-12"
              >
                Image Engineering
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConfirmDone;
