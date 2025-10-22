import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail } from "lucide-react";

const WhitePaperDownload = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white shadow-xl">
        {/* Email Header */}
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Image Engineering</p>
              <p className="text-xs text-muted-foreground">info@image-engineering.de</p>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Please find the link for the whitepaper download attached
          </h1>
        </CardHeader>

        {/* Email Body */}
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="space-y-4">
            <p className="text-base text-foreground leading-relaxed">
              Dear Reader,
            </p>
            <p className="text-base text-foreground leading-relaxed">
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
            <p className="text-sm text-muted-foreground leading-relaxed">
              We would be delighted to keep you informed about our latest whitepapers, upcoming events, new products, and industry insights. Stay connected with Image Engineering for the latest developments in automotive imaging and camera testing technology.
            </p>
          </div>

          {/* Closing */}
          <div className="space-y-2 pt-4">
            <p className="text-base text-foreground">
              Best regards,
            </p>
            <p className="text-base font-medium text-foreground">
              The Image Engineering Team
            </p>
          </div>
        </CardContent>

        {/* Email Footer */}
        <div className="bg-muted/20 px-6 py-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Image Engineering. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WhitePaperDownload;
