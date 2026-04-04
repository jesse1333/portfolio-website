/** Spotify embed iframe — matches open.spotify.com oEmbed (permissions, URL, sizing). */
export default function SpotifyEmbed({
  link,
  style = {},
  wide = false,
  width = '100%',
  height = wide ? 80 : 352,
  frameBorder = 0,
  allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
  className,
  ...rest
}) {
  const parsed = new URL(link);
  const path = parsed.pathname.replace(/\/intl-\w+\//, '/');
  const embed = new URL(`https://open.spotify.com/embed${path}`);
  parsed.searchParams.forEach((value, key) => embed.searchParams.set(key, value));
  if (!embed.searchParams.has('utm_source')) {
    embed.searchParams.set('utm_source', 'oembed');
  }

  const rootClass = ['spotify-embed', wide && 'spotify-embed--wide', className]
    .filter(Boolean)
    .join(' ');

  return (
    <iframe
      {...rest}
      title="Spotify Web Player"
      src={embed.toString()}
      width={width}
      height={height}
      frameBorder={frameBorder}
      allow={allow}
      allowFullScreen
      loading="lazy"
      className={rootClass}
      style={{ borderRadius: 12, ...style }}
    />
  );
}
