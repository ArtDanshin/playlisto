'use client';

import type { ComponentProps } from 'react';
import { Trigger } from '@radix-ui/react-dialog';

function SheetTrigger(props: ComponentProps<typeof Trigger>) {
  return <Trigger data-slot='sheet-trigger' {...props} />;
}

export default SheetTrigger;
