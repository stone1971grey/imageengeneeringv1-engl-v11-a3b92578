import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActionHero from "@/components/ActionHero";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import confirmDoneHero from "@/assets/confirm-done-hero.jpg";

declare global {
  interface Window {
    mt?: (...args: any[]) => void;
  }
}

const ConfirmDone = () => {
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
        title="Erfolgreich Bestätigt!"
        subtitle="Vielen Dank für die Bestätigung Ihrer E-Mail-Adresse"
        backgroundImage={confirmDoneHero}
        flipImage={false}
      />

      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Alles Erledigt!
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Ihre E-Mail-Adresse wurde erfolgreich bestätigt. Sie erhalten ab sofort alle wichtigen 
              Updates und Informationen von Image Engineering. Wir freuen uns, Sie als Teil unserer 
              Community begrüßen zu dürfen.
            </p>
            <p className="text-base text-white/60">
              Entdecken Sie jetzt unsere innovativen Lösungen für Bildqualitätstests und 
              professionelle Testtafeln.
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
