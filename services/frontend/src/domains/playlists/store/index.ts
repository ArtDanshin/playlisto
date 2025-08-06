import { create, type StateCreator } from 'zustand';

import type { PlaylistState } from './store';

const isTest = import.meta.env.MODE === 'test';

let store: StateCreator<PlaylistState>;

if (isTest) {
  store = (await import('./store.mock')).store;
} else {
  store = (await import('./store')).store;
}

export const usePlaylistStore = create<PlaylistState>(store);
