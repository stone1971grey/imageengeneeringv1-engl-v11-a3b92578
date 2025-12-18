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
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  MessageSquare, 
  Calendar, 
  CheckCircle2
} from "lucide-react";

const INTEREST_OPTIONS = [
  { id: "products", label: "Products & Equipment" },
  { id: "testlab", label: "Test Lab Services" },
  { id: "consulting", label: "Consulting" },
  { id: "training", label: "Training & Events" },
  { id: "software", label: "Software Solutions" },
  { id: "custom", label: "Custom Projects" },
];

const contactSchema = z.object({
  firstName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  interests: z.array(z.string()).optional(),
  message: z.string().optional().default(""),
  consent: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      email: "",
      interests: [],
      message: "",
      consent: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const interestLabels = data.interests?.map(id => 
        INTEREST_OPTIONS.find(opt => opt.id === id)?.label
      ).filter(Boolean).join(", ") || "General";
      
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          first_name: data.firstName,
          last_name: "",
          email: data.email,
          phone: null,
          subject: `Inquiry: ${interestLabels}`,
          message: data.message,
        });

      if (error) throw error;

      setIsSubmitted(true);
      setShowForm(false);
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
            {/* Submit Inquiry Card - Yellow */}
            <Card 
              className="group cursor-pointer transition-all duration-300 bg-[hsl(50,95%,55%)] border-2 border-[hsl(50,95%,55%)] shadow-lg hover:shadow-xl hover:bg-[hsl(50,95%,50%)]"
              onClick={() => setShowForm(true)}
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-black">
                  Submit an Inquiry
                </h3>
                <p className="text-black/70 mb-6">
                  Connect with us, request information, ask a question, or get started with a new project.
                </p>
                <Button 
                  className="bg-black text-white hover:bg-black/90"
                >
                  Leave us a Message
                </Button>
                <p className="text-sm mt-4 text-black/60">
                  We typically reply within one business day.
                </p>
              </CardContent>
            </Card>

            {/* Schedule Meeting Card - Black with white border */}
            <Card 
              className="group cursor-pointer transition-all duration-300 bg-black border border-white/40 hover:border-white/60 hover:shadow-lg"
              onClick={() => window.open("mailto:info@image-engineering.de?subject=Meeting Request", "_blank")}
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Schedule a Meeting
                </h3>
                <p className="text-white/70 mb-6">
                  Select a convenient time slot and have a video call with our experts to discuss your needs.
                </p>
                <Button 
                  variant="outline"
                  className="border-white/50 text-white bg-transparent hover:bg-white/10"
                >
                  Book a Video Meeting
                </Button>
                <p className="text-sm text-white/50 mt-4">
                  Synced with availability on both sides.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Dialog - Clean & Modern */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-4xl bg-white border-0 shadow-2xl rounded-2xl p-4 overflow-hidden max-h-[70vh] overflow-y-auto [&>button]:top-3 [&>button]:right-3 mt-24">
              {/* Inner gray content area - matching flyout style */}
              <div className="bg-[#e8e8e8] rounded-xl p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-black mb-1">
                    Submit an Inquiry
                  </h2>
                  <p className="text-black text-sm leading-relaxed">
                    Tell us more about your needs, and how we can assist you. We will get in touch with you and do our best to help.
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name & Email - Side by side */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                placeholder="Name"
                                className="h-11 bg-transparent border-0 border-b-2 border-gray-700 rounded-none text-black text-base placeholder:text-black focus:border-black focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="Email"
                                className="h-11 bg-transparent border-0 border-b-2 border-gray-700 rounded-none text-black text-base placeholder:text-black focus:border-black focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Interest Selection - Modern Pills */}
                    <div className="pt-1">
                      <p className="text-sm text-black mb-2">I'm interested in:</p>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_OPTIONS.map((option) => {
                          const interests = form.watch("interests") || [];
                          const isSelected = interests.includes(option.id);
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                const current = form.getValues("interests") || [];
                                if (isSelected) {
                                  form.setValue("interests", current.filter(id => id !== option.id));
                                } else {
                                  form.setValue("interests", [...current, option.id]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                isSelected 
                                  ? "bg-black text-white" 
                                  : "bg-[hsl(50,95%,55%)] text-black hover:bg-[hsl(50,95%,45%)]"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your project or the challenge you have."
                              className="min-h-[60px] bg-transparent border-0 border-b-2 border-gray-700 rounded-none text-black text-base placeholder:text-black focus:border-black focus-visible:ring-0 focus-visible:ring-offset-0 resize-none transition-colors"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Consent */}
                    <div className="pt-1 space-y-2">
                      <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1 h-5 w-5 border-2 border-gray-700 data-[state=checked]:bg-[hsl(50,95%,55%)] data-[state=checked]:border-[hsl(50,95%,55%)] data-[state=checked]:text-black"
                              />
                            </FormControl>
                            <FormLabel className="text-sm text-black font-normal leading-relaxed">
                              I consent to the processing of my personal data and agree to the{" "}
                              <a href="/privacy" className="underline hover:text-black">
                                Terms & Conditions
                              </a>.
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || !form.formState.isValid}
                        className="w-full h-12 text-base font-semibold bg-[hsl(50,95%,55%)] hover:bg-[hsl(50,95%,50%)] text-black rounded-lg transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>

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
