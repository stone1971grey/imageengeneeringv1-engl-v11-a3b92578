import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useLocation } from "react-router-dom";
import logoIE from "@/assets/logo-ie-black.png";

const WhitePaperDownload = () => {
  const location = useLocation();
  const { firstName, lastName } = (location.state as { firstName?: string; lastName?: string }) || {};
  const userName = firstName && lastName ? `${firstName} ${lastName}` : "Reader";

  return (
    <div className="min-h-screen bg-[#f3f3f5] flex items-center justify-center p-6">
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
            <h1 className="text-2xl font-bold text-black leading-tight">
              Your Whitepaper is Ready
            </h1>
            <div className="h-1 w-20 rounded-full" style={{ backgroundColor: '#f5743a' }}></div>
          </div>

          {/* Greeting */}
          <div className="space-y-4">
            <p className="text-lg text-black">
              Dear {userName},
            </p>
            <p className="text-base text-black leading-relaxed">
              Thank you for your interest in our whitepaper. We're excited to share this comprehensive resource with you.
            </p>
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl p-8 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-black">
                  Access Your Whitepaper
                </h2>
                <p className="text-sm text-black">
                  Click the button below to download your requested document
                </p>
              </div>
              
              <Button
                size="lg"
                className="text-white font-semibold px-10 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#f5743a' }}
                onClick={() => window.location.href = '/whitepaper/ieee-p2020'}
              >
                Download Whitepaper
              </Button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="pt-6 border-t border-slate-200">
            <div className="border-l-4 p-4 rounded-r-lg" style={{ backgroundColor: '#f3f3f5', borderLeftColor: '#f5743a' }}>
              <p className="text-sm text-black leading-relaxed">
                <span className="font-semibold text-black">Stay Connected:</span> We'd be delighted to keep you informed about our latest whitepapers, upcoming events, new products, and industry insights in automotive imaging and camera testing technology.
              </p>
            </div>
          </div>

          {/* Closing */}
          <div className="space-y-3 pt-4">
            <p className="text-base text-black">
              Best regards,
            </p>
            <div>
              <p className="text-lg font-semibold text-black">
                The Image Engineering Team
              </p>
              <p className="text-sm text-black">
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
  );
};

export default WhitePaperDownload;
