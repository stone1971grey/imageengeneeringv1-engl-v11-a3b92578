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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white shadow-xl">
        {/* Email Header */}
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between mb-6">
            <img src={logoIE} alt="Image Engineering" className="h-12" />
            <div className="text-right">
              <p className="text-xs text-black">info@image-engineering.de</p>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-black">
            Please find the link for the whitepaper download attached
          </h1>
        </CardHeader>

        {/* Email Body */}
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="space-y-4">
            <p className="text-base text-black leading-relaxed">
              Dear {userName},
            </p>
            <p className="text-base text-black leading-relaxed">
              Thank you for your interest in our whitepaper. Below you will find the link to access your requested whitepaper download.
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center py-6">
            <Button
              size="lg"
              className="text-white font-semibold px-8 py-6 text-base hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#f5743a' }}
              onClick={() => window.location.href = '/whitepaper'}
            >
              Download Whitepaper
            </Button>
          </div>

          {/* Additional Information */}
          <div className="pt-4 border-t">
            <p className="text-sm text-black leading-relaxed">
              We would be delighted to keep you informed about our latest whitepapers, upcoming events, new products, and industry insights. Stay connected with Image Engineering for the latest developments in automotive imaging and camera testing technology.
            </p>
          </div>

          {/* Closing */}
          <div className="space-y-2 pt-4">
            <p className="text-base text-black">
              Best regards,
            </p>
            <p className="text-base font-medium text-black">
              The Image Engineering Team
            </p>
          </div>
        </CardContent>

        {/* Email Footer */}
        <div className="bg-muted/20 px-6 py-4 border-t text-center">
          <p className="text-xs text-black">
            © 2024 Image Engineering. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WhitePaperDownload;
