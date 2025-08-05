'use client';

import type { ComponentProps } from 'react';
import { Title } from '@radix-ui/react-dialog';

import { cn } from '@/shared/utils/common';

function SheetTitle({ className, ...props }: ComponentProps<typeof Title>) {
  return (
    <Title
      data-slot='sheet-title'
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

export default SheetTitle;
