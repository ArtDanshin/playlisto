import type { ComponentProps } from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/shared/utils/utils';

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-separator'
      role='presentation'
      aria-hidden='true'
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

export default BreadcrumbSeparator;
