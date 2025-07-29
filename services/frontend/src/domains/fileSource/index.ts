import { FileAudio } from 'lucide-react';

import type { SourceCommon, SourceNewPlaylist, SourceUpdateTracksData } from '@/shared/types/source';

import { NewPlaylistLoadForm } from './components/NewPlaylistLoadForm';

export const common: SourceCommon = {
  Icon: FileAudio,
}

export const newPlaylist: SourceNewPlaylist = {
  title: 'Файл M3U',
  description: 'Загрузить из .m3u или .m3u8 файла',
  LoadForm: NewPlaylistLoadForm
}

export const updateTracksData: SourceUpdateTracksData = {
  title: 'Добавить данные файлов',
  description: 'Загрузить M3U файл и добавить информацию о путях к файлам',
  logicDescription: 'Загрузите M3U файл, и информация о путях к файлам будет добавлена к соответствующим трекам.',
}
