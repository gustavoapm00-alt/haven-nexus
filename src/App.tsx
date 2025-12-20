import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";

import Index from "./pages/Index";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import IntellectualProperty from "./pages/IntellectualProperty";
import Confidentiality from "./pages/Confidentiality";
import Disclaimer from "./pages/Disclaimer";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import Sanctuary from "./pages/Sanctuary";
import Dashboard from "./pages/Dashboard";
import EcomPricing from "./pages/pricing/EcomPricing";
import AgentRun from "./pages/agents/AgentRun";
import StudioAgents from "./pages/studio/StudioAgents";
import StudioPlans from "./pages/studio/StudioPlans";
import StudioEntitlements from "./pages/studio/StudioEntitlements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/intellectual-property" element={<IntellectualProperty />} />
              <Route path="/confidentiality" element={<Confidentiality />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/sanctuary" element={<Sanctuary />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pricing/ecom" element={<EcomPricing />} />
              <Route path="/agents/:agentKey" element={<AgentRun />} />
              {/* Admin Studio Routes */}
              <Route path="/studio/agents" element={<StudioAgents />} />
              <Route path="/studio/plans" element={<StudioPlans />} />
              <Route path="/studio/entitlements" element={<StudioEntitlements />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
