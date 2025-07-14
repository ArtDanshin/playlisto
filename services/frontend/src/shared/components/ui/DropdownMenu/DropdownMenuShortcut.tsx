'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/utils';

function DropdownMenuShortcut({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot='dropdown-menu-shortcut'
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  );
}

export default DropdownMenuShortcut;
