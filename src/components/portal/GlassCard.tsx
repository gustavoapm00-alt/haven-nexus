import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "accent";
  hover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = true, ...props }, ref) => {
    const variants = {
      default: "bg-white/[0.03] border-white/10",
      dark: "bg-black/60 border-white/5",
      accent: "bg-cyan-500/5 border-cyan-500/20",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "backdrop-blur-xl border-[0.5px]",
          "transition-all duration-300",
          variants[variant],
          hover && "hover:border-cyan-500/30 hover:shadow-[0_0_20px_hsl(187_100%_50%/0.08)]",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
