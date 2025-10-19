import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Track } from '@/shared/types/playlist';

import PlaylistComparison from './PlaylistComparison';

const meta: Meta<typeof PlaylistComparison> = {
  title: 'Shared/PlaylistComparison',
  component: PlaylistComparison,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    addTracks: {
      description: 'Список треков для добавления',
    },
    missingTracks: {
      description: 'Список треков для удаления',
    },
    commonTracks: {
      description: 'Список общих треков',
    },
    hasOrderDifference: {
      description: 'Есть ли различия в порядке треков',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlaylistComparison>;

// Mock треки для stories
const mockTracks: Track[] = [
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    duration: 355,
    position: 1,
    coverKey: 'cover-1',
  },
  {
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    duration: 482,
    position: 2,
    coverKey: 'cover-2',
  },
  {
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    duration: 391,
    position: 3,
    coverKey: 'cover-3',
  },
  {
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    album: 'Appetite for Destruction',
    duration: 356,
    position: 4,
    coverKey: 'cover-4',
  },
];

// Story с изменениями
export const WithChanges: Story = {
  args: {
    addTracks: mockTracks.slice(0, 2),
    missingTracks: mockTracks.slice(2, 4),
    commonTracks: mockTracks.slice(0, 2),
    hasOrderDifference: true,
  },
};

// Story без изменений
export const NoChanges: Story = {
  args: {
    addTracks: [],
    missingTracks: [],
    commonTracks: mockTracks,
    hasOrderDifference: false,
  },
};

// Story только с добавлением треков
export const OnlyAdditions: Story = {
  args: {
    addTracks: mockTracks,
    missingTracks: [],
    commonTracks: [],
    hasOrderDifference: false,
  },
};

// Story только с удалением треков
export const OnlyRemovals: Story = {
  args: {
    addTracks: [],
    missingTracks: mockTracks,
    commonTracks: [],
    hasOrderDifference: false,
  },
};

// Story с большим количеством треков
export const ManyTracks: Story = {
  args: {
    addTracks: Array.from({ length: 10 }, (_, i) => ({
      ...mockTracks[0],
      title: `New Track ${i + 1}`,
      artist: `Artist ${i + 1}`,
      position: i + 1,
    })),
    missingTracks: Array.from({ length: 5 }, (_, i) => ({
      ...mockTracks[1],
      title: `Old Track ${i + 1}`,
      artist: `Old Artist ${i + 1}`,
      position: i + 1,
    })),
    commonTracks: Array.from({ length: 15 }, (_, i) => ({
      ...mockTracks[2],
      title: `Common Track ${i + 1}`,
      artist: `Common Artist ${i + 1}`,
      position: i + 1,
    })),
    hasOrderDifference: true,
  },
};

// Story без детальной информации
export const SummaryOnly: Story = {
  args: {
    addTracks: mockTracks.slice(0, 2),
    missingTracks: mockTracks.slice(2, 4),
    commonTracks: mockTracks.slice(0, 2),
    hasOrderDifference: true,
  },
};

// Story с треками без альбома
export const TracksWithoutAlbum: Story = {
  args: {
    addTracks: [
      {
        ...mockTracks[0],
        album: '',
      },
      {
        ...mockTracks[1],
        album: '',
      },
    ],
    missingTracks: [
      {
        ...mockTracks[2],
        album: '',
      },
    ],
    commonTracks: [
      {
        ...mockTracks[3],
        album: '',
      },
    ],
    hasOrderDifference: false,
  },
};

// Story с длинными названиями
export const LongTrackNames: Story = {
  args: {
    addTracks: [
      {
        ...mockTracks[0],
        title: 'This is a Very Long Track Name That Should Be Truncated in the Display',
        artist: 'Very Long Artist Name That Might Also Be Truncated',
        album: 'Very Long Album Name That Should Also Be Truncated',
      },
    ],
    missingTracks: [
      {
        ...mockTracks[1],
        title: 'Another Very Long Track Name for Testing Truncation',
        artist: 'Another Very Long Artist Name for Testing',
        album: 'Another Very Long Album Name for Testing',
      },
    ],
    commonTracks: [
      {
        ...mockTracks[2],
        title: 'Common Track with Very Long Name',
        artist: 'Common Artist with Long Name',
        album: 'Common Album with Long Name',
      },
    ],
    hasOrderDifference: true,
  },
};

// Story с различиями в порядке
export const OrderDifferences: Story = {
  args: {
    addTracks: [],
    missingTracks: [],
    commonTracks: mockTracks,
    hasOrderDifference: true,
  },
};
