import { useAuth } from '@/hooks/useAuth';
import AdminGate from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Shield } from 'lucide-react';

const AdminSetup = () => {
  const { user, isAdmin } = useAuth();

  return (
    <AdminGate>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
              <h1 className="font-display text-xl">Admin Setup</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-display mb-2">Admin Access Diagnostic</h2>
            <p className="text-muted-foreground">
              View your current authentication and admin role status.
            </p>
          </div>

          <div className="space-y-6">
            {/* User ID */}
            <div className="card-glass p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">User ID</h3>
                  <p className="font-mono text-sm break-all">
                    {user?.id || 'Not authenticated'}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="card-glass p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Email</h3>
                  <p className="font-mono text-sm break-all">
                    {user?.email || 'Not authenticated'}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Role Status */}
            <div className="card-glass p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${isAdmin ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                  <Shield className={`w-5 h-5 ${isAdmin ? 'text-green-500' : 'text-destructive'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Admin Role</h3>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-medium">Admin role detected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-destructive font-medium">No admin role</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-muted/50 border border-border rounded-xl p-6">
              <h4 className="font-medium mb-2">How Admin Access Works</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Admin role is checked from the <code className="bg-background px-1 py-0.5 rounded text-xs">user_roles</code> table</li>
                <li>• Fallback: Emails in <code className="bg-background px-1 py-0.5 rounded text-xs">VITE_ADMIN_EMAIL_ALLOWLIST</code> env variable are also treated as admin</li>
                <li>• This page is read-only — no service-role operations are performed client-side</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </AdminGate>
  );
};

export default AdminSetup;
