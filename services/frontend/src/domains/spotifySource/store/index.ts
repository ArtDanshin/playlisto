import { create, type StateCreator } from 'zustand';

import type { SpotifyState } from './store';

const isTest = import.meta.env.MODE === 'test';

let store: StateCreator<SpotifyState>;

if (isTest) {
  store = (await import('./store.mock')).store;
} else {
  store = (await import('./store')).store;
}

export const useSpotifyStore = create<SpotifyState>(store);

/* eslint-disable import/no-cycle */
export { default as SpotifyProvider } from './provider';
