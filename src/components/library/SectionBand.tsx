import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionBandProps {
  variant?: 'light' | 'muted' | 'ink';
  children: ReactNode;
  className?: string;
  id?: string;
}

const SectionBand = ({ variant = 'light', children, className, id }: SectionBandProps) => {
  const variantStyles = {
    light: 'bg-background',
    muted: 'bg-muted/30',
    ink: 'section-ink text-white',
  };

  return (
    <section id={id} className={cn('section-padding relative', variantStyles[variant], className)}>
      <div className="container-main relative z-10">
        {children}
      </div>
    </section>
  );
};

export default SectionBand;
