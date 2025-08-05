'use client';

import type { ComponentProps } from 'react';
import { Description } from '@radix-ui/react-dialog';

import { cn } from '@/shared/utils/system';

function SheetDescription({ className, ...props }: ComponentProps<typeof Description>) {
  return (
    <Description
      data-slot='sheet-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export default SheetDescription;
