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
    company: '',
    phone: '',
    country: '',
    street: '',
    postcode: '',
    city: '',
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
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${industriesHero})`
          }}
        />
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Get Expert Consultation
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
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
                  
                  <div className="mb-6">
                    <p className="text-base font-medium text-gray-700 mb-6">Request is created by:</p>
                  </div>

                  {/* Name and Country Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div>
                      <Label htmlFor="country" className="text-base font-medium text-gray-700 mb-3 block">Country*</Label>
                      <Select onValueChange={(value) => handleInputChange('country', value)} required>
                        <SelectTrigger className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg">
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

                  {/* Address Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="street" className="text-base font-medium text-gray-700 mb-3 block">Street/Number:</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode" className="text-base font-medium text-gray-700 mb-3 block">Postcode:</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-base font-medium text-gray-700 mb-3 block">City:</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Contact Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <Label htmlFor="phone" className="text-base font-medium text-gray-700 mb-3 block">Phone*</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-base font-medium text-gray-700 mb-3 block">Company*</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder=""
                        className="h-12 text-base bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Product Interest */}
                  <div>
                    <Label htmlFor="subject" className="text-base font-medium text-gray-700 mb-3 block">Which products are you interested in?*</Label>
                    <Select onValueChange={(value) => handleInputChange('subject', value)} required>
                      <SelectTrigger className="h-12 text-base bg-primary text-black border-0 rounded-md focus:ring-2 focus:ring-primary font-medium">
                        <SelectValue placeholder="Select an option ..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg">
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

                  {/* Attachment */}
                  <div>
                    <Label className="text-base font-medium text-gray-700 mb-3 block">Do you have an attachment?</Label>
                    <p className="text-sm text-gray-500">You can attach files after submitting the form or send them via email.</p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-black px-10 py-4 text-base rounded-md font-medium transition-colors group"
                    >
                      Submit
                      <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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