import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionBandProps {
  variant?: 'light' | 'muted' | 'ink';
  children: ReactNode;
  className?: string;
  id?: string;
  enableParallax?: boolean;
}

const SectionBand = ({ variant = 'light', children, className, id, enableParallax = false }: SectionBandProps) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // All useTransform calls BEFORE any conditional return
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const orbOneY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const orbTwoY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const scanLineTop = useTransform(scrollYProgress, [0, 1], ["10%", "90%"]);
  const scanLineOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.6, 0.6, 0]);

  const variantStyles = {
    light: 'bg-background',
    muted: 'bg-muted/30',
    ink: 'section-ink-enhanced text-white',
  };

  const shouldAnimate = !prefersReducedMotion && variant === 'ink' && enableParallax;

  if (shouldAnimate) {
    return (
      <section 
        ref={ref}
        id={id} 
        className={cn('section-padding relative overflow-hidden', variantStyles[variant], className)}
      >
        {/* Animated background grid layer */}
        <motion.div 
          className="absolute inset-0 ink-grid-layer pointer-events-none"
          style={{ y: gridY }}
        />
        
        {/* Floating orbs for depth */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, hsl(220 65% 50% / 0.15), transparent 70%)',
            opacity: glowOpacity,
            y: orbOneY,
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ 
            background: 'radial-gradient(circle, hsl(240 60% 45% / 0.12), transparent 70%)',
            opacity: glowOpacity,
            y: orbTwoY,
          }}
        />
        
        {/* Scan line effect */}
        <motion.div 
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none"
          style={{
            top: scanLineTop,
            opacity: scanLineOpacity,
          }}
        />
        
        {/* Content with subtle parallax */}
        <motion.div 
          className="container-main relative z-10"
          style={{ y: contentY }}
        >
          {children}
        </motion.div>
      </section>
    );
  }

  return (
    <section 
      ref={ref}
      id={id} 
      className={cn('section-padding relative', variantStyles[variant], className)}
    >
      <div className="container-main relative z-10">
        {children}
      </div>
    </section>
  );
};

export default SectionBand;
