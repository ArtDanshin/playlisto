'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { useSpotifyStore } from '@/domains/spotifySource/store';
import { usePlaylistStore } from '@/domains/playlists/store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { initializeSpotify, handleSpotifyCallback } = useSpotifyStore();
  const { loadPlaylists } = usePlaylistStore();

  // Инициализация при загрузке компонента
  useEffect(() => {
    initializeSpotify();
    loadPlaylists();
  }, [initializeSpotify, loadPlaylists]);

  // Обработка callback от Spotify при загрузке страницы
  useEffect(() => {
    handleSpotifyCallback();
  }, [handleSpotifyCallback]);

  return children;
}
