'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/utils';

function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

export default SheetFooter;
