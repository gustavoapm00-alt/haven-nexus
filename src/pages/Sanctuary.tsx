import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import AmbientAudioPlayer from '@/components/AmbientAudioPlayer';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const SacredGeometry = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Central sacred circle */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/10 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full"
      animate={{ rotate: -360 }}
      transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
    />
    {/* Sacred lines */}
    <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
  </div>
);

const CosmicGlow = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
    <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
  </div>
);

const Section = ({ 
  children, 
  className = "", 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <section className={`py-24 md:py-32 px-6 ${className}`}>{children}</section>;
  }
  
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeIn}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={`py-24 md:py-32 px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
};

const Sanctuary = () => {
  return (
    <>
      <SEO 
        title="Sanctuary"
        description="A sanctuary for builders. A calling to Próspera. Where visionaries, founders, and creators return to the essence of who they are and discover who they are meant to become."
        keywords="Próspera, Honduras, visionary builders, sanctuary, AERELION mission, purpose-driven"
        canonicalUrl="/sanctuary"
      />

      <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <CosmicGlow />
        <SacredGeometry />

        {/* SECTION 1 — HERO */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight mb-8 leading-[1.1] max-w-5xl"
          >
            A Sanctuary for Builders.
            <br />
            <span className="text-primary">A Calling to Próspera.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            A quiet place where visionaries, founders, and creators return to the essence of who they are — and discover who they are meant to become.
          </motion.p>
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-px h-16 bg-gradient-to-b from-primary/50 to-transparent"
            />
          </motion.div>
        </section>

        {/* SECTION 2 — THE INVOCATION */}
        <Section className="relative">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl lg:text-3xl text-foreground/90 leading-relaxed font-light tracking-wide">
              AERELION is not a marketplace.
              <br className="hidden md:block" />
              <span className="text-primary">It is a sanctuary</span> —
              <br />
              a place where creation becomes sacred,
              <br />
              purpose becomes clear,
              <br />
              and the soul finally remembers its direction.
            </p>
          </div>
        </Section>

        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* SECTION 3 — THE ORIGIN */}
        <Section delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-10 text-primary/80">The Origin</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed italic">
              "I was shaped by Honduras.
              <br />
              Forged in struggle.
              <br />
              Transformed by faith.
              <br />
              Rebuilt through discipline, vision, and the quiet voice of God guiding me forward.
              <br /><br />
              <span className="text-primary not-italic font-medium">AERELION is the reflection of that journey —</span>
              <br />
              a universe born from my rebirth."
            </p>
          </div>
        </Section>

        {/* SECTION 4 — THE CALLING */}
        <Section delay={0.1} className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="font-display text-3xl md:text-4xl mb-10 text-primary/80">The Calling</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed italic">
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
              <span className="text-primary not-italic font-medium">Próspera is where that future begins."</span>
            </p>
          </div>
        </Section>

        {/* SECTION 5 — THE MISSION */}
        <Section delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-10 text-primary/80">The Mission</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed italic">
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

        {/* Divider */}
        <div className="flex justify-center py-8">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* SECTION 6 — THE SANCTUARY MESSAGE */}
        <Section delay={0.1} className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative">
            <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
              "If you carry a vision too heavy for ordinary life,
              <br />
              <span className="text-primary">this sanctuary is for you.</span>
              <br /><br />
              Here, you may pause.
              <br />
              Here, you may breathe.
              <br />
              Here, you may begin again."
            </p>
          </div>
        </Section>

        {/* SECTION 7 — THE INVITATION */}
        <Section delay={0.1}>
          <div className="max-w-2xl mx-auto text-center">
            <Link
              to="/contact"
              className="inline-block px-12 py-5 border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-500 text-lg tracking-widest uppercase font-light mb-8 hover:border-primary/60"
            >
              Begin the Conversation
            </Link>
            <p className="text-muted-foreground text-lg leading-relaxed">
              If something within you stirs, reach out.
              <br />
              All beginnings start with a word.
            </p>
          </div>
        </Section>

        {/* SECTION 8 — THE FINAL BLESSING */}
        <section className="py-32 md:py-48 px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <p className="text-2xl md:text-3xl text-foreground/60 font-light tracking-wide">
              "When the time is right,
              <br />
              <span className="text-primary/80">the door opens."</span>
            </p>
          </motion.div>
        </section>

        {/* Footer spacer */}
        <div className="h-24" />

        {/* Ambient Audio Player */}
        <AmbientAudioPlayer />
      </main>
    </>
  );
};

export default Sanctuary;
