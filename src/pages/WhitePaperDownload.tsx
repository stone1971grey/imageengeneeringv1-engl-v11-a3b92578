import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const WhitePaperDownload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { firstName, lastName } = (location.state as { firstName?: string; lastName?: string }) || {};
  const userName = firstName && lastName ? `${firstName} ${lastName}` : "Reader";

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Thank You for Your Interest!
            </h1>
            <p className="text-slate-600">
              Your whitepaper request has been received
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="mb-8 border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-8">
              <div className="flex items-center gap-4">
                <Mail className="h-8 w-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Your Whitepaper is Ready
                  </h2>
                  <p className="text-slate-200">
                    Access your document instantly
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="px-8 py-10 space-y-8">
              {/* Greeting */}
              <div className="space-y-4">
                <p className="text-lg text-slate-700">
                  Dear {userName},
                </p>
                <p className="text-base text-slate-600 leading-relaxed">
                  Thank you for your interest in our whitepaper. We're excited to share this comprehensive resource with you.
                </p>
              </div>

              {/* CTA Section */}
              <div className="rounded-2xl p-8 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900">
                      Access Your Whitepaper
                    </h3>
                    <p className="text-sm text-slate-600">
                      Click the button below to view and download your requested document
                    </p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="text-white font-semibold px-10 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#f5743a' }}
                    onClick={() => navigate('/whitepaper/ieee-p2020')}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    View & Download Whitepaper
                  </Button>
                </div>
              </div>

              {/* Additional Information */}
              <div className="pt-6 border-t border-slate-200">
                <div className="border-l-4 p-4 rounded-r-lg" style={{ backgroundColor: '#f3f3f5', borderLeftColor: '#f5743a' }}>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Stay Connected:</span> We'd be delighted to keep you informed about our latest whitepapers, upcoming events, new products, and industry insights in automotive imaging and camera testing technology.
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
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">More Resources</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Explore our complete library of whitepapers, conference papers, and technical videos.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/downloads')}
                  className="w-full"
                >
                  Browse All Downloads
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Need Expert Guidance?</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Our team can help you implement automotive imaging testing solutions.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/contact')}
                  className="w-full"
                >
                  Contact Our Experts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WhitePaperDownload;
