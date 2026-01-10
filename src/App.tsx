import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";

// Access gate - set to true to lock site
const SITE_LOCKED = false;

import RequestAccess from "./pages/RequestAccess";
import Index from "./pages/Index";
import Capabilities from "./pages/Capabilities";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import Reliability from "./pages/Reliability";
import Proof from "./pages/Proof";
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
import AgentRun from "./pages/agents/AgentRun";
import AgentSetup from "./pages/agents/AgentSetup";
import AgentDashboard from "./pages/agents/AgentDashboard";
import AgentActivity from "./pages/agents/AgentActivity";
import StudioAgents from "./pages/studio/StudioAgents";
import StudioPlans from "./pages/studio/StudioPlans";
import StudioEntitlements from "./pages/studio/StudioEntitlements";
import NotFound from "./pages/NotFound";
import SystemAudit from "./pages/SystemAudit";
import SystemAuditResult from "./pages/SystemAuditResult";
import RequestDeployment from "./pages/RequestDeployment";

// Library pages
import LibraryHome from "./pages/library/LibraryHome";
import AgentLibrary from "./pages/library/AgentLibrary";
import AgentDetail from "./pages/library/AgentDetail";
import BundleLibrary from "./pages/library/BundleLibrary";
import BundleDetail from "./pages/library/BundleDetail";
import DeploymentOverview from "./pages/library/DeploymentOverview";
import SecurityPractices from "./pages/library/SecurityPractices";
import Documentation from "./pages/library/Documentation";
import InstallationAssistance from "./pages/library/InstallationAssistance";
import LibraryContact from "./pages/library/LibraryContact";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Locked site shows only request access page (except auth/admin routes)
const LockedApp = () => (
  <Routes>
    <Route path="/" element={<RequestAccess />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/agents/:agentKey" element={<AgentRun />} />
    <Route path="/studio/agents" element={<StudioAgents />} />
    <Route path="/studio/plans" element={<StudioPlans />} />
    <Route path="/studio/entitlements" element={<StudioEntitlements />} />
    <Route path="*" element={<RequestAccess />} />
  </Routes>
);

const UnlockedApp = () => (
  <Routes>
    {/* Library/Marketplace Routes (new primary site) */}
    <Route path="/" element={<LibraryHome />} />
    <Route path="/agents" element={<AgentLibrary />} />
    <Route path="/agents/:slug" element={<AgentDetail />} />
    <Route path="/bundles" element={<BundleLibrary />} />
    <Route path="/bundles/:slug" element={<BundleDetail />} />
    <Route path="/deployment" element={<DeploymentOverview />} />
    <Route path="/security" element={<SecurityPractices />} />
    <Route path="/docs" element={<Documentation />} />
    <Route path="/install" element={<InstallationAssistance />} />
    <Route path="/contact" element={<LibraryContact />} />

    {/* Legacy routes (redirects or preserved for existing links) */}
    <Route path="/old-home" element={<Index />} />
    <Route path="/capabilities" element={<Capabilities />} />
    <Route path="/services" element={<Navigate to="/capabilities" replace />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/about" element={<About />} />
    <Route path="/get-started" element={<GetStarted />} />
    <Route path="/system-audit" element={<SystemAudit />} />
    <Route path="/system-audit/result" element={<SystemAuditResult />} />
    <Route path="/request-deployment" element={<RequestDeployment />} />
    <Route path="/reliability" element={<Reliability />} />
    <Route path="/proof" element={<Proof />} />
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
    <Route path="/agents/setup" element={<AgentSetup />} />
    <Route path="/agents/dashboard" element={<AgentDashboard />} />
    <Route path="/agents/activity" element={<AgentActivity />} />
    <Route path="/agents/run/:agentKey" element={<AgentRun />} />
    <Route path="/studio/agents" element={<StudioAgents />} />
    <Route path="/studio/plans" element={<StudioPlans />} />
    <Route path="/studio/entitlements" element={<StudioEntitlements />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <SubscriptionProvider>
            {SITE_LOCKED ? <LockedApp /> : <UnlockedApp />}
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
