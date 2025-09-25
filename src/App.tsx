import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "@/components/Layout";
import GlobalPasswordGate from "@/components/GlobalPasswordGate";
import Index from "./pages/Index";
import InsideLab from "./pages/InsideLab";
import Industries from "./pages/Industries";
import Products from "./pages/Products";
import Automotive from "./pages/Automotive";
import Downloads from "./pages/Downloads";
import ProductArcturus from "./pages/ProductArcturus";
import ProductLE7 from "./pages/ProductLE7";
import SolutionArcturusBundle from "./pages/SolutionArcturusBundle";
import HiddenSegments from "./pages/HiddenSegments";
import Backlog from "./pages/Backlog";
import Charts from "./pages/Charts";
import ChartDetail from "./pages/ChartDetail";
import Cart from "./pages/Cart";
import Events from "./pages/Events";
import InCabinTesting from "./pages/InCabinTesting";
import Contact from "./pages/Contact";
import News from "./pages/News";
import Styleguide from "./pages/Styleguide";
import IconsStyleguide from "./pages/IconsStyleguide";
import ComprehensiveStyleguide from "./pages/ComprehensiveStyleguide";
import ImageDownload from "./pages/ImageDownload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
        <Route path="/" element={<Layout><Index /></Layout>} />
        <Route path="/inside-lab" element={<Layout><InsideLab /></Layout>} />
        <Route path="/industries" element={<Layout><Industries /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/automotive" element={<Layout><Automotive /></Layout>} />
        <Route path="/downloads" element={<Layout><Downloads /></Layout>} />
         <Route path="/product/arcturus" element={<Layout><ProductArcturus /></Layout>} />
         <Route path="/product/le7" element={<Layout><ProductLE7 /></Layout>} />
         <Route path="/solution/arcturus-bundle" element={<Layout><SolutionArcturusBundle /></Layout>} />
         <Route path="/hidden-segments" element={<Layout><HiddenSegments /></Layout>} />
         <Route path="/backlog" element={<Layout><Backlog /></Layout>} />
        <Route path="/charts" element={<Navigate to="/products/charts" replace />} />
        <Route path="/products/charts" element={<Layout><Charts /></Layout>} />
        <Route path="/products/charts/:slug" element={<Layout><ChartDetail /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
         <Route path="/events" element={<Layout><Events /></Layout>} />
         <Route path="/in-cabin-testing" element={<Layout><InCabinTesting /></Layout>} />
         <Route path="/contact" element={<Layout><Contact /></Layout>} />
         <Route path="/news" element={<Layout><News /></Layout>} />
         <Route path="/styleguide" element={<Layout><Styleguide /></Layout>} />
        <Route path="/icons-styleguide" element={<Layout><IconsStyleguide /></Layout>} />
        <Route path="/comprehensive-styleguide" element={<Layout><ComprehensiveStyleguide /></Layout>} />
        <Route path="/image-download" element={<Layout><ImageDownload /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
