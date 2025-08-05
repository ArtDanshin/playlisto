import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/shared/utils/system';

type BreadcrumbLinkProps = ComponentProps<'a'> & {
  asChild?: boolean;
};

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot='breadcrumb-link'
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
}

export default BreadcrumbLink;
