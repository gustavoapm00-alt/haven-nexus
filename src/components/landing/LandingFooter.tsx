import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="border-t border-[hsl(0,0%,12%)] bg-[#0a0a0a] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="font-display text-lg tracking-wide text-[#e8e8e8]">
            AERELION SYSTEMS
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/security"
              className="font-mono text-xs uppercase tracking-[0.15em] text-[hsl(0,0%,40%)] hover:text-[hsl(180,60%,50%)] transition-colors"
            >
              Governance
            </Link>
            <Link
              to="/automations"
              className="font-mono text-xs uppercase tracking-[0.15em] text-[hsl(0,0%,40%)] hover:text-[hsl(180,60%,50%)] transition-colors"
            >
              Protocols
            </Link>
            <Link
              to="/portal/auth"
              className="font-mono text-xs uppercase tracking-[0.15em] text-[hsl(0,0%,40%)] hover:text-[hsl(180,60%,50%)] transition-colors"
            >
              Secure Login
            </Link>
          </nav>
        </div>

        {/* Status line */}
        <div className="mt-8 pt-6 border-t border-[hsl(0,0%,10%)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-[hsl(0,0%,30%)] tracking-wider">
            Aerelion Systems © {new Date().getFullYear()}. All Systems Nominal.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(120,50%,45%)]" />
            <span className="font-mono text-[10px] text-[hsl(0,0%,30%)] uppercase tracking-widest">
              Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
