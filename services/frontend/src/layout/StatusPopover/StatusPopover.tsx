'use client';

import { useState } from 'react';
import { User, Settings, Info } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/Popover';
import { Separator } from '@/shared/components/ui/Separator';
import { AuthStatus as SpotifyAuthStatus } from '@/domains/spotifySource/components/AuthStatus';

function StatusPopover() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 data-[state=open]:bg-accent'
          title='Информация о пользователе и приложении'
        >
          <User className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-96 p-4'
        align='end'
      >
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4' />
            <span className='font-medium'>Информация о приложении</span>
          </div>

          <Separator />

          <SpotifyAuthStatus />

          <Separator />

          <Separator />

          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Info className='h-3 w-3' />
            <span>Playlisto v1.0.0</span>
          </div>

          <Button
            variant='outline'
            size='sm'
            to='/settings'
            onClick={() => setIsOpen(false)}
            className='w-full'
          >
            <Settings className='mr-2 h-3 w-3' />
            Настройки
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default StatusPopover;
