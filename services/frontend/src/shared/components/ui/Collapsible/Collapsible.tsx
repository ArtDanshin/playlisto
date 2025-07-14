'use client';

import type { ComponentProps } from 'react';
import { Root } from '@radix-ui/react-collapsible';

function Collapsible(props: ComponentProps<typeof Root>) {
  return <Root data-slot='collapsible' {...props} />;
}

export default Collapsible;
