import { Link, useLocation } from 'react-router-dom';
import { Instagram, Mail } from 'lucide-react';
import { forwardRef } from 'react';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const handleAnchorClick = (href: string) => {
    if (location.pathname === '/') {
      const targetId = href.replace('/#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer ref={ref} className="section-padding !py-12 bg-background border-t border-border/30">
      <div className="container-main">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="font-display text-xl tracking-wide text-foreground mb-4">
              AERELION
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              We build workflow automations that replace repetitive manual work in 14 days. Fixed scope, fast delivery, documented handoff.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/#offer"
                onClick={() => handleAnchorClick('/#offer')}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Our Offer
              </Link>
              <Link
                to="/#process"
                onClick={() => handleAnchorClick('/#process')}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/case-studies"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Case Studies
              </Link>
              <Link
                to="/#faq"
                onClick={() => handleAnchorClick('/#faq')}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Contact</h4>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:contact@aerelion.systems"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={16} />
                contact@aerelion.systems
              </a>
              <a
                href="https://instagram.com/aerelion.systems"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram size={16} />
                @aerelion.systems
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/30">
          {/* Legal Links */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
            <Link
              to="/privacy"
              className="hover:text-muted-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <Link
              to="/terms"
              className="hover:text-muted-foreground transition-colors"
            >
              Terms
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} AERELION Systems. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
