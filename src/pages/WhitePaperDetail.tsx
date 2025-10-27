import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Users, Clock, MapPin, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import eventImage1 from "@/assets/event-automotive-conference-new.jpg";
import eventImage2 from "@/assets/event-automotive-standards-new.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Form validation schema
const registrationFormSchema = z.object({
  phone: z.string().optional(),
  currentTestSystems: z.string().min(1, { message: "Bitte wählen Sie ein Test-System aus" }),
  industry: z.string().min(1, { message: "Bitte wählen Sie eine Branche aus" }),
  automotiveInterests: z.array(z.string()).min(1, { message: "Bitte wählen Sie mindestens ein Hauptinteresse aus" }),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface EventData {
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
}

const WhitePaperDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firstName, lastName, email, company, position } = (location.state as { 
    firstName?: string; 
    lastName?: string;
    email?: string;
    company?: string;
    position?: string;
  }) || {};

  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      phone: "",
      currentTestSystems: "",
      industry: "",
      automotiveInterests: [],
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    if (!selectedEvent || !firstName || !lastName || !email || !company || !position) {
      toast.error("Fehlende Benutzerdaten. Bitte laden Sie die Seite neu.");
      return;
    }

    try {
      console.log("Registration data:", { ...data, event: selectedEvent.title });
      
      const { error } = await supabase.from('event_registrations').insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        company: company,
        position: position,
        phone: data.phone || null,
        current_test_systems: data.currentTestSystems,
        industry: data.industry,
        automotive_interests: data.automotiveInterests,
        event_title: selectedEvent.title,
        event_date: selectedEvent.date,
        event_location: selectedEvent.location,
      });

      if (error) {
        console.error("Error inserting registration:", error);
        toast.error("Fehler bei der Registrierung. Bitte versuchen Sie es erneut.");
        return;
      }

      setRegistrationSuccess(true);
      toast.success("Anmeldung erfolgreich! Sie werden weitergeleitet...");
      
      setTimeout(() => {
        navigate('/event_detail_registration_confirmation', { 
          state: { 
            firstName,
            lastName,
            eventData: selectedEvent
          } 
        });
      }, 1000);
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
  };

  const handleRegisterClick = (eventData: EventData) => {
    setSelectedEvent(eventData);
    setRegistrationSuccess(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedEvent(null);
      setIsClosing(false);
      form.reset();
    }, 500);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/P2020_white_paper.pdf';
    link.download = 'IEEE_P2020_Automotive_Imaging_White_Paper.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#f3f3f5] pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Header Card */}
          <Card className="mb-8 border-0 shadow-xl overflow-hidden" style={{ backgroundColor: '#f3f3f5' }}>
            <div className="px-8 py-12">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-lg border border-slate-300">
                  <FileText className="h-8 w-8 text-black" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl lg:text-5xl font-bold text-black mb-3 leading-tight">
                    How Well Do Vehicles Really "See"?
                  </h1>
                  <h2 className="text-xl lg:text-2xl text-black">
                    The IEEE P2020 Automotive Imaging White Paper
                  </h2>
                </div>
              </div>
            </div>

            <CardContent className="px-8 py-8">
              {/* Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-base text-black">Published</p>
                    <p className="font-semibold text-lg text-black">2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-base text-black">Pages</p>
                    <p className="font-semibold text-lg text-black">45 Pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-black" />
                  <div>
                    <p className="text-base text-black">Category</p>
                    <p className="font-semibold text-lg text-black">Automotive Standards</p>
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-black mb-4">Abstract</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-black leading-relaxed mb-4">
                      Modern vehicles increasingly rely on camera systems for critical safety and automation features. 
                      But how well do these automotive imaging systems really perform? This comprehensive white paper 
                      examines the IEEE P2020 standard for automotive imaging quality assessment.
                    </p>
                    <p className="text-lg text-black leading-relaxed mb-4">
                      The document provides detailed insights into standardized testing methodologies, quality metrics, 
                      and best practices for evaluating camera performance in automotive applications. It covers essential 
                      topics including resolution, dynamic range, color accuracy, and low-light performance.
                    </p>
                    <p className="text-lg text-black leading-relaxed">
                      This white paper is essential reading for automotive engineers, OEMs, Tier-1 suppliers, and anyone 
                      involved in the development, testing, or validation of automotive camera systems.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl p-6 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
                  <h3 className="text-xl font-semibold text-black mb-3">Key Topics Covered</h3>
                  <ul className="space-y-2 text-base text-black">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>IEEE P2020 standard overview and requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Standardized test methodologies for automotive cameras</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Key performance indicators and quality metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Real-world testing scenarios and validation approaches</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f5743a] mt-1">•</span>
                      <span>Industry best practices and recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Download CTA */}
              <div className="rounded-2xl p-8 border border-slate-200" style={{ backgroundColor: '#f3f3f5' }}>
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-black">
                      Download the Full White Paper
                    </h3>
                    <p className="text-lg text-black">
                      Get instant access to this comprehensive 45-page technical document
                    </p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="text-white font-semibold px-12 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#f5743a' }}
                    onClick={handleDownload}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF (2.5 MB)
                  </Button>
                  
                  <p className="text-base text-black">
                    No registration required • Instant download
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Event 1 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-black flex flex-col">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={eventImage1} 
                  alt="Automotive Testing Conference 2025" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="space-y-3 flex-1">
                <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal w-fit">
                  Messe
                </Badge>
                <CardTitle className="text-xl leading-tight text-white">
                  Automotive Testing Conference 2025
                </CardTitle>
                <div className="space-y-2 text-base text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-white" />
                    <span>08. Dezember 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-white" />
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-white" />
                    <span>Detroit, USA</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed text-white">
                  Major automotive testing conference with focus on ADAS and autonomous vehicle vision systems.
                </CardDescription>
                
                {/* Simple map placeholder */}
                <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-white" />
                    <p className="text-base text-white">Detroit, USA</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white"
                  onClick={() => handleRegisterClick({
                    title: "Automotive Testing Conference 2025",
                    date: "08. Dezember 2025",
                    time: "09:00 - 18:00",
                    location: "Detroit, USA",
                    image: eventImage1
                  })}
                >
                  Register Now
                </Button>
              </CardContent>
            </Card>

            {/* Event 2 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-black flex flex-col">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={eventImage2} 
                  alt="Automotive Vision Standards Workshop" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="space-y-3 flex-1">
                <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal w-fit">
                  Schulung
                </Badge>
                <CardTitle className="text-xl leading-tight text-white">
                  Automotive Vision Standards Workshop
                </CardTitle>
                <div className="space-y-2 text-base text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-white" />
                    <span>15. Juli 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-white" />
                    <span>09:00 - 16:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-white" />
                    <span>Shanghai, China</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed text-white">
                  Comprehensive training on automotive vision testing standards and regulatory compliance.
                </CardDescription>
                
                {/* Simple map placeholder */}
                <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-white" />
                    <p className="text-base text-white">Shanghai, China</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white"
                  onClick={() => handleRegisterClick({
                    title: "Automotive Vision Standards Workshop",
                    date: "15. Juli 2025",
                    time: "09:00 - 16:00",
                    location: "Shanghai, China",
                    image: eventImage2
                  })}
                >
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form - appears after event selection */}
          {selectedEvent && (
            <div className={`transition-all duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'} max-w-4xl mx-auto mt-8`}>
              <Card className={`transition-all duration-500 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-scale-in'} bg-black`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">
                      Registrierung
                    </Badge>
                    <Button variant="ghost" onClick={handleClose} className="hover:bg-[#f5743a] hover:text-white transition-colors text-white">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardTitle className="text-3xl text-white">{selectedEvent.title}</CardTitle>
                  <div className="space-y-2 text-base text-white mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-white" />
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-white" />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-white" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 mb-6">
                    <p className="text-lg font-semibold text-white">
                      Registrieren Sie sich für diese Veranstaltung
                    </p>
                    
                    <p className="text-base text-white">
                      Bitte füllen Sie die folgenden Zusatzinformationen aus. Ihre Basisdaten haben wir bereits gespeichert.
                    </p>
                  </div>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-base">
                      <FormField
                        control={form.control}
                        name="currentTestSystems"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-white">Aktuell verwendete Test-Systeme *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-[#606060] text-white border-white/20">
                                  <SelectValue placeholder="Bitte auswählen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#606060] text-white border-white/20">
                                <SelectItem value="arcturus-led">Arcturus LED</SelectItem>
                                <SelectItem value="iq-analyzer">iQ-Analyzer</SelectItem>
                                <SelectItem value="le7">LE7</SelectItem>
                                <SelectItem value="competitor">Konkurrenz-Systeme</SelectItem>
                                <SelectItem value="none">Keine/Sonstige</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-white">Branche *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-[#606060] text-white border-white/20">
                                  <SelectValue placeholder="Bitte auswählen" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#606060] text-white border-white/20">
                                <SelectItem value="automotive-oem">Automotive OEM</SelectItem>
                                <SelectItem value="automotive-tier1">Automotive Tier-1 Supplier</SelectItem>
                                <SelectItem value="automotive-tier2">Automotive Tier-2 Supplier</SelectItem>
                                <SelectItem value="mobile">Mobile Phone</SelectItem>
                                <SelectItem value="security">Security & Surveillance</SelectItem>
                                <SelectItem value="medical">Medical & Endoscopy</SelectItem>
                                <SelectItem value="research">Research/University</SelectItem>
                                <SelectItem value="other">Sonstige</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="automotiveInterests"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-white mb-3 block">
                              Hauptinteressen im Automotive Bereich * (Mehrfachauswahl möglich)
                            </FormLabel>
                            <div className="space-y-2">
                              {[
                                { id: "adas", label: "ADAS Testing" },
                                { id: "in-cabin", label: "In-Cabin Monitoring" },
                                { id: "hdr", label: "HDR Performance" },
                                { id: "low-light", label: "Low-Light Testing" },
                                { id: "ieee-p2020", label: "IEEE P2020 Compliance" },
                                { id: "led-flicker", label: "LED Flicker" },
                                { id: "geometric", label: "Geometric Calibration" },
                              ].map((item) => (
                                <FormField
                                  key={item.id}
                                  control={form.control}
                                  name="automotiveInterests"
                                  render={({ field }) => (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                          className="border-white/20 data-[state=checked]:bg-[#f5743a] data-[state=checked]:border-[#f5743a]"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal text-white cursor-pointer">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium text-white">Telefonnummer (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+49 123 456789" 
                                {...field} 
                                className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white font-semibold text-lg py-6"
                          disabled={registrationSuccess}
                        >
                          {registrationSuccess ? "Anmeldung erfolgreich!" : "Jetzt anmelden"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WhitePaperDetail;
