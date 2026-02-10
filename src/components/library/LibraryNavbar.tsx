import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const LibraryNavbar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { name: 'Protocols', href: '/automations' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Docs', href: '/docs' },
    { name: 'Governance', href: '/security' },
    { name: 'Careers', href: '/careers' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(0,0%,12%)] bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="font-display text-lg tracking-wide text-[#e8e8e8]">
            AERELION
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                  isActive(link.href)
                    ? 'text-[hsl(180,60%,50%)]'
                    : 'text-[hsl(0,0%,45%)] hover:text-[hsl(0,0%,75%)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/contact"
              className="font-mono text-xs uppercase tracking-[0.12em] text-[hsl(25,90%,55%)] hover:text-[hsl(25,90%,65%)] transition-colors"
            >
              Initialize
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="font-mono text-xs uppercase tracking-[0.12em] text-[hsl(0,0%,35%)] hover:text-[hsl(0,0%,60%)] transition-colors"
              >
                Admin
              </Link>
            )}
            {!user ? (
              <Link
                to="/auth"
                className="font-mono text-xs uppercase tracking-[0.12em] text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,70%)] transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <Link
                to="/portal/dashboard"
                className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,70%)] transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Portal</span>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[hsl(0,0%,50%)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-[hsl(0,0%,12%)] py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block font-mono text-xs uppercase tracking-[0.12em] py-1 ${
                  isActive(link.href)
                    ? 'text-[hsl(180,60%,50%)]'
                    : 'text-[hsl(0,0%,45%)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-[hsl(0,0%,12%)] space-y-3">
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block font-mono text-xs uppercase tracking-[0.12em] text-[hsl(25,90%,55%)]"
              >
                Initialize
              </Link>
              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block font-mono text-xs uppercase tracking-[0.12em] text-[hsl(0,0%,40%)]"
                >
                  Sign In
                </Link>
              ) : (
                <Link
                  to="/portal/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block font-mono text-xs uppercase tracking-[0.12em] text-[hsl(0,0%,40%)]"
                >
                  Portal
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default LibraryNavbar;
