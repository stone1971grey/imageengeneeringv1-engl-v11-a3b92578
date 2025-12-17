import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Send, 
  MessageSquare, 
  Calendar, 
  CheckCircle2,
  Camera,
  Car,
  Microscope,
  Monitor,
  Factory,
  Lightbulb,
  BarChart3,
  Ruler,
  GraduationCap
} from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  consent: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const INTEREST_OPTIONS = [
  { id: "test-charts", label: "Test Charts", icon: Ruler },
  { id: "automotive", label: "Automotive Testing", icon: Car },
  { id: "camera-testing", label: "Camera & Image Quality", icon: Camera },
  { id: "medical", label: "Medical Imaging", icon: Microscope },
  { id: "machine-vision", label: "Machine Vision", icon: Factory },
  { id: "software", label: "Analysis Software", icon: Monitor },
  { id: "consulting", label: "Consulting Services", icon: Lightbulb },
  { id: "training", label: "Training & Workshops", icon: GraduationCap },
  { id: "custom-solutions", label: "Custom Solutions", icon: BarChart3 },
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      message: "",
      consent: false,
    },
    mode: "onChange",
  });

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || null,
          subject: selectedInterests.length > 0 
            ? `Interests: ${selectedInterests.join(", ")}`
            : "General Inquiry",
          message: data.message + (data.company ? `\n\nCompany: ${data.company}` : ""),
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within one business day.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-3xl p-12 border border-accent/20">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Your message has been received. Our team will review your inquiry and get back to you within one business day.
              </p>
              <Button 
                onClick={() => {
                  setIsSubmitted(false);
                  form.reset();
                  setSelectedInterests([]);
                  setShowForm(false);
                }}
                variant="outline"
                size="lg"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <p className="text-accent font-medium mb-4 tracking-wide uppercase text-sm">
              Get in Touch
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Let's explore how we can{" "}
              <span className="relative inline-block">
                <span className="relative z-10">work together</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-accent/30 -z-0"></span>
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you need test equipment, consulting services, or custom solutions — 
              our team of imaging experts is here to help you achieve your quality goals.
            </p>
          </div>

          {/* Contact Options Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
            {/* Submit Inquiry Card */}
            <Card 
              className={`group cursor-pointer transition-all duration-300 border-2 ${
                showForm 
                  ? "bg-accent border-accent shadow-lg shadow-accent/20" 
                  : "bg-accent/10 border-accent/30 hover:bg-accent hover:border-accent hover:shadow-lg hover:shadow-accent/20"
              }`}
              onClick={() => setShowForm(true)}
            >
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                  showForm ? "bg-accent-foreground/10" : "bg-accent/20 group-hover:bg-accent-foreground/10"
                }`}>
                  <MessageSquare className={`w-7 h-7 ${showForm ? "text-accent-foreground" : "text-accent-foreground group-hover:text-accent-foreground"}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${showForm ? "text-accent-foreground" : "text-foreground group-hover:text-accent-foreground"}`}>
                  Submit an Inquiry
                </h3>
                <p className={`mb-6 ${showForm ? "text-accent-foreground/80" : "text-muted-foreground group-hover:text-accent-foreground/80"}`}>
                  Connect with us, request information, ask a question, or get started with a new project.
                </p>
                <Button 
                  variant={showForm ? "secondary" : "outline"}
                  className={`${showForm ? "bg-background text-foreground hover:bg-background/90" : "border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"}`}
                >
                  Leave us a Message
                </Button>
                <p className={`text-sm mt-4 ${showForm ? "text-accent-foreground/60" : "text-muted-foreground group-hover:text-accent-foreground/60"}`}>
                  We typically reply within one business day.
                </p>
              </CardContent>
            </Card>

            {/* Schedule Meeting Card */}
            <Card className="group cursor-pointer transition-all duration-300 bg-primary/10 border-2 border-primary/30 hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-foreground/10 transition-colors">
                  <Calendar className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary-foreground">
                  Schedule a Meeting
                </h3>
                <p className="text-muted-foreground mb-6 group-hover:text-primary-foreground/80">
                  Select a convenient time slot and have a video call with our experts to discuss your needs.
                </p>
                <Button 
                  variant="outline"
                  className="border-primary text-primary group-hover:bg-primary-foreground group-hover:text-primary group-hover:border-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open("mailto:info@image-engineering.de?subject=Meeting Request", "_blank");
                  }}
                >
                  Book a Video Meeting
                </Button>
                <p className="text-sm text-muted-foreground mt-4 group-hover:text-primary-foreground/60">
                  Synced with availability on both sides.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Section */}
          {showForm && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-xl">
                <h2 className="text-3xl font-bold mb-2">Submit an Inquiry</h2>
                <p className="text-muted-foreground mb-8">
                  Tell us about your needs and how we can help you.
                </p>

                {/* Interest Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-4">
                    What are you interested in? <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {INTEREST_OPTIONS.map((interest) => {
                      const Icon = interest.icon;
                      const isSelected = selectedInterests.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          type="button"
                          onClick={() => toggleInterest(interest.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-200 ${
                            isSelected
                              ? "bg-accent border-accent text-accent-foreground shadow-md"
                              : "bg-background border-border hover:border-accent/50 hover:bg-accent/5"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? "text-accent-foreground" : "text-muted-foreground"}`} />
                          <span className="text-sm font-medium">{interest.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                className="h-12 bg-background"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                className="h-12 bg-background"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email & Company */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="john@company.com" 
                                className="h-12 bg-background"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your Company" 
                                className="h-12 bg-background"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder="+49 123 456 7890" 
                              className="h-12 bg-background"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project, challenge, or how we can assist you..."
                              className="min-h-[150px] bg-background resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Consent */}
                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal text-muted-foreground">
                              I consent to the processing of my personal data and agree to the{" "}
                              <a href="/privacy" className="text-accent hover:underline">
                                Privacy Policy
                              </a>
                              . *
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || !form.formState.isValid}
                      className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                        form.formState.isValid
                          ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Submit Inquiry
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h4 className="font-semibold mb-2">Email</h4>
              <a href="mailto:info@image-engineering.de" className="text-accent hover:underline">
                info@image-engineering.de
              </a>
            </div>
            <div className="p-6">
              <h4 className="font-semibold mb-2">Phone</h4>
              <a href="tel:+4922719789700" className="text-muted-foreground hover:text-foreground">
                +49 2271 9789-700
              </a>
            </div>
            <div className="p-6">
              <h4 className="font-semibold mb-2">Location</h4>
              <p className="text-muted-foreground">
                Frechen-Königsdorf, Germany
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
