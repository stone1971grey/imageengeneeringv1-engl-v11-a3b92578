import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowRight, 
  ArrowLeft, 
  Car, 
  Smartphone, 
  Factory, 
  FlaskConical, 
  Heart, 
  Camera,
  Monitor,
  Zap,
  CheckCircle,
  RotateCcw,
  Sparkles
} from "lucide-react";

const ProductSelectionHelper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<number[]>([25000]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const applications = [
    { 
      value: "automotive", 
      label: "Automotive Testing", 
      icon: Car,
      description: "ADAS, headlight testing, camera validation"
    },
    { 
      value: "mobile", 
      label: "Mobile Camera Testing", 
      icon: Smartphone,
      description: "Smartphone cameras, image quality"
    },
    { 
      value: "industrial", 
      label: "Industrial Vision", 
      icon: Factory,
      description: "Machine vision, quality control"
    },
    { 
      value: "research", 
      label: "Research & Development", 
      icon: FlaskConical,
      description: "Laboratory testing, prototyping"
    },
    { 
      value: "medical", 
      label: "Medical Imaging", 
      icon: Heart,
      description: "Medical devices, diagnostic imaging"
    },
    { 
      value: "broadcast", 
      label: "Broadcast & Media", 
      icon: Monitor,
      description: "Video production, color grading"
    }
  ];

  const requirements = [
    { id: "ieee", label: "IEEE P2020 Compliance" },
    { id: "hdr", label: "HDR Support" },
    { id: "flicker", label: "Flicker-Free" },
    { id: "highintensity", label: "High Intensity" },
    { id: "compact", label: "Compact Design" },
    { id: "api", label: "API Integration" },
    { id: "spectral", label: "Spectral Accuracy" },
    { id: "uniform", label: "Uniform Illumination" }
  ];

  const toggleRequirement = (reqId: string) => {
    setSelectedRequirements(prev => 
      prev.includes(reqId) 
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    );
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedApplication("");
    setBudgetRange([25000]);
    setSelectedRequirements([]);
    setShowResults(false);
  };

  const getBudgetLabel = (value: number) => {
    if (value < 15000) return "Entry Level";
    if (value < 40000) return "Mid Range";
    return "Premium";
  };

  const getRecommendations = () => {
    const budget = budgetRange[0];
    const recommendations = [];
    
    // Arcturus for Automotive and Premium Budget
    if (selectedApplication === "automotive" && budget > 40000) {
      recommendations.push({
        name: "Arcturus LED System",
        score: 95,
        reasons: ["IEEE P2020 Compliant", "Maximum Intensity", "Automotive Optimized"],
        price: "Premium",
        link: "/product/arcturus",
        image: "/images/chart-placeholder.jpg",
        description: "Professional automotive testing solution with highest precision"
      });
    }
    
    // Vega for mid-range requirements
    if (budget >= 15000 && budget <= 40000) {
      recommendations.push({
        name: "Vega Light Source",
        score: 85,
        reasons: ["Versatile Application", "Great Value", "Proven Technology"],
        price: "Mid Range",
        link: "#",
        image: "/images/chart-placeholder.jpg",
        description: "Balanced solution for professional testing requirements"
      });
    }

    // Entry level solutions
    if (budget < 15000) {
      recommendations.push({
        name: "Standard LED Series",
        score: 70,
        reasons: ["Cost Effective", "Easy Operation", "Core Features"],
        price: "Entry Level",
        link: "#",
        image: "/images/chart-placeholder.jpg",
        description: "Affordable solution for basic testing needs"
      });
    }

    // Additional recommendations based on application
    if (selectedApplication === "mobile") {
      recommendations.push({
        name: "Mobile Testing Kit",
        score: 88,
        reasons: ["Mobile Optimized", "Compact Size", "Easy Setup"],
        price: getBudgetLabel(budget),
        link: "#",
        image: "/images/chart-placeholder.jpg",
        description: "Specialized solution for mobile camera testing"
      });
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedApplication !== "";
    if (currentStep === 2) return true; // Budget always has a value
    if (currentStep === 3) return true; // Requirements are optional
    return false;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Select Your Application Area";
      case 2: return "Choose Your Budget Range";
      case 3: return "Additional Requirements";
      default: return "";
    }
  };

  const recommendations = getRecommendations();

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white border-gray-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              Your Recommended Products
            </CardTitle>
            <p className="text-muted-foreground">
              Based on your preferences, here are our top recommendations
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {recommendations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((product, index) => (
                  <Card key={index} className="border-primary/20 hover:border-primary/40 transition-colors hover-scale">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-100">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {product.score}% Match
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <span className="text-sm text-muted-foreground">{product.price}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.reasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full text-lg font-medium"
                        onClick={() => window.location.href = product.link}
                      >
                        More Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No specific recommendations available</h3>
                <p className="text-muted-foreground mb-6">Contact us for personalized consultation based on your requirements</p>
                <Button variant="outline">
                  Contact Sales Team
                </Button>
              </div>
            )}
            
            <div className="flex justify-center pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={resetWizard}
                className="text-lg font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            Product Selection Helper
          </CardTitle>
          <p className="text-muted-foreground">
            Find the perfect solution for your testing needs in 3 simple steps
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Step Content */}
          <div className="min-h-[400px]">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              {getStepTitle()}
            </h3>

            {/* Step 1: Application Area */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {applications.map((app) => {
                    const IconComponent = app.icon;
                    return (
                      <Card
                        key={app.value}
                        className={`cursor-pointer transition-all hover-scale ${
                          selectedApplication === app.value
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-gray-200 hover:border-primary/40"
                        }`}
                        onClick={() => setSelectedApplication(app.value)}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                              selectedApplication === app.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{app.label}</h4>
                          <p className="text-sm text-muted-foreground">{app.description}</p>
                          {selectedApplication === app.value && (
                            <div className="mt-3">
                              <CheckCircle className="w-5 h-5 text-primary mx-auto" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Budget Range */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    €{budgetRange[0].toLocaleString()}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {getBudgetLabel(budgetRange[0])}
                  </div>
                </div>
                
                <div className="px-8">
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    max={100000}
                    min={5000}
                    step={5000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>€5,000</span>
                    <span>€100,000+</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-8">
                  <Card className={`text-center p-4 ${budgetRange[0] < 15000 ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <h4 className="font-medium text-gray-900">Entry Level</h4>
                    <p className="text-sm text-muted-foreground">€5,000 - €15,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Basic testing solutions</p>
                  </Card>
                  <Card className={`text-center p-4 ${budgetRange[0] >= 15000 && budgetRange[0] < 40000 ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <h4 className="font-medium text-gray-900">Mid Range</h4>
                    <p className="text-sm text-muted-foreground">€15,000 - €40,000</p>
                    <p className="text-xs text-muted-foreground mt-1">Professional grade equipment</p>
                  </Card>
                  <Card className={`text-center p-4 ${budgetRange[0] >= 40000 ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <h4 className="font-medium text-gray-900">Premium</h4>
                    <p className="text-sm text-muted-foreground">€40,000+</p>
                    <p className="text-xs text-muted-foreground mt-1">High-end precision systems</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-center text-muted-foreground mb-6">
                  Select any additional requirements that are important for your application
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {requirements.map((req) => (
                    <Card
                      key={req.id}
                      className={`cursor-pointer transition-all hover-scale ${
                        selectedRequirements.includes(req.id)
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-primary/40"
                      }`}
                      onClick={() => toggleRequirement(req.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="mb-2">
                          {selectedRequirements.includes(req.id) ? (
                            <CheckCircle className="w-6 h-6 text-primary mx-auto" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full mx-auto" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{req.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="text-lg font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step <= currentStep ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="text-lg font-medium"
            >
              {currentStep === 3 ? "View Results" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSelectionHelper;