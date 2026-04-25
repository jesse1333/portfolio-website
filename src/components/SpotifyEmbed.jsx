import { useEffect, useMemo, useRef, useState } from 'react';
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
  eager = false,
  width = '100%',
  height = wide ? 80 : 352,
  frameBorder: _frameBorder = 0,
  allow: _allow,
  className,
  onPlaybackActiveChange,
  ...rest
}) {
  const uri = useMemo(() => linkToSpotifyUri(link), [link]);
  const normalizedHeight = typeof height === 'number' ? `${height}px` : height;
  const mountRef = useRef(null);
  const onPlaybackRef = useRef(onPlaybackActiveChange);
  const [shouldInitialize, setShouldInitialize] = useState(false);
  onPlaybackRef.current = onPlaybackActiveChange;

  const rootClass = ['spotify-embed', wide && 'spotify-embed--wide', className]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (eager) {
      setShouldInitialize(true);
      return undefined;
    }

    const mountEl = mountRef.current;
    if (!mountEl) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldInitialize(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setShouldInitialize(true);
        observer.disconnect();
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(mountEl);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!shouldInitialize) return undefined;

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
  }, [height, shouldInitialize, uri, width]);

  return (
    <div
      {...rest}
      className={rootClass}
      style={{ borderRadius: 12, overflow: 'hidden', minHeight: normalizedHeight, ...style }}
    >
      <div ref={mountRef} className="spotify-embed__mount" />
    </div>
  );
}
