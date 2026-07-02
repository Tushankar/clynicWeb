import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// "Liquid glass" pill buttons — rounded-full, translucent fills with a top sheen gradient,
// a single inset highlight (no doubled border), soft depth shadow, and a tactile lift/press.
// Filled variants share GLASS; outline/secondary get a lighter frosted treatment.
const GLASS_SHADOW = 'shadow-[0_8px_22px_-7px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.45)]';
const GLASS = `bg-gradient-to-b from-white/25 to-white/0 backdrop-blur-md ${GLASS_SHADOW} hover:-translate-y-px active:translate-y-0 active:scale-[0.98]`;

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
  {
    variants: {
      variant: {
        default: `bg-primary/90 text-primary-foreground hover:bg-primary ${GLASS}`,
        destructive: `bg-destructive/90 text-destructive-foreground hover:bg-destructive ${GLASS}`,
        outline: 'border border-input bg-background/70 shadow-sm backdrop-blur-md hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
        secondary: `bg-secondary/80 text-secondary-foreground hover:bg-secondary bg-gradient-to-b from-white/50 to-white/0 backdrop-blur-md shadow-[0_4px_14px_-6px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.6)] active:scale-[0.98]`,
        ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-4',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
