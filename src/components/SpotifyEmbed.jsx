import { useEffect, useMemo, useRef } from 'react';
import { loadSpotifyIframeApi } from '../lib/spotifyIframeApi.js';

function linkToSpotifyUri(link) {
  const parsed = new URL(link);
  const path = parsed.pathname.replace(/\/intl-\w+\//, '/');
  const segments = path.split('/').filter(Boolean);
  if (segments.length < 2) {
    throw new Error(`Invalid Spotify link: ${link}`);
  }
  const [kind, id] = segments;
  return `spotify:${kind}:${id}`;
}

/** Spotify embed via iFrame API — matches open.spotify.com embed (URI, sizing); enables playback listeners. */
export default function SpotifyEmbed({
  link,
  style = {},
  wide = false,
  width = '100%',
  height = wide ? 80 : 352,
  frameBorder: _frameBorder = 0,
  allow: _allow,
  className,
  onPlaybackActiveChange,
  ...rest
}) {
  const uri = useMemo(() => linkToSpotifyUri(link), [link]);
  const mountRef = useRef(null);
  const onPlaybackRef = useRef(onPlaybackActiveChange);
  onPlaybackRef.current = onPlaybackActiveChange;

  const rootClass = ['spotify-embed', wide && 'spotify-embed--wide', className]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return undefined;

    let cancelled = false;
    let controller;

    loadSpotifyIframeApi()
      .then((IFrameAPI) => {
        if (cancelled || !mountRef.current) return;
        IFrameAPI.createController(
          mountRef.current,
          {
            uri,
            width,
            height: typeof height === 'number' ? String(height) : height,
          },
          (EmbedController) => {
            if (cancelled) {
              EmbedController.destroy();
              return;
            }
            controller = EmbedController;
            const onPlaybackUpdate = (e) => {
              const d = e?.data;
              const playing = Boolean(d?.playingURI) && d.isPaused === false;
              onPlaybackRef.current?.(playing);
            };
            EmbedController.addListener('playback_update', onPlaybackUpdate);
          }
        );
      })
      .catch(() => {
        onPlaybackRef.current?.(false);
      });

    return () => {
      cancelled = true;
      controller?.destroy();
      onPlaybackRef.current?.(false);
    };
  }, [uri, width, height]);

  return (
    <div
      {...rest}
      className={rootClass}
      style={{ borderRadius: 12, overflow: 'hidden', ...style }}
    >
      <div ref={mountRef} className="spotify-embed__mount" />
    </div>
  );
}
