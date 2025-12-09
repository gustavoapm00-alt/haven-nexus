import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const tags = ['AI SaaS', 'Shopify & E-com Systems', 'Brand Building', 'Human Transformation'];

const HeroSection = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(220 20% 6%) 0%, hsl(220 25% 12%) 100%)',
      }}
    >
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(180 100% 50% / 0.3) 0%, transparent 70%)' }}
      />

      <div className="container-main section-padding pt-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
              className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-none mb-6"
            >
              I BUILD SYSTEMS THAT TURN{' '}
              <span className="text-gradient">SURVIVAL</span> INTO{' '}
              <span className="text-gradient">STRATEGY</span>.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8"
            >
              Haven Systems is my ecosystem of AI tools, Shopify builds, streetwear, supplements, 
              and future housing projects—created for people who are done surviving and ready to 
              architect a life that actually works.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <a href="#offers" className="btn-primary">
                Work with me
              </a>
              <a href="#universe" className="btn-secondary">
                Explore the universe
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
            >
              {tags.map((tag, index) => (
                <motion.span 
                  key={tag} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                  className="tag-chip"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-sm text-muted-foreground mt-6"
            >
              Based in Virginia. Building globally.
            </motion.p>
          </div>

          {/* Right Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Abstract network visualization */}
              <div className="absolute inset-0 border border-primary/20 rounded-lg animate-glow-pulse" />
              <div className="absolute inset-4 border border-primary/30 rounded-lg rotate-3" />
              <div className="absolute inset-8 border border-primary/40 rounded-lg -rotate-3" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/30 animate-pulse" />
                </div>
              </div>
              {/* Floating nodes */}
              <div className="absolute top-10 left-10 w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
              <div className="absolute top-20 right-16 w-2 h-2 rounded-full bg-primary/40 animate-pulse delay-100" />
              <div className="absolute bottom-16 left-20 w-2 h-2 rounded-full bg-primary/50 animate-pulse delay-200" />
              <div className="absolute bottom-10 right-10 w-3 h-3 rounded-full bg-primary/60 animate-pulse delay-300" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ArrowDown className="text-muted-foreground" size={24} />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
