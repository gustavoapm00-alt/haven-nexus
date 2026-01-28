import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";

// TODO: For pre-launch protection, use hosting-layer protection (Cloudflare Access, Netlify, Vercel)
// Do NOT implement client-side password gates

// Access gate - set to false to allow public marketplace browsing
const SITE_LOCKED = false;

import RequestAccess from "./pages/RequestAccess";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import Sanctuary from "./pages/Sanctuary";
import NotFound from "./pages/NotFound";

// Library pages (primary site)
import LibraryHome from "./pages/library/LibraryHome";
import AgentLibrary from "./pages/library/AgentLibrary";
import AgentDetail from "./pages/library/AgentDetail";
import BundleDetail from "./pages/library/BundleDetail";
import DeploymentOverview from "./pages/library/DeploymentOverview";
import SecurityPractices from "./pages/library/SecurityPractices";
import Security from "./pages/library/Security";
import Documentation from "./pages/library/Documentation";
import InstallationAssistance from "./pages/library/InstallationAssistance";
import LibraryContact from "./pages/library/LibraryContact";
import PurchaseSuccess from "./pages/library/PurchaseSuccess";
import ActivationSetup from "./pages/library/ActivationSetup";
import ActivationWalkthrough from "./pages/library/ActivationWalkthrough";
import ActivationRequestDetail from "./pages/library/ActivationRequestDetail";
import PurchaseHistory from "./pages/library/PurchaseHistory";
import UserDashboard from "./pages/library/UserDashboard";

// Client Portal pages
import ClientAuth from "./pages/portal/ClientAuth";
import ClientOnboarding from "./pages/portal/ClientOnboarding";
import ClientDashboard from "./pages/portal/ClientDashboard";
import PortalBilling from "./pages/portal/PortalBilling";
import PortalAnalytics from "./pages/portal/PortalAnalytics";
import PortalNotifications from "./pages/portal/PortalNotifications";
import PortalRouteGuard from "./components/portal/PortalRouteGuard";

// Admin pages
import AdminLibraryHome from "./pages/admin/library/AdminLibraryHome";
import AdminAgentsList from "./pages/admin/library/AdminAgentsList";
import AdminAgentEditor from "./pages/admin/library/AdminAgentEditor";
import AdminAgentImport from "./pages/admin/library/AdminAgentImport";
import AdminBundlesList from "./pages/admin/library/AdminBundlesList";
import AdminBundleEditor from "./pages/admin/library/AdminBundleEditor";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminEngagementRequests from "./pages/admin/AdminEngagementRequests";

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
    <Route path="*" element={<RequestAccess />} />
  </Routes>
);

const UnlockedApp = () => (
  <Routes>
    {/* Primary Site Routes */}
    <Route path="/" element={<LibraryHome />} />
    <Route path="/automations" element={<AgentLibrary />} />
    <Route path="/automations/:slug" element={<AgentDetail />} />
    <Route path="/bundles/:slug" element={<BundleDetail />} />
    <Route path="/how-it-works" element={<DeploymentOverview />} />
    <Route path="/security" element={<Security />} />
    <Route path="/security-practices" element={<SecurityPractices />} />
    <Route path="/docs" element={<Documentation />} />
    <Route path="/install" element={<InstallationAssistance />} />
    <Route path="/contact" element={<LibraryContact />} />
    <Route path="/purchase-success" element={<PurchaseSuccess />} />
    <Route path="/activation-setup" element={<ActivationSetup />} />
    <Route path="/activation-walkthrough" element={<ActivationWalkthrough />} />
    <Route path="/activation-request/:id" element={<ActivationRequestDetail />} />
    <Route path="/purchases" element={<PurchaseHistory />} />
    <Route path="/dashboard" element={<UserDashboard />} />

    {/* Client Portal routes */}
    <Route path="/portal/auth" element={<ClientAuth />} />
    <Route path="/portal/onboarding" element={
      <PortalRouteGuard>
        <ClientOnboarding />
      </PortalRouteGuard>
    } />
    <Route path="/portal/dashboard" element={
      <PortalRouteGuard>
        <ClientDashboard />
      </PortalRouteGuard>
    } />
    <Route path="/portal/billing" element={
      <PortalRouteGuard>
        <PortalBilling />
      </PortalRouteGuard>
    } />
    <Route path="/portal/activity" element={
      <PortalRouteGuard>
        <PortalAnalytics />
      </PortalRouteGuard>
    } />
    <Route path="/portal/notifications" element={
      <PortalRouteGuard>
        <PortalNotifications />
      </PortalRouteGuard>
    } />

    {/* Legacy redirects - redirect to service pages */}
    <Route path="/bundles" element={<Navigate to="/automations" replace />} />
    <Route path="/packs" element={<Navigate to="/automations" replace />} />
    <Route path="/packs/:slug" element={<Navigate to="/automations" replace />} />
    <Route path="/agents" element={<Navigate to="/automations" replace />} />
    <Route path="/pricing" element={<Navigate to="/contact" replace />} />
    <Route path="/deployment" element={<Navigate to="/how-it-works" replace />} />
    <Route path="/capabilities" element={<Navigate to="/how-it-works" replace />} />
    <Route path="/get-started" element={<Navigate to="/contact" replace />} />
    <Route path="/services" element={<Navigate to="/automations" replace />} />
    <Route path="/old-home" element={<Navigate to="/" replace />} />
    <Route path="/about" element={<Navigate to="/" replace />} />
    <Route path="/reliability" element={<Navigate to="/security" replace />} />
    <Route path="/proof" element={<Navigate to="/how-it-works" replace />} />
    <Route path="/portal/analytics" element={<Navigate to="/portal/activity" replace />} />
    
    {/* Legal pages */}
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/refund" element={<Refund />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/sanctuary" element={<Sanctuary />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* Admin routes */}
    <Route path="/admin" element={<Admin />} />
    <Route path="/admin/library" element={<AdminLibraryHome />} />
    <Route path="/admin/library/agents" element={<AdminAgentsList />} />
    <Route path="/admin/library/agents/new" element={<AdminAgentEditor mode="create" />} />
    <Route path="/admin/library/agents/import" element={<AdminAgentImport />} />
    <Route path="/admin/library/agents/:id" element={<AdminAgentEditor mode="edit" />} />
    <Route path="/admin/library/bundles" element={<AdminBundlesList />} />
    <Route path="/admin/library/bundles/new" element={<AdminBundleEditor mode="create" />} />
    <Route path="/admin/library/bundles/:id" element={<AdminBundleEditor mode="edit" />} />
    <Route path="/admin/setup" element={<AdminSetup />} />
    <Route path="/admin/activity" element={<AdminActivity />} />
    <Route path="/admin/engagement-requests" element={<AdminEngagementRequests />} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Smart gate: admins see full site, public sees locked
const SiteGate = () => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // While loading auth, show locked routes (they handle their own auth)
  if (isLoading) {
    return <LockedApp />;
  }
  
  // If site is locked but user is admin, show full site
  if (SITE_LOCKED && !isAdmin) {
    return <LockedApp />;
  }
  
  return <UnlockedApp />;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <SubscriptionProvider>
              <SiteGate />
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
