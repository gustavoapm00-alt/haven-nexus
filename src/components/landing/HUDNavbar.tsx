import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const routeMap: Record<string, string> = {
  '/': 'HOME',
  '/automations': 'PROTOCOLS',
  '/how-it-works': 'DEPLOYMENT',
  '/docs': 'DOCUMENTATION',
  '/security': 'GOVERNANCE',
  '/careers': 'CAREERS',
  '/contact': 'UPLINK',
  '/about': 'ABOUT',
  '/auth': 'BIOMETRIC_GATE',
  '/portal/auth': 'BIOMETRIC_GATE',
  '/portal/dashboard': 'PORTAL',
  '/portal/billing': 'PORTAL > BILLING',
  '/portal/activity': 'PORTAL > ACTIVITY',
  '/admin': 'ADMIN',
  '/terms': 'GOVERNANCE > TERMS',
  '/privacy': 'GOVERNANCE > PRIVACY',
  '/dashboard': 'DASHBOARD',
  '/purchases': 'PURCHASES',
  '/integrations': 'INTEGRATIONS',
};

const HUDNavbar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [latency, setLatency] = useState(12);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Get breadcrumb from pathname
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (routeMap[path]) return `ROOT > ${routeMap[path]}`;
    // Try to match parent paths
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const parent = '/' + segments[0];
      const parentName = routeMap[parent] || segments[0].toUpperCase();
      return `ROOT > ${parentName} > ${segments.slice(1).join('_').toUpperCase()}`;
    }
    return `ROOT > ${segments[0]?.toUpperCase() || 'HOME'}`;
  };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(11, 19) + ' UTC');
      setLatency(Math.floor(8 + Math.random() * 12));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const navLinks = [
    { name: 'Protocols', href: '/automations' },
    { name: 'Deployment', href: '/how-it-works' },
    { name: 'Docs', href: '/docs' },
    { name: 'Governance', href: '/security' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-[0.5px] border-white/10 bg-black/90 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Left: System identifier */}
          <Link to="/" className="font-mono text-[11px] tracking-[0.15em] text-white/60 hover:text-cyan-400 transition-colors whitespace-nowrap">
            AERELION <span className="text-white/20">//</span> <span className="text-white/30">SYS.V.2.0</span>
          </Link>

          {/* Center: Breadcrumb path */}
          <div className="hidden lg:block font-mono text-[10px] tracking-[0.12em] text-white/25">
            {getBreadcrumb()}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                  isActive(link.href)
                    ? 'text-cyan-400'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <span className="text-white/10">|</span>

            <Link
              to="/contact"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-orange-400/70 hover:text-orange-400 transition-colors"
            >
              Uplink
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/20 hover:text-white/50 transition-colors"
              >
                Admin
              </Link>
            )}

            {!user ? (
              <Link
                to="/portal/auth"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25 hover:text-white/50 transition-colors"
              >
                Access
              </Link>
            ) : (
              <Link
                to="/portal/dashboard"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-400/50 hover:text-cyan-400 transition-colors"
              >
                Portal
              </Link>
            )}

            {/* UTC clock and latency */}
            <div className="flex items-center gap-3 ml-2">
              <span className="font-mono text-[9px] text-white/15">{utcTime}</span>
              <span className="font-mono text-[9px] text-green-500/40">NET.LATENCY: {latency}ms</span>
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/40"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden border-t-[0.5px] border-white/10 py-4 space-y-3">
            {/* Breadcrumb on mobile */}
            <div className="font-mono text-[9px] tracking-[0.1em] text-white/20 pb-2">
              {getBreadcrumb()}
            </div>
            
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block font-mono text-[10px] uppercase tracking-[0.15em] py-1 ${
                  isActive(link.href) ? 'text-cyan-400' : 'text-white/30'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t-[0.5px] border-white/10 space-y-3">
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block font-mono text-[10px] uppercase tracking-[0.15em] text-orange-400/70"
              >
                Uplink
              </Link>
              {!user ? (
                <Link
                  to="/portal/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block font-mono text-[10px] uppercase tracking-[0.15em] text-white/25"
                >
                  Access
                </Link>
              ) : (
                <Link
                  to="/portal/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-400/50"
                >
                  Portal
                </Link>
              )}
              <div className="pt-2 flex items-center gap-3">
                <span className="font-mono text-[9px] text-white/15">{utcTime}</span>
                <span className="font-mono text-[9px] text-green-500/40">NET: {latency}ms</span>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default HUDNavbar;
