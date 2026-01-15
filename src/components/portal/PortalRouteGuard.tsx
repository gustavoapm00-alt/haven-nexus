import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientProfile } from '@/hooks/useClientProfile';
import { Loader2 } from 'lucide-react';
import PortalBackground from './PortalBackground';

interface PortalRouteGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

/**
 * Route guard for portal pages.
 * - Redirects unauthenticated users to /portal/auth
 * - If requireOnboarding is true, redirects users who haven't completed onboarding
 */
export const PortalRouteGuard: React.FC<PortalRouteGuardProps> = ({ 
  children, 
  requireOnboarding = false 
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useClientProfile();

  // Show loading state while checking auth
  if (authLoading || profileLoading) {
    return (
      <PortalBackground>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PortalBackground>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/portal/auth" replace />;
  }

  // If onboarding is required and not complete, redirect to onboarding
  if (requireOnboarding && profile && !profile.onboarding_complete) {
    return <Navigate to="/portal/onboarding" replace />;
  }

  return <>{children}</>;
};

export default PortalRouteGuard;
