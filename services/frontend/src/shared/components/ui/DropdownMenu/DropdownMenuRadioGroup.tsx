'use client';

import type { ComponentProps } from 'react';
import { RadioGroup } from '@radix-ui/react-dropdown-menu';

function DropdownMenuRadioGroup(props: ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup data-slot='dropdown-menu-radio-group' {...props} />
  );
}

export default DropdownMenuRadioGroup;
