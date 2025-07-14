'use client';

import type { ComponentProps } from 'react';
import { CollapsibleContent as Content } from '@radix-ui/react-collapsible';

function CollapsibleContent(props: ComponentProps<typeof Content>) {
  return <Content data-slot='collapsible-content' {...props} />;
}

export default CollapsibleContent;
