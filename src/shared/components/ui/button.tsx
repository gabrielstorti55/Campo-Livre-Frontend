import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        campo:
          'h-auto rounded-md px-5 py-2.5 font-display text-sm font-semibold text-white',
        campoOutline:
          'h-auto rounded-md border bg-background px-5 py-2.5 font-display text-sm font-semibold shadow-sm',
      },
      tone: {
        green: '',
        navy: '',
        danger: '',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    compoundVariants: [
      {
        variant: 'campo',
        size: 'default',
        className: 'h-auto px-5 py-2.5',
      },
      {
        variant: 'campoOutline',
        size: 'default',
        className: 'h-auto px-5 py-2.5',
      },
      {
        variant: 'campo',
        tone: 'green',
        className: 'bg-green-mid hover:bg-green-dark',
      },
      {
        variant: 'campo',
        tone: 'navy',
        className: 'bg-navy-mid hover:bg-navy-dark',
      },
      {
        variant: 'campo',
        tone: 'danger',
        className: 'bg-danger hover:bg-danger/90',
      },
      {
        variant: 'campoOutline',
        tone: 'green',
        className:
          'border-green-mid text-green-mid hover:bg-green-pale hover:text-green-dark',
      },
      {
        variant: 'campoOutline',
        tone: 'navy',
        className:
          'border-navy-mid text-navy-mid hover:bg-navy-mid/10 hover:text-navy-dark',
      },
      {
        variant: 'campoOutline',
        tone: 'danger',
        className:
          'border-danger text-danger hover:bg-danger/10 hover:text-danger',
      },
    ],
    defaultVariants: {
      variant: 'default',
      tone: 'green',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, tone, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, tone, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

// Exported for components that reuse the same CVA contract.
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
