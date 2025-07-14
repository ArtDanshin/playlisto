'use client';

import type { ComponentProps } from 'react';
import { Title } from '@radix-ui/react-dialog';

import { cn } from '@/shared/utils/utils';

function DialogTitle({ className, ...props }: ComponentProps<typeof Title>) {
  return (
    <Title
      data-slot='dialog-title'
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

export default DialogTitle;
