import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import StickyLogo from "@/components/StickyLogo";
import GlobalPasswordGate from "@/components/GlobalPasswordGate";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import InsideLab from "./pages/InsideLab";
import YourSolution from "./pages/YourSolution";
import Products from "./pages/Products";
import Automotive from "./pages/Automotive";
import DynamicCMSPage from "./pages/DynamicCMSPage";
import MultispectralIllumination from "./pages/MultispectralIllumination";
import PageIdRouter from "@/components/PageIdRouter";
import Downloads from "./pages/Downloads";
import HiddenSegments from "./pages/HiddenSegments";
import Backlog from "./pages/Backlog";
import Charts from "./pages/Charts";
import ChartDetail from "./pages/ChartDetail";
import Cart from "./pages/Cart";
import Events from "./pages/Events";
import WhitePaper from "./pages/WhitePaper";
import WhitePaperDownload from "./pages/WhitePaperDownload";
import WhitePaperDetail from "./pages/WhitePaperDetail";
import ConferencePaperDownload from "./pages/ConferencePaperDownload";
import DownloadRegistrationSuccess from "./pages/DownloadRegistrationSuccess";
import DownloadConfirmation from "./pages/DownloadConfirmation";
import ConfirmContact from "./pages/ConfirmContact";
import ConfirmDone from "./pages/ConfirmDone";
import Optin from "./pages/Optin";
import VideoDownload from "./pages/VideoDownload";
import EventRegistrationConfirmation from "./pages/EventRegistrationConfirmation";
import EventDetailRegistrationConfirmation from "./pages/EventDetailRegistrationConfirmation";
import EventAlreadyRegistered from "./pages/EventAlreadyRegistered";
import EventRegistrationSuccess from "./pages/EventRegistrationSuccess";
import InCabinTesting from "./pages/InCabinTesting";
import Contact from "./pages/Contact";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import RealNews from "./pages/RealNews";
import Styleguide from "./pages/Styleguide";
import IconsStyleguide from "./pages/IconsStyleguide";
import ComprehensiveStyleguide from "./pages/ComprehensiveStyleguide";
import ImageDownload from "./pages/ImageDownload";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNews from "./pages/AdminNews";
import NotFound from "./pages/NotFound";
import { MauticTracker } from "./components/MauticTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <StickyLogo />
          <MauticTracker />
          <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/inside-lab" element={<InsideLab />} />
        <Route path="/industries" element={<YourSolution />} />
        <Route path="/your-solution" element={<YourSolution />} />
        <Route path="/products" element={<Products />} />
        
        {/* Redirects for old URLs */}
        <Route path="/automotive" element={<Navigate to="/your-solution/automotive" replace />} />
        <Route path="/product/le7" element={<Navigate to="/products/test-charts/le7" replace />} />
        <Route path="/in-cabin-testing" element={<Navigate to="/your-solution/automotive/in-cabin-testing" replace />} />
        
        {/* Hierarchical Your Solution Routes - Catch-all for automatic CMS pages */}
        <Route path="/your-solution/automotive" element={<Automotive />} />
        <Route path="/your-solution/automotive/in-cabin-testing" element={<InCabinTesting />} />
        <Route path="/your-solution/scanners-archiving/multispectral-illumination" element={<MultispectralIllumination />} />
        
        {/* Universal catch-all routes for DynamicCMSPage - any new page works automatically! */}
        <Route path="/your-solution/:slug" element={<DynamicCMSPage />} />
        <Route path="/your-solution/automotive/:slug" element={<DynamicCMSPage />} />
        <Route path="/your-solution/scanners-archiving/:slug" element={<DynamicCMSPage />} />
        <Route path="/your-solution/mobile-phone/:slug" element={<DynamicCMSPage />} />
        
        {/* Hierarchical Product Routes */}
        
        <Route path="/downloads" element={<Downloads />} />
         <Route path="/hidden-segments" element={<HiddenSegments />} />
         <Route path="/backlog" element={<Backlog />} />
        <Route path="/charts" element={<Navigate to="/products/charts" replace />} />
        <Route path="/products/charts" element={<Charts />} />
        <Route path="/products/charts/:slug" element={<ChartDetail />} />
        <Route path="/cart" element={<Cart />} />
         <Route path="/events" element={<Events />} />
         <Route path="/whitepaper" element={<WhitePaper />} />
         <Route path="/whitepaper_download" element={<WhitePaperDownload />} />
         <Route path="/whitepaper/ieee-p2020" element={<WhitePaperDetail />} />
         <Route path="/conference_paper_download" element={<ConferencePaperDownload />} />
         <Route path="/download-registration-success" element={<DownloadRegistrationSuccess />} />
         <Route path="/download-confirmation" element={<DownloadConfirmation />} />
         <Route path="/confirm-contact" element={<ConfirmContact />} />
         <Route path="/confirm-done" element={<ConfirmDone />} />
         <Route path="/optin" element={<Optin />} />
         <Route path="/video_download" element={<VideoDownload />} />
         <Route path="/event-registration-confirmation" element={<EventRegistrationConfirmation />} />
         <Route path="/event-detail-registration-confirmation" element={<EventDetailRegistrationConfirmation />} />
         <Route path="/event-already-registered" element={<EventAlreadyRegistered />} />
         <Route path="/event-registration-success" element={<EventRegistrationSuccess />} />
         <Route path="/contact" element={<Contact />} />
         <Route path="/news" element={<News />} />
         <Route path="/news/:slug" element={<NewsDetail />} />
         <Route path="/real-news" element={<RealNews />} />
         <Route path="/styleguide" element={<Styleguide />} />
        <Route path="/icons-styleguide" element={<IconsStyleguide />} />
        <Route path="/comprehensive-styleguide" element={<ComprehensiveStyleguide />} />
        <Route path="/image-download" element={<ImageDownload />} />
         <Route path="/auth" element={<Auth />} />
         <Route path="/admin-dashboard" element={<AdminDashboard />} />
         <Route path="/admin-dashboard/news" element={<AdminNews />} />
           {/* Page ID Route - MUST be after all specific routes */}
           <Route path="/:pageId" element={<PageIdRouter />} />
           
           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
           <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
