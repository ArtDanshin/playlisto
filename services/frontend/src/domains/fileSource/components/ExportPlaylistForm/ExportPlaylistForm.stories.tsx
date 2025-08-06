import ExportPlaylistForm from './ExportPlaylistForm';

export default {
  title: 'Domains/Sources/File/ExportPlaylistForm',
  component: ExportPlaylistForm,
};

// Форма загрузки файла для нового плейлиста
export const Default = {
  render: () => (
    <ExportPlaylistForm
      playlist={{
        name: '',
        order: 0,
        tracks: [],
      }}
      onSuccessExport={console.log}
    />
  ),
};
