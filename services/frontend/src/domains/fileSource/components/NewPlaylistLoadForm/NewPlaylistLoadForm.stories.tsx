import NewPlaylistLoadForm from './NewPlaylistLoadForm';

export default {
  title: 'Domains/Sources/File',
  component: NewPlaylistLoadForm,
};

// Форма загрузки файла для нового плейлиста
export const Default = {
  render: () => {
    return <NewPlaylistLoadForm setPlaylist={console.log} />;
  },
};
