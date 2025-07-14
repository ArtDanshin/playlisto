'use client';

import type { ComponentProps } from 'react';
import { Label } from '@radix-ui/react-dropdown-menu';

import { cn } from '@/shared/utils/utils';

type DropdownMenuLabelProps = ComponentProps<typeof Label> & {
  inset?: boolean;
};

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <Label
      data-slot='dropdown-menu-label'
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  );
}

export default DropdownMenuLabel;
