import { FileAudio } from 'lucide-react';

import type { SourceCommon, SourceNewPlaylist, SourceUpdateTracksComp, SourceUpdateTracksData, SourceExportPlaylist } from '@/shared/types/source';

import { ExportPlaylistForm } from './components/ExportPlaylistForm';
import { SetPlaylistForm } from './components/SetPlaylistForm';
import { UpdateTrackDataForm } from './components/UpdateTracksDataForm';

export const common: SourceCommon = {
  Icon: FileAudio,
  iconBgColorClass: 'bg-blue-100',
  iconTextColorClass: 'text-blue-600',
}

export const newPlaylist: SourceNewPlaylist = {
  title: 'Файл M3U',
  description: 'Загрузить из .m3u или .m3u8 файла',
  LoadForm: SetPlaylistForm
}

export const updateTracksComp: SourceUpdateTracksComp = {
  title: 'Файл M3U',
  description: 'Загрузить из .m3u или .m3u8 файла',
  LoadForm: SetPlaylistForm
}

export const exportPlaylist: SourceExportPlaylist = {
  title: 'Файл M3U',
  description: 'Скачать плейлист как M3U файл с треками, имеющими данные файлов',
  ExportForm: ExportPlaylistForm,
}

export const updateTracksData: SourceUpdateTracksData = {
  title: 'Добавить данные файлов',
  description: 'Загрузите M3U файл, и информация о путях к файлам будет добавлена к соответствующим трекам',
  MatchForm: UpdateTrackDataForm,
  resultTitle: 'Обработка M3U файла завершена',
  resultDescription: (processed, total) => `Добавлена информация о файлах для ${processed} из ${total} треков`,
}
