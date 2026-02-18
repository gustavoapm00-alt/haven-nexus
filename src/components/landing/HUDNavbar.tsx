import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Radio, Lock, Wifi } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  '/admin': 'ADMIN',
  '/terms': 'GOVERNANCE > TERMS',
  '/privacy': 'GOVERNANCE > PRIVACY',
};

const HUDNavbar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [latency, setLatency] = useState(12);
  const [pulseActive, setPulseActive] = useState(false);
  const prevPath = useRef(location.pathname);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (routeMap[path]) return `ROOT > ${routeMap[path]}`;
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
      setLatency(Math.floor(8 + Math.random() * 14));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // pulse on route change
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 600);
    }
  }, [location.pathname]);

  const navLinks = [
    { name: 'PROTOCOLS', href: '/automations' },
    { name: 'DEPLOYMENT', href: '/how-it-works' },
    { name: 'DOCS', href: '/docs' },
    { name: 'GOVERNANCE', href: '/security' },
  ];

  const latencyColor =
    latency > 18 ? 'text-[#FFBF00]' : latency > 12 ? 'text-[#39FF14]/60' : 'text-[#39FF14]/40';

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#060606]/97 backdrop-blur-xl">
      {/* Top accent line — animated on route change */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          className="h-full bg-[#39FF14]"
          animate={pulseActive ? { scaleX: [0, 1], opacity: [0.8, 0] } : { opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
        />
      </div>

      <div className="max-w-[1680px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[46px]">

          {/* ── LEFT: Logo + Version */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 border border-[#39FF14]/30 rotate-45 group-hover:rotate-[60deg] transition-transform duration-500" />
              <div className="absolute inset-[3px] border border-[#39FF14]/20 rotate-12 group-hover:rotate-[30deg] transition-transform duration-500" />
              <div className="absolute inset-[7px] bg-[#39FF14]/50 group-hover:bg-[#39FF14]/80 transition-colors" />
            </div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#E0E0E0]/60 group-hover:text-[#39FF14]/80 transition-colors whitespace-nowrap">
              AERELION
              <span className="text-white/15 mx-1">//</span>
              <span className="text-white/25">SYS.OPS.V3.00</span>
            </span>
          </Link>

          {/* ── CENTER: Breadcrumb (hidden on small) */}
          <div className="hidden xl:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <AnimatePresence mode="wait">
              <motion.span
                key={location.pathname}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-[10px] tracking-[0.15em] text-white/20"
              >
                {getBreadcrumb()}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Nav + Telemetry */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-[#39FF14]'
                    : 'text-white/25 hover:text-white/55'
                }`}
              >
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-0 border border-[#39FF14]/20 bg-[#39FF14]/[0.04]"
                  />
                )}
                {link.name}
              </Link>
            ))}

            <div className="w-px h-4 bg-white/10 mx-2" />

            <Link
              to="/contact"
              className="px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[#FFBF00]/60 hover:text-[#FFBF00] transition-colors border border-[#FFBF00]/20 hover:border-[#FFBF00]/40 hover:bg-[#FFBF00]/[0.04]"
            >
              UPLINK
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-white/15 hover:text-white/40 transition-colors"
              >
                ADMIN
              </Link>
            )}

            <Link
              to={user ? '/portal/dashboard' : '/portal/auth'}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] transition-colors ${
                user
                  ? 'text-[#39FF14]/60 hover:text-[#39FF14]'
                  : 'text-white/20 hover:text-white/45'
              }`}
            >
              <Lock className="w-2.5 h-2.5 opacity-60" />
              {user ? 'PORTAL' : 'ACCESS'}
            </Link>

            {/* Telemetry cluster */}
            <div className="flex items-center gap-3 ml-3 pl-3 border-l border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <Radio className="w-2.5 h-2.5 text-[#39FF14]/30" />
                <span className={`font-mono text-[9px] ${latencyColor}`}>{latency}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-2.5 h-2.5 text-white/10" />
                <span className="font-mono text-[9px] text-white/15">{utcTime}</span>
              </div>
            </div>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/30 hover:text-white/60 transition-colors p-1.5 border border-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-white/[0.07] bg-[#060606]/98"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="font-mono text-[9px] tracking-[0.12em] text-white/15 pb-3">
                {getBreadcrumb()}
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 font-mono text-[10px] tracking-[0.18em] transition-colors border-l-2 ${
                    isActive(link.href)
                      ? 'text-[#39FF14] border-[#39FF14]/50'
                      : 'text-white/30 border-transparent hover:text-white/55 hover:border-white/20'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/[0.07] space-y-1">
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-[#FFBF00]/60"
                >
                  UPLINK
                </Link>
                <Link
                  to={user ? '/portal/dashboard' : '/portal/auth'}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-[0.18em] ${
                    user ? 'text-[#39FF14]/60' : 'text-white/25'
                  }`}
                >
                  <Lock className="w-2.5 h-2.5" />
                  {user ? 'PORTAL' : 'ACCESS'}
                </Link>
              </div>
              <div className="pt-3 flex items-center gap-4">
                <span className="font-mono text-[9px] text-white/15">{utcTime}</span>
                <span className={`font-mono text-[9px] ${latencyColor}`}>NET: {latency}ms</span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default HUDNavbar;
