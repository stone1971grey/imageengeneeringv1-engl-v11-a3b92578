import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import industriesHero from "@/assets/industries-hero.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you within 24 hours.");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${industriesHero})`
          }}
        />
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl mb-6">
              <span className="text-foreground font-normal">Get Expert</span><br />
              <span className="text-foreground font-bold">Consultation</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl">
              Connect with our imaging specialists and discover the perfect testing solution for your project requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Contact Form</h2>
              <p className="text-base text-gray-600 mb-2">
                To contact our sales engineer directly, please fill out the following contact form.
              </p>
              <p className="text-sm text-gray-500">* = Mandatory field</p>
            </div>
            
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-base font-medium text-gray-700 mb-3 block">First Name*</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-base font-medium text-gray-700 mb-3 block">Last Name*</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-base font-medium text-gray-700 mb-3 block">Email*</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-base font-medium text-gray-700 mb-3 block">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Product Interest */}
                  <div>
                    <Label htmlFor="subject" className="text-base font-medium text-gray-700 mb-3 block">Which products are you interested in?*</Label>
                    <Select onValueChange={(value) => handleInputChange('subject', value)} required>
                      <SelectTrigger className="h-12 text-base bg-[#f5743a] text-white border-0 rounded-md focus:ring-2 focus:ring-primary font-medium hover:bg-[#f5743a]/90">
                        <SelectValue placeholder="Select an option ..." />
                      </SelectTrigger>
                       <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                         <SelectItem value="test-charts" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Test Charts & Targets</SelectItem>
                         <SelectItem value="measurement-devices" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Measurement Devices</SelectItem>
                         <SelectItem value="illumination" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Illumination Systems</SelectItem>
                         <SelectItem value="software" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Software Solutions</SelectItem>
                         <SelectItem value="consulting" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Consulting & Training</SelectItem>
                         <SelectItem value="custom-solution" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Custom Solution</SelectItem>
                         <SelectItem value="partnership" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Partnership Inquiry</SelectItem>
                         <SelectItem value="support" className="text-gray-900 hover:bg-gray-100 hover:text-black focus:bg-gray-100 focus:text-black text-base p-1">Technical Support</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-base font-medium text-gray-700 mb-3 block">Your message:</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please insert here"
                      className="min-h-[140px] text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button 
                      type="submit"
                      className="bg-[#f5743a] hover:bg-[#f5743a]/90 text-white px-10 py-4 text-base rounded-md font-medium transition-colors"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;