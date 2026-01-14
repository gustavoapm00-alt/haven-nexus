import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "accent";
  hover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = true, ...props }, ref) => {
    const variants = {
      default: "bg-card/60 border-border/50",
      dark: "bg-ink/80 border-border/30",
      accent: "bg-primary/5 border-primary/20",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "backdrop-blur-xl rounded-xl border shadow-lg",
          "transition-all duration-300",
          variants[variant],
          hover && "hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
