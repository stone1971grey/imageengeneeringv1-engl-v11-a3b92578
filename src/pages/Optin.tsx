import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import logoIE from "@/assets/logo-ie-black.png";

const Optin = () => {
  const location = useLocation();
  const firstName = location.state?.firstName || "Firstname";
  const lastName = location.state?.lastName || "Lastname";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />
      
      <div className="flex-1 pt-32 pb-16 flex items-center justify-center px-6">
        <Card className="max-w-3xl w-full bg-white shadow-2xl border-0 overflow-hidden">
          {/* Modern Header with Logo */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-8">
            <div className="flex items-center justify-center">
              <img src={logoIE} alt="Image Engineering" className="h-16 brightness-0 invert" />
            </div>
          </div>

          {/* Email Content */}
          <CardContent className="px-8 py-10 space-y-8">
            {/* Title Section */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                Bestätigen Sie Ihre E-Mail-Adresse
              </h1>
              <div className="h-1 w-20 rounded-full" style={{ backgroundColor: '#f5743a' }}></div>
            </div>

            {/* Greeting */}
            <div className="space-y-4">
              <p className="text-lg text-slate-700">
                Hallo {firstName} {lastName},
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                vielen Dank für Ihr Interesse an unseren Testcharts und Lösungen. Um Ihnen die gewünschten Informationen zusenden zu können, bitten wir Sie, Ihre E-Mail-Adresse zu bestätigen.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Bitte klicken Sie auf den folgenden Button, um Ihre Anmeldung abzuschließen:
              </p>
            </div>

            {/* CTA Section */}
            <div className="rounded-2xl p-8 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    E-Mail-Adresse bestätigen
                  </h2>
                  <p className="text-sm text-slate-600">
                    Klicken Sie auf den Button, um fortzufahren
                  </p>
                </div>
                
                <a
                  href="https://preview--imageengeneeringv1-engl-v11.lovable.app/confirm-contact"
                  className="inline-block text-white font-semibold px-10 py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg"
                  style={{ backgroundColor: '#f5743a', textDecoration: 'none' }}
                >
                  E-Mail-Adresse bestätigen
                </a>
              </div>
            </div>

            {/* Additional Information */}
            <div className="pt-6 border-t border-slate-200">
              <div className="border-l-4 p-4 rounded-r-lg" style={{ backgroundColor: '#f3f3f5', borderLeftColor: '#f5743a' }}>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Hinweis:</span> Diese Bestätigung hilft uns, die Sicherheit Ihrer Daten zu gewährleisten und sicherzustellen, dass Sie alle wichtigen Updates erhalten.
                </p>
              </div>
            </div>

            {/* Closing */}
            <div className="space-y-3 pt-4">
              <p className="text-base text-slate-600">
                Mit freundlichen Grüßen,
              </p>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Ihr Image Engineering Team
                </p>
                <p className="text-sm text-slate-500">
                  Experten für Automotive Imaging Standards
                </p>
              </div>
            </div>
          </CardContent>

          {/* Modern Footer */}
          <div className="bg-slate-900 px-8 py-6 text-center space-y-2">
            <p className="text-xs text-slate-400">
              info@image-engineering.de
            </p>
            <p className="text-xs text-slate-400">
              © 2024 Image Engineering. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Leading provider of automotive camera testing solutions
            </p>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Optin;
