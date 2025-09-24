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

      {/* Clean Header */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Contact Our Sales Engineer
            </h1>
            <p className="text-lg text-gray-600">
              To contact our sales engineer directly, please fill out the following contact form.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              * = Mandatory field
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">Request is created by:</p>
                  </div>

                  {/* Name and Country Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">First Name*</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">Last Name*</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">Country*</Label>
                      <Select onValueChange={(value) => handleInputChange('country', value)} required>
                        <SelectTrigger className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="street" className="text-sm font-medium text-gray-700 mb-2 block">Street/Number:</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode" className="text-sm font-medium text-gray-700 mb-2 block">Postcode:</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">City:</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Contact Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">Email*</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">Phone*</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm font-medium text-gray-700 mb-2 block">Company*</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder=""
                        className="h-10 bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Product Interest */}
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium text-gray-700 mb-2 block">Which products are you interested in?*</Label>
                    <Select onValueChange={(value) => handleInputChange('subject', value)} required>
                      <SelectTrigger className="h-10 bg-primary text-white border-0 rounded-md focus:ring-2 focus:ring-primary">
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
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">Your message:</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please insert here"
                      className="min-h-[120px] bg-white border border-gray-300 rounded-md focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      required
                    />
                  </div>

                  {/* Attachment */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Do you have an attachment?</Label>
                    <p className="text-xs text-gray-500">You can attach files after submitting the form or send them via email.</p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-md font-medium transition-colors"
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