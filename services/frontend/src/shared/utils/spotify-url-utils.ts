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
