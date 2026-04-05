const SCRIPT_SRC = 'https://open.spotify.com/embed/iframe-api/v1';

let cachedApi = null;
let loadPromise = null;

/**
 * Resolves to Spotify IFrameAPI (singleton). Safe for concurrent callers.
 */
export function loadSpotifyIframeApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Spotify iFrame API is browser-only'));
  }
  if (cachedApi) return Promise.resolve(cachedApi);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const finish = (IFrameAPI) => {
      cachedApi = IFrameAPI;
      resolve(IFrameAPI);
    };

    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (typeof previous === 'function') {
        try {
          previous(IFrameAPI);
        } catch {
          /* ignore third-party errors */
        }
      }
      finish(IFrameAPI);
    };

    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onerror = () => {
        loadPromise = null;
        reject(new Error('Failed to load Spotify iFrame API'));
      };
      document.body.appendChild(script);
    }
  });

  return loadPromise;
}
