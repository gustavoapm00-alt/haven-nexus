import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const tags = ['AI SaaS', 'Shopify & E-com Systems', 'Brand Building', 'Human Transformation'];

// Floating particle component
const FloatingParticle = ({ 
  className, 
  delay = 0, 
  duration = 4,
  size = 'w-2 h-2'
}: { 
  className: string; 
  delay?: number; 
  duration?: number;
  size?: string;
}) => (
  <motion.div
    className={`absolute rounded-full ${size} ${className}`}
    animate={{
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      opacity: [0.3, 0.8, 0.3],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Text reveal animation variants
const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

const WordReveal = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: delay + wordIndex * 0.08,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {word}
            {wordIndex < words.length - 1 && '\u00A0'}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const HeroSection = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(220 20% 6%) 0%, hsl(220 25% 10%) 50%, hsl(220 20% 6%) 100%)',
          }}
        />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(180 100% 50% / 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(190 100% 40% / 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating particles */}
      <FloatingParticle className="bg-primary/60 top-[15%] left-[10%]" delay={0} size="w-2 h-2" />
      <FloatingParticle className="bg-primary/40 top-[25%] right-[15%]" delay={1} size="w-3 h-3" />
      <FloatingParticle className="bg-accent/50 bottom-[30%] left-[20%]" delay={2} size="w-2 h-2" />
      <FloatingParticle className="bg-primary/30 bottom-[20%] right-[25%]" delay={0.5} size="w-4 h-4" />
      <FloatingParticle className="bg-accent/40 top-[40%] left-[5%]" delay={1.5} size="w-2 h-2" />
      <FloatingParticle className="bg-primary/50 top-[60%] right-[8%]" delay={2.5} size="w-3 h-3" />
      <FloatingParticle className="bg-accent/30 bottom-[40%] right-[12%]" delay={3} size="w-2 h-2" />
      <FloatingParticle className="bg-primary/40 top-[70%] left-[15%]" delay={1.2} size="w-2 h-2" />

      <div className="container-main section-padding pt-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Main headline with text reveal */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none mb-6">
              <WordReveal text="I BUILD SYSTEMS THAT TURN" delay={0.2} />
              <br className="hidden md:block" />
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="text-gradient inline-block"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  SURVIVAL
                </motion.span>
              </span>
              {' '}
              <WordReveal text="INTO" delay={0.95} />
              {' '}
              <span className="inline-block overflow-hidden">
                <motion.span
                  className="text-gradient inline-block"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  STRATEGY
                </motion.span>
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.4 }}
                className="text-primary inline-block"
              >
                .
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8"
            >
              Haven Systems is my ecosystem of AI tools, Shopify builds, streetwear, supplements, 
              and future housing projects—created for people who are done surviving and ready to 
              architect a life that actually works.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.7, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <motion.a 
                href="#offers" 
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Work with me
              </motion.a>
              <motion.a 
                href="#universe" 
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore the universe
              </motion.a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.9, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {tags.map((tag, index) => (
                <motion.span 
                  key={tag} 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'hsl(var(--primary) / 0.2)' }}
                  className="tag-chip cursor-default transition-colors"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.4 }}
              className="text-sm text-muted-foreground mt-6"
            >
              Based in Virginia. Building globally.
            </motion.p>
          </div>

          {/* Right Visual - Enhanced floating orb system */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Outer rotating ring */}
              <motion.div 
                className="absolute inset-0 border border-primary/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle pulsing ring */}
              <motion.div 
                className="absolute inset-8 border border-primary/30 rounded-full"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Inner rotating ring (opposite direction) */}
              <motion.div 
                className="absolute inset-16 border border-primary/40 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />

              {/* Center glowing orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-32 h-32 rounded-full backdrop-blur-md flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, hsl(180 100% 50% / 0.3) 0%, hsl(190 100% 40% / 0.1) 100%)',
                    boxShadow: '0 0 60px hsl(180 100% 50% / 0.3), inset 0 0 40px hsl(180 100% 50% / 0.1)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 60px hsl(180 100% 50% / 0.3), inset 0 0 40px hsl(180 100% 50% / 0.1)',
                      '0 0 80px hsl(180 100% 50% / 0.5), inset 0 0 60px hsl(180 100% 50% / 0.2)',
                      '0 0 60px hsl(180 100% 50% / 0.3), inset 0 0 40px hsl(180 100% 50% / 0.1)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-primary/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>

              {/* Orbiting nodes */}
              <motion.div
                className="absolute w-4 h-4 rounded-full bg-primary/70"
                style={{ top: '50%', left: '50%', marginTop: '-8px', marginLeft: '-8px' }}
                animate={{
                  x: [0, 120, 0, -120, 0],
                  y: [-120, 0, 120, 0, -120],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div
                className="absolute w-3 h-3 rounded-full bg-accent/60"
                style={{ top: '50%', left: '50%', marginTop: '-6px', marginLeft: '-6px' }}
                animate={{
                  x: [80, 0, -80, 0, 80],
                  y: [0, 80, 0, -80, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              <motion.div
                className="absolute w-2 h-2 rounded-full bg-primary/50"
                style={{ top: '50%', left: '50%', marginTop: '-4px', marginLeft: '-4px' }}
                animate={{
                  x: [0, -60, 0, 60, 0],
                  y: [60, 0, -60, 0, 60],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              {/* Corner floating dots */}
              <motion.div 
                className="absolute top-4 left-4 w-3 h-3 rounded-full bg-primary/60"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute top-8 right-12 w-2 h-2 rounded-full bg-accent/50"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-12 left-8 w-2 h-2 rounded-full bg-primary/50"
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.5, 0.9, 0.5],
                }}
                transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-primary/60"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 2.2, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="text-muted-foreground" size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;