import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';

const LibraryNavbar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { name: 'Automations', href: '/automations' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Documentation', href: '/docs' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container-main section-padding !py-0">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-semibold text-lg text-foreground tracking-tight">
            AERELION
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Schedule a Call
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            )}
            {!user ? (
              <Link
                to="/auth"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LibraryNavbar;
