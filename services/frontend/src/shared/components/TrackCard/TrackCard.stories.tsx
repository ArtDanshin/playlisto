import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExternalLink, Music } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';

import TrackCard from './TrackCard';

const meta: Meta<typeof TrackCard> = {
  title: 'Shared/TrackCard',
  component: TrackCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      description: 'Название трека',
    },
    artist: {
      description: 'Исполнитель',
    },
    album: {
      description: 'Альбом (опционально)',
    },
    duration: {
      description: 'Длительность в секундах (опционально)',
    },
    coverUrl: {
      description: 'URL обложки или base64 строка (опционально)',
    },
    showCover: {
      description: 'Показывать ли обложку трека',
    },
    coverSize: {
      description: 'Размер обложки',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      description: 'Вариант стилизации карточки',
      control: { type: 'select' },
      options: ['default', 'highlighted'],
    },
    onClick: {
      description: 'Обработчик клика по карточке',
      action: 'clicked',
    },
    className: {
      description: 'Дополнительные CSS классы',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TrackCard>;

// Mock данные для stories
const mockTrackData = {
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  duration: 355,
  coverUrl: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
};

const mockTrackWithoutCover = {
  title: 'Stairway to Heaven',
  artist: 'Led Zeppelin',
  album: 'Led Zeppelin IV',
  duration: 482,
};

const mockTrackLongTitle = {
  title: 'This is a Very Long Track Name That Should Be Truncated in the Display',
  artist: 'Very Long Artist Name That Might Also Be Truncated',
  album: 'Very Long Album Name That Should Also Be Truncated',
  duration: 391,
};

// Default story
export const Default: Story = {
  args: {
    ...mockTrackData,
  },
};

// Story с кнопкой действия
export const WithActionButton: Story = {
  render: (args) => (
    <TrackCard
      {...args}
      {...mockTrackData}
      actionButton={(
        <Button variant='ghost' size='sm'>
          <ExternalLink className='h-4 w-4' />
        </Button>
      )}
    />
  ),
};

// Story без обложки
export const WithoutCover: Story = {
  args: {
    ...mockTrackWithoutCover,
    showCover: true,
  },
};

// Story без длительности
export const WithoutDuration: Story = {
  args: {
    ...mockTrackData,
    duration: undefined,
  },
};

// Story с длинным названием
export const LongTitle: Story = {
  args: {
    ...mockTrackLongTitle,
  },
};

// Story с разными размерами обложки
export const CoverSizes: Story = {
  render: () => (
    <div className='space-y-4'>
      <div>
        <h3 className='text-sm font-medium mb-2'>Small (sm)</h3>
        <TrackCard {...mockTrackData} coverSize='sm' />
      </div>
      <div>
        <h3 className='text-sm font-medium mb-2'>Medium (md)</h3>
        <TrackCard {...mockTrackData} coverSize='md' />
      </div>
      <div>
        <h3 className='text-sm font-medium mb-2'>Large (lg)</h3>
        <TrackCard {...mockTrackData} coverSize='lg' />
      </div>
    </div>
  ),
};

// Story с разными вариантами стилизации
export const Variants: Story = {
  render: () => (
    <div className='space-y-4'>
      <div>
        <h3 className='text-sm font-medium mb-2'>Default</h3>
        <TrackCard {...mockTrackData} variant='default' />
      </div>
      <div>
        <h3 className='text-sm font-medium mb-2'>Muted</h3>
        <TrackCard {...mockTrackData} variant='muted' />
      </div>
      <div>
        <h3 className='text-sm font-medium mb-2'>Highlighted</h3>
        <TrackCard {...mockTrackData} variant='highlighted' />
      </div>
    </div>
  ),
};

// Story с кликабельностью
export const Clickable: Story = {
  args: {
    ...mockTrackData,
    onClick: () => console.log('Track clicked'),
  },
};

// Story с треком без альбома
export const WithoutAlbum: Story = {
  args: {
    ...mockTrackData,
    album: undefined,
  },
};

// Story с минимальной информацией
export const Minimal: Story = {
  args: {
    ...mockTrackData,
    showCover: false,
    duration: undefined,
  },
};

// Story с кастомной кнопкой действия
export const CustomActionButton: Story = {
  render: (args) => (
    <TrackCard
      {...args}
      {...mockTrackData}
      actionButton={(
        <div className='flex gap-1'>
          <Button variant='ghost' size='sm'>
            <Music className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='sm'>
            <ExternalLink className='h-4 w-4' />
          </Button>
        </div>
      )}
    />
  ),
};

// Story с base64 обложкой
export const Base64Cover: Story = {
  args: {
    ...mockTrackData,
    coverUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  },
};
