import type { PlaylistoDBService } from './types';

const isTest = import.meta.env.MODE === 'test';

let service: PlaylistoDBService;

if (isTest) {
  service = new (await import('./service.mock')).service();
} else {
  service = new (await import('./service')).service();
}

export const playlistoDBService = service;

export * from './types';
