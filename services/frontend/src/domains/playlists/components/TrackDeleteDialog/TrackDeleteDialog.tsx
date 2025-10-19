'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

import type { Track } from '@/shared/types/playlist';
import { Button } from '@/shared/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/Dialog';

interface TrackDeleteDialogProps {
  track: Track;
  onConfirm: () => void;
  children: ReactNode;
}

function TrackDeleteDialog({ track, onConfirm, children }: TrackDeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Удалить трек</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить трек &quot;{track.title}&quot; от {track.artist} из плейлиста?
            Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Отмена
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
          >
            <Trash2 className='h-4 w-4 mr-2' />
            Удалить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TrackDeleteDialog;
