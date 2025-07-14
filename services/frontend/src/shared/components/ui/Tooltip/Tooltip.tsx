'use client';

import type { ComponentProps } from 'react';
import { Root } from '@radix-ui/react-tooltip';

import TooltipProvider from './TooltipProvider';

function Tooltip(props: ComponentProps<typeof Root>) {
  return (
    <TooltipProvider>
      <Root data-slot='tooltip' {...props} />
    </TooltipProvider>
  );
}

export default Tooltip;
