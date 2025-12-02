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
import LogoDownload from "./pages/LogoDownload";
import LogoTest from "./pages/LogoTest";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNews from "./pages/AdminNews";
import FullHeroMigration from "./pages/FullHeroMigration";
import SegmentDebugView from "./pages/SegmentDebugView";
import NotFound from "./pages/NotFound";
import { MauticTracker } from "./components/MauticTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <ScrollToTop />
          <StickyLogo />
          <MauticTracker />
          <Routes>
            {/* Root redirects to English */}
            <Route path="/" element={<Navigate to="/en" replace />} />
            
            {/* Redirects for old URLs without language prefix to /en/ version */}
            <Route path="/inside-lab" element={<Navigate to="/en/inside-lab" replace />} />
            <Route path="/industries" element={<Navigate to="/en/your-solution" replace />} />
            <Route path="/your-solution" element={<Navigate to="/en/your-solution" replace />} />
            <Route path="/products" element={<Navigate to="/en/products" replace />} />
            <Route path="/automotive" element={<Navigate to="/en/your-solution/automotive" replace />} />
            <Route path="/photography" element={<Navigate to="/en/your-solution/photography" replace />} />
            <Route path="/scanners-archiving" element={<Navigate to="/en/your-solution/scanners-archiving" replace />} />
            <Route path="/broadcast-video" element={<Navigate to="/en/your-solution/broadcast-video" replace />} />
            <Route path="/security-surveillance" element={<Navigate to="/en/your-solution/security-surveillance" replace />} />
            <Route path="/medical-endoscopy" element={<Navigate to="/en/your-solution/medical-endoscopy" replace />} />
            <Route path="/web-camera" element={<Navigate to="/en/your-solution/web-camera" replace />} />
            <Route path="/machine-vision" element={<Navigate to="/en/your-solution/machine-vision" replace />} />
            <Route path="/mobile-phone" element={<Navigate to="/en/your-solution/mobile-phone" replace />} />
            <Route path="/your-solution/medical-endoscopy" element={<Navigate to="/en/your-solution/medical-endoscopy" replace />} />
            <Route path="/your-solution/mobile-phone" element={<Navigate to="/en/your-solution/mobile-phone" replace />} />
            <Route path="/in-cabin-testing" element={<Navigate to="/en/your-solution/automotive/in-cabin-testing" replace />} />
            <Route path="/your-solution/automotive/in-cabin-testing" element={<Navigate to="/en/your-solution/automotive/in-cabin-testing" replace />} />
            <Route path="/adas" element={<Navigate to="/en/your-solution/automotive/adas" replace />} />
            <Route path="/product/le7" element={<Navigate to="/en/products/test-charts/le7" replace />} />
            <Route path="/product/arcturus" element={<Navigate to="/en/products/illumination-devices/arcturus-led" replace />} />
            <Route path="/le7" element={<Navigate to="/en/products/test-charts/le7" replace />} />
            <Route path="/arcturus" element={<Navigate to="/en/products/illumination-devices/arcturus-led" replace />} />
            <Route path="/iq-led" element={<Navigate to="/en/products/illumination-devices/iq-led" replace />} />
            <Route path="/te42-ll" element={<Navigate to="/en/products/test-charts/te42-ll" replace />} />
            <Route path="/te292" element={<Navigate to="/en/products/test-charts/te292" replace />} />
            <Route path="/te294" element={<Navigate to="/en/products/test-charts/te294" replace />} />
            <Route path="/te42" element={<Navigate to="/en/products/test-charts/te42" replace />} />
            <Route path="/iq-analyzer" element={<Navigate to="/en/products/software/iq-analyzer" replace />} />
            <Route path="/camspecs" element={<Navigate to="/en/products/software/camspecs" replace />} />
            <Route path="/vega" element={<Navigate to="/en/products/software/vega" replace />} />
            <Route path="/product-bundle-ieee" element={<Navigate to="/en/products/bundles-services/product-bundle-ieee" replace />} />
            <Route path="/vcx-webcam-service" element={<Navigate to="/en/your-solution/web-camera/vcx-webcam-service" replace />} />
            <Route path="/camera-stabilization" element={<Navigate to="/en/your-solution/mobile-phone/camera-stabilization" replace />} />
            <Route path="/geometric-calibration-automotive" element={<Navigate to="/en/your-solution/automotive/geometric-calibration-automotive" replace />} />
            <Route path="/vcx-webcam" element={<Navigate to="/en/your-solution/web-camera/vcx-webcam" replace />} />
            <Route path="/iec-62676-5-testing" element={<Navigate to="/en/your-solution/security-surveillance/iec-62676-5-testing" replace />} />
            <Route path="/downloads" element={<Navigate to="/en/downloads" replace />} />
            <Route path="/hidden-segments" element={<Navigate to="/en/hidden-segments" replace />} />
            <Route path="/backlog" element={<Navigate to="/en/backlog" replace />} />
            <Route path="/charts" element={<Navigate to="/en/products/charts" replace />} />
            <Route path="/cart" element={<Navigate to="/en/cart" replace />} />
            <Route path="/events" element={<Navigate to="/en/events" replace />} />
            <Route path="/whitepaper" element={<Navigate to="/en/whitepaper" replace />} />
            <Route path="/whitepaper_download" element={<Navigate to="/en/whitepaper_download" replace />} />
            <Route path="/conference_paper_download" element={<Navigate to="/en/conference_paper_download" replace />} />
            <Route path="/download-registration-success" element={<Navigate to="/en/download-registration-success" replace />} />
            <Route path="/download-confirmation" element={<Navigate to="/en/download-confirmation" replace />} />
            <Route path="/confirm-contact" element={<Navigate to="/en/confirm-contact" replace />} />
            <Route path="/confirm-done" element={<Navigate to="/en/confirm-done" replace />} />
            <Route path="/optin" element={<Navigate to="/en/optin" replace />} />
            <Route path="/video_download" element={<Navigate to="/en/video_download" replace />} />
            <Route path="/event-registration-confirmation" element={<Navigate to="/en/event-registration-confirmation" replace />} />
            <Route path="/event-detail-registration-confirmation" element={<Navigate to="/en/event-detail-registration-confirmation" replace />} />
            <Route path="/event-already-registered" element={<Navigate to="/en/event-already-registered" replace />} />
            <Route path="/event-registration-success" element={<Navigate to="/en/event-registration-success" replace />} />
            <Route path="/contact" element={<Navigate to="/en/contact" replace />} />
            <Route path="/news" element={<Navigate to="/en/news" replace />} />
            <Route path="/real-news" element={<Navigate to="/en/real-news" replace />} />
            <Route path="/styleguide" element={<Navigate to="/en/styleguide" replace />} />
            <Route path="/icons-styleguide" element={<Navigate to="/en/icons-styleguide" replace />} />
            <Route path="/comprehensive-styleguide" element={<Navigate to="/en/comprehensive-styleguide" replace />} />
            <Route path="/image-download" element={<Navigate to="/en/image-download" replace />} />
            <Route path="/logo-download" element={<Navigate to="/en/logo-download" replace />} />
            <Route path="/auth" element={<Navigate to="/en/auth" replace />} />
            <Route path="/admin-dashboard" element={<Navigate to="/en/admin-dashboard" replace />} />
            <Route path="/full-hero-migration" element={<Navigate to="/en/full-hero-migration" replace />} />
            <Route path="/segment-debug" element={<Navigate to="/en/segment-debug" replace />} />
            {/* New redirect for static Test Charts page without language prefix */}
            <Route path="/products/test-charts" element={<Navigate to="/en/products/test-charts" replace />} />
            
            {/* Language-prefixed routes - all actual pages */}
            <Route path="/:lang" element={<Index />} />
            <Route path="/:lang/inside-lab" element={<InsideLab />} />
            <Route path="/:lang/your-solution" element={<YourSolution />} />
            <Route path="/:lang/products" element={<Products />} />
            
            {/* Hierarchical Your Solution Routes */}
            <Route path="/:lang/your-solution/automotive" element={<Automotive />} />
            <Route path="/:lang/your-solution/automotive/in-cabin-testing" element={<InCabinTesting />} />
            <Route path="/:lang/your-solution/scanners-archiving/multispectral-illumination" element={<MultispectralIllumination />} />
            
            {/* Universal catch-all routes for DynamicCMSPage */}
            <Route path="/:lang/your-solution/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/automotive/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/scanners-archiving/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/mobile-phone/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/web-camera/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/machine-vision/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/medical-endoscopy/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/broadcast-video/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/your-solution/security-surveillance/:slug" element={<DynamicCMSPage />} />
            
            {/* Universal catch-all routes for Products */}
            <Route path="/:lang/products/test-charts" element={<DynamicCMSPage />} />
            <Route path="/:lang/products/test-charts/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/products/illumination-devices/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/products/software/:slug" element={<DynamicCMSPage />} />
            <Route path="/:lang/products/bundles-services/:slug" element={<DynamicCMSPage />} />
            
            {/* Styleguide Routes - Order matters: most specific first */}
            <Route path="/:lang/styleguide" element={<DynamicCMSPage />} />
            <Route path="/:lang/styleguide/:category/:subcategory/:subpage" element={<DynamicCMSPage />} />
            <Route path="/:lang/styleguide/:category/:subcategory" element={<DynamicCMSPage />} />
            <Route path="/:lang/styleguide/:slug" element={<DynamicCMSPage />} />
            
            {/* Other pages */}
            <Route path="/:lang/downloads" element={<Downloads />} />
            <Route path="/:lang/hidden-segments" element={<HiddenSegments />} />
            <Route path="/:lang/backlog" element={<Backlog />} />
            <Route path="/:lang/products/charts" element={<Charts />} />
            <Route path="/:lang/products/charts/:slug" element={<ChartDetail />} />
            <Route path="/:lang/cart" element={<Cart />} />
            <Route path="/:lang/events" element={<Events />} />
            <Route path="/:lang/whitepaper" element={<WhitePaper />} />
            <Route path="/:lang/whitepaper_download" element={<WhitePaperDownload />} />
            <Route path="/:lang/whitepaper/ieee-p2020" element={<WhitePaperDetail />} />
            <Route path="/:lang/conference_paper_download" element={<ConferencePaperDownload />} />
            <Route path="/:lang/download-registration-success" element={<DownloadRegistrationSuccess />} />
            <Route path="/:lang/download-confirmation" element={<DownloadConfirmation />} />
            <Route path="/:lang/confirm-contact" element={<ConfirmContact />} />
            <Route path="/:lang/confirm-done" element={<ConfirmDone />} />
            <Route path="/:lang/optin" element={<Optin />} />
            <Route path="/:lang/video_download" element={<VideoDownload />} />
            <Route path="/:lang/event-registration-confirmation" element={<EventRegistrationConfirmation />} />
            <Route path="/:lang/event-detail-registration-confirmation" element={<EventDetailRegistrationConfirmation />} />
            <Route path="/:lang/event-already-registered" element={<EventAlreadyRegistered />} />
            <Route path="/:lang/event-registration-success" element={<EventRegistrationSuccess />} />
            <Route path="/:lang/contact" element={<Contact />} />
            <Route path="/:lang/news" element={<News />} />
            <Route path="/:lang/news/:slug" element={<NewsDetail />} />
            <Route path="/:lang/real-news" element={<RealNews />} />
            <Route path="/:lang/icons-styleguide" element={<IconsStyleguide />} />
            <Route path="/:lang/comprehensive-styleguide" element={<ComprehensiveStyleguide />} />
            <Route path="/:lang/image-download" element={<ImageDownload />} />
            <Route path="/:lang/logo-download" element={<LogoDownload />} />
            <Route path="/:lang/logo-test" element={<LogoTest />} />
            <Route path="/:lang/auth" element={<Auth />} />
            <Route path="/:lang/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/:lang/admin-dashboard/news" element={<AdminNews />} />
            <Route path="/:lang/full-hero-migration" element={<FullHeroMigration />} />
            <Route path="/:lang/segment-debug" element={<SegmentDebugView />} />
            
            {/* Page ID Route - MUST be after all specific routes */}
            <Route path="/:lang/:pageId" element={<PageIdRouter />} />
            
            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
