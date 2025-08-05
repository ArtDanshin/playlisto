'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/common';

function SidebarGroupContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sidebar-group-content'
      data-sidebar='group-content'
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
}

export default SidebarGroupContent;
