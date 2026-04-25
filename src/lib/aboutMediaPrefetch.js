import { loadSpotifyIframeApi } from './spotifyIframeApi.js';
import { allAboutImageUrls } from './aboutImageAssets.js';

let started = false;

/**
 * Kicks off loading for About “heavy” media as soon as the app mounts:
 * Spotify iFrame API script, gallery JS chunks, and all photography + memory images.
 * Safe to call multiple times; runs once per page load.
 */
export function startAboutMediaPrefetch() {
  if (typeof window === 'undefined' || started) return;
  started = true;

  void loadSpotifyIframeApi().catch(() => {});

  void import('../components/AboutPhotoGallery.jsx');
  void import('../components/MemoriesPhotoGallery.jsx');

  for (const url of allAboutImageUrls()) {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}
