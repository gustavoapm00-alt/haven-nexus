import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const tags = ['AI SaaS', 'Shopify & E-com Systems', 'Brand Building', 'Human Transformation'];

// Optimized floating particle - uses GPU-accelerated transforms only
const FloatingParticle = ({ 
  className, 
  delay = 0,
  reducedMotion = false
}: { 
  className: string; 
  delay?: number;
  reducedMotion?: boolean;
}) => (
  <motion.div
    className={`absolute rounded-full will-change-transform ${className}`}
    style={{ transform: 'translateZ(0)' }}
    animate={reducedMotion ? {} : {
      y: [-15, 15, -15],
      opacity: [0.4, 0.7, 0.4],
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  // Simplified animation variants for reduced motion
  const fadeIn = {
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 },
    animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  const textReveal = {
    initial: prefersReducedMotion ? { opacity: 0 } : { y: '100%', opacity: 0 },
    animate: prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 },
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Simplified gradient background - no animation */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(220 20% 6%) 0%, hsl(220 25% 10%) 50%, hsl(220 20% 6%) 100%)',
          }}
        />
        
        {/* Static gradient orbs - reduced blur for performance */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, hsl(180 100% 50% / 0.12) 0%, transparent 60%)',
            filter: 'blur(40px)',
            transform: 'translateZ(0)',
          }}
        />
        
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(circle, hsl(190 100% 40% / 0.1) 0%, transparent 60%)',
            filter: 'blur(40px)',
            transform: 'translateZ(0)',
          }}
        />

        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Reduced floating particles - only 3 instead of 8 */}
      {!prefersReducedMotion && (
        <>
          <FloatingParticle className="bg-primary/50 w-2 h-2 top-[20%] left-[12%]" delay={0} />
          <FloatingParticle className="bg-primary/40 w-3 h-3 top-[30%] right-[18%]" delay={1} />
          <FloatingParticle className="bg-accent/40 w-2 h-2 bottom-[25%] left-[22%]" delay={2} />
        </>
      )}

      <div className="container-main section-padding pt-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Main headline with text reveal */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none mb-6">
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  {...textReveal}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  I BUILD SYSTEMS THAT TURN
                </motion.span>
              </span>
              <br className="hidden md:block" />
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="text-gradient inline-block"
                  {...textReveal}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  SURVIVAL
                </motion.span>
              </span>
              {' '}
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  {...textReveal}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  INTO
                </motion.span>
              </span>
              {' '}
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="text-gradient inline-block"
                  {...textReveal}
                  transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  STRATEGY
                </motion.span>
              </span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="text-primary inline-block"
              >
                .
              </motion.span>
            </h1>

            <motion.p 
              {...fadeIn}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8"
            >
              Haven Systems is my ecosystem of AI tools, Shopify builds, streetwear, supplements, 
              and future housing projects—created for people who are done surviving and ready to 
              architect a life that actually works.
            </motion.p>

            <motion.div 
              {...fadeIn}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <a href="#offers" className="btn-primary hover:scale-105 transition-transform duration-200">
                Work with me
              </a>
              <a href="#universe" className="btn-secondary hover:scale-105 transition-transform duration-200">
                Explore the universe
              </a>
            </motion.div>

            <motion.div 
              {...fadeIn}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {tags.map((tag, index) => (
                <motion.span 
                  key={tag} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 + index * 0.05 }}
                  className="tag-chip cursor-default hover:bg-primary/20 transition-colors duration-200"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-sm text-muted-foreground mt-6"
            >
              Based in Virginia. Building globally.
            </motion.p>
          </div>

          {/* Right Visual - Simplified orb system */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Static rings - no rotation animation */}
              <div className="absolute inset-0 border border-primary/20 rounded-full" />
              <div className="absolute inset-8 border border-primary/25 rounded-full" />
              <div className="absolute inset-16 border border-primary/30 rounded-full" />

              {/* Center glowing orb - simplified, no box-shadow animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, hsl(180 100% 50% / 0.25) 0%, hsl(190 100% 40% / 0.08) 100%)',
                    boxShadow: '0 0 50px hsl(180 100% 50% / 0.25)',
                  }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-primary/40"
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transform: 'translateZ(0)' }}
                  />
                </div>
              </div>

              {/* Single orbiting node - only if motion allowed */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute w-3 h-3 rounded-full bg-primary/60 will-change-transform"
                  style={{ 
                    top: '50%', 
                    left: '50%', 
                    marginTop: '-6px', 
                    marginLeft: '-6px',
                    transform: 'translateZ(0)',
                  }}
                  animate={{
                    x: [0, 100, 0, -100, 0],
                    y: [-100, 0, 100, 0, -100],
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Static corner dots */}
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-primary/50" />
              <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-accent/40" />
              <div className="absolute bottom-12 left-8 w-2 h-2 rounded-full bg-primary/40" />
              <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-primary/50" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="text-muted-foreground" size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
