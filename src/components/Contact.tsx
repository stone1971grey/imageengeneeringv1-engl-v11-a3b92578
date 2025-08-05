import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Transform</span>
            Your Vision?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Let's discuss how our image engineering solutions can revolutionize your business. 
            Get in touch with our experts today.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input placeholder="John" className="bg-background/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input placeholder="Doe" className="bg-background/50" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input type="email" placeholder="john@company.com" className="bg-background/50" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input placeholder="Your Company" className="bg-background/50" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Project Details</label>
                  <Textarea 
                    placeholder="Tell us about your image processing requirements..."
                    className="bg-background/50 min-h-[120px]"
                  />
                </div>
                
                <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 group">
                  Send Message
                  <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our team of image engineering experts is ready to help you unlock 
                the full potential of your visual data. From initial consultation 
                to deployment and beyond, we're here to support your journey.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-3 bg-primary/10 rounded-lg mr-4">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-muted-foreground">contact@image-engineering.de</p>
                  <p className="text-muted-foreground">support@image-engineering.de</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-3 bg-primary/10 rounded-lg mr-4">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone</h4>
                  <p className="text-muted-foreground">+49 (0) 123 456 789</p>
                  <p className="text-muted-foreground text-sm">Mon-Fri, 9:00-18:00 CET</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-3 bg-primary/10 rounded-lg mr-4">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Location</h4>
                  <p className="text-muted-foreground">Berlin, Germany</p>
                  <p className="text-muted-foreground text-sm">European Union</p>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <Card className="bg-gradient-primary p-6 text-primary-foreground">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2">Start Your Project Today</h4>
                <p className="text-primary-foreground/80 mb-4">
                  Free consultation and technical assessment
                </p>
                <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                  Schedule Call
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;