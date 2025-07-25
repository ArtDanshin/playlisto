'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { useSpotifyStore } from './index';

interface ProvidersProps {
  children: ReactNode;
}

function SpotifyProvider({ children }: ProvidersProps) {
  const { initializeSpotify, handleSpotifyCallback } = useSpotifyStore();

  // Инициализация при загрузке компонента
  useEffect(() => {
    initializeSpotify();
  }, [initializeSpotify]);

  // Обработка callback от Spotify при загрузке страницы
  useEffect(() => {
    handleSpotifyCallback();
  }, [handleSpotifyCallback]);

  return children;
}

export default SpotifyProvider;