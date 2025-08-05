'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/system';

function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sidebar-footer'
      data-sidebar='footer'
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

export default SidebarFooter;
