'use client';

import type { ComponentProps } from 'react';
import { Trigger } from '@radix-ui/react-tooltip';

function TooltipTrigger(props: ComponentProps<typeof Trigger>) {
  return <Trigger data-slot='tooltip-trigger' {...props} />;
}

export default TooltipTrigger;
