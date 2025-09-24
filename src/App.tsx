import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
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
        <Route path="/" element={<Index />} />
        <Route path="/inside-lab" element={<InsideLab />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/products" element={<Products />} />
        <Route path="/automotive" element={<Automotive />} />
        <Route path="/downloads" element={<Downloads />} />
         <Route path="/product/arcturus" element={<ProductArcturus />} />
         <Route path="/product/le7" element={<ProductLE7 />} />
         <Route path="/solution/arcturus-bundle" element={<SolutionArcturusBundle />} />
         <Route path="/hidden-segments" element={<HiddenSegments />} />
         <Route path="/backlog" element={<Backlog />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/products/charts" element={<Charts />} />
        <Route path="/products/charts/:slug" element={<ChartDetail />} />
        <Route path="/cart" element={<Cart />} />
         <Route path="/events" element={<Events />} />
         <Route path="/in-cabin-testing" element={<InCabinTesting />} />
         <Route path="/styleguide" element={<Styleguide />} />
        <Route path="/icons-styleguide" element={<IconsStyleguide />} />
        <Route path="/comprehensive-styleguide" element={<ComprehensiveStyleguide />} />
        <Route path="/image-download" element={<ImageDownload />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
