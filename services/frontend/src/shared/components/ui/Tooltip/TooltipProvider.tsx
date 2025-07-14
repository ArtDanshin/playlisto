'use client';

import type { ComponentProps } from 'react';
import { Provider } from '@radix-ui/react-tooltip';

function TooltipProvider({ delayDuration = 0, ...props }: ComponentProps<typeof Provider>) {
  return (
    <Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  );
}

export default TooltipProvider;
