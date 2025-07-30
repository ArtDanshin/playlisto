const isTest = import.meta.env.MODE === 'test';

import type { FileService } from './types';

let service: FileService;

if (isTest) {
  service = new (await import('./service.mock')).service();
} else {
  service = new (await import('./service')).service();
}

export const fileService = service;

export * from './types';
