import { Link } from 'react-router-dom';

const LibraryFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-main section-padding !py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="font-semibold text-lg text-foreground tracking-tight">
              AERELION
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Managed automation operator for professional services firms and compliance-driven organizations. We configure, host, and maintain automation systems on our infrastructure.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-medium text-sm text-foreground mb-4">Solutions</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/automations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Managed Automations
                </Link>
              </li>
              <li>
                <Link to="/bundles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  System Bundles
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-medium text-sm text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/activation-walkthrough" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Activation Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Schedule a Call
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium text-sm text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h4 className="font-medium text-sm text-foreground mb-4">Governance</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security & Data Practices
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AERELION Systems. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LibraryFooter;
