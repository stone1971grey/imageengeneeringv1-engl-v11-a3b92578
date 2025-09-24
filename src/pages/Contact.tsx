import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, MapPin, Send, Clock, Users, MessageCircle, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    country: '',
    subject: '',
    message: '',
    newsletter: false,
    urgency: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you within 24 hours.");
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Let's Build Something
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Amazing Together</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Ready to transform your image quality testing? Our experts are here to help you find the perfect solution 
              for your specific requirements. Get in touch and let's discuss your project.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Contact Form - Takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-background to-muted/10 border-border/50 shadow-xl">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-bold">Get In Touch</CardTitle>
                  <CardDescription className="text-lg">
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Personal Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-base font-medium">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="John"
                          className="mt-2 h-12 bg-background/50 border-2 focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-base font-medium">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Doe"
                          className="mt-2 h-12 bg-background/50 border-2 focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email" className="text-base font-medium">Business Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="john.doe@company.com"
                          className="mt-2 h-12 bg-background/50 border-2 focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-base font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+49 123 456 789"
                          className="mt-2 h-12 bg-background/50 border-2 focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="company" className="text-base font-medium">Company *</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Your Company Name"
                          className="mt-2 h-12 bg-background/50 border-2 focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-base font-medium">Country</Label>
                        <Select onValueChange={(value) => handleInputChange('country', value)}>
                          <SelectTrigger className="mt-2 h-12 bg-background/50 border-2 focus:border-primary">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="germany">Germany</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                            <SelectItem value="italy">Italy</SelectItem>
                            <SelectItem value="japan">Japan</SelectItem>
                            <SelectItem value="china">China</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="subject" className="text-base font-medium">Project Type *</Label>
                        <Select onValueChange={(value) => handleInputChange('subject', value)} required>
                          <SelectTrigger className="mt-2 h-12 bg-background/50 border-2 focus:border-primary">
                            <SelectValue placeholder="What can we help you with?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="test-charts">Test Charts & Targets</SelectItem>
                            <SelectItem value="measurement-devices">Measurement Devices</SelectItem>
                            <SelectItem value="illumination">Illumination Systems</SelectItem>
                            <SelectItem value="software">Software Solutions</SelectItem>
                            <SelectItem value="consulting">Consulting & Training</SelectItem>
                            <SelectItem value="custom-solution">Custom Solution</SelectItem>
                            <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="urgency" className="text-base font-medium">Timeline</Label>
                        <Select onValueChange={(value) => handleInputChange('urgency', value)}>
                          <SelectTrigger className="mt-2 h-12 bg-background/50 border-2 focus:border-primary">
                            <SelectValue placeholder="When do you need this?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent (within 1 week)</SelectItem>
                            <SelectItem value="soon">Soon (within 1 month)</SelectItem>
                            <SelectItem value="normal">Normal (1-3 months)</SelectItem>
                            <SelectItem value="planning">Planning phase (3+ months)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message" className="text-base font-medium">Project Details *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us about your image quality testing requirements, current challenges, or what solution you're looking for. The more details you provide, the better we can help you."
                        className="mt-2 min-h-[140px] bg-background/50 border-2 focus:border-primary resize-none"
                        required
                      />
                    </div>

                    {/* Newsletter Checkbox */}
                    <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
                      <Checkbox
                        id="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) => handleInputChange('newsletter', !!checked)}
                      />
                      <Label htmlFor="newsletter" className="text-sm cursor-pointer">
                        I'd like to receive updates about new products and industry insights
                      </Label>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:shadow-glow transition-all duration-300 group"
                    >
                      Send Message
                      <Send className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      By submitting this form, you agree to our privacy policy and terms of service.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Contact Details Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                  <CardDescription>
                    Multiple ways to reach our expert team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Email</h4>
                      <p className="text-sm text-muted-foreground">contact@image-engineering.de</p>
                      <p className="text-sm text-muted-foreground">support@image-engineering.de</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Phone</h4>
                      <p className="text-sm text-muted-foreground">+49 (0) 341 912 39205</p>
                      <p className="text-xs text-muted-foreground">Mon-Fri, 9:00-18:00 CET</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Location</h4>
                      <p className="text-sm text-muted-foreground">Leipzig, Germany</p>
                      <p className="text-xs text-muted-foreground">European Union</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Card */}
              <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-200/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Clock className="h-6 w-6 text-green-600" />
                    <h3 className="font-semibold text-green-800">Quick Response</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    We typically respond within 24 hours
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Urgent inquiries are prioritized and handled within 4 hours during business days
                  </p>
                </CardContent>
              </Card>

              {/* Expert Team Card */}
              <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-200/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Expert Team</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">
                    15+ years of experience in image quality
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Our engineers have worked with leading automotive, mobile, and camera manufacturers
                  </p>
                </CardContent>
              </Card>

              {/* Consultation CTA */}
              <Card className="bg-gradient-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-90" />
                  <h3 className="font-semibold mb-2">Free Consultation</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Schedule a 30-minute call with our technical experts
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-background text-foreground hover:bg-background/90"
                  >
                    Book a Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-16 border-t border-border/50">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of companies who trust us with their image quality testing needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">500+ Projects</h3>
                <p className="text-sm text-muted-foreground">Successfully completed worldwide</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">100+ Clients</h3>
                <p className="text-sm text-muted-foreground">From startups to Fortune 500 companies</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Ongoing technical assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;