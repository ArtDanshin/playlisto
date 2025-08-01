'use client';

import type { ElementType } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface CardHorizontalProps {
  title: string;
  description: string;
  Icon?: LucideIcon | ElementType;
  iconBgColorClass?: string;
  iconTextColorClass?: string;
  onClick?: () => void;
};

function CardHorizontal({
  title, description, Icon, iconBgColorClass: IconBgColorClass, iconTextColorClass: IconTextColorClass, onClick
}: CardHorizontalProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'
    >
      {
        Icon ? (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${IconBgColorClass || 'bg-gray-100'}`}>
            <Icon className={`h-6 w-6 ${IconTextColorClass || 'text-gray-600'}`} />
          </div>
        ) : null
      }
      <div className='flex-1 text-left'>
        <h4 className='font-medium'>{title}</h4>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </button>
  );
}

export default CardHorizontal;
