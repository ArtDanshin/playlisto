'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/common';

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

export default DialogFooter;
