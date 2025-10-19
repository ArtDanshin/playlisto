import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Track } from '@/shared/types/playlist';
import { Button } from '@/shared/components/ui/Button';

import TrackDeleteDialog from './TrackDeleteDialog';

const meta: Meta<typeof TrackDeleteDialog> = {
  title: 'Domains/Playlists/TrackDeleteDialog',
  component: TrackDeleteDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    track: {
      description: 'Трек для удаления',
    },
    onConfirm: {
      description: 'Обработчик подтверждения удаления',
      action: 'confirmed',
    },
    children: {
      description: 'Элемент, который будет триггером для открытия диалога',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackDeleteDialog>;

// Создаем mock трек для stories
const mockTrack: Track = {
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  duration: 355000, // 5:55 в миллисекундах
  position: 1,
  coverKey: 'cover-key-1',
};

// Story с иконкой корзины
export const Default: Story = {
  args: {
    track: mockTrack,
    onConfirm: () => console.log('Track deleted'),
  },
  render: (args) => (
    <TrackDeleteDialog {...args}>
      <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'>
        🗑️
      </Button>
    </TrackDeleteDialog>
  ),
};
