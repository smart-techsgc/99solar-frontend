'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/lib/utils';

const progressVariants = cva(
  'h-2 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 dark:bg-gray-800',
        primary: 'bg-primary/20',
        destructive: 'bg-destructive/20',
        success: 'bg-green-500/20',
      },
      indicator: {
        default: 'bg-gray-900 dark:bg-gray-50',
        primary: 'bg-primary',
        destructive: 'bg-destructive',
        success: 'bg-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      indicator: 'default',
    },
  }
);

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, indicator, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ variant }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        'h-full w-full flex-1 transition-all',
        progressVariants({ indicator })
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };