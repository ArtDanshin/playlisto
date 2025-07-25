const isTest = import.meta.env.MODE === 'test';

import { create, type StateCreator } from 'zustand';

import type { SpotifyState } from './store';

let store: StateCreator<SpotifyState>;

if (isTest) {
  store = (await import('./store.mock')).store;
} else {
  store = (await import('./store')).store;
}

export const useSpotifyStore = create<SpotifyState>(store);

export { default as SpotifyProvider } from './provider';
