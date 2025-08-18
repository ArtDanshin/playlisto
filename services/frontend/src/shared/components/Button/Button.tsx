'use client';

import type { ComponentProps, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button as ButtonBase } from '@/shared/components/ui/Button';

interface ButtonProps extends Omit<ComponentProps<typeof ButtonBase>, 'onClick'> {
  to?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

function Button({ to, onClick, ...props }: ButtonProps) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (to) {
      navigate(to);
    }
    onClick?.(event);
  };

  return <ButtonBase onClick={handleClick} {...props} />;
}

export default Button;
