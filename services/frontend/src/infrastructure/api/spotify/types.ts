export interface SpotifyTrackData {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string; }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number; }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string; height: number; width: number; }>;
}

export interface SpotifyAuthStatus {
  isAuthenticated: boolean;
  user: SpotifyUser | null;
  expiresAt: number | null;
}

export interface SpotifySearchResponse {
  tracks: {
    href: string;
    items: SpotifyTrackData[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

export interface SpotifyPlaylistInfoResponse {
  name: string;
  owner: {
    id: string;
  }
}

export interface SpotifyPlaylistTracksResponse {
  limit: number;
  offset: number;
  total: number;
  items: {
    track: SpotifyTrackData
  }[];
}