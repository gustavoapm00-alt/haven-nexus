import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Home from "./pages/Home";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import AboutPage from "./pages/AboutNew";
import CaseStudies from "./pages/CaseStudies";
import ContactPage from "./pages/ContactNew";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/how-it-works" element={<HowItWorks />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/case-studies" element={<CaseStudies />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/refund" element={<Refund />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <AppRoutes />
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
