import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-display text-xl text-foreground mb-4">AERELION</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Managed Automation Operator. We install AI-powered operational systems
              inside professional service businesses.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Navigate
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/services" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Services</Link>
              <Link to="/how-it-works" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Process</Link>
              <Link to="/about" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/case-studies" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Confirmed Results</Link>
              <Link to="/contact" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Legal
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/terms" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/refund" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground italic text-center">
            AERELION does not take every engagement. We take the right ones.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AERELION Systems. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              contact@aerelion.systems
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
