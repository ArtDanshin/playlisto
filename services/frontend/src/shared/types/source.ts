import type { ElementType, ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

import type { Playlist, Track } from './playlist';

export interface SourceCommon {
  Icon: LucideIcon | ElementType;
  iconBgColorClass: string,
  iconTextColorClass: string,
}

export interface SourceNewPlaylist {
  title: string;
  description: string;
  LoadForm: SetPlaylistForm;
}

export interface SourceUpdateTracksComp {
  title: string;
  description: string;
  LoadForm: SetPlaylistForm;
}

export interface SourceExportPlaylist {
  title: string;
  description: string;
  ExportForm: ExportForm;
}

export interface SourceUpdateTracksData {
  title: string;
  description: string;
  MatchForm: MatchForm;
  resultTitle: string;
  resultDescription: (processed: number, total: number) => string
}

export type SetPlaylistForm = ({
  setPlaylist,
}: { 
  setPlaylist: (playlist: Playlist) => void 
}) => ReactNode;

export type MatchForm = ({ 
  tracks,
  updateTracks,
}: { 
  tracks: Track[],
  updateTracks: UpdateTracksAfterMatch,
}) => ReactNode;

export type ExportForm = ({ 
  playlist,
  onSuccessExport,
  onCancel,
}: { 
  playlist: Playlist,
  onSuccessExport: (mainMessage: string, secondMessage?: ReactNode) => void,
  onCancel?: () => void,
}) => ReactNode;

export type UpdateTracksAfterMatch = (allTracks: Track[], onlyUpdatedTracks: Track[], notUpdatedTracks: Track[]) => void;
