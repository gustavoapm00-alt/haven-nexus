import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WhatIsSection from '@/components/WhatIsSection';
import UniverseSection from '@/components/UniverseSection';
import OffersSection from '@/components/OffersSection';
import LabSection from '@/components/LabSection';
import EmailCaptureSection from '@/components/EmailCaptureSection';
import FounderSection from '@/components/FounderSection';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <WhatIsSection />
        <UniverseSection />
        <OffersSection />
        <LabSection />
        <EmailCaptureSection />
        <FounderSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
