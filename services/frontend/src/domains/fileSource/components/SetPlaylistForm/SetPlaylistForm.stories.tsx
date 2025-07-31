import SetPlaylistForm from './SetPlaylistForm';

export default {
  title: 'Domains/Sources/File/SetPlaylistForm',
  component: SetPlaylistForm,
};

// Форма загрузки файла для нового плейлиста
export const Default = {
  render: () => {
    return <SetPlaylistForm setPlaylist={console.log} />;
  },
};
