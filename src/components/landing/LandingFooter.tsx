import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { label: 'GOVERNANCE', href: '/security' },
  { label: 'PROTOCOLS', href: '/automations' },
  { label: 'DEPLOYMENT', href: '/how-it-works' },
  { label: 'UPLINK', href: '/contact' },
  { label: 'SECURE ACCESS', href: '/portal/auth' },
];

const LandingFooter = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060606] relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(57,255,20,0.03),transparent)]" />

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-14">
          <div>
            <div className="font-mono text-2xl font-bold tracking-[0.15em] text-[#E0E0E0] mb-2">
              AERELION
            </div>
            <p className="font-sans text-xs text-white/25 leading-relaxed max-w-xs">
              Managed Automation Operator. Engineering autonomous infrastructure for the Defense Industrial Base.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 hover:text-[#39FF14]/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] text-white/15 tracking-[0.15em] uppercase">
            AERELION SYSTEMS © {new Date().getFullYear()} // ALL SYSTEMS NOMINAL // SYS.OPS.V3.00
          </p>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-1.5 h-1.5 bg-[#39FF14]/60"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="font-mono text-[9px] text-white/15 uppercase tracking-[0.15em]">
              OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
