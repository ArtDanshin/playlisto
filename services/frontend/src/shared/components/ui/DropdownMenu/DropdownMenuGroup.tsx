'use client';

import type { ComponentProps } from 'react';
import { Group } from '@radix-ui/react-dropdown-menu';

function DropdownMenuGroup(props: ComponentProps<typeof Group>) {
  return (
    <Group data-slot='dropdown-menu-group' {...props} />
  );
}

export default DropdownMenuGroup;
