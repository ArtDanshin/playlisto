import type { ComponentProps } from 'react';
import { MoreHorizontal } from 'lucide-react';

import { cn } from '@/shared/utils/utils';

function BreadcrumbEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-ellipsis'
      role='presentation'
      aria-hidden='true'
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className='size-4' />
      <span className='sr-only'>More</span>
    </span>
  );
}

export default BreadcrumbEllipsis;
