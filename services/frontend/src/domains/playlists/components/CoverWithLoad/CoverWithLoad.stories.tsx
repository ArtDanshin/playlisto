import type { Meta, StoryObj } from '@storybook/react-vite';

import CoverWithLoad from './CoverWithLoad';

const meta: Meta<typeof CoverWithLoad> = {
  title: 'Domains/Playlists/CoverWithLoad',
  component: CoverWithLoad,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    status: {
      control: { type: 'select' },
      options: ['default', 'loading'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    coverKey: 'playlist_1_1234567890',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    coverKey: 'playlist_1_1234567890',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    coverKey: 'playlist_1_1234567890',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    coverKey: 'playlist_1_1234567890',
    size: 'xl',
  },
};

export const WithoutCover: Story = {
  args: {
    coverKey: undefined,
    size: 'md',
  },
};

export const LoadingStatus: Story = {
  args: {
    coverKey: undefined,
    size: 'md',
    status: 'loading',
  },
};
