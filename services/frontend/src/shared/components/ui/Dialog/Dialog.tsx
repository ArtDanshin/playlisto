'use client';

import type { ComponentProps } from 'react';
import { Root } from '@radix-ui/react-dialog';

function Dialog(props: ComponentProps<typeof Root>) {
  return <Root data-slot='dialog' {...props} />;
}

export default Dialog;
