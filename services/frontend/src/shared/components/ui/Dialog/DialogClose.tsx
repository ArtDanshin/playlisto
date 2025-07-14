'use client';

import type { ComponentProps } from 'react';
import { Close } from '@radix-ui/react-dialog';

function DialogClose(props: ComponentProps<typeof Close>) {
  return <Close data-slot='dialog-close' {...props} />;
}

export default DialogClose;
