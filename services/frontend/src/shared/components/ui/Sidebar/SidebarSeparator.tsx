'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/utils';
import { Separator } from '@/shared/components/ui/Separator';

function SidebarSeparator({ className, ...props }: ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot='sidebar-separator'
      data-sidebar='separator'
      className={cn('bg-sidebar-border mx-2 w-auto', className)}
      {...props}
    />
  );
}

export default SidebarSeparator;
