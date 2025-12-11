import { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

// Floating Wisdom Lines Component
const wisdomLines = [
  "Even in the valley, you are being led.",
  "What was meant to break you became your foundation.",
  "You are not late. You are right on time for your calling.",
  "From small beginnings, eternal stories are written.",
  "The same God who rescued you will build through you.",
  "You were not only saved from something — you were saved for something.",
  "Light still finds those who walk through the shadows."
];

const FloatingWisdom = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % wisdomLines.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 max-w-xs text-right hidden md:block">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
          transition={{ duration: 1.2 }}
          className="text-sm text-muted-foreground/70 italic font-light tracking-wide"
        >
          "{wisdomLines[currentIndex]}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

// Enhanced Sacred Geometry with softer glow
const SacredGeometry = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {/* Large outer circle */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-primary/5 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
    />
    {/* Middle circle */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/8 rounded-full"
      animate={{ rotate: -360 }}
      transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
    />
    {/* Inner circle */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/10 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
    />
    {/* Sacred cross lines */}
    <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/8 to-transparent" />
    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/8 to-transparent" />
    {/* Diagonal lines */}
    <div className="absolute top-0 left-0 w-full h-full">
      <div className="absolute top-0 left-0 w-full h-px origin-top-left rotate-45 bg-gradient-to-r from-transparent via-primary/5 to-transparent scale-x-150" />
      <div className="absolute top-0 right-0 w-full h-px origin-top-right -rotate-45 bg-gradient-to-r from-transparent via-primary/5 to-transparent scale-x-150" />
    </div>
    {/* Arc elements */}
    <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M 50 10 A 40 40 0 0 1 90 50" stroke="hsl(var(--primary))" strokeWidth="0.1" fill="none" />
      <path d="M 50 90 A 40 40 0 0 1 10 50" stroke="hsl(var(--primary))" strokeWidth="0.1" fill="none" />
    </svg>
  </div>
);

// Cosmic Nebula Background
const CosmicNebula = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    {/* Main cosmic glow - softened */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/3 rounded-full blur-[200px]" />
    <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-accent/4 rounded-full blur-[150px]" />
    <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
    {/* Subtle star-like points */}
    <div className="absolute top-20 left-[20%] w-1 h-1 bg-foreground/20 rounded-full" />
    <div className="absolute top-[40%] left-[10%] w-0.5 h-0.5 bg-foreground/15 rounded-full" />
    <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-foreground/20 rounded-full" />
    <div className="absolute bottom-[30%] left-[30%] w-0.5 h-0.5 bg-foreground/10 rounded-full" />
    <div className="absolute top-[25%] right-[25%] w-0.5 h-0.5 bg-primary/30 rounded-full" />
  </div>
);

// Section wrapper with animation
const Section = ({ 
  children, 
  className = "", 
  delay = 0,
  id
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  id?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <section id={id} className={`py-28 md:py-36 px-6 ${className}`}>{children}</section>;
  }
  
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeIn}
      transition={{ duration: 1, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={`py-28 md:py-36 px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
};

// Divider component
const Divider = () => (
  <div className="flex justify-center py-8">
    <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
  </div>
);

const Sanctuary = () => {
  return (
    <>
      <SEO 
        title="The Sanctuary"
        description="A sanctuary for builders. A calling to Próspera. Where visionaries, founders, and creators return to the essence of who they are and discover who they are meant to become."
        keywords="Próspera, Honduras, visionary builders, sanctuary, AERELION mission, purpose-driven, spiritual, destiny"
        canonicalUrl="/sanctuary"
      />

      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
        <CosmicNebula />
        <SacredGeometry />
        <FloatingWisdom />

        {/* SECTION 1 — HERO */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight mb-10 leading-[1.1] max-w-5xl"
          >
            A Sanctuary for Builders.
            <br />
            <span className="text-primary/90">A Calling to Próspera.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-light"
          >
            A quiet place where visionaries, founders, and creators return to who they are — and discover who they are meant to become.
          </motion.p>
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-px h-20 bg-gradient-to-b from-primary/40 to-transparent"
            />
          </motion.div>
        </section>

        {/* SECTION 2 — INVOCATION (ESSENCE OF AERELION) */}
        <Section className="relative">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground/85 leading-[1.8] font-light tracking-wide">
              "AERELION is not a marketplace.
              <br />
              <span className="text-primary/90">It is a sanctuary</span> —
              <br />
              a place where creation becomes sacred,
              <br />
              purpose becomes clear,
              <br />
              and the soul remembers its direction."
            </p>
          </div>
        </Section>

        <Divider />

        {/* SECTION 3 — ORIGIN (WHO GUSTAVO IS) */}
        <Section delay={0.1}>
          <div className="max-w-3xl mx-auto md:text-left text-center">
            <p className="text-lg md:text-xl text-foreground/80 leading-[1.9] italic">
              "I was shaped by Honduras.
              <br />
              Forged in struggle.
              <br />
              Transformed by faith.
              <br />
              Rebuilt through discipline, vision, and the quiet voice of God guiding me forward.
              <br /><br />
              <span className="text-primary/90 not-italic font-normal">AERELION is the reflection of that journey —</span>
              <br />
              a universe born from my rebirth."
            </p>
            <p className="mt-10 text-muted-foreground font-light italic text-lg">
              — Gustavo
            </p>
          </div>
        </Section>

        <Divider />

        {/* SECTION 4 — THE CALLING (WHY PRÓSPERA) */}
        <Section delay={0.1} className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
          {/* Subtle Honduras outline suggestion */}
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <div className="w-[600px] h-[300px] border border-primary/20 rounded-[40%] rotate-12" />
          </div>
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="font-display text-3xl md:text-4xl mb-12 text-primary/70">The Calling</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-[1.9] italic">
              "Próspera is more than a place.
              <br />
              It is a frontier of possibility —
              <br />
              a land where dreamers, builders, and sovereign minds gather to create new worlds.
              <br /><br />
              I return to Honduras not to escape the past,
              <br />
              but to build a future worthy of our people.
              <br /><br />
              <span className="text-primary/90 not-italic font-normal">Próspera is where that future begins."</span>
            </p>
          </div>
        </Section>

        <Divider />

        {/* SECTION 5 — THE MISSION */}
        <Section delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-12 text-primary/70">The Mission</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-[1.9] italic">
              "My purpose is simple:
              <br />
              to elevate, to empower, and to build.
              <br /><br />
              AERELION exists to bring clarity, creation, and divine craftsmanship to Próspera —
              <br />
              through vision, technology, storytelling, and the awakening of human potential.
              <br /><br />
              I am here to create systems that uplift,
              <br />
              spaces that inspire,
              <br />
              and opportunities that transform lives."
            </p>
          </div>
        </Section>

        <Divider />

        {/* SECTION 6 — LETTER TO HONDURAS */}
        <Section delay={0.1} className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <h2 className="font-display text-3xl md:text-4xl mb-16 text-center text-primary/70">Letter to Honduras</h2>
            <div className="text-foreground/80 leading-[2] text-lg md:text-xl space-y-6 font-light">
              <p className="italic">Dear Honduras,</p>
              
              <p>
                You are the land that raised me in chaos and beauty.
                You are the streets where I learned struggle,
                the sky under which I dreamed of more,
                and the soil that watched me break and be rebuilt.
              </p>
              
              <p>
                For a long time, I ran from the pain,
                from the memories,
                from the weight of what I saw and lived.
                But even in the distance,
                you never left my heart.
              </p>
              
              <p>
                I do not come back to you as a hero.
                I come back as a son.
                As someone who has been humbled,
                healed, and called to build.
              </p>
              
              <p>
                Through AERELION,
                I want to bring you more than business.
                I want to bring you <span className="text-primary/90">systems that create opportunity</span>,
                spaces that carry peace,
                and paths that help the next generation
                live with more dignity than we had.
              </p>
              
              <p>
                I honor your wounds.
                I honor your beauty.
                And with every line of code,
                every story, every structure I build,
                I carry you with me.
              </p>
              
              <p className="text-foreground/90">
                This sanctuary is my promise:
                <br />
                <span className="text-primary/90">I have not forgotten you.</span>
                <br />
                And I will not stop building for you.
              </p>
              
              <div className="pt-8 text-right">
                <p className="text-muted-foreground italic">— Gustavo</p>
                <p className="text-muted-foreground/70 text-base mt-1">A son of Honduras</p>
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* SECTION 7 — THE SANCTUARY MESSAGE (FOR VISITORS) */}
        <Section delay={0.1} className="relative">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-foreground/85 leading-[1.9] font-light">
              "If you carry a vision too heavy for ordinary life,
              <br />
              <span className="text-primary/90">this sanctuary is for you.</span>
              <br /><br />
              Here, you may pause.
              <br />
              Here, you may breathe.
              <br />
              Here, you may begin again."
            </p>
          </div>
        </Section>

        <Divider />

        {/* SECTION 8 — INVITATION (CTA WITHOUT SALES) */}
        <Section delay={0.1}>
          <div className="max-w-2xl mx-auto text-center">
            <Link
              to="/contact"
              className="inline-block px-14 py-5 border border-primary/25 text-primary hover:bg-primary/5 transition-all duration-700 text-lg tracking-[0.2em] uppercase font-light mb-10 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
            >
              Begin the Conversation
            </Link>
            <p className="text-muted-foreground text-lg leading-relaxed font-light">
              If something within you stirs, reach out.
              <br />
              All beginnings start with a word.
            </p>
          </div>
        </Section>

        {/* SECTION 9 — FINAL BLESSING */}
        <section className="py-36 md:py-48 px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-2xl md:text-3xl text-foreground/50 font-light tracking-wide leading-relaxed">
              "When the time is right,
              <br />
              <span className="text-primary/60">the door opens."</span>
            </p>
          </motion.div>
        </section>

        {/* Footer spacer */}
        <div className="h-20" />
      </main>
    </>
  );
};

export default Sanctuary;
