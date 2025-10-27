import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Users, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import eventImage from "@/assets/event-automotive-conference-new.jpg";

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
          <Card className="mb-8 border-0 shadow-xl overflow-hidden" style={{ backgroundColor: '#f3f3f5' }}>
            <div className="px-8 py-12">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-lg border border-slate-300">
                  <FileText className="h-8 w-8 text-black" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl lg:text-5xl font-bold text-black mb-3 leading-tight">
                    How Well Do Vehicles Really "See"?
                  </h1>
                  <p className="text-xl lg:text-2xl text-black">
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
                    <p className="text-base text-black">Published</p>
                    <p className="font-semibold text-lg text-black">2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-base text-black">Pages</p>
                    <p className="font-semibold text-lg text-black">45 Pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-base text-black">Category</p>
                    <p className="font-semibold text-lg text-black">Automotive Standards</p>
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-black mb-4">Abstract</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-black leading-relaxed mb-4">
                      Modern vehicles increasingly rely on camera systems for critical safety and automation features. 
                      But how well do these automotive imaging systems really perform? This comprehensive white paper 
                      examines the IEEE P2020 standard for automotive imaging quality assessment.
                    </p>
                    <p className="text-lg text-black leading-relaxed mb-4">
                      The document provides detailed insights into standardized testing methodologies, quality metrics, 
                      and best practices for evaluating camera performance in automotive applications. It covers essential 
                      topics including resolution, dynamic range, color accuracy, and low-light performance.
                    </p>
                    <p className="text-lg text-black leading-relaxed">
                      This white paper is essential reading for automotive engineers, OEMs, Tier-1 suppliers, and anyone 
                      involved in the development, testing, or validation of automotive camera systems.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl p-6 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
                  <h3 className="text-xl font-semibold text-black mb-3">Key Topics Covered</h3>
                  <ul className="space-y-2 text-base text-black">
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
                    <h3 className="text-3xl font-bold text-black">
                      Download the Full White Paper
                    </h3>
                    <p className="text-lg text-black">
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
                  
                  <p className="text-base text-black">
                    No registration required • Instant download
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Notice */}
          <div className="max-w-md">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-black">
              <div className="aspect-[3/4] w-full overflow-hidden">
                <img 
                  src={eventImage} 
                  alt="Automotive Testing Conference 2025" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6 bg-black">
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                  Automotive Testing Conference 2025
                </h3>
                
                <div className="space-y-2 text-base text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-white" />
                    <span>08. Dezember 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-white" />
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-white" />
                    <span>Detroit, USA</span>
                  </div>
                </div>
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
