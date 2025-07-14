'use client';

import type { ComponentProps } from 'react';
import { Portal } from '@radix-ui/react-dialog';

function DialogPortal(props: ComponentProps<typeof Portal>) {
  return <Portal data-slot='dialog-portal' {...props} />;
}

export default DialogPortal;
