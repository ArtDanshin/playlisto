// Spotify API Configuration

export const SPOTIFY_CONFIG = {
  // Redirect URI должен быть зарегистрирован в Spotify Developer Dashboard
  REDIRECT_URI: window.location.origin,

  // Scopes для доступа к данным пользователя
  SCOPES: [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'ugc-image-upload',
  ].join(' '),

  // Spotify API endpoints
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  API_BASE_URL: 'https://api.spotify.com/v1',
};

// Local storage keys
export const SPOTIFY_STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  TOKEN_EXPIRES_AT: 'spotify_token_expires_at',
  CODE_VERIFIER: 'spotify_code_verifier',
  USER_PROFILE: 'spotify_user_profile',
  CLIENT_ID: 'spotify_client_id',
};
