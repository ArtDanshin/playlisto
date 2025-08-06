import type { SpotifyService } from './types';

const isTest = import.meta.env.MODE === 'test';

let service: SpotifyService;

if (isTest) {
  service = new (await import('./service.mock')).service();
} else {
  service = new (await import('./service')).service();
}

export const spotifyService = service;

export * from './types';
