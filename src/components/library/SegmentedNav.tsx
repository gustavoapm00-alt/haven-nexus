import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  action: 'scroll' | 'navigate';
  target: string;
}

const tabs: Tab[] = [
  { id: 'agents', label: 'Agents', action: 'scroll', target: 'featured-agents' },
  { id: 'bundles', label: 'Bundles', action: 'scroll', target: 'bundles-section' },
  { id: 'purchases', label: 'My Purchases', action: 'navigate', target: '/library/purchases' },
];

const SegmentedNav = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    
    if (tab.action === 'navigate') {
      navigate(tab.target);
    } else {
      const element = document.getElementById(tab.target);
      if (element) {
        const offset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  // Only show on library home
  if (location.pathname !== '/' && location.pathname !== '/library') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`z-40 transition-all duration-300 ${
        isSticky 
          ? 'fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm' 
          : 'relative bg-transparent'
      }`}
    >
      <div className="container-main py-3">
        <div className="flex justify-center">
          <div className="segmented-control">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={activeTab === tab.id ? 'active' : ''}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SegmentedNav;
