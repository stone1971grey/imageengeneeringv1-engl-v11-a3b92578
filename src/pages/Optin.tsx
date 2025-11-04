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
                Confirm Your Email Address
              </h1>
              <div className="h-1 w-20 rounded-full" style={{ backgroundColor: '#f9dc24' }}></div>
            </div>

            {/* Greeting */}
            <div className="space-y-4">
              <p className="text-lg text-slate-700">
                Hello {firstName} {lastName},
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Thank you for your interest in our test charts and solutions. To send you the requested information, we kindly ask you to confirm your email address.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Please click the button below to complete your registration:
              </p>
            </div>

            {/* CTA Section */}
            <div className="rounded-2xl p-8 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Confirm Email Address
                  </h2>
                  <p className="text-sm text-slate-600">
                    Click the button to continue
                  </p>
                </div>
                
                <a
                  href="https://preview--imageengeneeringv1-engl-v11.lovable.app/confirm-contact"
                  className="inline-block text-black font-semibold px-10 py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-lg"
                  style={{ backgroundColor: '#f9dc24', textDecoration: 'none' }}
                >
                  Confirm Email Address
                </a>
              </div>
            </div>

            {/* Additional Information */}
            <div className="pt-6 border-t border-slate-200">
              <div className="border-l-4 p-4 rounded-r-lg" style={{ backgroundColor: '#f3f3f5', borderLeftColor: '#f9dc24' }}>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Note:</span> This confirmation helps us ensure the security of your data and guarantees that you receive all important updates.
                </p>
              </div>
            </div>

            {/* Closing */}
            <div className="space-y-3 pt-4">
              <p className="text-base text-slate-600">
                Best regards,
              </p>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  The Image Engineering Team
                </p>
                <p className="text-sm text-slate-500">
                  Experts in Automotive Imaging Standards
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
