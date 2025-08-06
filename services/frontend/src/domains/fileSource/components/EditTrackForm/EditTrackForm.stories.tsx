import EditTrackForm from './EditTrackForm';

export default {
  title: 'Domains/Sources/File/EditTrackForm',
  component: EditTrackForm,
};

export const Default = {
  render: () => (
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
  ),
};
