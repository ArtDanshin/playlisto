import { FileAudio } from 'lucide-react';

import type { SourceCommon, SourceNewPlaylist } from '@/shared/types/source';

import { NewPlaylistLoadForm } from './components/NewPlaylistLoadForm';

export const common: SourceCommon = {
  Icon: FileAudio,
}

export const newPlaylist: SourceNewPlaylist = {
  title: 'Файл M3U',
  description: 'Загрузить из .m3u или .m3u8 файла',
  LoadForm: NewPlaylistLoadForm
}
