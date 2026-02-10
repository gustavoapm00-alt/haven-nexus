import { Link } from 'react-router-dom';

const LibraryFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[hsl(0,0%,12%)] bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-lg tracking-wide text-[#e8e8e8]">
              AERELION
            </Link>
            <p className="mt-3 font-mono text-[11px] text-[hsl(0,0%,35%)] leading-relaxed">
              Managed automation operator. We configure, host, and operate systems on our infrastructure.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[hsl(0,0%,50%)] mb-4">Protocols</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/automations" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Automations
                </Link>
              </li>
              <li>
                <Link to="/bundles" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  System Bundles
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[hsl(0,0%,50%)] mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/activation-walkthrough" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Activation Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Schedule a Call
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[hsl(0,0%,50%)] mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/careers" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[hsl(0,0%,50%)] mb-4">Governance</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/security" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/terms" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="font-mono text-xs text-[hsl(0,0%,35%)] hover:text-[hsl(180,60%,50%)] transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[hsl(0,0%,10%)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-[hsl(0,0%,25%)] tracking-wider">
            Aerelion Systems © {currentYear}. All Systems Nominal.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(120,50%,45%)]" />
            <span className="font-mono text-[10px] text-[hsl(0,0%,25%)] uppercase tracking-widest">
              Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LibraryFooter;
