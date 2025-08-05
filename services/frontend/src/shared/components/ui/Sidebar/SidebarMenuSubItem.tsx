'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/shared/utils/system';

function SidebarMenuSubItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot='sidebar-menu-sub-item'
      data-sidebar='menu-sub-item'
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  );
}

export default SidebarMenuSubItem;
