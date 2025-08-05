import { type Meta } from '@storybook/react-vite';

import { SpotifyProvider } from '@/domains/spotifySource/store';

import EditTrackForm from './EditTrackForm';

const MetaInfo: Meta<typeof EditTrackForm> = {
  title: 'Domains/Sources/Spotify/EditTrackForm',
  component: EditTrackForm,
  decorators: [
    (Story) => (
      <SpotifyProvider>
        <Story />
      </SpotifyProvider>
    )
  ],
};

export default MetaInfo;

export const Default = {
  render: () => {
    return (
      <EditTrackForm
        track={{
          title: 'CoolTrack',
          artist: 'Meloman',
          album: '',
          coverKey: '',
          duration: 0,
          position: 0,
        }}
        onDataChange={console.log} 
      />
    );
  },
};
