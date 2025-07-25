import { Music } from 'lucide-react';

import type { SourceCommon, SourceNewPlaylist } from '@/shared/types/source';

import { NewPlaylistLoadForm } from './components/NewPlaylistLoadForm';

export const common: SourceCommon = {
  Icon: Music,
}

export const newPlaylist: SourceNewPlaylist = {
  title: 'Spotify',
  description: 'Импортировать по ссылке на плейлист',
  LoadForm: NewPlaylistLoadForm
}
