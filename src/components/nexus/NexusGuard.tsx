import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function NexusGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
