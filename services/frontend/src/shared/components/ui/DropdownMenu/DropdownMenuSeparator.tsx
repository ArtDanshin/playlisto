'use client';

import type { ComponentProps } from 'react';
import { Separator } from '@radix-ui/react-dropdown-menu';

import { cn } from '@/shared/utils/system';

function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot='dropdown-menu-separator'
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

export default DropdownMenuSeparator;
