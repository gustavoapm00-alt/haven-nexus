import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-mono font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-[0.1em]",
  {
    variants: {
      variant: {
        default: "bg-cyan-500 text-black border-[0.5px] border-cyan-400 hover:bg-cyan-400 hover:shadow-[0_0_20px_hsl(187_100%_50%/0.3)]",
        destructive: "bg-destructive text-destructive-foreground border-[0.5px] border-red-500/50 hover:bg-destructive/90",
        outline: "border-[0.5px] border-white/20 bg-transparent text-white/60 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5",
        secondary: "bg-white/5 text-white/60 border-[0.5px] border-white/10 hover:bg-white/10 hover:text-white/80",
        ghost: "text-white/40 hover:bg-white/5 hover:text-white/60",
        link: "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
