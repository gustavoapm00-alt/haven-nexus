import { useState, useEffect, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Capabilities', href: '/capabilities' },
  { name: 'Reliability', href: '/reliability' },
  { name: 'Proof', href: '/proof' },
  { name: 'About', href: '/about' },
  { name: 'Sanctuary', href: '/sanctuary' },
];

const Navbar = forwardRef<HTMLElement>((_, ref) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading } = useAuth();

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
      ref={ref}
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
          <Link to="/get-started" className="btn-primary !py-2 !px-4 text-xs">
            Get Started
          </Link>
          {!isLoading && (
            <Link 
              to={user ? "/admin" : "/auth"} 
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <User className="w-4 h-4" />
              {user ? "Admin" : "Login"}
            </Link>
          )}
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
          <div className="px-6 py-3 space-y-2">
            <Link 
              to="/get-started" 
              onClick={handleLinkClick}
              className="btn-primary !py-2 !px-4 text-xs w-full justify-center"
            >
              Get Started
            </Link>
            {!isLoading && (
              <Link 
                to={user ? "/admin" : "/auth"} 
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="w-4 h-4" />
                {user ? "Admin" : "Login"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
