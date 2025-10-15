import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/shared/components/ui/Button';

import EditMainInfoDialog from './EditMainInfoDialog';

const meta: Meta<typeof EditMainInfoDialog> = {
  title: 'Domains/Playlists/EditMainInfoDialog',
  component: EditMainInfoDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPlaylist = {
  id: 1,
  name: 'Мой плейлист',
  order: 0,
  tracks: [],
  description: 'Описание моего плейлиста',
  coverKey: 'playlist_1_1234567890',
  spotifyData: {
    id: 'spotify_playlist_id',
    name: 'Мой плейлист',
    description: 'Описание моего плейлиста',
    coverUrl: 'https://example.com/cover.jpg',
    owner: 'user123',
    public: false,
    tracksCount: 10,
  },
};

export const Default: Story = {
  args: {
    playlist: mockPlaylist,
    children: <Button>Редактировать плейлист</Button>,
  },
};

export const WithoutCover: Story = {
  args: {
    playlist: {
      ...mockPlaylist,
      coverKey: undefined,
    },
    children: <Button>Редактировать плейлист</Button>,
  },
};

export const WithoutDescription: Story = {
  args: {
    playlist: {
      ...mockPlaylist,
      description: undefined,
    },
    children: <Button>Редактировать плейлист</Button>,
  },
};
