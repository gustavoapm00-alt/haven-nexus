import { useState, useEffect, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Workflow Packs', href: '/agents' },
  { name: 'Bundles', href: '/bundles' },
  { name: 'How It Works', href: '/deployment' },
];

const Navbar = forwardRef<HTMLElement>((_, ref) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();

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
    return location.pathname === href || location.pathname.startsWith(href + '/');
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
          AERELION
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                isActive(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/agents" className="btn-primary !py-2 !px-4 text-xs">
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
            Browse Packs
          </Link>
          {!isLoading && (
            <>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link 
                to={user ? "/portal/dashboard" : "/portal/auth"} 
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="w-4 h-4" />
                {user ? "Portal" : "Sign In"}
              </Link>
            </>
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
              className={`px-6 py-3 text-sm font-medium transition-colors duration-300 ${
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
              to="/agents" 
              onClick={handleLinkClick}
              className="btn-primary !py-2 !px-4 text-xs w-full justify-center"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              Browse Packs
            </Link>
            {!isLoading && (
              <Link 
                to={user ? "/portal/dashboard" : "/portal/auth"} 
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="w-4 h-4" />
                {user ? "Portal" : "Sign In"}
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
