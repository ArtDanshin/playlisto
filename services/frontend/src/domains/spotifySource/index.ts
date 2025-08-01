import { Music } from 'lucide-react';

import type { SourceCommon, SourceNewPlaylist, SourceUpdateTracksComp, SourceUpdateTracksData } from '@/shared/types/source';

import { SetPlaylistForm } from './components/SetPlaylistForm';
import { UpdateTrackDataForm } from './components/UpdateTracksDataForm';

export const common: SourceCommon = {
  Icon: Music,
  iconBgColorClass: 'bg-green-100',
  iconTextColorClass: 'text-green-600',
}

export const newPlaylist: SourceNewPlaylist = {
  title: 'Spotify',
  description: 'Импортировать по ссылке на плейлист',
  LoadForm: SetPlaylistForm,
}

export const updateTracksComp: SourceUpdateTracksComp = {
  title: 'Spotify',
  description: 'Импортировать по ссылке на плейлист',
  LoadForm: SetPlaylistForm,
}

export const updateTracksData: SourceUpdateTracksData = {
  title: 'Распознать в Spotify',
  description: 'Треки будут найдены по артисту и названию. Если найдено точное совпадение, трек будет связан со Spotify',
  MatchForm: UpdateTrackDataForm,
  resultTitle: '',
  resultDescription: (processed, total) => `Распознано ${processed} из ${total} треков в Spotify`
}
