'use client';

import type { ComponentProps } from 'react';
import { CollapsibleTrigger as Trigger } from '@radix-ui/react-collapsible';

function CollapsibleTrigger(props: ComponentProps<typeof Trigger>) {
  return <Trigger data-slot='collapsible-trigger' {...props} />;
}

export default CollapsibleTrigger;
