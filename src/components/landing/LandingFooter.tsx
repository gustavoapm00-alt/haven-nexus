import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0F0F0F] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-mono text-lg tracking-wide text-[#E0E0E0]">
            AERELION SYSTEMS
          </div>

          <nav className="flex items-center gap-6">
            <Link to="/security" className="font-mono text-xs uppercase tracking-[0.15em] text-white/30 hover:text-[#39FF14] transition-colors">
              Governance
            </Link>
            <Link to="/automations" className="font-mono text-xs uppercase tracking-[0.15em] text-white/30 hover:text-[#39FF14] transition-colors">
              Protocols
            </Link>
            <Link to="/portal/auth" className="font-mono text-xs uppercase tracking-[0.15em] text-white/30 hover:text-[#39FF14] transition-colors">
              Secure Login
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-white/20 tracking-wider">
            Aerelion Systems © {new Date().getFullYear()}. All Systems Nominal.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#39FF14]/50" />
            <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
