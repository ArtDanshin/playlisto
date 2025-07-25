import type { ElementType, ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

import { type Playlist } from './playlist';

export interface SourceCommon {
  Icon: LucideIcon | ElementType;
}

export interface SourceNewPlaylist {
  title: string;
  description: string;
  LoadForm: LoadForm;
}

export type LoadForm = ({ setPlaylist }: { setPlaylist: (playlist: Playlist) => void }) => ReactNode;