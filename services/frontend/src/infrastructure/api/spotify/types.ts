export interface SpotifyTrackDataResponse {
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

export interface SpotifyUserResponse {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string; height: number; width: number; }>;
}

export interface SpotifyAuthStatusResponse {
  isAuthenticated: boolean;
  user: SpotifyUserResponse | null;
  expiresAt: number | null;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrackDataResponse[];
    limit: number;
    offset: number;
    total: number;
  };
}

export interface SpotifyPlaylistInfoResponse {
  name: string;
  id: string;
  owner: {
    id: string;
  };
}

export interface SpotifyPlaylistTracksResponse {
  limit: number;
  offset: number;
  total: number;
  items: {
    track: SpotifyTrackDataResponse;
  }[];
}
