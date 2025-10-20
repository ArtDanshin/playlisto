'use client';

import type { ComponentProps, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Button as ButtonBase } from '@/shared/components/ui/Button';

interface ButtonProps extends Omit<ComponentProps<typeof ButtonBase>, 'onClick'> {
  to?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

function Button({ to, onClick, ...props }: ButtonProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (to) {
      router.push(to);
    }
    onClick?.(event);
  };

  return <ButtonBase onClick={handleClick} {...props} />;
}

export default Button;
