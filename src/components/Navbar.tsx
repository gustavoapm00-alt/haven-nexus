import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container-main section-padding !py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-wide text-foreground">
          AERLION
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-medium transition-colors duration-300 uppercase tracking-wider ${
                isActive(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/pricing" className="btn-primary !py-2 !px-4 text-xs">
            Start Free Trial
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col py-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={handleLinkClick}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-300 uppercase tracking-wider ${
                isActive(link.href)
                  ? 'text-primary bg-secondary/50'
                  : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="px-6 py-3">
            <Link 
              to="/pricing" 
              onClick={handleLinkClick}
              className="btn-primary !py-2 !px-4 text-xs w-full justify-center"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
