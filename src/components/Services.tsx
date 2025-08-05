import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Eye, Brain, BarChart3, Camera, Zap, Shield } from "lucide-react";
import computerVisionIcon from "@/assets/computer-vision-icon.jpg";
import aiProcessingIcon from "@/assets/ai-processing-icon.jpg";
import analyticsIcon from "@/assets/analytics-icon.jpg";

const Services = () => {
  const services = [
    {
      icon: computerVisionIcon,
      title: "Computer Vision",
      description: "Advanced object detection, recognition, and tracking systems for real-time applications.",
      features: ["Real-time Processing", "Multi-object Detection", "3D Vision Systems"]
    },
    {
      icon: aiProcessingIcon,
      title: "AI Image Processing",
      description: "Machine learning-powered image enhancement, restoration, and intelligent analysis.",
      features: ["Deep Learning Models", "Automated Enhancement", "Pattern Recognition"]
    },
    {
      icon: analyticsIcon,
      title: "Visual Analytics",
      description: "Transform visual data into actionable insights with advanced analytics platforms.",
      features: ["Predictive Analytics", "Custom Dashboards", "Real-time Monitoring"]
    }
  ];

  const capabilities = [
    { icon: Camera, title: "High-Resolution Processing", desc: "Up to 8K image handling" },
    { icon: Zap, title: "Lightning Fast", desc: "Sub-50ms processing times" },
    { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant infrastructure" }
  ];

  return (
    <section id="services" className="py-24" style={{ backgroundColor: '#777777' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Precision-Engineered
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From concept to deployment, we deliver cutting-edge image processing technologies 
            that transform how you interact with visual data.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="bg-gradient-card border-border/50 hover:shadow-card hover:scale-105 transition-all duration-300 group"
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <img 
                    src={service.icon} 
                    alt={service.title}
                    className="w-16 h-16 object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className="flex items-center text-primary hover:text-primary-glow transition-colors group/btn">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Capabilities */}
        <div className="grid md:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-center p-6 bg-secondary/30 rounded-lg border border-border/30">
              <div className="p-3 bg-primary/10 rounded-lg mr-4">
                <capability.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">{capability.title}</h4>
                <p className="text-sm text-muted-foreground">{capability.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;