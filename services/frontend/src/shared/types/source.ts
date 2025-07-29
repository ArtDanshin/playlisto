import type { ElementType, ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

import type { Playlist, Track } from './playlist';

export interface SourceCommon {
  Icon: LucideIcon | ElementType;
}

export interface SourceNewPlaylist {
  title: string;
  description: string;
  LoadForm: LoadForm;
}

export interface SourceUpdateTracksData {
  title: string;
  description: string;
  logicDescription: string;
  MatchForm: MatchForm;
  resultTitle: string;
  resultDescription: (processed: number, total: number) => string
}

export type LoadForm = ({
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

export type UpdateTracksAfterMatch = (allTracks: Track[], onlyUpdatedTracks: Track[], notUpdatedTracks: Track[]) => void;
