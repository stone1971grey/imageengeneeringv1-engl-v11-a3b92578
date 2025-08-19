import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Award, CheckCircle, Users } from "lucide-react";
import ieeeLogo from "@/assets/logo-ieee.png";
import iecLogo from "@/assets/logo-iec.png";
import isoLogo from "@/assets/logo-iso.jpg";
import emvaLogo from "@/assets/logo-emva.jpg";

const StandardsExpertise = () => {
  const standards = [
    {
      title: "IEEE P2020",
      description: "Automotive Image Quality Standard",
      status: "Active Member",
      category: "Automotive"
    },
    {
      title: "ISO 12233",
      description: "Resolution and Spatial Frequency Responses",
      status: "Compliant",
      category: "Photography"
    },
    {
      title: "ISO 14524",
      description: "Electronic Still Picture Cameras - Methods for measuring opto-electronic conversion functions",
      status: "Compliant", 
      category: "Photography"
    },
    {
      title: "ISO 15739",
      description: "Noise measurements",
      status: "Compliant",
      category: "Photography"
    },
    {
      title: "IEC 61966-2-1",
      description: "Colour measurement and management - sRGB colour space",
      status: "Compliant",
      category: "Color Science"
    },
    {
      title: "EMVA 1288",
      description: "Standard for Characterization of Image Sensors and Cameras",
      status: "Compliant",
      category: "Machine Vision"
    }
  ];

  const organizations = [
    {
      name: "IEEE",
      fullName: "Institute of Electrical and Electronics Engineers",
      role: "Active Member P2020 Working Group",
      logo: ieeeLogo
    },
    {
      name: "ISO",
      fullName: "International Organization for Standardization", 
      role: "Standards Implementation",
      logo: isoLogo
    },
    {
      name: "IEC",
      fullName: "International Electrotechnical Commission",
      role: "Standards Compliance",
      logo: iecLogo
    },
    {
      name: "EMVA",
      fullName: "European Machine Vision Association",
      role: "Standards Adoption",
      logo: emvaLogo
    }
  ];

  const categoryColors = {
    "Automotive": "bg-blue-100 text-blue-800",
    "Photography": "bg-green-100 text-green-800", 
    "Color Science": "bg-purple-100 text-purple-800",
    "Machine Vision": "bg-orange-100 text-orange-800"
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Standards & Expertise
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            As an active member of international standardization bodies, we develop 
            test methods that comply with the latest industry standards
          </p>
        </div>

        {/* Organizations Grid with Connecting Arrows */}
        <div className="relative mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {organizations.map((org, index) => (
              <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 relative">
                <CardContent className="p-6 text-center">
                  <div className="w-[90px] h-[90px] flex items-center justify-center mx-auto mb-4">
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="w-[90px] h-[90px] object-contain" />
                    ) : (
                      <span className="text-xl font-bold text-blue-600">{org.name}</span>
                    )}
                  </div>
                  <h3 className="text-lg text-gray-900 mb-2">{org.name}</h3>
                  <p className="text-lg text-gray-700 mb-3">{org.fullName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Standards List */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Supported Standards
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our testing procedures are based on internationally recognized standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {standards.map((standard, index) => (
              <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {standard.title}
                      </h4>
                      <p className="text-gray-600 text-base leading-relaxed mb-3">
                        {standard.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="secondary" 
                      className={categoryColors[standard.category as keyof typeof categoryColors]}
                    >
                      {standard.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">{standard.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* IEEE P2020 Highlight */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">IEEE P2020</h3>
                  <p className="text-blue-600 font-medium">Active Working Group Member</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                As an active member of the IEEE-P2020 working group, we contribute directly to the development 
                of the first internationally recognized standard for automotive image quality testing. 
                This standard will be published at the end of 2024.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Direct implementation of new test methods</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Cutting-edge KPIs for ADAS systems</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Future-proof testing procedures</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">New KPIs for Automotive</h4>
              <div className="space-y-4 text-sm">
                <div className="bg-white rounded-lg p-4">
                  <div className="font-medium text-gray-900">CTA</div>
                  <div className="text-gray-600">Contrast Transfer Accuracy</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-medium text-gray-900">MMP</div>
                  <div className="text-gray-600">Modulated Light Mitigation Probability (Flicker)</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-medium text-gray-900">CSNR</div>
                  <div className="text-gray-600">Contrast Signal-to-Noise Ratio</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="font-medium text-gray-900">HDR</div>
                  <div className="text-gray-600">High Dynamic Range Testing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 shadow-xl">
            <CardContent className="p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Users className="w-8 h-8 text-white" />
                <h3 className="text-3xl font-bold text-white">
                  Speak with Our Engineers
                </h3>
              </div>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our experts help you identify the right standards for your 
                application and develop customized testing solutions
              </p>
              <Button 
                size="lg"
                variant="contact"
                className="px-8 py-4 shadow-lg group"
              >
                Schedule Consultation Now
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StandardsExpertise;