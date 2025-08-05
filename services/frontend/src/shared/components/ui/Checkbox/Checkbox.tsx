'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/system';

interface CheckboxProps extends ComponentProps<'input'> {
  className?: string;
}

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type='checkbox'
      data-slot='checkbox'
      className={cn(
        'h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground',
        className,
      )}
      {...props}
    />
  );
}

export default Checkbox;
