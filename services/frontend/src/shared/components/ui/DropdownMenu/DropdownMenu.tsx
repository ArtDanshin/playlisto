'use client';

import type { ComponentProps } from 'react';
import { Root } from '@radix-ui/react-dropdown-menu';

function DropdownMenu(props: ComponentProps<typeof Root>) {
  return <Root data-slot='dropdown-menu' {...props} />;
}

export default DropdownMenu;
