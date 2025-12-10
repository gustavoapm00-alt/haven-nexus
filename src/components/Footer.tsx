import { Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="section-padding !py-12 bg-background border-t border-border/30">
      <div className="container-main">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="font-display text-xl tracking-wide text-foreground">
            AERELION
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/null.username__"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="mailto:gustavoapm00@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          </div>

          {/* Copyright & Admin */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© AERELION {currentYear}</span>
            <a
              href="/auth"
              className="hover:text-primary transition-colors"
            >
              Admin
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          This site shares personal experience, not medical or financial advice.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
