// PKCE utilities for Spotify OAuth
export function generateCodeVerifier(length: number = 128): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll('=', '')
    .replaceAll('+', '-')
    .replaceAll('/', '_');
}

// Token utilities
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

export function getTokenExpiryTime(expiresIn: number): number {
  return Date.now() + (expiresIn * 1000);
}

// URL utilities
export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function getHashParams(): URLSearchParams {
  const hash = window.location.hash.slice(1);
  return new URLSearchParams(hash);
}

/**
 * Извлекает ID трека из Spotify URL
 * Поддерживает форматы:
 * - https://open.spotify.com/track/6vBRAhaSk91csuuWtttPf8?si=69fee5d8fdc84e16
 * - https://open.spotify.com/track/6vBRAhaSk91csuuWtttPf8
 * - spotify:track:6vBRAhaSk91csuuWtttPf8
 */
export function extractTrackIdFromUrl(url: string): string | null {
  try {
    // Убираем пробелы
    const cleanUrl = url.trim();

    // Проверяем формат spotify:track:ID
    const spotifyUriMatch = cleanUrl.match(/^spotify:track:([a-zA-Z0-9]+)$/);
    if (spotifyUriMatch) {
      return spotifyUriMatch[1];
    }

    // Проверяем формат https://open.spotify.com/track/ID
    const webUrlMatch = cleanUrl.match(/^https?:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (webUrlMatch) {
      return webUrlMatch[1];
    }

    // Проверяем только ID (если пользователь вставил только ID)
    const idOnlyMatch = cleanUrl.match(/^([a-zA-Z0-9]{22})$/);
    if (idOnlyMatch) {
      return idOnlyMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Извлекает ID плейлиста из Spotify URL
 * Поддерживает форматы:
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 */
export function extractPlaylistId(url: string): string | null {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

/**
 * Проверяет, является ли строка валидным Spotify URL трека
 */
export function isValidSpotifyTrackUrl(url: string): boolean {
  return extractTrackIdFromUrl(url) !== null;
}

/**
 * Создает Spotify URL трека по ID
 */
export function createSpotifyTrackUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`;
}
