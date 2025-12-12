import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const directionOffsets = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { y: 40, x: 0 },
  right: { y: 40, x: 0 },
};

const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, className = '', delay = 0, direction = 'up' }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const offset = directionOffsets[direction];

    if (shouldReduceMotion) {
      return <div ref={ref} className={className}>{children}</div>;
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...offset }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: '-50px', amount: 0.1 }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
        style={{ willChange: 'opacity, transform' }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;
