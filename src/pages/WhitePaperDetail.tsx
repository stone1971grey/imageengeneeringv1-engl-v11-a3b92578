import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const WhitePaperDetail = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/P2020_white_paper.pdf';
    link.download = 'IEEE_P2020_Automotive_Imaging_White_Paper.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#f3f3f5] pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header Card */}
          <Card className="mb-8 border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
                    How Well Do Vehicles Really "See"?
                  </h1>
                  <p className="text-xl text-slate-200">
                    The IEEE P2020 Automotive Imaging White Paper
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="px-8 py-8">
              {/* Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-sm text-black">Published</p>
                    <p className="font-semibold text-black">2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-sm text-black">Pages</p>
                    <p className="font-semibold text-black">45 Pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-sm text-black">Category</p>
                    <p className="font-semibold text-black">Automotive Standards</p>
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-4">Abstract</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-black leading-relaxed mb-4">
                      Modern vehicles increasingly rely on camera systems for critical safety and automation features. 
                      But how well do these automotive imaging systems really perform? This comprehensive white paper 
                      examines the IEEE P2020 standard for automotive imaging quality assessment.
                    </p>
                    <p className="text-black leading-relaxed mb-4">
                      The document provides detailed insights into standardized testing methodologies, quality metrics, 
                      and best practices for evaluating camera performance in automotive applications. It covers essential 
                      topics including resolution, dynamic range, color accuracy, and low-light performance.
                    </p>
                    <p className="text-black leading-relaxed">
                      This white paper is essential reading for automotive engineers, OEMs, Tier-1 suppliers, and anyone 
                      involved in the development, testing, or validation of automotive camera systems.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-black mb-3">Key Topics Covered</h3>
                  <ul className="space-y-2 text-black">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>IEEE P2020 standard overview and requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Standardized test methodologies for automotive cameras</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Key performance indicators and quality metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Real-world testing scenarios and validation approaches</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Industry best practices and recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Download CTA */}
              <div className="rounded-2xl p-8 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-black">
                      Download the Full White Paper
                    </h3>
                    <p className="text-black">
                      Get instant access to this comprehensive 45-page technical document
                    </p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="text-white font-semibold px-12 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#f5743a' }}
                    onClick={handleDownload}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF (2.5 MB)
                  </Button>
                  
                  <p className="text-sm text-black">
                    No registration required • Instant download
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-black mb-3">About IEEE P2020</h3>
                <p className="text-black text-sm leading-relaxed">
                  The IEEE P2020 standard provides a comprehensive framework for evaluating automotive 
                  imaging systems, ensuring consistent and reliable performance metrics across the industry.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-black mb-3">Need Expert Guidance?</h3>
                <p className="text-black text-sm leading-relaxed mb-4">
                  Our team can help you implement IEEE P2020 testing in your development process.
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

export default WhitePaperDetail;
