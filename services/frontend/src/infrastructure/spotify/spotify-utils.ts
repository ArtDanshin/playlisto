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
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
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
  const hash = window.location.hash.substring(1);
  return new URLSearchParams(hash);
}
