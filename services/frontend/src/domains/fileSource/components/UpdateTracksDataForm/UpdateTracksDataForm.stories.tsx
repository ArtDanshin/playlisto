import UpdateTracksDataForm from './UpdateTracksDataForm';

export default {
  title: 'Domains/Sources/File/UpdateTracksDataForm',
  component: UpdateTracksDataForm,
};

// Форма загрузки файла для нового плейлиста
export const Default = {
  render: () => {
    return <UpdateTracksDataForm tracks={[]} updateTracks={console.log} />;
  },
};
