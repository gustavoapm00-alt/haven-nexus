import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Bot, Play, Settings, Home } from 'lucide-react';

interface ConsoleLayoutProps {
  children: ReactNode;
}

const ConsoleLayout = ({ children }: ConsoleLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const navItems = [
    { path: '/console/agents', label: 'Agent Registry', icon: Bot },
    { path: '/console/run-agent', label: 'Run Agent', icon: Play },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl">
            AERELION <span className="text-primary">CONSOLE</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ConsoleLayout;
