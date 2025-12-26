import { Link } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { forwardRef } from 'react';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer ref={ref} className="section-padding !py-12 bg-background border-t border-border/30">
      <div className="container-main">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="font-display text-xl tracking-wide text-foreground">
            AERELION
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              to="/capabilities"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Capabilities
            </Link>
            <Link
              to="/reliability"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Reliability
            </Link>
            <Link
              to="/proof"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Proof
            </Link>
            <Link
              to="/about"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/aerelion.systems"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="mailto:contact@aerelion.systems"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-xs text-muted-foreground/70">
          <Link
            to="/intellectual-property"
            className="hover:text-muted-foreground transition-colors"
          >
            IP & Use
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            to="/confidentiality"
            className="hover:text-muted-foreground transition-colors"
          >
            Confidentiality
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            to="/disclaimer"
            className="hover:text-muted-foreground transition-colors"
          >
            Disclaimer
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            to="/contact"
            className="hover:text-muted-foreground transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          © AERELION {currentYear}
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          AERELION builds operational systems. We do not promise revenue outcomes or autonomous businesses.
        </p>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;